# 🏦 TCC Company: Finance

App web de finanças pessoais com foco em **diversificação de investimentos**, **calculadora de juros compostos** e **acompanhamento do mercado de ações em tempo real**.

> 🌐 **Acesse online:** [https://vinibuffalo.github.io/tcc-finance-v2/](https://vinibuffalo.github.io/tcc-finance-v2/)

---

## 📸 Funcionalidades

| Tela | Descrição |
|------|-----------|
| 🔐 **Login/Cadastro** | Registro e autenticação de usuários |
| 📊 **Dashboard** | Resumo do patrimônio, indicadores (Selic, CDI, IPCA) |
| 🧮 **Calculadora** | Juros compostos com IR, cenários rápidos, gráfico de evolução |
| 💼 **Diversificação** | Cadastro de ativos, score de diversificação, gráficos |
| 📈 **Mercado** | Cotações B3 em tempo real, histórico de preços |

---

## 🛠️ Tecnologias

- **Vite** — Build tool e dev server
- **JavaScript** (ES Modules) — Lógica do app
- **CSS** — Design system dark mode customizado
- **Chart.js** — Gráficos interativos
- **Firebase Auth** — Autenticação de usuários
- **Firebase Firestore** — Banco de dados na nuvem
- **brapi.dev** — API de ações brasileiras

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- Conta no [Firebase](https://console.firebase.google.com/) (para banco de dados)

### 1. Clonar o repositório

```bash
git clone https://github.com/ViniBuffalo/tcc-finance-v2.git
cd tcc-finance-v2
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar o Firebase (opcional, mas recomendado)

Sem o Firebase, o app funciona normalmente usando `localStorage` (dados ficam apenas no navegador). Com o Firebase, os dados ficam salvos na nuvem.

#### Passo a passo do Firebase:

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"** e crie um projeto (ex: `tcc-finance`)
3. No painel do projeto, clique em **"Web"** (ícone `</>`) para registrar o app
4. Copie as credenciais que aparecem (apiKey, authDomain, etc.)
5. Ainda no Firebase Console, vá em **Authentication → Sign-in method** e ative **"E-mail/senha"**
6. Vá em **Firestore Database → Criar banco de dados** → selecione **"Iniciar no modo de teste"**

#### Criar o arquivo `.env`:

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o `.env` com as credenciais do seu projeto Firebase:

```env
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=tcc-finance.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tcc-finance
VITE_FIREBASE_STORAGE_BUCKET=tcc-finance.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

### 4. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

O app abre em `http://localhost:3000`

---

## 📦 Deploy no GitHub Pages

### 1. Build de produção

```bash
npm run build
```

### 2. Publicar no GitHub Pages

```bash
git add dist -f
git commit -m "deploy: atualização do site"
git subtree push --prefix dist origin gh-pages
```

### 3. Configurar o GitHub Pages (só na primeira vez)

1. Acesse: **Settings → Pages** no repositório
2. Em **Source**: selecione **"Deploy from a branch"**
3. Em **Branch**: selecione **`gh-pages`** e pasta **`/ (root)`**
4. Clique **"Save"**

Após 1-2 minutos, o site estará disponível em:
`https://vinibuffalo.github.io/tcc-finance-v2/`

---

## 📁 Estrutura do Projeto

```
tcc-finance-v2/
├── index.html              # Página HTML principal
├── package.json            # Dependências do projeto
├── vite.config.js          # Configuração do Vite
├── .env.example            # Template das variáveis de ambiente
├── .gitignore              # Arquivos ignorados pelo Git
├── public/
│   └── favicon.svg         # Ícone do site
└── src/
    ├── main.js             # Ponto de entrada do app
    ├── router.js           # Roteador SPA (hash-based)
    ├── components/         # Componentes reutilizáveis
    │   ├── Header.js       # Cabeçalho com menu hamburger
    │   ├── Modal.js        # Diálogos modais
    │   ├── Sidebar.js      # Menu lateral de navegação
    │   └── Toast.js        # Notificações toast
    ├── pages/              # Páginas do app
    │   ├── Calculator.js   # Calculadora de juros compostos
    │   ├── Dashboard.js    # Painel principal
    │   ├── Diversification.js # Diversificação de investimentos
    │   ├── Login.js        # Tela de login/cadastro
    │   └── Stocks.js       # Mercado de ações
    ├── services/           # Camada de serviços
    │   ├── api.js          # Integração com brapi.dev (ações)
    │   ├── auth.js         # Autenticação (Firebase + fallback)
    │   ├── calculations.js # Cálculos financeiros
    │   ├── firebase.js     # Configuração do Firebase
    │   └── storage.js      # Persistência de dados (Firestore + fallback)
    ├── styles/             # Design system CSS
    │   ├── base.css        # Reset e utilitários
    │   ├── components.css  # Estilos de componentes
    │   ├── index.css       # Import central
    │   ├── layout.css      # Layout e responsividade
    │   ├── pages.css       # Estilos por página
    │   └── variables.css   # Tokens de design (cores, fontes)
    └── utils/              # Utilitários
        ├── constants.js    # Constantes do app
        └── formatters.js   # Formatação (moeda, data, %)
```

---

## 💾 Banco de Dados

### Com Firebase (recomendado)
- **Firebase Auth**: Gerencia cadastro e login de usuários
- **Firestore**: Salva ativos e investimentos na nuvem
- Dados sincronizados em qualquer dispositivo
- Funciona mesmo após limpar o navegador

### Sem Firebase (fallback)
- Dados armazenados no `localStorage` do navegador
- Funciona offline, sem configuração
- ⚠️ Dados perdidos se limpar o navegador

---

## 👨‍💻 Autor

**ViniBuffalo** — [GitHub](https://github.com/ViniBuffalo)

---

## 📄 Licença

Este projeto é para fins acadêmicos (TCC).
