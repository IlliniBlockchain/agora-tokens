import { AnchorProvider } from "@coral-xyz/anchor";
import getDemoProgram from "./get-demo-program";
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

// Return all tokens to be displayed on the home page
export default async function getTokens(connection, wallet) {
  const commitment = "processed";
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: commitment,
  });

  const demoProgram = await getDemoProgram(provider);

  let arr = [];

  //get protocol acc
  const [protocolPDA] = PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("protocol")],
    demoProgram.programId
  );

  let protState = await demoProgram.account.protocol.fetch(protocolPDA);

  //loop through ticker accounts
  for (let i = protState.numTickers - 1; i >= 0; i--) {
    //grab PDA
    const [tickerAccPDA] = PublicKey.findProgramAddressSync(
      [anchor.utils.bytes.utf8.encode("ticker"), new Uint8Array([i])],
      demoProgram.programId
    );

    let tickerState = await demoProgram.account.ticker.fetch(tickerAccPDA);

    arr.push({
      image: tickerState.image,
      name: tickerState.name,
      ticker: tickerState.ticker,
      description: tickerState.description,
      badges: tickerState.badges,
      id: i, //for querying dispute PDA
    });
  }

  return arr;
}
