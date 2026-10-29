import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/images/logo.png";

/* ── tiny hook: count how many times element intersects viewport ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ── Animated counter ── */
function Counter({ to, suffix = "", duration = 1800 }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      setVal(Math.floor(prog * to));
      if (prog < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [visible, to, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ── Floating Japanese characters ── */
const CHARS = ["あ","い","う","え","お","漢","字","語","学","習","日","本","か","き","く","け","こ"];
function FloatingChars() {
  const items = useRef(
    Array.from({ length: 36 }, (_, i) => ({
      id: i,
      char: CHARS[i % CHARS.length],
      left: `${5 + Math.random() * 90}%`,
      top: `${Math.random() * 100}%`,
      size: `${1 + Math.random() * 2.5}rem`,
      delay: `${Math.random() * 8}s`,
      dur: `${10 + Math.random() * 15}s`,
      opacity: 0.04 + Math.random() * 0.1,
    }))
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
      {items.current.map((it) => (
        <span
          key={it.id}
          style={{
            position: "absolute",
            left: it.left,
            top: it.top,
            fontSize: it.size,
            opacity: it.opacity,
            color: "#fff",
            fontFamily: "'Zen Maru Gothic', sans-serif",
            animation: `floatUp ${it.dur} ${it.delay} infinite linear`,
            willChange: "transform",
          }}
        >
          {it.char}
        </span>
      ))}
    </div>
  );
}

/* ── Feature card ── */
function FeatureCard({ icon, title, desc, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group relative bg-white/[0.04] border border-white/[0.07] rounded-2xl p-7 flex flex-col gap-4
        hover:border-white/20 hover:bg-white/[0.07] transition-all duration-500 cursor-default
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="text-4xl">{icon}</div>
      <h3 className="text-white font-bold text-lg tracking-wide">{title}</h3>
      <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
      {/* glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
        bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none" />
    </div>
  );
}

/* ── Step card ── */
function StepCard({ num, title, desc, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`flex gap-5 items-start transition-all duration-700
        ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
    >
      <div className="shrink-0 w-11 h-11 rounded-full bg-red-600/20 border border-red-500/30
        flex items-center justify-center text-red-400 font-black text-lg">
        {num}
      </div>
      <div>
        <h4 className="text-white font-bold mb-1">{title}</h4>
        <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

/* ── Testimonial ── */
function Testimonial({ name, flag, role, text, delay = 0 }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`bg-white/[0.04] border border-white/[0.07] rounded-2xl p-6 flex flex-col gap-4
        transition-all duration-700 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
    >
      <p className="text-white/70 text-sm leading-relaxed italic">"{text}"</p>
      <div className="flex items-center gap-3 mt-auto">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-lg">{flag}</div>
        <div>
          <div className="text-white font-semibold text-sm">{name}</div>
          <div className="text-white/40 text-xs">{role}</div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════ */
export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleCTA = () => navigate(isAuthenticated ? "/kana" : "/register");

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden relative">
      {/* ── Subtle Background Grid ── */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />


      {/* ── CSS keyframe injected inline ── */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg);   }
          50%  { transform: translateY(-40px) rotate(8deg); }
          100% { transform: translateY(0) rotate(0deg);   }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
          70%  { transform: scale(1);    box-shadow: 0 0 0 18px rgba(220,38,38,0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220,38,38,0); }
        }
        .anim-hero { animation: heroFadeIn 1s ease both; }
        .anim-hero-d1 { animation-delay: 0.1s; }
        .anim-hero-d2 { animation-delay: 0.25s; }
        .anim-hero-d3 { animation-delay: 0.4s; }
        .anim-hero-d4 { animation-delay: 0.55s; }
        .logo-pulse { animation: pulse-ring 2.5s ease infinite; }
      `}</style>

      {/* ─────────── NAVBAR ─────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-red-600/30 blur-md rounded-full group-hover:blur-lg transition-all" />
              <img src={logo} alt="GoJapan" className="w-9 h-9 rounded-full object-cover relative z-10 border border-white/10" />
            </div>
            <span className="text-xl font-black tracking-wide">GoJapan</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#howto" className="hover:text-white transition-colors">How it works</a>
            <a href="#stats" className="hover:text-white transition-colors">Stats</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button onClick={() => navigate("/kana")}
                className="px-5 py-2 rounded-xl bg-white text-black text-sm font-bold hover:bg-gray-100 transition-all active:scale-95">
                Open App
              </button>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-xl text-white/60 hover:text-white text-sm font-medium transition-colors">
                  Sign In
                </Link>
                <Link to="/register"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all active:scale-95 shadow-lg shadow-red-900/40">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ─────────── HERO ─────────── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pb-16 pt-24 overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-red-900/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] bg-red-800/10 blur-[140px] rounded-full pointer-events-none" />

        <FloatingChars />

        {/* Badge */}
        <div className="anim-hero anim-hero-d1 inline-flex items-center gap-2 px-4 py-2 rounded-full
          bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Free & Community-Made
        </div>

        {/* Logo */}
        <div className="anim-hero anim-hero-d1 logo-pulse w-24 h-24 rounded-full overflow-hidden border-2 border-red-600/60 mb-8 mx-auto">
          <img src={logo} alt="GoJapan logo" className="w-full h-full object-cover" />
        </div>

        {/* Headline */}
        <h1 className="anim-hero anim-hero-d2 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6 max-w-4xl">
          Master Japanese —<br />
          <span className="bg-gradient-to-r from-red-500 via-red-400 to-orange-400 bg-clip-text text-transparent">
            beautifully.
          </span>
        </h1>

        <p className="anim-hero anim-hero-d3 text-white/50 text-lg sm:text-xl max-w-xl leading-relaxed mb-10">
          An aesthetic, Monkeytype-inspired platform to learn Kana, Vocabulary,
          and Kanji — built for people who love beautiful interfaces.
        </p>

        {/* CTA buttons */}
        <div className="anim-hero anim-hero-d4 flex flex-wrap items-center justify-center gap-4">
          <button onClick={handleCTA}
            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-lg
              transition-all active:scale-95 shadow-2xl shadow-red-900/50 hover:shadow-red-800/60">
            Begin Your Journey →
          </button>
          <a href="#features"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20
              text-white/80 hover:text-white rounded-2xl font-bold text-lg transition-all">
            See Features
          </a>
        </div>

        {/* Hero kanji decoration */}
        <div className="anim-hero anim-hero-d4 mt-16 flex items-center gap-6 opacity-30 select-none">
          {["日","本","語","を","勉","強"].map((c, i) => (
            <span key={i} style={{ fontFamily: "'Zen Maru Gothic', sans-serif", fontSize: "2rem" }}>{c}</span>
          ))}
        </div>
      </section>

      {/* ─────────── STATS ─────────── */}
      <section id="stats" className="py-12 border-y border-white/[0.06] bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 1200, suffix: "+", label: "Vocabulary words" },
            { value: 200,  suffix: "+", label: "Kanji characters" },
            { value: 46,   suffix: "",  label: "Kana characters" },
            { value: 100,  suffix: "%", label: "Free forever" },
          ].map((s, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="text-4xl md:text-5xl font-black text-red-400">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="text-white/40 text-sm uppercase tracking-widest font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── FEATURES ─────────── */}
      <section id="features" className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-red-400 text-xs font-bold uppercase tracking-[0.3em] mb-3">What you get</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight">Everything you need to learn</h2>
          <p className="text-white/40 mt-4 max-w-md mx-auto">
            A complete toolkit designed to make Japanese actually enjoyable.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <FeatureCard delay={0}   icon="あ"  title="Kana Mastery"
            desc="Learn Hiragana & Katakana with interactive flashcards and drill sessions. 46 characters, zero boredom." />
          <FeatureCard delay={80}  icon="語"  title="Vocabulary Builder"
            desc="1200+ curated words organized by lesson. Browse, study, and link directly to Mazii for deep dives." />
          <FeatureCard delay={160} icon="漢字" title="Kanji Training"
            desc="200+ kanji with meanings, readings, and contextual examples. Stroke order, radicals, and more." />
          <FeatureCard delay={240} icon="⚡"  title="Training Mode"
            desc="Monkeytype-style quiz sessions. Choose speed, difficulty and get instant performance stats." />
          <FeatureCard delay={320} icon="📈" title="Progress Tracking"
            desc="Visual charts show your daily streak, XP, and mastery per category over time." />
          <FeatureCard delay={400} icon="🎨" title="Custom Themes"
            desc="8 gorgeous themes including Sakura Pink, Emerald Forest, and Monkeytype. Your vibe, your flow." />
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section id="howto" className="py-20 bg-white/[0.02] border-y border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-red-400 text-xs font-bold uppercase tracking-[0.3em] mb-3">How it works</p>
            <h2 className="text-4xl font-black tracking-tight mb-4">Start learning in minutes</h2>
            <p className="text-white/40 mb-10 leading-relaxed">
              No complicated setup. Just create an account and dive right in.
            </p>
            <div className="flex flex-col gap-8">
              <StepCard num="1" delay={0}   title="Create your account"
                desc="Sign up free with email or Google. No credit card, no catch." />
              <StepCard num="2" delay={120} title="Pick your dojo"
                desc="Choose Kana, Vocabulary, or Kanji — or all three at once." />
              <StepCard num="3" delay={240} title="Train every day"
                desc="Short daily sessions build lasting memory. Track your streak and climb the mastery ladder." />
            </div>
          </div>
          {/* Visual card mock */}
          <div className="hidden md:flex flex-col gap-4 items-center justify-center">
            <div className="w-full max-w-xs bg-[#141414] rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="text-7xl mb-2" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>漢</div>
                <div className="text-white/30 text-xs uppercase tracking-widest">What does this mean?</div>
              </div>
              <div className="flex flex-col gap-2">
                {["Chinese character", "Kanji / Chinese writing", "Japanese letter", "Hiragana symbol"].map((opt, i) => (
                  <div key={i}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer
                      ${i === 1 ? "bg-red-600/20 border border-red-500/40 text-red-300" : "bg-white/5 border border-white/5 text-white/50 hover:bg-white/10"}`}>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Training mode demo
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-red-400 text-xs font-bold uppercase tracking-[0.3em] mb-3">Learners say</p>
          <h2 className="text-4xl font-black tracking-tight">Loved by the community</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Testimonial delay={0} flag="🇻🇳" name="Minh Anh" role="Student, Hà Nội"
            text="Giao diện đẹp hơn Duolingo nhiều lần. Tôi học được 200 vocab chỉ trong 2 tuần nhờ GoJapan!" />
          <Testimonial delay={100} flag="🇺🇸" name="Alex K." role="Anime enthusiast, California"
            text="The training mode is addictive. It's like Monkeytype but for Japanese. I'm obsessed." />
          <Testimonial delay={200} flag="🇯🇵" name="Yuki T." role="Language teacher, Tokyo"
            text="Perfect for beginners. The Kana section is the most well-designed I have seen in any free app." />
        </div>
      </section>

      {/* ─────────── FINAL CTA ─────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-red-950/20 to-transparent pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="text-6xl mb-6 select-none" style={{ fontFamily: "'Zen Maru Gothic', sans-serif" }}>
            よし！
          </div>
          <h2 className="text-5xl sm:text-6xl font-black tracking-tight mb-6 leading-none">
            Ready to start<br />
            <span className="bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
              your journey?
            </span>
          </h2>
          <p className="text-white/40 text-lg mb-10">
            Join thousands of learners mastering Japanese the beautiful way.
          </p>
          <button onClick={handleCTA}
            className="px-10 py-5 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xl
              transition-all active:scale-95 shadow-2xl shadow-red-900/50">
            {isAuthenticated ? "Back to App →" : "Create Free Account →"}
          </button>
          <p className="text-white/20 text-sm mt-5">No credit card required. Free forever.</p>
        </div>
      </section>

      {/* ─────────── FOOTER ─────────── */}
      <footer className="border-t border-white/[0.06] py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="GoJapan" className="w-7 h-7 rounded-full object-cover opacity-60" />
            <span className="text-white/40 text-sm font-bold tracking-widest uppercase">GoJapan</span>
          </div>
          <p className="text-white/20 text-xs uppercase tracking-widest font-medium">
            © 2024 GoJapan — Mastery Awaits.
          </p>
          <div className="flex gap-6 text-white/30 text-xs uppercase tracking-widest font-bold">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
