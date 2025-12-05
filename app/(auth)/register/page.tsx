import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RegisterForm from "@/components/forms/RegisterForm";

export default async function RegisterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Myfitwell</h1>
          <p className="mt-2 text-muted-foreground">
            Crie sua conta para começar
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}

