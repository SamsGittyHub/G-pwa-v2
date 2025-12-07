const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;
const AI_API_ENDPOINT = import.meta.env.VITE_AI_API_ENDPOINT;
const AI_API_KEY = import.meta.env.VITE_AI_API_KEY;

// ---------- AUTH ----------
export async function login(email: string, password: string) {
  const res = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error('Login failed');
  return res.json(); // expect { token, user, ... }
}

// example protected call
export async function getUserProfile(token: string) {
  const res = await fetch(`${API_BASE_URL}/user/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load profile');
  return res.json();
}

// ---------- AI (Genius / Anima) ----------
export async function askGenius(opts: {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  userId?: string;
  sessionId?: string;
}) {
  const res = await fetch(AI_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'anima-qwen',
      messages: opts.messages,
      max_tokens: 1024,
      stream: false,
      user_id: opts.userId ?? 'web-user',
      session_id: opts.sessionId ?? 'web-session',
    }),
  });

  if (!res.ok) throw new Error('AI request failed');
  const data = await res.json();
  return data.choices[0].message.content as string;
}
