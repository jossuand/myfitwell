"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        // Mensagens de erro mais amigáveis
        if (signInError.message.includes("Email not confirmed")) {
          setError("Por favor, verifique seu email antes de fazer login. Verifique sua caixa de entrada.");
        } else if (signInError.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos. Verifique suas credenciais.");
        } else {
          setError(signInError.message);
        }
        setIsLoading(false);
        return;
      }

      if (signInData.session) {
        // Verificar se o perfil existe, se não, criar
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", signInData.user.id)
          .single();

        if (!profile && signInData.user) {
          // Criar perfil se não existir
          await supabase.from("profiles").insert({
            id: signInData.user.id,
            full_name: signInData.user.user_metadata?.full_name || "",
          });

          // Criar role se não existir
          const { data: existingRole } = await supabase
            .from("user_roles")
            .select("*")
            .eq("user_id", signInData.user.id)
            .single();

          if (!existingRole) {
            await supabase.from("user_roles").insert({
              user_id: signInData.user.id,
              role: "client",
              is_active: true,
            });
          }
        }

        // Aguardar um pouco para garantir que os cookies sejam salvos
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Forçar reload completo para garantir que a sessão seja reconhecida
        window.location.href = "/dashboard";
      } else {
        setError("Erro ao criar sessão. Tente novamente.");
      }
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError(err.message || "Erro ao fazer login. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Entre com seu email e senha para acessar sua conta
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

