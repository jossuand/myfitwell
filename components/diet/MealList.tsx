"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UtensilsCrossed, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Meal {
  id: string;
  meal_type: string;
  name: string | null;
  diet_items: any[];
}

interface MealListProps {
  meals: Meal[];
  dietId: string;
}

const mealTypeLabels: Record<string, string> = {
  breakfast: "Café da Manhã",
  morning_snack: "Lanche da Manhã",
  lunch: "Almoço",
  afternoon_snack: "Lanche da Tarde",
  dinner: "Jantar",
  supper: "Ceia",
  pre_workout: "Pré-Treino",
  post_workout: "Pós-Treino",
};

export default function MealList({ meals, dietId }: MealListProps) {
  if (meals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma refeição cadastrada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Adicione refeições para esta dieta
          </p>
        </CardContent>
      </Card>
    );
  }

  const computeItemCalories = (item: any) => {
    const unit = item?.measurement_unit?.abbreviation;
    const qty = typeof item?.quantity === "number" ? item.quantity : 0;
    const base = item?.product_base || item?.user_product?.product_base;
    const baseCalories = base?.nutritional_info?.calories || 0;
    const baseUnit = base?.measurement_unit?.abbreviation;
    if (baseUnit === "g") {
      const perGram = baseCalories / 100;
      const grams = unit === "g" ? qty : unit === "kg" ? qty * 1000 : 0;
      return perGram * grams;
    }
    if (baseUnit && unit && baseUnit === unit) {
      return baseCalories * qty;
    }
    return 0;
  };

  return (
    <Accordion type="multiple" defaultValue={meals.map((m) => m.id)} className="w-full">
      {meals.map((meal) => (
        <AccordionItem key={meal.id} value={meal.id}>
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              <span>{meal.name || mealTypeLabels[meal.meal_type] || meal.meal_type}</span>
              <span className="text-sm text-muted-foreground">
                ({meal.diet_items?.length || 0} itens)
              </span>
              {Array.isArray(meal.diet_items) && meal.diet_items.length > 0 && (
                <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {Math.round(
                    meal.diet_items.reduce((sum: number, it: any) => sum + computeItemCalories(it), 0)
                  )} kcal
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/dashboard/diets/${dietId}/meals/${meal.id}/items/new`}>
                    Adicionar Item
                  </Link>
                </Button>
              </div>
              {meal.diet_items && meal.diet_items.length > 0 ? (
                meal.diet_items.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between rounded border p-3">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {item.product_base?.name || item.user_product?.custom_name || item.user_product?.product_base?.name || "Produto"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.measurement_unit?.abbreviation || ""}
                        {" "}•{" "}
                        {Math.round(computeItemCalories(item))} kcal
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/dashboard/diets/${dietId}/meals/${meal.id}/items/${item.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Editar</span>
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum item nesta refeição</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
