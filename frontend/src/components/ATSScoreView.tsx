import React, { useState } from 'react';
import type { ATSScore } from '../types';

interface Props {
    result: ATSScore | null;
}

export const ATSScoreView: React.FC<Props> = ({ result }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!result) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6 border-t-4 border-blue-500">
            <h2 className="text-xl font-bold mb-4">ATS Analysis</h2>

            <div className="flex items-center mb-4">
                <div className="text-4xl font-bold text-blue-600 mr-4">{result.score}/100</div>
                <div>
                    {result.score >= 80 ? (
                        <span className="text-green-600 font-bold">Excellent match!</span>
                    ) : result.score >= 50 ? (
                        <span className="text-yellow-600 font-bold">Good start, needs work.</span>
                    ) : (
                        <span className="text-red-600 font-bold">Poor match.</span>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {/* Preview of missing keywords */}
                {result.missingKeywords.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 uppercase">Missing Critical Keywords</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {result.missingKeywords.slice(0, 5).map((kw, idx) => (
                                <span key={idx} className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-100">
                                    {kw}
                                </span>
                            ))}
                            {result.missingKeywords.length > 5 && (
                                <span className="text-xs text-gray-500 self-center">+{result.missingKeywords.length - 5} more</span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={() => setIsOpen(true)}
                className="mt-6 w-full bg-blue-50 text-blue-600 py-2.5 rounded-lg font-medium hover:bg-blue-100 transition flex items-center justify-center gap-2"
            >
                <span>🔍</span> View Detailed Analysis & Reasoning
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl">
                        {/* Modal Header */}
                        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-800">Review Analysis</h2>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 space-y-8">

                            {/* Score Card */}
                            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-xl border border-gray-100">
                                <div className={`text-5xl font-bold ${result.score >= 80 ? 'text-green-600' : result.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {result.score}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-lg">Overall Match Score</h4>
                                    <p className="text-sm text-gray-500">Based on semantic relevance to the job description.</p>
                                </div>
                            </div>

                            {/* Reasoning */}
                            <section>
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <span className="text-xl">🤖</span> AI Reasoning
                                </h3>
                                <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 text-gray-700 leading-relaxed">
                                    {result.reasoning || "The AI did not provide specific reasoning for this score."}
                                </div>
                            </section>

                            {/* Missing Keywords */}
                            {result.missingKeywords.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="text-xl">🔑</span> Missing Keywords
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {result.missingKeywords.map((kw, idx) => (
                                            <span key={idx} className="bg-red-50 text-red-700 font-medium px-3 py-1.5 rounded-lg border border-red-100 shadow-sm">
                                                {kw}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">Note: Consider adding these terms if you have experience with them.</p>
                                </section>
                            )}

                            {/* Actionable Feedback */}
                            {result.feedback.length > 0 && (
                                <section>
                                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="text-xl">💡</span> Improvements
                                    </h3>
                                    <ul className="space-y-3">
                                        {result.feedback.map((fb, idx) => (
                                            <li key={idx} className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 transition">
                                                <span className="text-blue-500 mt-1">•</span>
                                                <span className="text-gray-700 leading-relaxed">{fb}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>

                        <div className="p-6 border-t bg-gray-50">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition"
                            >
                                Close Analysis
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
