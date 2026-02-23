import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Pricing from '../pages/Pricing'

// Mock the API
vi.mock('../lib/api', () => ({
  createCheckout: vi.fn(),
}))

// Mock the token store
vi.mock('../stores/tokenStore', () => ({
  useTokenStore: () => ({
    deviceId: 'test-device',
  }),
}))

const renderPricing = () => {
  return render(
    <BrowserRouter>
      <Pricing />
    </BrowserRouter>
  )
}

describe('Pricing', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders pricing title', () => {
    renderPricing()
    expect(screen.getByText('pricing.title')).toBeInTheDocument()
  })

  it('renders all plan names', () => {
    renderPricing()
    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
  })

  it('renders plan prices', () => {
    renderPricing()
    expect(screen.getByText('$0')).toBeInTheDocument()
    expect(screen.getByText('$3')).toBeInTheDocument()
    expect(screen.getByText('$9')).toBeInTheDocument()
  })

  it('shows popular badge on starter plan', () => {
    renderPricing()
    expect(screen.getByText('pricing.popular')).toBeInTheDocument()
  })

  it('renders FAQ section', () => {
    renderPricing()
    expect(screen.getByText('pricing.faqTitle')).toBeInTheDocument()
    expect(screen.getByText('pricing.faq1.q')).toBeInTheDocument()
    expect(screen.getByText('pricing.faq2.q')).toBeInTheDocument()
  })

  it('renders CTA buttons for all plans', () => {
    renderPricing()
    expect(screen.getByText('Start Free')).toBeInTheDocument()
    expect(screen.getByText('Get Started')).toBeInTheDocument()
    expect(screen.getByText('Go Pro')).toBeInTheDocument()
  })
})
