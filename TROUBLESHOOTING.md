# 🔧 Guia de Solução de Problemas - Login

## Problema: Não consigo fazer login após criar conta

### Possíveis Causas e Soluções

#### 1. Email não foi verificado

**Sintoma:** Erro "Email not confirmed" ou redirecionamento para `/verify-email`

**Solução:**
1. Verifique sua caixa de entrada (e spam) por um email do Supabase
2. Clique no link de verificação no email
3. Após verificar, tente fazer login novamente

**Desabilitar verificação de email (apenas para desenvolvimento):**
1. No Supabase Dashboard, vá em **Authentication** > **Settings**
2. Desative "Enable email confirmations"
3. ⚠️ **Atenção:** Isso é apenas para desenvolvimento. Em produção, mantenha ativado!

#### 2. Perfil não foi criado

**Sintoma:** Login funciona mas não consegue acessar o dashboard

**Solução:**
1. Verifique no Supabase se o perfil foi criado:
   - Vá em **Table Editor** > `profiles`
   - Procure pelo `id` do usuário (mesmo ID da tabela `auth.users`)

2. Se o perfil não existe, crie manualmente:
```sql
-- Substitua 'user-id-aqui' pelo ID do usuário de auth.users
INSERT INTO profiles (id, full_name)
VALUES ('user-id-aqui', 'Nome do Usuário');
```

3. Verifique se a role foi criada:
```sql
-- Verificar roles
SELECT * FROM user_roles WHERE user_id = 'user-id-aqui';

-- Se não existe, criar:
INSERT INTO user_roles (user_id, role, is_active)
VALUES ('user-id-aqui', 'client', true);
```

#### 3. Variáveis de ambiente incorretas

**Sintoma:** Erro "Invalid API key" ou "Failed to fetch"

**Solução:**
1. Verifique o arquivo `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

2. Certifique-se de usar a chave **anon/public**, não a service_role

3. Reinicie o servidor após alterar `.env.local`:
```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

#### 4. Problemas com cookies/sessão

**Sintoma:** Login funciona mas perde a sessão rapidamente

**Solução:**
1. Limpe os cookies do navegador
2. Tente em uma aba anônima
3. Verifique se há bloqueadores de cookies ativos

#### 5. Verificar logs do Supabase

1. No Supabase Dashboard, vá em **Logs** > **Auth Logs**
2. Verifique se há erros relacionados ao login
3. Verifique os logs da aplicação no terminal

## Teste Rápido

Execute este código no SQL Editor do Supabase para verificar se tudo está correto:

```sql
-- Verificar usuários
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar perfis
SELECT p.id, p.full_name, u.email, u.email_confirmed_at
FROM profiles p
JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 5;

-- Verificar roles
SELECT ur.*, u.email
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
ORDER BY ur.created_at DESC
LIMIT 5;
```

## Criar Usuário Admin Manualmente

Se precisar criar um usuário admin:

```sql
-- 1. Obter o ID do usuário
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- 2. Criar role admin (substitua 'user-id' pelo ID acima)
INSERT INTO user_roles (user_id, role, is_active)
VALUES ('user-id', 'admin', true)
ON CONFLICT DO NOTHING;
```

## Contato

Se o problema persistir:
1. Verifique o console do navegador (F12) para erros
2. Verifique o terminal onde o servidor está rodando
3. Verifique os logs do Supabase

