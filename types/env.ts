export type SuiNetwork = "mainnet" | "testnet";

export type AppEnv = {
  databaseUrl: string;
  appUrl: string;
  suiNetwork: SuiNetwork;
  suiRpcMainnetUrl: string;
  suiRpcTestnetUrl: string;
};
