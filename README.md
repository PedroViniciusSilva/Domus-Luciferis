# Domus-Luciferis

Projeto frontend + backend para o templo Domus Luciferis.

## Requisitos

- Node.js 20+
- pnpm (recomendado) ou npm

## Instalação

1. Instale as dependências:
   ```bash
   npx pnpm install --no-frozen-lockfile
   ```
2. Copie o arquivo de exemplo de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Ajuste os valores do arquivo `.env` antes de iniciar o projeto.

## Variáveis de ambiente

```env
ADMIN_TOKEN=@Domus930324
VITE_ADMIN_KEY=@Domus930324
CORS_ORIGIN=http://localhost:3000
PORT=3001
```

- `ADMIN_TOKEN`: token usado para autenticar as rotas administrativas de doações.
- `VITE_ADMIN_KEY`: senha usada pelas telas de administração do frontend.
- `CORS_ORIGIN`: origem permitida para CORS. Em desenvolvimento, normalmente fica `http://localhost:3000`.
- `PORT`: porta do backend.

## Scripts

```bash
npx pnpm run dev
npx pnpm run build
npx pnpm run check
```

## Observações de segurança

- A chave administrativa não é exibida em logs do servidor.
- O backend aplica limites de requisição e cabeçalhos de segurança básicos.
- O armazenamento de cadastros continua em `data/donations.json` para manter compatibilidade com a estrutura atual.
