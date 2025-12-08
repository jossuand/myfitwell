import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserProductForm from "@/components/forms/UserProductForm";

export default async function EditUserProductPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: product } = await supabase
    .from("user_products")
    .select(`
      *,
      product_base:product_bases(*)
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!product) {
    redirect("/dashboard/products");
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
        <h1 className="text-3xl font-bold tracking-tight">Editar Produto</h1>
        <p className="text-muted-foreground">Atualize os dados do seu produto</p>
      </div>
      <UserProductForm product={product} productBases={productBases || []} units={units || []} />
    </div>
  );
}
