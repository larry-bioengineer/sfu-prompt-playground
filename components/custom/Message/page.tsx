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

// Separate component that uses useChat - will remount when key changes
const ChatInterface = ({ systemMessage }: { systemMessage: string }) => {
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

  // useEffect(() => {
  //   console.log(status);
  // }, [status]);
  
  return (
    <>
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
          status={status}
          disabled={!textInput.value.trim()}
          className="absolute bottom-1 right-1"
        />
      </PromptInput>
    </>
  );
};

const MessagePageContent = ({ chatId }: { chatId: string }) => {
  const [systemMessage, setSystemMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch system message from API on mount and when chatId changes
  useEffect(() => {
    const fetchSystemMessage = async () => {
      if (!chatId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/system-message?chatId=${encodeURIComponent(chatId)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch system message');
        }

        const data = await response.json();
        setSystemMessage(data.message || '');
      } catch (error) {
        console.error('Error fetching system message:', error);
        setSystemMessage('');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSystemMessage();
  }, [chatId]);

  // Listen for system message updates from SystemMessage component
  useEffect(() => {
    const handleSystemMessageUpdate = async () => {
      if (!chatId) return;

      try {
        const response = await fetch(`/api/system-message?chatId=${encodeURIComponent(chatId)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch system message');
        }

        const data = await response.json();
        setSystemMessage(data.message || '');
      } catch (error) {
        console.error('Error fetching system message:', error);
      }
    };

    window.addEventListener('systemMessageUpdated', handleSystemMessageUpdate);

    return () => {
      window.removeEventListener('systemMessageUpdated', handleSystemMessageUpdate);
    };
  }, [chatId]);

  return (
    <div className="max-w-4xl mx-auto p-6 relative w-full h-full rounded-lg border">
      <div className="flex flex-col h-full">
        <div className="flex justify-end mb-4">
          <SystemMessage chatId={chatId} />
        </div>
        {/* Key prop forces remount when systemMessage changes, ensuring useChat uses new transport */}
        {!isLoading && <ChatInterface key={systemMessage} systemMessage={systemMessage} />}
      </div>
    </div>
  );
};

const MessagePage = ({ chatId }: { chatId: string }) => {
  return (
    <PromptInputProvider>
      <MessagePageContent chatId={chatId} />
    </PromptInputProvider>
  );
};
export default MessagePage;