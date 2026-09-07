import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  Filter,
  Layers,
  X,
  FileJson
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FAQItem } from '../types';

export const KnowledgeBasePage: React.FC = () => {
  const { faqs, addFaq, updateFaq, deleteFaq, importFaqs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for Add/Edit
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formCategory, setFormCategory] = useState('Admissions & Enrollment');
  const [formKeywords, setFormKeywords] = useState('');

  const categories = [
    'All',
    'Admissions & Enrollment',
    'Class Schedules & Timetables',
    'Fees, Payments & Installments',
    'LMS, Portal & Tech Support',
    'Zoom Links & Class Recordings',
    'Courses & Syllabus',
    'Certificates & Exams',
    'Attendance, Batches & Leave',
    'Assignments & Homework'
  ];

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.keywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const openAddModal = () => {
    setFormQuestion('');
    setFormAnswer('');
    setFormCategory('Admissions & Enrollment');
    setFormKeywords('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (faq: FAQItem) => {
    setEditingFaq(faq);
    setFormQuestion(faq.question);
    setFormAnswer(faq.answer);
    setFormCategory(faq.category);
    setFormKeywords(faq.keywords.join(', '));
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestion.trim() || !formAnswer.trim()) return;
    addFaq({
      category: formCategory,
      question: formQuestion,
      answer: formAnswer,
      keywords: formKeywords.split(',').map((k) => k.trim()).filter(Boolean),
      isGrounded: true
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaq || !formQuestion.trim() || !formAnswer.trim()) return;
    updateFaq({
      ...editingFaq,
      category: formCategory,
      question: formQuestion,
      answer: formAnswer,
      keywords: formKeywords.split(',').map((k) => k.trim()).filter(Boolean)
    });
    setEditingFaq(null);
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(faqs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `approved_faqs_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          importFaqs(imported);
          alert(`Successfully imported ${imported.length} approved FAQs!`);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            Approved Knowledge Base Registry
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            FAQ Knowledge Base (<span className="text-emerald-600 font-mono">{faqs.length} Entries</span>)
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            All AI Assistant responses are strictly grounded in these verified FAQ entries. Add, edit, or search approved answers.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
            title="Export FAQs to JSON"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Import JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <Plus className="w-4 h-4 text-slate-950" /> Add Approved FAQ
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by question, answer, category, or keyword..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div className="text-xs text-slate-500 font-mono shrink-0">
            Showing <strong className="text-slate-900">{filteredFaqs.length}</strong> of {faqs.length} FAQs
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs transition-all font-medium shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-emerald-400 font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs Table List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                <th className="py-3 px-4 font-mono w-28">ID</th>
                <th className="py-3 px-4 w-44">Category</th>
                <th className="py-3 px-4">Approved Question & Grounded Answer</th>
                <th className="py-3 px-4 w-24 text-center">Usage</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFaqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 align-top">
                    {faq.id}
                  </td>
                  <td className="py-3.5 px-4 align-top">
                    <span className="inline-block bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-semibold border border-slate-200">
                      {faq.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 align-top space-y-1">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {faq.question}
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {faq.answer}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 pt-0.5">
                      <span className="font-semibold text-slate-500">Keywords:</span> {faq.keywords.join(', ')}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center align-top">
                    <span className="bg-emerald-50 text-emerald-700 font-mono font-semibold px-2 py-0.5 rounded text-[11px]">
                      {faq.usageCount}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right align-top space-x-1">
                    <button
                      onClick={() => openEditModal(faq)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit FAQ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete FAQ ${faq.id}?`)) deleteFaq(faq.id);
                      }}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete FAQ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit FAQ Modal */}
      {(isAddModalOpen || editingFaq) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                {editingFaq ? `Edit Approved FAQ (${editingFaq.id})` : 'Add New Approved FAQ'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingFaq(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingFaq ? handleSaveEdit : handleSaveAdd} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                >
                  {categories.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Student Question</label>
                <input
                  type="text"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. How can I get a fee refund?"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Approved Grounded Answer</label>
                <textarea
                  rows={4}
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Provide the exact approved response..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="refund, fee return, money back, cancellation"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingFaq(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-600 transition-all shadow-md"
                >
                  Save Approved FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
