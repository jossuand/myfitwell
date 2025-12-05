"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UtensilsCrossed, Edit, Eye } from "lucide-react";
import Link from "next/link";

interface Diet {
  id: string;
  name: string;
  objective: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

interface DietListProps {
  diets: Diet[];
}

const objectiveLabels: Record<string, string> = {
  weight_loss: "Emagrecer",
  weight_gain: "Ganhar Peso",
  muscle_gain: "Ganhar Massa",
  maintenance: "Manter",
  health_improvement: "Melhorar Saúde",
  disease_management: "Gerenciar Doença",
};

export default function DietList({ diets }: DietListProps) {
  if (diets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma dieta cadastrada</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Comece criando sua primeira dieta
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {diets.map((diet) => (
        <Card key={diet.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{diet.name}</CardTitle>
              </div>
              {diet.is_active && <Badge>Ativa</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Objetivo: {objectiveLabels[diet.objective] || diet.objective}
            </p>
            <p className="text-sm text-muted-foreground">
              Início: {new Date(diet.start_date).toLocaleDateString("pt-BR")}
            </p>
            {diet.end_date && (
              <p className="text-sm text-muted-foreground">
                Término: {new Date(diet.end_date).toLocaleDateString("pt-BR")}
              </p>
            )}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/diets/${diet.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/diets/${diet.id}/edit`}>
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

