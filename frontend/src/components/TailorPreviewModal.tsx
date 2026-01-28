import React from 'react';

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
}

export const TailorPreviewModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onApply,
    original,
    tailored
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-indigo-600">
                    <div>
                        <h2 className="text-xl font-bold text-white">✨ AI-Tailored Resume Preview</h2>
                        <p className="text-purple-200 text-sm">Review the suggested changes before applying</p>
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Summary Section */}
                    <section>
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm">📝</span>
                            Professional Summary
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Original</span>
                                <p className="mt-2 text-gray-700 text-sm leading-relaxed">{original.summary || 'No summary'}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
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
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Original</span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(() => {
                                        // Check flat skills first, then skillGroups
                                        const flatSkills = original.skills || [];
                                        const groupedSkills = original.skillGroups?.flatMap(g => g.items) || [];
                                        const allSkills = flatSkills.length > 0 ? flatSkills : groupedSkills;

                                        if (allSkills.length > 0) {
                                            return allSkills.map((skill, i) => (
                                                <span key={i} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">{skill}</span>
                                            ));
                                        }
                                        return <span className="text-gray-400 text-sm">No skills listed</span>;
                                    })()}
                                </div>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <span className="text-xs font-medium text-green-600 uppercase tracking-wide flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    AI Suggested
                                </span>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {(tailored.skills || []).map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full font-medium">{skill}</span>
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
                                    <div key={i} className="bg-green-50 p-4 rounded-lg border border-green-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold text-gray-800">{exp.title}</h4>
                                            <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded">AI Enhanced</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{exp.company} • {exp.startDate} - {exp.endDate || 'Present'}</p>
                                        <p className="text-sm text-gray-700 whitespace-pre-line">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        💡 These changes are optimized for the job description you provided.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onApply}
                            className="px-5 py-2.5 text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition shadow-md flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Apply Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
