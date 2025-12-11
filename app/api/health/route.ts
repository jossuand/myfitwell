import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Testar conexão básica
    const { data, error } = await supabase.from("profiles").select("count").limit(1);

    if (error) {
      return NextResponse.json(
        { status: "error", message: "Erro na conexão com Supabase", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { status: "ok", message: "API funcionando corretamente" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Erro interno", error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}