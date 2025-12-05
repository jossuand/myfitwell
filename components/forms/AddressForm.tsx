"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, type AddressInput } from "@/lib/validations/addresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { fetchCEP } from "@/lib/api/cep";
import { Loader2 } from "lucide-react";

interface AddressFormProps {
  address?: any;
}

export default function AddressForm({ address }: AddressFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          address_type: address.address_type,
          is_primary: address.is_primary,
          zip_code: address.zip_code,
          street: address.street,
          number: address.number,
          complement: address.complement || "",
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          country: address.country || "BR",
        }
      : {
          address_type: "residential",
          is_primary: false,
          country: "BR",
        },
  });

  const zipCode = watch("zip_code");

  useEffect(() => {
    if (zipCode && zipCode.replace(/\D/g, "").length === 8) {
      handleCEPSearch(zipCode);
    }
  }, [zipCode]);

  const handleCEPSearch = async (cep: string) => {
    setLoadingCEP(true);
    try {
      const data = await fetchCEP(cep);
      if (data) {
        setValue("street", data.logradouro);
        setValue("neighborhood", data.bairro);
        setValue("city", data.localidade);
        setValue("state", data.uf);
      }
    } catch (err) {
      console.error("Erro ao buscar CEP:", err);
    } finally {
      setLoadingCEP(false);
    }
  };

  const onSubmit = async (data: AddressInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Usuário não autenticado");
        return;
      }

      // Se for principal, desmarcar outros como principais
      if (data.is_primary) {
        await supabase
          .from("addresses")
          .update({ is_primary: false })
          .eq("user_id", user.id);
      }

      if (address) {
        // Atualizar
        const { error: updateError } = await supabase
          .from("addresses")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", address.id);

        if (updateError) throw updateError;
      } else {
        // Criar
        const { error: insertError } = await supabase.from("addresses").insert({
          ...data,
          user_id: user.id,
        });

        if (insertError) throw insertError;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/addresses");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Erro ao salvar endereço");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{address ? "Editar Endereço" : "Novo Endereço"}</CardTitle>
        <CardDescription>
          Preencha os dados do endereço abaixo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription>
                Endereço salvo com sucesso! Redirecionando...
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="address_type">Tipo de Endereço</Label>
              <Select
                id="address_type"
                {...register("address_type")}
              >
                <option value="residential">Residencial</option>
                <option value="delivery">Entrega</option>
                <option value="billing">Cobrança</option>
                <option value="office">Escritório</option>
              </Select>
              {errors.address_type && (
                <p className="text-sm text-destructive">
                  {errors.address_type.message}
                </p>
              )}
            </div>

            <div className="flex items-end space-x-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_primary"
                  {...register("is_primary")}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_primary">Endereço principal</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">CEP</Label>
            <div className="relative">
              <Input
                id="zip_code"
                placeholder="00000-000"
                {...register("zip_code")}
                maxLength={9}
              />
              {loadingCEP && (
                <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {errors.zip_code && (
              <p className="text-sm text-destructive">{errors.zip_code.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="street">Logradouro</Label>
              <Input id="street" {...register("street")} />
              {errors.street && (
                <p className="text-sm text-destructive">{errors.street.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input id="number" {...register("number")} />
              {errors.number && (
                <p className="text-sm text-destructive">{errors.number.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input id="complement" {...register("complement")} />
            {errors.complement && (
              <p className="text-sm text-destructive">
                {errors.complement.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input id="neighborhood" {...register("neighborhood")} />
            {errors.neighborhood && (
              <p className="text-sm text-destructive">
                {errors.neighborhood.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input id="city" {...register("city")} />
              {errors.city && (
                <p className="text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">UF</Label>
              <Input id="state" maxLength={2} {...register("state")} />
              {errors.state && (
                <p className="text-sm text-destructive">{errors.state.message}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar Endereço"}
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

