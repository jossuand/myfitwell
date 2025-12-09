import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DietItemForm from "@/components/forms/DietItemForm";

export default async function NewDietItemPage(
  props: { params: Promise<{ id: string; mealId: string }> }
) {
  const { id, mealId } = await props.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: diet } = await supabase
    .from("diets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!diet) {
    redirect("/dashboard/diets");
  }

  const { data: meal } = await supabase
    .from("meals")
    .select("*")
    .eq("id", mealId)
    .eq("diet_id", id)
    .single();

  if (!meal) {
    redirect(`/dashboard/diets/${id}`);
  }

  const { data: productBases } = await supabase
    .from("product_bases")
    .select("*")
    .eq("is_active", true)
    .order("name");

  const { data: userProducts } = await supabase
    .from("user_products")
    .select(`
      *,
      product_base:product_bases(*),
      user_nutritional_info:user_product_nutritional_info(
        *,
        reference_unit:measurement_units(*)
      )
    `)
    .eq("user_id", user.id);

  const { data: units } = await supabase
    .from("measurement_units")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Adicionar Item</h1>
        <p className="text-muted-foreground">
          Adicione um produto a esta refeição
        </p>
      </div>
      <DietItemForm
        dietId={id}
        mealId={mealId}
        productBases={productBases || []}
        userProducts={userProducts || []}
        units={units || []}
      />
    </div>
  );
}
