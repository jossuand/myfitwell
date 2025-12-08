import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DietForm from "@/components/forms/DietForm";

export default async function EditDietPage(
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

  const { data: diet } = await supabase
    .from("diets")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!diet) {
    redirect("/dashboard/diets");
  }

  const { data: productBases } = await supabase
    .from("product_bases")
    .select(`
      *,
      nutritional_info(*)
    `)
    .eq("is_active", true)
    .order("name");

  const { data: userProducts } = await supabase
    .from("user_products")
    .select(`
      *,
      product_base:product_bases(*)
    `)
    .eq("user_id", user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Dieta</h1>
        <p className="text-muted-foreground">
          Atualize os dados da sua dieta
        </p>
      </div>
      <DietForm
        diet={diet}
        productBases={productBases || []}
        userProducts={userProducts || []}
      />
    </div>
  );
}

