const API_BASE = '/api/v1'

export interface Voice {
  id: string
  name: string
  description: string
}

export interface TokenInfo {
  tokensRemaining: number
  freeTrialUsed: boolean
}

// Helper to extract error message from response
function extractErrorMessage(data: { detail?: string | { error?: string; message?: string } }): string {
  if (!data.detail) return 'Request failed'
  if (typeof data.detail === 'string') return data.detail
  return data.detail.error || data.detail.message || 'Request failed'
}

export async function generateSpeech(
  text: string,
  voice: string,
  speed: number,
  deviceId: string
): Promise<Blob> {
  const response = await fetch(`${API_BASE}/tts/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify({ text, voice, speed }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(extractErrorMessage(data))
  }

  return response.blob()
}

export async function getTokens(deviceId: string): Promise<TokenInfo> {
  const response = await fetch(`${API_BASE}/tokens`, {
    headers: {
      'X-Device-Id': deviceId,
    },
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(extractErrorMessage(data))
  }

  return response.json()
}

export async function createCheckout(
  productSku: string,
  deviceId: string
): Promise<{ checkoutUrl: string }> {
  const response = await fetch(`${API_BASE}/payment/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
    },
    body: JSON.stringify({ product_sku: productSku }),
  })

  if (!response.ok) {
    const data = await response.json()
    throw new Error(extractErrorMessage(data))
  }

  return response.json()
}
