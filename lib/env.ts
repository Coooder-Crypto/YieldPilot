import type { AppEnv, SuiNetwork } from "@/types/env";

const VALID_NETWORKS: SuiNetwork[] = ["mainnet", "testnet"];

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function parseSuiNetwork(value: string): SuiNetwork {
  if (VALID_NETWORKS.includes(value as SuiNetwork)) {
    return value as SuiNetwork;
  }

  throw new Error(
    `Invalid SUI_NETWORK: "${value}". Expected one of: ${VALID_NETWORKS.join(", ")}.`,
  );
}

export function getAppEnv(): AppEnv {
  return {
    databaseUrl: requireEnv("DATABASE_URL", "file:./dev.db"),
    appUrl: requireEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
    suiNetwork: parseSuiNetwork(requireEnv("SUI_NETWORK", "testnet")),
    suiRpcMainnetUrl: requireEnv(
      "SUI_RPC_MAINNET_URL",
      "https://fullnode.mainnet.sui.io:443",
    ),
    suiRpcTestnetUrl: requireEnv(
      "SUI_RPC_TESTNET_URL",
      "https://fullnode.testnet.sui.io:443",
    ),
  };
}

export function getSuiRpcUrl(env = getAppEnv()): string {
  return env.suiNetwork === "mainnet"
    ? env.suiRpcMainnetUrl
    : env.suiRpcTestnetUrl;
}
