import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import FingerprintJS from '@fingerprintjs/fingerprintjs'

interface TokenState {
  tokensRemaining: number
  freeTrialUsed: boolean
  deviceId: string
  setTokens: (tokens: number) => void
  setFreeTrialUsed: (used: boolean) => void
  initDeviceId: () => Promise<void>
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      tokensRemaining: 10,
      freeTrialUsed: false,
      deviceId: '',
      
      setTokens: (tokens) => set({ tokensRemaining: tokens }),
      setFreeTrialUsed: (used) => set({ freeTrialUsed: used }),
      
      initDeviceId: async () => {
        if (get().deviceId) return
        
        try {
          const fp = await FingerprintJS.load()
          const result = await fp.get()
          set({ deviceId: result.visitorId })
        } catch {
          // Fallback to random ID
          const fallbackId = 'fb_' + Math.random().toString(36).substring(2)
          set({ deviceId: fallbackId })
        }
      },
    }),
    {
      name: 'voice-gen-tokens',
      partialize: (state) => ({
        deviceId: state.deviceId,
        tokensRemaining: state.tokensRemaining,
        freeTrialUsed: state.freeTrialUsed,
      }),
    }
  )
)

// Initialize device ID on load
if (typeof window !== 'undefined') {
  useTokenStore.getState().initDeviceId()
}
