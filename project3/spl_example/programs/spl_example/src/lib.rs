// The program mints SPL tokens and stores them in a PDA-owned token account.

use anchor_lang::prelude::*;

use anchor_spl::{
  associated_token::AssociatedToken,
  token::{
    Mint, mint_to, MintTo, Token, TokenAccount, transfer, Transfer,
  }};

declare_id!("HYKuyVuYnTzjK5u9LqojAyFXnz8JmF6QrDJMPzJjzGVf");

#[program]
pub mod spl_example {

    use super::*;


    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
      msg!("Greetings from initialize");
      let vault_data: &mut Account<'_, VaultData> = &mut ctx.accounts.vault_data;
      vault_data.bump = ctx.bumps.vault_data;
      vault_data.creator = ctx.accounts.signer.key();

      // Define PDA Seeds
      let bump:u8 = ctx.bumps.vault_data;
      let signer_key: Pubkey = ctx.accounts.signer.key();
      let signer_seeds: &[&[&[u8]]] = &[&[b"vault_data", signer_key.as_ref(), &[bump]]];

     // Since PDAs have no private keys,
     // they can only sign transactions using the program’s logic
     // and seed-based signature generation.
      let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(), // to which program we are creating a cpi
            MintTo{
              mint: ctx.accounts.new_mint.to_account_info(),
              to: ctx.accounts.new_vault.to_account_info(),
              authority: ctx.accounts.vault_data.to_account_info(),
            }, // accounts
        signer_seeds );

      mint_to(cpi_context, 100)?;
        Ok(())
    }

    pub fn grab(ctx: Context<Grab>) -> Result<()> {
      msg!("Greetings from grab");
      let vault_data: &Account<'_, VaultData> = &ctx.accounts.vault_data;
      // Define PDA Seeds to allow the transfer
      let bump:u8 = vault_data.bump;
      let signer_key: Pubkey = vault_data.creator;
      let signer_seeds: &[&[&[u8]]] = &[&[b"vault_data", signer_key.as_ref(), &[bump]]];

      let cpi_context = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(), // to which program we are creating a cpi
            Transfer {
              from: ctx.accounts.new_vault.to_account_info(),
              to: ctx.accounts.signer_vault.to_account_info(),
              authority: ctx.accounts.vault_data.to_account_info(),
            },
        signer_seeds );

      transfer(cpi_context, 100)?;
      msg!("Transferred 100 tokens from the vault to the signer");
      // Transfer 100 tokens from the vault to the signer


      Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
  #[account(mut)]
  pub signer: Signer<'info>,
  //data account of the program
  #[account(
    init,
    payer = signer, //payer of the rent to store data
    space = 8 + VaultData::INIT_SPACE,
    seeds = [b"vault_data", signer.key().as_ref()],
    bump
  )]
  pub vault_data: Account<'info, VaultData>,
  #[account(
    init,
    payer = signer,
    seeds = [b"mint", signer.key().as_ref()],
    bump,
    mint::decimals = 0,
    mint::authority = vault_data,
  )]
  pub new_mint: Account<'info, Mint>,
  #[account(
    init,
    payer = signer,
    associated_token::mint = new_mint,
    associated_token::authority = vault_data, // pda has to give approval in the cpi
  )]
  pub new_vault: Account<'info, TokenAccount>, // Associated Token Account (ATA) for vault_data to hold SPL tokens from new_mint
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
}


#[derive(Accounts)]
pub struct Grab<'info> {
  pub signer: Signer<'info>,
  #[account(
    seeds = [b"vault_data", vault_data.creator.as_ref()],
    bump = vault_data.bump
  )]
  pub vault_data: Account<'info, VaultData>,
  #[account(
    seeds = [b"mint", vault_data.creator.as_ref()],
    bump,
  )]
  pub mint: Account<'info, Mint>,
  #[account(mut)]
  pub new_vault: Account<'info, TokenAccount>, // the account from which we are grabbing the tokens
  #[account(
    mut,
    associated_token::mint = mint,
    associated_token::authority = signer,
  )]
  pub signer_vault: Account<'info, TokenAccount>, // the account to which we are sending the tokens
  pub token_program: Program<'info, Token>,
}

// The vault PDA as the mint authority
#[account]
#[derive(InitSpace)]
pub struct VaultData {
  // creator of a token
  pub creator: Pubkey,
  bump: u8,
}
