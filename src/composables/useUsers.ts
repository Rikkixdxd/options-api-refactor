import type { EditForm, NewUser, User, UserRoles, UserStatus } from "@/types/user"
import { computed, ref, type Ref } from "vue"
import { useUtility } from "./useUtility"
import { useValidate } from "./useValidate"

const { generateMockUsers } = useUtility()
const { validateEmail,validateNewUserEmail,validateNewUserName } = useValidate()

export function useUsers(selectedUsers: Ref<number[]>) {

    const editingUserId = ref<number | null>(null)
    const editForm = ref<EditForm>({
        name: "",
        email: "",
        role: "",
    })
    const users = ref<User[]>([])
    const busy = ref<boolean>(false)
    const errorMessage = ref<string>('')
    
    const newUser = ref<NewUser>({
        name: '',
        email: '',
        role: 'user',
        sendWelcomeEmail: true
    })
    const newUserErrors = ref({
        name: '',
        email: ''
    })

    // Валидация нового пользователя
    const isNewUserValid = computed(() => {
        return newUser.value.name.trim().length > 0 &&
            newUser.value.email.trim().length > 0 &&
            validateEmail(newUser.value.email) &&
            !newUserErrors.value.name &&
            !newUserErrors.value.email
    })

    // Редактирование
    const startEdit = (user: User) => {
        editingUserId.value = user.id
        dropNewUserData()
    }

    const cancelEdit = () => {
        editingUserId.value = null
        dropNewUserData()
    }

    const saveEdit = async (userId: number) => {
        busy.value = true
        errorMessage.value = ''

        try {
            // Симуляция API запроса
            await new Promise((resolve) => setTimeout(resolve, 500))

            const userIndex = users.value.findIndex((u) => u.id === userId)
            if (userIndex !== -1) {
                users.value[userIndex] = {
                    ...users.value[userIndex],
                    name: editForm.value.name,
                    email: editForm.value.email,
                    role: editForm.value.role,
                }
            }

            editingUserId.value = null
            dropNewUserData()
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
            errorMessage.value = `Ошибка сохранения: ${message}`
        } finally {
            busy.value = false
        }
    }

    const dropNewUserData = () => {
        newUser.value = {
            name: '',
            email: '',
            role: 'user',
            sendWelcomeEmail: true
        }
    }

    // Удаление
    const deleteUser = async (userId: number) => {
        if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) {
            return
        }

        busy.value = true
        errorMessage.value = ''
        try {
            // Симуляция API запроса
            await new Promise((resolve) => setTimeout(resolve, 300))

            const index = users.value.findIndex((u) => u.id === userId)
            if (index !== -1) {
                users.value.splice(index, 1)
            }

            // Удаляем из выбранных
            const selectedIndex = selectedUsers.value.indexOf(userId)
            if (selectedIndex > -1) {
                selectedUsers.value.splice(selectedIndex, 1)
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
            errorMessage.value = `Ошибка удаления: ${message}`
        } finally {
            busy.value = false
        }
    }

    const deleteSelectedUsers = async () => {

        if (
            !confirm(
                `Вы уверены, что хотите удалить ${selectedUsers.value.length} пользователей?`
            )
        ) {
            return
        }

        busy.value = true
        errorMessage.value = ''
        try {
            // Симуляция API запроса
            await new Promise((resolve) => setTimeout(resolve, 500))

            users.value = users.value.filter(
                (user) => !selectedUsers.value.includes(user.id)
            )
            selectedUsers.value = []
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
            errorMessage.value = `Ошибка удаления: ${message}`
        } finally {
            busy.value = false
        }
    }

    // Переключение статуса
    const toggleUserStatus = async (userId: number) => {
        busy.value = true
        errorMessage.value = ''
        try {
            const user = users.value.find((u) => u.id === userId)
            if (user) {
                user.status = user.status === "active" ? "inactive" : "active"
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
            errorMessage.value = `Ошибка изменения статуса: ${message}`
        } finally {
            busy.value = false
        }
    }

    

    const addNewUser = async () => {
        newUserErrors.value.name = validateNewUserName(newUser.value.name)
        newUser.value.email = validateNewUserEmail(newUser.value.email, users.value)

        if (!isNewUserValid.value) {
            return
        }

        busy.value = true
        errorMessage.value = ''

        try {
            // Симуляция API запроса
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newUserToAdd: User = {
                id: Math.max(...users.value.map(u => u.id)) + 1,
                name: newUser.value.name,
                email: newUser.value.email,
                role: newUser.value.role,
                status: 'active',
                registrationDate: new Date().toISOString(),
                lastActivity: new Date().toISOString(),
                avatar: null,
                loginCount: 0,
                postsCount: 0,
                commentsCount: 0
            }

            users.value.unshift(newUserToAdd)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
            errorMessage.value = `Ошибка создания пользователя: ${message}`
        } finally {
            busy.value = false
        }
    }

    // Загрузка данных
    const loadUsers = async () => {
      busy.value = true
      errorMessage.value = ''
      try {
        // Симуляция API запроса
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Генерация тестовых данных
        users.value = generateMockUsers(100)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Неизвестная ошибка'
        return `Ошибка загрузки данных: ${message}`
      } finally {
        busy.value = false
      }
    }

    return {
        users,
        busy,
        errorMessage,
        editingUserId,
        editForm,
        newUser,
        isNewUserValid,
        newUserErrors,
        dropNewUserData,
        startEdit,
        cancelEdit,
        saveEdit,
        deleteSelectedUsers,
        deleteUser,
        toggleUserStatus,
        generateMockUsers,
        addNewUser,
        loadUsers,
    }
}
