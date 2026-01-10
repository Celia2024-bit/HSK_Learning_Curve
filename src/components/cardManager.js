
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  fetchCustomCards,
  addCustomCard,
  updateCustomCard,
  deleteCustomCard
} from '../utils/fetchUtils';

// 简易 Modal 组件（覆盖全屏）
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close modal"
      />
      {/* 内容容器 */}
      <div className="relative w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl border border-slate-200">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function CardManager({ username, onClose }) {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  // Modal 状态与表单
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    char: '',
    pinyin: '',
    meaning: '',
    explanation: ''
  });

  const resetForm = () =>
    setForm({ char: '', pinyin: '', meaning: '', explanation: '' });

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await fetchCustomCards(username);
      setCards(list);
    } catch (e) {
      console.error(e);
      setError('Failed to load cards. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) load();
  }, [username]);

  const filtered = useMemo(() => {
    if (!search.trim()) return cards;
    const q = search.trim().toLowerCase();
    return cards.filter(c =>
      (c.char || '').toLowerCase().includes(q) ||
      (c.pinyin || '').toLowerCase().includes(q) ||
      (c.meaning || '').toLowerCase().includes(q) ||
      (c.explanation || '').toLowerCase().includes(q)
    );
  }, [cards, search]);

  // 打开“新增”Modal
  const openAddModal = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
    setError('');
  };

  // 打开“编辑”Modal
  const openEditModal = (card) => {
    setEditingId(card.id);
    setForm({
      char: card.char || '',
      pinyin: card.pinyin || '',
      meaning: card.meaning || '',
      explanation: card.explanation || ''
    });
    setModalOpen(true);
    setError('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const onDelete = async (cardId) => {
    if (!window.confirm('Delete this card?')) return;
    try {
      await deleteCustomCard(cardId);
      await load();
    } catch (e) {
      console.error(e);
      setError('Failed to delete. Please try again.');
    }
  };

  const onSubmit = async () => {
    if (!form.char?.trim()) {
      setError('Please fill in Hanzi (char).');
      return;
    }
    setError('');
    try {
      if (editingId) {
        // 更新
        await updateCustomCard(editingId, {
          char: form.char.trim(),
          pinyin: form.pinyin.trim(),
          meaning: form.meaning.trim(),
          explanation: form.explanation.trim()
        });
      } else {
        // 新增
        await addCustomCard(username, {
          char: form.char.trim(),
          pinyin: form.pinyin.trim(),
          meaning: form.meaning.trim(),
          explanation: form.explanation.trim()
        });
      }
      closeModal();
      await load();
    } catch (e) {
      console.error(e);
      setError('Failed to save. Please try again.');
    }
  };

  // 键盘增强：Ctrl/Cmd + Enter 提交；Esc 关闭
  const onKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      onSubmit();
    }
  }, [form, editingId]);

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">My Custom Cards (Level 0)</h2>
        {onClose && (
          <button
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Back
          </button>
        )}
      </div>

      {/* Search + Add */}
      <div className="flex items-center gap-3 mb-3">
        <input
          className="border rounded px-3 py-2 flex-1"
          placeholder="Search: Hanzi / Pinyin / Meaning / Notes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          onClick={openAddModal}
        >
          Add Card
        </button>
      </div>

      {/* List */}
      <div className="border rounded p-3 bg-white">
        <h3 className="font-medium mb-2">Cards ({cards.length})</h3>
        {loading ? (
          <div>Loading…</div>
        ) : (
          <ul className="space-y-2">
            {filtered.map(card => (
              <li key={card.id} className="border rounded p-2">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <div><span className="text-gray-500">Hanzi:</span> {card.char}</div>
                  <div><span className="text-gray-500">Pinyin:</span> {card.pinyin}</div>
                  <div><span className="text-gray-500">Meaning:</span> <span className="truncate inline-block max-w-[12rem]">{card.meaning}</span></div>
                  <div className="truncate"><span className="text-gray-500">Notes:</span> {card.explanation}</div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => openEditModal(card)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      onClick={() => onDelete(card.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
            {filtered.length === 0 && <li className="text-gray-500">No cards yet.</li>}
          </ul>
        )}
      </div>

      {/* Modal：大表单编辑区域 */}
      {isModalOpen && (
        <Modal
          title={editingId ? 'Edit Card' : 'Add Card'}
          onClose={closeModal}
        >
          {error && (
            <div className="mb-3 text-red-600">{error}</div>
          )}

          <div className="space-y-4" onKeyDown={onKeyDown}>
            {/* Hanzi & Pinyin：单行输入 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Hanzi (required)</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="汉字..."
                  value={form.char}
                  onChange={(e) => setForm({ ...form, char: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Pinyin</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  placeholder="pinyin..."
                  value={form.pinyin}
                  onChange={(e) => setForm({ ...form, pinyin: e.target.value })}
                />
              </div>
            </div>

            {/* Meaning：大文本输入 */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Meaning</label>
              <textarea
                className="border rounded px-3 py-2 w-full min-h-[140px] resize-y"
                placeholder="Add detailed meaning, definitions, translations…"
                value={form.meaning}
                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
              />
            </div>

            {/* Notes：大文本输入 */}
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Notes</label>
              <textarea
                className="border rounded px-3 py-2 w-full min-h-[140px] resize-y"
                placeholder="Examples, memory aids, usage notes…"
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
              />
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t">
              <button
                className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                onClick={onSubmit}
              >
                {editingId ? 'Save Changes' : 'Create'}
              </button>
            </div>

            {/* 小提示 */}
            <p className="text-xs text-slate-400 mt-2">
              Tip: Press <kbd className="px-1 py-0.5 bg-slate-100 border rounded">Ctrl/⌘ + Enter</kbd> to submit, <kbd className="px-1 py-0.5 bg-slate-100 border rounded">Esc</kbd> to close.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
