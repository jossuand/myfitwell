"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ShoppingListForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit } = useForm({
    defaultValues: {
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

      const { error: insertError } = await supabase
        .from("shopping_lists")
        .insert({
          user_id: user.id,
          name: data.name,
          is_completed: false,
          is_auto_generated: false,
        });

      if (insertError) throw insertError;

      router.push("/dashboard/shopping-lists");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Erro ao criar lista de compras");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Lista de Compras</CardTitle>
        <CardDescription>Defina um nome para sua lista</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Criar Lista"}
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
