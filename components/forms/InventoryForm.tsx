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

interface InventoryFormProps {
  userProducts: any[];
  units: any[];
}

export default function InventoryForm({ userProducts, units }: InventoryFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      user_product_id: "",
      measurement_unit_id: "",
      quantity: "",
      expiration_date: "",
      storage_location: "",
      status: "available",
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

      const quantity = data.quantity ? parseFloat(data.quantity) : null;

      const { error: insertError } = await supabase
        .from("inventory")
        .insert({
          user_id: user.id,
          user_product_id: data.user_product_id || null,
          measurement_unit_id: data.measurement_unit_id || null,
          quantity,
          expiration_date: data.expiration_date || null,
          storage_location: data.storage_location || null,
          status: data.status || "available",
        });

      if (insertError) throw insertError;

      router.push("/dashboard/inventory");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao adicionar ao estoque");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Novo Item de Estoque</CardTitle>
        <CardDescription>Informe produto, unidade, quantidade e detalhes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="user_product_id">Produto *</Label>
            <Select id="user_product_id" {...register("user_product_id", { required: true })}>
              <option value="">Selecione...</option>
              {userProducts.map((up) => (
                <option key={up.id} value={up.id}>
                  {up.custom_name || up.product_base?.name || up.id}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="measurement_unit_id">Unidade</Label>
              <Select id="measurement_unit_id" {...register("measurement_unit_id")}> 
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="expiration_date">Validade</Label>
              <Input id="expiration_date" type="date" {...register("expiration_date")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="storage_location">Local</Label>
              <Input id="storage_location" {...register("storage_location")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}> 
              <option value="available">Disponível</option>
              <option value="reserved">Reservado</option>
              <option value="expired">Vencido</option>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Adicionar ao Estoque"}
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
