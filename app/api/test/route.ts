import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    console.log("API TEST: Recebida requisição");

    const supabase = await createClient();
    const body = await request.json();

    console.log("API TEST: Body recebido:", body);

    // Testar apenas a conexão básica
    const { data, error } = await supabase.auth.getUser();

    console.log("API TEST: Resultado getUser:", { user: !!data.user, error });

    return NextResponse.json({
      success: true,
      message: "API está funcionando",
      received: body,
      user: data.user ? "authenticated" : "not authenticated"
    });

  } catch (error) {
    console.error("API TEST: Erro:", error);
    return NextResponse.json(
      { error: `Erro no teste: ${error instanceof Error ? error.message : 'Erro desconhecido'}` },
      { status: 500 }
    );
  }
}