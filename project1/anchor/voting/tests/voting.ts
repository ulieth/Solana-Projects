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

  let context;
  let provider;
  let votingProgram;

  before(async ()=>{
    context = await startAnchor("", [{name: "voting", programId: votingAddress}], []);

    // Create a Bankrun provider to interact with the blockchain
	  provider = new BankrunProvider(context);

    votingProgram = new Program<Voting>(IDL, provider);

  })


  it("Initialize poll", async () => {

    await votingProgram.methods.initializePoll(
      new anchor.BN(1), // pollId
      new anchor.BN(0), // pollStart
      new anchor.BN(1843257847), // pollEnd
      "What is your favorite type of peanut butter?"
    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log(poll);

    expect(poll.pollId.toNumber()).equal(1);
    expect(poll.description).equal("What is your favorite type of peanut butter?");
    expect(poll.pollStart.toNumber()).lessThan(poll.pollEnd.toNumber());


  });
  it("Initialize candidate", async () => {

    await votingProgram.methods.initializeCandidate(
      "Crunchy",
      new anchor.BN(1),
    ).rpc();

    await votingProgram.methods.initializeCandidate(
      "Smooth",
      new anchor.BN(1),
    ).rpc();

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Crunchy")],
      votingAddress,
    );
    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);
    console.log(crunchyCandidate);
    expect(crunchyCandidate.candidateVotes.toNumber()).equal(0);

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Smooth")],
      votingAddress,
    );
    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);
    console.log(smoothCandidate);
    expect(smoothCandidate.candidateVotes.toNumber()).equal(0);

  });


  it("vote", async () => {
    await votingProgram.methods.vote(
      "Smooth",
      new anchor.BN(1),
    ).rpc();

  });





});
