import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, RefreshCw, Trophy, Clock, Target, Timer, Zap, ChevronLeft, ChartBar } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <div 
    className="bg-[#141414] rounded-2xl border border-white/5 p-4 sm:p-6 transition-all hover:border-white/20 animate-slideUp"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs leading-tight">{label}</span>
    </div>
    <div className="text-2xl sm:text-4xl font-black text-white">{value}</div>
  </div>
);

export default function TrainingStats() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stats, lessonTitle, type } = location.state || {};

  if (!stats) {
    navigate('/');
    return null;
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans py-12 px-6 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16">
           <div className="flex items-center gap-3 animate-fadeIn">
              <Trophy size={48} className="text-yellow-500 min-w-[48px]" />
              <div>
                 <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Great Job!</h1>
                 <p className="text-gray-500 font-bold mb-0">{lessonTitle} Completed</p>
              </div>
           </div>
           
           <div className="text-left sm:text-right">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-widest block mb-2">Lesson Type</span>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 font-black text-lg inline-block sm:block">
                 {type}
              </div>
           </div>
        </div>

        {/* Global Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
           <StatCard 
              icon={Clock} 
              label="Training Time" 
              value={formatTime(stats.timeTaken)} 
              color="bg-blue-500"
              delay={0}
           />
           <StatCard 
              icon={Target} 
              label="Accuracy" 
              value={`${stats.accuracyRate.toFixed(1)}%`} 
              color="bg-purple-500"
              delay={100}
           />
           <StatCard 
              icon={Zap} 
              label="Total Score" 
              value={stats.score} 
              color="bg-yellow-500"
              delay={200}
           />
           <StatCard 
              icon={ChartBar} 
              label="Total Played" 
              value={stats.totalAnswers} 
              color="bg-pink-500"
              delay={300}
           />
        </div>

        {/* Detailed Grid Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="space-y-6">
               <h3 className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-4">Speed Metrics</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                     <span className="text-gray-400">Average Time</span>
                     <span className="font-bold text-lg">{stats.avgTime.toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                     <span className="text-gray-400">Fastest Answer</span>
                     <span className="font-bold text-lg text-green-400">{stats.fastest.toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                     <span className="text-gray-400">Slowest Answer</span>
                     <span className="font-bold text-lg text-red-400">{stats.slowest.toFixed(2)}s</span>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-gray-500 font-bold uppercase tracking-widest text-sm mb-4">Answer Counts</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                     <span className="text-gray-400">Correct Answers</span>
                     <span className="font-bold text-lg text-green-500">{stats.correct}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                     <span className="text-gray-400">Wrong Answers</span>
                     <span className="font-bold text-lg text-red-500">{stats.wrong}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                     <span className="text-gray-400">Success Ratio</span>
                     <span className="font-bold text-lg">{(stats.correct / stats.totalAnswers).toFixed(2)}</span>
                  </div>
               </div>
            </div>

            <div className="bg-[#141414] rounded-3xl p-8 flex flex-col items-center justify-center border border-white/10">
               <div className="text-gray-500 font-bold mb-2">Overall Rank</div>
               <div className="text-[120px] font-black leading-none text-white opacity-20">S</div>
               <div className="text-lg font-bold text-[#6a9fc0] -mt-10">Legendary!</div>
            </div>
        </div>

        {/* Actions Button */}
        <div className="flex flex-col sm:flex-row gap-6 animate-fadeIn" style={{ animationDelay: '600ms' }}>
           <button 
             onClick={() => navigate(type ? `/${type.toLowerCase()}` : '/')}
             className="flex-1 py-6 rounded-2xl bg-[#141414] border border-white/5 text-white font-bold text-xl hover:bg-white/5 hover:border-white/10 transition-all flex items-center justify-center gap-3"
           >
             <Home size={24} />
             Back Home
           </button>
           
           <button 
             onClick={() => navigate(-2)} // Back to training setup
             className="flex-1 py-6 rounded-2xl bg-white text-black font-black text-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-[0_15px_40px_rgba(255,255,255,0.15)]"
           >
             <RefreshCw size={24} />
             Try Again
           </button>
        </div>

      </div>
    </div>
  );
}
