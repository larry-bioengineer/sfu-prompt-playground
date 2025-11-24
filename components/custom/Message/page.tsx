'use client';
import { MessageActions, MessageAction } from '@/components/ai-elements/message';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  PromptInputProvider,
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  usePromptInputController,
} from '@/components/ai-elements/prompt-input';
import { MessageResponse } from '@/components/ai-elements/message';
import { RefreshCcwIcon, CopyIcon } from 'lucide-react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Fragment, useEffect, useMemo, useState } from 'react';
import SystemMessage from '@/components/custom/SystemMessage/page';

const STORAGE_KEY = 'system-message';


const MessagePageContent = () => {
  // Get system message from localStorage and keep it in state
  const [systemMessage, setSystemMessage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || '';
    }
    return '';
  });

  // Listen for storage changes to update system message
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        setSystemMessage(localStorage.getItem(STORAGE_KEY) || '');
      }
    };

    // Listen for storage events (when localStorage is updated from another tab/window)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (when localStorage is updated in the same tab)
    window.addEventListener('systemMessageUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('systemMessageUpdated', handleStorageChange);
    };
  }, []);

  // Create transport with system message in body
  const transport = useMemo(() => {
    return new DefaultChatTransport({
      api: '/api/chat',
      body: {
        systemMessage: systemMessage,
      },
    });
  }, [systemMessage]);

  const { messages, sendMessage, status, regenerate } = useChat({
    transport,
  });
  const { textInput } = usePromptInputController();
  const handleSubmit = async (message: { text: string; files: any[] }, e: React.FormEvent) => {
    if (message.text.trim()) {
      sendMessage({ text: message.text });
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-6 relative w-full h-full rounded-lg border">
      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-4">
          <SystemMessage />
        </div>
        <Conversation>
          <ConversationContent>
            {messages.map((message, messageIndex) => (
              <Fragment key={message.id}>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      const isLastMessage =
                        messageIndex === messages.length - 1;
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <MessageResponse>{part.text}</MessageResponse>
                            </MessageContent>
                          </Message>
                          {message.role === 'assistant' && isLastMessage && (
                            <MessageActions>
                              <MessageAction
                                onClick={() => regenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </MessageAction>
                              <MessageAction
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </MessageAction>
                            </MessageActions>
                          )}
                        </Fragment>
                      );
                    default:
                      return null;
                  }
                })}
              </Fragment>
            ))}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
        <PromptInput
          onSubmit={handleSubmit}
          className="mt-4 w-full max-w-2xl mx-auto relative"
        >
          <PromptInputTextarea
            placeholder="Say something..."
            className="pr-12"
          />
          <PromptInputSubmit
            status={status === 'streaming' ? 'streaming' : 'ready'}
            disabled={!textInput.value.trim()}
            className="absolute bottom-1 right-1"
          />
        </PromptInput>
      </div>
    </div>
  );
};

const MessagePage = () => {
  return (
    <PromptInputProvider>
      <MessagePageContent />
    </PromptInputProvider>
  );
};
export default MessagePage;