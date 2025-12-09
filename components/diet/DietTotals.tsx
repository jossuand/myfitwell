"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DietTotalsProps {
  meals: any[];
  dietId: string;
  diet?: any;
}

export default function DietTotals({ meals, dietId, diet }: DietTotalsProps) {
  const [trackingNutrients, setTrackingNutrients] = React.useState<string[]>(["calories", "carbohydrates", "protein"]);

  React.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(`diet-tracking-nutrients:${dietId}`) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTrackingNutrients(parsed);
      }
    } catch {}
  }, [dietId]);

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

  const computeItemMacro = (item: any, key: "carbohydrates" | "protein" | "total_fat") => {
    const unit = item?.measurement_unit?.abbreviation;
    const qty = typeof item?.quantity === "number" ? item.quantity : 0;
    const base = item?.product_base || item?.user_product?.product_base;
    const baseVal = base?.nutritional_info?.[key] || 0;
    const baseUnit = base?.measurement_unit?.abbreviation;
    if (baseUnit === "g") {
      const perGram = baseVal / 100;
      const grams = unit === "g" ? qty : unit === "kg" ? qty * 1000 : 0;
      return perGram * grams;
    }
    if (baseUnit && unit && baseUnit === unit) {
      return baseVal * qty;
    }
    return 0;
  };

  const computeItemNutrient = (item: any, key: string, unit: "g" | "mg" | "mcg") => {
    const qtyUnit = item?.measurement_unit?.abbreviation;
    const qty = typeof item?.quantity === "number" ? item.quantity : 0;
    const base = item?.product_base || item?.user_product?.product_base;
    const baseVal = base?.nutritional_info?.[key] || 0;
    const baseUnit = base?.measurement_unit?.abbreviation;
    if (baseUnit === "g") {
      const perGram = baseVal / 100;
      const grams = qtyUnit === "g" ? qty : qtyUnit === "kg" ? qty * 1000 : 0;
      return perGram * grams;
    }
    if (baseUnit && qtyUnit && baseUnit === qtyUnit) {
      return baseVal * qty;
    }
    return 0;
  };

  const labelMap: Record<string, string> = {
    calories: "Calorias",
    carbohydrates: "Carboidratos",
    protein: "Proteínas",
    total_fat: "Gorduras Totais",
    fiber: "Fibras",
    sugar: "Açúcares",
    sodium: "Sódio",
    calcium: "Cálcio",
    iron: "Ferro",
    magnesium: "Magnésio",
    potassium: "Potássio",
    zinc: "Zinco",
    vitamin_a: "Vitamina A",
    vitamin_b1: "Vitamina B1",
    vitamin_b2: "Vitamina B2",
    vitamin_b3: "Vitamina B3",
    vitamin_b6: "Vitamina B6",
    vitamin_b12: "Vitamina B12",
    vitamin_c: "Vitamina C",
    vitamin_d: "Vitamina D",
    vitamin_e: "Vitamina E",
    vitamin_k: "Vitamina K",
    cholesterol: "Colesterol",
  };
  const unitMap: Record<string, string> = {
    calories: "kcal",
    carbohydrates: "g",
    protein: "g",
    total_fat: "g",
    fiber: "g",
    sugar: "g",
    sodium: "mg",
    calcium: "mg",
    iron: "mg",
    magnesium: "mg",
    potassium: "mg",
    zinc: "mg",
    vitamin_a: "mcg",
    vitamin_b1: "mg",
    vitamin_b2: "mg",
    vitamin_b3: "mg",
    vitamin_b6: "mg",
    vitamin_b12: "mcg",
    vitamin_c: "mg",
    vitamin_d: "mcg",
    vitamin_e: "mg",
    vitamin_k: "mcg",
    cholesterol: "mg",
  };

  const colorMap: Record<string, string> = {
    calories: "from-orange-500 to-orange-600",
    carbohydrates: "from-blue-500 to-blue-600",
    protein: "from-emerald-500 to-emerald-600",
    total_fat: "from-fuchsia-500 to-fuchsia-600",
    fiber: "from-lime-500 to-lime-600",
    sugar: "from-pink-500 to-pink-600",
    sodium: "from-sky-500 to-sky-600",
    calcium: "from-teal-500 to-teal-600",
    iron: "from-red-500 to-red-600",
    magnesium: "from-indigo-500 to-indigo-600",
    potassium: "from-violet-500 to-violet-600",
    zinc: "from-cyan-500 to-cyan-600",
    vitamin_a: "from-amber-500 to-amber-600",
    vitamin_b1: "from-rose-500 to-rose-600",
    vitamin_b2: "from-rose-500 to-rose-600",
    vitamin_b3: "from-rose-500 to-rose-600",
    vitamin_b6: "from-rose-500 to-rose-600",
    vitamin_b12: "from-amber-500 to-amber-600",
    vitamin_c: "from-green-500 to-green-600",
    vitamin_d: "from-yellow-500 to-yellow-600",
    vitamin_e: "from-emerald-500 to-emerald-600",
    vitamin_k: "from-lime-500 to-lime-600",
    cholesterol: "from-stone-500 to-stone-600",
  };

  const computeTotalForKey = (key: string) => {
    const items = meals.flatMap((m) => m?.diet_items || []);
    const sum = items.reduce((acc: number, it: any) => {
      if (key === "calories") return acc + computeItemCalories(it);
      if (key === "carbohydrates") return acc + computeItemMacro(it, "carbohydrates");
      if (key === "protein") return acc + computeItemMacro(it, "protein");
      if (key === "total_fat") return acc + computeItemMacro(it, "total_fat");
      if (["fiber", "sugar"].includes(key)) return acc + computeItemNutrient(it, key, "g");
      if (["sodium", "calcium", "iron", "magnesium", "potassium", "zinc", "vitamin_b1", "vitamin_b2", "vitamin_b3", "vitamin_b6", "vitamin_c", "vitamin_e", "cholesterol"].includes(key)) return acc + computeItemNutrient(it, key, "mg");
      if (["vitamin_a", "vitamin_b12", "vitamin_d", "vitamin_k"].includes(key)) return acc + computeItemNutrient(it, key, "mcg");
      return acc;
    }, 0);
    const unit = unitMap[key];
    const value = key === "calories" ? Math.round(sum) : unit === "g" ? Number(sum.toFixed(2)) : Math.round(sum);
    return { value, unit };
  };

  if (!meals || meals.length === 0 || trackingNutrients.length === 0) return null;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
      {trackingNutrients.map((key) => {
        const { value, unit } = computeTotalForKey(key);
        const gradient = colorMap[key] || "from-primary to-primary";
        const targetMap: Record<string, string> = {
          calories: "target_calories",
          carbohydrates: "target_carbohydrates",
          protein: "target_protein",
          total_fat: "target_fat",
        };
        const targetKey = targetMap[key];
        const targetVal = targetKey && diet ? diet[targetKey] : null;
        const diff = targetVal != null ? Number((targetVal - value).toFixed(2)) : null;
        return (
          <Card key={key} className={`h-full min-h-[110px] overflow-hidden border-0 bg-gradient-to-br ${gradient} text-white`}>
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-medium">{labelMap[key]}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-2xl font-bold">
                {value} {unit}
              </div>
              {targetVal != null && (
                <div className="mt-1 text-xs opacity-90">
                  Meta: {unit === "kcal" ? Math.round(targetVal) : Number((targetVal as number).toFixed(2))} {unit}
                  {diff != null && (
                    <span className="ml-2">
                      {diff >= 0 ? `Falta: ${diff} ${unit}` : `Excesso: ${Math.abs(diff)} ${unit}`}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
