import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// Configure Aptos client for testnet
const config = new AptosConfig({
  network: Network.TESTNET
});

// Create and export the configured client
export const aptos = new Aptos(config); 