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
                // Bullet point
                if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                    const content = trimmed.substring(2);
                    return (
                        <div key={idx} className="flex gap-2 mb-0.5">
                            <span className="opacity-70">•</span>
                            <span dangerouslySetInnerHTML={{ __html: parseBold(content) }} />
                        </div>
                    );
                }
                return (
                    <div key={idx} className="mb-0.5 min-h-[1em]" dangerouslySetInnerHTML={{ __html: parseBold(line) }} />
                );
            })}
        </div>
    );
};

const parseBold = (text: string) => {
    let safe = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
};

export const ClassicTemplate = ({ data }: TemplateProps) => {
    const uniqueId = useId();
    const themeColor = data.themeColor || '#1e3a8a'; // Dark blue default for this template

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
            #resume-preview-${uniqueId} {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
    `;

    return (
        <>
            <style>{printStyles}</style>
            <div
                id={`resume-preview-${uniqueId}`}
                className="w-[210mm] min-h-[297mm] mx-auto bg-white text-gray-900 font-sans shadow-lg"
            >
                {/* Header Section */}
                <header className="text-white p-8 flex justify-between items-start" style={{ backgroundColor: themeColor }}>
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold uppercase tracking-wide mb-2">
                            {data.fullName || "Your Name"}
                        </h1>
                        <h2 className="text-lg font-medium opacity-90 mb-4 tracking-wide">
                            {data.jobTitle || "Software Engineer"}
                        </h2>

                        <div className="text-sm space-y-1 opacity-90 font-light">
                            {data.phone && (
                                <div className="flex items-center gap-2">
                                    <span>📞</span> {data.phone}
                                </div>
                            )}
                            {data.email && (
                                <div className="flex items-center gap-2">
                                    <span>📧</span> {data.email}
                                </div>
                            )}
                            {data.location && (
                                <div className="flex items-center gap-2">
                                    <span>📍</span> {data.location}
                                </div>
                            )}
                            <div className="flex flex-wrap gap-4 mt-2">
                                {data.linkedin && (
                                    <a href={data.linkedin.startsWith('http') ? data.linkedin : `https://${data.linkedin}`} className="hover:underline flex items-center gap-1">
                                        <span>🔗</span> LinkedIn
                                    </a>
                                )}
                                {data.github && (
                                    <a href={data.github.startsWith('http') ? data.github : `https://${data.github}`} className="hover:underline flex items-center gap-1">
                                        <span>💻</span> GitHub
                                    </a>
                                )}
                                {data.website && (
                                    <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} className="hover:underline flex items-center gap-1">
                                        <span>🌐</span> Portfolio
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {data.profileImage && (
                        <div className="ml-6 flex-shrink-0">
                            <img
                                src={data.profileImage}
                                alt="Profile"
                                className="w-32 h-32 object-cover rounded-lg border-4 border-white/20 shadow-sm"
                            />
                        </div>
                    )}
                </header>

                <div className="flex p-8 gap-8 items-start">
                    {/* Left Column (Main) 65% */}
                    <div className="w-[65%] flex flex-col gap-6">

                        {/* Summary */}
                        {data.summary && (
                            <section>
                                <h3 className="text-sm font-bold uppercase border-b-2 mb-3 pb-1 tracking-wider" style={{ color: themeColor, borderColor: themeColor }}>
                                    Summary
                                </h3>
                                <RichText text={data.summary} className="text-sm text-gray-700 leading-relaxed text-justify" />
                            </section>
                        )}

                        {/* Experience */}
                        {data.experience && data.experience.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold uppercase border-b-2 mb-4 pb-1 tracking-wider" style={{ color: themeColor, borderColor: themeColor }}>
                                    Professional Experience
                                </h3>
                                <div className="space-y-5">
                                    {data.experience.map((exp, idx) => (
                                        <div key={idx} className="break-inside-avoid">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h4 className="font-bold text-gray-800 text-base" style={{ color: themeColor }}>{exp.title}</h4>
                                                <span className="text-xs font-semibold text-gray-500 uppercase">
                                                    {exp.startDate} - {exp.endDate || 'Present'}
                                                </span>
                                            </div>
                                            <div className="text-sm font-bold text-gray-700 mb-2">{exp.company}</div>
                                            <RichText text={exp.description} className="text-sm text-gray-600 leading-relaxed" />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Projects */}
                        {data.projects && data.projects.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold uppercase border-b-2 mb-4 pb-1 tracking-wider" style={{ color: themeColor, borderColor: themeColor }}>
                                    Projects
                                </h3>
                                <div className="space-y-4">
                                    {data.projects.map((proj, idx) => (
                                        <div key={idx} className="break-inside-avoid">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="font-bold text-gray-800 text-sm">{proj.title}</h4>
                                                <span className="text-xs text-gray-500 font-semibold uppercase">
                                                    {proj.date}
                                                </span>
                                            </div>
                                            {proj.location && <div className="text-xs text-gray-500 italic mb-1">{proj.location}</div>}
                                            <RichText text={proj.description} className="text-sm text-gray-600 mb-2" />
                                            {proj.techStack && proj.techStack.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {proj.techStack.map((tech, tIdx) => (
                                                        <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium border border-gray-200">
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

                    {/* Right Column (Sidebar) 35% */}
                    <div className="w-[35%] flex flex-col gap-6">

                        {/* Key Achievements */}
                        {data.achievements && data.achievements.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold uppercase border-b-2 mb-3 pb-1 tracking-wider" style={{ color: themeColor, borderColor: themeColor }}>
                                    Key Achievements
                                </h3>
                                <div className="space-y-3">
                                    {data.achievements.map((ach, idx) => (
                                        <div key={idx} className="break-inside-avoid text-sm">
                                            <h4 className="font-bold text-gray-800 mb-1">{ach.title}</h4>
                                            <p className="text-gray-600 text-xs leading-relaxed">{ach.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Skills */}
                        {((data.skillGroups && data.skillGroups.length > 0) || (data.skills && data.skills.length > 0)) && (
                            <section>
                                <h3 className="text-sm font-bold uppercase border-b-2 mb-3 pb-1 tracking-wider" style={{ color: themeColor, borderColor: themeColor }}>
                                    Skills
                                </h3>
                                <div className="space-y-3">
                                    {data.skillGroups?.map((group, idx) => (
                                        <div key={idx} className="break-inside-avoid">
                                            <h4 className="text-xs font-bold text-gray-700 uppercase mb-1">{group.category}</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {group.items.map((skill, sIdx) => (
                                                    <span key={sIdx} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {(!data.skillGroups || data.skillGroups.length === 0) && data.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {data.skills.map((skill, idx) => (
                                                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Certificates */}
                        {data.certificates && data.certificates.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold uppercase border-b-2 mb-3 pb-1 tracking-wider" style={{ color: themeColor, borderColor: themeColor }}>
                                    Certificates
                                </h3>
                                <div className="space-y-3">
                                    {data.certificates.map((cert, idx) => (
                                        <div key={idx} className="break-inside-avoid text-sm">
                                            <h4 className="font-bold text-gray-800 mb-0.5">{cert.name}</h4>
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>{cert.issuer}</span>
                                                <span>{cert.date}</span>
                                            </div>
                                            {cert.link && (
                                                <a href={cert.link} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">
                                                    View Certificate
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Education */}
                        {data.education && data.education.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold uppercase border-b-2 mb-3 pb-1 tracking-wider" style={{ color: themeColor, borderColor: themeColor }}>
                                    Education
                                </h3>
                                <div className="space-y-3">
                                    {data.education.map((edu, idx) => (
                                        <div key={idx} className="break-inside-avoid">
                                            <h4 className="font-bold text-gray-800 text-sm">{edu.institution}</h4>
                                            <div className="text-xs text-gray-600">{edu.degree}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{edu.graduationDate}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Languages */}
                        {data.languages && data.languages.length > 0 && (
                            <section>
                                <h3 className="text-sm font-bold uppercase border-b-2 mb-3 pb-1 tracking-wider" style={{ color: themeColor, borderColor: themeColor }}>
                                    Languages
                                </h3>
                                <div className="space-y-2">
                                    {data.languages.map((lang, idx) => (
                                        <div key={idx} className="flex justify-between items-baseline text-sm">
                                            <span className="font-medium text-gray-800">{lang.language}</span>
                                            <span className="text-xs text-gray-500">{lang.proficiency}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
};
