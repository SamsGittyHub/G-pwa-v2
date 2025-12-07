import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { Message } from '@/types/chat';
import { Copy, Check, Volume2, VolumeX, FileText } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/use-speech';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { isSpeaking, speak, stop } = useTextToSpeech();

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(message.content);
    }
  };

  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mb-2">
        {message.attachments.map(attachment => (
          <div key={attachment.id} className="rounded-lg overflow-hidden">
            {attachment.type === 'image' ? (
              <img
                src={attachment.url}
                alt={attachment.name}
                className="max-w-[200px] max-h-[200px] object-cover rounded-lg"
              />
            ) : (
              <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-lg">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{attachment.name}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[85%] rounded-2xl px-4 py-3",
        isUser 
          ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-br-md" 
          : "bg-muted/30 backdrop-blur-sm border border-border/50 text-foreground rounded-bl-md"
      )}>
        {isUser ? (
          <>
            {renderAttachments()}
            {message.content && <p className="text-sm leading-relaxed">{message.content}</p>}
          </>
        ) : (
          <div className="relative">
            <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown
              components={{
                code(props) {
                  const { className, children, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  const codeString = String(children).replace(/\n$/, '');
                  
                  if (match) {
                    return (
                      <div className="relative my-3 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-secondary/80 border-b border-border/50">
                          <span className="text-xs font-mono text-muted-foreground uppercase">{match[1]}</span>
                          <button
                            onClick={() => copyToClipboard(codeString)}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedCode === codeString ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{
                            margin: 0,
                            borderRadius: 0,
                            fontSize: '13px',
                          }}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    );
                  }
                  
                  return (
                    <code className="bg-secondary/50 px-1.5 py-0.5 rounded text-sm font-mono" {...rest}>
                      {children}
                    </code>
                  );
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>;
                },
              }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            <button
              onClick={handleSpeak}
              className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-3.5 w-3.5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Listen</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
