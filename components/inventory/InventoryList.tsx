"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Warehouse, AlertTriangle } from "lucide-react";

interface InventoryItem {
  id: string;
  quantity: number;
  expiration_date: string | null;
  storage_location: string | null;
  status: string;
  user_product: {
    custom_name: string | null;
    product_base: { name: string } | null;
  } | null;
  measurement_unit: { abbreviation: string } | null;
}

interface InventoryListProps {
  inventory: InventoryItem[];
}

export default function InventoryList({ inventory }: InventoryListProps) {
  if (inventory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estoque vazio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Adicione produtos ao seu estoque
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {inventory.map((item) => {
        const productName =
          item.user_product?.custom_name ||
          item.user_product?.product_base?.name ||
          "Produto";
        const isExpiring =
          item.expiration_date &&
          new Date(item.expiration_date) <=
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        return (
          <Card key={item.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{productName}</CardTitle>
                </div>
                {isExpiring && (
                  <Badge variant="destructive">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Vencendo
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">
                Quantidade: {item.quantity}{" "}
                {item.measurement_unit?.abbreviation || ""}
              </p>
              {item.expiration_date && (
                <p className="text-sm text-muted-foreground">
                  Validade: {new Date(item.expiration_date).toLocaleDateString("pt-BR")}
                </p>
              )}
              {item.storage_location && (
                <p className="text-sm text-muted-foreground">
                  Local: {item.storage_location}
                </p>
              )}
              <Badge variant="secondary">{item.status}</Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

