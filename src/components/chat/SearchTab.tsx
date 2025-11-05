import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

type SearchTabProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: any[];
  isSearching: boolean;
  onStartChat: (userId: string) => void;
};

const SearchTab = ({
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  onStartChat,
}: SearchTabProps) => {
  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4">
        <div className="relative">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Поиск пользователей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Поиск...</p>
            </div>
          ) : searchQuery.length < 2 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Icon name="Search" size={48} className="text-muted-foreground/50" />
              <p className="text-muted-foreground text-center">Введите минимум 2 символа</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Icon name="UserX" size={48} className="text-muted-foreground/50" />
              <p className="text-muted-foreground text-center">Пользователи не найдены</p>
            </div>
          ) : (
            searchResults.map((user) => (
              <div
                key={user.id}
                className="p-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3"
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {user.status === 'online' && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{user.username}</h3>
                  <p className="text-xs text-muted-foreground">
                    {user.status === 'online' ? 'онлайн' : 'был(а) недавно'}
                  </p>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="rounded-full"
                  onClick={() => onStartChat(user.id)}
                >
                  <Icon name="MessageCircle" size={16} className="mr-1" />
                  Написать
                </Button>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SearchTab;
