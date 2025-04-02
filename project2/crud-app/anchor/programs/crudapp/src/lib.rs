#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("CMWMjM33k5R4MrxTBnJg2mwKYheQ6FDcfszMvMak4o3Z");

// To build run with: RUSTUP_TOOLCHAIN="nightly-2024-11-19" anchor build
// To deploy run with: anchor deploy --provider.cluster localnet
// Then run: anchor keys sync

#[program]
pub mod crudapp {
    use super::*;

    pub fn create_journal_entry(ctx: Context<CreateJournalEntry>, title: String, message: String) -> Result<()> {
      let journal_entry: &mut Account<JournalEntryState> = &mut ctx.accounts.journal_entry;
      journal_entry.owner = *ctx.accounts.owner.key;
      journal_entry.title = title;
      journal_entry.message = message;
      Ok(())
    }

    pub fn update_journal_entry(ctx: Context<UpdateJournalEntry>, _title: String, message: String) -> Result<()> {
      let journal_entry: &mut Account<JournalEntryState> = &mut ctx.accounts.journal_entry;
      journal_entry.message = message;
      Ok(())
    }

    pub fn delete_journal_entry(_ctx: Context<DeleteJournalEntry>, _title: String) -> Result<()> {
      Ok(())
    }


}
#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateJournalEntry<'info> {
  #[account(
    init,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    space = 8 + JournalEntryState::INIT_SPACE,
    payer = owner,
  )]
  pub journal_entry: Account<'info, JournalEntryState>,
  #[account(mut)]
  pub owner: Signer<'info>,
  pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateJournalEntry<'info> {
  #[account(
    mut,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    realloc = 8 + JournalEntryState::INIT_SPACE,
    realloc::payer = owner,
    realloc::zero  = true,
  )]
  pub journal_entry: Account<'info, JournalEntryState>,
  #[account(mut)]
  pub owner: Signer<'info>,
  pub system_program: Program<'info, System>
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteJournalEntry<'info> {
  #[account(
    mut,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    close = owner,
  )]
  pub journal_entry: Account<'info, JournalEntryState>,
  #[account(mut)]
  pub owner: Signer<'info>,
  pub system_program: Program<'info, System>
}



#[account]
#[derive(InitSpace)]
pub struct JournalEntryState {
  owner: Pubkey,
  #[max_len(50)]
  title: String,
  #[max_len(1000)]
  message: String,
}
