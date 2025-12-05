"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Package } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProductBase {
  id: string;
  name: string;
  description: string | null;
  category: { name: string } | null;
  measurement_unit: { name: string; abbreviation: string } | null;
  nutritional_info: any;
}

interface ProductBaseListProps {
  products: ProductBase[];
}

export default function ProductBaseList({ products }: ProductBaseListProps) {
  const router = useRouter();
  const supabase = createClient();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja desativar este produto?")) {
      return;
    }

    setDeleting(id);
    try {
      const { error } = await supabase
        .from("product_bases")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error("Erro ao desativar produto:", error);
      alert("Erro ao desativar produto");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{product.name}</CardTitle>
              </div>
            </div>
            {product.category && (
              <CardDescription>
                <Badge variant="secondary">{product.category.name}</Badge>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {product.description && (
              <p className="text-sm text-muted-foreground">
                {product.description}
              </p>
            )}
            {product.measurement_unit && (
              <p className="text-sm">
                Unidade: {product.measurement_unit.abbreviation}
              </p>
            )}
            {product.nutritional_info && (
              <div className="text-sm">
                <p className="font-medium">Informações Nutricionais:</p>
                <p className="text-muted-foreground">
                  {product.nutritional_info.calories} kcal / 100g
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/admin/products/${product.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(product.id)}
                disabled={deleting === product.id}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting === product.id ? "Desativando..." : "Desativar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

