"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DietItemFormProps {
  dietId: string;
  mealId: string;
  productBases: any[];
  userProducts: any[];
  units: any[];
  item?: any;
}

export default function DietItemForm({
  dietId,
  mealId,
  productBases,
  userProducts,
  units,
  item,
}: DietItemFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, watch } = useForm({
    defaultValues: item
      ? {
          product_choice: item.product_base_id
            ? `base:${item.product_base_id}`
            : item.user_product_id
            ? `user:${item.user_product_id}`
            : "",
          measurement_unit_id: item.measurement_unit_id || "",
          quantity: item.quantity ?? "",
          preparation_notes: item.preparation_notes || "",
        }
      : {
          product_choice: "",
          measurement_unit_id: "",
          quantity: "",
          preparation_notes: "",
        },
  });
  const product_choice = watch("product_choice");

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

      let product_base_id: string | null = null;
      let user_product_id: string | null = null;

      if (data.product_choice) {
        const [kind, id] = String(data.product_choice).split(":");
        if (kind === "base") product_base_id = id || null;
        if (kind === "user") user_product_id = id || null;
      }

      if (!product_base_id && !user_product_id) {
        setError("Selecione um produto");
        return;
      }

      const quantity = data.quantity ? parseFloat(data.quantity) : null;

      if (item?.id) {
        const { error: updateError } = await supabase
          .from("diet_items")
          .update({
            product_base_id,
            user_product_id,
            measurement_unit_id: data.measurement_unit_id || null,
            quantity,
            preparation_notes: data.preparation_notes || null,
          })
          .eq("id", item.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("diet_items")
          .insert({
            meal_id: mealId,
            product_base_id,
            user_product_id,
            measurement_unit_id: data.measurement_unit_id || null,
            quantity,
            preparation_notes: data.preparation_notes || null,
          });
        if (insertError) throw insertError;
      }

      router.push(`/dashboard/diets/${dietId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? "Editar Item da Refeição" : "Novo Item da Refeição"}</CardTitle>
        <CardDescription>
          {item ? "Atualize o produto, unidade e quantidade" : "Escolha o produto, unidade e quantidade"}
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
            <Label htmlFor="product_choice">Produto *</Label>
            <Select id="product_choice" {...register("product_choice", { required: true })}>
              <option value="">Selecione...</option>
              {productBases && productBases.length > 0 && (
                <optgroup label="Produtos Base">
                  {productBases.map((pb: any) => (
                    <option key={pb.id} value={`base:${pb.id}`}>
                      {pb.name}
                    </option>
                  ))}
                </optgroup>
              )}
              {userProducts && userProducts.length > 0 && (
                <optgroup label="Meus Produtos">
                  {userProducts.map((up: any) => (
                    <option key={up.id} value={`user:${up.id}`}>
                      {up.custom_name || up.product_base?.name || up.id}
                    </option>
                  ))}
                </optgroup>
              )}
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="measurement_unit_id">Unidade *</Label>
              <Select id="measurement_unit_id" {...register("measurement_unit_id", { required: true })}>
                <option value="">Selecione...</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.abbreviation}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade *</Label>
              <Input id="quantity" type="number" step="0.01" {...register("quantity", { required: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="preparation_notes">Observações de preparo</Label>
            <Input id="preparation_notes" {...register("preparation_notes")} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (item ? "Atualizando..." : "Salvando...") : item ? "Atualizar Item" : "Adicionar Item"}
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
