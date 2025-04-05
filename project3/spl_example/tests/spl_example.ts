import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SplExample } from "../target/types/spl_example";
import { Connection, PublicKey } from "@solana/web3.js";
import * as splToken from "@solana/spl-token";

describe("spl_example", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.splExample as Program<SplExample>;

  let signer1 = anchor.web3.Keypair.generate();
  let signer2 = anchor.web3.Keypair.generate();

  before(async () => {
    // Airdrop SOL to signer1 to cover rent and transaction fees
    await airdrop(program.provider.connection, signer1.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
    // Airdrop SOL to signer2
    await airdrop(program.provider.connection, signer2.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
  });

  it("Is initialized!", async () => {

   let [vault_data, bump_a] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault_data"), signer1.publicKey.toBuffer()],
    program.programId,
   );

   let [new_mint, bump_m] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), signer1.publicKey.toBuffer()],
    program.programId,
   );

   // Associated Token Address
   let new_vault = splToken.getAssociatedTokenAddressSync(new_mint, vault_data, true);

   const tx = await program.methods.initialize().accounts({
    signer: signer1.publicKey,
    vaultData: vault_data,
    newMint: new_mint,
    newVault: new_vault,
    systemProgram: anchor.web3.SystemProgram.programId,
    tokenProgram: splToken.TOKEN_PROGRAM_ID,
    associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID
   }).signers([signer1]).rpc();
   console.log("Your transaction signature", tx);
   console.log("Vault Data: ", vault_data.toString());
   console.log("New Mint: ", new_mint.toString());
   console.log("New Vault: ", new_vault.toString());
   console.log("Signer: ", signer1.publicKey.toString());
  });



  it("Grab", async () => {

   let [vault_data, bump_a] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault_data"), signer1.publicKey.toBuffer()],
    program.programId,
   );

   let [new_mint, bump_m] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), signer1.publicKey.toBuffer()],
    program.programId,
   );

   // Associated Token Address
   let new_vault = splToken.getAssociatedTokenAddressSync(new_mint, vault_data, true);

   let signer_vault = await splToken.createAssociatedTokenAccount(
    program.provider.connection,
    signer2,
    new_mint,
    signer2.publicKey,
   )

   const tx = await program.methods.grab().accounts({
    signer: signer2.publicKey,
    vaultData: vault_data,
    mint: new_mint,
    newVault: new_vault,
    signerVault: signer_vault,
    tokenProgram: splToken.TOKEN_PROGRAM_ID,
   }).signers([signer2]).rpc();
   console.log("Your transaction signature", tx);
   console.log("Vault Data: ", vault_data.toString());
   console.log("New Mint: ", new_mint.toString());
   console.log("New Vault: ", new_vault.toString());
   console.log("Signer vault: ", signer_vault.toString());
  });
});


export async function airdrop(
  connection: Connection,
  address: PublicKey,
  amount: number,
) {
  await connection.confirmTransaction(
    await connection.requestAirdrop(address, amount),
    "confirmed",
  );
}
