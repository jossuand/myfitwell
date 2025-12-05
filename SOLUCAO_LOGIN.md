# 🔧 Solução para Problema de Login

## Problema Identificado

O login está funcionando no cliente (criando sessão), mas o servidor (middleware/layouts) não está reconhecendo a sessão. Isso geralmente acontece por:

1. **Cookies não estão sendo salvos corretamente**
2. **Cookies não estão sendo lidos pelo servidor**
3. **Problema de sincronização entre cliente e servidor**

## Solução Imediata

### 1. Acesse a Página de Debug

Acesse: **http://localhost:3001/debug-auth**

Esta página:
- ✅ Não requer autenticação
- ✅ Mostra o estado da sessão no CLIENTE
- ✅ Permite testar login diretamente
- ✅ Mostra todos os cookies

### 2. O que verificar na página de debug:

#### ✅ Se a Sessão existe (getSession):
- Deve mostrar `access_token` e `user`
- Se não aparecer, os cookies não estão sendo salvos

#### ✅ Se o Usuário existe (getUser):
- Deve mostrar `id` e `email`
- Se não aparecer, há problema de autenticação

#### ✅ Cookies:
- Deve mostrar cookies com nomes como `sb-xxxxx-auth-token`
- Se não aparecer, os cookies não estão sendo salvos

### 3. Teste de Login na Página de Debug

1. Clique em "Testar Login"
2. Digite email e senha
3. Veja se a sessão aparece após o login
4. Clique em "Recarregar Página"
5. Veja se a sessão persiste após reload

## Possíveis Problemas e Soluções

### Problema 1: Cookies não estão sendo salvos

**Sintoma:** Sessão aparece após login mas desaparece após reload

**Solução:**
1. Verifique se está usando `http://localhost:3001` (não `https://`)
2. Verifique se há bloqueador de cookies ativo
3. Tente em aba anônima
4. Verifique as configurações do navegador

### Problema 2: Variáveis de ambiente incorretas

**Sintoma:** Erro "Invalid API key" ou sessão não persiste

**Solução:**
1. Verifique `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

2. Certifique-se de usar a porta correta (3001)
3. Reinicie o servidor após alterar `.env.local`

### Problema 3: Domínio do Supabase incorreto

**Sintoma:** Cookies não são salvos porque o domínio está errado

**Solução:**
1. No Supabase, vá em **Settings** > **API**
2. Verifique se a URL está correta
3. Não deve ter `/` no final da URL

## Teste Passo a Passo

1. **Acesse:** http://localhost:3001/debug-auth
2. **Veja o estado atual** (provavelmente sem sessão)
3. **Clique em "Testar Login"**
4. **Digite suas credenciais**
5. **Veja se a sessão aparece**
6. **Clique em "Recarregar Página"**
7. **Veja se a sessão persiste**

### Se a sessão aparecer mas não persistir:

Isso indica problema com cookies. Tente:
- Limpar todos os cookies
- Usar aba anônima
- Verificar extensões do navegador

### Se a sessão não aparecer nem após login:

Isso indica problema com as credenciais do Supabase. Verifique:
- `.env.local` está correto?
- Servidor foi reiniciado após alterar `.env.local`?
- As credenciais estão corretas no Supabase?

## Próximos Passos

Após acessar `/debug-auth`, me informe:

1. **O que aparece na seção "Sessão"?**
   - Tem `access_token`?
   - Tem `user`?

2. **O que aparece na seção "Usuário"?**
   - Tem `id` e `email`?

3. **O que aparece na seção "Cookies"?**
   - Tem cookies do Supabase?

4. **Após clicar em "Testar Login", a sessão aparece?**

5. **Após recarregar, a sessão persiste?**

Com essas informações, posso identificar exatamente onde está o problema!

