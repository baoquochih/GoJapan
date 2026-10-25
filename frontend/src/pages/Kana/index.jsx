import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, MousePointer2, Zap, Sword, Play } from 'lucide-react';
import { getLessons } from '../../api/learningApi';
import { useNavigate } from 'react-router-dom';

const kanaData = {
  hiragana: {
    title: 'Hiragana ひらがな',
    groups: [
      { id: 'h_base', name: 'Base', rows: [ 'a • i • u • e • o', 'ka • ki • ku • ke • ko', 'sa • shi • su • se • so', 'ta • chi • tsu • te • to', 'na • ni • nu • ne • no', 'ha • hi • fu • he • ho', 'ma • mi • mu • me • mo', 'ya • yu • yo', 'ra • ri • ru • re • ro', 'wa • wo • n' ], kanaRows: [ 'あ • い • う • え • お', 'か • き • く • け • こ', 'さ • し • す • せ • そ', 'た • ち • つ • て • と', 'な • に • ぬ • ね • の', 'は • ひ • ふ • へ • ほ', 'ま • み • む • め • も', 'や • ゆ • よ', 'ら • り • る • れ • ろ', 'わ • を • ん' ] },
      { id: 'h_dakuon', name: 'Dakuon', rows: [ 'ga • gi • gu • ge • go', 'za • ji • zu • ze • zo', 'da • ji • zu • de • do', 'ba • bi • bu • be • bo', 'pa • pi • pu • pe • po' ], kanaRows: [ 'が • ぎ • ぐ • げ • ご', 'ざ • じ • ず • ぜ • ぞ', 'だ • ぢ • づ • で • ど', 'ば • び • ぶ • べ • ぼ', 'ぱ • ぴ • ぷ • ぺ • ぽ' ] },
      { id: 'h_yoon', name: 'Yoon', rows: [ 'kya • kyu • kyo', 'gya • gyu • gyo', 'sha • shu • sho', 'ja • ju • jo', 'cha • chu • cho', 'nya • nyu • nyo', 'mya • myu • myo', 'rya • ryu • ryo', 'hya • hyu • hyo', 'bya • byu • byo', 'pya • pyu • pyo' ], kanaRows: [ 'きゃ • きゅ • きょ', 'ぎゃ • ぎゅ • ぎょ', 'しゃ • しゅ • しょ', 'じゃ • じゅ • じょ', 'ちゃ • ちゅ • ちょ', 'にゃ • にゅ • にょ', 'みゃ • みゅ • みょ', 'りゃ • りゅ • りょ', 'ひゃ • ひゅ • ひょ', 'びゃ • びゅ • びょ', 'ぴゃ • ぴゅ • ぴょ' ] }
    ]
  },
  katakana: {
    title: 'Katakana カタカナ',
    groups: [
      { id: 'k_base', name: 'Base', rows: [ 'a • i • u • e • o', 'ka • ki • ku • ke • ko', 'sa • shi • su • se • so', 'ta • chi • tsu • te • to', 'na • ni • nu • ne • no', 'ha • hi • fu • he • ho', 'ma • mi • mu • me • mo', 'ya • yu • yo', 'ra • ri • ru • re • ro', 'wa • wo • n' ], kanaRows: [ 'ア • イ • ウ • エ • オ', 'カ • キ • ク • ケ • コ', 'サ • シ • ス • セ • ソ', 'タ • チ • ツ • テ • ト', 'ナ • ニ • ヌ • ネ • ノ', 'ハ • ヒ • フ • ヘ • ホ', 'マ • ミ • ム • メ • モ', 'ヤ • ユ • ヨ', 'ラ • リ • ル • レ • ロ', 'ワ • ヲ • ン' ] },
      { id: 'k_dakuon', name: 'Dakuon', rows: [ 'ga • gi • gu • ge • go', 'za • ji • zu • ze • zo', 'da • ji • zu • de • do', 'ba • bi • bu • be • bo', 'pa • pi • pu • pe • po' ], kanaRows: [ 'ガ • ギ • グ • ゲ • ゴ', 'ザ • ジ • ズ • ゼ • ゾ', 'ダ • ヂ • ヅ • デ • ド', 'バ • ビ • ブ • ベ • ボ', 'パ • ピ • プ • ペ • ポ' ] },
      { id: 'k_yoon', name: 'Yoon', rows: [ 'kya • kyu • kyo', 'gya • gyu • gyo', 'sha • shu • sho', 'ja • ju • jo', 'cha • chu • cho', 'nya • nyu • nyo', 'mya • myu • myo', 'rya • ryu • ryo', 'hya • hyu • hyo', 'bya • byu • byo', 'pya • pyu • pyo' ], kanaRows: [ 'キャ • キュ • キョ', 'ギャ • ギュ • ギョ', 'シャ • シュ • ショ', 'ジャ • ジュ • ジョ', 'チャ • チュ • チョ', 'ニャ • ニュ • ニョ', 'ミャ • ミュ • ミョ', 'リャ • リュ • リョ', 'ヒャ • ヒュ • ヒョ', 'ビャ • ビュ • ビョ', 'ピャ • ピュ • ピョ' ] },
      { id: 'k_foreign', name: 'Foreign sound', rows: [ 'fa • fi • fe • fo • fyu', 'wi • we • wo', 'va • vi • vu • ve • vo', 'ti • tu', 'di • du', 'she • shi', 'che • je', 'tsa • tsi • tse • tso' ], kanaRows: [ 'ファ • フィ • フェ • フォ • フュ', 'ウィ • ウェ • ウォ', 'ヴァ • ヴィ • ヴ • ヴェ • ヴォ', 'ティ • トゥ', 'ディ • ドゥ', 'シェ • シィ', 'チェ • ジェ', 'ツァ • ツィ • ツェ • ツォ' ] }
    ]
  }
};

const RowItem = ({ row, kanaRow, isSelected, toggleRow }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <label 
      className="flex items-center gap-4 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative flex items-center justify-center">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={() => toggleRow(row)}
          className="appearance-none w-4 h-4 rounded-sm border border-gray-500 bg-transparent checked:bg-white checked:border-white transition-all cursor-pointer group-hover:border-white"
        />
        {isSelected && (
          <svg className="w-3 h-3 text-black absolute pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </div>
      <span className="text-[17px] font-mono text-[#aaa] group-hover:text-white transition-colors">
        {isHovered && kanaRow ? kanaRow : row}
      </span>
    </label>
  );
};

const GroupSection = ({ group, selectedRows, toggleRow, selectAllInGroup }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-white/10 last:border-none pb-4 mb-4">
      <div 
        className="flex items-center gap-2 cursor-pointer mb-3 text-[17px] text-[#ddd] hover:text-white"
        onClick={() => setOpen(!open)}
      >
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        <span>{group.name}</span>
      </div>
      
      {open && (
        <div className="pl-6 space-y-3 mb-4">
          {group.rows.map((row, idx) => (
            <RowItem 
              key={row} 
              row={row} 
              kanaRow={group.kanaRows ? group.kanaRows[idx] : row} 
              isSelected={selectedRows.includes(row)} 
              toggleRow={toggleRow} 
            />
          ))}
          
          <button 
            onClick={() => selectAllInGroup(group)}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-lg bg-white text-black font-semibold text-[14px] hover:bg-gray-100 transition-colors"
          >
            <MousePointer2 size={16} className="fill-black" />
            select all {group.name.toLowerCase()}
          </button>
        </div>
      )}
    </div>
  );
};

export default function KanaPage() {
  const navigate = useNavigate();
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [dbLessonIds, setDbLessonIds] = useState([]);

  useEffect(() => {
    // Fetch lessons to just have a valid lesson ID for the game flow
    const fetchLessons = async () => {
      try {
        const data = await getLessons({ type: 'Kana' });
        if (data && data.length > 0) {
          setDbLessonIds(data.map(l => l.LessonID));
        }
      } catch (error) {
        console.error("Failed to fetch kana lessons:", error);
      }
    };
    fetchLessons();
  }, []);

  const toggleRow = (row) => {
    setSelectedRows(prev => 
      prev.includes(row) ? prev.filter(r => r !== row) : [...prev, row]
    );
  };

  const selectAllInGroup = (group) => {
    const allGroupRows = group.rows;
    const isAllSelected = allGroupRows.every(r => selectedRows.includes(r));
    
    if (isAllSelected) {
      setSelectedRows(prev => prev.filter(r => !allGroupRows.includes(r)));
    } else {
      setSelectedRows(prev => {
        const additional = allGroupRows.filter(r => !prev.includes(r));
        return [...prev, ...additional];
      });
    }
  };

  const selectAllKana = () => {
    const allRows = [];
    kanaData.hiragana.groups.forEach(g => allRows.push(...g.rows));
    kanaData.katakana.groups.forEach(g => allRows.push(...g.rows));
    
    if (selectedRows.length === allRows.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(allRows);
    }
  };

  const handleStart = (playType) => {
    if (selectedRows.length === 0) {
      alert("Please select at least 1 set of characters.");
      return;
    }
    if (dbLessonIds.length > 0) {
      navigate('/training/setup', { state: { lessonIds: dbLessonIds, type: 'Kana', playType, selectedRows } });
    } else {
      alert("Still loading learning data, please try again in a moment.");
    }
  };

  return (
    <div className="min-h-screen bg-[#1f1f1f] text-white flex flex-col relative pb-32 font-sans">
      <div className="px-4 md:px-8 py-6 md:py-8 space-y-6 flex-1 max-w-6xl w-full">

        {/* Header */}
        <div className="flex items-center gap-3">
          <span className="text-[32px] font-bold">あ</span>
          <h1 className="text-[32px] font-bold tracking-tight">Kana</h1>
        </div>

        {/* Welcome Banner */}
        <div className="bg-[#242424] rounded-lg px-6 py-5 cursor-pointer border border-[#303030]" onClick={() => setWelcomeOpen(!welcomeOpen)}>
          <h2 className="text-[17px] font-semibold text-[#ccc] flex items-center gap-3">
            {welcomeOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
            Welcome to the Kana(hiragana and katakana)!
          </h2>
          {welcomeOpen && (
            <div className="text-[#a0a0a0] text-[15px] leading-relaxed mt-4 pl-8 space-y-2">
              <p>This is the place where you can learn and practice the two core syllabaries of Japanese - Hiragana and Katakana.</p>
              <p>To begin, select at least 1 set of characters, select or change the training mode, then hit Go! below and start training now!</p>
            </div>
          )}
        </div>

        {/* Select All Button */}
        <button
          onClick={selectAllKana}
          className="w-full flex items-center justify-center gap-2 py-4 bg-white text-black text-[15px]"
        >
          <MousePointer2 size={16} className="fill-black" />
          Select All Kana
        </button>

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          
          {/* Hiragana Column */}
          <div className="bg-[#242424] rounded-xl p-6 border border-[#303030]">
            <div className="flex items-center gap-2 mb-6 text-[19px] text-[#ddd]">
              <ChevronUp size={20} />
              <span>{kanaData.hiragana.title}</span>
            </div>
            <div>
              {kanaData.hiragana.groups.map(group => (
                <GroupSection 
                  key={group.id} 
                  group={group} 
                  selectedRows={selectedRows} 
                  toggleRow={toggleRow}
                  selectAllInGroup={selectAllInGroup}
                />
              ))}
            </div>
          </div>

          {/* Katakana Column */}
          <div className="bg-[#242424] rounded-xl p-6 border border-[#303030]">
            <div className="flex items-center gap-2 mb-6 text-[19px] text-[#ddd]">
              <ChevronUp size={20} />
              <span>{kanaData.katakana.title}</span>
            </div>
            <div>
              {kanaData.katakana.groups.map(group => (
                <GroupSection 
                  key={group.id} 
                  group={group} 
                  selectedRows={selectedRows} 
                  toggleRow={toggleRow}
                  selectAllInGroup={selectAllInGroup}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[280px] bg-[#1f1f1f] border-t border-[#333] px-4 py-4 md:p-6 z-40">
        <div className="max-w-6xl mx-auto flex gap-2 md:gap-4">
          <button 
            onClick={() => handleStart('blitz')}
            className="flex-1 md:max-w-[200px] flex items-center justify-center gap-2 py-3 md:py-4 bg-white text-black opacity-80 hover:opacity-100 text-[14px] md:text-[15px]"
          >
            <Zap size={18} className="fill-black" />
            <span className="hidden sm:inline">Blitz</span>
            <span className="sm:hidden">Blitz</span>
          </button>
          <button 
            onClick={() => handleStart('gauntlet')}
            className="flex-1 md:max-w-[200px] flex items-center justify-center gap-2 py-3 md:py-4 bg-white text-black opacity-80 hover:opacity-100 text-[14px] md:text-[15px]"
          >
            <Sword size={18} className="fill-black" />
            <span>Gauntlet</span>
          </button>
          <button 
            onClick={() => handleStart('classic')}
            className="flex-1 flex items-center justify-center gap-2 py-3 md:py-4 bg-white text-black text-[16px] md:text-[18px]"
          >
            <Play size={20} className="fill-black" />
            Classic
          </button>
        </div>
      </div>

    </div>
  );
}
