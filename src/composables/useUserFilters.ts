import type { User, UserRoles, UserStatus } from "@/types/user"
import { computed, ref, type Ref } from "vue"

export function useUserFilters(users: Ref<User[]>){

  // Поиск и фильтрация
  const dateFrom = ref<string>('')
  const dateTo = ref<string>('')
  const searchQuery = ref<string>('')
  const filterRole = ref<UserRoles | ''>('')
  const filterStatus = ref<UserStatus>('')
  
  // Фильтрация по роли
  const roleFilteredUsers = computed(() => {
    if (!filterRole.value) {
      return users.value;
    }
    return users.value.filter(user => user.role === filterRole.value);
  })
  
  // Фильтрация по статусу
  const statusFilteredUsers = computed(() => {
    if (!filterStatus.value) {
      return roleFilteredUsers.value;
    }
    return roleFilteredUsers.value.filter(user => user.status === filterStatus.value);
  })
  
  // Фильтрация по датам
  const dateFilteredUsers = computed(() => {
    let filtered = statusFilteredUsers.value;
    
    if (dateFrom.value) {
      const fromDate = new Date(dateFrom.value);
      filtered = filtered.filter(user => {
        if (!user.registrationDate) return false;
        const userDate = new Date(user.registrationDate);
        return userDate >= fromDate;
      });
    }
    
    if (dateTo.value) {
      const toDate = new Date(dateTo.value);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(user => {
        if (!user.registrationDate) return false;
        const userDate = new Date(user.registrationDate);
        return userDate <= toDate;
      });
    }
    
    return filtered;
  })

  const filteredAndSearchedUsers = computed(() => {
    if (!searchQuery.value.trim()) {
      return dateFilteredUsers.value;
    }
    
    const query = searchQuery.value.toLowerCase().trim();
    return dateFilteredUsers.value.filter(user => {
      return user.name.toLowerCase().includes(query) ||
              user.email.toLowerCase().includes(query) ||
              user.id.toString().includes(query);
    });
  })
  
  // Очистка фильтров
  const clearDateFilter = () => {
    dateFrom.value = '';
    dateTo.value = '';
  }
  
  const clearAllFilters = () => {
    searchQuery.value = '';
    filterRole.value = '';
    filterStatus.value = '';
    dateFrom.value = '';
    dateTo.value = '';
  }

  return {
    dateFrom,
    dateTo,
    searchQuery,
    filterRole,
    filterStatus,
    roleFilteredUsers,
    statusFilteredUsers,
    dateFilteredUsers,
    filteredAndSearchedUsers,
    clearDateFilter,
    clearAllFilters,
  }
}