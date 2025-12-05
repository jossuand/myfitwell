import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import AddressList from "@/components/address/AddressList";

export default async function AddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Endereços</h1>
          <p className="text-muted-foreground">
            Gerencie seus endereços de entrega e cobrança
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/addresses/new">
            <Plus className="mr-2 h-4 w-4" />
            Novo Endereço
          </Link>
        </Button>
      </div>

      {addresses && addresses.length > 0 ? (
        <AddressList addresses={addresses} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum endereço cadastrado</CardTitle>
            <CardDescription>
              Adicione um endereço para facilitar suas compras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/addresses/new">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeiro Endereço
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

