# Grounds — Guia de Campo do Café ☕

Um guia de campo para o apreciador de café curioso. O **Grounds** combina conteúdo educativo sobre café — a sua história, origens, métodos de processamento, técnicas de extração, química da água, equipamento e níveis de torra — com um **Coffee Journal** pessoal para registar cafés e extrações, um **Taste Quiz** para descobrir o teu perfil de sabor, e o **Mr. Beanie**, um chatbot assistente com AI que responde a perguntas sobre café e ajuda a preencher o teu journal.

## Tech Stack

- **[Next.js 16](https://nextjs.org/)** (App Router) + **React 18** — framework full-stack
- **MySQL** via [`mysql2`](https://www.npmjs.com/package/mysql2) — persistência de dados (SQL puro, sem ORM)
- **Autenticação personalizada** — hashing de passwords com [`bcryptjs`](https://www.npmjs.com/package/bcryptjs) + session cookies JWT com [`jose`](https://www.npmjs.com/package/jose)
- **Google Gemini** via [`@google/genai`](https://www.npmjs.com/package/@google/genai) — chatbot com AI, com respostas em streaming e function calling
- **[`zod`](https://www.npmjs.com/package/zod)** — validação de schemas · **[`react-markdown`](https://www.npmjs.com/package/react-markdown)** — renderização das respostas do chatbot
- CSS puro (sem framework), organizado em `app/styles/`

## Pré-requisitos

- **Node.js** 18.18 ou superior (recomendado 20+)
- **npm** (incluído com o Node.js)
- Um servidor **MySQL** em execução (local ou remoto)
- Uma **API key do Google Gemini** — gratuita, criada em [Google AI Studio](https://aistudio.google.com/apikey)

## Instalação

1. **Clonar o repositório**

   ```bash
   git clone https://github.com/TimacDev/Grounds.git
   cd Grounds
   ```

2. **Instalar as dependências**

   ```bash
   npm install
   ```

3. **Criar a base de dados**

   O schema completo e os dados de exemplo estão em [`bd.txt`](bd.txt). Executa-o no teu servidor MySQL:

   ```bash
   mysql -u root -p < bd.txt
   ```

   Isto cria a base de dados `coffee_db` com cinco tabelas (`users`, `coffees`, `comments`, `coffee_ratings`, `brew_logs`) e preenche-a com cafés, brew logs e ratings de exemplo.

4. **Configurar as variáveis de ambiente**

   Cria um ficheiro `.env` na raiz do projeto — ver [Variáveis de Ambiente](#variáveis-de-ambiente) abaixo.

5. **Executar a aplicação**

   ```bash
   npm run dev
   ```

   A aplicação fica disponível em [http://localhost:3000](http://localhost:3000).

   Para um build de produção:

   ```bash
   npm run build
   npm start
   ```

## Variáveis de Ambiente

Todas as variáveis vão num ficheiro `.env` na raiz do projeto (ignorado pelo git).

| Variável | Descrição | Exemplo |
| --- | --- | --- |
| `DB_HOST` | Host do servidor MySQL | `localhost` |
| `DB_PORT` | Porta do servidor MySQL | `3306` |
| `DB_USER` | Nome de utilizador MySQL | `root` |
| `DB_PASSWORD` | Password do MySQL | `your_mysql_password` |
| `DB_NAME` | Nome da base de dados — tem de corresponder ao schema em `bd.txt` | `coffee_db` |
| `AUTH_SECRET` | Secret usado para assinar os JWTs de sessão. — a aplicação lança um erro sem ele. Gera um com `openssl rand -base64 32` | `a-long-random-string` |
| `GEMINI_API_KEY` | API key do Google Gemini, usada pelo chatbot | `AIza...` |

Exemplo de `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=coffee_db
AUTH_SECRET=paste-a-long-random-string-here -- DISPONIVEL NO PDF, ultima página
GEMINI_API_KEY=your-gemini-api-key
```

## Visão Funcional & Como Testar

O Grounds é uma single-page app: o ecrã inicial dá acesso a uma shell com tabs, onde cada tab é uma funcionalidade. Abaixo está o que cada área faz e como experimentá-la.

### Página inicial
Abre [http://localhost:3000](http://localhost:3000) e clica no ecrã inicial para entrar na aplicação (com som 🔊).

### Secções do guia
As tabs **History**, **Origins**, **Processing**, **Brew**, **Water**, **Hardware** e **Roast** contêm conteúdo educativo navegável — perfis de origem por região, instruções passo a passo de métodos de extração (pour-over, espresso, French press, AeroPress, cold brew…), química da água, equipamento e níveis de torra.

> **Teste:** navega por cada tab e expande os cartões de conteúdo. Numa janela estreita (ou em mobile), a navegação colapsa num menu hamburger — redimensiona o browser para verificar.

### Taste Quiz
Um quiz curto que traduz as tuas preferências num perfil de sabor de café.

> **Teste:** abre a tab **Quiz**, responde às perguntas e confirma que é apresentada uma recomendação de perfil no final.

### Contas (registo / login)
Autenticação personalizada com email + password. As sessões são guardadas num cookie httpOnly e permanecem válidas durante 7 dias.

> **Teste:** abre a tab **Login**, cria uma conta nova através do formulário de registo, faz login e depois atualiza a página — deves continuar autenticado. Faz logout e confirma que o journal volta a ficar inacessível.

### My Coffee Journal *(requer login)*
O teu registo pessoal: regista cafés (roaster, origem, processamento, nível de torra…), avalia-os, comenta-os e cria brew logs (método, dose, moagem, notas de prova) associados aos teus cafés. As entradas podem ser editadas e eliminadas. O seed da base de dados já inclui cafés e extrações de exemplo para explorar.

> **Teste:** com login feito, abre a tab **Journal** — adiciona um café, dá-lhe um rating, deixa um comentário e depois cria um brew log para ele. Edita e elimina uma entrada para confirmar o ciclo CRUD completo.

### Chatbot Mr. Beanie 🤖
Um assistente AI flutuante (canto inferior) alimentado pelo Google Gemini. As respostas chegam em streaming com efeito de máquina de escrever e renderizam Markdown. Através de function calling, o bot também consegue pré-preencher os formulários do journal por ti.

> **Teste:** clica no botão do Mr. Beanie e faz uma pergunta sobre café (ex.: *"Qual é a diferença entre processamento washed e natural?"*) — a resposta deve aparecer progressivamente. Com login feito, experimenta *"regista-me um café: um natural da Etiópia do roaster X"* e vê o formulário do café a ser pré-preenchido.


## Estrutura do Projeto

```
├── app/
│   ├── api/          # Rotas da API: auth, coffees, brew-logs, chat (streaming), lógica do bot
│   ├── styles/       # Todo o CSS (importado em layout.js — sem estilos inline)
│   ├── layout.js     # Layout raiz, fontes, estilos globais
│   └── page.js       # Ecrã inicial + shell da aplicação com tabs
├── components/       # Componentes de UI (guias, quiz, journal, chatbot, auth…)
├── data/             # Conteúdo estático (origens, métodos de extração)
├── lib/              # Helpers de servidor: db pool, auth/sessão, validação
├── public/           # Assets estáticos (mascote, ícones, sons)
└── bd.txt            # Schema MySQL + dados de seed
```

## Autores

**Grupo** — Danilo Quintal & Tiago Machado

Repositório: [https://github.com/TimacDev/Grounds](https://github.com/TimacDev/Grounds)
