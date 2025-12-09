"use client";

import { useState, useEffect } from "react";
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
  const nutrientOptions = [
    { key: "calories", label: "Calorias" },
    { key: "carbohydrates", label: "Carboidratos" },
    { key: "protein", label: "Proteínas" },
    { key: "total_fat", label: "Gorduras Totais" },
    { key: "fiber", label: "Fibras" },
    { key: "sugar", label: "Açúcares" },
    { key: "sodium", label: "Sódio" },
    { key: "calcium", label: "Cálcio" },
    { key: "iron", label: "Ferro" },
    { key: "magnesium", label: "Magnésio" },
    { key: "potassium", label: "Potássio" },
    { key: "zinc", label: "Zinco" },
    { key: "vitamin_a", label: "Vitamina A" },
    { key: "vitamin_b1", label: "Vitamina B1" },
    { key: "vitamin_b2", label: "Vitamina B2" },
    { key: "vitamin_b3", label: "Vitamina B3" },
    { key: "vitamin_b6", label: "Vitamina B6" },
    { key: "vitamin_b12", label: "Vitamina B12" },
    { key: "vitamin_c", label: "Vitamina C" },
    { key: "vitamin_d", label: "Vitamina D" },
    { key: "vitamin_e", label: "Vitamina E" },
    { key: "vitamin_k", label: "Vitamina K" },
    { key: "cholesterol", label: "Colesterol" },
  ];
  const [trackingNutrients, setTrackingNutrients] = useState<string[]>(["calories", "carbohydrates", "protein"]);

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: diet
      ? {
          ...diet,
          is_active: !!diet.is_active,
        }
      : {
          name: "",
          objective: "",
          start_date: "",
          end_date: "",
          target_calories: "",
          target_protein: "",
          target_carbohydrates: "",
          target_fat: "",
          observations: "",
          is_active: false,
        },
  });

  useEffect(() => {
    const id = diet?.id;
    if (!id) return;
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(`diet-tracking-nutrients:${id}`) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setTrackingNutrients(parsed);
      }
    } catch {}
  }, [diet?.id]);

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
        target_protein: data.target_protein ? parseFloat(data.target_protein) : null,
        target_carbohydrates: data.target_carbohydrates ? parseFloat(data.target_carbohydrates) : null,
        target_fat: data.target_fat ? parseFloat(data.target_fat) : null,
        observations: data.observations || null,
        is_active: !!data.is_active,
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

      try {
        if (dietId && typeof window !== "undefined") {
          window.localStorage.setItem(`diet-tracking-nutrients:${dietId}`, JSON.stringify(trackingNutrients));
        }
      } catch {}

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

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="target_protein">Proteínas Alvo (g)</Label>
              <Input id="target_protein" type="number" step="0.1" {...register("target_protein")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_carbohydrates">Carboidratos Alvo (g)</Label>
              <Input id="target_carbohydrates" type="number" step="0.1" {...register("target_carbohydrates")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_fat">Gorduras Totais Alvo (g)</Label>
              <Input id="target_fat" type="number" step="0.1" {...register("target_fat")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="is_active">Status</Label>
            <button
              type="button"
              role="switch"
              aria-checked={watch("is_active") ? "true" : "false"}
              onClick={() => setValue("is_active", !watch("is_active"))}
              className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${watch("is_active") ? "bg-green-500" : "bg-muted"}`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${watch("is_active") ? "translate-x-5" : "translate-x-1"}`}
              />
            </button>
            <input type="hidden" {...register("is_active")} />
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

          <div className="space-y-2">
            <Label>Nutrientes para acompanhamento</Label>
            <div className="grid gap-2 md:grid-cols-3">
              {nutrientOptions.map((opt) => {
                const checked = trackingNutrients.includes(opt.key);
                return (
                  <label key={opt.key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        setTrackingNutrients((prev) =>
                          prev.includes(opt.key)
                            ? prev.filter((k) => k !== opt.key)
                            : [...prev, opt.key]
                        );
                      }}
                    />
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>
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
