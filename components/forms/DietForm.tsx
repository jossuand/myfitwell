"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DietFormProps {
  diet?: any;
  productBases: any[];
  userProducts: any[];
}

const objectives = [
  { value: "weight_loss", label: "Emagrecer" },
  { value: "weight_gain", label: "Ganhar Peso" },
  { value: "muscle_gain", label: "Ganhar Massa Muscular" },
  { value: "maintenance", label: "Manter Peso" },
  { value: "health_improvement", label: "Melhorar Saúde" },
  { value: "disease_management", label: "Gerenciar Doença" },
];

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

export default function DietForm({
  diet,
  productBases,
  userProducts,
}: DietFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit } = useForm({
    defaultValues: diet || {
      name: "",
      objective: "",
      start_date: "",
      end_date: "",
      target_calories: "",
      observations: "",
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

      const dietData = {
        user_id: user.id,
        name: data.name,
        objective: data.objective,
        start_date: data.start_date,
        end_date: data.end_date || null,
        target_calories: data.target_calories ? parseFloat(data.target_calories) : null,
        observations: data.observations || null,
        is_active: false,
      };

      let dietId = diet?.id;

      if (diet) {
        const { error: updateError } = await supabase
          .from("diets")
          .update(dietData)
          .eq("id", diet.id);
        if (updateError) throw updateError;
        dietId = diet.id;
      } else {
        const { data: newDiet, error: insertError } = await supabase
          .from("diets")
          .insert(dietData)
          .select()
          .single();
        if (insertError) throw insertError;
        dietId = newDiet.id;
      }

      router.push(`/dashboard/diets/${dietId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar dieta");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{diet ? "Editar Dieta" : "Nova Dieta"}</CardTitle>
        <CardDescription>
          Configure os dados básicos da dieta. Você poderá adicionar refeições depois.
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
            <Label htmlFor="name">Nome da Dieta *</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="objective">Objetivo *</Label>
              <Select id="objective" {...register("objective", { required: true })}>
                <option value="">Selecione...</option>
                {objectives.map((obj) => (
                  <option key={obj.value} value={obj.value}>
                    {obj.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_calories">Calorias Alvo (kcal)</Label>
              <Input
                id="target_calories"
                type="number"
                {...register("target_calories")}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Data de Início *</Label>
              <Input
                id="start_date"
                type="date"
                {...register("start_date", { required: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data de Término</Label>
              <Input id="end_date" type="date" {...register("end_date")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observations">Observações</Label>
            <Textarea id="observations" {...register("observations")} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : diet ? "Atualizar Dieta" : "Criar Dieta"}
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

