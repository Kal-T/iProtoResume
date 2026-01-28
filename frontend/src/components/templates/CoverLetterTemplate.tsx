import React from 'react';
import type { ResumeData } from '../../types';

interface Props {
    data: ResumeData;
    coverLetter: string;
}

export const CoverLetterTemplate: React.FC<Props> = ({ data, coverLetter }) => {
    const themeColor = data.themeColor || '#1e3a8a';

    const printStyles = `
        @media print {
            @page {
                size: A4;
                margin: 0;
            }
            body {
                -webkit-print-color-adjust: exact;
            }
            .page-break {
                page-break-before: always;
            }
        }
    `;

    return (
        <>
            <style>{printStyles}</style>
            <div className="w-[210mm] min-h-[297mm] mx-auto bg-white text-gray-900 font-sans shadow-lg relative print:shadow-none">
                {/* Header - Matching Standard/Modern Resume Style */}
                <div className="p-12 pb-6 flex justify-between items-start">
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold uppercase tracking-wide mb-2 text-gray-900">
                            {data.fullName || "Your Name"}
                        </h1>
                        <h2 className="text-xl font-medium text-blue-700 mb-4 tracking-wide" style={{ color: themeColor }}>
                            {data.jobTitle || "Professional Title"}
                        </h2>

                        <div className="text-sm space-y-1.5 text-gray-600 font-medium">
                            {data.phone && (
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-600" style={{ color: themeColor }}>📞</span> {data.phone}
                                </div>
                            )}
                            {data.email && (
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-600" style={{ color: themeColor }}>📧</span> {data.email}
                                </div>
                            )}
                            {data.location && (
                                <div className="flex items-center gap-2">
                                    <span className="text-blue-600" style={{ color: themeColor }}>📍</span> {data.location}
                                </div>
                            )}
                            <div className="flex gap-4 mt-2">
                                {data.linkedin && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-blue-600" style={{ color: themeColor }}>🔗</span>
                                        <span className="opacity-80">{data.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {data.profileImage && (
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm shrink-0 ml-8">
                            <img src={data.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    )}
                </div>

                {/* Divider */}
                <div className="mx-12 border-b-2 border-gray-900"></div>

                {/* Content */}
                <div className="p-12 pt-8">
                    <h3 className="text-lg font-bold uppercase border-b-2 border-gray-900 mb-6 pb-1 inline-block">
                        Cover Letter
                    </h3>

                    <div className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap font-serif text-justify">
                        {coverLetter}
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="absolute bottom-0 left-0 right-0 h-4" style={{ backgroundColor: themeColor }}></div>
            </div>
        </>
    );
};
