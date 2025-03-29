import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Keypair, PublicKey } from "@solana/web3.js";

// run anchor test --skip-local-validator --skip-deploy


const IDL = require("../target/idl/voting.json");
const votingAddress = new PublicKey("DktGyhvAUezSrYXfK5LVsgmXBsUsCrGsAvgctzqGMZTb");
describe("voting", () => {


  it("Initialize poll", async () => {
    const context = await startAnchor("", [{name: "voting", programId: votingAddress}], []);

	  const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(IDL, provider);
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      new anchor.BN(0),
      new anchor.BN(1843257847),
      "Test Poll Description"
    ).rpc();

  });
});
