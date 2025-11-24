import type { User, UserRoles, UserStatus } from "@/types/user";


// Утилиты
export function useUtility(){

  const getRoleLabel = (role: UserRoles | ''): string => {
    if (role === '') return '';
    const labels: Record<UserRoles, string> = {
      admin: 'Администратор',
      user: 'Пользователь',
      moderator: 'Модератор',
    };
    return labels[role] ?? role;
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  const formatRelativeTime = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 30) return `${diffDays} дн. назад`;
    return formatDate(dateString);
  }
  
  const getActivityClass = (dateString?: string): string => {
    if (!dateString) return 'activity-old';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    
    if (diffDays < 1) return 'activity-recent';
    if (diffDays < 7) return 'activity-week';
    if (diffDays < 30) return 'activity-month';
    return 'activity-old';
  }
  
  const getDefaultAvatar = (name: string): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const initial = name.charAt(0).toUpperCase();
    const colorIndex = name.charCodeAt(0) % colors.length;
    const color = colors[colorIndex] ?? '#FF6B6B';
    
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='${encodeURIComponent(color)}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='20' fill='white'%3E${initial}%3C/text%3E%3C/svg%3E`;
  }
  
  // Генерация mock данных
  const generateMockUsers = (count: number) => {
      const roles: UserRoles[] = ['admin', 'user', 'moderator'];
      const statuses: UserStatus[] = ['active', 'inactive'];
      const names = ['Иван Петров', 'Мария Сидорова', 'Алексей Иванов', 'Елена Кузнецова',
          'Дмитрий Смирнов', 'Ольга Попова', 'Сергей Васильев', 'Анна Соколова',
          'Николай Михайлов', 'Татьяна Новикова'];

      const users: User[] = [];
      for (let i = 1; i <= count; i++) {
          const name = names[Math.floor(Math.random() * names.length)] + ' ' + i;
          const registrationDate = new Date(2020, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
          const lastActivity = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));

          users.push({
              id: i,
              name: name,
              email: `user${i}@example.com`,
              role: roles[Math.floor(Math.random() * roles.length)] ?? 'user',
              status: statuses[Math.floor(Math.random() * statuses.length)] ?? 'active',
              registrationDate: registrationDate.toISOString(),
              lastActivity: lastActivity.toISOString(),
              avatar: null,
              loginCount: Math.floor(Math.random() * 500),
              postsCount: Math.floor(Math.random() * 100),
              commentsCount: Math.floor(Math.random() * 300)
          });
      }
      return users;
  }
  

  return {
    getRoleLabel,
    formatDate,
    formatRelativeTime,
    getActivityClass,
    getDefaultAvatar,
    generateMockUsers
  }
}