import React, { useState, useEffect } from 'react';
import { ChevronLeft, Trash2, Save, Pencil } from 'lucide-react';

export default function CustomWordEditor({ words, onAddWord, onUpdateWord, onDeleteWord,  onBack }) {
  // 基础表单状态：新增/编辑共用
  const [formData, setFormData] = useState({
    id: null,          // 编辑时存储卡片ID，新增时为null
    char: '',          // 汉字
    pinyin: '',        // 拼音
    definition: '',    // 释义（对应后端meaning）
    explanation: ''    // 额外解释（新增字段）
  });
  // 编辑模式标识：区分新增/编辑
  const [isEditing, setIsEditing] = useState(false);

  // 输入框变更处理
  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // 重置表单（新增/取消编辑时用）
  const resetForm = () => {
    setFormData({
      id: null,
      char: '',
      pinyin: '',
      definition: '',
      explanation: ''
    });
    setIsEditing(false);
  };

  // 提交处理（新增/编辑共用）
 const handleSubmit = () => {
    if (!formData.char || !formData.definition) {
      alert("请填写汉字和释义！");
      return;
    }

    if (isEditing) {
      // 调用父组件传递的 onUpdateWord
      onUpdateWord({
        id: formData.id,
        char: formData.char,
        pinyin: formData.pinyin,
        meaning: formData.definition,
        explanation: formData.explanation
      });
    } else {
      onAddWord({
        char: formData.char,
        pinyin: formData.pinyin,
        definition: formData.definition,
        explanation: formData.explanation
      });
    }
    resetForm();
  };
  // 进入编辑模式：加载单词数据到表单
  const handleEdit = (word) => {
    setFormData({
      id: word.id,
      char: word.char,
      pinyin: word.pinyin || '',
      definition: word.definition || '',
      explanation: word.explanation || ''
    });
    setIsEditing(true);
  };

  // 删除单词（原有逻辑保留，补充调用父组件删除函数）
    const handleDelete = (id) => {
        if (window.confirm("确定要删除这个单词吗？")) {
          onDeleteWord(id); // 调用父组件传递的删除函数
        }
      };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-gray-100 to-indigo-50 flex flex-col items-center justify-center p-8 text-gray-900">
      <div className="w-full max-w-md">
        {/* 1. 新增：返回菜单按钮 */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 mb-8 hover:text-indigo-600 transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="text-sm font-bold">Back to Menu</span>
        </button>

        {/* 标题：区分新增/编辑模式 */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-black text-slate-800">
            {isEditing ? 'Edit Custom Word' : 'Add Custom Word'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isEditing ? 'Modify your word details' : 'Add your own words to study'}
          </p>
        </div>

        {/* 单词表单：新增explanation输入框 */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-indigo-100/50 mb-8 border border-white">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Chinese Character</label>
              <input
                type="text"
                value={formData.char}
                onChange={(e) => handleInputChange('char', e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-slate-800 font-medium"
                placeholder="e.g. 你好"
                disabled={isEditing} // 编辑时汉字不可修改（可选，根据需求调整）
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Pinyin (Optional)</label>
              <input
                type="text"
                value={formData.pinyin}
                onChange={(e) => handleInputChange('pinyin', e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-slate-800 font-medium"
                placeholder="e.g. nǐ hǎo"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Definition</label>
              <input
                type="text"
                value={formData.definition}
                onChange={(e) => handleInputChange('definition', e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-slate-800 font-medium"
                placeholder="e.g. Hello"
              />
            </div>
            {/* 2. 新增：Explanation 输入框 */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Explanation (Optional)</label>
              <textarea // 用文本域适配长文本输入
                value={formData.explanation}
                onChange={(e) => handleInputChange('explanation', e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-slate-800 font-medium min-h-[80px]"
                placeholder="e.g. 日常打招呼，适用于朋友/熟人之间"
              />
            </div>
            <div className="flex gap-3">
              {/* 提交按钮：区分新增/编辑文案 */}
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <Save size={16} />
                {isEditing ? 'Update Word' : 'Add Word'}
              </button>
              {/* 取消编辑按钮（仅编辑模式显示） */}
              {isEditing && (
                <button
                  onClick={resetForm}
                  className="py-3 bg-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 已添加的单词列表：新增编辑按钮，保留删除功能 */}
        {words.length > 0 && (
          <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-indigo-100/50 border border-white">
            <h3 className="text-sm font-black text-slate-800 mb-4">Your Custom Words ({words.length})</h3>
            <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
              {words.map((word) => (
                <div key={word.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{word.char}</p>
                    {word.pinyin && <p className="text-xs text-slate-500">{word.pinyin}</p>}
                    <p className="text-xs text-slate-600 italic">{word.definition}</p>
                    {/* 显示额外解释 */}
                    {word.explanation && (
                      <p className="text-xs text-slate-500 mt-1">
                        <span className="font-medium">Note:</span> {word.explanation}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-3">
                    {/* 3. 新增：编辑按钮 */}
                    <button 
                      onClick={() => handleEdit(word)}
                      className="text-indigo-400 hover:text-indigo-600 transition-colors"
                      title="Edit Word"
                    >
                      <Pencil size={16} />
                    </button>
                    {/* 原有删除按钮保留 */}
                    <button 
                      onClick={() => handleDelete(word.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Delete Word"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}