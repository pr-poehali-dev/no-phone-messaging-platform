import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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

type SidebarProps = {
  activeTab: 'chats' | 'calls' | 'search' | 'profile';
  setActiveTab: (tab: 'chats' | 'calls' | 'search' | 'profile') => void;
  chats: Chat[];
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
  currentUser: any;
  isLoadingChats: boolean;
  onLogout: () => void;
  searchContent?: React.ReactNode;
  profileContent?: React.ReactNode;
};

const Sidebar = ({
  activeTab,
  setActiveTab,
  chats,
  selectedChat,
  setSelectedChat,
  currentUser,
  isLoadingChats,
  onLogout,
  searchContent,
  profileContent,
}: SidebarProps) => {
  return (
    <div className="w-96 border-r border-border bg-background flex flex-col h-screen">
      <div className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Icon name="Rocket" size={28} className="text-primary" />
          Космочат
        </h1>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-full"
            onClick={() => setActiveTab('chats')}
          >
            <Icon name="MessageCircle" size={20} />
          </Button>
          <Button
            variant={activeTab === 'calls' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-full"
            onClick={() => setActiveTab('calls')}
          >
            <Icon name="Phone" size={20} />
          </Button>
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-full"
            onClick={() => setActiveTab('search')}
          >
            <Icon name="Search" size={20} />
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            size="icon"
            className="rounded-full"
            onClick={() => setActiveTab('profile')}
          >
            <Icon name="User" size={20} />
          </Button>
        </div>
      </div>

      {activeTab === 'chats' && (
        <ScrollArea className="flex-1">
          <div className="p-2">
            {isLoadingChats ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            ) : chats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Icon name="MessageCircle" size={48} className="text-muted-foreground/50" />
                <p className="text-muted-foreground text-center">Нет активных чатов</p>
                <p className="text-sm text-muted-foreground/70 text-center">
                  Найдите друзей через поиск
                </p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`w-full p-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3 ${
                    selectedChat?.id === chat.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={chat.user.avatar} />
                      <AvatarFallback>{chat.user.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    {chat.user.status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
                    )}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{chat.user.username}</h3>
                      <span className="text-xs text-muted-foreground">{chat.lastMessage.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage.text}</p>
                  </div>
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <Badge variant="default" className="rounded-full">{chat.unreadCount}</Badge>
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      )}

      {activeTab === 'calls' && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Icon name="Phone" size={64} className="text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Звонки</h3>
          <p className="text-muted-foreground">История звонков появится здесь</p>
        </div>
      )}

      {activeTab === 'search' && searchContent}
      {activeTab === 'profile' && profileContent}
    </div>
  );
};

export default Sidebar;
