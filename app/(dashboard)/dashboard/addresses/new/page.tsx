import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddressForm from "@/components/forms/AddressForm";

export default async function NewAddressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Novo Endereço</h1>
        <p className="text-muted-foreground">
          Adicione um novo endereço para entrega ou cobrança
        </p>
      </div>
      <AddressForm />
    </div>
  );
}

