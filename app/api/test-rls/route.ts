import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log("TEST RLS: Iniciando teste de permissões");

    const supabase = await createClient();
    const { userId }: { userId: string } = await request.json();

    console.log("TEST RLS: Testando com userId:", userId);

    // Teste 1: Verificar se podemos ler da tabela diets
    console.log("TEST RLS: Teste 1 - Lendo diets");
    const { data: dietsData, error: dietsError } = await supabase
      .from("diets")
      .select("id, user_id, name")
      .eq("user_id", userId)
      .limit(1);

    console.log("TEST RLS: Resultado diets:", { data: dietsData, error: dietsError });

    // Teste 2: Verificar se podemos inserir na tabela shopping_lists
    console.log("TEST RLS: Teste 2 - Inserindo shopping_list");
    const testListName = `Teste RLS ${Date.now()}`;
    const { data: insertData, error: insertError } = await supabase
      .from("shopping_lists")
      .insert({
        user_id: userId,
        name: testListName,
        is_completed: false,
        is_auto_generated: false,
      })
      .select()
      .single();

    console.log("TEST RLS: Resultado insert:", { data: insertData, error: insertError });

    // Se inseriu com sucesso, remover o teste
    if (insertData && !insertError) {
      console.log("TEST RLS: Removendo lista de teste");
      const { error: deleteError } = await supabase
        .from("shopping_lists")
        .delete()
        .eq("id", insertData.id);

      console.log("TEST RLS: Resultado delete:", { error: deleteError });
    }

    // Teste 3: Verificar se podemos ler meals
    console.log("TEST RLS: Teste 3 - Lendo meals");
    const { data: mealsData, error: mealsError } = await supabase
      .from("meals")
      .select("id, diet_id, name")
      .limit(1);

    console.log("TEST RLS: Resultado meals:", { data: mealsData, error: mealsError });

    return NextResponse.json({
      success: true,
      results: {
        diets: { success: !dietsError, error: dietsError?.message },
        insert: { success: !insertError, error: insertError?.message },
        meals: { success: !mealsError, error: mealsError?.message },
      },
      message: "Teste de RLS concluído. Verifique os resultados acima."
    });

  } catch (error) {
    console.error("TEST RLS: Erro geral:", error);
    return NextResponse.json(
      { error: `Erro no teste RLS: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}