import React, { useState } from 'react';
import { User, Lock, LogIn } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-gray-100 to-indigo-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-100 border border-white text-center">
        <h1 className="text-3xl font-black italic tracking-tighter text-slate-800 mb-2">HSK.STUDY</h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10">Sign in to sync progress</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-4 text-slate-300" size={20} />
            <input 
              type="text" placeholder="Username" 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-4 text-slate-300" size={20} />
            <input 
              type="password" placeholder="Password" 
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
            <LogIn size={20} /> START LEARNING
          </button>
        </form>
      </div>
    </div>
  );
}