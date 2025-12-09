"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UtensilsCrossed, Edit, Trash2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  const router = useRouter();
  const supabase = createClient();
  const [productBases, setProductBases] = React.useState<any[]>([]);
  const [userProducts, setUserProducts] = React.useState<any[]>([]);
  const [units, setUnits] = React.useState<any[]>([]);
  const [showFormByMeal, setShowFormByMeal] = React.useState<Record<string, boolean>>({});
  const [searchTermByMeal, setSearchTermByMeal] = React.useState<Record<string, string>>({});
  const [selectedChoiceByMeal, setSelectedChoiceByMeal] = React.useState<Record<string, { kind: "base" | "user"; id: string } | null>>({});
  const [unitIdByMeal, setUnitIdByMeal] = React.useState<Record<string, string>>({});
  const [qtyByMeal, setQtyByMeal] = React.useState<Record<string, string>>({});
  const [notesByMeal, setNotesByMeal] = React.useState<Record<string, string>>({});
  const [openDetailsByItem, setOpenDetailsByItem] = React.useState<Record<string, boolean>>({});
  const [trackingNutrients, setTrackingNutrients] = React.useState<string[]>(["calories", "carbohydrates", "protein"]);
  const [openEditByItem, setOpenEditByItem] = React.useState<Record<string, boolean>>({});
  const [editSearchTermByItem, setEditSearchTermByItem] = React.useState<Record<string, string>>({});
  const [editChoiceByItem, setEditChoiceByItem] = React.useState<Record<string, { kind: "base" | "user"; id: string } | null>>({});
  const [editUnitIdByItem, setEditUnitIdByItem] = React.useState<Record<string, string>>({});
  const [editQtyByItem, setEditQtyByItem] = React.useState<Record<string, string>>({});
  const [editNotesByItem, setEditNotesByItem] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: pb }, { data: up }, { data: un }] = await Promise.all([
        supabase.from("product_bases").select("*", { count: "exact" }).eq("is_active", true).order("name"),
        supabase
          .from("user_products")
          .select(`
            *,
            product_base:product_bases(*),
            user_nutritional_info:user_product_nutritional_info(
              *,
              reference_unit:measurement_units(*)
            )
          `)
          .eq("user_id", user.id),
        supabase.from("measurement_units").select("*", { count: "exact" }).eq("is_active", true).order("name"),
      ]);
      if (!mounted) return;
      setProductBases(pb || []);
      setUserProducts(up || []);
      setUnits(un || []);
    })();
    return () => {
      mounted = false;
    };
  }, []);
  React.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(`diet-tracking-nutrients:${dietId}`) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTrackingNutrients(parsed);
      }
    } catch {}
  }, [dietId]);
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
    const qtyUnit = item?.measurement_unit?.abbreviation;
    const qty = typeof item?.quantity === "number" ? item.quantity : 0;
    const userNI = item?.user_product?.user_nutritional_info;
    if (userNI) {
      const refQty = typeof userNI?.reference_quantity === "number" ? userNI.reference_quantity : 100;
      const refUnit = userNI?.reference_unit?.abbreviation || "g";
      const val = Number(userNI?.calories) || 0;
      if (refUnit === "g") {
        const grams = qtyUnit === "g" ? qty : qtyUnit === "kg" ? qty * 1000 : 0;
        return grams > 0 ? (val / refQty) * grams : 0;
      }
      if (refUnit && qtyUnit && refUnit === qtyUnit) {
        return (val * qty) / refQty;
      }
      return 0;
    }
    const base = item?.product_base || item?.user_product?.product_base;
    const baseCalories = Number(base?.nutritional_info?.calories) || 0;
    const baseUnit = base?.measurement_unit?.abbreviation;
    if (baseUnit === "g") {
      const perGram = baseCalories / 100;
      const grams = qtyUnit === "g" ? qty : qtyUnit === "kg" ? qty * 1000 : 0;
      return perGram * grams;
    }
    if (baseUnit && qtyUnit && baseUnit === qtyUnit) {
      return baseCalories * qty;
    }
    return 0;
  };

  const computeItemMacro = (item: any, key: "carbohydrates" | "protein" | "total_fat") => {
    const qtyUnit = item?.measurement_unit?.abbreviation;
    const qty = typeof item?.quantity === "number" ? item.quantity : 0;
    const userNI = item?.user_product?.user_nutritional_info;
    if (userNI) {
      const refQty = typeof userNI?.reference_quantity === "number" ? userNI.reference_quantity : 100;
      const refUnit = userNI?.reference_unit?.abbreviation || "g";
      const val = Number(userNI?.[key]) || 0;
      if (refUnit === "g") {
        const grams = qtyUnit === "g" ? qty : qtyUnit === "kg" ? qty * 1000 : 0;
        return grams > 0 ? (val / refQty) * grams : 0;
      }
      if (refUnit && qtyUnit && refUnit === qtyUnit) {
        return (val * qty) / refQty;
      }
      return 0;
    }
    const base = item?.product_base || item?.user_product?.product_base;
    const baseVal = Number(base?.nutritional_info?.[key]) || 0;
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

  const computeItemNutrient = (item: any, key: string, _unit: "g" | "mg" | "mcg") => {
    const qtyUnit = item?.measurement_unit?.abbreviation;
    const qty = typeof item?.quantity === "number" ? item.quantity : 0;
    const userNI = item?.user_product?.user_nutritional_info;
    if (userNI) {
      const refQty = typeof userNI?.reference_quantity === "number" ? userNI.reference_quantity : 100;
      const refUnit = userNI?.reference_unit?.abbreviation || "g";
      const val = Number(userNI?.[key]) || 0;
      if (refUnit === "g") {
        const grams = qtyUnit === "g" ? qty : qtyUnit === "kg" ? qty * 1000 : 0;
        return grams > 0 ? (val / refQty) * grams : 0;
      }
      if (refUnit && qtyUnit && refUnit === qtyUnit) {
        return (val * qty) / refQty;
      }
      return 0;
    }
    const base = item?.product_base || item?.user_product?.product_base;
    const baseVal = Number(base?.nutritional_info?.[key]) || 0;
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
              {Array.isArray(meal.diet_items) && meal.diet_items.length > 0 && trackingNutrients.length > 0 && (
                <div className="ml-2 flex gap-2">
                  {trackingNutrients.map((key) => {
                    const sum = meal.diet_items.reduce((acc: number, it: any) => {
                      if (key === "calories") return acc + computeItemCalories(it);
                      if (key === "carbohydrates") return acc + computeItemMacro(it, "carbohydrates");
                      if (key === "protein") return acc + computeItemMacro(it, "protein");
                      if (key === "total_fat") return acc + computeItemMacro(it, "total_fat");
                      if (
                        ["fiber", "sugar"].includes(key)
                      ) return acc + computeItemNutrient(it, key, "g" as any);
                      if (
                        ["sodium", "calcium", "iron", "magnesium", "potassium", "zinc", "vitamin_b1", "vitamin_b2", "vitamin_b3", "vitamin_b6", "vitamin_c", "vitamin_e", "cholesterol"].includes(key)
                      ) return acc + computeItemNutrient(it, key, "mg" as any);
                      if (
                        ["vitamin_a", "vitamin_b12", "vitamin_d", "vitamin_k"].includes(key)
                      ) return acc + computeItemNutrient(it, key, "mcg" as any);
                      return acc;
                    }, 0);
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
                    const value = key === "calories" ? Math.round(sum) : unitMap[key] === "g" ? Number(sum.toFixed(2)) : Math.round(sum);
                    return (
                      <span key={key} className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {value} {unitMap[key]} {labelMap[key]}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setShowFormByMeal((prev) => ({ ...prev, [meal.id]: !prev[meal.id] }))
                  }
                >
                  {showFormByMeal[meal.id] ? "Cancelar" : "Adicionar Item"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm("Remover esta refeição?")) return;
                    await supabase.from("diet_items").delete().eq("meal_id", meal.id);
                    await supabase.from("meals").delete().eq("id", meal.id);
                    router.refresh();
                  }}
                >
                  Remover Refeição
                </Button>
              </div>
              {meal.diet_items && meal.diet_items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left">
                        <th className="p-2">Produto</th>
                        <th className="p-2">Quantidade</th>
                        <th className="p-2">Unidade</th>
                        <th className="p-2">Calorias</th>
                        <th className="p-2">Carboidratos</th>
                        <th className="p-2">Proteínas</th>
                        <th className="p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meal.diet_items.map((item: any) => (
                        <React.Fragment key={item.id}>
                        <tr className="border-t">
                          <td className="p-2 font-medium">
                            {item.product_base?.name || item.user_product?.custom_name || item.user_product?.product_base?.name || "Produto"}
                          </td>
                          <td className="p-2">{item.quantity}</td>
                          <td className="p-2">{item.measurement_unit?.abbreviation || ""}</td>
                          <td className="p-2">{Math.round(computeItemCalories(item))} kcal</td>
                          <td className="p-2">{Number(computeItemMacro(item, "carbohydrates").toFixed(2))} g</td>
                          <td className="p-2">{Number(computeItemMacro(item, "protein").toFixed(2))} g</td>
                          <td className="p-2">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Editar"
                                aria-label="Editar"
                                onClick={() => {
                                  setOpenEditByItem((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                                  if (!openEditByItem[item.id]) {
                                    const label = item.product_base?.name || item.user_product?.custom_name || item.user_product?.product_base?.name || "";
                                    const choice = item.product_base?.id
                                      ? { kind: "base" as const, id: item.product_base.id as string }
                                      : item.user_product?.id
                                      ? { kind: "user" as const, id: item.user_product.id as string }
                                      : null;
                                    setEditSearchTermByItem((p) => ({ ...p, [item.id]: label }));
                                    setEditChoiceByItem((p) => ({ ...p, [item.id]: choice }));
                                    setEditQtyByItem((p) => ({ ...p, [item.id]: typeof item.quantity === "number" ? String(item.quantity) : "" }));
                                    setEditUnitIdByItem((p) => ({ ...p, [item.id]: item.measurement_unit?.id || "" }));
                                    setEditNotesByItem((p) => ({ ...p, [item.id]: item.preparation_notes || "" }));
                                  }
                                }}
                              className="px-1"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Excluir"
                                aria-label="Excluir"
                                onClick={async () => {
                                  if (!confirm("Remover este item?")) return;
                                  await supabase.from("diet_items").delete().eq("id", item.id);
                                  router.refresh();
                                }}
                              className="px-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Nutrientes"
                                aria-label="Nutrientes"
                                onClick={() =>
                                  setOpenDetailsByItem((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                                }
                              className="px-1"
                              >
                                <FlaskConical className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {openEditByItem[item.id] ? (
                          <tr className="border-t bg-muted/30">
                            <td className="p-2 align-top">
                              <div className="space-y-2">
                                <Input
                                  placeholder="Buscar produto..."
                                  value={editSearchTermByItem[item.id] || ""}
                                  onChange={(e) =>
                                    setEditSearchTermByItem((prev) => ({ ...prev, [item.id]: e.target.value }))
                                  }
                                />
                                {(() => {
                                  const term = (editSearchTermByItem[item.id] || "").toLowerCase();
                                  const choice = editChoiceByItem[item.id];
                                  const options = [
                                    ...productBases.map((pb) => ({
                                      kind: "base" as const,
                                      id: pb.id as string,
                                      label: pb.name as string,
                                    })),
                                    ...userProducts.map((up) => ({
                                      kind: "user" as const,
                                      id: up.id as string,
                                      label: (up.custom_name || up.product_base?.name || up.id) as string,
                                    })),
                                  ].filter((o) => o.label.toLowerCase().includes(term));
                                  return choice || term.trim().length === 0 ? null : (
                                    <div className="max-h-40 overflow-auto rounded border bg-background">
                                      {options.length > 0 ? (
                                        options.slice(0, 50).map((o) => (
                                          <button
                                            key={`${o.kind}:${o.id}`}
                                            className="flex w-full cursor-pointer items-center justify-between px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                            onClick={() => {
                                              setEditChoiceByItem((prev) => ({ ...prev, [item.id]: { kind: o.kind, id: o.id } }));
                                              setEditSearchTermByItem((prev) => ({ ...prev, [item.id]: o.label }));
                                            }}
                                          >
                                            <span>{o.label}</span>
                                          </button>
                                        ))
                                      ) : (
                                        <div className="px-2 py-1 text-sm text-muted-foreground">Nenhum resultado</div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </td>
                            <td className="p-2 align-top">
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="Qtd"
                                value={editQtyByItem[item.id] || ""}
                                onChange={(e) => setEditQtyByItem((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              />
                            </td>
                            <td className="p-2 align-top">
                              <Select
                                value={editUnitIdByItem[item.id] || ""}
                                onChange={(e) => setEditUnitIdByItem((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              >
                                <option value="">Selecione...</option>
                                {units.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    {u.abbreviation}
                                  </option>
                                ))}
                              </Select>
                            </td>
                            <td className="p-2 align-top">
                              <Input
                                placeholder="Observações"
                                value={editNotesByItem[item.id] || ""}
                                onChange={(e) => setEditNotesByItem((prev) => ({ ...prev, [item.id]: e.target.value }))}
                              />
                            </td>
                            <td className="p-2 align-top">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={async () => {
                                    const choice = editChoiceByItem[item.id];
                                    const quantity = editQtyByItem[item.id];
                                    const unitId = editUnitIdByItem[item.id];
                                    if (!choice) {
                                      alert("Selecione um produto");
                                      return;
                                    }
                                    if (!unitId) {
                                      alert("Selecione a unidade");
                                      return;
                                    }
                                    if (!quantity || isNaN(Number(quantity))) {
                                      alert("Informe a quantidade");
                                      return;
                                    }
                                    const product_base_id = choice.kind === "base" ? choice.id : null;
                                    const user_product_id = choice.kind === "user" ? choice.id : null;
                                    const { error: updateError } = await supabase
                                      .from("diet_items")
                                      .update({
                                        product_base_id,
                                        user_product_id,
                                        measurement_unit_id: unitId,
                                        quantity: parseFloat(quantity),
                                        preparation_notes: (editNotesByItem[item.id] || null) as any,
                                      })
                                      .eq("id", item.id);
                                    if (updateError) {
                                      alert(updateError.message);
                                      return;
                                    }
                                    setOpenEditByItem((prev) => ({ ...prev, [item.id]: false }));
                                    setEditChoiceByItem((prev) => ({ ...prev, [item.id]: null }));
                                    setEditQtyByItem((prev) => ({ ...prev, [item.id]: "" }));
                                    setEditUnitIdByItem((prev) => ({ ...prev, [item.id]: "" }));
                                    setEditNotesByItem((prev) => ({ ...prev, [item.id]: "" }));
                                    router.refresh();
                                  }}
                                >
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setOpenEditByItem((prev) => ({ ...prev, [item.id]: false }));
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                        {item.preparation_notes ? (
                          <tr className="bg-muted/20">
                            <td className="p-2 text-sm text-muted-foreground" colSpan={7}>
                              <span className="font-medium">Observações do preparo:</span> {item.preparation_notes}
                            </td>
                          </tr>
                        ) : null}
                        {openDetailsByItem[item.id] ? (
                          <tr className="bg-muted/20">
                            <td className="p-2" colSpan={7}>
                              <div className="grid gap-3 md:grid-cols-3">
                                <div className="text-sm"><span className="font-medium">Energia:</span> {Math.round(computeItemCalories(item))} kcal</div>
                                <div className="text-sm"><span className="font-medium">Carboidratos:</span> {Number(computeItemMacro(item, "carbohydrates").toFixed(2))} g</div>
                                <div className="text-sm"><span className="font-medium">Proteínas:</span> {Number(computeItemMacro(item, "protein").toFixed(2))} g</div>
                                <div className="text-sm"><span className="font-medium">Gorduras Totais:</span> {Number(computeItemMacro(item, "total_fat").toFixed(2))} g</div>
                                <div className="text-sm"><span className="font-medium">Fibra Alimentar:</span> {Number(computeItemNutrient(item, "fiber", "g").toFixed(2))} g</div>
                                <div className="text-sm"><span className="font-medium">Açúcares:</span> {Number(computeItemNutrient(item, "sugar", "g").toFixed(2))} g</div>
                                <div className="text-sm"><span className="font-medium">Sódio:</span> {Math.round(computeItemNutrient(item, "sodium", "mg"))} mg</div>
                                <div className="text-sm"><span className="font-medium">Cálcio:</span> {Math.round(computeItemNutrient(item, "calcium", "mg"))} mg</div>
                                <div className="text-sm"><span className="font-medium">Ferro:</span> {Math.round(computeItemNutrient(item, "iron", "mg"))} mg</div>
                                <div className="text-sm"><span className="font-medium">Magnésio:</span> {Math.round(computeItemNutrient(item, "magnesium", "mg"))} mg</div>
                                <div className="text-sm"><span className="font-medium">Potássio:</span> {Math.round(computeItemNutrient(item, "potassium", "mg"))} mg</div>
                                <div className="text-sm"><span className="font-medium">Zinco:</span> {Math.round(computeItemNutrient(item, "zinc", "mg"))} mg</div>
                                <div className="text-sm"><span className="font-medium">Vitamina A:</span> {Math.round(computeItemNutrient(item, "vitamin_a", "mcg"))} mcg</div>
                                <div className="text-sm"><span className="font-medium">Vitamina B1:</span> {Number(computeItemNutrient(item, "vitamin_b1", "mg").toFixed(2))} mg</div>
                                <div className="text-sm"><span className="font-medium">Vitamina B2:</span> {Number(computeItemNutrient(item, "vitamin_b2", "mg").toFixed(2))} mg</div>
                                <div className="text-sm"><span className="font-medium">Vitamina B3:</span> {Number(computeItemNutrient(item, "vitamin_b3", "mg").toFixed(2))} mg</div>
                                <div className="text-sm"><span className="font-medium">Vitamina B6:</span> {Number(computeItemNutrient(item, "vitamin_b6", "mg").toFixed(2))} mg</div>
                                <div className="text-sm"><span className="font-medium">Vitamina B12:</span> {Math.round(computeItemNutrient(item, "vitamin_b12", "mcg"))} mcg</div>
                                <div className="text-sm"><span className="font-medium">Vitamina C:</span> {Math.round(computeItemNutrient(item, "vitamin_c", "mg"))} mg</div>
                                <div className="text-sm"><span className="font-medium">Vitamina D:</span> {Math.round(computeItemNutrient(item, "vitamin_d", "mcg"))} mcg</div>
                                <div className="text-sm"><span className="font-medium">Vitamina E:</span> {Math.round(computeItemNutrient(item, "vitamin_e", "mg"))} mg</div>
                                <div className="text-sm"><span className="font-medium">Vitamina K:</span> {Math.round(computeItemNutrient(item, "vitamin_k", "mcg"))} mcg</div>
                                <div className="text-sm"><span className="font-medium">Colesterol:</span> {Math.round(computeItemNutrient(item, "cholesterol", "mg"))} mg</div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                        </React.Fragment>
                      ))}
                      {showFormByMeal[meal.id] && (
                        <tr className="border-t bg-muted/30">
                          <td className="p-2 align-top">
                            <div className="space-y-2">
                              <Input
                                placeholder="Buscar produto..."
                                value={searchTermByMeal[meal.id] || ""}
                                onChange={(e) =>
                                  setSearchTermByMeal((prev) => ({ ...prev, [meal.id]: e.target.value }))
                                }
                              />
                              {(() => {
                                const term = (searchTermByMeal[meal.id] || "").toLowerCase();
                                const choice = selectedChoiceByMeal[meal.id];
                                const options = [
                                  ...productBases.map((pb) => ({
                                    kind: "base" as const,
                                    id: pb.id as string,
                                    label: pb.name as string,
                                  })),
                                  ...userProducts.map((up) => ({
                                    kind: "user" as const,
                                    id: up.id as string,
                                    label: (up.custom_name || up.product_base?.name || up.id) as string,
                                  })),
                                ].filter((o) => o.label.toLowerCase().includes(term));
                                return choice || term.trim().length === 0 ? null : (
                                  <div className="max-h-40 overflow-auto rounded border bg-background">
                                    {options.length > 0 ? (
                                      options.slice(0, 50).map((o) => (
                                        <button
                                          key={`${o.kind}:${o.id}`}
                                          className="flex w-full cursor-pointer items-center justify-between px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                          onClick={() => {
                                            setSelectedChoiceByMeal((prev) => ({ ...prev, [meal.id]: { kind: o.kind, id: o.id } }));
                                            setSearchTermByMeal((prev) => ({ ...prev, [meal.id]: o.label }));
                                          }}
                                        >
                                          <span>{o.label}</span>
                                        </button>
                                      ))
                                    ) : (
                                      <div className="px-2 py-1 text-sm text-muted-foreground">Nenhum resultado</div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="p-2 align-top">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Qtd"
                              value={qtyByMeal[meal.id] || ""}
                              onChange={(e) => setQtyByMeal((prev) => ({ ...prev, [meal.id]: e.target.value }))}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <Select
                              value={unitIdByMeal[meal.id] || ""}
                              onChange={(e) => setUnitIdByMeal((prev) => ({ ...prev, [meal.id]: e.target.value }))}
                            >
                              <option value="">Selecione...</option>
                              {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.abbreviation}
                                </option>
                              ))}
                            </Select>
                          </td>
                          <td className="p-2 align-top">
                            <Input
                              placeholder="Observações"
                              value={notesByMeal[meal.id] || ""}
                              onChange={(e) => setNotesByMeal((prev) => ({ ...prev, [meal.id]: e.target.value }))}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  const choice = selectedChoiceByMeal[meal.id];
                                  const quantity = qtyByMeal[meal.id];
                                  const unitId = unitIdByMeal[meal.id];
                                  if (!choice) {
                                    alert("Selecione um produto");
                                    return;
                                  }
                                  if (!unitId) {
                                    alert("Selecione a unidade");
                                    return;
                                  }
                                  if (!quantity || isNaN(Number(quantity))) {
                                    alert("Informe a quantidade");
                                    return;
                                  }
                                  const product_base_id = choice.kind === "base" ? choice.id : null;
                                  const user_product_id = choice.kind === "user" ? choice.id : null;
                                  const { error: insertError } = await supabase
                                    .from("diet_items")
                                    .insert({
                                      meal_id: meal.id,
                                      product_base_id,
                                      user_product_id,
                                      measurement_unit_id: unitId,
                                      quantity: parseFloat(quantity),
                                      preparation_notes: (notesByMeal[meal.id] || null) as any,
                                    });
                                  if (insertError) {
                                    alert(insertError.message);
                                    return;
                                  }
                                  setShowFormByMeal((prev) => ({ ...prev, [meal.id]: false }));
                                  setSelectedChoiceByMeal((prev) => ({ ...prev, [meal.id]: null }));
                                  setQtyByMeal((prev) => ({ ...prev, [meal.id]: "" }));
                                  setUnitIdByMeal((prev) => ({ ...prev, [meal.id]: "" }));
                                  setNotesByMeal((prev) => ({ ...prev, [meal.id]: "" }));
                                  router.refresh();
                                }}
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowFormByMeal((prev) => ({ ...prev, [meal.id]: false }));
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhum item nesta refeição</p>
              )}
              {!meal.diet_items || meal.diet_items.length === 0 ? (
                showFormByMeal[meal.id] ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="p-2">Produto</th>
                          <th className="p-2">Quantidade</th>
                          <th className="p-2">Unidade</th>
                          <th className="p-2">Observações</th>
                          <th className="p-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t bg-muted/30">
                          <td className="p-2 align-top">
                            <div className="space-y-2">
                              <Input
                                placeholder="Buscar produto..."
                                value={searchTermByMeal[meal.id] || ""}
                                onChange={(e) =>
                                  setSearchTermByMeal((prev) => ({ ...prev, [meal.id]: e.target.value }))
                                }
                              />
                              {(() => {
                                const term = (searchTermByMeal[meal.id] || "").toLowerCase();
                                const choice = selectedChoiceByMeal[meal.id];
                                const options = [
                                  ...productBases.map((pb) => ({ kind: "base" as const, id: pb.id as string, label: pb.name as string })),
                                  ...userProducts.map((up) => ({ kind: "user" as const, id: up.id as string, label: (up.custom_name || up.product_base?.name || up.id) as string })),
                                ].filter((o) => o.label.toLowerCase().includes(term));
                                return choice || term.trim().length === 0 ? null : (
                                  <div className="max-h-40 overflow-auto rounded border bg-background">
                                    {options.length > 0 ? (
                                      options.slice(0, 50).map((o) => (
                                        <button
                                          key={`${o.kind}:${o.id}`}
                                          className="flex w-full cursor-pointer items-center justify-between px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                          onClick={() => {
                                            setSelectedChoiceByMeal((prev) => ({ ...prev, [meal.id]: { kind: o.kind, id: o.id } }));
                                            setSearchTermByMeal((prev) => ({ ...prev, [meal.id]: o.label }));
                                          }}
                                        >
                                          <span>{o.label}</span>
                                        </button>
                                      ))
                                    ) : (
                                      <div className="px-2 py-1 text-sm text-muted-foreground">Nenhum resultado</div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="p-2 align-top">
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Qtd"
                              value={qtyByMeal[meal.id] || ""}
                              onChange={(e) => setQtyByMeal((prev) => ({ ...prev, [meal.id]: e.target.value }))}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <Select
                              value={unitIdByMeal[meal.id] || ""}
                              onChange={(e) => setUnitIdByMeal((prev) => ({ ...prev, [meal.id]: e.target.value }))}
                            >
                              <option value="">Selecione...</option>
                              {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.abbreviation}
                                </option>
                              ))}
                            </Select>
                          </td>
                          <td className="p-2 align-top">
                            <Input
                              placeholder="Observações"
                              value={notesByMeal[meal.id] || ""}
                              onChange={(e) => setNotesByMeal((prev) => ({ ...prev, [meal.id]: e.target.value }))}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={async () => {
                                  const choice = selectedChoiceByMeal[meal.id];
                                  const quantity = qtyByMeal[meal.id];
                                  const unitId = unitIdByMeal[meal.id];
                                  if (!choice) {
                                    alert("Selecione um produto");
                                    return;
                                  }
                                  if (!unitId) {
                                    alert("Selecione a unidade");
                                    return;
                                  }
                                  if (!quantity || isNaN(Number(quantity))) {
                                    alert("Informe a quantidade");
                                    return;
                                  }
                                  const product_base_id = choice.kind === "base" ? choice.id : null;
                                  const user_product_id = choice.kind === "user" ? choice.id : null;
                                  const { error: insertError } = await supabase
                                    .from("diet_items")
                                    .insert({
                                      meal_id: meal.id,
                                      product_base_id,
                                      user_product_id,
                                      measurement_unit_id: unitId,
                                      quantity: parseFloat(quantity),
                                      preparation_notes: (notesByMeal[meal.id] || null) as any,
                                    });
                                  if (insertError) {
                                    alert(insertError.message);
                                    return;
                                  }
                                  setShowFormByMeal((prev) => ({ ...prev, [meal.id]: false }));
                                  setSelectedChoiceByMeal((prev) => ({ ...prev, [meal.id]: null }));
                                  setQtyByMeal((prev) => ({ ...prev, [meal.id]: "" }));
                                  setUnitIdByMeal((prev) => ({ ...prev, [meal.id]: "" }));
                                  setNotesByMeal((prev) => ({ ...prev, [meal.id]: "" }));
                                  router.refresh();
                                }}
                              >
                                Salvar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowFormByMeal((prev) => ({ ...prev, [meal.id]: false }));
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : null
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
