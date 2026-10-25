import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, MousePointer2, Keyboard, CircleCheck, Loader2, Heart, ShieldAlert, Skull, Zap } from 'lucide-react';
import { getLessons, getQuizzesByLesson, createTrainingSession } from '../../api/learningApi';
import { useAuth } from '../../context/AuthContext';

export default function TrainingSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { lessonId, lessonIds, type, playType = 'classic', selectedRows } = location.state || {};
  const activeLessonIds = lessonIds || (lessonId ? [lessonId] : []);
  
  const [lesson, setLesson] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('pick'); // 'pick' or 'type'
  const [difficulty, setDifficulty] = useState('normal'); // 'normal', 'hard', 'instant_death'
  const [blitzTime, setBlitzTime] = useState(10); // in seconds

  useEffect(() => {
    if (activeLessonIds.length === 0) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch lessons to get title
        const lessons = await getLessons({ type });
        if (activeLessonIds.length === 1) {
          const currentLesson = lessons.find(l => l.LessonID === activeLessonIds[0]);
          setLesson(currentLesson);
        } else {
          const firstLesson = lessons.find(l => l.LessonID === activeLessonIds[0]);
          setLesson({ ...firstLesson, Title: "Multiple Lessons Mode" });
        }

        // Fetch available quizzes for these lessons
        let allQuizzes = [];
        for (const lId of activeLessonIds) {
          const quizData = await getQuizzesByLesson(lId);
          if (quizData) {
            allQuizzes = [...allQuizzes, ...quizData];
          }
        }
        setQuizzes(allQuizzes);
      } catch (error) {
        console.error("Error loading setup data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonIds, lessonId, type]);

  const handleStart = async () => {
    if (quizzes.length === 0) {
      alert("No quizzes available for this lesson yet.");
      return;
    }

    try {
      // Create session in backend
      const session = await createTrainingSession(user?.UserID || null, activeLessonIds[0]);
      
      // Navigate to Play page
      navigate('/training/play', { 
        state: { 
          quizIds: quizzes.map(q => q.QuizID), 
          sessionId: session.sessionId,
          mode,
          lessonTitle: lesson?.Title,
          type,
          playType,
          difficulty: playType === 'gauntlet' ? difficulty : null,
          blitzTime: playType === 'blitz' ? blitzTime : null,
          selectedRows
        } 
      });
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  // Determine Title & Subtitle based on playType
  let titleText = `${type} Training`;
  let subtitleText = "Practice in a classic, endless way";
  let icon = null;

  if (playType === 'gauntlet') {
    titleText = `${type} Gauntlet`;
    subtitleText = "Survive as long as you can";
    icon = <ShieldAlert size={36} className="mx-auto mb-3" />;
  } else if (playType === 'blitz') {
    titleText = `${type} Blitz`;
    subtitleText = "Practice in a fast-paced, time-limited way";
    icon = <Zap size={36} className="mx-auto mb-3 text-white" />;
  }

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <div className="max-w-2xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          {icon}
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            {titleText}
          </h1>
          <p className="text-gray-400 text-lg">
            {subtitleText}
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-[#2a2a2a] rounded-xl p-5 mb-4">
          <div className="text-[#a0a0a0] text-[15px] mb-1">Selected:</div>
          <div className="text-white text-[17px] font-medium">{type} • Level {lesson?.JLPT_Level || 'Basic'} - {lesson?.Title}</div>
        </div>

        {/* Mode Selection */}
        <div className="space-y-3 mb-4">
           <button 
             onClick={() => setMode('pick')}
             className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 group ${
               mode === 'pick' ? 'bg-[#2a2a2a] border-white' : 'bg-[#2a2a2a] border-transparent hover:border-white/20'
             }`}
           >
             <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-black">
               <MousePointer2 size={24} className="fill-black" />
             </div>
             <div className="text-left flex-1">
               <div className="text-[17px] font-medium text-white mb-0.5">Pick</div>
               <div className="text-[#999] text-[13px]">Pick the correct answer from multiple options</div>
             </div>
             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
               mode === 'pick' ? 'border-white bg-[#555]' : 'border-[#555]'
             }`}>
               {mode === 'pick' && <CircleCheck size={24} className="text-white fill-[#555]" />}
             </div>
           </button>

           <button 
             onClick={() => setMode('type')}
             className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 group ${
               mode === 'type' ? 'bg-[#2a2a2a] border-white' : 'bg-[#2a2a2a] border-transparent hover:border-white/20'
             }`}
           >
             <div className="w-12 h-12 bg-[#444] rounded-lg flex items-center justify-center text-[#ccc]">
               <Keyboard size={24} />
             </div>
             <div className="text-left flex-1">
               <div className="text-[17px] font-medium text-white mb-0.5">Type</div>
               <div className="text-[#999] text-[13px]">Type the correct answer</div>
             </div>
             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
               mode === 'type' ? 'border-white bg-[#555]' : 'border-[#555]'
             }`}>
               {mode === 'type' && <CircleCheck size={24} className="text-white fill-[#555]" />}
             </div>
           </button>
        </div>

        {/* Blitz Duration Selector */}
        {playType === 'blitz' && (
          <div className="bg-[#2a2a2a] rounded-xl p-6 mb-12 shadow-sm">
            <h3 className="text-[15px] font-medium text-white mb-6">Duration (per question):</h3>
            <div className="flex items-center gap-3 justify-center md:justify-start">
               {[
                 { label: '5s', val: 5 },
                 { label: '10s', val: 10 },
                 { label: '15s', val: 15 },
                 { label: '30s', val: 30 },
                 { label: '60s', val: 60 }
               ].map(t => {
                 const isActive = blitzTime === t.val;
                 return (
                   <button
                     key={t.val}
                     onClick={() => setBlitzTime(t.val)}
                     className={`w-[52px] h-[52px] rounded-full font-bold text-[15px] transition-all flex items-center justify-center ${
                       isActive 
                       ? 'bg-[#ECEBDB] text-black shadow-[0_4px_0_#b5b5a0] translate-y-[-2px]' 
                       : 'bg-[#404040] text-gray-400 shadow-[0_4px_0_#222] hover:bg-[#505050] hover:text-white'
                     }`}
                     style={isActive ? { transform: 'translateY(2px)', boxShadow: '0 2px 0 #b5b5a0' } : {}}
                   >
                     {t.label}
                   </button>
                 );
               })}
            </div>
          </div>
        )}

        {/* Difficulty Selection for Gauntlet */}
        {playType === 'gauntlet' && (
          <div className="bg-[#2a2a2a] rounded-xl p-4 space-y-3 mb-12">
            <h3 className="text-[15px] font-medium text-white mb-2 ml-2">Select Difficulty:</h3>
            
            <button 
              onClick={() => setDifficulty('normal')}
              className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 group ${
                difficulty === 'normal' ? 'bg-[#333] border-white' : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <div className="w-12 h-12 bg-black/50 rounded-lg flex items-center justify-center">
                <Heart size={24} className="fill-red-500 text-red-500" />
              </div>
              <div className="text-left flex-1">
                <div className="text-[17px] font-medium text-white mb-0.5">Normal</div>
                <div className="text-[#999] text-[13px]">3 Hearts. +1 per correct, -1 per mistake.</div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                difficulty === 'normal' ? 'border-white bg-white' : 'border-[#666]'
              }`}>
                {difficulty === 'normal' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
              </div>
            </button>

            <button 
              onClick={() => setDifficulty('hard')}
              className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 group ${
                difficulty === 'hard' ? 'bg-[#333] border-white' : 'bg-transparent border-transparent hover:bg-white/5'
              }`}
            >
              <div className="w-12 h-12 bg-black/50 rounded-lg flex items-center justify-center">
                <ShieldAlert size={24} className="text-orange-500" />
              </div>
              <div className="text-left flex-1">
                <div className="text-[17px] font-medium text-white mb-0.5">Hard</div>
                <div className="text-[#999] text-[13px]">3 Hearts. -1 per mistake. No healing.</div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                difficulty === 'hard' ? 'border-white bg-white' : 'border-[#666]'
              }`}>
                {difficulty === 'hard' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
              </div>
            </button>

            <button 
              onClick={() => setDifficulty('instant_death')}
              className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 group ${
                difficulty === 'instant_death' ? 'bg-red-500/20 border-red-500' : 'bg-transparent border-transparent hover:bg-red-500/10'
              }`}
            >
              <div className="w-12 h-12 bg-black/50 rounded-lg flex items-center justify-center">
                 <Skull size={24} className="text-red-500" />
              </div>
              <div className="text-left flex-1">
                <div className="text-[17px] font-medium text-red-400 mb-0.5">Instant Death</div>
                <div className="text-red-400/80 text-[13px]">0 Mistakes allowed. 1 strike and you're out.</div>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                difficulty === 'instant_death' ? 'border-red-500 bg-red-500' : 'border-red-500/30'
              }`}>
                {difficulty === 'instant_death' && <div className="w-2.5 h-2.5 rounded-full bg-black" />}
              </div>
            </button>
          </div>
        )}

        {/* Buttons - Matched EXACTLY to image aesthetics */}
        <div className="flex gap-4 mb-16 justify-center mt-12">
           <button 
             onClick={() => navigate(-1)}
             className="w-[180px] h-[56px] rounded-[18px] bg-[#d3cfc1] text-[#4d4b45] font-bold text-[17px] flex items-center justify-center gap-2 shadow-[0_6px_0_#9d998d] active:shadow-[0_2px_0_#9d998d] active:translate-y-1 transition-all"
           >
             <ArrowLeft size={18} />
             Back
           </button>
           <button 
             onClick={handleStart}
             className="w-[280px] h-[56px] rounded-[18px] bg-white text-black font-bold text-[17px] flex items-center justify-center gap-2 shadow-[0_6px_0_#d1d1d1] active:shadow-[0_2px_0_#d1d1d1] active:translate-y-1 transition-all"
           >
             <Play size={18} fill="black" />
             Start {playType === 'gauntlet' ? 'Gauntlet' : playType === 'blitz' ? 'Blitz' : 'Training'}
           </button>
        </div>

      </div>
    </div>
  );
}
