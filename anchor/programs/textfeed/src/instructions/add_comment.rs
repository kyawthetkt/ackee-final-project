use anchor_lang::prelude::*;

use crate::{ 
    state::{ Post, CommentAccount, Comment }, 
    constants::{ DISCRIMINATOR, POST_SEED, COMMENT_SEED }
};

pub fn _add_comment(ctx: Context<AddComment>, text: String) -> Result<()> {
    // let post = &mut ctx.accounts.post;
    let comment_account = &mut ctx.accounts.comment_account;

    if comment_account.comments.is_empty() {
        comment_account.post = ctx.accounts.post.key();
        comment_account.bump = ctx.bumps.comment_account;
    }

    comment_account.comments.push(Comment{
        author: *ctx.accounts.commenter.key,
        text,
        timestamp: Clock::get()?.unix_timestamp,
        likes: 0,
        dislikes: 0
    });

    Ok(())
}

#[derive(Accounts)]
pub struct AddComment<'info> {
    #[account(
        init_if_needed,
        payer = commenter,
        space = DISCRIMINATOR + CommentAccount::INIT_SPACE,
        seeds = [COMMENT_SEED, post.key().as_ref()],
        bump,
    )]
    pub comment_account: Account<'info, CommentAccount>,

    #[account(
        seeds = [POST_SEED, post.author.key().as_ref(), post.title.as_bytes()],
        bump = post.bump
    )]
    pub post: Account<'info, Post>,

    #[account(mut)]
    pub commenter: Signer<'info>,

    pub system_program: Program<'info, System>,
}