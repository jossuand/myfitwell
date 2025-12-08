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

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product || {
      product_base_id: "",
      brand: "",
      custom_name: "",
      price: "",
      quantity: "",
      measurement_unit_id: "",
      store_name: "",
    },
  });

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

      if (product) {
        const { error: updateError } = await supabase
          .from("user_products")
          .update(productData)
          .eq("id", product.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("user_products")
          .insert(productData);
        if (insertError) throw insertError;
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
            <Select id="product_base_id" {...register("product_base_id")}> 
              <option value="">Sem produto base</option>
              {productBases.map((pb) => (
                <option key={pb.id} value={pb.id}>
                  {pb.name}
                </option>
              ))}
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
              <Select id="measurement_unit_id" {...register("measurement_unit_id")}>
                <option value="">Selecione...</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.abbreviation}
                  </option>
                ))}
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
