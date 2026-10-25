import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ChartBar, CircleCheck, CircleX, SkipForward, ArrowRight, Loader2, Heart, Skull, Clock } from 'lucide-react';
import { getQuestions, saveTrainingStats } from '../../api/learningApi';

export default function TrainingPlay() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId, quizIds, sessionId, mode, lessonTitle, type, playType = 'classic', difficulty, blitzTime, selectedRows } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [choices, setChoices] = useState([]);
  const [stats, setStats] = useState({
    correct: 0,
    wrong: 0,
    startTime: Date.now(),
    answersTimes: []
  });
  const [lastAnswerTime, setLastAnswerTime] = useState(Date.now());
  const [gameOver, setGameOver] = useState(false);

  const [hearts, setHearts] = useState(() => {
    if (playType !== 'gauntlet') return null;
    if (difficulty === 'normal' || difficulty === 'hard') return 3;
    if (difficulty === 'instant_death') return 1;
    return 3;
  });

  const [timeLeft, setTimeLeft] = useState(blitzTime || 0);

  const inputRef = useRef(null);

  useEffect(() => {
    const idsToFetch = quizIds?.length > 0 ? quizIds : (quizId ? [quizId] : []);
    if (idsToFetch.length === 0) {
      navigate('/');
      return;
    }

    const loadQuestions = async () => {
      try {
        setLoading(true);
        let allQuestions = [];
        for (const id of idsToFetch) {
           const data = await getQuestions(id);
           if (data && data.questions) {
              allQuestions = [...allQuestions, ...data.questions];
           }
        }

        // Apply Kana filters if they exist
        if (type === 'Kana' && selectedRows && selectedRows.length > 0) {
           const validRomajis = selectedRows.flatMap(row => row.split(' • ').map(s => s.trim()));
           allQuestions = allQuestions.filter(q => validRomajis.includes(q.Romaji) || validRomajis.includes(q.Character));
        }

        allQuestions.sort(() => Math.random() - 0.5);
        
        // If filtering results in empty, fallback or alert
        if (allQuestions.length === 0) {
           console.warn("No questions matched the selected rows filter.");
        }
        
        setQuestions(allQuestions);
      } catch (error) {
        console.error("Error fetching questions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, [quizId, quizIds]);

  // Reset states for each new question
  useEffect(() => {
    if (questions.length > 0 && currentIndex < questions.length && !gameOver) {
      if (mode === 'pick') {
        generateChoices();
      }
      setLastAnswerTime(Date.now());
      setIsAnswered(false);
      setIsCorrect(null);
      setUserAnswer('');
      if (playType === 'blitz') {
        setTimeLeft(blitzTime);
      }
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [currentIndex, questions, gameOver]);

  // Timer logic for Blitz mode
  useEffect(() => {
    if (playType !== 'blitz') return;
    if (isAnswered || gameOver || loading || questions.length === 0) return;

    if (timeLeft <= 0) {
      checkAnswer('');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, gameOver, playType, loading, questions]);

  const generateChoices = () => {
    const current = questions[currentIndex];
    const correct = getTargetValue(current);
    let wrongOnes = questions
      .filter(q => getTargetValue(q) !== correct)
      .map(q => getTargetValue(q));
    const shuffledWrong = [...new Set(wrongOnes)].sort(() => 0.5 - Math.random()).slice(0, 3);
    const allChoices = [...shuffledWrong, correct].sort(() => 0.5 - Math.random());
    setChoices(allChoices);
  };

  const getTargetValue = (q) => {
    if (type === 'Kana') return q.Romaji;
    if (type === 'Kanji' || type === 'Vocabulary') return q.Meaning;
    return '';
  };

  const getQuestionChar = (q) => {
    if (type === 'Kana') return q.Character;
    if (type === 'Kanji') return q.Character;
    if (type === 'Vocabulary') return q.Word;
    return '';
  };

  const checkAnswer = (answer) => {
    if (isAnswered || gameOver) return;

    const current = questions[currentIndex];
    const correctValue = getTargetValue(current).toLowerCase().trim();
    const providedValue = answer.toLowerCase().trim();
    
    const correct = providedValue === correctValue;
    const now = Date.now();
    const timeToAnswer = (now - lastAnswerTime) / 1000;

    setIsAnswered(true);
    setIsCorrect(correct);
    setUserAnswer(answer);
    
    setStats(prev => ({
      ...prev,
      correct: correct ? prev.correct + 1 : prev.correct,
      wrong: !correct ? prev.wrong + 1 : prev.wrong,
      answersTimes: [...prev.answersTimes, timeToAnswer]
    }));

    let isDead = false;
    if (playType === 'gauntlet') {
      if (!correct) {
        const newHearts = hearts - 1;
        setHearts(newHearts);
        if (newHearts <= 0) {
          isDead = true;
          setGameOver(true);
        }
      } else {
        if (difficulty === 'normal') {
          setHearts(Math.min(3, hearts + 1));
        }
      }
    }

    if (!isDead && correct && mode === 'pick') {
      setTimeout(() => {
         handleNext();
      }, 800);
    }
  };

  const handleSkip = () => {
    if (isAnswered || gameOver) return;
    checkAnswer('');
  };

  const handleExit = () => {
    if (type) {
       navigate(`/${type.toLowerCase()}`, { replace: true });
    } else {
       navigate('/', { replace: true });
    }
  };

  const handleNext = async () => {
    if (gameOver) {
       await finishSession();
       return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await finishSession();
    }
  };

  const finishSession = async () => {
    const totalTime = (Date.now() - stats.startTime) / 1000;
    const answeredCount = stats.correct + stats.wrong;
    const accuracy = answeredCount > 0 ? (stats.correct / answeredCount) * 100 : 0;
    
    const finalStats = {
      sessionId,
      score: stats.correct * 10,
      accuracyRate: accuracy,
      timeTaken: totalTime,
      heartsRemaining: playType === 'gauntlet' ? hearts : null
    };

    try {
      await saveTrainingStats(finalStats);
      
      const avgTime = stats.answersTimes.length > 0 ? stats.answersTimes.reduce((a, b) => a + b, 0) / stats.answersTimes.length : 0;
      const fastest = stats.answersTimes.length > 0 ? Math.min(...stats.answersTimes) : 0;
      const slowest = stats.answersTimes.length > 0 ? Math.max(...stats.answersTimes) : 0;

      navigate('/training/stats', { 
        replace: true,
        state: { 
          stats: {
            ...finalStats,
            totalAnswers: answeredCount,
            correct: stats.correct,
            wrong: stats.wrong,
            avgTime,
            fastest,
            slowest,
            playType,
            gameOver
          },
          lessonTitle,
          type
        } 
      });
    } catch (error) {
      console.error("Error saving stats:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={48} />
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    /* Use h-dvh (dynamic viewport height) on mobile so it fits exactly the visible area,
       falling back to h-screen. overflow-hidden prevents any scroll. */
    <div className="h-screen h-dvh bg-[#111] text-white font-sans flex flex-col overflow-hidden">
      
      {/* ── Top Navigation Bar ── */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between shrink-0">
        <button
          onClick={handleExit}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors cursor-pointer z-50"
        >
          <X size={18} />
        </button>
        
        {/* Progress bar */}
        <div className="flex-1 max-w-md mx-4 sm:mx-8 relative">
          {playType === 'blitz' && (
            <div 
              className="absolute -top-5 w-full flex justify-center text-red-400 font-black text-base sm:text-xl tracking-wider transition-all"
              style={{ transform: timeLeft <= 5 ? 'scale(1.1)' : 'scale(1)' }}
            >
              <Clock size={17} className="mr-1.5 inline" /> 
              {timeLeft}s
            </div>
          )}
          <div className="h-2 w-full bg-[#333] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${
                playType === 'blitz' && timeLeft <= 3 ? 'bg-red-500 shadow-[0_0_15px_red]' : 'bg-white shadow-[0_0_10px_white]'
              }`}
              style={{ width: playType === 'blitz' ? `${(timeLeft / blitzTime) * 100}%` : `${progress}%` }}
            />
          </div>
        </div>

        {/* Right: hearts or score */}
        <div className="flex items-center gap-3 sm:gap-6">
          {playType === 'gauntlet' ? (
            <div className="flex items-center gap-0.5 sm:gap-1">
              {difficulty === 'instant_death' ? (
                <div className="flex items-center gap-1.5">
                  <Skull size={20} className={hearts > 0 ? 'text-red-500' : 'text-white/20'} />
                  <span className="font-bold text-red-500 text-sm">1 Strike</span>
                </div>
              ) : (
                [1, 2, 3].map(i => (
                  <Heart key={i} size={22} className={
                    i <= hearts 
                    ? 'fill-red-500 text-red-500' 
                    : 'fill-transparent text-[#444]'
                  } />
                ))
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-1.5">
                <CircleCheck size={16} className="text-green-500" />
                <span className="font-bold text-base sm:text-lg">{stats.correct}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CircleX size={16} className="text-red-500" />
                <span className="font-bold text-base sm:text-lg">{stats.wrong}</span>
              </div>
              <button className="hidden sm:flex w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                <ChartBar size={18} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content Area — flex-1 with overflow hidden ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden min-h-0">
        
        {/* Question label + character */}
        <div className="text-center mb-6 sm:mb-10">
          <span className="text-gray-500 text-xs sm:text-sm uppercase tracking-widest font-bold block mb-3 sm:mb-4">
            {playType} {mode} • {currentIndex + 1} of {questions.length}
          </span>
          {/* Character: scales down on mobile via clamp / responsive classes */}
          <div className="text-[72px] sm:text-[100px] md:text-[120px] font-black leading-none tracking-tighter">
            {getQuestionChar(currentQ)}
          </div>
        </div>

        {/* Mode-dependent answer area */}
        <div className="w-full max-w-xl">
          
          {mode === 'pick' ? (
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {choices.map((choice, i) => {
                const isChoiceCorrect = choice === getTargetValue(currentQ);
                const isChoiceSelected = userAnswer === choice;
                
                let style = "bg-[#1f1f1f] border-[#333] text-white hover:border-[#555]";
                if (isAnswered || gameOver) {
                  if (isChoiceCorrect) style = "bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]";
                  else if (isChoiceSelected && !isCorrect) style = "bg-red-500/20 border-red-500 text-red-500 animate-shake";
                }

                return (
                  <button 
                    key={i}
                    disabled={isAnswered || gameOver}
                    onClick={() => checkAnswer(choice)}
                    className={`p-4 sm:p-8 rounded-2xl border text-xl sm:text-3xl font-bold transition-all transform active:scale-[0.98] ${style}`}
                  >
                    {choice}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className={`relative p-1 rounded-2xl transition-all ${
                isAnswered || gameOver
                ? (isCorrect ? 'bg-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]') 
                : 'bg-[#333] focus-within:bg-white'
              }`}>
                <input 
                  ref={inputRef}
                  type="text" 
                  value={userAnswer}
                  onChange={(e) => !(isAnswered || gameOver) && setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (!isAnswered && !gameOver) checkAnswer(userAnswer);
                      else handleNext();
                    }
                  }}
                  disabled={isAnswered || gameOver}
                  autoComplete="off"
                  autoCorrect="off"
                  placeholder="Type the reading..."
                  className={`w-full bg-[#111] rounded-[14px] p-4 sm:p-6 text-xl sm:text-2xl font-bold text-center border-none outline-none transition-colors ${
                    isAnswered || gameOver ? 'text-white' : 'text-white'
                  }`}
                />
              </div>
              
              {(isAnswered || gameOver) && !isCorrect && (
                <div className="text-center text-red-500 text-lg sm:text-xl font-bold animate-fadeIn">
                  Correct: <span className="underline">{getTargetValue(currentQ)}</span>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Bottom Action Bar — always visible, fixed at bottom ── */}
      <div className="px-4 sm:px-8 py-4 sm:py-6 border-t border-white/5 flex items-center justify-between bg-[#111] shrink-0">
        <button 
          onClick={handleSkip}
          disabled={isAnswered || gameOver}
          className="flex items-center gap-2 text-gray-500 font-bold hover:text-white transition-colors disabled:opacity-30 cursor-pointer text-sm sm:text-base"
        >
          <SkipForward size={18} />
          SKIP
        </button>
        
        <button 
          onClick={(isAnswered || gameOver) ? handleNext : () => checkAnswer(userAnswer)}
          className={`px-8 sm:px-12 py-3.5 sm:py-5 rounded-2xl font-black text-base sm:text-xl flex items-center gap-2 sm:gap-3 transition-all min-w-[160px] sm:min-w-[200px] justify-center ${
            gameOver 
            ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:scale-[1.05]'
            : (userAnswer || isAnswered) 
              ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:scale-[1.05]' 
              : 'bg-white/5 text-gray-600 grayscale'
          }`}
        >
          {gameOver ? 'GAME OVER' : (isAnswered ? 'CONTINUE' : 'CHECK')}
          <ArrowRight size={20} />
        </button>
      </div>

    </div>
  );
}
