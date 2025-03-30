import { NextResponse } from 'next/server';

// GET handler function
export async function GET() {
  return NextResponse.json({ message: "Hello World" });
}

// You can also add POST, PUT, DELETE handlers if needed
export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: "Hello World", receivedData: body });
}
