import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DietItemForm from "@/components/forms/DietItemForm";

export default async function EditDietItemPage(
  props: { params: Promise<{ id: string; mealId: string; itemId: string }> }
) {
  const { id, mealId, itemId } = await props.params;
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

  const { data: item } = await supabase
    .from("diet_items")
    .select("*")
    .eq("id", itemId)
    .eq("meal_id", mealId)
    .single();

  if (!item) {
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
      product_base:product_bases(*)
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
        <h1 className="text-3xl font-bold tracking-tight">Editar Item</h1>
        <p className="text-muted-foreground">Atualize o produto desta refeição</p>
      </div>
      <DietItemForm
        dietId={id}
        mealId={mealId}
        productBases={productBases || []}
        userProducts={userProducts || []}
        units={units || []}
        item={item}
      />
    </div>
  );
}
