import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import AuthModal from '@/components/AuthModal';
import Sidebar from '@/components/chat/Sidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import SearchTab from '@/components/chat/SearchTab';
import ProfileTab from '@/components/chat/ProfileTab';

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

const Index = () => {
  const [activeTab, setActiveTab] = useState<'chats' | 'calls' | 'search' | 'profile'>('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

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

  useEffect(() => {
    if (currentUser) {
      loadChats();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedChat && currentUser) {
      loadMessages(selectedChat.id);
      
      const interval = setInterval(() => {
        loadMessages(selectedChat.id);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [selectedChat?.id]);

  useEffect(() => {
    if (currentUser && activeTab === 'chats') {
      const interval = setInterval(() => {
        loadChats();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser, activeTab]);

  const loadChats = async () => {
    if (!currentUser) return;
    
    setIsLoadingChats(true);
    try {
      const response = await fetch('https://functions.poehali.dev/ec02e22a-fc0e-43bd-ad09-453e209dc51d', {
        headers: {
          'X-User-Id': currentUser.id.toString(),
        },
      });
      const data = await response.json();
      
      const formattedChats: Chat[] = data.chats.map((chat: any) => ({
        id: chat.chat_id.toString(),
        user: {
          id: chat.other_user_id.toString(),
          username: chat.other_username,
          avatar: chat.other_avatar,
          status: chat.other_status,
        },
        lastMessage: {
          id: '1',
          text: chat.last_message || 'Новый чат',
          senderId: chat.other_user_id.toString(),
          timestamp: chat.last_message_time ? new Date(chat.last_message_time).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) : '',
        },
        unreadCount: chat.unread_count,
      }));
      
      setChats(formattedChats);
      if (formattedChats.length > 0 && !selectedChat) {
        setSelectedChat(formattedChats[0]);
        await loadMessages(formattedChats[0].id);
      }
      if (selectedChat) {
        const updatedChat = formattedChats.find(c => c.id === selectedChat.id);
        if (updatedChat) {
          setSelectedChat(updatedChat);
        }
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const handleStartChat = async (otherUserId: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/ec02e22a-fc0e-43bd-ad09-453e209dc51d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          action: 'create_chat',
          other_user_id: otherUserId,
        }),
      });
      
      const data = await response.json();
      await loadChats();
      setActiveTab('chats');
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to create chat:', error);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!currentUser) return;
    
    try {
      const response = await fetch('https://functions.poehali.dev/ec02e22a-fc0e-43bd-ad09-453e209dc51d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          action: 'delete_chat',
          chat_id: chatId,
        }),
      });
      
      if (response.ok) {
        if (selectedChat?.id === chatId) {
          setSelectedChat(null);
          setMessages([]);
        }
        await loadChats();
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://functions.poehali.dev/8dfc48fe-94ae-463c-9e18-886ae2f7748d?query=${encodeURIComponent(searchQuery)}`
        );
        const data = await response.json();
        setSearchResults(data.users || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

  const loadMessages = async (chatId: string) => {
    if (!currentUser) return;
    
    setIsLoadingMessages(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/ec02e22a-fc0e-43bd-ad09-453e209dc51d?chat_id=${chatId}`,
        {
          headers: {
            'X-User-Id': currentUser.id.toString(),
          },
        }
      );
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!selectedChat || !currentUser) return;

    try {
      await fetch('https://functions.poehali.dev/ec02e22a-fc0e-43bd-ad09-453e209dc51d', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': currentUser.id.toString(),
        },
        body: JSON.stringify({
          action: 'send_message',
          chat_id: selectedChat.id,
          text: text,
        }),
      });

      setMessageText('');
      await loadMessages(selectedChat.id);
      await loadChats();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
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
          <p className="text-muted-foreground">Войдите, чтобы начать общение</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        chats={chats}
        selectedChat={selectedChat}
        setSelectedChat={setSelectedChat}
        currentUser={currentUser}
        isLoadingChats={isLoadingChats}
        onLogout={handleLogout}
        searchContent={
          <SearchTab
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            isSearching={isSearching}
            onStartChat={handleStartChat}
          />
        }
        profileContent={
          <ProfileTab
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        }
      />

      <ChatWindow
        selectedChat={selectedChat}
        messages={messages}
        isLoadingMessages={isLoadingMessages}
        currentUser={currentUser}
        messageText={messageText}
        setMessageText={setMessageText}
        onSendMessage={handleSendMessage}
        onDeleteChat={handleDeleteChat}
        loadMessages={loadMessages}
      />
    </div>
  );
};

export default Index;
