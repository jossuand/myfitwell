import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface GenerateShoppingListRequest {
  userId: string;
  days?: number;
}

export async function POST(request: NextRequest) {
  try {
    console.log("API: Iniciando geração de lista de compras");

    const supabase = await createClient();
    const { userId, days = 7 }: GenerateShoppingListRequest = await request.json();

    console.log("API: Recebido userId:", userId, "days:", days);

    if (!userId) {
      console.log("API: userId não fornecido");
      return NextResponse.json(
        { error: "ID do usuário é obrigatório" },
        { status: 400 }
      );
    }

    // Primeiro, verificar se as tabelas existem fazendo queries simples
    console.log("API: Verificando existência das tabelas...");

    try {
      await supabase.from("diets").select("count").limit(1);
      console.log("API: Tabela diets existe");
    } catch (tableError) {
      console.error("API: Tabela diets não existe ou inacessível:", tableError);
      return NextResponse.json(
        { error: "Tabela diets não existe no banco de dados. Execute as migrations primeiro." },
        { status: 500 }
      );
    }

    try {
      await supabase.from("meals").select("count").limit(1);
      console.log("API: Tabela meals existe");
    } catch (tableError) {
      console.error("API: Tabela meals não existe ou inacessível:", tableError);
      return NextResponse.json(
        { error: "Tabela meals não existe no banco de dados. Execute as migrations primeiro." },
        { status: 500 }
      );
    }

    try {
      await supabase.from("shopping_lists").select("count").limit(1);
      console.log("API: Tabela shopping_lists existe");
    } catch (tableError) {
      console.error("API: Tabela shopping_lists não existe ou inacessível:", tableError);
      return NextResponse.json(
        { error: "Tabela shopping_lists não existe no banco de dados. Execute as migrations primeiro." },
        { status: 500 }
      );
    }

    try {
      await supabase.from("shopping_list_items").select("count").limit(1);
      console.log("API: Tabela shopping_list_items existe");
    } catch (tableError) {
      console.error("API: Tabela shopping_list_items não existe ou inacessível:", tableError);
      return NextResponse.json(
        { error: "Tabela shopping_list_items não existe no banco de dados. Execute as migrations primeiro." },
        { status: 500 }
      );
    }

    // Verificar se o usuário tem uma dieta ativa
    console.log("API: Buscando dieta ativa para userId:", userId);
    const { data: activeDiet, error: dietError } = await supabase
      .from("diets")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();

    console.log("API: Resultado da busca por dieta ativa:", { activeDiet: !!activeDiet, dietError });

    if (dietError) {
      console.log("API: Erro ao buscar dieta:", dietError);
      // Se for "PGRST116" significa que não encontrou registros, o que é esperado
      if (dietError.code === "PGRST116") {
        return NextResponse.json(
          { error: "Nenhuma dieta ativa encontrada. Crie uma dieta primeiro." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Erro ao buscar dieta: ${dietError.message}` },
        { status: 500 }
      );
    }

    if (!activeDiet) {
      console.log("API: Nenhuma dieta ativa encontrada");
      return NextResponse.json(
        { error: "Nenhuma dieta ativa encontrada. Crie uma dieta primeiro." },
        { status: 400 }
      );
    }

    console.log("API: Dieta ativa encontrada:", activeDiet.id);

    // Primeiro, buscar apenas refeições (simplificado)
    console.log("API: Buscando refeições da dieta");
    const { data: meals, error: mealsError } = await supabase
      .from("meals")
      .select("*")
      .eq("diet_id", activeDiet.id);

    console.log("API: Refeições encontradas (simples):", meals?.length || 0, mealsError);

    if (mealsError) {
      console.error("API: Erro ao buscar refeições:", mealsError);
      return NextResponse.json(
        { error: `Erro ao buscar refeições da dieta: ${mealsError.message}` },
        { status: 500 }
      );
    }

    if (!meals || meals.length === 0) {
      console.log("API: Nenhuma refeição encontrada");
      return NextResponse.json(
        { error: "A dieta ativa não possui refeições configuradas. Adicione refeições à sua dieta primeiro." },
        { status: 400 }
      );
    }

    // Agora buscar itens das refeições separadamente
    console.log("API: Buscando itens das refeições");
    const mealIds = meals.map(m => m.id);
    const { data: dietItems, error: itemsError } = await supabase
      .from("diet_items")
      .select(`
        *,
        product_base:product_bases(id, name),
        user_product:user_products(id, custom_name),
        measurement_unit:measurement_units(id, abbreviation)
      `)
      .in("meal_id", mealIds);

    console.log("API: Itens encontrados:", dietItems?.length || 0, itemsError);

    if (itemsError) {
      console.error("API: Erro ao buscar itens:", itemsError);
      return NextResponse.json(
        { error: `Erro ao buscar itens da dieta: ${itemsError.message}` },
        { status: 500 }
      );
    }

    if (mealsError) {
      console.error("API: Erro ao buscar refeições:", mealsError);
      return NextResponse.json(
        { error: `Erro ao buscar refeições da dieta: ${mealsError.message}` },
        { status: 500 }
      );
    }

    console.log("API: Refeições encontradas:", meals?.length || 0);

    if (!meals || meals.length === 0) {
      return NextResponse.json(
        { error: "A dieta ativa não possui refeições configuradas. Adicione refeições à sua dieta primeiro." },
        { status: 400 }
      );
    }

    // Calcular necessidades totais baseadas na dieta (Dieta X dias)
    const dietDuration = days;
    console.log("API: Calculando necessidades para", dietDuration, "dias");

    const productNeeds: Record<string, {
      quantity: number;
      product: any;
      unit: any;
      productBaseId?: string;
      userProductId?: string;
    }> = {};

    // Processar cada item da dieta
    for (const item of dietItems || []) {
      const quantityNeeded = Number(item.quantity) * dietDuration;
      const productId = item.product_base_id || `user_${item.user_product_id}`;

      const productName = item.product_base?.name || item.user_product?.custom_name || "Produto";
      console.log("API: Item:", productName, "- quantidade necessária:", quantityNeeded);

      if (productNeeds[productId]) {
        productNeeds[productId].quantity += quantityNeeded;
      } else {
        productNeeds[productId] = {
          quantity: quantityNeeded,
          product: item.product_base || item.user_product,
          unit: item.measurement_unit,
          productBaseId: item.product_base_id,
          userProductId: item.user_product_id,
        };
      }
    }

    console.log("API: Produtos necessários calculados:", Object.keys(productNeeds).length);

    // Verificar se tabela inventory existe e buscar estoque atual
    console.log("API: Verificando se tabela inventory existe");
    let inventoryMap: Record<string, number> = {};

    try {
      // Primeiro verificar se tabela existe
      const { error: tableCheckError } = await supabase
        .from("inventory")
        .select("count")
        .limit(1);

      if (tableCheckError) {
        console.log("API: Tabela inventory não existe ou inacessível, assumindo estoque zero");
      } else {
        console.log("API: Tabela inventory existe, buscando dados");
        const { data: inventory, error: inventoryError } = await supabase
          .from("inventory")
          .select("*")
          .eq("user_id", userId);

        if (inventoryError) {
          console.error("API: Erro ao buscar estoque:", inventoryError);
          console.log("API: Continuando com estoque assumido como zero");
        } else if (inventory) {
          // Criar mapa de estoque simples (sem joins complexas)
          for (const item of inventory) {
            const productId = item.product_base_id || `user_${item.user_product_id}`;
            inventoryMap[productId] = Number(item.quantity || 0);
            console.log("API: Estoque de", productId, ":", inventoryMap[productId]);
          }
        }
      }
    } catch (error) {
      console.log("API: Erro ao verificar tabela inventory:", error);
      console.log("API: Continuando com estoque assumido como zero");
    }

    // Calcular itens que precisam ser comprados (necessidades - estoque)
    const shoppingListItems: Array<{
      shopping_list_id?: string;
      product_base_id?: string;
      user_product_id?: string;
      quantity: number;
      measurement_unit_id?: string;
      is_purchased: boolean;
    }> = [];

    for (const [productId, need] of Object.entries(productNeeds)) {
      const currentStock = inventoryMap[productId] || 0;
      const quantityToBuy = Math.max(0, need.quantity - currentStock);

      console.log("API: Produto", productId, "- necessário:", need.quantity, "- em estoque:", currentStock, "- comprar:", quantityToBuy);

      if (quantityToBuy > 0) {
        const item: any = {
          quantity: quantityToBuy,
          is_purchased: false,
        };

        if (need.unit?.id) {
          item.measurement_unit_id = need.unit.id;
        }

        if (productId.startsWith("user_")) {
          item.user_product_id = need.userProductId;
        } else {
          item.product_base_id = need.productBaseId;
        }

        shoppingListItems.push(item);
      }
    }

    console.log("API: Itens para comprar calculados:", shoppingListItems.length);

    if (shoppingListItems.length === 0) {
      return NextResponse.json(
        { error: "Com base na sua dieta e estoque atual, você já possui todos os produtos necessários!" },
        { status: 400 }
      );
    }

    // Criar nome da lista automática
    const listName = `Lista gerada ${new Date().toLocaleDateString("pt-BR")}`;

    // Criar a lista de compras
    console.log("API: Criando lista de compras:", listName);
    const { data: shoppingList, error: listError } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: userId,
        name: listName,
        is_completed: false,
        is_auto_generated: true,
      })
      .select()
      .single();

    if (listError) {
      console.error("API: Erro ao criar lista:", listError);
      return NextResponse.json(
        { error: `Erro ao criar lista de compras: ${listError.message}. Verifique as permissões RLS.` },
        { status: 500 }
      );
    }

    console.log("API: Lista criada com sucesso:", shoppingList.id);

    // Adicionar itens à lista
    const itemsToInsert = shoppingListItems.map(item => ({
      shopping_list_id: shoppingList.id,
      ...item,
    }));

    console.log("API: Inserindo", itemsToInsert.length, "itens na lista");
    const { error: insertItemsError } = await supabase
      .from("shopping_list_items")
      .insert(itemsToInsert);

    if (insertItemsError) {
      console.error("API: Erro ao adicionar itens:", insertItemsError);
      // Tentar remover a lista criada se houver erro
      try {
        await supabase.from("shopping_lists").delete().eq("id", shoppingList.id);
        console.log("API: Lista removida após erro");
      } catch (deleteError) {
        console.error("API: Erro ao remover lista após falha:", deleteError);
      }
      return NextResponse.json(
        { error: `Erro ao adicionar itens à lista: ${insertItemsError.message}` },
        { status: 500 }
      );
    }

    console.log("API: Lista gerada com sucesso!");
    return NextResponse.json({
      success: true,
      shoppingListId: shoppingList.id,
      itemsCount: shoppingListItems.length,
      message: `Lista gerada com sucesso! ${shoppingListItems.length} itens precisam ser comprados.`,
    });

  } catch (error) {
    console.error("API: Erro geral na geração da lista:", error);
    return NextResponse.json(
      { error: `Erro interno do servidor: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}