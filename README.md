# YieldPilot

StableLayer makes yield programmable. YieldPilot makes it survivable.

YieldPilot is a stress-testing and strategy-validation layer for StableLayer treasury policies.  
Instead of blindly optimizing yield, it answers one hard question: will this strategy survive under stress?  
It is safe by default: AI suggests and explains, humans approve proposals.

## Hackathon Focus

One sharp loop only:

1. Load current policy + snapshot
2. Run stress scenarios (`APY down`, `redeem up`, `cap pressure`)
3. Produce risk score + alerts + adjustment recommendation
4. Generate a new policy proposal (manual approval flow)

## Stack

- Next.js (App Router) + TailwindCSS
- TypeScript
- Prisma + PostgreSQL (Docker local)
- Sui RPC (mainnet/testnet)
- SiliconFlow Chat Completions (`Pro/deepseek-ai/DeepSeek-R1`)

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

## Demo Story (3 minutes)

1. Show active policy and current treasury state.
2. Click `Stress Test` and run three shocks.
3. Show risk result: score, runway drop, key alerts.
4. Apply recommendation to produce policy vNext.
5. Generate proposal JSON for governance signing.

## Environment Variables

Use `.env`:

```bash
DATABASE_URL="postgresql://yieldpilot:yieldpilot@localhost:5432/yieldpilot?schema=public"
SILICONFLOW_API_KEY=""
SILICONFLOW_BASE_URL="https://api.siliconflow.cn/v1"
SILICONFLOW_MODEL="Pro/deepseek-ai/DeepSeek-R1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
SUI_NETWORK="testnet"
SUI_RPC_MAINNET_URL="https://fullnode.mainnet.sui.io:443"
SUI_RPC_TESTNET_URL="https://fullnode.testnet.sui.io:443"
```

