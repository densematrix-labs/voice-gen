import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LanguageSwitcher from '../components/LanguageSwitcher'

// Override the mock for this test
const mockChangeLanguage = vi.fn()
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: mockChangeLanguage,
    },
  }),
}))

describe('LanguageSwitcher', () => {
  it('renders language selector', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByTestId('lang-switcher')).toBeInTheDocument()
  })

  it('displays all 7 language options', () => {
    render(<LanguageSwitcher />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    
    const options = select.querySelectorAll('option')
    expect(options).toHaveLength(7)
  })

  it('includes English option', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText(/English/)).toBeInTheDocument()
  })

  it('includes Chinese option', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText(/中文/)).toBeInTheDocument()
  })

  it('includes Japanese option', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText(/日本語/)).toBeInTheDocument()
  })

  it('includes German option', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText(/Deutsch/)).toBeInTheDocument()
  })

  it('includes French option', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText(/Français/)).toBeInTheDocument()
  })

  it('includes Korean option', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText(/한국어/)).toBeInTheDocument()
  })

  it('includes Spanish option', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByText(/Español/)).toBeInTheDocument()
  })

  it('calls changeLanguage when selection changes', () => {
    render(<LanguageSwitcher />)
    
    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'zh' } })
    
    expect(mockChangeLanguage).toHaveBeenCalledWith('zh')
  })
})
