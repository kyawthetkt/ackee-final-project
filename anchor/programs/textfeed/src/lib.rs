#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("Fov2FcuzX37TPe8fRq94UcWgaBW37NEpp4FK2MRY3hri");

pub mod instructions;
pub mod errors;
pub mod state;
pub mod constants;

use instructions::*;

#[program]
pub mod textfeed {
    use super::*;

    pub fn create_post(ctx: Context<CreatePost>, title: String, description: String) -> Result<()> {
        _create_post(ctx, title, description)
    }

    pub fn add_comment(ctx: Context<AddComment>, text: String) -> Result<()> {
        _add_comment(ctx, text)
    }

    pub fn add_reaction(ctx: Context<AddReaction>, reaction_type: u8) -> Result<()> {
        _add_reaction(ctx, reaction_type)
    }
}