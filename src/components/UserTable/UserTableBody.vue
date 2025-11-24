<template>
    <div  class="table-wrapper">
      <table class="user-table">
        <thead>
          <tr>
            <th>
              <input 
                type="checkbox" 
                :checked="isAllSelected"
                @change="emit('toggle-select-all')"
              />
            </th>
            <th 
              @click="emit('sort-by', 'id')"
              :class="{ sortable: true, active: sortColumn === 'id' }"
            >
              ID
              <span v-if="sortColumn === 'id'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th 
              @click="emit('sort-by', 'name')"
              :class="{ sortable: true, active: sortColumn === 'name' }"
            >
              Имя
              <span v-if="sortColumn === 'name'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th 
              @click="emit('sort-by', 'email')"
              :class="{ sortable: true, active: sortColumn === 'email' }"
            >
              Email
              <span v-if="sortColumn === 'email'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Роль</th>
            <th>Статус</th>
            <th 
              @click="emit('sort-by', 'registrationDate')"
              :class="{ sortable: true, active: sortColumn === 'registrationDate' }"
            >
              Дата регистрации
              <span v-if="sortColumn === 'registrationDate'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Последняя активность</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="user in users" 
            :key="user.id"
            :class="{ 
              selected: selectedUsers.includes(user.id),
              editing: editingUserId === user.id,
              inactive: user.status === 'inactive'
            }"
          >
            <td>
              <input 
                type="checkbox" 
                :checked="selectedUsers.includes(user.id)"
                @change="emit('toggle-select-user', user.id)"
              />
            </td>
            <td>{{ user.id }}</td>
            <td>
              <div v-if="editingUserId === user.id">
                <input 
                  v-model="editForm.name"
                  type="text"
                  class="edit-input"
                />
              </div>
              <div v-else class="user-name-cell">
                <img 
                  :src="user.avatar || getDefaultAvatar(user.name)" 
                  :alt="user.name"
                  class="avatar"
                />
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td>
              <div v-if="editingUserId === user.id">
                <input 
                  v-model="editForm.email"
                  type="email"
                  class="edit-input"
                />
              </div>
              <div v-else>{{ user.email }}</div>
            </td>
            <td>
              <div v-if="editingUserId === user.id">
                <select v-model="editForm.role" class="edit-select">
                  <option value="admin">Администратор</option>
                  <option value="user">Пользователь</option>
                  <option value="moderator">Модератор</option>
                </select>
              </div>
              <div v-else>
                <span :class="['role-badge', 'role-' + user.role]">
                  {{ getRoleLabel(user.role) }}
                </span>
              </div>
            </td>
            <td>
              <span 
                :class="['status-badge', user.status === 'active' ? 'status-active' : 'status-inactive']"
                @click="emit('toggle-user-status', user.id)"
                :style="{ cursor: 'pointer' }"
              >
                {{ user.status === 'active' ? '✓ Активен' : '✗ Неактивен' }}
              </span>
            </td>
            <td>{{ formatDate(user.registrationDate) }}</td>
            <td>
              <span :class="getActivityClass(user.lastActivity)">
                {{ formatRelativeTime(user.lastActivity) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  v-if="editingUserId !== user.id"
                  @click="emit('start-edit', user)"
                  class="btn-icon"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button 
                  v-if="editingUserId === user.id"
                  @click="emit('save-edit', user.id)"
                  class="btn-icon btn-success"
                  title="Сохранить"
                >
                  ✓
                </button>
                <button 
                  v-if="editingUserId === user.id"
                  @click="emit('cancel-edit')"
                  class="btn-icon btn-cancel"
                  title="Отмена"
                >
                  ✗
                </button>
                <button 
                  v-if="editingUserId !== user.id"
                  @click="emit('open-user-details', user)"
                  class="btn-icon"
                  title="Подробнее"
                >
                  👁️
                </button>
                <button 
                  v-if="editingUserId !== user.id"
                  @click="emit('delete-user', user.id)"
                  class="btn-icon btn-danger"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Сообщение если нет данных -->
      <div v-if="users.length === 0" class="no-data">
        <p>😔 Нет данных для отображения</p>
        <button @click="emit('clear-all-filters')" class="btn btn-primary">
          Сбросить фильтры
        </button>
      </div>
    </div>
</template>

<script setup lang="ts">
import type { SortColumn, SortDirection } from '@/composables/useUserSort';
import type { EditForm } from '@/types/user';
import { useUtility } from '@/composables/useUtility';
import type { User } from '@/types/user';

const { 
  getDefaultAvatar,
  getRoleLabel,
  formatDate,
  getActivityClass,
  formatRelativeTime 
} = useUtility()

const props = withDefaults(
  defineProps<{
    isAllSelected?: boolean
    sortColumn?: SortColumn
    sortDirection?: SortDirection
    users?: User[]
    selectedUsers?: number[]
    editingUserId?: number | null
    editForm?: EditForm
  }>(),
  {
    isAllSelected: false,
    sortColumn: 'id',
    sortDirection: 'asc',
    users: undefined,
    selectedUsers: undefined,
    editingUserId: undefined,
    editForm: undefined
  }
)

const emit = defineEmits<{
  'toggle-select-all': [value: void]
  'sort-by': [value: SortColumn]
  'toggle-select-user': [value: number]
  'toggle-user-status': [value: number]
  'start-edit': [value: User]
  'save-edit': [value: number]
  'cancel-edit': [value: void]
  'open-user-details': [value: User]
  'delete-user': [value: number]
  'clear-all-filters': [value: void]
}>()

</script>

<style scoped>
.table-wrapper {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
}

.user-table thead {
  background: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.user-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #555;
  font-size: 14px;
}

.user-table th.sortable {
  cursor: pointer;
  user-select: none;
}

.user-table th.sortable:hover {
  background: #eeeeee;
}

.user-table th.active {
  color: #4CAF50;
}

.user-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
}

.user-table tbody tr {
  transition: background 0.2s;
}

.user-table tbody tr:hover {
  background: #fafafa;
}

.user-table tbody tr.selected {
  background: #e8f5e9;
}

.user-table tbody tr.editing {
  background: #fff9c4;
}

.user-table tbody tr.inactive {
  opacity: 0.6;
}

.user-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.role-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.role-admin {
  background: #ffebee;
  color: #c62828;
}

.role-user {
  background: #e3f2fd;
  color: #1565c0;
}

.role-moderator {
  background: #fff3e0;
  color: #e65100;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-inactive {
  background: #ffebee;
  color: #c62828;
}

.activity-recent {
  color: #2e7d32;
  font-weight: 500;
}

.activity-week {
  color: #1565c0;
}

.activity-month {
  color: #e65100;
}

.activity-old {
  color: #757575;
}

.action-buttons {
  display: flex;
  gap: 5px;
}

.btn-icon {
  padding: 6px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f0f0f0;
  transform: scale(1.1);
}

.btn-icon.btn-success {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.btn-icon.btn-cancel {
  background: #ff9800;
  color: white;
  border-color: #ff9800;
}

.btn-icon.btn-danger {
  border-color: #f44336;
}

.btn-icon.btn-danger:hover {
  background: #f44336;
  color: white;
}

.edit-input,
.edit-select {
  padding: 6px 10px;
  border: 1px solid #4CAF50;
  border-radius: 4px;
  width: 100%;
  font-size: 14px;
}

.no-data {
  padding: 60px 20px;
  text-align: center;
  color: #999;
}

.no-data p {
  font-size: 18px;
  margin-bottom: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover {
  background: #45a049;
}
</style>