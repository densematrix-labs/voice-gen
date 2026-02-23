import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import PaymentSuccess from './pages/PaymentSuccess'
import Layout from './components/Layout'

function App() {
  return (
    <Suspense fallback={<div className="loading">Loading...</div>}>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
        </Routes>
      </Layout>
    </Suspense>
  )
}

export default App
