import type { User } from "@/types/user";

export function useValidate(){

    const validateNewUserName = (userName: string): string => {
        if (userName.trim().length === 0) {
            return 'Имя обязательно для заполнения';
        } else if (userName.trim().length < 3) {
            return 'Имя должно содержать минимум 3 символа';
        } else {
            return '';
        }
    }

    const validateNewUserEmail = (email: string, users?: User[]): string => {
        if (email.trim().length === 0) {
            return 'Email обязателен для заполнения';
        } else if (!validateEmail(email)) {
            return 'Некорректный формат email';
        } else if (users && users.some(u => u.email === email)) {
            return 'Пользователь с таким email уже существует';
        } else {
            return '';
        }
    }

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    return {
        validateEmail,
        validateNewUserEmail,
        validateNewUserName
    }
}