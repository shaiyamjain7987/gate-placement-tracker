import React, { useState } from 'react';
import { LifeField, FieldCategory } from '../types';
import { X, Plus, Compass } from 'lucide-react';

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddField: (field: Omit<LifeField, 'id' | 'createdAt'>) => void;
}

const COLOR_PALETTE = [
  '#8b5cf6', // violet
  '#0284c7', // sky
  '#ec4899', // pink
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#10b981', // emerald
  '#3b82f6', // blue
  '#84cc16', // lime
];

const EMOJI_OPTIONS = ['🧠', '🌍', '💭', '🗣️', '❤️', '🫁', '♟️', '🌌', '⚡', '📚', '🎯', '💡', '🧘', '⚖️'];

export const AddFieldModal: React.FC<AddFieldModalProps> = ({
  isOpen,
  onClose,
  onAddField,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FieldCategory>('Cognitive & Mind');
  const [icon, setIcon] = useState('🧠');
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [description, setDescription] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [resourcesInput, setResourcesInput] = useState('');
  const [targetWeeklyMinutes, setTargetWeeklyMinutes] = useState(90);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const coreTopics = topicsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const recommendedResources = resourcesInput
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    onAddField({
      name: name.trim(),
      category,
      icon,
      color,
      description: description.trim() || 'Multidisciplinary knowledge & life mastery field',
      coreTopics: coreTopics.length > 0 ? coreTopics : ['Core Fundamentals', 'Practical Application'],
      recommendedResources: recommendedResources.length > 0 ? recommendedResources : undefined,
      targetWeeklyMinutes,
    });

    setName('');
    setDescription('');
    setTopicsInput('');
    setResourcesInput('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Add New Knowledge Field</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 block">
                Field Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Neuroscience, Stoicism, Game Theory"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 block">
                Icon
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={2}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-center text-xl focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Quick Emoji Selector */}
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 block">Quick Icon Choice:</span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_OPTIONS.map((em) => (
                <button
                  type="button"
                  key={em}
                  onClick={() => setIcon(em)}
                  className={`text-base p-1.5 rounded-lg border transition-all cursor-pointer ${
                    icon === em
                      ? 'bg-indigo-100 dark:bg-indigo-950 border-indigo-500 scale-110'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:scale-105'
                  }`}
                >
                  {em}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FieldCategory)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Cognitive & Mind">Cognitive & Mind</option>
                <option value="World & Systems">World & Systems</option>
                <option value="Human Dynamics">Human Dynamics</option>
                <option value="Body & Vitality">Body & Vitality</option>
                <option value="Strategic Thinking">Strategic Thinking</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 block">
                Target Weekly Time
              </label>
              <select
                value={targetWeeklyMinutes}
                onChange={(e) => setTargetWeeklyMinutes(parseInt(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value={45}>45 mins / week</option>
                <option value={60}>1 hour / week</option>
                <option value={90}>1.5 hours / week</option>
                <option value={120}>2 hours / week</option>
                <option value={180}>3 hours / week</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 block">
              Color Accent
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-slate-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 block">
              Core Topics / Concepts (Comma separated)
            </label>
            <input
              type="text"
              value={topicsInput}
              onChange={(e) => setTopicsInput(e.target.value)}
              placeholder="e.g. Dopamine circuits, Synaptic plasticity, Prefrontal cortex"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 block">
              Recommended Books / Podcasts / Resources (Comma separated)
            </label>
            <input
              type="text"
              value={resourcesInput}
              onChange={(e) => setResourcesInput(e.target.value)}
              placeholder="e.g. Huberman Lab Podcast, Behave by Robert Sapolsky"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5 block">
              Why Learn This? / Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Understanding mental models, brain chemistry & real-world human behavior"
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Knowledge Field
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
