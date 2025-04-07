import { PublicKey, Keypair } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { startAnchor, ProgramTestContext, BanksClient } from 'solana-bankrun';

import IDL from '../target/idl/tokenvesting.json';
import { SYSTEM_PROGRAM_ID } from '@coral-xyz/anchor/dist/cjs/native/system';
import { BankrunProvider } from 'anchor-bankrun';
import { BN, Program } from '@coral-xyz/anchor';
import { Tokenvesting } from '../target/types/tokenvesting';
import { createMint, mintTo } from 'spl-token-bankrun';
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

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
  it("Sould create a vesting account", async () => {
    const tx = await program.methods
      .createVestingAccount(companyName)
      // PDAs are derived automatically
      .accounts({
        signer: employer.publicKey,
        mint,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({commitment: "confirmed"});
      const vestingAccountData = await program.account.vestingAccount.fetch(vestingAccountKey, "confirmed");
      console.log("Vesting Account Data:", vestingAccountData);
      console.log("Create Vesting Account:", tx);
  });

  it("Should fund the treasury token account", async () => {
    const amount = 10_000 * 10 ** 9;
    const mintTx =  await mintTo(
      banksClient,
      employer,
      mint,
      treasuryTokenAccount,
      employer,
      amount
    );
    console.log("Mint Treasury Token Account:", mintTx);
  });


  it("Should create a vesting account for the employee", async () => {
    const tx2 = await program.methods
      .createEmployeeAccount( new BN(0), new BN(100), new BN(0), new BN(100))
      .accounts({
        beneficiary: beneficiary.publicKey,
        vestingAccount: vestingAccountKey,
      }).rpc({commitment: "confirmed", skipPreflight: true});

      console.log("Create Employee Account Tx:", tx2);
      console.log("Employee Account:", employeeAccount.toBase58());
  });









});
