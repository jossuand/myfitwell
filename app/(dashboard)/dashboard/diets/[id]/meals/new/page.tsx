import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MealForm from "@/components/forms/MealForm";

export default async function NewMealPage(
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nova Refeição</h1>
        <p className="text-muted-foreground">
          Defina o tipo e o nome da refeição
        </p>
      </div>
      <MealForm dietId={id} />
    </div>
  );
}

