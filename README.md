# YieldPilot

> StableLayer makes yield programmable. YieldPilot makes it survivable.

YieldPilot is a **treasury survivability simulator and strategy validation layer** for StableLayer economies.  
It does not try to "auto-print yield." It answers the harder question:

**Will this treasury strategy survive under stress?**

---

## 1. Product Positioning

### 1.1 One-liner

YieldPilot is a treasury survival simulator and strategy validation layer.

### 1.2 Problem We Solve

Many protocols still make treasury allocation decisions with:
- spreadsheets,
- intuition,
- social sentiment,
- ad-hoc governance debates.

The issue is not whether yield exists.
The issue is:

**Yield is programmable. Strategy is not validated.**

### 1.3 Core Narrative (Hackathon)

- StableLayer turns stablecoin yield into programmable cash flow.
- YieldPilot makes that cash flow allocation survivable.

Judge memory hook:
- Every treasury has a strategy. Few know if it survives stress.

---

## 2. Scope Implemented Today (Actual State)

### 2.1 Implemented

- 4-page demo loop:
  - `/console`
  - `/stress-test`
  - `/stress-test/result`
  - `/proposal/new`
- Proposal audit path:
  - `/proposals`
  - `/proposals/[id]`
- Deterministic stress engine (replayable)
- Risk scoring (`score + level + signals + recommendations`)
- Risk-driven policy vNext generation
- Governance proposal JSON generation (Sui-style payload)
- PostgreSQL + Prisma persistence
- `SUI_NETWORK=mainnet|testnet` support (payload network + config)

### 2.2 Intentionally Not Implemented Yet

- On-chain auto-execution (current mode generates payload only)
- SiliconFlow online inference integration (current recommendations are rule-engine-based)
- Move contract deployment and governance executor

---

## 3. Product Flow

```mermaid
flowchart LR
    A[Console\nRead Baseline] --> B[Stress Test\nSelect Policy + Snapshot]
    B --> C[Result\nRisk Score + Signals]
    C --> D[Generate Draft\nPolicy vNext]
    D --> E[Proposal\nActions + Payload]
    E --> F[History\nAudit Trail]
```

### 3.1 3-Minute Demo Script

1. Open `/console` and show baseline health via visual metrics.
2. Go to `/stress-test`, choose policy + snapshot, and run simulation.
3. In `/stress-test/result`, present risk level, top signals, and post-shock changes.
4. Generate vNext draft and open `/proposal/new` to show allocation diff + payload.
5. Save and review `/proposals` and `/proposals/[id]` as auditable governance trail.

---

## 4. Architecture

### 4.1 Logical Architecture

```mermaid
graph TD
    UI[Next.js App Router UI] --> SA[Server Actions]
    SA --> SS[Service Layer]
    SS --> RL[Risk & Stress Lib]
    SS --> PR[Prisma Repositories]
    PR --> DB[(PostgreSQL)]
    SS --> PB[Proposal Builder]
    PB --> SJ[Sui-style JSON Payload]
```

### 4.2 Decision Loop (Core Value)

```mermaid
flowchart TD
    I[Input Baseline] --> S[Scenario Simulation]
    S --> R[Risk Scoring]
    R --> G[Guided Recommendation]
    G --> V[Versioned Policy vNext]
    V --> P[Governance Proposal]
    P --> H[History & Audit]
```

### 4.3 Key Modules

- Stress simulation
  - `lib/stress/runStressTest.ts`
- Risk scoring
  - `lib/risk/computeRiskScore.ts`
- Recommendation application
  - `lib/policy/applyRecommendation.ts`
- Proposal builder
  - `lib/proposal/buildProposal.ts`
- Service orchestration
  - `server/services/stress-service.ts`
  - `server/services/recommendation-service.ts`
  - `server/services/proposal-service.ts`
- Persistence
  - `server/db/repositories/*`
  - `prisma/schema.prisma`

---

## 5. Project Structure

```text
.
├── app/                          # Next.js routes and UI components
│   ├── console/                  # Baseline dashboard
│   ├── stress-test/              # Stress config + result
│   ├── proposal/new/             # Proposal draft page
│   ├── proposals/                # Proposal history + detail
│   └── components/               # Reusable UI components
├── lib/                          # Pure logic (stress/risk/policy/proposal/schema)
├── server/                       # Service and repository layer
├── prisma/                       # Prisma schema/migrations/seed
├── docker-compose.yml            # Local PostgreSQL
├── ITERATIONS.md                 # Hackathon iteration plan
├── NARRATIVE.md                  # Narrative notes
└── TODO.md                       # Original product notes
```

---

## 6. Local Setup

### 6.1 Prerequisites

- Node.js 20+
- Docker
- npm (or pnpm)

### 6.2 Environment Variables

Copy template:

```bash
cp .env.example .env
```

Default `.env.example`:

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

Notes:
- Core app flow currently runs without SiliconFlow API key.
- `SUI_NETWORK` supports `mainnet` and `testnet`.

### 6.3 Start Database + Initialize

```bash
npm install
npm run db:up
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

### 6.4 Run App

```bash
npm run dev
```

Open: `http://localhost:3000`

---

## 7. Commands

```bash
npm run dev          # local development
npm run build        # production build
npm run start        # run production server
npm run lint         # ESLint
npm run db:up        # start PostgreSQL container
npm run db:down      # stop PostgreSQL container
npm run db:generate  # generate Prisma Client
npm run db:migrate   # run Prisma migration
npm run db:seed      # seed demo data
```

---

## 8. Stress Scenarios and Risk Output

Default scenarios in `server/services/stress-service.ts`:
- `APY Down 50%`
- `Redeem 2x`
- `Cap Utilization 90%`

Risk output includes:
- `score` (0-100)
- `level` (LOW / MEDIUM / HIGH)
- `topSignals`
- `recommendations`

Design goals:
- Deterministic output (same input -> same output)
- Explainable signals
- Replayability for demo and audit

---

## 9. Sui Notes

Current Sui-focused implementation is **governance payload modeling**:
- Build action list from allocation diff
- Output `payload.network` and command list
- Support `mainnet/testnet` switch

Example output (simplified):

```json
{
  "metadata": { "type": "POLICY_UPDATE_PROPOSAL" },
  "actions": [
    { "type": "UPDATE_ALLOCATION", "bucket": "reserve", "from": 0.2, "to": 0.35 },
    { "type": "SWITCH_ACTIVE_POLICY", "fromPolicyId": "...", "toPolicyId": "..." }
  ],
  "payload": {
    "network": "testnet",
    "txKind": "programmableTransaction",
    "module": "yieldpilot::governance",
    "commands": []
  }
}
```

---

## 10. Troubleshooting

### 10.1 Missing `DATABASE_URL`

If Prisma reports:
- `Environment variable not found: DATABASE_URL`

Check:
1. `cp .env.example .env` has been executed.
2. `DATABASE_URL` exists in `.env`.
3. PostgreSQL is running (`npm run db:up`).

### 10.2 Prisma Deprecated Config Warning

This project already includes `prisma.config.ts`. If warning persists, regenerate client:

```bash
npm run db:generate
```

### 10.3 Docker DB Not Reachable

Check containers:

```bash
docker ps
```

Restart DB:

```bash
npm run db:down
npm run db:up
```

---

## 11. Pitch Lines (Ready to Use)

- StableLayer makes yield programmable. YieldPilot makes it survivable.
- We do not automate treasury blindly. We validate survivability first, then generate auditable governance proposals.
- This is not an AI toy. This is a risk-aware decision loop for programmable stablecoin treasuries.

---

## 12. Post-Hackathon Roadmap

1. Add real Sui transaction build/sign/broadcast flow.
2. Integrate SiliconFlow for richer narrative explanations.
3. Add historical backtesting imports and trend comparison.
4. Add role model (`operator / reviewer / signer`) and audit logs.

---

## 13. License

No license declared yet. Add MIT or Apache-2.0 if open-sourcing.
