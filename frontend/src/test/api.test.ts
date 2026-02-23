import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSpeech, getTokens, createCheckout } from '../lib/api'

describe('API', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('generateSpeech', () => {
    it('returns audio blob on success', async () => {
      const mockBlob = new Blob(['audio'], { type: 'audio/mpeg' })
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      })

      const result = await generateSpeech('Hello', 'alloy', 1.0, 'device-1')
      expect(result).toEqual(mockBlob)
    })

    it('handles string error detail', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Server error' }),
      })

      await expect(generateSpeech('test', 'alloy', 1.0, 'device-1'))
        .rejects.toThrow('Server error')
    })

    it('handles object error detail with error field', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 402,
        json: () => Promise.resolve({
          detail: { error: 'No tokens remaining', code: 'payment_required' },
        }),
      })

      await expect(generateSpeech('test', 'alloy', 1.0, 'device-1'))
        .rejects.toThrow('No tokens remaining')
    })

    it('handles object error detail with message field', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          detail: { message: 'Invalid input' },
        }),
      })

      await expect(generateSpeech('test', 'alloy', 1.0, 'device-1'))
        .rejects.toThrow('Invalid input')
    })

    it('never throws [object Object]', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          detail: { error: 'Error message', code: 123 },
        }),
      })

      try {
        await generateSpeech('test', 'alloy', 1.0, 'device-1')
      } catch (e) {
        expect((e as Error).message).not.toContain('[object Object]')
        expect((e as Error).message).not.toContain('object Object')
      }
    })
  })

  describe('getTokens', () => {
    it('returns token info on success', async () => {
      const mockData = { tokensRemaining: 5, freeTrialUsed: false }
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const result = await getTokens('device-1')
      expect(result).toEqual(mockData)
    })

    it('handles error response', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: 'Database error' }),
      })

      await expect(getTokens('device-1')).rejects.toThrow('Database error')
    })
  })

  describe('createCheckout', () => {
    it('returns checkout URL on success', async () => {
      const mockData = { checkoutUrl: 'https://checkout.example.com' }
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const result = await createCheckout('starter', 'device-1')
      expect(result).toEqual(mockData)
    })

    it('handles payment error', async () => {
      ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ detail: 'Invalid product' }),
      })

      await expect(createCheckout('invalid', 'device-1')).rejects.toThrow('Invalid product')
    })
  })
})
