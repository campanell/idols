import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import About from './pages/About'
import Roster from './pages/Roster';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Header from './components/Header'
import StripeCheckout from './pages/StripeCheckout';
import SuccessPage from './pages/SuccessPage';
import CancelPage from './pages/CancelPage';
import MembershipPage from './pages/MembershipPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Footer from './components/Footer';
import './index.css'

function App() {
  return (
    <Router>
      {/* Header is placed outside of Routes so it shows on every page */}
      <Header />
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={<StripeCheckout />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        {/* Add more <Route> entries here for other pages */}
      </Routes>
      <Footer />
    </Router>
  )
}

export default App
