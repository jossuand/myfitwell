import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserManagement from "@/components/admin/UserManagement";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificar se é admin
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const isAdmin = roles?.some((r) => r.role === "admin");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select(`
      *,
      user_roles(*)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
        <p className="text-muted-foreground">
          Visualize e gerencie os usuários do sistema
        </p>
      </div>

      <UserManagement users={profiles || []} />
    </div>
  );
}

