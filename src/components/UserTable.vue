<template>
  <div class="user-table-container">

    <!-- Хедер с действиями -->
    <UserTableHeader 
      @delete-selected-users="deleteSelectedUsers"
      @export-to-csv="exportToCSV"
      @open-add-modal="openAddUserModal"
      v-model:search-query="searchQuery"
      v-model:filter-role="filterRole"
      :is-loading="isLoading"
      :selected-count="selectedUsers.length"
      :title="title"
      :show-all-users="showAllUsers"
      :total-count="filteredAndSearchedUsers.length"
    />

    <!-- Фильтры -->
    <UserTableFilters 
      @filter-clear="clearDateFilter"
      v-model:date-to="dateTo"
      v-model:filter-from="dateFrom"
      v-model:filter-status="filterStatus"
    />

    <!-- Загрузка -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Загрузка данных...</p>
    </div>

    <!-- Ошибка -->
    <div v-if="error || errorMessage" class="error-message">
      <span>❌ {{ error || errorMessage }}</span>
      <button @click="retryLoad" class="btn-retry">Повторить</button>
    </div>

    <!-- Таблица -->
    <UserTableBody
      v-if="!isLoading && !error"
      @cancel-edit="cancelEdit"
      @clear-all-filters="clearAllFilters"
      @delete-user="deleteUser"
      @open-user-details="openUserDetails"
      @save-edit="saveEdit"
      @sort-by="sortBy"
      @toggle-select-all="toggleSelectAll"
      @toggle-select-user="toggleSelectUser"
      @toggle-user-status="toggleUserStatus"
      @start-edit="startEdit"
      :edit-form="editForm"
      :editing-user-id="editingUserId"
      :is-all-selected="isAllSelected"
      :selected-users="selectedUsers"
      :sort-column="sortColumn"
      :sort-direction="sortDirection"
      :users="paginatedUsers"
    />

    <!-- Пагинация -->
    <UserTablePagination 
      v-if="!isLoading"
      :current-page="currentPage"
      :total-items="sortedUsers.length"
      :filtered-and-searched-users="filteredAndSearchedUsers"
      :pagination-start="paginationStart"
      :pagination-end="paginationEnd"
      :total-pages="totalPages"
      :visible-pages="visiblePages"
      v-model:pageSize="pageSize"
      @go-to-page="goToPage"
      @update:page-size-change="handlePageSizeChange"
    />
    
    <!-- Модальное окно добавления пользователя -->
    <UserTableAddModal 
      v-if="showAddUserModal"
      @close="closeAddUserModal"
      @validate-new-user-name="validateNewUserName"
      @validate-new-user-email="validateNewUserEmail($event, users)"
      @add-new-user="handleAddNewUser"
      :new-user="newUser"
      :new-user-errors="newUserErrors"
      :is-new-user-valid="isNewUserValid"
      :busy="busy"
    />

    <!-- Модальное окно деталей пользователя -->
    <UserTableDetailsModal 
      v-if="showDetailsModal"
      @close="closeDetailsModal"
      :selected-user="selectedUser"
    />
     
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useUsers } from '@/composables/useUsers';
import { useUserFilters } from '@/composables/useUserFilters';
import { usePagination } from '@/composables/usePagination';
import { useUtility } from '@/composables/useUtility';
import { useUserSort } from '@/composables/useUserSort';
import type { User } from '@/types/user';
import UserTableFilters from './UserTable/UserTableFilters.vue';
import UserTableHeader from './UserTable/UserTableHeader.vue';
import UserTableBody from './UserTable/UserTableBody.vue';
import UserTablePagination from './UserTable/UserTablePagination.vue';
import UserTableAddModal from './UserTable/UserTableAddModal.vue';
import UserTableDetailsModal from './UserTable/UserTableDetailsModal.vue';
import { useValidate } from '@/composables/useValidate';

const handleAddNewUser = async () => {
  await addNewUser()
  closeAddUserModal()
}

const retryLoad = async () => {
  await loadUsers();
}

// Поиск
const handleSearch = () => {
  // Дебаунс можно добавить здесь
}

// Выбор строк
const toggleSelectUser = (userId: number) => {
  const index = selectedUsers.value.indexOf(userId);
  if (index > -1) {
    selectedUsers.value.splice(index, 1);
  } else {
    selectedUsers.value.push(userId);
  }
}

const toggleSelectAll = () => {
  
  if (isAllSelected.value) {
    paginatedUsers.value.forEach(user => {
      const index = selectedUsers.value.indexOf(user.id);
      if (index > -1) {
        selectedUsers.value.splice(index, 1);
      }
    });
  } else {
    paginatedUsers.value.forEach(user => {
      if (!selectedUsers.value.includes(user.id)) {
        selectedUsers.value.push(user.id);
      }
    });
  }
}

// Модальное окно добавления
const openAddUserModal = () => {
  showAddUserModal.value = true;
  newUser.value = {
    name: '',
    email: '',
    role: 'user',
    sendWelcomeEmail: true
  };
  newUserErrors.value = {
    name: '',
    email: ''
  };
}

const closeAddUserModal = () => {
  showAddUserModal.value = false;
}

// Модальное окно деталей
const openUserDetails = (user: User) => {
  selectedUser.value = user;
  showDetailsModal.value = true;
}

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedUser.value = null;
}

// Экспорт
const exportToCSV = () => {
  const usersToExport = selectedUsers.value.length > 0
    ? users.value.filter(u => selectedUsers.value.includes(u.id))
    : sortedUsers.value;
  
  const headers = ['ID', 'Имя', 'Email', 'Роль', 'Статус', 'Дата регистрации'];
  const rows = usersToExport.map(user => [
    user.id,
    user.name,
    user.email,
    getRoleLabel(user.role),
    user.status === 'active' ? 'Активен' : 'Неактивен',
    formatDate(user.registrationDate)
  ]);
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `users_export_${new Date().getTime()}.csv`;
  link.click();
}

const props = withDefaults(
  defineProps<{
    title?: string,
    initialPageSize?: number,
    apiEndpoint?: string
  }>(),
  {
    title: 'Управление пользователями',
    initialPageSize: 25,
    apiEndpoint: '/api/users'
  }
)

// Окружение
const isLoading = ref(true)
const error = ref<string | null>(null)

// Выбор строк
const selectedUsers = ref<number[]>([])
const showAllUsers = ref(false) // не используется

// Модальные окна
const showAddUserModal = ref(false)
const showDetailsModal = ref(false)
const selectedUser = ref<User | null>(null)

// Пагинация
const pageSize = ref(props.initialPageSize)

const { 
  loadUsers,
  saveEdit,
  startEdit,
  addNewUser,
  cancelEdit,
  deleteSelectedUsers,
  deleteUser,
  toggleUserStatus,
  editForm,
  editingUserId,
  isNewUserValid,
  busy,
  errorMessage,
  newUser,
  newUserErrors,
  users,
} = useUsers(selectedUsers)

const {
  formatDate,
  formatRelativeTime,
  getActivityClass,
  getDefaultAvatar,
  getRoleLabel,
} = useUtility()

const {
  clearAllFilters,
  clearDateFilter,
  dateFilteredUsers,
  dateFrom,
  dateTo,
  filterRole,
  filterStatus,
  filteredAndSearchedUsers,
  searchQuery,
} = useUserFilters(users)

const {
  sortBy,
  sortedUsers,
  sortColumn,
  sortDirection,
} = useUserSort(filteredAndSearchedUsers)

const {
  goToPage,
  handlePageSizeChange,
  isAllSelected,
  currentPage,
  paginatedUsers,
  paginationEnd,
  paginationStart,
  totalPages,
  visiblePages,
} = usePagination(sortedUsers, pageSize, selectedUsers)

const {
  validateNewUserEmail,
  validateNewUserName,
} = useValidate()

watch(
  () => [searchQuery.value, filterRole.value, filterStatus.value, dateFrom.value, dateTo.value, pageSize.value],
  () => {
    currentPage.value = 1;
  }
);

watch(
  () => searchQuery.value,
  () => handleSearch()
)

onMounted(async () => {
  error.value = await loadUsers() ?? null
  isLoading.value = false
})

</script>

<style scoped>
.user-table-container {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100vh;
}

.loading-overlay {
  background: white;
  padding: 60px 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #ffebee;
  color: #c62828;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-retry {
  padding: 8px 16px;
  background: #c62828;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>