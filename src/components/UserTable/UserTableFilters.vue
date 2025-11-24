<template>
  <div class="filters-section">
    <div class="filter-group">
      <label>Статус:</label>
      <button 
        :class="['filter-btn', { active: filterStatus === '' }]"
        @click="emit('update:filter-status','')"
      >
        Все
      </button>
      <button 
        :class="['filter-btn', { active: filterStatus === 'active' }]"
        @click="emit('update:filter-status', 'active')"
      >
        Активные
      </button>
      <button 
        :class="['filter-btn', { active: filterStatus === 'inactive' }]"
        @click="emit('update:filter-status', 'inactive')"
      >
        Неактивные
      </button>
    </div>
    
    <div class="filter-group">
      <label>Дата регистрации:</label>
      <input 
        v-model="dateFrom" 
        type="date" 
        class="date-input"
      />
      <span>-</span>
      <input 
        v-model="dateTo" 
        type="date" 
        class="date-input"
      />
      <button 
        @click="emit('filter-clear')"
        class="btn-clear"
      >
        Очистить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserStatus } from '@/types/user';
import { defineModel } from 'vue';

const props = withDefaults(
  defineProps<{
    filterStatus?: string
  }>(),
  {
    filterStatus: '',
  }
)
const dateFrom = defineModel<string>('dateFrom')
const dateTo = defineModel<string>('dateTo')

const emit = defineEmits<{
  'update:filter-status': [value: UserStatus]
  'filter-clear': [value: void]
}>()

</script>

<style scoped>
.filters-section {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group label {
  font-weight: 500;
  color: #555;
  min-width: 150px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover {
  background: #f0f0f0;
}

.filter-btn.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.date-input {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-clear {
  padding: 6px 12px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-clear:hover {
  background: #f0f0f0;
}
</style>