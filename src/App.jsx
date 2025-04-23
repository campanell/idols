import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import About from './pages/About'
import Roster from './pages/Roster';
import Home from './pages/Home';
import Header from './components/Header'
import './index.css'

function App() {
  return (
    <Router>
      {/* Header is placed outside of Routes so it shows on every page */}
      <Header />
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/" element={<Home />} />
        {/* Add more <Route> entries here for other pages */}
      </Routes>
    </Router>
  )
}

export default App
