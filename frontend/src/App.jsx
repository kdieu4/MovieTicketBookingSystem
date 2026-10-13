import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MovieDetailPage from './pages/MovieDetailPage';
import BookingGuidePage from './pages/BookingGuidePage';
import FAQPage from './pages/FAQPage';
import TermsPage from './pages/TermsPage';
import SupportPage from './pages/SupportPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/phim/:id" element={<MovieDetailPage />} />
        <Route path="/huong-dan-dat-ve" element={<BookingGuidePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/dieu-khoan" element={<TermsPage />} />
        <Route path="/ho-tro" element={<SupportPage />} />
        <Route path="/cai-dat" element={<SettingsPage />} />
        <Route path="/thong-tin-ca-nhan" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}