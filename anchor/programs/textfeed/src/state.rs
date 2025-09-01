use anchor_lang::prelude::*;

pub const MAX_TITLE_LEN: usize = 50;
pub const MAX_DESCRIPTION_LEN: usize = 300;

pub const MAX_COMMENT_TEXT_LEN: usize = 100;

#[account]
#[derive(InitSpace)]
pub struct Post {
    pub author: Pubkey,
    #[max_len(MAX_TITLE_LEN)]
    pub title: String,
    #[max_len(MAX_DESCRIPTION_LEN)]
    pub description: String,
    pub likes: u64,
    pub dislikes: u64,
    pub bump: u8,
    pub timestamp: i64
}

#[derive(Clone, AnchorSerialize, AnchorDeserialize, InitSpace)]
pub struct Comment {
    pub author: Pubkey,
    #[max_len(MAX_COMMENT_TEXT_LEN)]
    pub text: String,
    pub timestamp: i64,
    pub likes: u64,
    pub dislikes: u64,
}

#[account]
#[derive(InitSpace)]
pub struct CommentAccount {
    pub post: Pubkey,
    #[max_len(20)] 
    pub comments: Vec<Comment>,
    pub bump: u8
}

///////////////////////////////////////////
//////////////// Reaction ////////////////
/// //////////////////////////////////////
#[account]
#[derive(InitSpace)]
pub struct Reaction {
    pub post: Pubkey,
    pub reactor: Pubkey,
    pub reaction_type: u8,
    pub timestamp: i64,
    pub bump: u8,
}