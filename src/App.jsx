import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Roster from "./pages/Roster";
import Home from "./pages/Home";
import Header from "./components/Header";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import MembershipFaqPage from "./pages/MembershipFaqPage";
import NotFoundPage from "./pages/NotFoundPage";
import Footer from "./components/Footer";
import OpenAIPageViews from "./components/OpenAIPageViews";
import "./index.css";

function App() {
  return (
    <Router>
      <OpenAIPageViews />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roster" element={<Roster />} />
        <Route path="/faq" element={<MembershipFaqPage />} />
        <Route path="/checkout" element={<Navigate to="/" replace />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
