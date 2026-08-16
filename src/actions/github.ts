"use server";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchGitHub(endpoint: string, options: RequestInit = {}) {
  if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is missing in .env.local");
  const res = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: "application/vnd.github.v3+json", "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API Error: ${res.status}`);
  }
  return res.json();
}

export async function getProfile(username?: string) {
  try {
    const data = await fetchGitHub(username ? `/users/${username}` : "/user");
    return { data };
  } catch (error: any) { return { error: error.message }; }
}

export async function getRepositories(username?: string) {
  try {
    const endpoint = username ? `/users/${username}/repos?sort=updated&per_page=50` : "/user/repos?sort=updated&per_page=50";
    const data = await fetchGitHub(endpoint);
    return { data };
  } catch (error: any) { return { error: error.message }; }
}

export async function getRepoContents(owner: string, repo: string, path: string = "") {
  try {
    const contents = await fetchGitHub(`/repos/${owner}/${repo}/contents/${path}`);
    return { data: Array.isArray(contents) ? contents : [contents] };
  } catch (error: any) { return { error: error.message }; }
}

export async function getFileContent(owner: string, repo: string, path: string) {
  try {
    const fileData = await fetchGitHub(`/repos/${owner}/${repo}/contents/${path}`);
    const decodedContent = Buffer.from(fileData.content, 'base64').toString('utf-8');
    return { data: { ...fileData, decodedContent } };
  } catch (error: any) { return { error: error.message }; }
}

export async function commitFile(owner: string, repo: string, path: string, content: string, message: string, sha: string) {
  try {
    const body = { message, content: Buffer.from(content).toString("base64"), sha };
    const res = await fetchGitHub(`/repos/${owner}/${repo}/contents/${path}`, { method: "PUT", body: JSON.stringify(body) });
    return { success: true, data: res };
  } catch (error: any) { return { error: error.message }; }
}
