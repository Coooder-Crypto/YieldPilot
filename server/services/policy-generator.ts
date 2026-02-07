import { parsePolicy, type PolicyInput } from "@/lib/schemas/policy";
import type { PolicyFormInput } from "@/lib/schemas/policy-form";

type GeneratorResult = {
  policy: PolicyInput;
  mode: "ai" | "fallback";
  retries: number;
};

function extractJsonObject(text: string): string {
  const fenced = text.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) {
    return text.slice(first, last + 1);
  }

  return text.trim();
}

function defaultPolicyTemplate(input: PolicyFormInput): PolicyInput {
  const baseByObjective = {
    growth: { ecosystem: 0.6, buyback: 0.25, reserve: 0.15 },
    defense: { ecosystem: 0.3, buyback: 0.2, reserve: 0.5 },
    balanced: { ecosystem: 0.5, buyback: 0.3, reserve: 0.2 },
  }[input.objective];

  const minShift = input.riskLevel === "low" ? 0.1 : input.riskLevel === "high" ? 0.2 : 0.15;

  return parsePolicy({
    objective: input.objective,
    allocations: {
      ecosystem: { base: baseByObjective.ecosystem, min: 0.2, max: 0.75 },
      buyback: { base: baseByObjective.buyback, min: 0.1, max: 0.5 },
      reserve: { base: baseByObjective.reserve, min: 0.1, max: 0.6 },
    },
    rules: [
      {
        id: "cap-pressure-increase-reserve",
        if: { metric: "instantCapUtilization", op: ">", value: 0.8 },
        then: { bucket: "reserve", delta: minShift },
      },
      {
        id: "net-mint-strong-increase-ecosystem",
        if: { metric: "netMint24h", op: ">", value: 50000 },
        then: { bucket: "ecosystem", delta: minShift / 2 },
      },
    ],
    guards: {
      maxTransferPerEpoch: input.budgetCap,
      treasuryFloor: input.treasuryFloor,
      whitelist: input.whitelist,
    },
    execution: {
      mode: "proposal_only",
      epochHours: input.epochHours,
    },
    metrics: ["runwayDays", "claimableYield", "capUtilization", "netMint24h"],
  });
}

async function generatePolicyWithAI(input: PolicyFormInput): Promise<PolicyInput> {
  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    throw new Error("SILICONFLOW_API_KEY is not configured");
  }

  const model = process.env.SILICONFLOW_MODEL ?? "Pro/deepseek-ai/DeepSeek-R1";
  const baseUrl = process.env.SILICONFLOW_BASE_URL ?? "https://api.siliconflow.cn/v1";

  const prompt = `Generate a treasury policy JSON with strict schema compliance.
Input:
${JSON.stringify(input, null, 2)}
Return JSON only with keys: objective, allocations, rules, guards, execution, metrics.
No markdown, no explanation text.`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a treasury policy generator. Always return valid JSON object only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed with status ${response.status}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI response does not contain choices[0].message.content");
  }

  return parsePolicy(JSON.parse(extractJsonObject(content)));
}

export async function generatePolicyWithRetry(input: PolicyFormInput): Promise<GeneratorResult> {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const policy = await generatePolicyWithAI(input);
      return { policy, mode: "ai", retries: attempt - 1 };
    } catch {
      if (attempt === maxAttempts) break;
    }
  }

  return { policy: defaultPolicyTemplate(input), mode: "fallback", retries: 2 };
}
