import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductBaseForm from "@/components/forms/ProductBaseForm";

export default async function NewProductPage() {
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

  const { data: categories } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  const { data: units } = await supabase
    .from("measurement_units")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Produto Base</h1>
        <p className="text-muted-foreground">
          Adicione um novo produto genérico ao sistema
        </p>
      </div>
      <ProductBaseForm categories={categories || []} units={units || []} />
    </div>
  );
}

