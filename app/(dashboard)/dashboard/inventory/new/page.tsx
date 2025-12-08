import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InventoryForm from "@/components/forms/InventoryForm";

export default async function NewInventoryItemPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: userProducts } = await supabase
    .from("user_products")
    .select(`
      *,
      product_base:product_bases(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: units } = await supabase
    .from("measurement_units")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adicionar ao Estoque</h1>
        <p className="text-muted-foreground">Selecione o produto e informe quantidade</p>
      </div>
      <InventoryForm userProducts={userProducts || []} units={units || []} />
    </div>
  );
}
