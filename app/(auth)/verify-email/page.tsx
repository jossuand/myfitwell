import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se já está autenticado, redirecionar
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verifique seu email</CardTitle>
          <CardDescription>
            Enviamos um link de verificação para o seu email. Por favor, clique
            no link para ativar sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Se você não recebeu o email, verifique sua caixa de spam ou tente
            novamente.
          </p>
          <div className="flex gap-2">
            <Button asChild className="flex-1">
              <Link href="/login">Voltar para login</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/register">Criar nova conta</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
