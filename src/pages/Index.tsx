import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import AuthModal from '@/components/AuthModal';

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

const mockChats: Chat[] = [
  {
    id: '1',
    user: { id: 'u1', username: 'космонавт_alex', avatar: '', status: 'online' },
    lastMessage: { id: 'm1', text: 'Привет! Как дела?', senderId: 'u1', timestamp: '14:32', isRead: false },
    unreadCount: 2,
  },
  {
    id: '2',
    user: { id: 'u2', username: 'stargazer', avatar: '', status: 'online' },
    lastMessage: { id: 'm2', text: 'Отлично, спасибо!', senderId: 'me', timestamp: '13:15', isRead: true },
  },
  {
    id: '3',
    user: { id: 'u3', username: 'moonwalker', avatar: '', status: 'offline' },
    lastMessage: { id: 'm3', text: 'Увидимся завтра', senderId: 'u3', timestamp: '12:00', isRead: true },
  },
];

const mockMessages: Message[] = [
  { id: 'm1', text: 'Привет!', senderId: 'u1', timestamp: '14:30', isRead: true },
  { id: 'm2', text: 'Как твои дела?', senderId: 'u1', timestamp: '14:31', isRead: true },
  { id: 'm3', text: 'Привет! Отлично, а у тебя?', senderId: 'me', timestamp: '14:32', isRead: true },
  { id: 'm4', text: 'Тоже хорошо!', senderId: 'u1', timestamp: '14:32', isRead: false },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'calls' | 'search' | 'profile'>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(mockChats[0]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setAuthToken(token);
      setCurrentUser(JSON.parse(user));
    } else {
      setIsAuthModalOpen(true);
    }
  }, []);

  const handleAuthSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setAuthToken(null);
    setIsAuthModalOpen(true);
  };

  if (!currentUser) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => {}} 
          onSuccess={handleAuthSuccess}
        />
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
            <Icon name="Rocket" size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Добро пожаловать!</h1>
          <p className="text-muted-foreground">Войдите или зарегистрируйтесь</p>
        </div>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      setMessageText('');
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {activeTab === 'chats' && selectedChat && (
        <div className="w-full md:w-[400px] border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Чаты
              </h1>
            </div>
            <Input
              placeholder="Поиск чатов..."
              className="bg-muted border-none"
            />
          </div>

          <ScrollArea className="flex-1">
            {mockChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedChat?.id === chat.id ? 'bg-muted' : ''
                }`}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={chat.user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                      {chat.user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {chat.user.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">{chat.user.username}</h3>
                    <span className="text-xs text-muted-foreground">{chat.lastMessage.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.lastMessage.text}</p>
                </div>
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <Badge className="bg-gradient-to-r from-primary to-secondary animate-pulse-subtle">
                    {chat.unreadCount}
                  </Badge>
                )}
              </div>
            ))}
          </ScrollArea>
        </div>
      )}

      {activeTab === 'chats' && selectedChat && (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedChat.user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                {selectedChat.user.username[0].toUpperCase()}
              </AvatarFallback>
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
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-2xl ${
                      message.senderId === 'me'
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <span className={`text-xs ${message.senderId === 'me' ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {message.timestamp}
                      </span>
                      {message.senderId === 'me' && (
                        <Icon name={message.isRead ? 'CheckCheck' : 'Check'} size={14} className="text-white/70" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Icon name="Paperclip" size={20} />
              </Button>
              <Input
                placeholder="Написать сообщение..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-muted border-none"
              />
              <Button
                onClick={handleSendMessage}
                className="rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                size="icon"
              >
                <Icon name="Send" size={20} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'calls' && (
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Icon name="Phone" size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold">История звонков</h2>
          <p className="text-muted-foreground">Пока нет звонков</p>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="flex-1 flex flex-col p-6">
          <div className="max-w-2xl mx-auto w-full space-y-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Поиск пользователей
            </h1>
            <div className="relative">
              <Input
                placeholder="Введите никнейм пользователя..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-muted border-none text-lg"
              />
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>

            {searchQuery && (
              <div className="space-y-2">
                <h3 className="text-sm text-muted-foreground mb-3">Результаты поиска:</h3>
                {[
                  { username: 'космонавт_alex', status: 'online' },
                  { username: 'space_explorer', status: 'offline' },
                ].map((user, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-card rounded-xl flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                        {user.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{user.username}</h3>
                      <p className="text-xs text-muted-foreground">
                        {user.status === 'online' ? 'онлайн' : 'не в сети'}
                      </p>
                    </div>
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                      Написать
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
          <Avatar className="h-32 w-32">
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-4xl">
              {currentUser.username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">{currentUser?.username || 'rocket_pilot'}</h2>
            <p className="text-muted-foreground">ID: {currentUser?.id || 'me'}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Icon name="Edit" size={18} />
              Изменить профиль
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleLogout}>
              <Icon name="LogOut" size={18} />
              Выйти
            </Button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 md:hidden">
        <div className="flex justify-around">
          <Button
            variant={activeTab === 'chats' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveTab('chats')}
            className={activeTab === 'chats' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            <Icon name="MessageSquare" size={22} />
          </Button>
          <Button
            variant={activeTab === 'calls' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveTab('calls')}
            className={activeTab === 'calls' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            <Icon name="Phone" size={22} />
          </Button>
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveTab('search')}
            className={activeTab === 'search' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            <Icon name="Search" size={22} />
          </Button>
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setActiveTab('profile')}
            className={activeTab === 'profile' ? 'bg-gradient-to-r from-primary to-secondary' : ''}
          >
            <Icon name="User" size={22} />
          </Button>
        </div>
      </div>

      <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-card border-r border-border flex-col items-center py-6 gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-8">
          <Icon name="Rocket" size={24} className="text-white" />
        </div>
        <Button
          variant={activeTab === 'chats' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setActiveTab('chats')}
          className={`rounded-xl ${activeTab === 'chats' ? 'bg-gradient-to-r from-primary to-secondary' : ''}`}
        >
          <Icon name="MessageSquare" size={22} />
        </Button>
        <Button
          variant={activeTab === 'calls' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setActiveTab('calls')}
          className={`rounded-xl ${activeTab === 'calls' ? 'bg-gradient-to-r from-primary to-secondary' : ''}`}
        >
          <Icon name="Phone" size={22} />
        </Button>
        <Button
          variant={activeTab === 'search' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setActiveTab('search')}
          className={`rounded-xl ${activeTab === 'search' ? 'bg-gradient-to-r from-primary to-secondary' : ''}`}
        >
          <Icon name="Search" size={22} />
        </Button>
        <div className="flex-1" />
        <Button
          variant={activeTab === 'profile' ? 'default' : 'ghost'}
          size="icon"
          onClick={() => setActiveTab('profile')}
          className={`rounded-xl ${activeTab === 'profile' ? 'bg-gradient-to-r from-primary to-secondary' : ''}`}
        >
          <Icon name="User" size={22} />
        </Button>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .flex.h-screen {
            padding-left: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default Index;