use anchor_lang::prelude::*;

use crate::{ 
    state::{ Post, MAX_TITLE_LEN, MAX_DESCRIPTION_LEN }, 
    constants::{ DISCRIMINATOR, POST_SEED },
    errors::PostError
};

pub fn _create_post(ctx: Context<CreatePost>, title: String, description: String) -> Result<()> {
    let post = &mut ctx.accounts.post;

    require!(title.len() <= MAX_TITLE_LEN, PostError::TitleTooLong);
    // if title.chars().count() > MAX_TITLE_LEN {
    //     return Err(PostError::TitleTooLong.into())
    // }
    require!(description.len() <= MAX_DESCRIPTION_LEN, PostError::DescriptionTooLong);

    post.author = ctx.accounts.author.key();
    post.title = title;
    post.description = description;
    post.timestamp = Clock::get()?.unix_timestamp;
    post.bump = ctx.bumps.post;

    Ok(())
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreatePost<'info> {

    #[account(mut)]
    pub author: Signer<'info>,

    #[account(
        init,
        payer = author,
        space = DISCRIMINATOR + Post::INIT_SPACE,
        seeds = [POST_SEED, author.key().as_ref(), title.as_bytes()],
        bump
    )]
    pub post: Account<'info, Post>,

    pub system_program: Program<'info, System>
}