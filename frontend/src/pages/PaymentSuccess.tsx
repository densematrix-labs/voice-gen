import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getTokens } from '../lib/api'
import { useTokenStore } from '../stores/tokenStore'
import './PaymentSuccess.css'

export default function PaymentSuccess() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setTokens, deviceId } = useTokenStore()

  useEffect(() => {
    const fetchTokens = async () => {
      const checkoutId = searchParams.get('checkout_id')
      if (!checkoutId) {
        setError(t('payment.noCheckoutId'))
        setLoading(false)
        return
      }

      try {
        const { tokensRemaining } = await getTokens(deviceId)
        setTokens(tokensRemaining)
      } catch (err) {
        console.error('Failed to fetch tokens:', err)
        setError(t('payment.fetchError'))
      } finally {
        setLoading(false)
      }
    }

    fetchTokens()
  }, [searchParams, deviceId, setTokens, t])

  if (loading) {
    return (
      <div className="payment-success">
        <div className="container">
          <div className="success-card card">
            <div className="loading-spinner"></div>
            <p>{t('payment.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="payment-success">
        <div className="container">
          <div className="success-card card error">
            <span className="icon">⚠️</span>
            <h2>{t('payment.errorTitle')}</h2>
            <p>{error}</p>
            <Link to="/" className="btn btn-primary">
              {t('payment.backHome')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-success">
      <div className="container">
        <div className="success-card card">
          <span className="icon success">✓</span>
          <h2>{t('payment.successTitle')}</h2>
          <p>{t('payment.successDesc')}</p>
          <Link to="/" className="btn btn-primary">
            {t('payment.startUsing')}
          </Link>
        </div>
      </div>
    </div>
  )
}
