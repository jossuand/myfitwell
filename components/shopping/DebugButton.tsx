"use client";

import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";

interface DebugButtonProps {
  listId: string;
}

export function DebugButton({ listId }: DebugButtonProps) {
  const handleDebug = async () => {
    const response = await fetch("/api/debug-shopping-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listId }),
    });
    const result = await response.json();
    alert(`Diagnóstico:\n\nShopping Lists: ${result.tests.shopping_lists.success ? '✅' : '❌'} ${result.tests.shopping_lists.error || ''}\nItems: ${result.tests.shopping_list_items.success ? '✅' : '❌'} ${result.tests.shopping_list_items.error || ''}\nFull Query: ${result.tests.full_query.success ? '✅' : '❌'} ${result.tests.full_query.error || ''}`);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDebug}
    >
      <Bug className="mr-1 h-3 w-3" />
      Debug
    </Button>
  );
}