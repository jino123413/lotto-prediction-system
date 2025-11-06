import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Home from './pages/Home'
import Analysis from './pages/Analysis'
import CheckWinning from './pages/CheckWinning'
import PredictionHistory from './pages/PredictionHistory'
import NumberAnalysis from './pages/NumberAnalysis'
import Stores from './pages/Stores'
import StoreMap from './pages/StoreMap'
import Login from './pages/Login'
import Register from './pages/Register'

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  
  useEffect(() => {
    setUsername(localStorage.getItem('username'));
  }, [location]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    setUsername(null);
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-1">
            <div className="flex items-center mr-8">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="ml-2 text-white font-semibold text-lg">로또 인텔리전스</span>
            </div>
            <Link
              to="/"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              홈
            </Link>
            <Link
              to="/analysis"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/analysis')
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              통계 분석
            </Link>
            <Link
              to="/numbers"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/numbers')
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              번호 분석
            </Link>
            <Link
              to="/check"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/check')
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              당첨 확인
            </Link>
            <Link
              to="/history"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/history')
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              예측 이력
            </Link>
            <Link
              to="/stores"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/stores')
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              판매점 순위
            </Link>
            <Link
              to="/map"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/map')
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              지도 시각화
            </Link>
          </div>
          <div className="flex items-center space-x-3">
            {username ? (
              <>
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700 rounded-lg">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{username.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-sm text-white font-medium">{username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
                >
                  로그인
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/numbers" element={<NumberAnalysis />} />
          <Route path="/check" element={<CheckWinning />} />
          <Route path="/history" element={<PredictionHistory />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/map" element={<StoreMap />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
