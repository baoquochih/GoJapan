import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

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
