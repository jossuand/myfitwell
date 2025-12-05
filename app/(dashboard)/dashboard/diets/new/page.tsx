import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DietForm from "@/components/forms/DietForm";

export default async function NewDietPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
        <h1 className="text-3xl font-bold tracking-tight">Nova Dieta</h1>
        <p className="text-muted-foreground">
          Crie uma nova dieta personalizada
        </p>
      </div>
      <DietForm
        productBases={productBases || []}
        userProducts={userProducts || []}
      />
    </div>
  );
}

