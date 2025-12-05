# 🚀 Guia de Início Rápido - Myfitwell

## Passo a Passo para Iniciar o Sistema

### 1. Verificar Pré-requisitos ✅

Certifique-se de ter instalado:
- **Node.js 18+** (você tem v24.7.0 ✅)
- **npm** (você tem v11.5.1 ✅)

### 2. Instalar Dependências

Se ainda não instalou as dependências, execute:

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

#### 3.1. Obter Credenciais do Supabase

1. Acesse o [painel do Supabase](https://app.supabase.com)
2. Selecione seu projeto (ou crie um novo)
3. Vá em **Settings** > **API**
4. Copie:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

#### 3.2. Criar Arquivo .env.local

Crie o arquivo `.env.local` na raiz do projeto:

```bash
cp .env.local.example .env.local
```

Ou crie manualmente o arquivo `.env.local` com o seguinte conteúdo:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

**⚠️ IMPORTANTE:** Substitua os valores pelos dados reais do seu projeto Supabase!

### 4. Configurar Supabase Storage (Opcional, mas Recomendado)

Para que o upload de fotos de perfil funcione:

1. No painel do Supabase, vá em **Storage**
2. Crie um bucket chamado `profile-pictures`
3. Configure as políticas de acesso conforme necessário

### 5. Iniciar o Servidor de Desenvolvimento

Execute o comando:

```bash
npm run dev
```

O servidor iniciará em: **http://localhost:3000**

### 6. Acessar o Sistema

1. Abra o navegador em: **http://localhost:3000**
2. Você será redirecionado para a página de login
3. Crie uma nova conta ou faça login

### 7. Criar Primeiro Usuário Admin (Opcional)

Para acessar a área administrativa, você precisa:

1. Criar uma conta normal
2. No Supabase, acesse a tabela `user_roles`
3. Adicione um registro:
   - `user_id`: ID do usuário criado
   - `role`: `admin`
   - `is_active`: `true`

Ou execute no SQL Editor do Supabase:

```sql
-- Substitua 'user-id-aqui' pelo ID do usuário
INSERT INTO user_roles (user_id, role, is_active)
VALUES ('user-id-aqui', 'admin', true);
```

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar em produção
npm start

# Verificar erros de lint
npm run lint
```

## ⚠️ Problemas Comuns

### Erro: "Invalid API key"
- Verifique se as credenciais no `.env.local` estão corretas
- Certifique-se de usar a chave **anon/public**, não a service_role

### Erro: "Failed to fetch"
- Verifique se o Supabase está acessível
- Confirme que a URL do projeto está correta

### Erro ao fazer upload de foto
- Certifique-se de que o bucket `profile-pictures` foi criado no Supabase Storage
- Verifique as políticas de acesso do bucket

### Página em branco
- Verifique o console do navegador (F12) para erros
- Verifique o terminal onde o servidor está rodando
- Certifique-se de que todas as dependências foram instaladas

## 📚 Próximos Passos

Após iniciar o sistema:

1. ✅ Criar sua primeira conta
2. ✅ Completar o perfil
3. ✅ Adicionar endereços
4. ✅ (Admin) Cadastrar produtos base
5. ✅ Cadastrar produtos específicos
6. ✅ Criar sua primeira dieta

## 🆘 Precisa de Ajuda?

- Verifique o arquivo `README.md` para mais informações
- Consulte a documentação do [Supabase](https://supabase.com/docs)
- Consulte a documentação do [Next.js](https://nextjs.org/docs)

