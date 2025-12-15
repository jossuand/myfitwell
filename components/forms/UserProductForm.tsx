"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserProductFormProps {
  product?: any;
  productBases: any[];
  units: any[];
}

export default function UserProductForm({
  product,
  productBases,
  units,
}: UserProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const baseNI = product?.product_base?.nutritional_info || null;
  const userNI = product?.user_nutritional_info || null;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: product || {
      product_base_id: "",
      brand: "",
      custom_name: "",
      price: "",
      quantity: "",
      measurement_unit_id: "",
      store_name: "",
      nutrition: {
        reference_quantity: userNI?.reference_quantity ?? (baseNI ? 100 : ""),
        reference_unit_id:
          userNI?.reference_unit_id ??
          baseNI?.reference_unit_id ??
          product?.product_base?.measurement_unit_id ??
          "",
        calories: userNI?.calories ?? baseNI?.calories ?? "",
        protein: userNI?.protein ?? baseNI?.protein ?? "",
        carbohydrates: userNI?.carbohydrates ?? baseNI?.carbohydrates ?? "",
        fiber: userNI?.fiber ?? baseNI?.fiber ?? "",
        total_fat: userNI?.total_fat ?? baseNI?.total_fat ?? "",
        saturated_fat: userNI?.saturated_fat ?? baseNI?.saturated_fat ?? "",
        trans_fat: userNI?.trans_fat ?? baseNI?.trans_fat ?? "",
        sugar: userNI?.sugar ?? baseNI?.sugar ?? "",
        sodium: userNI?.sodium ?? baseNI?.sodium ?? "",
        calcium: userNI?.calcium ?? baseNI?.calcium ?? "",
        iron: userNI?.iron ?? baseNI?.iron ?? "",
        magnesium: userNI?.magnesium ?? baseNI?.magnesium ?? "",
        potassium: userNI?.potassium ?? baseNI?.potassium ?? "",
        zinc: userNI?.zinc ?? baseNI?.zinc ?? "",
        vitamin_a: userNI?.vitamin_a ?? baseNI?.vitamin_a ?? "",
        vitamin_b1: userNI?.vitamin_b1 ?? baseNI?.vitamin_b1 ?? "",
        vitamin_b2: userNI?.vitamin_b2 ?? baseNI?.vitamin_b2 ?? "",
        vitamin_b3: userNI?.vitamin_b3 ?? baseNI?.vitamin_b3 ?? "",
        vitamin_b6: userNI?.vitamin_b6 ?? baseNI?.vitamin_b6 ?? "",
        vitamin_b12: userNI?.vitamin_b12 ?? baseNI?.vitamin_b12 ?? "",
        vitamin_c: userNI?.vitamin_c ?? baseNI?.vitamin_c ?? "",
        vitamin_d: userNI?.vitamin_d ?? baseNI?.vitamin_d ?? "",
        vitamin_e: userNI?.vitamin_e ?? baseNI?.vitamin_e ?? "",
        vitamin_k: userNI?.vitamin_k ?? baseNI?.vitamin_k ?? "",
        cholesterol: userNI?.cholesterol ?? baseNI?.cholesterol ?? "",
        data_source: userNI?.data_source ?? (baseNI ? "taco" : ""),
      },
    },
  });

  const selectedBaseId = watch("product_base_id");

  useEffect(() => {
    register("product_base_id");
    register("measurement_unit_id");
    register("nutrition.reference_unit_id");
  }, [register]);

  useEffect(() => {
    if (!selectedBaseId) return;
    const pb = productBases.find((p) => String(p.id) === String(selectedBaseId));
    const ni = pb?.nutritional_info || null;
    if (!ni) return;
    setValue("nutrition.reference_quantity", (ni.reference_quantity ?? 100) as any);
    const unitId = ni.reference_unit_id ?? pb?.measurement_unit_id;
    if (unitId) setValue("nutrition.reference_unit_id", String(unitId) as any);
    setValue("nutrition.data_source", "taco");
    const fields = [
      "calories",
      "protein",
      "carbohydrates",
      "fiber",
      "total_fat",
      "saturated_fat",
      "trans_fat",
      "sugar",
      "sodium",
      "calcium",
      "iron",
      "magnesium",
      "potassium",
      "zinc",
      "vitamin_a",
      "vitamin_b1",
      "vitamin_b2",
      "vitamin_b3",
      "vitamin_b6",
      "vitamin_b12",
      "vitamin_c",
      "vitamin_d",
      "vitamin_e",
      "vitamin_k",
      "cholesterol",
    ];
    fields.forEach((f) => {
      const v = (ni as any)[f];
      if (v !== undefined && v !== null) setValue(`nutrition.${f}` as any, v as any);
    });
  }, [selectedBaseId, productBases, setValue]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Usuário não autenticado");
        return;
      }

      const productData = {
        user_id: user.id,
        product_base_id: data.product_base_id || null,
        brand: data.brand || null,
        custom_name: data.custom_name || null,
        price: data.price ? parseFloat(data.price) : null,
        quantity: data.quantity ? parseFloat(data.quantity) : null,
        measurement_unit_id: data.measurement_unit_id || null,
        store_name: data.store_name || null,
        purchase_date: data.purchase_date || null,
      };

      let userProductId: string | undefined = product?.id;
      if (product) {
        const { error: updateError } = await supabase
          .from("user_products")
          .update(productData)
          .eq("id", product.id);
        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("user_products")
          .insert(productData)
          .select()
          .single();
        if (insertError) throw insertError;
        userProductId = inserted?.id;
      }

      const nutritionFields = [
        "calories",
        "protein",
        "carbohydrates",
        "fiber",
        "total_fat",
        "saturated_fat",
        "trans_fat",
        "sugar",
        "sodium",
        "calcium",
        "iron",
        "magnesium",
        "potassium",
        "zinc",
        "vitamin_a",
        "vitamin_b1",
        "vitamin_b2",
        "vitamin_b3",
        "vitamin_b6",
        "vitamin_b12",
        "vitamin_c",
        "vitamin_d",
        "vitamin_e",
        "vitamin_k",
        "cholesterol",
      ];

      const nutrition = (data as any)?.nutrition || {};
      const nutritionData: any = {};
      const refQty = nutrition?.reference_quantity;
      const refUnitId = nutrition?.reference_unit_id;
      if (refQty) nutritionData.reference_quantity = parseFloat(String(refQty));
      if (refUnitId) nutritionData.reference_unit_id = refUnitId;
      if (nutrition?.data_source) nutritionData.data_source = nutrition.data_source;
      nutritionFields.forEach((field) => {
        const v = nutrition?.[field];
        if (v !== undefined && v !== null && String(v) !== "") {
          nutritionData[field] = parseFloat(String(v));
        }
      });

      if (userProductId) {
        const { data: existingNI } = await supabase
          .from("user_product_nutritional_info")
          .select("*")
          .eq("user_product_id", userProductId)
          .maybeSingle();
        if (existingNI) {
          const { error: updNIError } = await supabase
            .from("user_product_nutritional_info")
            .update(nutritionData)
            .eq("user_product_id", userProductId);
          if (updNIError) throw updNIError;
        } else if (Object.keys(nutritionData).length > 0) {
          const { error: insNIError } = await supabase
            .from("user_product_nutritional_info")
            .insert({ user_product_id: userProductId, ...nutritionData });
          if (insNIError) throw insNIError;
        }
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar produto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? "Editar Produto" : "Novo Produto"}</CardTitle>
        <CardDescription>
          Adicione informações sobre o produto com marca e preço
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="product_base_id">Produto Base (opcional)</Label>
            <Select
              value={String(watch("product_base_id") || "")}
              onValueChange={(v) => setValue("product_base_id", v === "none" ? ("" as any) : (v as any))}
            >
              <SelectTrigger id="product_base_id">
                <SelectValue placeholder="Sem produto base" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem produto base</SelectItem>
                {productBases.map((pb) => (
                  <SelectItem key={pb.id} value={String(pb.id)}>
                    {pb.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca</Label>
              <Input id="brand" {...register("brand")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom_name">Nome Personalizado</Label>
              <Input id="custom_name" {...register("custom_name")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input id="price" type="number" step="0.01" {...register("price")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="number" step="0.1" {...register("quantity")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="measurement_unit_id">Unidade de Medida</Label>
              <Select
                value={String(watch("measurement_unit_id") || "")}
                onValueChange={(v) => setValue("measurement_unit_id", v === "none" ? ("" as any) : (v as any))}
              >
                <SelectTrigger id="measurement_unit_id">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Selecione...</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={String(unit.id)}>
                      {unit.abbreviation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="store_name">Loja</Label>
              <Input id="store_name" {...register("store_name")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchase_date">Data de Compra</Label>
            <Input id="purchase_date" type="date" {...register("purchase_date")} />
          </div>

          <div className="space-y-4 rounded border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Informações Nutricionais</p>
                <p className="text-sm text-muted-foreground">Porção de referência e nutrientes</p>
              </div>
              {baseNI ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setValue("nutrition.reference_quantity", 100 as any);
                    setValue("nutrition.calories", baseNI?.calories ?? "");
                    setValue("nutrition.protein", baseNI?.protein ?? "");
                    setValue("nutrition.carbohydrates", baseNI?.carbohydrates ?? "");
                    setValue("nutrition.fiber", baseNI?.fiber ?? "");
                    setValue("nutrition.total_fat", baseNI?.total_fat ?? "");
                    setValue("nutrition.saturated_fat", baseNI?.saturated_fat ?? "");
                    setValue("nutrition.trans_fat", baseNI?.trans_fat ?? "");
                    setValue("nutrition.sugar", baseNI?.sugar ?? "");
                    setValue("nutrition.sodium", baseNI?.sodium ?? "");
                    setValue("nutrition.calcium", baseNI?.calcium ?? "");
                    setValue("nutrition.iron", baseNI?.iron ?? "");
                    setValue("nutrition.magnesium", baseNI?.magnesium ?? "");
                    setValue("nutrition.potassium", baseNI?.potassium ?? "");
                    setValue("nutrition.zinc", baseNI?.zinc ?? "");
                    setValue("nutrition.vitamin_a", baseNI?.vitamin_a ?? "");
                    setValue("nutrition.vitamin_b1", baseNI?.vitamin_b1 ?? "");
                    setValue("nutrition.vitamin_b2", baseNI?.vitamin_b2 ?? "");
                    setValue("nutrition.vitamin_b3", baseNI?.vitamin_b3 ?? "");
                    setValue("nutrition.vitamin_b6", baseNI?.vitamin_b6 ?? "");
                    setValue("nutrition.vitamin_b12", baseNI?.vitamin_b12 ?? "");
                    setValue("nutrition.vitamin_c", baseNI?.vitamin_c ?? "");
                    setValue("nutrition.vitamin_d", baseNI?.vitamin_d ?? "");
                    setValue("nutrition.vitamin_e", baseNI?.vitamin_e ?? "");
                    setValue("nutrition.vitamin_k", baseNI?.vitamin_k ?? "");
                    setValue("nutrition.cholesterol", baseNI?.cholesterol ?? "");
                    setValue("nutrition.data_source", "taco");
                  }}
                >
                  Preencher com produto base
                </Button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="reference_quantity">Quantidade de referência</Label>
                <Input id="reference_quantity" type="number" step="0.01" {...register("nutrition.reference_quantity")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference_unit_id">Unidade de referência</Label>
                <Select
                  value={String(watch("nutrition.reference_unit_id") || "")}
                  onValueChange={(v) => setValue("nutrition.reference_unit_id", v === "none" ? ("" as any) : (v as any))}
                >
                  <SelectTrigger id="reference_unit_id">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Selecione...</SelectItem>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.abbreviation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_source">Origem dos dados</Label>
                <Input id="data_source" placeholder="taco | label | estimated | manual" {...register("nutrition.data_source")} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2"><Label htmlFor="calories">Calorias (kcal)</Label><Input id="calories" type="number" step="0.1" {...register("nutrition.calories")} /></div>
              <div className="space-y-2"><Label htmlFor="protein">Proteínas (g)</Label><Input id="protein" type="number" step="0.1" {...register("nutrition.protein")} /></div>
              <div className="space-y-2"><Label htmlFor="carbohydrates">Carboidratos (g)</Label><Input id="carbohydrates" type="number" step="0.1" {...register("nutrition.carbohydrates")} /></div>
              <div className="space-y-2"><Label htmlFor="fiber">Fibras (g)</Label><Input id="fiber" type="number" step="0.1" {...register("nutrition.fiber")} /></div>
              <div className="space-y-2"><Label htmlFor="total_fat">Gorduras Totais (g)</Label><Input id="total_fat" type="number" step="0.1" {...register("nutrition.total_fat")} /></div>
              <div className="space-y-2"><Label htmlFor="saturated_fat">Gordura Saturada (g)</Label><Input id="saturated_fat" type="number" step="0.1" {...register("nutrition.saturated_fat")} /></div>
              <div className="space-y-2"><Label htmlFor="trans_fat">Gordura Trans (g)</Label><Input id="trans_fat" type="number" step="0.1" {...register("nutrition.trans_fat")} /></div>
              <div className="space-y-2"><Label htmlFor="sugar">Açúcares (g)</Label><Input id="sugar" type="number" step="0.1" {...register("nutrition.sugar")} /></div>
              <div className="space-y-2"><Label htmlFor="sodium">Sódio (mg)</Label><Input id="sodium" type="number" step="0.1" {...register("nutrition.sodium")} /></div>
              <div className="space-y-2"><Label htmlFor="calcium">Cálcio (mg)</Label><Input id="calcium" type="number" step="0.1" {...register("nutrition.calcium")} /></div>
              <div className="space-y-2"><Label htmlFor="iron">Ferro (mg)</Label><Input id="iron" type="number" step="0.1" {...register("nutrition.iron")} /></div>
              <div className="space-y-2"><Label htmlFor="magnesium">Magnésio (mg)</Label><Input id="magnesium" type="number" step="0.1" {...register("nutrition.magnesium")} /></div>
              <div className="space-y-2"><Label htmlFor="potassium">Potássio (mg)</Label><Input id="potassium" type="number" step="0.1" {...register("nutrition.potassium")} /></div>
              <div className="space-y-2"><Label htmlFor="zinc">Zinco (mg)</Label><Input id="zinc" type="number" step="0.1" {...register("nutrition.zinc")} /></div>
              <div className="space-y-2"><Label htmlFor="vitamin_a">Vitamina A (mcg)</Label><Input id="vitamin_a" type="number" step="0.1" {...register("nutrition.vitamin_a")} /></div>
              <div className="space-y-2"><Label htmlFor="vitamin_b1">Vitamina B1 (mg)</Label><Input id="vitamin_b1" type="number" step="0.1" {...register("nutrition.vitamin_b1")} /></div>
              <div className="space-y-2"><Label htmlFor="vitamin_b2">Vitamina B2 (mg)</Label><Input id="vitamin_b2" type="number" step="0.1" {...register("nutrition.vitamin_b2")} /></div>
              <div className="space-y-2"><Label htmlFor="vitamin_b3">Vitamina B3 (mg)</Label><Input id="vitamin_b3" type="number" step="0.1" {...register("nutrition.vitamin_b3")} /></div>
              <div className="space-y-2"><Label htmlFor="vitamin_b6">Vitamina B6 (mg)</Label><Input id="vitamin_b6" type="number" step="0.1" {...register("nutrition.vitamin_b6")} /></div>
              <div className="space-y-2"><Label htmlFor="vitamin_b12">Vitamina B12 (mcg)</Label><Input id="vitamin_b12" type="number" step="0.1" {...register("nutrition.vitamin_b12")} /></div>
              <div className="space-y-2"><Label htmlFor="vitamin_c">Vitamina C (mg)</Label><Input id="vitamin_c" type="number" step="0.1" {...register("nutrition.vitamin_c")} /></div>
              <div className="space-y-2"><Label htmlFor="vitamin_d">Vitamina D (mcg)</Label><Input id="vitamin_d" type="number" step="0.1" {...register("nutrition.vitamin_d")} /></div>
              <div className="space-y-2"><Label htmlFor="vitamin_e">Vitamina E (mg)</Label><Input id="vitamin_e" type="number" step="0.1" {...register("nutrition.vitamin_e")} /></div>
              <div className="space-y-2"><Label htmlFor="vitamin_k">Vitamina K (mcg)</Label><Input id="vitamin_k" type="number" step="0.1" {...register("nutrition.vitamin_k")} /></div>
              <div className="space-y-2"><Label htmlFor="cholesterol">Colesterol (mg)</Label><Input id="cholesterol" type="number" step="0.1" {...register("nutrition.cholesterol")} /></div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Produto"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
