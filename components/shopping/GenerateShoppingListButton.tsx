"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function GenerateShoppingListButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleGenerateList = async () => {
    const daysInput = prompt("Para quantos dias você quer gerar a lista de compras baseada na sua dieta ativa?", "7");

    if (daysInput === null) return; // Usuário cancelou

    const daysNumber = parseInt(daysInput);
    if (!daysNumber || daysNumber < 1 || daysNumber > 90) {
      alert("Por favor, insira um número válido de dias (1-90)");
      return;
    }

    setIsGenerating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert("Usuário não autenticado");
        return;
      }

      // Chamar a função para gerar lista de compras
      const response = await fetch("/api/shopping-lists/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          days: daysNumber,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao gerar lista de compras");
      }

      const result = await response.json();

      alert("Lista de compras gerada com sucesso!");
      router.refresh();

    } catch (error: any) {
      console.error("Erro ao gerar lista:", error);

      // Melhorar a mensagem de erro para o usuário
      let errorMessage = "Erro ao gerar lista de compras";

      if (error.message) {
        if (error.message.includes("migrations") || error.message.includes("tabelas")) {
          errorMessage = "Erro no banco de dados. As tabelas podem não ter sido criadas ainda. Execute as migrations do Supabase primeiro.";
        } else if (error.message.includes("dieta ativa")) {
          errorMessage = error.message; // Mantém a mensagem original
        } else if (error.message.includes("refeições")) {
          errorMessage = "Sua dieta não possui refeições configuradas. Adicione refeições à sua dieta primeiro.";
        } else if (error.message.includes("produtos")) {
          errorMessage = "Sua dieta não possui produtos configurados. Adicione alimentos às refeições da sua dieta primeiro.";
        } else if (error.message.includes("RLS") || error.message.includes("permissões") || error.message.includes("permission") || error.message.includes("policy")) {
          errorMessage = "Erro de permissões no banco de dados (RLS). Execute o arquivo 'supabase-rls-policies.sql' no SQL Editor do Supabase para configurar as políticas de segurança.";
        } else if (error.message.includes("violates row-level security policy")) {
          errorMessage = "Violação de política de segurança. As políticas RLS não estão configuradas corretamente. Execute o arquivo 'supabase-rls-policies.sql' no Supabase.";
        } else if (error.message.includes("new row violates row-level security policy")) {
          errorMessage = "Não foi possível inserir dados devido a restrições de segurança. Configure as políticas RLS executando o arquivo 'supabase-rls-policies.sql'.";
        } else {
          errorMessage = `Erro: ${error.message}`;
        }
      }

      alert(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const testRLS = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Usuário não autenticado");
        return;
      }

      const response = await fetch("/api/test-rls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Teste RLS concluído:\n\nDiets: ${result.results.diets.success ? '✅ OK' : '❌ ' + result.results.diets.error}\nInsert: ${result.results.insert.success ? '✅ OK' : '❌ ' + result.results.insert.error}\nMeals: ${result.results.meals.success ? '✅ OK' : '❌ ' + result.results.meals.error}`);
      } else {
        alert(`Erro no teste RLS: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Erro ao testar RLS: ${error.message}`);
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={testRLS} variant="outline" size="sm">
        Testar RLS
      </Button>
      <Button onClick={handleGenerateList} disabled={isGenerating}>
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Gerar Lista
          </>
        )}
      </Button>
    </div>
  );
}