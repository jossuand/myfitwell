import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import MealList from "@/components/diet/MealList";

export default async function DietDetailPage({
  params,
}: {
  params: { id: string };
}) {
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
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!diet) {
    redirect("/dashboard/diets");
  }

  const { data: meals } = await supabase
    .from("meals")
    .select(`
      *,
      diet_items(
        *,
        product_base:product_bases(*),
        user_product:user_products(*),
        measurement_unit:measurement_units(*)
      )
    `)
    .eq("diet_id", params.id)
    .order("meal_order");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{diet.name}</h1>
          <p className="text-muted-foreground">
            Gerencie as refeições desta dieta
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/diets/${params.id}/meals/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Refeição
          </Link>
        </Button>
      </div>

      <MealList meals={meals || []} dietId={params.id} />
    </div>
  );
}

