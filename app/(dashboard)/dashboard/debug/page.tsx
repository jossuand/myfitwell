import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DebugPage() {
  const supabase = await createClient();
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  const { data: roles } = user
    ? await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
    : { data: null };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Debug - Informações de Autenticação</h1>

      <Card>
        <CardHeader>
          <CardTitle>Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded overflow-auto text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuário</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded overflow-auto text-sm">
            {JSON.stringify({ user, userError }, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded overflow-auto text-sm">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded overflow-auto text-sm">
            {JSON.stringify(roles, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

