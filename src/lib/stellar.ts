import {
  SorobanRpc,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Contract,
  nativeToScVal,
  Address,
  xdr,
  scValToNative,
} from "@stellar/stellar-sdk";

const RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";

const CONTRACT_ID =
  process.env.NEXT_PUBLIC_NOTIFY_CONTRACT_ID ?? "";

const NETWORK_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ??
  Networks.TESTNET;

export const rpc = new SorobanRpc.Server(RPC_URL, { allowHttp: false });

export const contract = new Contract(CONTRACT_ID);

export async function buildTx(
  sourceAddress: string,
  operation: xdr.Operation
) {
  const account = await rpc.getAccount(sourceAddress);
  return new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();
}

/** Simulate a read-only contract call and decode the result. */
export async function simulateRead<T>(
  operation: xdr.Operation
): Promise<T> {
  const account = await rpc.getAccount(CONTRACT_ID); // dummy source for sim
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const sim = await rpc.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(sim)) {
    throw new Error(`Simulation failed: ${sim.error}`);
  }
  const result = (sim as SorobanRpc.Api.SimulateTransactionSuccessResponse).result;
  if (!result) throw new Error("No result from simulation");
  return scValToNative(result.retval) as T;
}

/** Convert a channel string to on-chain ScVal enum. */
export function channelToScVal(channel: "Webhook" | "InApp" | "OnChain") {
  return xdr.ScVal.scvVec([
    xdr.ScVal.scvSymbol(channel),
  ]);
}
