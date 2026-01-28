import { useId } from 'react';
import type { ResumeData } from '../../types';

interface TemplateProps {
    data: ResumeData;
}

// Helper to parse simple markdown (**bold**, * list)
const RichText = ({ text, className = '' }: { text: string, className?: string }) => {
    if (!text) return null;

    // Split by newlines to handle paragraphs/lists
    const lines = text.split('\n');

    return (
        <div className={className}>
            {lines.map((line, idx) => {
                const trimmed = line.trim();

                // Bullet point
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                    const content = trimmed.substring(2);
                    return (
                        <div key={idx} className="flex gap-2 mb-1">
                            <span className="text-teal-700 opacity-70">•</span>
                            <span dangerouslySetInnerHTML={{ __html: parseBold(content) }} />
                        </div>
                    );
                }

                // Normal paragraph
                return (
                    <div key={idx} className="mb-1 min-h-[1em]" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
                );
            })}
        </div>
    );
};

// Helper for bold text
const parseBold = (text: string) => {
    // Replace **text** with <strong>text</strong>
    // Sanitize basic tags to prevent XSS (very basic)
    let safe = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

export const ModernTemplate = ({ data }: TemplateProps) => {
    const uniqueId = useId();
    const themeColor = data.themeColor || '#0e5f5f';

    return (
        <>
            <style>{`
                /* Print styles for proper page backgrounds */
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
                    
                    /* Left column - white background fills naturally */
                    #resume-preview-${uniqueId} > div:first-child {
                        background-color: white !important;
                        flex: 0 0 65%;
                    }
                    
                    /* Right column - colored background fills naturally */
                    #resume-preview-${uniqueId} > div:last-child {
                        background-color: ${themeColor} !important;
                        color: white !important;
                        flex: 0 0 35%;
                        /* Use box-shadow to extend background infinitely downward */
                        box-shadow: 0 0 0 9999px ${themeColor};
                        clip-path: inset(0 -9999px -9999px 0);
                    }
                }
                
                /* Visual page break indicator for live preview */
                @media screen {
                    #resume-preview-${uniqueId}::after {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 297mm;
                        width: 100%;
                        height: 2px;
                        background: linear-gradient(to right, #e5e7eb 65%, rgba(229,231,235,0.5) 65%);
                        pointer-events: none;
                        z-index: 10;
                    }
                }
            `}</style>
            <div
                className="shadow-lg w-[210mm] mx-auto flex text-sm relative print:shadow-none"
                id={`resume-preview-${uniqueId}`}
                style={{
                    background: `linear-gradient(90deg, white 65%, ${themeColor} 65%)`,
                    minHeight: '297mm'
                }}
            >
                {/* Left Column - Main Content (65%) */}
                <div className="w-[65%] p-8 flex flex-col gap-6 pt-10 bg-transparent print:bg-white print:h-auto" style={{ minHeight: '297mm', height: 'auto' }}>

                    {/* Header */}
                    <div className="pb-6 relative leading-relaxed" style={{ borderBottomColor: themeColor, borderBottomWidth: '2px' }}>
                        <h1 className="text-4xl font-bold text-gray-800 uppercase tracking-tight mb-2">
                            {data.fullName || "Your Name"}
                        </h1>
                        <h2 className="text-xl font-medium mb-4" style={{ color: themeColor }}>
                            {data.jobTitle || "Software Engineer"}
                        </h2>

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-600 font-medium items-center">
                            {data.phone && (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 text-center">📞</span> {data.phone}
                                </div>
                            )}
                            {data.email && (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 text-center">📧</span> {data.email}
                                </div>
                            )}
                            {data.location && (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 text-center">📍</span> {data.location}
                                </div>
                            )}
                            {data.linkedin && (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 text-center">🔗</span>
                                    <a href={data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">
                                        {data.linkedin.replace(/^https?:\/\/(www\.)?/, '')}
                                    </a>
                                </div>
                            )}
                            {data.github && (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 text-center">💻</span>
                                    <a href={data.github.startsWith('http') ? data.github : `https://${data.github}`} target="_blank" rel="noreferrer" className="hover:underline">
                                        {data.github.replace(/^https?:\/\/(www\.)?/, '')}
                                    </a>
                                </div>
                            )}
                            {data.website && (
                                <div className="flex items-center gap-1.5">
                                    <span className="w-4 text-center">🌐</span> {data.website}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Summary */}
                    {data.summary && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Summary</h3>
                            <RichText text={data.summary} className="text-gray-700 leading-relaxed text-justify text-xs" />
                        </section>
                    )}

                    {/* Experience */}
                    {data.experience && data.experience.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Professional Experience</h3>

                            <div className="flex flex-col gap-6">
                                {data.experience.map((exp, idx) => (
                                    <div key={idx} className="relative pl-4 border-l-2 border-gray-200 break-inside-avoid">
                                        {/* Project Timeline Dot */}
                                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></div>

                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-gray-800 text-sm">{exp.title}</h4>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                                                {exp.startDate} - {exp.endDate || 'Present'}
                                            </span>
                                        </div>
                                        <h5 className="text-xs font-bold mb-2 uppercase" style={{ color: themeColor }}>{exp.company}</h5>
                                        <RichText text={exp.description} className="text-xs text-gray-600 whitespace-pre-line leading-relaxed" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects */}
                    {data.projects && data.projects.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 mt-6">Projects</h3>

                            <div className="flex flex-col gap-6">
                                {data.projects.map((proj, idx) => (
                                    <div key={idx} className="break-inside-avoid">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h4 className="font-bold text-gray-800 text-sm">{proj.title}</h4>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">
                                                {proj.date}
                                            </span>
                                        </div>
                                        {proj.location && (
                                            <div className="text-[10px] text-gray-500 mb-1">{proj.location}</div>
                                        )}
                                        <RichText text={proj.description} className="text-xs text-gray-600 mb-2" />

                                        {proj.techStack && proj.techStack.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {proj.techStack.map((tech, tIdx) => (
                                                    <span key={tIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium border border-gray-200">
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

                    {data.education && data.education.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 mt-6">Education</h3>
                            <div className="flex flex-col gap-4">
                                {data.education.map((edu, idx) => (
                                    <div key={idx} className="break-inside-avoid">
                                        <h4 className="font-bold text-gray-800 text-sm">{edu.degree}</h4>
                                        <div className="flex justify-between text-xs mt-1">
                                            <span className="font-medium" style={{ color: themeColor }}>{edu.institution}</span>
                                            <span className="text-gray-500">{edu.graduationDate}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                </div>

                {/* Right Column - Sidebar (35%) */}
                <div
                    className="w-[35%] text-white p-6 pt-10 flex flex-col gap-8 print:text-white"
                    style={{ minHeight: '297mm' }}
                >

                    {/* Profile Photo - Optional */}
                    {data.profileImage && (
                        <div className="flex justify-center mb-2">
                            {/* Improved print styling: remove shadow, bg-white from container in print, force rounded on image */}
                            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-md bg-white print:shadow-none print:border-white">
                                <img
                                    src={data.profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-full"
                                    style={{ borderRadius: '50%' }} // Force inline style for print engines
                                />
                            </div>
                        </div>
                    )}

                    {/* Key Achievements */}
                    {data.achievements && data.achievements.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/30 pb-2 mb-4 opacity-90">
                                Key Achievements
                            </h3>
                            <div className="text-xs space-y-4 leading-relaxed opacity-90">
                                {data.achievements.map((ach, idx) => (
                                    <div key={idx} className="break-inside-avoid">
                                        <h4 className="font-bold text-white mb-1">{ach.title}</h4>
                                        <p className="opacity-80">{ach.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills Section */}
                    {(data.skillGroups && data.skillGroups.length > 0) || (data.skills && data.skills.length > 0) ? (
                        <section>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/30 pb-2 mb-4 opacity-90">
                                Skills
                            </h3>

                            <div className="flex flex-col gap-4">
                                {/* Render Grouped Skills */}
                                {data.skillGroups?.map((group, idx) => (
                                    <div key={idx} className="break-inside-avoid">
                                        <h4 className="text-sm font-bold text-white/90 mb-2">{group.category}</h4>
                                        <div className="flex flex-wrap gap-x-1 gap-y-2">
                                            {group.items.map((skill, sIdx) => (
                                                <span key={sIdx} className="text-xs opacity-90">
                                                    {skill}{sIdx < group.items.length - 1 ? ' • ' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {/* Fallback to flat skills list if groups not used */}
                                {(!data.skillGroups || data.skillGroups.length === 0) && data.skills.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {data.skills.map((skill, idx) => (
                                            <div key={idx} className="bg-white/20 text-xs px-2 py-1 rounded inline-block">
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    ) : null}

                    {/* Certificates */}
                    {data.certificates && data.certificates.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/30 pb-2 mb-4 opacity-90">
                                Certificates
                            </h3>
                            <div className="text-xs space-y-3 leading-relaxed opacity-90">
                                {data.certificates.map((cert, idx) => (
                                    <div key={idx} className="break-inside-avoid">
                                        <h4 className="font-bold text-white mb-0.5">{cert.name}</h4>
                                        <div className="flex justify-between text-[10px] opacity-80 mb-1">
                                            <span>{cert.issuer}</span>
                                            <span>{cert.date}</span>
                                        </div>
                                        {cert.link && (
                                            <a href={cert.link} target="_blank" rel="noreferrer" className="text-[10px] text-white/70 hover:text-white hover:underline truncate block">
                                                View Certificate
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Languages */}
                    {data.languages && data.languages.length > 0 && (
                        <section>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/30 pb-2 mb-4 opacity-90">
                                Languages
                            </h3>
                            <div className="text-xs space-y-2">
                                {data.languages.map((lang, idx) => (
                                    <div key={idx} className="flex justify-between items-baseline break-inside-avoid">
                                        <span className="font-medium">{lang.language}</span>
                                        <span className="font-light opacity-70 text-[10px] uppercase">{lang.proficiency}</span>
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
