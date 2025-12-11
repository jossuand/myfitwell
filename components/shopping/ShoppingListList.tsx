"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, CheckCircle2, Eye, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleDeleteList = async (listId: string, listName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a lista "${listName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setDeletingId(listId);

    try {
      const { error } = await supabase
        .from("shopping_lists")
        .delete()
        .eq("id", listId);

      if (error) throw error;

      router.refresh();
    } catch (error) {
      console.error("Erro ao excluir lista:", error);
      alert("Erro ao excluir lista de compras");
    } finally {
      setDeletingId(null);
    }
  };
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
      {lists.filter(list => list && list.id).map((list) => {
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
              <div className="flex gap-2">
                <Link href={`/dashboard/shopping-lists/${list.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Lista
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteList(list.id, list.name)}
                  disabled={deletingId === list.id}
                  className="text-destructive hover:text-destructive"
                >
                  {deletingId === list.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

