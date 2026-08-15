import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  
  if (!token) {
    return NextResponse.json({ error: "GITHUB_TOKEN is missing from .env.local" }, { status: 500 });
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch('https://api.github.com/user', { headers }),
      fetch('https://api.github.com/user/repos?sort=updated&per_page=6&affiliation=owner,collaborator', { headers })
    ]);

    if (!profileRes.ok) {
      return NextResponse.json({ error: `GitHub API Rejected Token (Status ${profileRes.status})` }, { status: 401 });
    }

    const profile = await profileRes.json();
    const repos = await reposRes.json();

    return NextResponse.json({ profile, repos });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
