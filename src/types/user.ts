
export type UserRoles = 'admin' | 'user' | 'moderator';
export type UserStatus = 'active' | 'inactive' | ''
export type User = {
    id: number
    name: string
    email: string
    role: UserRoles | ''
    status?: UserStatus | ''
    registrationDate?: string
    lastActivity?: string
    avatar?: string | null
    loginCount?: number
    postsCount?: number
    commentsCount?: number
}
export type EditForm = {
    name: string,
    email: string,
    role: UserRoles | '',
}
export type NewUser = {
    name: string,
    email: string,
    role: UserRoles | '',
    sendWelcomeEmail: boolean
}
