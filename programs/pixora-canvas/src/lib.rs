use anchor_lang::prelude::*;

declare_id!("Pxra6Kev7iEom8n9zF2fHQKwhu68hL4WnU2qVwB7uS8");

#[program]
pub mod pixora_canvas {
    use super::*;

    /// Initialize the 128x128 canvas account PDA
    pub fn initialize_canvas(ctx: Context<InitializeCanvas>, width: u16, height: u16) -> Result<()> {
        let canvas = &mut ctx.accounts.canvas;
        canvas.authority = ctx.accounts.authority.key();
        canvas.width = width;
        canvas.height = height;
        canvas.total_pixels_placed = 0;
        canvas.state_root = [0u8; 32];
        canvas.last_committed_slot = Clock::get()?.slot;
        canvas.is_delegated = false;
        canvas.bump = ctx.bumps.canvas;
        Ok(())
    }

    /// Place a single pixel on MagicBlock Ephemeral Rollup
    /// Sub-10ms gasless execution executed on rollup validator
    pub fn place_pixel(ctx: Context<PlacePixel>, x: u8, y: u8, r: u8, g: u8, b: u8) -> Result<()> {
        let canvas = &mut ctx.accounts.canvas;
        require!(
            (x as u16) < canvas.width && (y as u16) < canvas.height,
            CanvasError::OutOfBounds
        );

        canvas.total_pixels_placed = canvas.total_pixels_placed.checked_add(1).unwrap();

        emit!(PixelPlacedEvent {
            x,
            y,
            r,
            g,
            b,
            author: ctx.accounts.payer.key(),
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    /// Commit canvas state root hash back to Solana Layer 1
    pub fn commit_canvas(ctx: Context<CommitCanvas>, state_root: [u8; 32]) -> Result<()> {
        let canvas = &mut ctx.accounts.canvas;
        canvas.state_root = state_root;
        canvas.last_committed_slot = Clock::get()?.slot;

        emit!(CanvasCommittedEvent {
            state_root,
            slot: Clock::get()?.slot,
            pixel_count: canvas.total_pixels_placed as u32,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeCanvas<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Canvas::INIT_SPACE,
        seeds = [b"canvas"],
        bump
    )]
    pub canvas: Account<'info, Canvas>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PlacePixel<'info> {
    #[account(
        mut,
        seeds = [b"canvas"],
        bump = canvas.bump
    )]
    pub canvas: Account<'info, Canvas>,

    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CommitCanvas<'info> {
    #[account(
        mut,
        seeds = [b"canvas"],
        bump = canvas.bump
    )]
    pub canvas: Account<'info, Canvas>,

    pub payer: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Canvas {
    pub authority: Pubkey,
    pub width: u16,
    pub height: u16,
    pub total_pixels_placed: u64,
    pub state_root: [u8; 32],
    pub last_committed_slot: u64,
    pub is_delegated: bool,
    pub bump: u8,
}

#[event]
pub struct PixelPlacedEvent {
    pub x: u8,
    pub y: u8,
    pub r: u8,
    pub g: u8,
    pub b: u8,
    pub author: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct CanvasCommittedEvent {
    pub state_root: [u8; 32],
    pub slot: u64,
    pub pixel_count: u32,
}

#[error_code]
pub enum CanvasError {
    #[msg("Pixel coordinate is out of bounds for the 128x128 grid")]
    OutOfBounds,
}
