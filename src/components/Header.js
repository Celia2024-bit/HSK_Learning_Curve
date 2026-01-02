import React from 'react';
import { LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';

export default function Header({ currentUser, onLogout }) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/70 backdrop-blur-md border-b border-slate-200/50 z-50">
      <div className="max-w-md mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* 左侧：用户信息区 */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <UserIcon size={20} />
            </div>
            {/* 一个小绿点，代表在线状态/已登录 */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                Active Student
              </span>
              <ShieldCheck size={10} className="text-indigo-400" />
            </div>
            <span className="text-sm font-black text-slate-800 uppercase tracking-tight mt-0.5">
              {currentUser}
            </span>
          </div>
        </div>

        {/* 右侧：退出操作区 */}
        <button 
          onClick={onLogout}
          className="group flex items-center gap-2 pl-4 pr-2 py-2 rounded-xl hover:bg-red-50 transition-all duration-300 active:scale-95"
        >
          <span className="text-[10px] font-black text-slate-400 group-hover:text-red-500 uppercase tracking-[0.15em] transition-colors">
            Logout
          </span>
          <div className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 group-hover:text-red-500 group-hover:bg-white shadow-none group-hover:shadow-sm transition-all">
            <LogOut size={16} />
          </div>
        </button>

      </div>
    </header>
  );
}