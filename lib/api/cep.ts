export interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export async function fetchCEP(cep: string): Promise<CEPData | null> {
  try {
    const cleanCEP = cep.replace(/\D/g, "");
    if (cleanCEP.length !== 8) {
      return null;
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    const data: CEPData = await response.json();

    if (data.erro) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao buscar CEP:", error);
    return null;
  }
}

