# YieldPilot

StableLayer makes yield programmable. YieldPilot makes it survivable.

YieldPilot is a stress-testing and strategy-validation layer for StableLayer treasury policies.  
Instead of blindly optimizing yield, it answers one hard question: will this strategy survive under stress?  
It is safe by default: AI suggests and explains, humans approve proposals.

## Problem

StableLayer makes yield programmable, but strategy allocation is still mostly manual:
- spreadsheets
- intuition
- forum sentiment
- ad-hoc governance debate

Yield is programmable. Strategy is not.

Protocols usually do not fail because yield is too low.  
They fail because capital allocation is fragile under stress.

## Hackathon Focus

One sharp loop only:

1. Load current policy + snapshot
2. Run stress scenarios (`APY down`, `redeem up`, `cap pressure`)
3. Produce risk score + alerts + adjustment recommendation
4. Generate a new policy proposal (manual approval flow)

## Product Positioning

YieldPilot is not a treasury manager.  
YieldPilot is a survival engine for programmable stablecoin treasuries.

What we emphasize:
- Survival Score
- Stress Lab
- Strategy Diff
- Governance Proposal

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

1. Open `/console` and enter stress validation.
2. Open `/stress-test` and run three shocks.
3. Inspect `/stress-test/result` for score, runway drop, and key alerts.
4. Generate a policy vNext proposal draft from recommendation.
5. Save and audit proposal history in `/proposals`.

## Judge Memory Hooks

- StableLayer makes yield programmable. YieldPilot makes it survivable.
- Every treasury has a strategy. Few know if it survives stress.

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
