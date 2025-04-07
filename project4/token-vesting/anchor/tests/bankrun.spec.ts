import { PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { startAnchor, ProgramTestContext, BanksClient } from 'solana-bankrun';

import IDL from '../target/idl/tokenvesting.json';
import { SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system';
import { BankrunProvider } from 'anchor-bankrun';
import { Program } from '@coral-xyz/anchor';
import { Tokenvesting } from '../target/types/tokenvesting';
import { createMint } from 'spl-token-bankrun';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';

describe("Vesting Smart Contract Tests", () => {

  let beneficiary: Keypair;
  let context: ProgramTestContext;
  let provider: BankrunProvider;
  let program: Program<Tokenvesting>;
  let banksClient: BanksClient;
  let employer: Keypair;
  let mint: PublicKey;
  let beneficiaryProvider : BankrunProvider;
  let program2: Program<Tokenvesting>;
  let vestingAccountKey: PublicKey;
  const companyName = "companyName";
  let treasuryTokenAccount: PublicKey;
  let employeeAccount: PublicKey;

  beforeAll(async () => {
    beneficiary = new anchor.web3.Keypair();
    // Start a bankrun in an Anchor workspace, with all the workspace programs deployed.
    // This will spin up a BanksServer and a BanksClient, deploy programs and add accounts as instructed.
    context  = await startAnchor( "", [
        {name: "tokenvesting", programId: new PublicKey(IDL.address) } // the smart contract we're deploying
      ],
      [
        {
          address: beneficiary.publicKey,
          info: {
            lamports: 1_000_000_000,
            owner: SYSTEM_PROGRAM_ID,
            data: Buffer.alloc(0),
            executable: false,
          }
        }
      ],
    );

    provider = new BankrunProvider(context);
    anchor.setProvider(provider);

    program = new Program<Tokenvesting>(IDL as Tokenvesting, provider);

    banksClient = context.banksClient;

    employer = provider.wallet.payer;

    mint = await createMint(
      banksClient,
      employer,
      employer.publicKey,
      null,
      2, // decimals
    );

    beneficiaryProvider = new BankrunProvider(context);
    beneficiaryProvider.wallet = new NodeWallet(beneficiary);

    program2 = new Program<Tokenvesting>(IDL as Tokenvesting, beneficiaryProvider);

    // Deriving PDAs
    [vestingAccountKey] = PublicKey.findProgramAddressSync(
      [Buffer.from(companyName)],
      program.programId
    );
    [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("vesting_treasury"), Buffer.from(companyName)],
      program.programId
    );
    [employeeAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("employee_vesting"), beneficiary.publicKey.toBuffer(), vestingAccountKey.toBuffer()],
      program.programId
    );

  });









});
