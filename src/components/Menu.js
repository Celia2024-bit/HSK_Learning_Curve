import React from 'react';
import { BookOpen, Book, Award } from 'lucide-react';

export default function Menu({ level, setLevel, startMode }) {
  const levels = [1, 2, 3];
  
  return (
    <div className="max-w-4xl mx-auto p-8 pt-20">
      <h1 className="text-4xl font-black text-center text-indigo-900 mb-12">HSK Study Companion</h1>
      
      {/* 级别选择 */}
      <div className="flex justify-center gap-4 mb-12">
        {levels.map(l => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={`px-8 py-3 rounded-2xl font-bold transition-all ${
              level === l ? 'bg-indigo-600 text-white scale-110 shadow-lg' : 'bg-white text-gray-400 hover:bg-gray-100'
            }`}
          >
            HSK {l}
          </button>
        ))}
      </div>

      {/* 模式选择 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModeCard 
          icon={<BookOpen className="text-blue-500" size={40}/>} 
          title="Flashcards" 
          desc="Learn words one by one"
          onClick={() => startMode('flashcard')}
        />
        <ModeCard 
          icon={<Book className="text-green-500" size={40}/>} 
          title="Reading" 
          desc="Practice with sentences"
          onClick={() => startMode('reading')}
        />
        <ModeCard 
          icon={<Award className="text-purple-500" size={40}/>} 
          title="Quiz" 
          desc="Test your knowledge"
          onClick={() => startMode('quiz')}
        />
      </div>
    </div>
  );
}

function ModeCard({ icon, title, desc, onClick }) {
  return (
    <button onClick={onClick} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all text-left group border border-transparent hover:border-indigo-100">
      <div className="mb-4 transform group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
      <p className="text-gray-500">{desc}</p>
    </button>
  );
}