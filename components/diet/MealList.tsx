"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UtensilsCrossed } from "lucide-react";

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

  return (
    <Accordion type="single" collapsible className="w-full">
      {meals.map((meal) => (
        <AccordionItem key={meal.id} value={meal.id}>
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              <span>{meal.name || mealTypeLabels[meal.meal_type] || meal.meal_type}</span>
              <span className="text-sm text-muted-foreground">
                ({meal.diet_items?.length || 0} itens)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {meal.diet_items && meal.diet_items.length > 0 ? (
                meal.diet_items.map((item: any) => (
                  <div key={item.id} className="flex justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">
                        {item.product_base?.name || item.user_product?.custom_name || "Produto"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.measurement_unit?.abbreviation || ""}
                      </p>
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

