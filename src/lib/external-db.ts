// Direct API calls to external PostgreSQL database

import { API_BASE_URL } from './env';

// Resolve backend base URL from env or Vite define
const getBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }
  return API_BASE_URL;
};

export interface ExternalDbResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T[];
  rowCount?: number;
  error?: string;
}

export interface ExternalDbFilters {
  [key: string]: string | number | boolean | null;
}

/**
 * Make a request to the external database API
 */
async function dbRequest<T = Record<string, unknown>>(
  body: Record<string, unknown>
): Promise<ExternalDbResponse<T>> {
  const token = localStorage.getItem('tripleg_auth_token');
  
  const response = await fetch(`${getBaseUrl()}/api/db`, {
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
 * Query your external PostgreSQL database
 */
export async function queryExternalDb<T = Record<string, unknown>>(
  query: string
): Promise<ExternalDbResponse<T>> {
  return dbRequest<T>({ action: 'query', query });
}

/**
 * List all tables in the external database
 */
export async function listExternalTables(): Promise<ExternalDbResponse<{ table_name: string }>> {
  return dbRequest<{ table_name: string }>({ action: 'list_tables' });
}

/**
 * Get column information for a table
 */
export async function describeExternalTable(table: string): Promise<ExternalDbResponse<{
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}>> {
  return dbRequest({ action: 'describe_table', table });
}

/**
 * Select data from a table
 */
export async function selectFromExternal<T = Record<string, unknown>>(
  table: string,
  filters?: ExternalDbFilters
): Promise<ExternalDbResponse<T>> {
  return dbRequest<T>({ action: 'select', table, filters });
}

/**
 * Insert data into a table
 */
export async function insertIntoExternal<T = Record<string, unknown>>(
  table: string,
  data: Record<string, unknown>
): Promise<ExternalDbResponse<T>> {
  return dbRequest<T>({ action: 'insert', table, data });
}

/**
 * Update data in a table
 */
export async function updateInExternal<T = Record<string, unknown>>(
  table: string,
  data: Record<string, unknown>,
  filters: ExternalDbFilters
): Promise<ExternalDbResponse<T>> {
  return dbRequest<T>({ action: 'update', table, data, filters });
}

/**
 * Delete data from a table
 */
export async function deleteFromExternal<T = Record<string, unknown>>(
  table: string,
  filters: ExternalDbFilters
): Promise<ExternalDbResponse<T>> {
  return dbRequest<T>({ action: 'delete', table, filters });
}
