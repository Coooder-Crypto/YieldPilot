# YieldPilot

Turn StableLayer baseline yield into autonomous, policy-driven growth.

YieldPilot transforms baseline yield into versioned treasury policies, deterministic execution plans, and auditable proposal payloads.  
It gives operators a transparent control loop from policy authoring to dashboard observability.  
It is safe by default: AI never holds private keys and outputs proposals for explicit approval, not auto-execution.

## Stack

- Next.js (App Router) + TailwindCSS
- TypeScript
- Prisma + SQLite/Postgres
- Sui RPC (mainnet/testnet)

## Quick Start

```bash
npm install
cp .env.example .env
npm run db:up
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Demo Flow (MVP)

1. Open landing page and enter console.
2. Create a policy from `/policy/new`.
3. Generate a plan from `/plan/new`.
4. Build and inspect proposal JSON from `/plan/[id]` and `/proposals`.

## Environment Variables

Use `.env`:

```bash
DATABASE_URL="postgresql://yieldpilot:yieldpilot@localhost:5432/yieldpilot?schema=public"
OPENAI_API_KEY=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SUI_NETWORK="testnet"
SUI_RPC_MAINNET_URL="https://fullnode.mainnet.sui.io:443"
SUI_RPC_TESTNET_URL="https://fullnode.testnet.sui.io:443"
```
