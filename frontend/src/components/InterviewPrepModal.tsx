import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';

interface InterviewQuestion {
    question: string;
    type: string;
    answerGuide: string;
}

interface InterviewPrepModalProps {
    isOpen: boolean;
    onClose: () => void;
    questions: InterviewQuestion[];
    jobDescription: string;
}

export const InterviewPrepModal: React.FC<InterviewPrepModalProps> = ({ isOpen, onClose, questions, jobDescription }) => {
    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: 'Interview_Prep_Guide'
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        🎤 Interview Preparation Guide
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handlePrint && handlePrint()}
                            className="bg-indigo-600 text-white px-4 py-2 rounded font-medium hover:bg-indigo-700 transition flex items-center gap-2"
                        >
                            <span>Download PDF</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                            ✕
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    <div className="max-w-3xl mx-auto bg-white shadow-sm border p-8 print:shadow-none print:border-0" ref={printRef}>
                        <div className="text-center mb-8 border-b pb-4">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Q&A Guide</h1>
                            <p className="text-sm text-gray-500">Based on your Resume & Job Description</p>
                        </div>

                        {/* Job Context */}
                        <div className="mb-6 bg-blue-50 p-4 rounded border border-blue-100 print:hidden">
                            <h3 className="text-xs font-bold text-blue-800 uppercase mb-1">Target Role Context</h3>
                            <p className="text-sm text-blue-700 line-clamp-2">{jobDescription}</p>
                        </div>

                        <div className="space-y-8">
                            {['Technical', 'Behavioral', 'Soft Skills'].map(type => {
                                const typeQuestions = questions.filter(q => q.type.includes(type) || (type === 'Soft Skills' && !q.type.includes('Technical') && !q.type.includes('Behavioral')));
                                if (typeQuestions.length === 0) return null;

                                return (
                                    <section key={type} className="break-inside-avoid">
                                        <h3 className="text-lg font-bold text-gray-800 border-b-2 border-indigo-500 inline-block mb-4 pb-1">
                                            {type} Questions
                                        </h3>
                                        <div className="space-y-6">
                                            {typeQuestions.map((q, idx) => (
                                                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-100 break-inside-avoid print:bg-white print:border-0 print:p-0 print:mb-6">
                                                    <h4 className="font-semibold text-gray-900 mb-2">Q: {q.question}</h4>
                                                    <div className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200 whitespace-pre-wrap print:border-l-4 print:border-l-gray-300 print:border-y-0 print:border-r-0 print:pl-4 print:italic">
                                                        <span className="font-bold text-indigo-600 block mb-1 text-xs uppercase tracking-wide">💡 Ideal Answer Strategy:</span>
                                                        {q.answerGuide}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>

                        <div className="mt-10 pt-6 border-t text-center text-xs text-gray-400 print:block hidden">
                            Generated by iProtoResume AI
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
