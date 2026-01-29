import { useId } from 'react';
import type { ResumeData } from '../../types';

interface TemplateProps {
    data: ResumeData;
}

const RichText = ({ text, className = '' }: { text: string, className?: string }) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
        <div className={className}>
            {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                    const content = trimmed.substring(2);
                    return (
                        <div key={idx} className="flex gap-2 mb-1">
                            <span className="opacity-70">•</span>
                            <span dangerouslySetInnerHTML={{ __html: parseBold(content) }} />
                        </div>
                    );
                }
                return (
                    <div key={idx} className="mb-1 min-h-[1em]" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
                );
            })}
        </div>
    );
};

const parseBold = (text: string) => {
    let safe = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

export const SidebarTemplate = ({ data }: TemplateProps) => {
    const uniqueId = useId();
    const themeColor = data.themeColor || '#2c3e50'; // Dark blue-gray default

    return (
        <>
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    
                    #resume-preview-${uniqueId} {
                        background: white !important;
                        box-shadow: none !important;
                        width: 210mm !important;
                        display: flex !important;
                    }
                    
                    #resume-preview-${uniqueId} > div:first-child {
                        background-color: ${themeColor} !important;
                        flex: 0 0 35%;
                        box-shadow: 0 0 0 9999px ${themeColor};
                        clip-path: inset(0 -9999px -9999px 0);
                    }
                    
                    #resume-preview-${uniqueId} > div:last-child {
                        background-color: white !important;
                        flex: 0 0 65%;
                    }
                }
                
                @media screen {
                    #resume-preview-${uniqueId}::after {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 297mm;
                        width: 100%;
                        height: 2px;
                        background: linear-gradient(to right, ${themeColor} 35%, #e5e7eb 35%);
                        pointer-events: none;
                        z-index: 10;
                    }
                }
            `}</style>

            <div
                className="shadow-lg w-[210mm] mx-auto flex text-sm relative print:shadow-none"
                id={`resume-preview-${uniqueId}`}
                style={{
                    background: `linear-gradient(90deg, ${themeColor} 35%, white 35%)`,
                    minHeight: '297mm'
                }}
            >
                {/* Left Sidebar - 35% */}
                <div
                    className="w-[35%] text-white p-8 flex flex-col gap-8"
                    style={{ minHeight: '297mm' }}
                >
                    {/* Name */}
                    <div className="border-b border-white/30 pb-6">
                        <h1 className="text-3xl font-bold uppercase tracking-wider leading-tight">
                            {data.fullName || "YOUR NAME"}
                        </h1>
                    </div>

                    {/* Skills */}
                    {(data.skillGroups && data.skillGroups.length > 0) && (
                        <section>
                            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-white/30 pb-2">
                                Skills
                            </h2>
                            <div className="space-y-4">
                                {data.skillGroups.map((group, idx) => (
                                    <div key={idx} className="break-inside-avoid">
                                        <h3 className="font-bold text-sm mb-2">{group.category}</h3>
                                        <p className="text-xs leading-relaxed opacity-90">
                                            {group.items.join(' · ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Achievements as Strengths */}
                    {data.achievements && data.achievements.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-white/30 pb-2">
                                Strengths
                            </h2>
                            <div className="space-y-4">
                                {data.achievements.map((ach, idx) => (
                                    <div key={idx} className="break-inside-avoid">
                                        <h3 className="font-bold text-sm mb-1">{ach.title}</h3>
                                        <p className="text-xs leading-relaxed opacity-90">{ach.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages */}
                    {data.languages && data.languages.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-white/30 pb-2">
                                Languages
                            </h2>
                            <div className="space-y-2">
                                {data.languages.map((lang, idx) => (
                                    <div key={idx} className="flex justify-between items-baseline text-xs">
                                        <span className="font-medium">{lang.language}</span>
                                        <span className="opacity-70 text-[10px] uppercase tracking-wide">{lang.proficiency}</span>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Certificates */}
                    {data.certificates && data.certificates.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-white/30 pb-2">
                                Certificates
                            </h2>
                            <div className="space-y-3">
                                {data.certificates.map((cert, idx) => (
                                    <div key={idx} className="break-inside-avoid text-xs">
                                        <h4 className="font-bold mb-0.5">{cert.name}</h4>
                                        <div className="opacity-80 text-[10px]">
                                            <div>{cert.issuer}</div>
                                            <div>{cert.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Right Main Content - 65% */}
                <div
                    className="w-[65%] bg-white p-8 flex flex-col gap-6"
                    style={{ minHeight: '297mm' }}
                >
                    {/* Job Title & Contact */}
                    <div className="border-b-2 pb-4" style={{ borderColor: '#e5e7eb' }}>
                        <h2 className="text-2xl font-bold mb-3" style={{ color: '#3b82f6' }}>
                            {data.jobTitle || "Job Title"}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                            {data.phone && (
                                <div className="flex items-center gap-1.5">
                                    <span>📞</span> {data.phone}
                                </div>
                            )}
                            {data.email && (
                                <div className="flex items-center gap-1.5">
                                    <span>📧</span> {data.email}
                                </div>
                            )}
                            {data.linkedin && (
                                <div className="flex items-center gap-1.5">
                                    <span>🔗</span>
                                    <a
                                        href={data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`}
                                        className="hover:underline"
                                        style={{ color: '#3b82f6' }}
                                    >
                                        {data.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                                    </a>
                                </div>
                            )}
                            {data.github && (
                                <div className="flex items-center gap-1.5">
                                    <span>💻</span>
                                    <a
                                        href={data.github.startsWith('http') ? data.github : `https://${data.github}`}
                                        className="hover:underline"
                                        style={{ color: '#3b82f6' }}
                                    >
                                        {data.github.replace(/^https?:\/\/(www\.)?/, '')}
                                    </a>
                                </div>
                            )}
                            {data.website && (
                                <div className="flex items-center gap-1.5">
                                    <span>🌐</span>
                                    <a
                                        href={data.website.startsWith('http') ? data.website : `https://${data.website}`}
                                        className="hover:underline"
                                        style={{ color: '#3b82f6' }}
                                    >
                                        {data.website.replace(/^https?:\/\/(www\.)?/, '')}
                                    </a>
                                </div>
                            )}
                            {data.location && (
                                <div className="flex items-center gap-1.5">
                                    <span>📍</span> {data.location}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    {data.summary && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">
                                Summary
                            </h3>
                            <RichText text={data.summary} className="text-sm text-gray-700 leading-relaxed" />
                        </section>
                    )}

                    {/* Education */}
                    {data.education && data.education.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">
                                Education
                            </h3>
                            <div className="space-y-4">
                                {data.education.map((edu, idx) => (
                                    <div key={idx} className="break-inside-avoid">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                                            <span className="text-xs text-gray-500">{edu.graduationDate}</span>
                                        </div>
                                        <a
                                            href="#"
                                            className="text-sm font-medium hover:underline block"
                                            style={{ color: '#3b82f6' }}
                                        >
                                            {edu.institution}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Experience */}
                    {data.experience && data.experience.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">
                                Experience
                            </h3>
                            <div className="space-y-5">
                                {data.experience.map((exp, idx) => (
                                    <div key={idx} className="break-inside-avoid">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-gray-800">{exp.title}</h4>
                                            <span className="text-xs text-gray-500">
                                                {exp.startDate} - {exp.endDate || 'Present'}
                                            </span>
                                        </div>
                                        <a
                                            href="#"
                                            className="text-sm font-medium hover:underline block mb-2"
                                            style={{ color: '#3b82f6' }}
                                        >
                                            {exp.company}
                                        </a>
                                        <RichText text={exp.description} className="text-xs text-gray-700 leading-relaxed" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {data.projects && data.projects.length > 0 && (
                        <section>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">
                                Projects
                            </h3>
                            <div className="space-y-4">
                                {data.projects.map((proj, idx) => (
                                    <div key={idx} className="break-inside-avoid">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-gray-800">{proj.title}</h4>
                                            <span className="text-xs text-gray-500">{proj.date}</span>
                                        </div>
                                        <RichText text={proj.description} className="text-xs text-gray-700 mb-2" />
                                        {proj.techStack && proj.techStack.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {proj.techStack.map((tech, tIdx) => (
                                                    <span
                                                        key={tIdx}
                                                        className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200"
                                                    >
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
};
