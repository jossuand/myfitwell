import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log("DEBUG: Iniciando diagnóstico de shopping list");

    const supabase = await createClient();
    const { listId }: { listId: string } = await request.json();

    console.log("DEBUG: Testando com listId:", listId);

    // Teste 1: Verificar se conseguimos ler apenas a tabela shopping_lists
    console.log("DEBUG: Teste 1 - Lendo apenas shopping_lists");
    const { data: listData, error: listError } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("id", listId)
      .single();

    console.log("DEBUG: Resultado shopping_lists:", { data: listData, error: listError });

    // Teste 2: Verificar se conseguimos ler shopping_list_items
    console.log("DEBUG: Teste 2 - Lendo shopping_list_items");
    const { data: itemsData, error: itemsError } = await supabase
      .from("shopping_list_items")
      .select("*")
      .eq("shopping_list_id", listId)
      .limit(5);

    console.log("DEBUG: Resultado shopping_list_items:", { data: itemsData, error: itemsError });

    // Teste 3: Verificar join com product_bases
    console.log("DEBUG: Teste 3 - Join com product_bases");
    if (itemsData && itemsData.length > 0) {
      const { data: joinData, error: joinError } = await supabase
        .from("shopping_list_items")
        .select(`
          *,
          product_base:product_bases(*)
        `)
        .eq("shopping_list_id", listId)
        .limit(2);

      console.log("DEBUG: Resultado join product_bases:", { data: joinData, error: joinError });
    }

    // Teste 4: Verificar a query completa como usada na página
    console.log("DEBUG: Teste 4 - Query completa da página");
    const { data: fullData, error: fullError } = await supabase
      .from("shopping_lists")
      .select(`
        *,
        shopping_list_items(
          *,
          product_base:product_bases(*),
          user_product:user_products(*),
          measurement_unit:measurement_units(*)
        )
      `)
      .eq("id", listId)
      .single();

    console.log("DEBUG: Resultado query completa:", { data: fullData, error: fullError });

    return NextResponse.json({
      success: true,
      tests: {
        shopping_lists: { success: !listError, error: listError?.message, data: !!listData },
        shopping_list_items: { success: !itemsError, error: itemsError?.message, count: itemsData?.length || 0 },
        joins: { success: true, message: "Testes de join executados" },
        full_query: { success: !fullError, error: fullError?.message, data: !!fullData }
      },
      message: "Diagnóstico concluído. Verifique os logs para detalhes."
    });

  } catch (error) {
    console.error("DEBUG: Erro geral:", error);
    return NextResponse.json(
      { error: `Erro no diagnóstico: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}