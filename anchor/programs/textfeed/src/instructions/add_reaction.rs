use anchor_lang::prelude::*;

use crate::{ 
    state::{ Post, Reaction }, 
    constants::{ DISCRIMINATOR, POST_SEED, REACTION_SEED },
    errors::ReactionError
};

pub fn _add_reaction(ctx: Context<AddReaction>, reaction_type: u8) -> Result<()> {

    match reaction_type {
        1 => ctx.accounts.post.likes += 1,
        0 => ctx.accounts.post.dislikes += 1,
        _ => return err!(ReactionError::InvalidReactionType)
    }

    let reaction = &mut ctx.accounts.reaction;
    reaction.post = ctx.accounts.post.key();
    reaction.reactor = ctx.accounts.reactor.key();
    reaction.timestamp = Clock::get()?.unix_timestamp; 
    reaction.bump = ctx.bumps.reaction;

    Ok(())
}

#[derive(Accounts)]
pub struct AddReaction<'info> {
    #[account(
        init,
        payer = reactor,
        space = DISCRIMINATOR + Reaction::INIT_SPACE,
        seeds = [REACTION_SEED, post.key().as_ref(), reactor.key().as_ref()],
        bump
    )]
    pub reaction: Account<'info, Reaction>,

    #[account(
        mut,
        seeds = [POST_SEED, post.author.key().as_ref(), post.title.as_bytes()],
        bump = post.bump
    )]
    pub post: Account<'info, Post>,

    #[account(mut)]
    pub reactor: Signer<'info>,

    pub system_program: Program<'info, System>,
}