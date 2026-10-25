import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ModeCard from "../../components/common/ModeCard";
import bgImage from "../../assets/images/kanji-bg.png";
import logo from "../../assets/images/logo.png";
import { useAuth } from "../../context/AuthContext";
import { usePreferences } from "../../context/PreferenceContext";
import { Brain, Target, Zap, ChevronDown, Sparkles, Moon, Sun } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <div 
    className="group relative p-8 rounded-2xl theme-container transition-all duration-500 overflow-hidden animate-fade-in-up"
    style={{ animationDelay: delay, border: '1px solid color-mix(in srgb, var(--text-color) 10%, transparent)' }}
  >
    <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500" style={{ backgroundColor: 'var(--text-color)' }} />
    <div className="relative z-10 flex flex-col items-center text-center">
      <div 
        className="w-16 h-16 mb-6 rounded-full theme-container flex items-center justify-center group-hover:scale-110 transition-all duration-500"
        style={{ border: '1px solid color-mix(in srgb, var(--text-color) 10%, transparent)' }}
      >
        <Icon className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <h3 className="text-xl font-medium tracking-wide mb-3">{title}</h3>
      <p className="opacity-70 font-light leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

const HomePage = () => {
  const { isAuthenticated, logout } = useAuth();
  const { preferences, updatePreference } = usePreferences();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToDojos = () => {
    const el = document.getElementById("dojos");
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen text-white selection:bg-red-500/30 font-sans overflow-x-hidden" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Sticky Navbar */}
      <nav 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-lg shadow-lg py-3' : 'bg-transparent py-5'}`}
        style={{ 
          backgroundColor: scrolled ? 'var(--bg-glass)' : 'transparent',
          borderBottom: scrolled ? '1px solid color-mix(in srgb, var(--text-color) 10%, transparent)' : '1px solid transparent'
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="GoJapan" className="w-10 h-10 rounded-full shadow-lg" />
            <span className="text-xl font-medium tracking-wide" style={{ color: 'var(--text-color)' }}>GoJapan.</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => updatePreference('theme', preferences.theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-full transition-colors active:scale-95 mr-1 sm:mr-0 z-[100]"
              style={{ color: 'var(--text-color)' }}
              title="Toggle Theme"
            >
              {preferences.theme === 'light' ? <Sun className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-yellow-500" /> : <Moon className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-blue-300" />}
            </button>
            {isAuthenticated ? (
              <>
                <span className="hidden sm:inline-block text-sm font-medium opacity-70" style={{ color: 'var(--text-color)' }}>Logged in</span>
                <button 
                  onClick={() => logout()}
                  className="text-xs sm:text-sm font-medium uppercase tracking-widest px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-all active:scale-95 theme-container"
                  style={{ border: '1px solid color-mix(in srgb, var(--text-color) 20%, transparent)' }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="hidden sm:block text-sm font-medium opacity-70 hover:opacity-100 uppercase tracking-widest transition-all px-5 py-2.5"
                  style={{ color: 'var(--text-color)' }}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="text-xs sm:text-sm font-bold uppercase tracking-widest px-5 py-2 sm:px-6 sm:py-2.5 rounded-lg transition-all shadow-lg active:scale-95"
                  style={{ backgroundColor: 'var(--text-color)', color: 'var(--bg-color)' }}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center pt-20">
        {/* Background Layer */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-[0.25] mix-blend-luminosity animate-slow-pan"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {/* Theme Transition Overlays */}
        <div className="absolute inset-0 transition-colors duration-500" style={{ background: 'linear-gradient(to bottom, var(--bg-glass) 0%, var(--bg-color) 100%)' }} />
        <div className="absolute inset-0 pointer-events-none transition-colors duration-500" style={{ background: 'radial-gradient(ellipse at center, transparent 0%, var(--bg-color) 100%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center text-center mt-[-5vh]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full theme-container mb-8 animate-fade-in-up" style={{ border: '1px solid color-mix(in srgb, var(--text-color) 10%, transparent)' }}>
            <Sparkles className="w-4 h-4 text-red-500" />
            <span className="text-xs md:text-sm font-medium tracking-wider uppercase opacity-80" style={{ color: 'var(--text-color)' }}>Version 2.0 is Live</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-light tracking-tight mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '100ms', color: 'var(--text-color)' }}>
            Master Japanese<br />
            <span className="font-semibold" style={{ color: 'var(--text-color)' }}>
              Speed & Style
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-2xl font-light max-w-3xl mb-12 leading-relaxed animate-fade-in-up opacity-70" style={{ animationDelay: '200ms', color: 'var(--text-color)' }}>
            An aesthetic, community-driven platform to supercharge your kana, vocabulary, and kanji learning, inspired by the fluidity of Monkeytype.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <button 
              onClick={scrollToDojos}
              className="w-full sm:w-auto px-8 py-4 text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3"
              style={{ backgroundColor: 'var(--text-color)', color: 'var(--bg-color)' }}
            >
              Start Training
            </button>
            {!isAuthenticated && (
              <Link 
                to="/register"
                className="w-full sm:w-auto px-8 py-4 text-sm font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 text-center theme-container"
                style={{ border: '1px solid color-mix(in srgb, var(--text-color) 20%, transparent)', color: 'var(--text-color)' }}
              >
                Create Account
              </Link>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer animate-bounce" onClick={scrollToDojos} style={{ color: 'var(--text-color)' }}>
          <span className="text-xs uppercase tracking-widest font-medium">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 md:py-32 relative transition-colors duration-500 overflow-hidden" style={{ backgroundColor: 'var(--bg-color)', borderTop: '1px solid color-mix(in srgb, var(--text-color) 5%, transparent)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-light mb-6 tracking-wide" style={{ color: 'var(--text-color)' }}>Why GoJapan?</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-red-500/50 to-transparent mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={Brain}
              title="Spaced Repetition"
              description="Our smart algorithms ensure you review materials exactly when you're about to forget them, optimizing your memory retention."
              delay="0ms"
            />
            <FeatureCard 
              icon={Zap}
              title="Fluid Interface"
              description="Experience a seamless, distraction-free typing environment that feels like a game, keeping you in the flow state."
              delay="100ms"
            />
            <FeatureCard 
              icon={Target}
              title="Targeted Dojos"
              description="Whether you're mastering basic Kana, building your Vocab arsenal, or tackling complex Kanji, we have a specialized mode."
              delay="200ms"
            />
          </div>
        </div>
      </section>

      {/* Dojos/Modes Section */}
      <section id="dojos" className="py-24 md:py-32 relative transition-colors duration-500" style={{ backgroundColor: 'var(--bg-color)' }}>
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--text-color) 10%, transparent), transparent)' }} />

        <div className="max-w-5xl mx-auto px-6 z-10 relative">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-light mb-6 tracking-wide" style={{ color: 'var(--text-color)' }}>Choose Your Path</h2>
            <p className="font-light text-base md:text-lg max-w-2xl mx-auto opacity-70" style={{ color: 'var(--text-color)' }}>Select a dojo below to begin your training session immediately. No setup required.</p>
          </div>

          <div 
            className="theme-container rounded-3xl flex flex-col sm:flex-row shadow-2xl overflow-hidden divide-y sm:divide-y-0 sm:divide-x transition-transform hover:scale-[1.01] duration-500"
            style={{ 
              borderColor: 'color-mix(in srgb, var(--text-color) 10%, transparent)',
              borderWidth: '1px'
            }}
          >
            <ModeCard japanese="あ" title="Kana" path="/kana" />
            <ModeCard japanese="語" title="Vocab" path="/vocab" />
            <ModeCard japanese="漢字" title="Kanji" path="/kanji" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 transition-colors duration-500 relative z-10" style={{ backgroundColor: 'var(--bg-color)', borderTop: '1px solid color-mix(in srgb, var(--text-color) 5%, transparent)' }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
            <img src={logo} alt="GoJapan Logo" className="w-8 h-8 rounded-full grayscale" />
            <span className="text-sm tracking-widest font-medium" style={{ color: 'var(--text-color)' }}>GOJAPAN.</span>
          </div>
          
          <div className="text-sm font-light text-center md:text-right opacity-60" style={{ color: 'var(--text-color)' }}>
            © {new Date().getFullYear()} GoJapan Project.<br className="md:hidden" /> Engineered for learners.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;