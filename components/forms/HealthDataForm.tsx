"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { healthDataSchema, type HealthDataInput } from "@/lib/validations/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface HealthDataFormProps {
  profile: any;
}

const activityLevels = [
  { value: "sedentary", label: "Sedentário" },
  { value: "light", label: "Leve (1-3 dias/semana)" },
  { value: "moderate", label: "Moderado (3-5 dias/semana)" },
  { value: "intense", label: "Intenso (6-7 dias/semana)" },
  { value: "very_intense", label: "Muito Intenso (2x/dia)" },
];

export default function HealthDataForm({ profile }: HealthDataFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<HealthDataInput>({
    resolver: zodResolver(healthDataSchema),
    defaultValues: {
      weight: profile?.weight || undefined,
      height: profile?.height || undefined,
      activity_level: profile?.activity_level || undefined,
      food_restrictions: profile?.food_restrictions || [],
      allergies: profile?.allergies || [],
      intolerances: profile?.intolerances || [],
      medical_conditions: profile?.medical_conditions || [],
    },
  });

  const activityLevel = watch("activity_level");

  const onSubmit = async (data: HealthDataInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Usuário não autenticado");
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          weight: data.weight || null,
          height: data.height || null,
          activity_level: data.activity_level || null,
          food_restrictions: data.food_restrictions || null,
          allergies: data.allergies || null,
          intolerances: data.intolerances || null,
          medical_conditions: data.medical_conditions || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar dados de saúde");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>Dados de saúde atualizados com sucesso!</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="weight">Peso (kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            {...register("weight", { valueAsNumber: true })}
          />
          {errors.weight && (
            <p className="text-sm text-destructive">{errors.weight.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Altura (m)</Label>
          <Input
            id="height"
            type="number"
            step="0.01"
            {...register("height", { valueAsNumber: true })}
          />
          {errors.height && (
            <p className="text-sm text-destructive">{errors.height.message}</p>
          )}
        </div>
      </div>

      {profile?.imc && (
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium">IMC Calculado</p>
          <p className="text-2xl font-bold">{profile.imc.toFixed(1)}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="activity_level">Nível de Atividade Física</Label>
        <Select
          id="activity_level"
          value={activityLevel || ""}
          onChange={(e) => setValue("activity_level", e.target.value as any)}
        >
          <option value="">Selecione...</option>
          {activityLevels.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </Select>
        {errors.activity_level && (
          <p className="text-sm text-destructive">
            {errors.activity_level.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Restrições Alimentares</Label>
        <p className="text-sm text-muted-foreground">
          Funcionalidade de múltipla seleção em breve
        </p>
      </div>

      <div className="space-y-2">
        <Label>Alergias</Label>
        <p className="text-sm text-muted-foreground">
          Funcionalidade de múltipla seleção em breve
        </p>
      </div>

      <div className="space-y-2">
        <Label>Intolerâncias</Label>
        <p className="text-sm text-muted-foreground">
          Funcionalidade de múltipla seleção em breve
        </p>
      </div>

      <div className="space-y-2">
        <Label>Condições Médicas</Label>
        <p className="text-sm text-muted-foreground">
          Funcionalidade de múltipla seleção em breve
        </p>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Salvando..." : "Salvar Dados de Saúde"}
      </Button>
    </form>
  );
}

