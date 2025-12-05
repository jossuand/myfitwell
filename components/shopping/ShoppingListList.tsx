"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CheckCircle2, Eye } from "lucide-react";
import Link from "next/link";

interface ShoppingList {
  id: string;
  name: string;
  is_completed: boolean;
  is_auto_generated: boolean;
  shopping_list_items: any[];
}

interface ShoppingListListProps {
  lists: ShoppingList[];
}

export default function ShoppingListList({ lists }: ShoppingListListProps) {
  if (lists.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma lista de compras</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Crie uma lista de compras ou gere uma automaticamente da sua dieta
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {lists.map((list) => {
        const totalItems = list.shopping_list_items?.length || 0;
        const purchasedItems =
          list.shopping_list_items?.filter((item) => item.is_purchased)
            .length || 0;

        return (
          <Card key={list.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{list.name}</CardTitle>
                </div>
                {list.is_completed ? (
                  <Badge>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Completa
                  </Badge>
                ) : (
                  <Badge variant="secondary">Em andamento</Badge>
                )}
              </div>
              {list.is_auto_generated && (
                <p className="text-xs text-muted-foreground">Gerada automaticamente</p>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">
                {purchasedItems} de {totalItems} itens comprados
              </p>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={`/dashboard/shopping-lists/${list.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Lista
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

