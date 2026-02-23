import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { generateSpeech, type Voice } from '../lib/api'
import { useTokenStore } from '../stores/tokenStore'
import './Home.css'

const VOICES: Voice[] = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral & balanced' },
  { id: 'echo', name: 'Echo', description: 'Deep & resonant' },
  { id: 'fable', name: 'Fable', description: 'Warm & expressive' },
  { id: 'onyx', name: 'Onyx', description: 'Deep & authoritative' },
  { id: 'nova', name: 'Nova', description: 'Bright & energetic' },
  { id: 'shimmer', name: 'Shimmer', description: 'Soft & soothing' },
]

export default function Home() {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('alloy')
  const [speed, setSpeed] = useState(1.0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const { tokensRemaining, deviceId } = useTokenStore()

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError(t('error.emptyText'))
      return
    }

    if (text.length > 5000) {
      setError(t('error.textTooLong'))
      return
    }

    setIsLoading(true)
    setError(null)
    setAudioUrl(null)

    try {
      const audioBlob = await generateSpeech(text, voice, speed, deviceId)
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)
      
      // Auto-play
      setTimeout(() => {
        audioRef.current?.play()
      }, 100)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('error.unknown')
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = 'voice-gen-audio.mp3'
      a.click()
    }
  }

  return (
    <div className="home">
      <div className="container">
        {/* Hero */}
        <section className="hero">
          <h1>{t('hero.title')}</h1>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
          <div className="hero-badges">
            <span className="badge">✓ {t('hero.badge1')}</span>
            <span className="badge">✓ {t('hero.badge2')}</span>
            <span className="badge">✓ {t('hero.badge3')}</span>
          </div>
        </section>

        {/* TTS Generator */}
        <section className="generator card">
          <div className="generator-header">
            <h2>{t('generator.title')}</h2>
            <span className="tokens-badge">
              {tokensRemaining > 0 
                ? t('generator.tokensLeft', { count: tokensRemaining })
                : t('generator.noTokens')
              }
            </span>
          </div>

          <div className="generator-body">
            {/* Text input */}
            <div className="input-group">
              <label htmlFor="text-input">{t('generator.textLabel')}</label>
              <textarea
                id="text-input"
                data-testid="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('generator.placeholder')}
                maxLength={5000}
              />
              <span className="char-count">{text.length}/5000</span>
            </div>

            {/* Controls */}
            <div className="controls-row">
              {/* Voice selector */}
              <div className="input-group">
                <label htmlFor="voice-select">{t('generator.voiceLabel')}</label>
                <select
                  id="voice-select"
                  data-testid="voice-select"
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                >
                  {VOICES.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} — {v.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed slider */}
              <div className="input-group">
                <label htmlFor="speed-slider">
                  {t('generator.speedLabel')}: {speed.toFixed(1)}x
                </label>
                <input
                  id="speed-slider"
                  data-testid="speed-slider"
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                />
              </div>
            </div>

            {/* Generate button */}
            <button
              className="btn btn-primary generate-btn"
              onClick={handleGenerate}
              disabled={isLoading || !text.trim()}
              data-testid="generate-btn"
            >
              {isLoading ? (
                <>
                  <span className="waveform">
                    <span className="waveform-bar"></span>
                    <span className="waveform-bar"></span>
                    <span className="waveform-bar"></span>
                    <span className="waveform-bar"></span>
                    <span className="waveform-bar"></span>
                  </span>
                  {t('generator.generating')}
                </>
              ) : (
                <>🎤 {t('generator.generate')}</>
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="error-message" data-testid="error-message">
                ⚠️ {error}
              </div>
            )}

            {/* Audio player */}
            {audioUrl && (
              <div className="audio-result" data-testid="audio-result">
                <audio ref={audioRef} controls src={audioUrl} />
                <button className="btn btn-secondary" onClick={handleDownload}>
                  ⬇️ {t('generator.download')}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Features */}
        <section className="features">
          <h2>{t('features.title')}</h2>
          <div className="features-grid">
            <div className="feature-card card">
              <span className="feature-icon">🚀</span>
              <h3>{t('features.fast.title')}</h3>
              <p>{t('features.fast.desc')}</p>
            </div>
            <div className="feature-card card">
              <span className="feature-icon">🌍</span>
              <h3>{t('features.multilingual.title')}</h3>
              <p>{t('features.multilingual.desc')}</p>
            </div>
            <div className="feature-card card">
              <span className="feature-icon">💰</span>
              <h3>{t('features.free.title')}</h3>
              <p>{t('features.free.desc')}</p>
            </div>
            <div className="feature-card card">
              <span className="feature-icon">🎨</span>
              <h3>{t('features.voices.title')}</h3>
              <p>{t('features.voices.desc')}</p>
            </div>
          </div>
        </section>

        {/* Comparison */}
        <section className="comparison">
          <h2>{t('comparison.title')}</h2>
          <div className="comparison-table card">
            <table>
              <thead>
                <tr>
                  <th>{t('comparison.feature')}</th>
                  <th>Voice Gen</th>
                  <th>ElevenLabs</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{t('comparison.freeUsage')}</td>
                  <td className="highlight">✓ 10/day</td>
                  <td>10k chars/month</td>
                </tr>
                <tr>
                  <td>{t('comparison.noSignup')}</td>
                  <td className="highlight">✓</td>
                  <td>✗</td>
                </tr>
                <tr>
                  <td>{t('comparison.speedControl')}</td>
                  <td className="highlight">✓</td>
                  <td>Limited</td>
                </tr>
                <tr>
                  <td>{t('comparison.price')}</td>
                  <td className="highlight">$3/month</td>
                  <td>$5-$330/month</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}
