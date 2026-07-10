import { create } from 'zustand'

export type HomePill = {
  id: string
  text: string
  category: string
  prompt: string
  provider: string
}

type HomePillStore = {
  pills: HomePill[]
  loading: boolean
  error: string | null
  setPills: (pills: HomePill[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const useHomePillStore = create<HomePillStore>((set) => ({
  pills: [],
  loading: false,
  error: null,
  setPills: (pills) => set({ pills }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}))

export default useHomePillStore
