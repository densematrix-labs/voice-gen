import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Home from '../pages/Home'

// Mock the API
vi.mock('../lib/api', () => ({
  generateSpeech: vi.fn(),
}))

// Mock the token store
vi.mock('../stores/tokenStore', () => ({
  useTokenStore: () => ({
    tokensRemaining: 10,
    deviceId: 'test-device',
  }),
}))

const renderHome = () => {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  )
}

describe('Home', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders hero section', () => {
    renderHome()
    expect(screen.getByText('hero.title')).toBeInTheDocument()
    expect(screen.getByText('hero.subtitle')).toBeInTheDocument()
  })

  it('renders text input', () => {
    renderHome()
    expect(screen.getByTestId('text-input')).toBeInTheDocument()
  })

  it('renders voice selector', () => {
    renderHome()
    expect(screen.getByTestId('voice-select')).toBeInTheDocument()
  })

  it('renders speed slider', () => {
    renderHome()
    expect(screen.getByTestId('speed-slider')).toBeInTheDocument()
  })

  it('renders generate button', () => {
    renderHome()
    expect(screen.getByTestId('generate-btn')).toBeInTheDocument()
  })

  it('shows error for empty text', async () => {
    renderHome()
    
    const generateBtn = screen.getByTestId('generate-btn')
    fireEvent.click(generateBtn)
    
    // Button should be disabled when text is empty
    expect(generateBtn).toBeDisabled()
  })

  it('enables button when text is entered', () => {
    renderHome()
    
    const input = screen.getByTestId('text-input')
    fireEvent.change(input, { target: { value: 'Hello world' } })
    
    const generateBtn = screen.getByTestId('generate-btn')
    expect(generateBtn).not.toBeDisabled()
  })

  it('updates character count', () => {
    renderHome()
    
    const input = screen.getByTestId('text-input')
    fireEvent.change(input, { target: { value: 'Test' } })
    
    expect(screen.getByText('4/5000')).toBeInTheDocument()
  })

  it('shows features section', () => {
    renderHome()
    expect(screen.getByText('features.title')).toBeInTheDocument()
  })

  it('shows comparison section', () => {
    renderHome()
    expect(screen.getByText('comparison.title')).toBeInTheDocument()
  })

  it('displays token count', () => {
    renderHome()
    expect(screen.getByText('generator.tokensLeft (10)')).toBeInTheDocument()
  })

  it('allows changing voice', () => {
    renderHome()
    
    const select = screen.getByTestId('voice-select')
    fireEvent.change(select, { target: { value: 'nova' } })
    
    expect((select as HTMLSelectElement).value).toBe('nova')
  })

  it('allows changing speed', () => {
    renderHome()
    
    const slider = screen.getByTestId('speed-slider')
    fireEvent.change(slider, { target: { value: '1.5' } })
    
    expect((slider as HTMLInputElement).value).toBe('1.5')
  })
})
