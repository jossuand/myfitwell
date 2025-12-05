import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function TestCookiesPage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  // Tentar decodificar o cookie manualmente para debug
  const authCookie = cookieStore.get("sb-hxitcrfczbspeyczeeef-auth-token");
  let decodedCookie = null;
  if (authCookie?.value) {
    try {
      decodedCookie = JSON.parse(decodeURIComponent(authCookie.value));
    } catch (e) {
      decodedCookie = { error: "Não foi possível decodificar" };
    }
  }
  
  const supabase = await createClient();
  
  // Primeiro tentar getSession
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  
  // Depois tentar getUser
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Teste de Cookies no Servidor</h1>
      
      <div className="bg-muted p-4 rounded space-y-2">
        <h2 className="font-semibold">Sessão no Servidor:</h2>
        <p className="text-sm">
          {session ? "✅ Sessão encontrada" : "❌ Sessão não encontrada"}
        </p>
        {sessionError && (
          <p className="text-sm text-red-600">Erro na sessão: {sessionError.message}</p>
        )}
        <p className="text-sm">
          {user ? `✅ Usuário: ${user.email}` : "❌ Usuário não encontrado"}
        </p>
        {userError && (
          <p className="text-sm text-red-600">Erro no usuário: {userError.message}</p>
        )}
      </div>

      {decodedCookie && (
        <div className="bg-muted p-4 rounded">
          <h2 className="font-semibold mb-2">Cookie Decodificado (primeiros 200 chars):</h2>
          <pre className="text-xs overflow-auto max-h-96">
            {JSON.stringify(
              typeof decodedCookie === "object" && decodedCookie !== null
                ? {
                    ...decodedCookie,
                    access_token: decodedCookie.access_token
                      ? decodedCookie.access_token.substring(0, 50) + "..."
                      : null,
                  }
                : decodedCookie,
              null,
              2
            )}
          </pre>
        </div>
      )}

      <div className="bg-muted p-4 rounded">
        <h2 className="font-semibold mb-2">Total de cookies: {allCookies.length}</h2>
        <pre className="text-xs overflow-auto max-h-96">
          {JSON.stringify(
            allCookies.map((c) => ({
              name: c.name,
              hasValue: !!c.value,
              valueLength: c.value.length,
            })),
            null,
            2
          )}
        </pre>
      </div>
      
      <div className="bg-muted p-4 rounded">
        <h2 className="font-semibold mb-2">Cookies do Supabase:</h2>
        <pre className="text-xs overflow-auto max-h-96">
          {JSON.stringify(
            allCookies
              .filter((c) => c.name.includes("supabase") || c.name.includes("sb-"))
              .map((c) => ({
                name: c.name,
                hasValue: !!c.value,
                valueLength: c.value.length,
              })),
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
