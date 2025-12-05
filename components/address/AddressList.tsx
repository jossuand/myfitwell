"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Address {
  id: string;
  address_type: string;
  is_primary: boolean;
  zip_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

interface AddressListProps {
  addresses: Address[];
}

const addressTypeLabels: Record<string, string> = {
  residential: "Residencial",
  delivery: "Entrega",
  billing: "Cobrança",
  office: "Escritório",
};

export default function AddressList({ addresses }: AddressListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este endereço?")) {
      return;
    }

    setDeleting(id);
    try {
      const { error } = await supabase.from("addresses").delete().eq("id", id);
      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir endereço:", error);
      alert("Erro ao excluir endereço");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {addresses.map((address) => (
        <Card key={address.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  {addressTypeLabels[address.address_type] || address.address_type}
                </CardTitle>
              </div>
              {address.is_primary && (
                <Badge variant="default">Principal</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1 text-sm">
              <p className="font-medium">
                {address.street}, {address.number}
              </p>
              {address.complement && (
                <p className="text-muted-foreground">{address.complement}</p>
              )}
              <p className="text-muted-foreground">
                {address.neighborhood} - {address.city}/{address.state}
              </p>
              <p className="text-muted-foreground">CEP: {address.zip_code}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/addresses/${address.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(address.id)}
                disabled={deleting === address.id}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting === address.id ? "Excluindo..." : "Excluir"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

