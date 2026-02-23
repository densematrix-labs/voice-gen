import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { createCheckout } from '../lib/api'
import { useTokenStore } from '../stores/tokenStore'
import './Pricing.css'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    features: ['10 generations/day', 'All 6 voices', 'MP3 download', 'No signup'],
    cta: 'Start Free',
    highlight: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 3,
    period: '/month',
    features: ['100 generations/month', 'All 6 voices', 'MP3/WAV download', 'Priority processing', 'No watermark'],
    cta: 'Get Started',
    highlight: true,
    sku: 'voice_gen_starter',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9,
    period: '/month',
    features: ['Unlimited generations', 'All 6 voices', 'All formats', 'API access', 'Priority support'],
    cta: 'Go Pro',
    highlight: false,
    sku: 'voice_gen_pro',
  },
]

export default function Pricing() {
  const { t } = useTranslation()
  const { deviceId } = useTokenStore()

  const handlePurchase = async (sku: string | undefined) => {
    if (!sku) return
    
    try {
      const { checkoutUrl } = await createCheckout(sku, deviceId)
      window.location.href = checkoutUrl
    } catch (err) {
      console.error('Checkout error:', err)
      alert(t('pricing.checkoutError'))
    }
  }

  return (
    <div className="pricing">
      <div className="container">
        <section className="pricing-header">
          <h1>{t('pricing.title')}</h1>
          <p>{t('pricing.subtitle')}</p>
        </section>

        <div className="pricing-grid">
          {PLANS.map((plan) => (
            <div 
              key={plan.id} 
              className={`pricing-card card ${plan.highlight ? 'highlight' : ''}`}
            >
              {plan.highlight && (
                <span className="popular-badge">{t('pricing.popular')}</span>
              )}
              
              <h3 className="plan-name">{plan.name}</h3>
              
              <div className="plan-price">
                <span className="price-amount">${plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              
              <ul className="plan-features">
                {plan.features.map((feature, i) => (
                  <li key={i}>✓ {feature}</li>
                ))}
              </ul>
              
              {plan.sku ? (
                <button 
                  className={`btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => handlePurchase(plan.sku)}
                >
                  {plan.cta}
                </button>
              ) : (
                <Link to="/" className="btn btn-secondary">
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>

        <section className="pricing-faq">
          <h2>{t('pricing.faqTitle')}</h2>
          <div className="faq-grid">
            <div className="faq-item card">
              <h4>{t('pricing.faq1.q')}</h4>
              <p>{t('pricing.faq1.a')}</p>
            </div>
            <div className="faq-item card">
              <h4>{t('pricing.faq2.q')}</h4>
              <p>{t('pricing.faq2.a')}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
