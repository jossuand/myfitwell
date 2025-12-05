# 🔍 Diagnóstico de Problemas de Login

## Passos para Diagnosticar

### 1. Verificar se o usuário foi criado no Supabase

Execute no SQL Editor do Supabase:

```sql
-- Ver os últimos usuários criados
SELECT 
  id, 
  email, 
  email_confirmed_at,
  created_at,
  confirmed_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;
```

**O que verificar:**
- ✅ O usuário existe?
- ✅ `email_confirmed_at` está preenchido? (se não, precisa verificar email)
- ✅ `confirmed_at` está preenchido?

### 2. Verificar se o perfil foi criado

```sql
-- Verificar perfis
SELECT 
  p.id, 
  p.full_name, 
  u.email,
  u.email_confirmed_at
FROM profiles p
RIGHT JOIN auth.users u ON p.id = u.id
WHERE u.email = 'seu-email@exemplo.com';
```

**O que verificar:**
- ✅ O perfil existe? (se não, precisa criar manualmente)
- ✅ O `id` do perfil corresponde ao `id` do usuário?

### 3. Verificar se a role foi criada

```sql
-- Verificar roles
SELECT 
  ur.*, 
  u.email
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'seu-email@exemplo.com';
```

**O que verificar:**
- ✅ A role existe?
- ✅ `is_active` está como `true`?
- ✅ A role é `client`?

### 4. Criar perfil/role manualmente (se necessário)

Se o perfil ou role não existir, execute:

```sql
-- Substitua 'USER_ID_AQUI' pelo ID do usuário de auth.users
-- Substitua 'seu-email@exemplo.com' pelo email do usuário

-- 1. Obter o ID do usuário
SELECT id, email FROM auth.users WHERE email = 'seu-email@exemplo.com';

-- 2. Criar perfil (use o ID obtido acima)
INSERT INTO profiles (id, full_name)
VALUES ('USER_ID_AQUI', 'Nome do Usuário')
ON CONFLICT (id) DO NOTHING;

-- 3. Criar role (use o ID obtido acima)
INSERT INTO user_roles (user_id, role, is_active)
VALUES ('USER_ID_AQUI', 'client', true)
ON CONFLICT DO NOTHING;
```

### 5. Verificar configuração de email no Supabase

1. No Supabase Dashboard, vá em **Authentication** > **Settings**
2. Verifique se "Enable email confirmations" está ativado
3. Se estiver ativado e você não recebeu o email:
   - Verifique a caixa de spam
   - Ou desative temporariamente para desenvolvimento

### 6. Testar login diretamente

Tente fazer login novamente e observe:
- Qual mensagem de erro aparece?
- O que aparece no console do navegador (F12)?
- O que aparece no terminal do servidor?

## Solução Rápida: Desabilitar Verificação de Email (Desenvolvimento)

Se você está em desenvolvimento e quer desabilitar a verificação de email:

1. No Supabase Dashboard: **Authentication** > **Settings**
2. Desative "Enable email confirmations"
3. Salve as alterações
4. Tente fazer login novamente

⚠️ **Importante:** Reative a verificação de email antes de ir para produção!

## Solução Rápida: Criar Perfil/Role Manualmente

Execute no SQL Editor do Supabase:

```sql
-- Substitua pelo email do seu usuário
WITH user_data AS (
  SELECT id, email, raw_user_meta_data->>'full_name' as full_name
  FROM auth.users 
  WHERE email = 'seu-email@exemplo.com'
)
INSERT INTO profiles (id, full_name)
SELECT id, COALESCE(full_name, 'Usuário') 
FROM user_data
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- Criar role
WITH user_data AS (
  SELECT id FROM auth.users WHERE email = 'seu-email@exemplo.com'
)
INSERT INTO user_roles (user_id, role, is_active)
SELECT id, 'client', true 
FROM user_data
ON CONFLICT DO NOTHING;
```

