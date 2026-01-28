import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { CoverLetterTemplate } from './templates/CoverLetterTemplate';
import type { ResumeData } from '../types';

interface Experience {
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    description?: string;
}

interface SkillGroup {
    category: string;
    items: string[];
}

interface TailoredData {
    summary?: string;
    skills?: string[];
    skillGroups?: SkillGroup[];
    experience?: Experience[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onApply: () => void;
    original: TailoredData;
    tailored: TailoredData;
    coverLetter?: string | null;
    fullResume: ResumeData;
}

export const TailorPreviewModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onApply,
    original,
    tailored,
    coverLetter,
    fullResume
}) => {
    const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter'>('resume');
    const [editedCoverLetter, setEditedCoverLetter] = useState(coverLetter || '');
    const coverLetterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setEditedCoverLetter(coverLetter || '');
    }, [coverLetter]);

    const handlePrintCoverLetter = useReactToPrint({
        contentRef: coverLetterRef,
        documentTitle: `${fullResume.fullName || 'Candidate'}_Cover_Letter`,
    });

    if (!isOpen) return null;

    const copyToClipboard = () => {
        if (editedCoverLetter) {
            navigator.clipboard.writeText(editedCoverLetter);
            alert('Cover letter copied to clipboard!');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">✨ AI-Tailored Preview</h2>
                            <p className="text-purple-200 text-sm">Review the suggested changes and cover letter</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Tabs */}
                    {coverLetter && (
                        <div className="flex px-6 pt-2 gap-6">
                            <button
                                className={`pb-3 font-semibold text-sm transition focus:outline-none ${activeTab === 'resume' ? 'border-b-4 border-white text-white' : 'border-transparent text-purple-200 hover:text-white'}`}
                                onClick={() => setActiveTab('resume')}
                            >
                                Resume Changes
                            </button>
                            <button
                                className={`pb-3 font-semibold text-sm transition focus:outline-none ${activeTab === 'coverLetter' ? 'border-b-4 border-white text-white' : 'border-transparent text-purple-200 hover:text-white'}`}
                                onClick={() => setActiveTab('coverLetter')}
                            >
                                Generated Cover Letter
                            </button>
                        </div>
                    )}
                    {!coverLetter && <div className="h-4"></div>}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
                    {activeTab === 'resume' ? (
                        <>
                            {/* Summary Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm">📝</span>
                                    Professional Summary
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Original</span>
                                        <p className="mt-2 text-gray-700 text-sm leading-relaxed">{original.summary || 'No summary'}</p>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                                        <span className="text-xs font-medium text-green-600 uppercase tracking-wide flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            AI Tailored
                                        </span>
                                        <p className="mt-2 text-gray-700 text-sm leading-relaxed">{tailored.summary || 'No changes'}</p>
                                    </div>
                                </div>
                            </section>

                            {/* Skills Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">🎯</span>
                                    Skills
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Original</span>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {(() => {
                                                const flatSkills = original.skills || [];
                                                const groupedSkills = original.skillGroups?.flatMap(g => g.items) || [];
                                                const allSkills = flatSkills.length > 0 ? flatSkills : groupedSkills;

                                                if (allSkills.length > 0) {
                                                    return allSkills.map((skill, i) => (
                                                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">{skill}</span>
                                                    ));
                                                }
                                                return <span className="text-gray-400 text-sm">No skills listed</span>;
                                            })()}
                                        </div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 shadow-sm">
                                        <span className="text-xs font-medium text-green-600 uppercase tracking-wide flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            AI Suggested
                                        </span>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {(tailored.skills || []).map((skill, i) => (
                                                <span key={i} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-medium shadow-sm">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Experience Section */}
                            {tailored.experience && tailored.experience.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">💼</span>
                                        Experience (Rewritten)
                                    </h3>
                                    <div className="space-y-4">
                                        {tailored.experience.map((exp, i) => (
                                            <div key={i} className="bg-green-50 p-5 rounded-lg border border-green-200 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-gray-800 text-lg">{exp.title}</h4>
                                                    <span className="text-xs text-green-700 font-bold bg-green-200 px-2 py-1 rounded-full">AI Enhanced</span>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3 font-medium">{exp.company} • {exp.startDate} - {exp.endDate || 'Present'}</p>
                                                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{exp.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </>
                    ) : (
                        /* Cover Letter Tab */
                        <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6 pb-4 border-b">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-2xl">Cover Letter</h3>
                                    <p className="text-sm text-gray-500 mt-1">Editable Preview</p>
                                </div>
                                <button
                                    onClick={() => handlePrintCoverLetter()}
                                    className="flex items-center gap-2 text-sm bg-blue-600 text-white border border-blue-700 px-4 py-2 rounded-lg hover:bg-blue-700 hover:shadow transition font-medium"
                                >
                                    <span>📥</span> Download PDF
                                </button>
                            </div>
                            <div className="flex-1 overflow-hidden pr-2">
                                <textarea
                                    className="w-full h-full min-h-[500px] p-6 border border-gray-200 rounded-lg font-serif text-lg leading-relaxed focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition bg-white shadow-inner text-gray-800"
                                    value={editedCoverLetter}
                                    onChange={(e) => setEditedCoverLetter(e.target.value)}
                                    placeholder="Your cover letter will appear here..."
                                />
                            </div>

                            {/* Hidden Template for Printing */}
                            <div style={{ display: 'none' }}>
                                <div ref={coverLetterRef}>
                                    <CoverLetterTemplate data={fullResume} coverLetter={editedCoverLetter} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
                    <p className="text-sm text-gray-500 italic">
                        {activeTab === 'resume' ? '💡 Review resume changes.' : '💡 Review generated cover letter based on your experience and JD.'}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Close
                        </button>
                        {activeTab === 'resume' && (
                            <button
                                onClick={onApply}
                                className="px-5 py-2.5 text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition shadow-md flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Apply Resume Changes
                            </button>
                        )}
                        {activeTab === 'coverLetter' && (
                            <button
                                onClick={copyToClipboard}
                                className="px-5 py-2.5 text-white bg-gray-800 rounded-lg font-medium hover:bg-gray-900 transition shadow-md flex items-center gap-2"
                            >
                                Copy to Clipboard
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
