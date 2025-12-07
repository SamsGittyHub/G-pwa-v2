import {
  API_BASE_URL,
  AUTH_API_URL,
  AI_API_ENDPOINT,
  AI_API_KEY,
} from './env';

const getApiBase = () => {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }
  return API_BASE_URL;
};

const getAuthApi = () => {
  const url = AUTH_API_URL || `${getApiBase()}/api/auth`;
  if (!url) {
    throw new Error('Auth API URL is not configured');
  }
  return url;
};

// ---------- AUTH ----------
export async function login(email: string, password: string) {
  const res = await fetch(`${getAuthApi()}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error('Login failed');
  return res.json(); // expect { token, user, ... }
}

// example protected call
export async function getUserProfile(token: string) {
  const res = await fetch(`${getApiBase()}/user/me`, {
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
  if (!AI_API_ENDPOINT) {
    throw new Error('AI API endpoint is not configured');
  }

  if (!AI_API_KEY) {
    throw new Error('AI API key is not configured');
  }

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
