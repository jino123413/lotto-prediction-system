import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../lib/api';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 길이 확인
    if (formData.password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      // 회원가입 성공 메시지 표시
      setSuccess(true);
      
      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 2000)
    } catch (err: any) {
      // 서버에서 반환한 에러 메시지 표시
      const errorMessage = err.response?.data || err.message || '회원가입에 실패했습니다.';
      
      // 400 에러일 때 서버 응답을 그대로 표시 (문자열로 반환됨)
      if (typeof errorMessage === 'string') {
        setError(errorMessage);
      } else {
        setError(errorMessage.message || '회원가입에 실패했습니다.');
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
            계정 만들기
          </h1>
          <p className="text-slate-600">로또 인텔리전스에 가입하세요</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
          <form onSubmit={handleSubmit} className="space-y-5">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-sm">
                ✅ 회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...
              </div>
            )}
            
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
                placeholder="사용자명 (3-20자)"
                required
                minLength={3}
                maxLength={20}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="email@example.com"
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
                placeholder="최소 6자 이상"
                required
                minLength={6}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
