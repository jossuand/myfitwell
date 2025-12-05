import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // Tentar obter a sessão primeiro
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Se não tiver sessão, tentar getUser
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user) {
    console.log("No user found, redirecting to login");
    redirect("/login");
  }

  // Verificar se é admin
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("is_active", true);

  if (rolesError) {
    console.error("Error fetching roles:", rolesError);
  }

  const isAdmin = roles?.some((r) => r.role === "admin");

  if (isAdmin) {
    redirect("/dashboard/admin");
  } else {
    redirect("/dashboard/client");
  }
}

