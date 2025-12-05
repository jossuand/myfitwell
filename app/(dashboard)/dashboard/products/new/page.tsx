import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserProductForm from "@/components/forms/UserProductForm";

export default async function NewUserProductPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: productBases } = await supabase
    .from("product_bases")
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
        <h1 className="text-3xl font-bold tracking-tight">Novo Produto</h1>
        <p className="text-muted-foreground">
          Adicione um produto com marca e preço
        </p>
      </div>
      <UserProductForm productBases={productBases || []} units={units || []} />
    </div>
  );
}

