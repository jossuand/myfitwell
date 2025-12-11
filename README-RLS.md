# Configuração de Políticas RLS (Row Level Security) - Myfitwell

## Problema
Se você está enfrentando erro 500 ao tentar gerar listas de compras, provavelmente as **políticas RLS** não estão configuradas corretamente no Supabase.

## Solução

### Passo 1: Executar as Políticas RLS
1. Abra o **SQL Editor** no seu projeto Supabase
2. Execute o conteúdo do arquivo `supabase-rls-policies.sql`
3. Ou copie e execute cada política individualmente

### Passo 2: Verificar se RLS está habilitado
Execute estes comandos no SQL Editor para garantir que RLS está ativo:

```sql
-- Verificar se RLS está habilitado nas tabelas
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'diets', 'meals', 'diet_items', 'shopping_lists', 'shopping_list_items', 'product_bases', 'user_products', 'measurement_units');
```

Se alguma tabela mostrar `rowsecurity = false`, execute:

```sql
ALTER TABLE nome_da_tabela ENABLE ROW LEVEL SECURITY;
```

### Passo 3: Testar as permissões
1. Clique no botão **"Testar RLS"** na página de listas de compras
2. Verifique se todas as operações retornam ✅ OK

### Políticas Principais Configuradas

#### Shopping Lists
- ✅ Usuários podem ver apenas suas próprias listas
- ✅ Usuários podem criar apenas suas próprias listas
- ✅ Usuários podem atualizar apenas suas próprias listas

#### Diets & Meals
- ✅ Usuários podem acessar apenas suas próprias dietas
- ✅ Refeições são acessíveis apenas pelo dono da dieta

#### Products
- ✅ Produtos base são públicos para leitura
- ✅ Produtos específicos são privados por usuário

## Diagnóstico

### Erro: "violates row-level security policy"
**Causa:** Políticas RLS não configuradas
**Solução:** Execute o arquivo `supabase-rls-policies.sql`

### Erro: "permission denied"
**Causa:** RLS habilitado mas sem políticas adequadas
**Solução:** Configure as políticas específicas para cada tabela

### Teste bem-sucedido mas erro na geração
**Causa:** Problema específico na lógica da API
**Solução:** Verifique se o usuário tem uma dieta ativa criada

## Arquivos relacionados
- `supabase-rls-policies.sql` - Políticas RLS completas
- `/api/test-rls` - Endpoint para testar permissões
- `GenerateShoppingListButton.tsx` - Componente com botão de teste

## Suporte
Se o problema persistir após configurar as políticas RLS:
1. Verifique se o usuário está autenticado
2. Confirme se existe pelo menos uma dieta ativa
3. Teste novamente com o botão "Testar RLS"