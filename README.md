# Domus Luciferis

Aplicacao web do Templo Domus Luciferis, com paginas institucionais, rituais,
Goetia, agenda, cadastro de cestas/doacoes e paineis administrativos.

## Requisitos

- Node.js 20 ou superior
- npm 10 ou pnpm 10

## Instalar e executar

```bash
npm install
npm run dev
```

O desenvolvimento inicia o frontend Vite em `http://localhost:3000` e a API
Express em `http://localhost:3001`. O frontend encaminha `/api` para a API.
Se necessario, defina `API_PORT` para alterar a porta da API local.

Para producao:

```bash
npm install
npm run check
npm run build
npm start
```

Em producao, o Express entrega o frontend compilado e a API no mesmo processo.
A porta vem de `PORT` (padrao `3000`). A hospedagem deve executar um servico
Node persistente; nao basta publicar somente `dist/public`.

## Variaveis de ambiente

Crie `.env` na raiz apenas para desenvolvimento ou configure as variaveis no
provedor de hospedagem:

```env
ADMIN_TOKEN=defina-uma-senha-forte
PORT=3000
```

`ADMIN_TOKEN` e usado somente no servidor. Nunca coloque essa senha em codigo
do frontend ou em uma variavel `VITE_*`. O arquivo `.env` esta no `.gitignore`.
Em producao, configure uma senha forte diretamente como segredo da plataforma.

## Validacao antes do deploy

Execute todos os comandos abaixo antes de publicar:

```bash
npm run check
npm run build
npm audit --omit=dev
```

O `npm run check` valida o TypeScript e o `npm run build` gera o frontend e o
servidor. O comando `npm audit --omit=dev` verifica vulnerabilidades das
dependencias usadas em producao.

## Estrutura

```text
.
├── client/
│   ├── public/              # imagens e arquivos publicos
│   └── src/
│       ├── components/      # layout e componentes reutilizaveis
│       │   └── ui/          # componentes visuais baseados em Radix UI
│       ├── contexts/        # contextos React, como o tema
│       ├── data/            # conteudo estatico da aplicacao
│       │   └── daemons/     # dados individuais da Goetia
│       ├── hooks/            # hooks React personalizados
│       ├── lib/             # utilitarios do frontend
│       └── pages/           # telas e rotas
├── data/                    # dados persistentes gerados pelo servidor
├── patches/                 # patches aplicados pelo pnpm
├── server/                  # API Express e inicializacao
├── shared/                  # constantes compartilhadas
├── dist/                    # artefatos gerados, nao editar manualmente
├── client/index.html        # documento de entrada do Vite
├── package.json             # scripts e dependencias
├── tsconfig.json            # TypeScript da aplicacao
├── tsconfig.node.json       # TypeScript da configuracao do Vite
└── vite.config.ts           # aliases, proxy e configuracao do build
```

### Arquivos principais

- `client/src/App.tsx`: providers e rotas.
- `client/src/pages/Home.tsx`: pagina inicial.
- `client/src/pages/Presentation.tsx`: apresentacao institucional.
- `client/src/pages/Rituals.tsx`: catalogo de rituais.
- `client/src/pages/Goetia.tsx` e `EntityDetail.tsx`: Goetia e detalhes.
- `client/src/pages/Schedule.tsx`: agenda, conteudo editorial e inventario.
- `client/src/pages/Members.tsx`: cadastro de cestas e painel de cadastros.
- `client/src/pages/AdminDonations.tsx`: painel de inventario.
- `server/index.ts`: API, autenticacao, validacoes, CSV e arquivos estaticos.
- `shared/const.ts`: constantes compartilhadas.
- `data/donations.json`: cadastros de cestas, criado em execucao.

## Rotas

| Rota | Finalidade |
| --- | --- |
| `/` | Pagina inicial |
| `/apresentacao` | Apresentacao institucional |
| `/rituais` | Catalogo publico e edicao administrativa de rituais |
| `/goetia` | Lista de entidades |
| `/goetia/:slug` | Detalhes de uma entidade |
| `/cronograma` | Agenda |
| `/doacoes` | Doacoes e cadastro de cestas |
| `/admin/doacoes` | Painel administrativo |

As rotas `/schedule`, `/produtos`, `/shop` e `/membros` permanecem disponiveis
para compatibilidade com links antigos.

## API

- `POST /api/admin/login`: autentica o administrador.
- `POST /api/admin/change-password`: altera a senha.
- `POST /api/donations`: cria cadastro validado.
- `GET /api/admin/donations`: lista cadastros.
- `PATCH /api/admin/donations/:id`: atualiza cadastro e observacoes.
- `DELETE /api/admin/donations/:id`: remove cadastro.
- `GET /api/admin/donations/export`: exporta CSV.

As rotas administrativas usam `Authorization: Bearer <token>`, com o token
retornado pelo endpoint de login.

Na rota `/rituais`, o administrador autenticado pode adicionar, editar e
excluir rituais, alterar valores, descricoes, categorias e imagens/videos. As
alteracoes dessa tela ficam no `localStorage` do navegador administrativo.
Para usar: abra `/rituais`, clique em **Acesso Admin**, informe o
`ADMIN_TOKEN` e use os botoes de novo, edicao e exclusao exibidos no catalogo.
Tambem e possivel trocar a senha pelo painel; em hospedagens com filesystem
somente leitura, altere o segredo diretamente nas configuracoes do provedor.

Na rota `/goetia`, o administrador autenticado pode adicionar, editar e
excluir daemons, alterar dados, correspondencias, poderes, imagem e sigilo.
O campo de categoria permite criar novas vertentes sem alterar o codigo das
abas. Esses registros ficam no `localStorage` do navegador administrativo,
preparados para uma futura migracao para a API.

## Dados, persistencia e seguranca

- Cadastros de cestas ficam em `data/donations.json`.
- Inventario, agenda, videos, fotos, rituais e daemons administrativos ficam no `localStorage`
  do navegador e nao sao sincronizados entre dispositivos.
- Em producao, use armazenamento persistente e backup para `data/`.
- Use HTTPS e restrinja o acesso ao painel administrativo.
- Nunca versionar `.env`, tokens ou dados pessoais.
- A troca de senha grava o novo token no `.env` quando esse arquivo existe.
  Em plataformas que nao permitem escrita no disco, altere `ADMIN_TOKEN` pelo
  painel da plataforma em vez de usar a troca de senha durante a execucao.

## Publicacao

### Render

O arquivo `render.yaml` ja esta preparado para criar um Web Service com:

- `ADMIN_TOKEN` como segredo informado no painel do Render;
- `PORT` fornecida automaticamente pelo Render;
- disco persistente de 1 GB montado em `/opt/render/project/src/data`;
- build com `npm install`, `npm run check` e `npm run build`;
- inicializacao com `npm start`;
- health check na rota `/`;
- HTTPS e certificado gerenciados automaticamente pelo Render.

Para publicar:

1. Envie o repositorio para o GitHub.
2. No Render, selecione **New > Blueprint** e escolha o repositorio.
3. Confirme o servico definido em `render.yaml`.
4. Informe um valor forte para `ADMIN_TOKEN` quando solicitado.
5. Aguarde o build e abra a URL `https://...onrender.com`.
6. Em **Settings > Environment**, confirme que `ADMIN_TOKEN` esta definido.
7. Em **Disks**, confirme o disco montado em `data/`.
8. Use a URL HTTPS fornecida pelo Render; nao e necessario configurar certificado manualmente.

O Render injeta `PORT` automaticamente. Nao fixe `PORT` no painel, a menos que a
documentacao do provedor indique o contrario.

### Checklist pos-publicacao

Valide manualmente:

1. `/`
2. `/doacoes`
3. `/goetia`
4. `/admin/doacoes`
5. cadastro de uma cesta com dados de teste;
6. login administrativo com `ADMIN_TOKEN`;
7. consulta, edicao, exportacao e exclusao do cadastro de teste;
8. remocao do cadastro de teste antes de liberar o site.

O build gera `dist/public/` (frontend) e `dist/index.js` (servidor).
