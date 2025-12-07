// Direct API calls for chat operations

// API endpoint - uses same origin when deployed, or configured base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface ExternalUser {
  id: number;
  username: string;
  email: string | null;
  created_at: string;
  last_login: string | null;
  preferences: Record<string, unknown> | null;
  storage_used_bytes: number;
}

export interface ExternalConversation {
  id: number;
  user_id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  total_messages: number;
  last_message_at: string | null;
}

export interface ExternalMessage {
  id: number;
  conversation_id: number;
  role: string;
  content: string | null;
  content_type: string;
  model_used: string | null;
  tokens_used: number | null;
  latency_ms: number | null;
  created_at: string;
  edited_at: string | null;
  metadata: Record<string, unknown> | null;
}

/**
 * Make a request to the external database API
 */
async function dbRequest<T = Record<string, unknown>>(
  body: Record<string, unknown>
): Promise<{ success: boolean; data?: T[]; error?: string }> {
  const token = localStorage.getItem('tripleg_auth_token');
  
  const response = await fetch(`${API_BASE_URL}/api/db`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Database request failed');
  }

  return response.json();
}

/**
 * Sync a user with the external users table
 * Returns the external user ID
 */
export async function syncExternalUser(
  userId: string,
  email: string,
  displayName?: string
): Promise<{ externalUserId: number | null; error?: string }> {
  try {
    // First, check if user already exists by email
    const selectResult = await dbRequest<{ id: number }>({
      action: 'query',
      query: `SELECT id FROM users WHERE email = '${email}' LIMIT 1`
    });

    if (selectResult.data && selectResult.data.length > 0) {
      // User exists, update last_login
      const externalUserId = selectResult.data[0].id;
      
      await dbRequest({
        action: 'update',
        table: 'users',
        data: { last_login: new Date().toISOString() },
        filters: { id: externalUserId }
      });

      return { externalUserId };
    }

    // User doesn't exist, create them
    const username = displayName || email.split('@')[0];
    const insertResult = await dbRequest<{ id: number }>({
      action: 'insert',
      table: 'users',
      data: {
        username,
        email,
        last_login: new Date().toISOString()
      }
    });

    if (insertResult.data && insertResult.data.length > 0) {
      return { externalUserId: insertResult.data[0].id };
    }

    return { externalUserId: null, error: 'Failed to create user' };
  } catch (error) {
    console.error('Error syncing external user:', error);
    return { externalUserId: null, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Load conversations for a user from external DB
 */
export async function loadExternalConversations(
  externalUserId: number
): Promise<ExternalConversation[]> {
  try {
    const result = await dbRequest<ExternalConversation>({
      action: 'query',
      query: `SELECT * FROM conversations WHERE user_id = ${externalUserId} AND is_archived = false ORDER BY updated_at DESC LIMIT 50`
    });

    return result.data || [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
}

/**
 * Create a new conversation in external DB
 */
export async function createExternalConversation(
  externalUserId: number,
  title: string = 'New Chat'
): Promise<ExternalConversation | null> {
  try {
    const result = await dbRequest<ExternalConversation>({
      action: 'insert',
      table: 'conversations',
      data: {
        user_id: externalUserId,
        title
      }
    });

    return result.data?.[0] || null;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
}

/**
 * Update conversation title
 */
export async function updateExternalConversation(
  conversationId: number,
  updates: Partial<Pick<ExternalConversation, 'title' | 'is_archived'>>
): Promise<boolean> {
  try {
    await dbRequest({
      action: 'update',
      table: 'conversations',
      data: updates,
      filters: { id: conversationId }
    });

    return true;
  } catch (error) {
    console.error('Error updating conversation:', error);
    return false;
  }
}

/**
 * Delete (archive) a conversation
 */
export async function deleteExternalConversation(conversationId: number): Promise<boolean> {
  try {
    // Archive instead of delete
    await dbRequest({
      action: 'update',
      table: 'conversations',
      data: { is_archived: true },
      filters: { id: conversationId }
    });

    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
}

/**
 * Load messages for a conversation
 */
export async function loadExternalMessages(
  conversationId: number
): Promise<ExternalMessage[]> {
  try {
    const result = await dbRequest<ExternalMessage>({
      action: 'query',
      query: `SELECT * FROM messages WHERE conversation_id = ${conversationId} ORDER BY created_at ASC LIMIT 100`
    });

    return result.data || [];
  } catch (error) {
    console.error('Error loading messages:', error);
    return [];
  }
}

/**
 * Save a message to external DB
 */
export async function saveExternalMessage(
  conversationId: number,
  role: 'user' | 'assistant',
  content: string,
  options?: {
    contentType?: string;
    modelUsed?: string;
    tokensUsed?: number;
    latencyMs?: number;
    metadata?: Record<string, unknown>;
  }
): Promise<ExternalMessage | null> {
  try {
    const result = await dbRequest<ExternalMessage>({
      action: 'insert',
      table: 'messages',
      data: {
        conversation_id: conversationId,
        role,
        content,
        content_type: options?.contentType || 'text',
        model_used: options?.modelUsed,
        tokens_used: options?.tokensUsed,
        latency_ms: options?.latencyMs,
        metadata: options?.metadata ? JSON.stringify(options.metadata) : null
      }
    });

    return result.data?.[0] || null;
  } catch (error) {
    console.error('Error saving message:', error);
    return null;
  }
}

/**
 * Get user preferences from external DB
 */
export async function getExternalUserPreferences(
  externalUserId: number
): Promise<Record<string, unknown> | null> {
  try {
    const result = await dbRequest<{ preferences: Record<string, unknown> }>({
      action: 'query',
      query: `SELECT preferences FROM users WHERE id = ${externalUserId}`
    });

    return result.data?.[0]?.preferences || null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return null;
  }
}

/**
 * Update user preferences in external DB
 */
export async function updateExternalUserPreferences(
  externalUserId: number,
  preferences: Record<string, unknown>
): Promise<boolean> {
  try {
    await dbRequest({
      action: 'update',
      table: 'users',
      data: { preferences: JSON.stringify(preferences) },
      filters: { id: externalUserId }
    });

    return true;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return false;
  }
}
