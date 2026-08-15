import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  const correctPassword = process.env.DASHBOARD_PASSWORD;

  if (password === correctPassword) {
    const response = NextResponse.json({ success: true });
    response.cookies.set('auth-token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // Stays unlocked for 1 week
    });
    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
