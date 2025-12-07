import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Message, Conversation, AIConfig, Project, AIModel, ThemeConfig, Attachment } from '@/types/chat';
import { DEFAULT_THEME, applyTheme } from '@/lib/themes';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import {
  loadExternalConversations,
  createExternalConversation,
  updateExternalConversation,
  deleteExternalConversation,
  loadExternalMessages,
  saveExternalMessage,
  ExternalConversation,
  ExternalMessage
} from '@/lib/external-chat';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  aiConfig: AIConfig;
  projects: Project[];
  aiModels: AIModel[];
  themeConfig: ThemeConfig;
  setAIConfig: (config: AIConfig) => void;
  setThemeConfig: (config: ThemeConfig) => void;
  createConversation: (projectId?: string) => Promise<Conversation | null>;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  updateConversationPrompt: (id: string, prompt: string) => void;
  updateConversationModel: (id: string, modelId: string) => void;
  createProject: (name: string, primaryPrompt: string) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addAIModel: (model: Omit<AIModel, 'id'>) => AIModel;
  updateAIModel: (id: string, updates: Partial<AIModel>) => void;
  deleteAIModel: (id: string) => void;
  loadConversations: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const PROJECTS_KEY = 'tripleg_projects';
const AI_MODELS_KEY = 'tripleg_ai_models';
const THEME_KEY = 'tripleg_theme';
const AI_CONFIG_KEY = 'tripleg_ai_config';

const defaultAIConfig: AIConfig = {
  endpoint: 'https://janiece-tomfoolish-impurely.ngrok-free.dev/v1/chat/completions',
  apiKey: 'sk-999',
  modelName: 'Genius',
  masterPrompt: 'You are Genius, an AI assistant created by TripleG.',
};

// Convert external conversation to local format
const toLocalConversation = (ext: ExternalConversation): Conversation => ({
  id: ext.id.toString(),
  title: ext.title || 'New Chat',
  preview: '',
  timestamp: new Date(ext.updated_at || ext.created_at),
  selectedModelId: 'default',
});

// Convert external message to local format
const toLocalMessage = (ext: ExternalMessage): Message => ({
  id: ext.id.toString(),
  role: ext.role as 'user' | 'assistant',
  content: ext.content || '',
  timestamp: new Date(ext.created_at),
});

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, externalUserId, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [aiConfig, setAIConfigState] = useState<AIConfig>(() => {
    const stored = localStorage.getItem(AI_CONFIG_KEY);
    return stored ? JSON.parse(stored) : defaultAIConfig;
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [aiModels, setAIModels] = useState<AIModel[]>(() => {
    const stored = localStorage.getItem(AI_MODELS_KEY);
    return stored ? JSON.parse(stored) : [
      { id: 'default', name: 'Genius', endpoint: '', apiKey: '' }
    ];
  });
  const [themeConfig, setThemeConfigState] = useState<ThemeConfig>(() => {
    const stored = localStorage.getItem(THEME_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_THEME;
  });

  // Apply theme on load and changes
  useEffect(() => {
    applyTheme(themeConfig);
  }, [themeConfig]);

  // Load conversations from external DB when user is authenticated
  const loadConversations = useCallback(async () => {
    if (!externalUserId) return;

    try {
      const externalConvs = await loadExternalConversations(externalUserId);
      const convs = externalConvs.map(toLocalConversation);
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [externalUserId]);

  useEffect(() => {
    if (isAuthenticated && externalUserId) {
      loadConversations();
    } else {
      setConversations([]);
      setCurrentConversation(null);
      setMessages([]);
    }
  }, [isAuthenticated, externalUserId, loadConversations]);

  const setAIConfig = (config: AIConfig) => {
    setAIConfigState(config);
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  };

  const setThemeConfig = (config: ThemeConfig) => {
    setThemeConfigState(config);
    localStorage.setItem(THEME_KEY, JSON.stringify(config));
  };

  const saveProjects = (projs: Project[]) => {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projs));
    setProjects(projs);
  };

  const saveAIModels = (models: AIModel[]) => {
    localStorage.setItem(AI_MODELS_KEY, JSON.stringify(models));
    setAIModels(models);
  };

  const createConversation = async (projectId?: string): Promise<Conversation | null> => {
    if (!externalUserId) return null;

    try {
      const extConv = await createExternalConversation(externalUserId, 'New Chat');
      
      if (!extConv) {
        toast.error('Failed to create conversation');
        return null;
      }

      const newConv = toLocalConversation(extConv);
      newConv.projectId = projectId;
      newConv.preview = 'Start a conversation...';

      setConversations(prev => [newConv, ...prev]);
      setCurrentConversation(newConv);
      setMessages([]);
      return newConv;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    }
  };

  const selectConversation = async (id: string) => {
    if (!externalUserId) return;

    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setCurrentConversation(conv);
      
      // Load messages from external DB
      try {
        const extMessages = await loadExternalMessages(parseInt(id));
        const msgs = extMessages.map(toLocalMessage);
        setMessages(msgs);
      } catch (error) {
        console.error('Error loading messages:', error);
        setMessages([]);
      }
    }
  };

  const deleteConversation = async (id: string) => {
    if (!externalUserId) return;

    try {
      const success = await deleteExternalConversation(parseInt(id));
      
      if (!success) {
        toast.error('Failed to delete conversation');
        return;
      }

      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const updateConversationPrompt = (id: string, prompt: string) => {
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, prompt } : c
    ));
    if (currentConversation?.id === id) {
      setCurrentConversation({ ...currentConversation, prompt });
    }
  };

  const updateConversationModel = (id: string, modelId: string) => {
    setConversations(prev => prev.map(c => 
      c.id === id ? { ...c, selectedModelId: modelId } : c
    ));
    if (currentConversation?.id === id) {
      setCurrentConversation({ ...currentConversation, selectedModelId: modelId });
    }
  };

  const createProject = (name: string, primaryPrompt: string): Project => {
    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      primaryPrompt,
      timestamp: new Date(),
    };
    const updated = [newProject, ...projects];
    saveProjects(updated);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    const updated = projects.map(p => 
      p.id === id ? { ...p, ...updates } : p
    );
    saveProjects(updated);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    saveProjects(updated);
  };

  const addAIModel = (model: Omit<AIModel, 'id'>): AIModel => {
    const newModel: AIModel = {
      ...model,
      id: crypto.randomUUID(),
    };
    const updated = [...aiModels, newModel];
    saveAIModels(updated);
    return newModel;
  };

  const updateAIModel = (id: string, updates: Partial<AIModel>) => {
    const updated = aiModels.map(m => 
      m.id === id ? { ...m, ...updates } : m
    );
    saveAIModels(updated);
  };

  const deleteAIModel = (id: string) => {
    if (id === 'default') return;
    const updated = aiModels.filter(m => m.id !== id);
    saveAIModels(updated);
  };

  const sendMessage = async (content: string, attachments?: Attachment[]) => {
    if (!currentConversation || !externalUserId) return;

    const conversationId = parseInt(currentConversation.id);

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Save user message to external DB
    try {
      await saveExternalMessage(conversationId, 'user', content);

      // Update conversation title if first message
      if (messages.length === 0) {
        await updateExternalConversation(conversationId, { title: content.slice(0, 30) });
        
        setCurrentConversation(prev => prev ? { ...prev, title: content.slice(0, 30) } : null);
        setConversations(prev => prev.map(c => 
          c.id === currentConversation.id ? { ...c, title: content.slice(0, 30) } : c
        ));
      }
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      let assistantContent = '';
      let tokensUsed: number | undefined;

      // Get the selected model
      const selectedModel = aiModels.find(m => m.id === currentConversation.selectedModelId) || aiModels[0];
      const endpoint = selectedModel.endpoint || aiConfig.endpoint;
      const apiKey = selectedModel.apiKey || aiConfig.apiKey;
      const modelName = selectedModel.name || aiConfig.modelName;

      // Build system prompt from master + project + chat prompts
      const project = projects.find(p => p.id === currentConversation.projectId);
      const systemPrompts: string[] = [];
      if (aiConfig.masterPrompt) systemPrompts.push(aiConfig.masterPrompt);
      if (project?.primaryPrompt) systemPrompts.push(project.primaryPrompt);
      if (currentConversation.prompt) systemPrompts.push(currentConversation.prompt);
      const systemPrompt = systemPrompts.join('\n\n');

      if (endpoint) {
        const messagesPayload = [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...newMessages.map(m => ({ role: m.role, content: m.content })),
        ];

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey && { 'Authorization': `Bearer ${apiKey}` }),
          },
          body: JSON.stringify({
            model: modelName,
            messages: messagesPayload,
            max_tokens: 256,
            session_id: currentConversation.id,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        assistantContent = data.choices?.[0]?.message?.content || 'No response received.';
        tokensUsed = data.usage?.total_tokens;
      } else {
        assistantContent = 'No API endpoint configured. Please set up your Genius API in Settings.';
      }

      const latencyMs = Date.now() - startTime;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);

      // Save assistant message to external DB with metadata
      await saveExternalMessage(conversationId, 'assistant', assistantContent, {
        modelUsed: modelName,
        tokensUsed,
        latencyMs,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Connection error. Please check your AI configuration in Settings.',
        timestamp: new Date(),
      };
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);

      // Save error message to external DB
      try {
        await saveExternalMessage(conversationId, 'assistant', errorMessage.content, {
          metadata: { error: true }
        });
      } catch (e) {
        console.error('Error saving error message:', e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      messages,
      isLoading,
      aiConfig,
      projects,
      aiModels,
      themeConfig,
      setAIConfig,
      setThemeConfig,
      createConversation,
      selectConversation,
      sendMessage,
      deleteConversation,
      updateConversationPrompt,
      updateConversationModel,
      createProject,
      updateProject,
      deleteProject,
      addAIModel,
      updateAIModel,
      deleteAIModel,
      loadConversations,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
