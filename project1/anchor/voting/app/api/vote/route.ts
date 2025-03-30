import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from '@solana/actions';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Connection, Transaction, TransactionInstruction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import {Voting} from '../../../target/types/voting'
import { BN, Program } from '@coral-xyz/anchor';

const IDL = require('../../../target/idl/voting.json')
// GET handler function
export async function GET() {
  const actionMetdata: ActionGetResponse = {
    icon: "https://zestfulkitchen.com/wp-content/uploads/2021/09/Peanut-butter_hero_for-web-3-1000x1099.jpg",
    title: "Vote for your favorite type of peanut butter!",
    description: "Vote between crunchy and smooth peanut butter",
    label: "Vote",
    links: {
      actions: [
        {
          label:"Vote for Crunchy",
          href:"/api/vote?candidate=Crunchy",
          type: "transaction",
        },
        {
          label:"Vote for Smooth",
          href:"/api/vote?candidate=Smooth",
          type: "transaction",
        },
      ]
    },
  }
  return NextResponse.json(actionMetdata, {headers: ACTIONS_CORS_HEADERS});
}

// You can also add POST, PUT, DELETE handlers if needed
export async function POST(request: Request) {

  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");
  if (candidate != "Crunchy" && candidate != "Smooth") {
    return NextResponse.json("Invalid candidate", {status: 400, headers: ACTIONS_CORS_HEADERS});
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: Program<Voting> = new Program(IDL, {connection});
  const body: ActionPostRequest = await request.json() as ActionPostRequest;
  let voter;

  try {
    voter = new PublicKey(body.account);

  } catch (error) {
    return NextResponse.json("Invalid account", {status: 400, headers: ACTIONS_CORS_HEADERS});

  }
  const instruciton = await program.methods.vote(candidate, new BN(1)).accounts({signer:voter,}).instruction();

  const blockhash =  await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer:voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,


  })
  .add(instruciton);

  const response = await createPostResponse({
    fields: {
      type: "transaction",
      transaction: transaction,
    }
  })
  return NextResponse.json(response, {headers: ACTIONS_CORS_HEADERS});
}
