use anchor_lang::prelude::*;

#[error_code]
pub enum PostError {
    #[msg("Title is too long")]
    TitleTooLong,

    #[msg("Description is too long")]
    DescriptionTooLong,
}

#[error_code]
pub enum ReactionError {
    #[msg("Reaction is invalid.")]
    InvalidReactionType
}