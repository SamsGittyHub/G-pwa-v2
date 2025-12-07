export interface Attachment {
  id: string;
  type: 'image' | 'file';
  name: string;
  url: string;
  mimeType: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  modelIcon?: string;
  projectId?: string;
  prompt?: string;
  selectedModelId?: string;
}

export interface Project {
  id: string;
  name: string;
  primaryPrompt: string;
  timestamp: Date;
}

export interface AIModel {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AIConfig {
  endpoint: string;
  apiKey: string;
  modelName: string;
  masterPrompt?: string;
}

export interface ThemeConfig {
  name: string;
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
}
