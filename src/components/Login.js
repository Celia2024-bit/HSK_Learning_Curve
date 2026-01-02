import React, { useState } from 'react';
import { User, Lock, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return alert("Please fill in all fields");
    
    setLoading(true);
    const endpoint = isRegistering ? '/register' : '/login';
    
    try {
      const res = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok) {
        if (isRegistering) {
          alert("Registration successful! Now you can login.");
          setIsRegistering(false); // 注册成功后跳回登录页
          setPassword(''); // 清空密码框
        } else {
          // 登录成功，调用 App.js 传进来的登录处理函数
          onLogin(username, password);
        }
      } else {
        alert(data.message || "Operation failed");
      }
    } catch (error) {
      alert("Server connection failed. Is app.py running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 p-6">
      <div className="w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-100 border border-white">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-lg shadow-indigo-200 mb-6">
            {isRegistering ? <UserPlus size={32} /> : <LogIn size={32} />}
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            {isRegistering ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-2">
            {isRegistering ? 'Join the HSK Study community' : 'Continue your Chinese journey'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
              <User size={20} />
            </div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-slate-50 border-transparent border-2 focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
              <Lock size={20} />
            </div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-slate-50 border-transparent border-2 focus:border-indigo-100 focus:bg-white rounded-2xl outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isRegistering ? 'SIGN UP NOW' : 'SIGN IN'}
            <ArrowRight size={20} />
          </button>
        </form>

        {/* Toggle Switch */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors"
          >
            {isRegistering 
              ? "Already have an account? Sign In" 
              : "Don't have an account? Create one"}
          </button>
        </div>
        
      </div>
    </div>
  );
}