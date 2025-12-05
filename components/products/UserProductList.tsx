"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface UserProduct {
  id: string;
  brand: string | null;
  custom_name: string | null;
  price: number | null;
  quantity: number | null;
  store_name: string | null;
  product_base: { name: string } | null;
}

interface UserProductListProps {
  products: UserProduct[];
}

export default function UserProductList({ products }: UserProductListProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum produto cadastrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Comece adicionando produtos com marca e preço
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">
                {product.custom_name || product.product_base?.name || "Produto"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {product.brand && (
              <p className="text-sm text-muted-foreground">Marca: {product.brand}</p>
            )}
            {product.price && (
              <p className="text-sm font-medium">R$ {product.price.toFixed(2)}</p>
            )}
            {product.store_name && (
              <p className="text-sm text-muted-foreground">Loja: {product.store_name}</p>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/products/${product.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

