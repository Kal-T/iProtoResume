import React from 'react';
import type { ATSScore } from '../types';

interface Props {
    result: ATSScore | null;
}

export const ATSScoreView: React.FC<Props> = ({ result }) => {
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

            <div className="mb-4">
                <h3 className="font-semibold text-gray-700">Missing Keywords:</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                    {result.missingKeywords.map((kw, idx) => (
                        <span key={idx} className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                            {kw}
                        </span>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-700">Feedback:</h3>
                <ul className="list-disc ml-5 mt-2 text-gray-600">
                    {result.feedback.map((fb, idx) => (
                        <li key={idx}>{fb}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
