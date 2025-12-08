import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/contexts/ChatContext';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { PromptDialog } from '@/components/dialogs/PromptDialog';
import { ModelSwitchDialog } from '@/components/dialogs/ModelSwitchDialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MoreVertical, Brain, MessageSquare } from 'lucide-react';
import logo from '@/assets/logo.png';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Chat = () => {
  const navigate = useNavigate();
  const { 
    currentConversation, 
    messages, 
    isLoading, 
    sendMessage, 
    deleteConversation, 
    createConversation,
    updateConversationPrompt,
    updateConversationModel,
    aiModels,
    projects,
  } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [modelSwitchOpen, setModelSwitchOpen] = useState(false);

  useEffect(() => {
    if (!currentConversation) {
      createConversation();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleDelete = async () => {
    if (currentConversation) {
      await deleteConversation(currentConversation.id);
      navigate('/home');
    }
  };

  const selectedModel = aiModels.find(m => m.id === currentConversation?.selectedModelId) || aiModels[0];
  const project = projects.find(p => p.id === currentConversation?.projectId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-2xl border-b border-border/50 safe-area-top">
        <div className="px-2 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
              className="rounded-full"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={logo} alt="TripleG" className="w-9 h-9 rounded-xl" />
              <div>
                <h1 className="font-semibold text-foreground">{selectedModel.name}</h1>
                <p className="text-xs text-muted-foreground">
                  {project ? project.name : 'TripleG AI'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setModelSwitchOpen(true)}
              className="rounded-full"
              title="Switch AI Model"
            >
              <Brain className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setPromptDialogOpen(true)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat Prompt
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                  Delete Chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-auto px-4 pt-4 pb-32">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <img src={logo} alt="TripleG" className="w-20 h-20 rounded-3xl mb-6" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Hello!</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              I'm {selectedModel.name}, your AI assistant. How can I help you today?
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />

      {/* Prompt Dialog */}
      <PromptDialog
        open={promptDialogOpen}
        onOpenChange={setPromptDialogOpen}
        currentPrompt={currentConversation?.prompt || ''}
        onSave={(prompt) => {
          if (currentConversation) {
            updateConversationPrompt(currentConversation.id, prompt);
          }
        }}
      />

      {/* Model Switch Dialog */}
      <ModelSwitchDialog
        open={modelSwitchOpen}
        onOpenChange={setModelSwitchOpen}
        models={aiModels}
        selectedModelId={currentConversation?.selectedModelId || 'default'}
        onSelect={(modelId) => {
          if (currentConversation) {
            updateConversationModel(currentConversation.id, modelId);
          }
        }}
      />
    </div>
  );
};

export default Chat;
