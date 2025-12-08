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

interface MealFormProps {
  dietId: string;
}

const mealTypes = [
  { value: "breakfast", label: "Café da Manhã" },
  { value: "morning_snack", label: "Lanche da Manhã" },
  { value: "lunch", label: "Almoço" },
  { value: "afternoon_snack", label: "Lanche da Tarde" },
  { value: "dinner", label: "Jantar" },
  { value: "supper", label: "Ceia" },
  { value: "pre_workout", label: "Pré-Treino" },
  { value: "post_workout", label: "Pós-Treino" },
];

export default function MealForm({ dietId }: MealFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      meal_type: "",
      name: "",
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

      const { count } = await supabase
        .from("meals")
        .select("id", { count: "exact", head: true })
        .eq("diet_id", dietId);

      const meal_order = (count || 0) + 1;

      const { error: insertError } = await supabase
        .from("meals")
        .insert({
          diet_id: dietId,
          meal_type: data.meal_type,
          name: data.name || null,
          meal_order,
        });

      if (insertError) throw insertError;

      router.push(`/dashboard/diets/${dietId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao criar refeição");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Refeição</CardTitle>
        <CardDescription>
          Escolha o tipo e um nome opcional
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
            <Label htmlFor="meal_type">Tipo de Refeição *</Label>
            <Select id="meal_type" {...register("meal_type", { required: true })}>
              <option value="">Selecione...</option>
              {mealTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome (opcional)</Label>
            <Input id="name" {...register("name")} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Criar Refeição"}
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

