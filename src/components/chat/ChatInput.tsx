import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Mic, MicOff, X, Image, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSpeechToText } from '@/hooks/use-speech';
import { Attachment } from '@/types/chat';

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, startListening, stopListening } = useSpeechToText();

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || attachments.length > 0) && !disabled) {
      onSend(input.trim(), attachments.length > 0 ? attachments : undefined);
      setInput('');
      setAttachments([]);
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
      if (input.trim() || attachments.length > 0) {
        onSend(input.trim(), attachments.length > 0 ? attachments : undefined);
        setInput('');
        setAttachments([]);
      }
    } else {
      startListening();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const isImage = file.type.startsWith('image/');
        const newAttachment: Attachment = {
          id: crypto.randomUUID(),
          type: isImage ? 'image' : 'file',
          name: file.name,
          url: reader.result as string,
          mimeType: file.type,
        };
        setAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 px-4 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-[calc(env(safe-area-inset-bottom,8px)+0.5rem)]">
      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="max-w-2xl mx-auto mb-2 flex gap-2 flex-wrap">
          {attachments.map(attachment => (
            <div
              key={attachment.id}
              className="relative group bg-card/80 backdrop-blur rounded-lg border border-border/50 overflow-hidden"
            >
              {attachment.type === 'image' ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="h-16 w-16 object-cover"
                />
              ) : (
                <div className="h-16 w-16 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <button
                type="button"
                onClick={() => removeAttachment(attachment.id)}
                className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-background/80 px-1 py-0.5 text-[10px] text-muted-foreground truncate">
                {attachment.name}
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 bg-card/80 backdrop-blur-2xl rounded-full border border-border/50 shadow-xl px-3 py-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.md"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <Plus className="h-5 w-5" />
          </button>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : "Message..."}
            disabled={disabled || isListening}
            className={cn(
              "flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm py-2",
              disabled && "opacity-50",
              isListening && "text-primary"
            )}
          />
          
          {(input.trim() || attachments.length > 0) && !isListening ? (
            <button
              type="submit"
              disabled={disabled}
              className="p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleMicClick}
              className={cn(
                "p-2 rounded-full transition-colors",
                isListening 
                  ? "bg-destructive text-destructive-foreground animate-pulse" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
