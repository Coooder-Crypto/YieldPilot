# YieldPilot

> StableLayer makes yield programmable. YieldPilot makes it survivable.

YieldPilot 是一个面向 StableLayer 经济体的**策略生存验证层**。  
它不追求“自动赚钱”，而是回答更关键的问题：

**这套策略在压力场景下还能活下来吗？**

---

## 1. 产品定位

### 1.1 一句话

YieldPilot 是一个 treasury survival simulator and strategy validation layer。

### 1.2 我们解决的问题

很多协议在有收益后，仍然用以下方式做分配决策：
- Excel
- 经验判断
- 社区情绪
- 临时治理讨论

问题不在于“有没有收益”，而在于：

**收益可编程，但策略不可验证。**

### 1.3 核心叙事（黑客松版本）

- StableLayer 让收益变成可编程现金流。
- YieldPilot 让这套现金流分配具备生存验证能力。

评委记忆点：
- Every treasury has a strategy. Few know if it survives stress.

---

## 2. 当前实现范围（真实状态）

### 2.1 已实现

- 4 页闭环 Demo：
  - `/console`
  - `/stress-test`
  - `/stress-test/result`
  - `/proposal/new`
- Proposal 审计路径：
  - `/proposals`
  - `/proposals/[id]`
- Deterministic Stress Engine（可回放）
- 风险评分（score + level + signals + recommendations）
- 基于风险建议生成策略 vNext
- 生成治理 proposal JSON（Sui 风格 payload）
- PostgreSQL + Prisma 持久化
- 支持 `SUI_NETWORK=mainnet|testnet`（用于 payload network 与配置）

### 2.2 暂未实现（刻意收敛）

- 链上自动执行交易（当前仅生成 proposal payload，不直接广播交易）
- SiliconFlow 在线推理接入（当前建议逻辑以本地规则引擎为主）
- Move 合约部署与治理执行器

---

## 3. 产品流程

```mermaid
flowchart LR
    A[Console\nRead Baseline] --> B[Stress Test\nSelect Policy + Snapshot]
    B --> C[Result\nRisk Score + Signals]
    C --> D[Generate Draft\nPolicy vNext]
    D --> E[Proposal\nActions + Payload]
    E --> F[History\nAudit Trail]
```

### 3.1 评审演示节奏（3 分钟）

1. 在 `/console` 展示当前健康状态（可视化指标）。
2. 在 `/stress-test` 选择 policy + snapshot，运行压力测试。
3. 在 `/stress-test/result` 展示风险级别、关键信号、场景冲击后变化。
4. 点击生成 vNext 草案，进入 `/proposal/new` 查看 diff 与 payload。
5. 保存提案后去 `/proposals` / `/proposals/[id]` 展示可审计闭环。

---

## 4. 架构设计

### 4.1 逻辑架构图

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

### 4.2 决策闭环图（核心价值）

```mermaid
flowchart TD
    I[Input Baseline] --> S[Scenario Simulation]
    S --> R[Risk Scoring]
    R --> G[Guided Recommendation]
    G --> V[Versioned Policy vNext]
    V --> P[Governance Proposal]
    P --> H[History & Audit]
```

### 4.3 关键模块

- Stress Simulation
  - `lib/stress/runStressTest.ts`
- Risk Scoring
  - `lib/risk/computeRiskScore.ts`
- Recommendation Apply
  - `lib/policy/applyRecommendation.ts`
- Proposal Build
  - `lib/proposal/buildProposal.ts`
- Service Orchestration
  - `server/services/stress-service.ts`
  - `server/services/recommendation-service.ts`
  - `server/services/proposal-service.ts`
- Persistence
  - `server/db/repositories/*`
  - `prisma/schema.prisma`

---

## 5. 目录结构

```text
.
├── app/                          # Next.js 页面与组件
│   ├── console/                  # 基线控制台
│   ├── stress-test/              # 压测配置 + 结果
│   ├── proposal/new/             # 提案草案
│   ├── proposals/                # 提案历史 + 详情
│   └── components/               # 复用UI（stepper、metrics、bilingual brief等）
├── lib/                          # 纯逻辑层（stress/risk/policy/proposal/schema）
├── server/                       # 服务层与仓储层（DB访问、编排）
├── prisma/                       # schema/migrations/seed
├── docker-compose.yml            # 本地 PostgreSQL
├── ITERATIONS.md                 # 黑客松迭代路线
├── NARRATIVE.md                  # 叙事文档
└── TODO.md                       # 原始需求与思路
```

---

## 6. 本地启动

### 6.1 前置要求

- Node.js 20+
- Docker
- npm（或 pnpm）

### 6.2 配置环境变量

复制模板：

```bash
cp .env.example .env
```

默认示例（`.env.example`）：

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

说明：
- 当前代码路径不依赖 SiliconFlow key 才能跑通主流程。
- `SUI_NETWORK` 支持 `mainnet` 与 `testnet`。

### 6.3 启动数据库 + 初始化

```bash
npm install
npm run db:up
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

### 6.4 启动应用

```bash
npm run dev
```

访问：`http://localhost:3000`

---

## 7. 常用命令

```bash
npm run dev          # 开发环境
npm run build        # 生产构建
npm run start        # 启动生产服务
npm run lint         # ESLint
npm run db:up        # 启动 PostgreSQL
npm run db:down      # 停止 PostgreSQL
npm run db:generate  # Prisma Client 生成
npm run db:migrate   # Prisma 迁移
npm run db:seed      # 填充演示数据
```

---

## 8. 风险评分与场景

默认场景定义在 `server/services/stress-service.ts`：
- `APY Down 50%`
- `Redeem 2x`
- `Cap Utilization 90%`

评分产出包括：
- `score`（0-100）
- `level`（LOW / MEDIUM / HIGH）
- `topSignals`
- `recommendations`

设计目标：
- 同输入同输出（deterministic）
- 可解释（signals 可追踪）
- 可回放（用于 demo 与审计）

---

## 9. Sui 相关说明

当前 Sui 相关实现聚焦在**治理提案 payload 建模**：
- 根据策略 diff 生成 actions
- 输出 `payload.network` 与命令列表
- 支持 `mainnet/testnet` 切换

示例输出结构（简化）：

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

## 10. 排障

### 10.1 `DATABASE_URL` 缺失

如果看到 Prisma 报错：
- `Environment variable not found: DATABASE_URL`

请确认：
1. 已执行 `cp .env.example .env`
2. `.env` 中 `DATABASE_URL` 存在
3. Postgres 已启动（`npm run db:up`）

### 10.2 Prisma 配置 deprecated 提示

本项目已使用 `prisma.config.ts`。如果仍看到旧提示，通常是本地缓存或命令环境问题，可重新执行：

```bash
npm run db:generate
```

### 10.3 Docker 已启动但数据库不可用

检查容器：

```bash
docker ps
```

重启：

```bash
npm run db:down
npm run db:up
```

---

## 11. 评审话术（可直接使用）

- StableLayer makes yield programmable. YieldPilot makes it survivable.
- We do not automate treasury blindly. We validate strategy survivability first, then generate auditable governance proposals.
- This is not an AI toy. This is a risk-aware decision loop for programmable stablecoin treasuries.

---

## 12. Roadmap（黑客松后）

1. 接入真实 Sui tx 构建与签名流程。
2. 接入 SiliconFlow 生成更细颗粒度解释文本。
3. 增加策略回测数据导入与长期表现对比。
4. 提供权限模型（operator / reviewer / signer）与审计日志。

---

## 13. License

暂未声明，默认保留所有权利。若开源可后续补充 MIT/Apache-2.0。
