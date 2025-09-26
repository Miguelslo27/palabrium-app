import React from 'react';
import IconTrash from '@/components/Editor/Shared/IconTrash';

type Chapter = { title: string; content: string };

type Props = {
  chapters: Chapter[];
  expandedIndex: number | null;
  setExpandedIndex: (i: number | null) => void;
  addChapter: () => void;
  removeChapter: (i: number) => void;
  updateChapter: (i: number, field: string, value: string) => void;
};

function ChapterEditor({ chapter, index, updateChapter, removeChapter, chaptersLength }: { chapter: Chapter; index: number; updateChapter: (i: number, field: string, value: string) => void; removeChapter: (i: number) => void; chaptersLength: number; }) {
  return (
    <section className="p-4">
      <div className="mb-3 flex-1 flex flex-col">
        <label className="block text-sm font-medium text-gray-800 mb-1">Title</label>
        <div className="flex flex-row">
          <input
            type="text"
            placeholder=""
            value={chapter.title}
            onChange={(e) => updateChapter(index, 'title', e.target.value)}
            className="w-full h-10 px-3 mr-3 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => removeChapter(index)}
            disabled={chaptersLength === 1}
            aria-label="Remove chapter"
            title="Remove chapter"
            className="h-10 w-10 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconTrash className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-800 mb-1">Contenido</label>
        <textarea
          placeholder=""
          value={chapter.content}
          onChange={(e) => updateChapter(index, 'content', e.target.value)}
          className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded focus:outline-none focus:border-blue-500 h-48 resize-vertical"
          required
        />
      </div>
    </section>
  );
}

function ChapterCard({ chapter, index, isOpen, onToggle, removeChapter, updateChapter, chaptersLength }: { chapter: Chapter; index: number; isOpen: boolean; onToggle: () => void; removeChapter: (i: number) => void; updateChapter: (i: number, field: string, value: string) => void; chaptersLength: number; }) {
  const displayTitle = chapter.title?.trim() ? chapter.title : `Chapter ${index + 1}`;
  return (
    <div className="bg-gray-50 border border-gray-300 rounded">
      {!isOpen && (
        <div className="p-4 flex items-center justify-between cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
            <span className="text-sm text-gray-900">{displayTitle}</span>
          </div>
          <div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeChapter(index);
              }}
              disabled={chaptersLength === 1}
              aria-label="Remove chapter"
              title="Remove chapter"
              className="h-8 w-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconTrash className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {isOpen && (
        <ChapterEditor chapter={chapter} index={index} updateChapter={updateChapter} removeChapter={removeChapter} chaptersLength={chaptersLength} />
      )}
    </div>
  );
}

export default function Chapters({ chapters, expandedIndex, setExpandedIndex, addChapter, removeChapter, updateChapter }: Props) {
  return (
    <main className="flex-1 p-6 overflow-y-auto">
      <div className="bg-white border border-gray-300 rounded shadow-sm h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-300 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Chapters ({chapters.length})</h2>
        </div>
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {chapters.map((chapter, index) => {
            const isOpen = expandedIndex === index;
            return (
              <ChapterCard
                key={index}
                chapter={chapter}
                index={index}
                isOpen={isOpen}
                onToggle={() => setExpandedIndex(isOpen ? null : index)}
                removeChapter={removeChapter}
                updateChapter={updateChapter}
                chaptersLength={chapters.length}
              />
            );
          })}
        </div>

        <div className="px-6 py-4 border-t border-gray-300 bg-gray-50 flex items-center justify-between">
          <button type="button" onClick={addChapter} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-800 border border-gray-400 rounded shadow-sm">
            <span className="text-xl font-bold">+</span>
            <span>Agregar capítulo</span>
          </button>
          <div />
        </div>
      </div>
    </main>
  );
}
