import { create } from 'zustand'

export type Integration = {
  id: string
  provider: string
}

type IntegrationStore = {
  integrations: Integration[]
  setIntegrations: (list: Integration[]) => void
  addIntegration: (item: Integration) => void
  removeIntegration: (provider: string) => void
}

const useIntegrationStore = create<IntegrationStore>((set) => ({
  integrations: [],

  setIntegrations: (list) => set({ integrations: list }),

  addIntegration: (item) =>
    set((state) => ({
      integrations: state.integrations.some(i => i.provider === item.provider)
        ? state.integrations
        : [...state.integrations, item]
    })),

  removeIntegration: (provider) =>
    set((state) => ({
      integrations: state.integrations.filter(i => i.provider !== provider)
    }))
}))

export default useIntegrationStore
