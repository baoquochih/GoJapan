import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Target, Trophy, Users, CheckCircle2, XCircle, 
  ChevronRight, Star, Award, Zap, Sword, Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserHistory, getUserAchievements, getUserProgress } from '../../api/learningApi';

export default function StatsTab() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
     totalSessions: 0,
     accuracy: 0,
     bestStreak: 0,
     characters: 0,
     correct: 0,
     incorrect: 0
  });

  const [achievements, setAchievements] = useState({
     xp: 0,
     level: 1,
     unlocked: 0,
     total: 12
  });

  const [masteryFilter, setMasteryFilter] = useState('All');
  const [blitzFilter, setBlitzFilter] = useState('Kana');


  useEffect(() => {
    const loadStats = async () => {
      const activeUserId = user?.UserID || user?.id;
      if (!activeUserId) return;

      try {
        const [hist, achs, prog] = await Promise.all([
           getUserHistory(activeUserId),
           getUserAchievements(activeUserId),
           getUserProgress(activeUserId)
        ]);

        // Process hist & prog
        const totalSessions = prog?.totalSessions || hist?.length || 0;
        const accuracy = Math.round(parseFloat(prog?.averageAccuracy)) || 0;
        
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        
        (hist || []).forEach(session => {
           // We assume 10 questions max per session, score is 10 per correct
           const c = Math.round((session.Score || 0) / 10);
           const acc = session.AccuracyRate || 100;
           // avoid division by zero
           const totalQ = acc > 0 ? c / (acc / 100) : c;
           correctAnswers += c;
           incorrectAnswers += Math.max(0, Math.round(totalQ - c));
        });

        // Compute longest streak
        let longestStreak = 0;
        if ((hist || []).length > 0) {
           const activeDates = new Set(hist.map(session => {
              const d = new Date(session.StartTime);
              d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
              return d.toISOString().split('T')[0];
           }));
           const sortedDates = Array.from(activeDates).sort((a,b) => new Date(b) - new Date(a));
           let maxStreak = 1;
           let tempStreak = 1;
           for (let i = 0; i < sortedDates.length - 1; i++) {
              const current = new Date(sortedDates[i]);
              const next = new Date(sortedDates[i+1]);
              const diffTime = Math.abs(current - next);
              const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 
              if (diffDays === 1) {
                 tempStreak++;
                 maxStreak = Math.max(maxStreak, tempStreak);
              } else {
                 tempStreak = 1;
              }
           }
           longestStreak = Math.max(maxStreak, 1);
        }

        setStats({
          totalSessions,
          accuracy,
          bestStreak: longestStreak || user?.LongestStreak || 0,
          characters: Math.min(104, Math.round((correctAnswers + incorrectAnswers) / 3)) || 0, 
          correct: correctAnswers,
          incorrect: incorrectAnswers
        });

        // Setup achievements
        const baseTotal = 12;
        const unlockedCount = achs ? achs.length : 0;
        const totalXP = achs ? achs.length * 150 : 0; 
        const level = Math.floor(totalXP / 100) + 1;

        setAchievements({
          xp: totalXP,
          level,
          unlocked: unlockedCount,
          total: baseTotal
        });

      } catch (e) {
        console.error("Failed to load stats", e);
      }
    };
    loadStats();
  }, [user]);

  // Overall progress pct
  const overallProgress = Math.round((achievements.unlocked / achievements.total) * 100) || 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* 6 Grid Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Sessions */}
        <div className="bg-[#141414] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
           <div className="w-10 h-10 rounded-xl bg-[#222] border border-white/5 text-[#888] flex items-center justify-center mb-4">
             <TrendingUp size={20} />
           </div>
           <div>
             <div className="text-[28px] font-bold text-white leading-none mb-1">{stats.totalSessions}</div>
             <div className="text-[13px] text-[#666] font-medium">Total Sessions</div>
           </div>
        </div>

        {/* Accuracy */}
        <div className="bg-[#141414] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
           <div className="w-10 h-10 rounded-xl bg-[#222] border border-white/5 text-[#888] flex items-center justify-center mb-4">
             <Target size={20} />
           </div>
           <div>
             <div className="text-[28px] font-bold text-white leading-none mb-1">{stats.accuracy}%</div>
             <div className="text-[13px] text-[#666] font-medium">Accuracy</div>
           </div>
        </div>

        {/* Best Streak */}
        <div className="bg-[#141414] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
           <div className="w-10 h-10 rounded-xl bg-[#222] border border-white/5 text-[#888] flex items-center justify-center mb-4">
             <Flame size={20} />
           </div>
           <div>
             <div className="text-[28px] font-bold text-white leading-none mb-1">{stats.bestStreak}</div>
             <div className="text-[13px] text-[#666] font-medium">Best Streak</div>
           </div>
        </div>

        {/* Characters */}
        <div className="bg-[#141414] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
           <div className="w-10 h-10 rounded-xl bg-[#222] border border-white/5 text-[#888] flex items-center justify-center mb-4">
             <Users size={20} />
           </div>
           <div>
             <div className="text-[28px] font-bold text-white leading-none mb-1">{stats.characters}</div>
             <div className="text-[13px] text-[#666] font-medium">Characters</div>
           </div>
        </div>

        {/* Correct */}
        <div className="bg-[#141414] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
           <div className="w-10 h-10 rounded-xl bg-[#222] border border-white/5 text-[#888] flex items-center justify-center mb-4">
             <CheckCircle2 size={20} />
           </div>
           <div>
             <div className="text-[28px] font-bold text-white leading-none mb-1">{stats.correct}</div>
             <div className="text-[13px] text-[#666] font-medium">Correct</div>
           </div>
        </div>

        {/* Incorrect */}
        <div className="bg-[#141414] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
           <div className="w-10 h-10 rounded-xl bg-[#222] border border-white/5 text-[#888] flex items-center justify-center mb-4">
             <XCircle size={20} />
           </div>
           <div>
             <div className="text-[28px] font-bold text-[#888] leading-none mb-1">{stats.incorrect}</div>
             <div className="text-[13px] text-[#666] font-medium">Incorrect</div>
           </div>
        </div>

      </div>

      {/* Wide Achievements Card */}
      <div className="bg-[#141414] border border-white/5 p-6 rounded-2xl">
         <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                  <Trophy size={22} className="text-yellow-500" />
               </div>
               <div>
                  <h3 className="text-white text-[20px] font-bold">Achievements</h3>
                  <p className="text-[#666] text-[14px]">Celebrate your milestones</p>
               </div>
            </div>
            <button className="bg-[#1a1a1a] hover:bg-white/5 text-[#888] hover:text-white text-[13px] font-semibold px-5 py-2.5 rounded-full transition-colors flex items-center gap-1 border border-white/5">
               View All <ChevronRight size={14} />
            </button>
         </div>

         <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* XP */}
            <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-center text-[#555]">
                 <Star size={20} />
               </div>
               <div>
                 <div className="text-white font-bold text-[22px] leading-none mb-1">{achievements.xp}</div>
                 <div className="text-[#666] text-[12px] font-medium">XP</div>
               </div>
            </div>

            {/* Level */}
            <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-center text-[#555]">
                 <Trophy size={20} />
               </div>
               <div>
                 <div className="text-white font-bold text-[22px] leading-none mb-1">{achievements.level}</div>
                 <div className="text-[#666] text-[12px] font-medium">Level</div>
               </div>
            </div>

            {/* Unlocked */}
            <div className="flex-1 bg-[#1a1a1a] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-white/5 flex items-center justify-center text-[#555]">
                 <Award size={20} />
               </div>
               <div>
                 <div className="text-white font-bold text-[22px] leading-none mb-1">{achievements.unlocked}/{achievements.total}</div>
                 <div className="text-[#666] text-[12px] font-medium">Unlocked</div>
               </div>
            </div>
         </div>

         {/* Overall Progress Bar */}
         <div>
            <div className="w-full h-2.5 bg-[#222] rounded-full overflow-hidden mb-3">
               <div 
                 className="h-full rounded-full bg-white/40 transition-all duration-1000"
                 style={{ width: `${Math.max(overallProgress, 2)}%` }}
               />
            </div>
            <div className="flex justify-between items-center text-[13px] font-semibold px-1">
               <span className="text-[#888]">Overall Progress</span>
               <span className="text-white">{overallProgress}%</span>
            </div>
         </div>
      </div>

      {/* Grid of 4 cards (Bottom) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         
         {/* Character Mastery */}
         <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
               <div>
                 <h3 className="text-white text-[18px] font-bold">Character Mastery</h3>
                 <p className="text-[#666] text-[13px]">Your learning progress at a glance</p>
               </div>
               <div className="flex flex-wrap bg-[#1a1a1a] p-1 rounded-xl sm:rounded-full border border-white/5 gap-1 xl:gap-0">
                 <button onClick={() => setMasteryFilter('All')} className={`px-5 py-1.5 rounded-full text-[13px] font-bold ${masteryFilter === 'All' ? 'bg-white text-black shadow-md' : 'text-[#888] hover:text-white hover:bg-white/5 transition-colors'}`}>All</button>
                 <button onClick={() => setMasteryFilter('Kana')} className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${masteryFilter === 'Kana' ? 'bg-white text-black shadow-md' : 'text-[#888] hover:text-white hover:bg-white/5 transition-colors'}`}>Kana</button>
                 <button onClick={() => setMasteryFilter('Kanji')} className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${masteryFilter === 'Kanji' ? 'bg-white text-black shadow-md' : 'text-[#888] hover:text-white hover:bg-white/5 transition-colors'}`}>Kanji</button>
                 <button onClick={() => setMasteryFilter('Vocabulary')} className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${masteryFilter === 'Vocabulary' ? 'bg-white text-black shadow-md' : 'text-[#888] hover:text-white hover:bg-white/5 transition-colors'}`}>Vocabulary</button>
               </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
               <div>
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-[#555]" />
                    <span className="text-[#888] text-[11px] font-bold tracking-widest">NEEDS PRACTICE</span>
                 </div>
                 <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-6 flex items-center justify-center text-center h-24">
                   <span className="text-[#666] text-[14px]">Keep practicing!</span>
                 </div>
               </div>
               <div>
                 <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-yellow-500 text-[11px] font-bold tracking-widest">TOP MASTERED</span>
                 </div>
                 <div className="bg-[#1a1a1a] rounded-xl border border-white/5 p-4 flex items-center justify-center text-center h-24">
                   <span className="text-[#666] text-[14px]">Master characters to see them here!</span>
                 </div>
               </div>
            </div>

            <div className="flex flex-wrap gap-2">
               <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 rounded-full px-4 py-1.5 w-max">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-[#888] text-[13px]">0 Mastered</span>
               </div>
               <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 rounded-full px-4 py-1.5 w-max">
                  <div className="w-2 h-2 rounded-full bg-white/40" />
                  <span className="text-[#888] text-[13px]">0 Learning</span>
               </div>
               <div className="flex items-center gap-2 bg-[#1a1a1a] border border-white/5 rounded-full px-4 py-1.5 w-max">
                  <div className="w-2 h-2 rounded-full bg-[#333]" />
                  <span className="text-[#888] text-[13px]">0 Needs Practice</span>
               </div>
            </div>
         </div>

         {/* Mastery Distribution */}
         <div className="bg-[#141414] border border-white/5 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
               <div>
                 <h3 className="text-white text-[18px] font-bold">Mastery Distribution</h3>
                 <p className="text-[#666] text-[13px]">Character proficiency breakdown</p>
               </div>
               <div className="text-right">
                 <div className="text-[24px] font-bold text-white leading-none">0</div>
                 <div className="text-[#888] text-[12px]">total characters</div>
               </div>
            </div>

            <div className="w-full h-8 bg-[#222] rounded-xl overflow-hidden mb-6 relative">
               <div className="w-full h-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-[13px] font-bold drop-shadow-md">0%</span>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
               <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex gap-3 items-center">
                  <div className="w-1.5 h-10 rounded-full bg-yellow-500" />
                  <div>
                    <div className="text-white font-bold text-[18px] leading-none mb-1">0 <span className="text-[#555] text-[13px] font-semibold">(0%)</span></div>
                    <div className="text-[#888] text-[12px] font-medium">Mastered</div>
                  </div>
               </div>
               <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex gap-3 items-center">
                  <div className="w-1.5 h-10 rounded-full bg-white/40" />
                  <div>
                    <div className="text-white font-bold text-[18px] leading-none mb-1">0 <span className="text-[#555] text-[13px] font-semibold">(0%)</span></div>
                    <div className="text-[#888] text-[12px] font-medium">Learning</div>
                  </div>
               </div>
               <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 flex gap-3 items-center">
                  <div className="w-1.5 h-10 rounded-full bg-[#333]" />
                  <div>
                    <div className="text-white font-bold text-[18px] leading-none mb-1">0 <span className="text-[#555] text-[13px] font-semibold">(0%)</span></div>
                    <div className="text-[#555] text-[12px] font-medium">Needs Practice</div>
                  </div>
               </div>
            </div>
         </div>

         {/* Blitz */}
         <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 relative overflow-hidden group min-h-[160px]">
            <Zap size={150} className="absolute -bottom-8 -right-8 text-white/5 group-hover:text-white/10 transition-colors pointer-events-none" />
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 relative z-10 w-full">
               <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-white/5 flex items-center justify-center shadow-inner">
                     <Zap size={22} className="text-[#888]" />
                  </div>
                  <div>
                     <h3 className="text-white text-[18px] font-bold">Blitz</h3>
                     <p className="text-[#666] text-[13px]">Speed challenge stats</p>
                  </div>
               </div>
               <div className="flex flex-wrap bg-[#1a1a1a] p-1 rounded-xl sm:rounded-full border border-white/5 gap-1 xl:gap-0">
                 <button onClick={() => setBlitzFilter('Kana')} className={`px-5 py-1.5 rounded-full text-[13px] font-bold ${blitzFilter === 'Kana' ? 'bg-white text-black shadow-md' : 'text-[#888] hover:text-white hover:bg-white/5 transition-colors'}`}>Kana</button>
                 <button onClick={() => setBlitzFilter('Kanji')} className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${blitzFilter === 'Kanji' ? 'bg-white text-black shadow-md' : 'text-[#888] hover:text-white hover:bg-white/5 transition-colors'}`}>Kanji</button>
                 <button onClick={() => setBlitzFilter('Vocab')} className={`px-4 py-1.5 rounded-full text-[13px] font-bold ${blitzFilter === 'Vocab' ? 'bg-white text-black shadow-md' : 'text-[#888] hover:text-white hover:bg-white/5 transition-colors'}`}>Vocab</button>
               </div>
            </div>
         </div>

         {/* Gauntlet */}
         <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 relative overflow-hidden group min-h-[160px]">
            <Trophy size={150} className="absolute -bottom-8 -right-8 text-white/5 group-hover:text-yellow-500/10 transition-colors pointer-events-none" />
            <div className="flex justify-between items-start relative z-10">
               <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#1a1a1a] border border-white/5 flex items-center justify-center shadow-inner">
                     <Sword size={22} className="text-[#888]" />
                  </div>
                  <div>
                     <h3 className="text-white text-[18px] font-bold">Gauntlet</h3>
                     <p className="text-[#666] text-[13px]">Endurance challenge stats</p>
                  </div>
               </div>
            </div>
         </div>

      </div>
    </div>
  );
}
