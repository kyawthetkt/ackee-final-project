import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, LAMPORTS_PER_SOL, Connection, PublicKey } from '@solana/web3.js'
import { Textfeed } from '../target/types/textfeed';
import BN from 'bn.js'

function getPostAcountPda(program: Program<Textfeed>, author: PublicKey, title: String): [PublicKey, number] {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('post'), author.toBuffer(), Buffer.from(title)],
    program.programId,
  )
}

function getCommentPda(program: Program<Textfeed>, post: PublicKey): [PublicKey, number] {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('comment'), post.toBuffer()],
    program.programId,
  )
}

function getReactionPda(program: Program<Textfeed>, post: PublicKey, reactor: PublicKey): [PublicKey, number] {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from('reaction'), post.toBuffer(), reactor.toBuffer()],
    program.programId,
  )
}

async function airdrop(connection: Connection, address: PublicKey, amount: number = 1000 * LAMPORTS_PER_SOL) {
  await connection.confirmTransaction(await connection.requestAirdrop(address, amount), 'confirmed')
}

interface PostEvent {
  title: string
  description: string
  timestamp?: BN
}

async function createPost(
  program: Program<Textfeed>,
  author: anchor.web3.Keypair,
  post: PostEvent
) {
    const [postPda] = getPostAcountPda(program, author.publicKey, post.title);
    await program.methods
      .createPost(post.title, post.description)
      .accounts({
        author: author.publicKey,
        post: postPda,
        systemProgram: anchor.web3.SystemProgram.programId 
      })
      .signers([author])
      .rpc();
}

describe('Text Feed', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  // const payer = provider.wallet as anchor.Wallet
  const program = anchor.workspace.textfeed as Program<Textfeed>
  const author1 = Keypair.generate();
  const author2 = Keypair.generate();

  const commenter1 = Keypair.generate();
  const commenter2 = Keypair.generate();

  const reactor1 = Keypair.generate();
  const reactor2 = Keypair.generate();
  const reactor3 = Keypair.generate();
  const reactor4 = Keypair.generate();

  it('Airdrop SOL to all test accounts', async () => {
    await airdrop(program.provider.connection, author1.publicKey, 5 * LAMPORTS_PER_SOL)
    await airdrop(program.provider.connection, author2.publicKey, 5 * LAMPORTS_PER_SOL)

    await airdrop(program.provider.connection, commenter1.publicKey, 5 * LAMPORTS_PER_SOL)
    await airdrop(program.provider.connection, commenter2.publicKey, 5 * LAMPORTS_PER_SOL)

    await airdrop(program.provider.connection, reactor1.publicKey, 5 * LAMPORTS_PER_SOL)
    await airdrop(program.provider.connection, reactor2.publicKey, 5 * LAMPORTS_PER_SOL)
    await airdrop(program.provider.connection, reactor3.publicKey, 5 * LAMPORTS_PER_SOL)
    await airdrop(program.provider.connection, reactor4.publicKey, 5 * LAMPORTS_PER_SOL)
  })

  it('Create Post', async () => {
      const title = "Testing in Solana";
      const description = "Description in Solana";

      await createPost(program, author1, { title, description });

      const [postPda] = getPostAcountPda(program, author1.publicKey, title);
      const currentPost = await program.account.post.fetch(postPda);
      
      expect(currentPost.title).toEqual(title);
      expect(currentPost.description).toEqual(description);
  })

  it('Should fail if title length exceeds the treshold', async () => {
      try {
        const title =  'a'.repeat(51);
        const description =  'a'.repeat(100);
        await createPost(program, author1, { title, description });
      } catch (error) {
         expect(error.message).toContain('Max seed length exceeded');
      }
  })

  it('Should fail if description exceeds the treshold', async () => {
      try {
        const title =  'a'.repeat(50);
        const description =  'a'.repeat(301);
        await createPost(program, author1, { title, description });
      } catch (error) {
         expect(error.message).toContain('Max seed length exceeded');
      }
  })

  describe('Comment', () => {
        
    it('Comment a post', async () => {

          const title = "comment on a post";
          const description = "comment description on a post";

          await createPost(program, author1, { title, description });
          
          const [postPda] = getPostAcountPda(program, author1.publicKey, title);

          const [commentPda] = getCommentPda(program, postPda);
          // const currentPost = await program.account.post.fetch(postPda);

          await program.methods
            .addComment("My First Comment")
            .accounts({
              commenter: commenter2.publicKey,
              post: postPda,
              commentAccount: commentPda,
              systemProgram: anchor.web3.SystemProgram.programId 
            })
            .signers([commenter2])
            .rpc();
          
          await program.methods
            .addComment("My Second Comment")
            .accounts({
              commenter: commenter1.publicKey,
              post: postPda,
              commentAccount: commentPda,
              systemProgram: anchor.web3.SystemProgram.programId 
            })
            .signers([commenter1])
            .rpc();

            const commentObj = await program.account.commentAccount.fetch(commentPda);
            expect(commentObj.comments.length).toEqual(2);
    });

  })

  describe('Reaction', () => {
        
    it('react to a post', async () => {

        const title = "reaction on a post";
        const description = "reaction on a post";

        await createPost(program, author2, { title, description });
        const [postPda] = getPostAcountPda(program, author2.publicKey, title);

        const [reactionPda] = getReactionPda(program, postPda, reactor1.publicKey);

        let reactionType = 1;

        await program.methods
          .addReaction(reactionType)
          .accounts({
            reaction: reactionPda,
            post: postPda,
            reactor: reactor1.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId 
          })
          .signers([reactor1])
          .rpc();

        const [reactionPda2] = getReactionPda(program, postPda, reactor2.publicKey);
        await program.methods
          .addReaction(reactionType)
          .accounts({
            reaction: reactionPda2,
            post: postPda,
            reactor: reactor2.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId 
          })
          .signers([reactor2])
          .rpc();

          const [reactionPda3] = getReactionPda(program, postPda, reactor3.publicKey);
        await program.methods
          .addReaction(0)
          .accounts({
            reaction: reactionPda3,
            post: postPda,
            reactor: reactor3.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId 
          })
          .signers([reactor3])
          .rpc();

          const post = await program.account.post.fetch(postPda);
          expect(post.likes.eq(new BN(2))).toBeTruthy();
          expect(post.dislikes.eq(new BN(1))).toBeTruthy();
    });

    it('invalid react to a post', async () => {

        try {
          const title = "failed reaction on a post";
          const description = "failed reaction on a post";

          await createPost(program, author2, { title, description });
          const [postPda] = getPostAcountPda(program, author2.publicKey, title);

          const [reactionPda] = getReactionPda(program, postPda, reactor1.publicKey);

          let reactionType = 2;

          await program.methods
            .addReaction(reactionType)
            .accounts({
              reaction: reactionPda,
              post: postPda,
              reactor: reactor1.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId 
            })
            .signers([reactor1])
            .rpc();

        } catch (error) {
           expect(error.message).toContain('Reaction is invalid.');
        }
        
    });

  });

})