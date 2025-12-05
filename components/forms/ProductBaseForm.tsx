"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productBaseSchema,
  nutritionalInfoSchema,
  type ProductBaseInput,
  type NutritionalInfoInput,
} from "@/lib/validations/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ProductBaseFormProps {
  product?: any;
  categories: any[];
  units: any[];
}

export default function ProductBaseForm({
  product,
  categories,
  units,
}: ProductBaseFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register: registerProduct,
    handleSubmit: handleSubmitProduct,
    formState: { errors: productErrors },
  } = useForm<ProductBaseInput>({
    resolver: zodResolver(productBaseSchema),
    defaultValues: product
      ? {
          name: product.name,
          category_id: product.category_id || "",
          measurement_unit_id: product.measurement_unit_id || "",
          description: product.description || "",
          taco_code: product.taco_code || "",
        }
      : {},
  });

  const {
    register: registerNutrition,
    formState: { errors: nutritionErrors },
  } = useForm<NutritionalInfoInput>({
    resolver: zodResolver(nutritionalInfoSchema),
    defaultValues: product?.nutritional_info || {},
  });

  const onSubmit = async (data: ProductBaseInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let productId = product?.id;

      if (product) {
        // Atualizar produto
        const { error: updateError } = await supabase
          .from("product_bases")
          .update({
            name: data.name,
            category_id: data.category_id || null,
            measurement_unit_id: data.measurement_unit_id || null,
            description: data.description || null,
            taco_code: data.taco_code || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        if (updateError) throw updateError;
        productId = product.id;
      } else {
        // Criar produto
        const { data: newProduct, error: insertError } = await supabase
          .from("product_bases")
          .insert({
            name: data.name,
            category_id: data.category_id || null,
            measurement_unit_id: data.measurement_unit_id || null,
            description: data.description || null,
            taco_code: data.taco_code || null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        productId = newProduct.id;
      }

      // Buscar dados nutricionais do formulário
      const form = document.querySelector("form");
      const formData = new FormData(form as HTMLFormElement);
      const nutritionData: any = {};

      const nutritionFields = [
        "calories",
        "protein",
        "carbohydrates",
        "fiber",
        "total_fat",
        "saturated_fat",
        "trans_fat",
        "sugar",
        "sodium",
        "calcium",
        "iron",
        "magnesium",
        "potassium",
        "zinc",
        "vitamin_a",
        "vitamin_b1",
        "vitamin_b2",
        "vitamin_b3",
        "vitamin_b6",
        "vitamin_b12",
        "vitamin_c",
        "vitamin_d",
        "vitamin_e",
        "vitamin_k",
        "cholesterol",
      ];

      nutritionFields.forEach((field) => {
        const value = formData.get(field);
        if (value && value !== "") {
          nutritionData[field] = parseFloat(value as string);
        }
      });

      // Verificar se já existe informação nutricional
      const { data: existingNutrition } = await supabase
        .from("nutritional_info")
        .select("*")
        .eq("product_base_id", productId)
        .single();

      if (existingNutrition) {
        // Atualizar
        const { error: updateNutritionError } = await supabase
          .from("nutritional_info")
          .update(nutritionData)
          .eq("product_base_id", productId);

        if (updateNutritionError) throw updateNutritionError;
      } else if (Object.keys(nutritionData).length > 0) {
        // Criar
        const { error: insertNutritionError } = await supabase
          .from("nutritional_info")
          .insert({
            product_base_id: productId,
            ...nutritionData,
          });

        if (insertNutritionError) throw insertNutritionError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/admin/products");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar produto");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {product ? "Editar Produto Base" : "Novo Produto Base"}
        </CardTitle>
        <CardDescription>
          Preencha as informações do produto e dados nutricionais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmitProduct(onSubmit)}>
          <Tabs defaultValue="product" className="space-y-4">
            <TabsList>
              <TabsTrigger value="product">Produto</TabsTrigger>
              <TabsTrigger value="nutrition">Informações Nutricionais</TabsTrigger>
            </TabsList>

            <TabsContent value="product" className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>
                    Produto salvo com sucesso! Redirecionando...
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Produto *</Label>
                <Input id="name" {...registerProduct("name")} />
                {productErrors.name && (
                  <p className="text-sm text-destructive">
                    {productErrors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Categoria</Label>
                  <Select id="category_id" {...registerProduct("category_id")}>
                    <option value="">Selecione...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="measurement_unit_id">Unidade de Medida</Label>
                  <Select
                    id="measurement_unit_id"
                    {...registerProduct("measurement_unit_id")}
                  >
                    <option value="">Selecione...</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.abbreviation})
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" {...registerProduct("description")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taco_code">Código TACO</Label>
                <Input id="taco_code" {...registerProduct("taco_code")} />
              </div>
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calorias (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    step="0.1"
                    {...registerNutrition("calories", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="protein">Proteínas (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    step="0.1"
                    {...registerNutrition("protein", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carbohydrates">Carboidratos (g)</Label>
                  <Input
                    id="carbohydrates"
                    type="number"
                    step="0.1"
                    {...registerNutrition("carbohydrates", {
                      valueAsNumber: true,
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_fat">Gorduras Totais (g)</Label>
                  <Input
                    id="total_fat"
                    type="number"
                    step="0.1"
                    {...registerNutrition("total_fat", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fiber">Fibras (g)</Label>
                  <Input
                    id="fiber"
                    type="number"
                    step="0.1"
                    {...registerNutrition("fiber", { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sodium">Sódio (mg)</Label>
                  <Input
                    id="sodium"
                    type="number"
                    step="0.1"
                    {...registerNutrition("sodium", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Outros nutrientes podem ser adicionados posteriormente
              </p>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Produto"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

