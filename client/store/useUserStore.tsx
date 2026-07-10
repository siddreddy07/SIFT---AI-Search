import { create } from "zustand"

export type Notification = {
  type: string,
  length: number
}
export type User = {
  _id: string
  name: string
  email: string
  updatedAt: string
  notifications: Notification[]
  discover?: string[]
}



type UserStore = {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
  updateNotification: (type: string, length: number) => void
}


const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  updateNotification: (type, length) => {
    const user = get().user
    if (!user) return
    const list = user.notifications ?? []
    const existing = list.find((n) => n.type === type)
    const notifications = existing
      ? list.map((n) =>
          n.type === type ? { ...n, length: n.length + length } : n
        )
      : [...list, { type, length }]
    set({ user: { ...user, notifications } })
  },
}))

export default useUserStore
