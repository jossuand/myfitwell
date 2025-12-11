-- Políticas RLS (Row Level Security) para Myfitwell
-- Execute estes comandos no SQL Editor do Supabase

-- ==================================================
-- POLÍTICAS PARA TABELA: profiles
-- ==================================================

-- Permitir usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Permitir usuários inserirem apenas seu próprio perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ==================================================
-- POLÍTICAS PARA TABELA: diets
-- ==================================================

-- Usuários podem ver suas próprias dietas
CREATE POLICY "Users can view own diets" ON diets
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias dietas
CREATE POLICY "Users can create own diets" ON diets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias dietas
CREATE POLICY "Users can update own diets" ON diets
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias dietas
CREATE POLICY "Users can delete own diets" ON diets
  FOR DELETE USING (auth.uid() = user_id);

-- ==================================================
-- POLÍTICAS PARA TABELA: meals
-- ==================================================

-- Usuários podem ver refeições das suas dietas
CREATE POLICY "Users can view meals from own diets" ON meals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM diets
      WHERE diets.id = meals.diet_id
      AND diets.user_id = auth.uid()
    )
  );

-- Usuários podem criar refeições nas suas dietas
CREATE POLICY "Users can create meals in own diets" ON meals
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM diets
      WHERE diets.id = meals.diet_id
      AND diets.user_id = auth.uid()
    )
  );

-- Usuários podem atualizar refeições das suas dietas
CREATE POLICY "Users can update meals in own diets" ON meals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM diets
      WHERE diets.id = meals.diet_id
      AND diets.user_id = auth.uid()
    )
  );

-- Usuários podem deletar refeições das suas dietas
CREATE POLICY "Users can delete meals in own diets" ON meals
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM diets
      WHERE diets.id = meals.diet_id
      AND diets.user_id = auth.uid()
    )
  );

-- ==================================================
-- POLÍTICAS PARA TABELA: diet_items
-- ==================================================

-- Usuários podem ver itens das suas refeições/dietas
CREATE POLICY "Users can view diet items from own meals" ON diet_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meals
      JOIN diets ON diets.id = meals.diet_id
      WHERE meals.id = diet_items.meal_id
      AND diets.user_id = auth.uid()
    )
  );

-- Usuários podem criar itens nas suas refeições
CREATE POLICY "Users can create diet items in own meals" ON diet_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM meals
      JOIN diets ON diets.id = meals.diet_id
      WHERE meals.id = diet_items.meal_id
      AND diets.user_id = auth.uid()
    )
  );

-- Usuários podem atualizar itens das suas refeições
CREATE POLICY "Users can update diet items in own meals" ON diet_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM meals
      JOIN diets ON diets.id = meals.diet_id
      WHERE meals.id = diet_items.meal_id
      AND diets.user_id = auth.uid()
    )
  );

-- Usuários podem deletar itens das suas refeições
CREATE POLICY "Users can delete diet items in own meals" ON diet_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM meals
      JOIN diets ON diets.id = meals.diet_id
      WHERE meals.id = diet_items.meal_id
      AND diets.user_id = auth.uid()
    )
  );

-- ==================================================
-- POLÍTICAS PARA TABELA: shopping_lists
-- ==================================================

-- Usuários podem ver suas próprias listas de compras
CREATE POLICY "Users can view own shopping lists" ON shopping_lists
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias listas de compras
CREATE POLICY "Users can create own shopping lists" ON shopping_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias listas de compras
CREATE POLICY "Users can update own shopping lists" ON shopping_lists
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar suas próprias listas de compras
CREATE POLICY "Users can delete own shopping lists" ON shopping_lists
  FOR DELETE USING (auth.uid() = user_id);

-- ==================================================
-- POLÍTICAS PARA TABELA: shopping_list_items
-- ==================================================

-- Usuários podem ver itens das suas listas de compras
CREATE POLICY "Users can view items from own shopping lists" ON shopping_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- Usuários podem criar itens nas suas listas de compras
CREATE POLICY "Users can create items in own shopping lists" ON shopping_list_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- Usuários podem atualizar itens das suas listas de compras
CREATE POLICY "Users can update items in own shopping lists" ON shopping_list_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- Usuários podem deletar itens das suas listas de compras
CREATE POLICY "Users can delete items in own shopping lists" ON shopping_list_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM shopping_lists
      WHERE shopping_lists.id = shopping_list_items.shopping_list_id
      AND shopping_lists.user_id = auth.uid()
    )
  );

-- ==================================================
-- POLÍTICAS PARA TABELA: product_bases
-- ==================================================

-- Produtos base são públicos (visíveis para todos)
CREATE POLICY "Product bases are public" ON product_bases
  FOR SELECT USING (true);

-- Apenas administradores podem criar produtos base
-- (Você pode ajustar isso conforme necessário)
CREATE POLICY "Admins can create product bases" ON product_bases
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Apenas administradores podem atualizar produtos base
CREATE POLICY "Admins can update product bases" ON product_bases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ==================================================
-- POLÍTICAS PARA TABELA: user_products
-- ==================================================

-- Usuários podem ver seus próprios produtos
CREATE POLICY "Users can view own products" ON user_products
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem criar seus próprios produtos
CREATE POLICY "Users can create own products" ON user_products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios produtos
CREATE POLICY "Users can update own products" ON user_products
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios produtos
CREATE POLICY "Users can delete own products" ON user_products
  FOR DELETE USING (auth.uid() = user_id);

-- ==================================================
-- POLÍTICAS PARA TABELA: measurement_units
-- ==================================================

-- Unidades de medida são públicas
CREATE POLICY "Measurement units are public" ON measurement_units
  FOR SELECT USING (true);

-- Apenas administradores podem gerenciar unidades
CREATE POLICY "Admins can manage measurement units" ON measurement_units
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ==================================================
-- HABILITAR RLS NAS TABELAS
-- ==================================================

-- Execute estes comandos para habilitar RLS em cada tabela:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE diets ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE diet_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_bases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE measurement_units ENABLE ROW LEVEL SECURITY;