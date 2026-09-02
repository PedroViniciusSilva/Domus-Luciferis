# Domus Luciferis

Aplicação web do Templo Domus Luciferis, com páginas institucionais, agenda,
rituais, Goetia, portal de doações e painéis administrativos.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou pnpm 10

## Instalação

```bash
npm install
```

Crie um arquivo `.env` na raiz do projeto:

```env
ADMIN_TOKEN=defina-uma-senha-forte
PORT=3000
```

O arquivo `.env` não deve ser versionado. A senha administrativa é usada
somente pelo servidor e pode ser alterada dentro dos painéis administrativos,
informando a senha atual e a nova senha.

## Desenvolvimento

Inicie frontend e API juntos:

```bash
npm run dev
```

O frontend ficará disponível em `http://localhost:3000`. A API local roda em
`http://localhost:3001` e é acessada pelo frontend através do proxy `/api`.

Outros comandos úteis:

```bash
npm run check   # checagem TypeScript
npm run build   # build de produção
npm run preview # pré-visualização do frontend compilado
```

## Produção

Gere os artefatos e inicie o servidor Node:

```bash
npm install
npm run build
npm start
```

O servidor usa a variável `PORT` fornecida pelo ambiente de hospedagem. Se ela
não existir, a porta padrão será `3000`.

O build gera:

- `dist/public`: frontend compilado
- `dist/index.js`: servidor Express empacotado

O servidor Express entrega o frontend, as rotas da aplicação e a API no mesmo
processo. A hospedagem deve executar um serviço Node persistente, e não apenas
servir arquivos estáticos.

## Dados de doações

Os cadastros são armazenados em `data/donations.json`. Em produção, configure
armazenamento persistente e backups desse diretório; sistemas de arquivos
efêmeros podem apagar os cadastros após um redeploy ou reinicialização.

Os dados de doações contêm informações pessoais. Restrinja o acesso ao painel,
use HTTPS na hospedagem e mantenha a variável `ADMIN_TOKEN` somente no ambiente
do servidor.

## Painel administrativo

O acesso administrativo é validado pela API usando `ADMIN_TOKEN`. As áreas
administrativas incluem:

- Cadastros de doações
- Inventário e movimentações
- Agenda, vídeos e fotos

Depois de entrar, use **Alterar senha** para informar a senha atual e cadastrar
uma nova senha. Não coloque a senha em arquivos do frontend nem em variáveis
com prefixo `VITE_`, pois essas variáveis são enviadas ao navegador.

## Publicação

Na plataforma escolhida:

1. Aponte o projeto para o repositório.
2. Use `npm install` como instalação.
3. Use `npm run build` como build.
4. Use `npm start` como comando de inicialização.
5. Configure `ADMIN_TOKEN` e `PORT` como variáveis secretas do serviço.
6. Habilite armazenamento persistente para `data/`.
7. Ative HTTPS e configure o domínio da aplicação.

Antes de publicar, valide localmente:

```bash
npm run check
npm audit
npm run build
```
