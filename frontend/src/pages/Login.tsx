import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../lib/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      
      // JWT 토큰과 사용자 정보 저장
      localStorage.setItem('token', response.token);
      localStorage.setItem('username', response.username);
      localStorage.setItem('email', response.email);

      // 홈으로 이동
      navigate('/');
      window.location.reload(); // 네비게이션 업데이트를 위해 새로고침
    } catch (err: any) {
      // 서버에서 반환한 에러 메시지 표시
      const errorMessage = err.response?.data || err.message || '로그인에 실패했습니다.';
      
      // 400 에러일 때 서버 응답을 그대로 표시 (문자열로 반환됨)
      if (typeof errorMessage === 'string') {
        setError(errorMessage);
      } else {
        setError(errorMessage.message || '로그인에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
            다시 만나서 반가워요
          </h1>
          <p className="text-slate-600">로또 인텔리전스에 로그인하세요</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                사용자명
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="사용자명을 입력하세요"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              계정이 없으신가요?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
