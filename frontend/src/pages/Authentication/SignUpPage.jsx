import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/logo.png';

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        username: form.name,
        email: form.email,
        password: form.password,
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const message =
        err.response?.data?.message || 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      
      {/* Background decoration elements */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-red-900/10 blur-[130px] rounded-full" />
      <div className="absolute bottom-[0%] right-[-10%] w-[45%] h-[45%] bg-blue-900/10 blur-[130px] rounded-full" />

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
        <div className="w-full max-w-[440px] bg-[#141414]/80 backdrop-blur-xl rounded-[32px] border border-white/5 px-10 py-10 shadow-2xl">

          {/* Logo Section */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all">
              <div className="relative">
                 <div className="absolute inset-0 bg-red-600/30 blur-lg rounded-full" />
                 <img src={logo} alt="GoJapan" className="w-11 h-11 rounded-full object-cover relative z-10 border border-white/10" />
              </div>
              <span className="text-[26px] font-bold text-white tracking-wide">GoJapan</span>
            </Link>
          </div>

          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-[40px] font-bold text-white mb-3 tracking-tighter">Join the GoJapan</h1>
            <p className="text-[#666] text-[16px] max-w-[300px] mx-auto leading-relaxed">Master Japanese with precision and a focused community.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[14px] text-center animate-[fadeIn_0.3s_ease]">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[14px] text-center flex items-center justify-center gap-2 animate-[fadeIn_0.3s_ease]">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div>
              <label className="block text-[11px] font-black text-[#555] uppercase tracking-[0.25em] mb-3 ml-2">
                Identity / Name
              </label>
              <input
                type="text"
                placeholder="Genji Shimada"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4.5 text-white text-[16px] placeholder-[#333] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-black text-[#555] uppercase tracking-[0.25em] mb-3 ml-2">
                Digital / Email
              </label>
              <input
                type="email"
                placeholder="mastery@gojapan.jp"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4.5 text-white text-[16px] placeholder-[#333] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-black text-[#555] uppercase tracking-[0.25em] mb-3 ml-2">
                Security / Hidden
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4.5 pr-14 text-white text-[16px] placeholder-[#333] focus:outline-none focus:border-white/20 focus:bg-[#1a1a1a] transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[#444] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-black text-[17px] py-5 rounded-2xl hover:bg-gray-100 active:scale-[0.98] transition-all hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] uppercase tracking-[0.2em] mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </button>
          </form>

          {/* Redirect */}
          <div className="mt-10 text-center">
            <p className="text-[#444] text-[13px] font-bold uppercase tracking-widest">
              Already a member?{' '}
              <Link to="/login" className="text-white hover:text-red-500 transition-colors ml-1">
                Login here
              </Link>
            </p>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="px-10 py-8 flex flex-col items-center justify-center gap-2">
        <span className="text-[10px] text-white/10 uppercase font-black tracking-[1.2em] text-center ml-[1.2em]">GoJapan Excellence</span>
      </footer>

    </div>
  );
}
