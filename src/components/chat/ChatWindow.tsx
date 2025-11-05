import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

type User = {
  id: string;
  username: string;
  avatar?: string;
  status?: 'online' | 'offline';
};

type Message = {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isRead?: boolean;
};

type Chat = {
  id: string;
  user: User;
  lastMessage: Message;
  unreadCount?: number;
};

type ChatWindowProps = {
  selectedChat: Chat | null;
  messages: any[];
  isLoadingMessages: boolean;
  currentUser: any;
  messageText: string;
  setMessageText: (text: string) => void;
  onSendMessage: (text: string) => void;
  onDeleteChat: (chatId: string) => void;
  loadMessages: (chatId: string) => void;
};

const ChatWindow = ({
  selectedChat,
  messages,
  isLoadingMessages,
  currentUser,
  messageText,
  setMessageText,
  onSendMessage,
  onDeleteChat,
}: ChatWindowProps) => {
  const handleSendMessage = () => {
    if (messageText.trim()) {
      onSendMessage(messageText);
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center rounded-sm my-0 mx-0 bg-slate-500">
        <Icon name="MessageCircle" size={64} className="text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Выберите чат</h3>
        <p className="text-muted-foreground">Начните общение с друзьями</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Avatar>
          <AvatarImage src={selectedChat.user.avatar} />
          <AvatarFallback>{selectedChat.user.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="font-semibold">{selectedChat.user.username}</h2>
          <p className="text-xs text-muted-foreground">
            {selectedChat.user.status === 'online' ? 'онлайн' : 'был(а) недавно'}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Icon name="Phone" size={20} />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Icon name="Video" size={20} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full text-destructive hover:text-destructive"
          onClick={() => {
            if (confirm('Удалить чат для обоих пользователей?')) {
              onDeleteChat(selectedChat.id);
            }
          }}
        >
          <Icon name="Trash2" size={20} />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Загрузка сообщений...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <Icon name="MessageCircle" size={48} className="text-muted-foreground/50" />
              <p className="text-muted-foreground">Начните общение первым!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMyMessage = message.sender_id?.toString() === currentUser?.id?.toString();
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-2 ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={isMyMessage ? currentUser?.avatar : selectedChat.user.avatar} />
                    <AvatarFallback>
                      {isMyMessage 
                        ? currentUser?.username?.[0]?.toUpperCase() 
                        : selectedChat.user.username[0]?.toUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col gap-1 max-w-[70%] ${isMyMessage ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        isMyMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-accent text-accent-foreground'
                      }`}
                    >
                      <p className="text-sm break-words">{message.text}</p>
                    </div>
                    <span className="text-xs text-muted-foreground px-2">
                      {new Date(message.created_at).toLocaleTimeString('ru', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {isMyMessage && (
                        <Icon
                          name={message.is_read ? 'CheckCheck' : 'Check'}
                          size={14}
                          className="inline ml-1"
                        />
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2 items-center">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Icon name="Paperclip" size={20} />
          </Button>
          <Input
            placeholder="Введите сообщение..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button variant="ghost" size="icon" className="rounded-full">
            <Icon name="Smile" size={20} />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="rounded-full"
            onClick={handleSendMessage}
          >
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;