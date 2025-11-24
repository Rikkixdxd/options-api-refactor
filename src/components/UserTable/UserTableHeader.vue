<template>
    <div class="table-header">
      <div class="header-left">
        <h2>{{ title }}</h2>
        <span class="total-count">{{ totalCount }} записей</span>
      </div>
      
      <div class="header-right">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Поиск по имени, email..."
          class="search-input"
        />
        
        <select v-model="filterRole" class="role-filter">
          <option value="">Все роли</option>
          <option value="admin">Администратор</option>
          <option value="user">Пользователь</option>
          <option value="moderator">Модератор</option>
        </select>
        
        <button 
          @click="emit('open-add-modal')"
          class="btn btn-primary"
          :disabled="isLoading"
        >
          + Добавить пользователя
        </button>
        
        <button 
          @click="emit('export-to-csv')"
          class="btn btn-secondary"
          :disabled="isLoading || selectedCount === 0 && !showAllUsers"
        >
          📥 Экспорт
        </button>
        
        <button 
          v-if="selectedCount > 0"
          @click="emit('delete-selected-users')"
          class="btn btn-danger"
        >
          🗑️ Удалить выбранные ({{ selectedCount }})
        </button>
      </div>
    </div>
</template>

<script setup lang="ts">
import { type UserRoles } from '@/types/user'
import { defineModel } from 'vue';

const props = withDefaults(defineProps<{
  title?: string;
  totalCount?: number;
  selectedCount?: number;
  isLoading?: boolean;
  showAllUsers?: boolean;
}>(),{
  title: 'Управление пользователями',
  totalCount: 0,
  selectedCount: 0,
  isLoading: true,
  showAllUsers: false
})

const searchQuery = defineModel<string>('searchQuery', { default: '' })
const filterRole = defineModel<UserRoles | ''>('filterRole', { default: '' })

const emit = defineEmits<{
  'export-to-csv': [value: void]
  'delete-selected-users': [value: void]
  'open-add-modal': [value: void]
}>()
</script>

<style scoped>
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.total-count {
  color: #666;
  font-size: 14px;
}

.header-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #4CAF50;
}

.role-filter {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #4CAF50;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #45a049;
}

.btn-secondary {
  background: #2196F3;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #0b7dda;
}

.btn-danger {
  background: #f44336;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #da190b;
}
</style>