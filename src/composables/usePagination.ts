import type { User } from "@/types/user";
import { computed, ref, type Ref } from "vue";

// Пагинация
export function usePagination(sortedUsers: Ref<User[]>, pageSize: Ref<number>, selectedUsers: Ref<number[]>) {

  const currentPage = ref<number>(1)

  const isAllSelected = computed(() => {
    return paginatedUsers.value.length > 0 &&
      paginatedUsers.value.every(user => selectedUsers.value.includes(user.id));
  })

  const totalPages = computed(() => {
    return Math.ceil(sortedUsers.value.length / pageSize.value);
  })

  const paginationStart = computed(() => {
    return (currentPage.value - 1) * pageSize.value + 1;
  })

  const paginationEnd = computed(() => {
    const end = currentPage.value * pageSize.value;
    return end > sortedUsers.value.length ? sortedUsers.value.length : end;
  })

  const paginatedUsers = computed<User[]>(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    
    return sortedUsers.value.slice(start, end);
  })

  const visiblePages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(total);
      }
    }

    return pages;
  })

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const handlePageSizeChange = () => {
    currentPage.value = 1;
  }

  return {
    isAllSelected,
    currentPage,
    totalPages,
    paginationStart,
    paginationEnd,
    paginatedUsers,
    visiblePages,
    goToPage,
    handlePageSizeChange,
  }

}