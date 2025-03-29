use anchor_lang::prelude::*;

declare_id!("DktGyhvAUezSrYXfK5LVsgmXBsUsCrGsAvgctzqGMZTb");

#[program]
pub mod voting {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
