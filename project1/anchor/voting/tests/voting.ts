import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Keypair, PublicKey } from "@solana/web3.js";
import { expect } from 'chai';

// run anchor test --skip-local-validator --skip-deploy


const IDL = require("../target/idl/voting.json");
const votingAddress = new PublicKey("DktGyhvAUezSrYXfK5LVsgmXBsUsCrGsAvgctzqGMZTb");
describe("voting", () => {


  it("Initialize poll", async () => {
    const context = await startAnchor("", [{name: "voting", programId: votingAddress}], []);

    // Create a Bankrun provider to interact with the blockchain
	  const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(IDL, provider);
    await votingProgram.methods.initializePoll(
      new anchor.BN(1), // pollId
      new anchor.BN(0), // pollStart
      new anchor.BN(1843257847), // pollEnd
      "Test Poll Description"
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log(poll);

    expect(poll.pollId.toNumber()).equal(1);
    expect(poll.description).equal("Test Poll Description");
    expect(poll.pollStart.toNumber()).lessThan(poll.pollEnd.toNumber());


  });
});
