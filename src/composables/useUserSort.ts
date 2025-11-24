import type { SortColumn, SortDirection } from "@/types/sort"
import type { User } from "@/types/user"
import { computed, ref, type Ref } from "vue"

// Сортировка
export function useUserSort(filteredAndSearchedUsers: Ref<User[]>){

    const sortColumn = ref<SortColumn>('id')
    const sortDirection = ref<SortDirection>('asc')

    const sortedUsers = computed(() => {
      const users = [...filteredAndSearchedUsers.value];
      
      users.sort((a, b) => {
        let aVal: any = a[sortColumn.value];
        let bVal: any = b[sortColumn.value];
        
        if (sortColumn.value === 'registrationDate' || sortColumn.value === 'lastActivity') {
          aVal = aVal ? new Date(aVal).getTime() : 0;
          bVal = bVal ? new Date(bVal).getTime() : 0;
        } else if (typeof aVal === 'string' && typeof bVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) {
          return sortDirection.value === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortDirection.value === 'asc' ? 1 : -1;
        }
        return 0;
      });
      
      return users;
    })

    const sortBy = (column: SortColumn) => {
      if (sortColumn.value === column) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortColumn.value = column;
        sortDirection.value = 'asc';
      }
    }

    return {
      sortedUsers,
      sortColumn,
      sortDirection,
      sortBy
    }
}

export type { SortColumn, SortDirection }