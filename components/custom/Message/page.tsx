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
import { Fragment } from 'react';
const MessagePageContent = () => {
  const { messages, sendMessage, status, regenerate } = useChat();
  const { textInput } = usePromptInputController();
  const handleSubmit = async (message: { text: string; files: any[] }, e: React.FormEvent) => {
    if (message.text.trim()) {
      sendMessage({ text: message.text });
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full rounded-lg border h-[600px]">
      <div className="flex flex-col h-full">
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