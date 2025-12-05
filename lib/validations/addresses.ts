import { z } from "zod";

export const addressSchema = z.object({
  address_type: z.enum(["residential", "delivery", "billing", "office"]),
  is_primary: z.boolean().optional(),
  zip_code: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  street: z.string().min(1, "Logradouro é obrigatório"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().length(2, "UF deve ter 2 caracteres"),
  country: z.string().default("BR"),
});

export type AddressInput = z.infer<typeof addressSchema>;

