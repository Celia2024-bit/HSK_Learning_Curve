import React, { useState, useEffect } from 'react';
// import { BookOpen, RefreshCw, Award, ChevronRight, Loader } from 'lucide-react';
import { BookOpen, RefreshCw, Award, ChevronRight, Loader, Volume2 } from 'lucide-react';

export default function HSKStudyApp() {
  const [level, setLevel] = useState(1);
  const [mode, setMode] = useState('menu');
  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [hskData, setHskData] = useState({ 1: [], 2: [], 3: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load HSK data from JSON files
  useEffect(() => {
    const loadHSKData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all three HSK level files
        const [hsk1Response, hsk2Response, hsk3Response, sentencesResponse] = await Promise.all([
          fetch('/hsk1.json'),
          fetch('/hsk2.json'),
          fetch('/hsk3.json'),
          fetch('/sentences.json')
        ]);

        if (!hsk1Response.ok || !hsk2Response.ok || !hsk3Response.ok) {
          throw new Error('Failed to load HSK data files');
        }

        const hsk1Data = await hsk1Response.json();
        const hsk2Data = await hsk2Response.json();
        const hsk3Data = await hsk3Response.json();
        
        let sentencesData = { 1: [], 2: [], 3: [] };
        if (sentencesResponse.ok) {
          sentencesData = await sentencesResponse.json();
        }

        setHskData({
          1: hsk1Data,
          2: hsk2Data,
          3: hsk3Data
        });
        
        setSentences(sentencesData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        console.error('Error loading HSK data:', err);
      }
    };

    loadHSKData();
  }, []);

  useEffect(() => {
    if (hskData[level].length > 0) {
      shuffleWords();
    }
  }, [level, hskData]);

  const shuffleWords = () => {
    const words = [...hskData[level]];
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    setShuffledWords(words);
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  const startFlashcards = () => {
    shuffleWords();
    setMode('flashcard');
  };

  const startQuiz = () => {
    shuffleWords();
    setQuizAnswers([]);
    setScore(0);
    setMode('quiz');
  };

  const startReading = () => {
    shuffleWords();
    setMode('reading');
  };

  const generateQuizOptions = (correctWord) => {
    const allWords = hskData[level];
    const options = [correctWord];
    
    while (options.length < 4) {
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
      if (!options.find(w => w.meaning === randomWord.meaning)) {
        options.push(randomWord);
      }
    }
    
    return options.sort(() => Math.random() - 0.5);
  };

  const handleQuizAnswer = (selected) => {
    const correct = selected.meaning === shuffledWords[currentIndex].meaning;
    setQuizAnswers([...quizAnswers, {
      word: shuffledWords[currentIndex],
      selected: selected,
      correct: correct
    }]);
    
    if (correct) setScore(score + 1);

    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setMode('results');
    }
  };

  const nextCard = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setMode('menu');
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const speakChinese = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.7;
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Sorry, your browser does not support text-to-speech.');
  }
};

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">Loading HSK Vocabulary...</h2>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-600">
            Please make sure the HSK JSON files (hsk1.json, hsk2.json, hsk3.json) are in the public folder.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-indigo-900 mb-4">HSK Study App</h1>
            <p className="text-xl text-gray-700">Master Chinese vocabulary for HSK 1-3</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select HSK Level</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[1, 2, 3].map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`py-6 px-4 rounded-xl font-bold text-xl transition-all ${
                    level === l
                      ? 'bg-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  HSK {l}
                  <div className="text-sm font-normal mt-2">
                    {hskData[l].length} words
                  </div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6">
              <button
                onClick={startFlashcards}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6 px-8 rounded-xl font-bold text-xl hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-3"
              >
                <BookOpen size={28} />
                Flashcard Mode
              </button>
              <button
                onClick={startQuiz}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-6 px-8 rounded-xl font-bold text-xl hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-3"
              >
                <Award size={28} />
                Quiz Mode
              </button>
              <button
                onClick={startReading}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-6 px-8 rounded-xl font-bold text-xl hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center gap-3"
              >
                <BookOpen size={28} />
                Reading Practice
              </button>
            </div>
          </div>

          <div className="text-center text-gray-600">
            <p>Choose a level and mode to start learning!</p>
          </div>
        </div>
      </div>
    );
  }

  // if (mode === 'flashcard') {
  //   const currentWord = shuffledWords[currentIndex];
    
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
  //       <div className="max-w-2xl mx-auto">
  //         <div className="flex justify-between items-center mb-8">
  //           <button
  //             onClick={() => setMode('menu')}
  //             className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
  //           >
  //             ← Back
  //           </button>
  //           <div className="text-xl font-bold text-purple-900">
  //             HSK {level} Flashcards
  //           </div>
  //           <button
  //             onClick={shuffleWords}
  //             className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
  //           >
  //             <RefreshCw size={18} /> Shuffle
  //           </button>
  //         </div>

  //         <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8 min-h-96 flex flex-col justify-center">
  //           <div className="text-center mb-8">
  //             <div className="text-8xl font-bold text-indigo-900 mb-6">
  //               {currentWord.char}
  //             </div>
  //             <div className="text-3xl text-gray-500 mb-8">
  //               {currentWord.pinyin}
  //             </div>
              
  //             {showAnswer ? (
  //               <div className="text-4xl font-semibold text-green-600 animate-fade-in">
  //                 {currentWord.meaning}
  //               </div>
  //             ) : (
  //               <button
  //                 onClick={() => setShowAnswer(true)}
  //                 className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-indigo-700 transition-all"
  //               >
  //                 Show Meaning
  //               </button>
  //             )}
  //           </div>
  //         </div>

  //         <div className="flex justify-between items-center">
  //           <button
  //             onClick={prevCard}
  //             disabled={currentIndex === 0}
  //             className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
  //               currentIndex === 0
  //                 ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
  //                 : 'bg-white text-gray-700 hover:bg-gray-100'
  //             }`}
  //           >
  //             ← Previous
  //           </button>
            
  //           <div className="text-lg font-semibold text-purple-900">
  //             {currentIndex + 1} / {shuffledWords.length}
  //           </div>
            
  //           <button
  //             onClick={nextCard}
  //             className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all flex items-center gap-2"
  //           >
  //             {currentIndex === shuffledWords.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={20} />
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }
  if (mode === 'flashcard') {
    const currentWord = shuffledWords[currentIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setMode('menu')}
              className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              ← Back
            </button>
            <div className="text-xl font-bold text-purple-900">
              HSK {level} Flashcards
            </div>
            <button
              onClick={shuffleWords}
              className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <RefreshCw size={18} /> Shuffle
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8 min-h-96 flex flex-col justify-center relative">
            <button
              onClick={() => speakChinese(currentWord.char)}
              className="absolute top-6 right-6 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-4 rounded-full transition-all hover:scale-110 shadow-lg"
              title="Pronounce character"
            >
              <Volume2 size={28} />
            </button>
            
            <div className="text-center mb-8">
              <div className="text-8xl font-bold text-indigo-900 mb-6">
                {currentWord.char}
              </div>
              <div className="text-3xl text-gray-500 mb-8">
                {currentWord.pinyin}
              </div>
              
              {showAnswer ? (
                <div className="text-4xl font-semibold text-green-600 animate-fade-in">
                  {currentWord.meaning}
                </div>
              ) : (
                <button
                  onClick={() => setShowAnswer(true)}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-indigo-700 transition-all"
                >
                  Show Meaning
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={prevCard}
              disabled={currentIndex === 0}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                currentIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ← Previous
            </button>
            
            <div className="text-lg font-semibold text-purple-900">
              {currentIndex + 1} / {shuffledWords.length}
            </div>
            
            <button
              onClick={nextCard}
              className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-all flex items-center gap-2"
            >
              {currentIndex === shuffledWords.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quiz') {
    const currentWord = shuffledWords[currentIndex];
    const options = generateQuizOptions(currentWord);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setMode('menu')}
              className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              ← Exit Quiz
            </button>
            <div className="text-xl font-bold text-green-900">
              HSK {level} Quiz
            </div>
            <div className="text-lg font-semibold text-green-900">
              Score: {score}/{currentIndex}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
            <div className="text-center mb-12">
              <div className="text-7xl font-bold text-green-900 mb-4">
                {currentWord.char}
              </div>
              <div className="text-3xl text-gray-500 font-semibold mb-8">
                {currentWord.pinyin}
              </div>
              <div className="text-xl text-gray-700 font-semibold mb-8">
                Select the correct meaning:
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuizAnswer(option)}
                  className="bg-gradient-to-r from-green-400 to-teal-400 text-white py-6 px-6 rounded-xl font-bold text-xl hover:from-green-500 hover:to-teal-500 transition-all hover:scale-105 shadow-lg"
                >
                  {option.meaning}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-lg font-semibold text-green-900">
            Question {currentIndex + 1} / {shuffledWords.length}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'results') {
    const percentage = Math.round((score / shuffledWords.length) * 100);
    const incorrectAnswers = quizAnswers.filter(a => !a.correct);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
            <div className="text-center mb-12">
              <div className="text-6xl mb-6">
                {percentage >= 80 ? '🎉' : percentage >= 60 ? '👍' : '💪'}
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
              <div className="text-6xl font-bold text-indigo-600 mb-4">
                {score} / {shuffledWords.length}
              </div>
              <div className="text-2xl text-gray-600">
                {percentage}% Correct
              </div>
            </div>

            {incorrectAnswers.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Review Incorrect Answers:</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {incorrectAnswers.map((answer, idx) => (
                    <div key={idx} className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-4xl font-bold text-gray-800 mb-2">
                            {answer.word.char} <span className="text-xl text-gray-500">({answer.word.pinyin})</span>
                          </div>
                          <div className="text-lg text-green-600 font-semibold">
                            ✓ Correct: {answer.word.meaning}
                          </div>
                          <div className="text-lg text-red-600">
                            ✗ Your answer: {answer.selected.meaning}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={startQuiz}
                className="bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 px-8 rounded-xl font-bold text-xl hover:shadow-xl transition-all hover:scale-105"
              >
                Try Again
              </button>
              <button
                onClick={() => setMode('menu')}
                className="bg-gray-200 text-gray-700 py-4 px-8 rounded-xl font-bold text-xl hover:bg-gray-300 transition-all"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'reading') {
    const levelSentences = sentences[level] || [];
    const currentSentence = levelSentences[currentIndex];
    
    if (!currentSentence) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">No Sentences Available</h2>
              <p className="text-gray-600 mb-8">
                Reading practice sentences are not available for this level yet.
              </p>
              <p className="text-sm text-gray-500 mb-8">
                Create a <code className="bg-gray-100 px-2 py-1 rounded">sentences.json</code> file in the public folder with sentence data.
              </p>
              <button
                onClick={() => setMode('menu')}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-xl hover:bg-indigo-700 transition-all"
              >
                Back to Menu
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => setMode('menu')}
              className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all"
            >
              ← Back
            </button>
            <div className="text-xl font-bold text-indigo-900">
              HSK {level} Reading Practice
            </div>
            <button
              onClick={() => {
                const currentLevelSentences = [...(sentences[level] || [])];
                for (let i = currentLevelSentences.length - 1; i > 0; i--) {
                  const j = Math.floor(Math.random() * (i + 1));
                  [currentLevelSentences[i], currentLevelSentences[j]] = [currentLevelSentences[j], currentLevelSentences[i]];
                }
                setSentences({ ...sentences, [level]: currentLevelSentences });
                setCurrentIndex(0);
                setShowAnswer(false);
              }}
              className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <RefreshCw size={18} /> Shuffle
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8 min-h-96 relative">
            {/* 新增：语音朗读按钮 */}
            <button
              onClick={() => speakChinese(currentSentence.chinese)}
              className="absolute top-6 right-6 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 p-4 rounded-full transition-all hover:scale-110 shadow-lg"
              title="Listen to sentence"
            >
              <Volume2 size={28} />
            </button>
            
            <div className="mb-8">
              <div className="text-5xl font-bold text-indigo-900 mb-6 leading-relaxed text-center">
                {currentSentence.chinese}
              </div>
              
              {showAnswer ? (
                <div className="mt-8 p-8 bg-green-50 rounded-xl animate-fade-in">
                  <div className="text-3xl text-gray-800 font-semibold text-center leading-relaxed">
                    {currentSentence.english}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="bg-indigo-600 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg"
                  >
                    Show Translation
                  </button>
                </div>
              )}
            </div>
          </div>


          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                if (currentIndex > 0) {
                  setCurrentIndex(currentIndex - 1);
                  setShowAnswer(false);
                }
              }}
              disabled={currentIndex === 0}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                currentIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              ← Previous
            </button>
            
            <div className="text-lg font-semibold text-indigo-900">
              {currentIndex + 1} / {levelSentences.length}
            </div>
            
            <button
              onClick={() => {
                if (currentIndex < levelSentences.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                  setShowAnswer(false);
                } else {
                  setMode('menu');
                }
              }}
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              {currentIndex === levelSentences.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }
}