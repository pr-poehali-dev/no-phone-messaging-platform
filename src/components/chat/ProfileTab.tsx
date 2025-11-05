import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

type ProfileTabProps = {
  currentUser: any;
  onLogout: () => void;
};

const ProfileTab = ({ currentUser, onLogout }: ProfileTabProps) => {
  return (
    <ScrollArea className="flex-1">
      <div className="p-6">
        <div className="flex flex-col items-center gap-4 mb-8">
          <Avatar className="w-24 h-24">
            <AvatarImage src={currentUser?.avatar} />
            <AvatarFallback className="text-3xl">
              {currentUser?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-bold">{currentUser?.username}</h2>
            <p className="text-sm text-muted-foreground">онлайн</p>
          </div>
        </div>

        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Icon name="User" size={20} />
            Редактировать профиль
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Icon name="Bell" size={20} />
            Уведомления
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Icon name="Lock" size={20} />
            Приватность
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Icon name="Palette" size={20} />
            Тема оформления
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Icon name="HelpCircle" size={20} />
            Помощь
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive"
            onClick={onLogout}
          >
            <Icon name="LogOut" size={20} />
            Выйти
          </Button>
        </div>

        <div className="mt-8 p-4 bg-accent rounded-lg">
          <div className="flex items-start gap-3">
            <Icon name="Rocket" size={24} className="text-primary mt-1" />
            <div>
              <h3 className="font-semibold mb-1">Космочат Premium</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Получите доступ к эксклюзивным функциям
              </p>
              <Button size="sm" variant="default" className="w-full">
                Подробнее
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default ProfileTab;
