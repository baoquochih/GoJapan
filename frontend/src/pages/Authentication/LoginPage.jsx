import React, { useRef, useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import logo from '../../assets/images/logo.png';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const facebookAccessTokenRef = useRef(null);
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        await loginWithGoogle(tokenResponse.access_token);
        navigate('/');
      } catch (err) {
        setError(err.response?.data?.message || 'Google Login failed.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => setError('Google Login Failed')
  });

  const handleFacebookSuccess = (response) => {
    const accessToken = response?.accessToken || response?.authResponse?.accessToken;
    if (!accessToken) {
      setError('Facebook Login Failed');
      return;
    }

    facebookAccessTokenRef.current = accessToken;
  };

  const handleFacebookProfileSuccess = async (profile) => {
    const accessToken = facebookAccessTokenRef.current;
    if (!accessToken) {
      setError('Facebook Login Failed');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithFacebook(accessToken, profile?.email || '', profile?.name || '');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Facebook Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: form.email, password: form.password });
      navigate('/'); // Redirect to home page after login
    } catch (err) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/10 blur-[120px] rounded-full" />

      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center gap-2 text-[#555] hover:text-white transition-colors group z-20"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium uppercase tracking-widest">Return</span>
      </button>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 z-10">
        <div className="w-full max-w-[420px] bg-[#141414]/80 backdrop-blur-xl rounded-3xl border border-white/5 px-10 py-10 shadow-2xl">

          {/* Logo Section */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all">
              <div className="relative">
                 <div className="absolute inset-0 bg-red-600/20 blur-md rounded-full" />
                 <img src={logo} alt="GoJapan" className="w-10 h-10 rounded-full object-cover relative z-10 border border-white/10" />
              </div>
              <span className="text-[24px] font-bold text-white tracking-wide">GoJapan</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-[36px] font-bold text-white mb-2 tracking-tight">Sign In</h1>
            <p className="text-[#666] text-[15px]">Focus your mind. Continue your journey.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[14px] text-center animate-[fadeIn_0.3s_ease]">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-[#666] uppercase tracking-[0.2em] mb-3 ml-1">
                Identity / Email
              </label>
              <input
                type="email"
                placeholder="mastery@gojapan.jp"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#1e1e1e]/50 border border-white/5 rounded-2xl px-5 py-4 text-white text-[16px] placeholder-[#444] focus:outline-none focus:border-white/20 focus:bg-[#222] transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-3 ml-1">
                <label className="block text-[11px] font-bold text-[#666] uppercase tracking-[0.2em]">
                  Security / Password
                </label>
                <span className="text-[11px] text-[#444] hover:text-white cursor-pointer transition-colors uppercase font-bold tracking-widest">Forgot?</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#1e1e1e]/50 border border-white/5 rounded-2xl px-5 py-4 pr-12 text-white text-[16px] placeholder-[#444] focus:outline-none focus:border-white/20 focus:bg-[#222] transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#555] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-black text-[16px] py-4 rounded-2xl hover:bg-gray-100 active:scale-[0.98] transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                'Enter GoJapan'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-[10px] text-[#333] font-black uppercase tracking-[0.3em]">Quick Access</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          {/* Social */}
          <div className="flex gap-4">
            <button 
              onClick={() => handleGoogleLogin()} 
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-2.5 bg-[#1e1e1e]/50 border border-white/5 rounded-2xl py-4 text-white text-[14px] font-bold hover:bg-[#252525] hover:border-white/10 transition-all group disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-60 group-hover:opacity-100 transition-opacity">
                <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#ffffff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <FacebookLogin
              appId="958891499997923"
              autoLoad={false}
              scope="public_profile,email"
              fields="name,email,picture"
              onSuccess={handleFacebookSuccess}
              onProfileSuccess={handleFacebookProfileSuccess}
              onFail={() => setError('Facebook Login Failed')}
              render={({ onClick }) => (
                <button 
                  onClick={onClick} 
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2.5 bg-[#1e1e1e]/50 border border-white/5 rounded-2xl py-4 text-white text-[14px] font-bold hover:bg-[#252525] hover:border-white/10 transition-all group disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white" className="opacity-60 group-hover:opacity-100 transition-opacity">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              )}
            />
          </div>

          {/* Footer link */}
          <p className="text-center text-[#555] text-[14px] mt-10">
            First time in the path?{' '}
            <span 
               onClick={() => navigate('/register')}
               className="text-white font-bold cursor-pointer hover:underline decoration-red-600 underline-offset-4 transition-all"
            >
              Sign up
            </span>
          </p>

        </div>
      </div>

      {/* Aesthetic Footer */}
      <footer className="border-t border-white/5 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-[10px] text-[#333] uppercase font-bold tracking-[0.4em]">© 2024 GoJapan. Mastery Awaits.</span>
        <div className="flex items-center gap-8 text-[10px] text-[#444] uppercase font-bold tracking-[0.2em]">
          <span className="cursor-pointer hover:text-white transition-colors">Privacy</span>
          <span className="cursor-pointer hover:text-white transition-colors">Terms</span>
          <span className="cursor-pointer hover:text-white transition-colors">Support</span>
        </div>
      </footer>

    </div>
  );
}
