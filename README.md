# Myfitwell - Sistema de Controle de Dietas

Plataforma integrada para gestão completa de dietas, conectando usuários finais, nutricionistas e fornecedores em um ecossistema de saúde e bem-estar alimentar.

## 🚀 Tecnologias

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (Componentes UI)
- **Supabase** (Backend, Auth, Database)
- **React Hook Form** + **Zod** (Formulários e Validação)
- **Lucide React** (Ícones)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Variáveis de ambiente configuradas

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd myfitwell
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.local.example .env.local
```

Edite `.env.local` e adicione:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 📁 Estrutura do Projeto

```
myfitwell/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rotas de autenticação
│   ├── (dashboard)/       # Rotas protegidas
│   │   ├── admin/         # Área administrativa
│   │   └── client/        # Área do cliente
│   └── api/               # API routes
├── components/            # Componentes React
│   ├── ui/                # Componentes shadcn/ui
│   ├── forms/             # Formulários
│   ├── dashboard/         # Componentes de dashboard
│   └── layout/            # Layout components
├── lib/                   # Utilitários e helpers
│   ├── supabase/          # Cliente Supabase
│   ├── validations/       # Schemas Zod
│   └── utils/             # Funções utilitárias
├── hooks/                 # React hooks customizados
└── types/                 # TypeScript types
```

## ✨ Funcionalidades Implementadas (MVP)

### Autenticação
- ✅ Login e registro
- ✅ Verificação de email
- ✅ Proteção de rotas
- ✅ Middleware de autenticação

### Perfil de Usuário
- ✅ CRUD completo de perfil
- ✅ Upload de foto de perfil
- ✅ Dados antropométricos (peso, altura, IMC)
- ✅ Dados de saúde (restrições, alergias, etc.)

### Endereços
- ✅ CRUD de endereços
- ✅ Busca automática por CEP (ViaCEP)
- ✅ Gestão de endereço principal

### Produtos
- ✅ Cadastro de produtos base (Admin)
- ✅ Cadastro de produtos específicos (Usuário)
- ✅ Informações nutricionais
- ✅ Histórico de preços

### Dietas
- ✅ Criação manual de dietas
- ✅ Gestão de refeições
- ✅ Adição de itens às refeições
- ✅ Visualização de dietas

### Estoque
- ✅ Controle de estoque básico
- ✅ Alertas de validade
- ✅ Status de estoque

### Lista de Compras
- ✅ Criação de listas
- ✅ Visualização de itens
- ✅ Marcação de comprados

### Dashboard
- ✅ Dashboard do cliente
- ✅ Dashboard administrativo
- ✅ Gestão de usuários (Admin)

## 🔐 Segurança

- Row Level Security (RLS) será implementado posteriormente
- Todas as rotas protegidas por middleware
- Validação de dados com Zod
- Autenticação via Supabase Auth

## 📝 Próximos Passos

- Implementar políticas RLS no Supabase
- Adicionar geração automática de lista de compras
- Implementar cálculos nutricionais automáticos
- Adicionar gráficos de evolução
- Implementar sistema de notificações
- Adicionar testes automatizados

## 🤝 Contribuindo

Este é um projeto em desenvolvimento. Contribuições são bem-vindas!

## 📄 Licença

[Adicione a licença aqui]

