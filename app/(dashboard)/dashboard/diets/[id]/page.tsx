import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import MealList from "@/components/diet/MealList";

export default async function DietDetailPage(
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

  const { data: meals } = await supabase
    .from("meals")
    .select(`
      *,
      diet_items(
        *,
        product_base:product_bases(
          *,
          measurement_unit:measurement_units(*),
          nutritional_info(*)
        ),
        user_product:user_products(
          *,
          product_base:product_bases(
            *,
            measurement_unit:measurement_units(*),
            nutritional_info(*)
          )
        ),
        measurement_unit:measurement_units(*)
      )
    `)
    .eq("diet_id", id)
    .order("meal_order");

  const totals = (meals || []).reduce(
    (acc: { calories: number; weight_g: number }, meal: any) => {
      const items = meal?.diet_items || [];
      for (const item of items) {
        const unit = item?.measurement_unit?.abbreviation;
        const qty = typeof item?.quantity === "number" ? item.quantity : 0;
        if (unit === "g") acc.weight_g += qty;
        else if (unit === "kg") acc.weight_g += qty * 1000;

        const base = item?.product_base || item?.user_product?.product_base;
        const baseCalories = base?.nutritional_info?.calories || 0;
        const baseUnit = base?.measurement_unit?.abbreviation;
        if (baseUnit === "g") {
          const perGram = baseCalories / 100;
          const grams = unit === "g" ? qty : unit === "kg" ? qty * 1000 : 0;
          acc.calories += perGram * grams;
        } else if (baseUnit && unit && baseUnit === unit) {
          acc.calories += baseCalories * qty;
        }
      }
      return acc;
    },
    { calories: 0, weight_g: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{diet.name}</h1>
          <p className="text-muted-foreground">
            Calorias: {Math.round(totals.calories)} kcal • Peso: {Math.round(totals.weight_g)} g
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/diets/${id}/meals/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Refeição
          </Link>
        </Button>
      </div>

      <MealList meals={meals || []} dietId={id} />
    </div>
  );
}
