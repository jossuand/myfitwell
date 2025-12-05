# 🧪 Teste de Login - Passo a Passo

## O que foi corrigido:

1. ✅ Mudado `router.push` para `window.location.href` para forçar reload completo
2. ✅ Melhorado verificação de sessão no middleware
3. ✅ Adicionado verificação de sessão nos layouts
4. ✅ Criada página de debug para diagnóstico

## Como testar:

### 1. Reiniciar o servidor

```bash
# Pare o servidor (Ctrl+C) e inicie novamente
npm run dev
```

### 2. Limpar cookies do navegador

- Abra o DevTools (F12)
- Vá em Application > Cookies
- Delete todos os cookies de `localhost:3000`
- Ou use uma aba anônima/privada

### 3. Tentar fazer login novamente

1. Acesse http://localhost:3000
2. Faça login com suas credenciais
3. Observe o que acontece

### 4. Se ainda não funcionar, acesse a página de debug

Acesse: http://localhost:3000/dashboard/debug

Esta página mostrará:
- Se a sessão existe
- Se o usuário está autenticado
- Se o perfil existe
- Se as roles existem

**Envie essas informações para diagnóstico!**

## O que verificar na página de debug:

### ✅ Sessão deve existir:
```json
{
  "access_token": "...",
  "user": { ... }
}
```

### ✅ Usuário deve existir:
```json
{
  "id": "...",
  "email": "..."
}
```

### ✅ Perfil deve existir:
```json
{
  "id": "...",
  "full_name": "..."
}
```

### ✅ Roles devem existir:
```json
[
  {
    "user_id": "...",
    "role": "client",
    "is_active": true
  }
]
```

## Se a sessão não aparecer:

Isso indica que os cookies não estão sendo salvos. Verifique:

1. **Variáveis de ambiente estão corretas?**
   - Verifique `.env.local`
   - Reinicie o servidor após alterar

2. **Bloqueador de cookies?**
   - Desative extensões que bloqueiam cookies
   - Tente em aba anônima

3. **Domínio do Supabase está correto?**
   - Verifique se a URL no `.env.local` está correta
   - Deve ser algo como: `https://xxxxx.supabase.co`

## Se o usuário aparecer mas não conseguir acessar:

1. Verifique se o perfil existe no Supabase
2. Verifique se a role existe
3. Tente acessar diretamente: http://localhost:3000/dashboard/client

## Próximos passos:

Após testar, me informe:
1. O que aparece na página de debug?
2. Consegue acessar `/dashboard/debug`?
3. Qual URL aparece na barra de endereços após o login?
4. Há alguma mensagem de erro no console do navegador?

