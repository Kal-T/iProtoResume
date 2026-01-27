import React, { useState } from 'react';
import type { ResumeData, Experience, Education, SkillGroup, Language, Achievement, Project, Certificate } from '../types';

interface Props {
    initialData: ResumeData;
    onChange: (data: ResumeData) => void;
}

export const ResumeForm: React.FC<Props> = ({ initialData, onChange }) => {
    const [data, setData] = useState<ResumeData>(initialData);

    const handleChange = (field: keyof ResumeData, value: any) => {
        const newData = { ...data, [field]: value };
        setData(newData);
        onChange(newData);
    };

    const updateArrayItem = <T,>(field: keyof ResumeData, index: number, itemUpdate: Partial<T>) => {
        const array = (data[field] as any[]) || [];
        const newArray = [...array];
        newArray[index] = { ...newArray[index], ...itemUpdate };
        handleChange(field, newArray);
    };

    const addArrayItem = <T,>(field: keyof ResumeData, newItem: T) => {
        const array = (data[field] as any[]) || [];
        handleChange(field, [...array, newItem]);
    };

    const removeArrayItem = (field: keyof ResumeData, index: number) => {
        const array = (data[field] as any[]) || [];
        handleChange(field, array.filter((_, i) => i !== index));
    };

    // Helper for file upload to Base64
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('profileImage', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-8">
            <h2 className="text-xl font-bold border-b pb-2">Personal Details</h2>

            {/* Profile Image & Theme Color */}
            <div className="flex gap-6 items-start">
                <div className="w-full md:w-1/3">
                    <Label>Profile Photo</Label>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                        {data.profileImage ? (
                            <img src={data.profileImage} alt="Profile" className="w-16 h-16 rounded-full object-cover border" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">📷</div>
                        )}
                        <div className="flex flex-col gap-2">
                            <label className="cursor-pointer bg-white py-1.5 px-3 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none text-center">
                                Change
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                            {data.profileImage && (
                                <button
                                    onClick={() => handleChange('profileImage', '')}
                                    className="bg-white py-1.5 px-3 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-red-600 hover:bg-red-50 focus:outline-none"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-2/3">
                    <Label>Theme Color</Label>
                    <div className="flex gap-3 mt-2 flex-wrap">
                        {/* Gray is now default/first options */}
                        {['#4b5563', '#0e5f5f', '#1e3a8a', '#111827', '#7c3aed'].map(color => (
                            <button
                                key={color}
                                onClick={() => handleChange('themeColor', color)}
                                className={`w-8 h-8 rounded-full border-2 ${data.themeColor === color ? 'border-black ring-2 ring-gray-200' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                                title={color}
                            />
                        ))}
                        <input
                            type="color"
                            value={data.themeColor || '#4b5563'}
                            onChange={(e) => handleChange('themeColor', e.target.value)}
                            className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Full Name" value={data.fullName} onChange={(v: string) => handleChange('fullName', v)} />
                <Input label="Job Title" value={data.jobTitle} onChange={(v: string) => handleChange('jobTitle', v)} placeholder="e.g. Software Engineer" />
                <Input label="Email" value={data.email} onChange={(v: string) => handleChange('email', v)} />
                <Input label="Phone" value={data.phone} onChange={(v: string) => handleChange('phone', v)} />
                <Input label="Location" value={data.location} onChange={(v: string) => handleChange('location', v)} placeholder="City, Country" />
                <Input label="LinkedIn" value={data.linkedin} onChange={(v: string) => handleChange('linkedin', v)} placeholder="linkedin.com/in/..." />
                <Input label="GitHub" value={data.github} onChange={(v: string) => handleChange('github', v)} placeholder="github.com/..." />
                <Input label="Website" value={data.website} onChange={(v: string) => handleChange('website', v)} />
            </div>

            <div>
                <Label>Professional Summary</Label>
                <div className="text-xs text-gray-500 mb-1">Tip: Use **bold** for emphasis.</div>
                <textarea
                    className="w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
                    rows={4}
                    value={data.summary}
                    onChange={e => handleChange('summary', e.target.value)}
                />
            </div>

            <Section title="Experience" onAdd={() => addArrayItem<Experience>('experience', { title: '', company: '', description: '' })}>
                {data.experience.map((exp, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded border relative">
                        <RemoveButton onClick={() => removeArrayItem('experience', idx)} />
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <Input label="Job Title" value={exp.title} onChange={(v: string) => updateArrayItem('experience', idx, { title: v })} />
                            <Input label="Company" value={exp.company} onChange={(v: string) => updateArrayItem('experience', idx, { company: v })} />
                            <Input label="Start Date" value={exp.startDate} onChange={(v: string) => updateArrayItem('experience', idx, { startDate: v })} placeholder="MM/YYYY" />
                            <Input label="End Date" value={exp.endDate} onChange={(v: string) => updateArrayItem('experience', idx, { endDate: v })} placeholder="Present" />
                        </div>
                        <Label>Description (Supports **bold** and * bullet points)</Label>
                        <textarea
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                            rows={3}
                            value={exp.description}
                            onChange={e => updateArrayItem('experience', idx, { description: e.target.value })}
                        />
                    </div>
                ))}
            </Section>

            <Section title="Projects" onAdd={() => addArrayItem<Project>('projects', { title: '', date: '', description: '', techStack: [] })}>
                {(data.projects || []).map((proj, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded border relative">
                        <RemoveButton onClick={() => removeArrayItem('projects', idx)} />
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <Input label="Project Title" value={proj.title} onChange={(v: string) => updateArrayItem('projects', idx, { title: v })} />
                            <Input label="Date" value={proj.date} onChange={(v: string) => updateArrayItem('projects', idx, { date: v })} placeholder="MM/YYYY" />
                            <Input label="Location" value={proj.location} onChange={(v: string) => updateArrayItem('projects', idx, { location: v })} placeholder="City / Remote" />
                        </div>
                        <div className="mb-2">
                            <TagInput
                                label="Tech Stack"
                                tags={proj.techStack || []}
                                onChange={(tags) => updateArrayItem('projects', idx, { techStack: tags })}
                            />
                        </div>
                        <Label>Description</Label>
                        <textarea
                            className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                            rows={2}
                            value={proj.description}
                            onChange={e => updateArrayItem('projects', idx, { description: e.target.value })}
                        />
                    </div>
                ))}
            </Section>

            <Section title="Skill Groups" onAdd={() => addArrayItem<SkillGroup>('skillGroups', { category: 'New Group', items: [] })}>
                {(data.skillGroups || []).map((group, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded border relative">
                        <RemoveButton onClick={() => removeArrayItem('skillGroups', idx)} />
                        <Input label="Category Name" value={group.category} onChange={(v: string) => updateArrayItem('skillGroups', idx, { category: v })} className="mb-2" />
                        <TagInput
                            label="Skills"
                            tags={group.items}
                            onChange={(tags) => updateArrayItem('skillGroups', idx, { items: tags })}
                        />
                    </div>
                ))}
            </Section>

            <Section title="Achievements" onAdd={() => addArrayItem<Achievement>('achievements', { title: '', description: '' })}>
                {(data.achievements || []).map((ach, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded border relative">
                        <RemoveButton onClick={() => removeArrayItem('achievements', idx)} />
                        <Input label="Title" value={ach.title} onChange={(v: string) => updateArrayItem('achievements', idx, { title: v })} />
                        <div className="mt-2">
                            <Label>Description</Label>
                            <textarea
                                className="w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                                rows={2}
                                value={ach.description}
                                onChange={e => updateArrayItem('achievements', idx, { description: e.target.value })}
                            />
                        </div>
                    </div>
                ))}
            </Section>

            <Section title="Languages" onAdd={() => addArrayItem<Language>('languages', { language: '', proficiency: '' })}>
                {(data.languages || []).map((lang, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded border relative flex gap-2">
                        <RemoveButton onClick={() => removeArrayItem('languages', idx)} />
                        <div className="flex-1">
                            <Input label="Language" value={lang.language} onChange={(v: string) => updateArrayItem('languages', idx, { language: v })} />
                        </div>
                        <div className="flex-1">
                            <Input label="Proficiency" value={lang.proficiency} onChange={(v: string) => updateArrayItem('languages', idx, { proficiency: v })} placeholder="Native, Fluent..." />
                        </div>
                    </div>
                ))}
            </Section>

            <Section title="Education" onAdd={() => addArrayItem<Education>('education', { degree: '', institution: '' })}>
                {data.education.map((edu, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded border relative">
                        <RemoveButton onClick={() => removeArrayItem('education', idx)} />
                        <Input label="Degree" value={edu.degree} onChange={(v: string) => updateArrayItem('education', idx, { degree: v })} />
                        <Input label="Institution" value={edu.institution} onChange={(v: string) => updateArrayItem('education', idx, { institution: v })} />
                        <Input label="Graduation Date" value={edu.graduationDate} onChange={(v: string) => updateArrayItem('education', idx, { graduationDate: v })} />
                    </div>
                ))}
            </Section>

            <Section title="Certificates" onAdd={() => addArrayItem<Certificate>('certificates', { name: '', issuer: '', date: '' })}>
                {data.certificates?.map((cert, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded border relative">
                        <RemoveButton onClick={() => removeArrayItem('certificates', idx)} />
                        <Input label="Certificate Name" value={cert.name} onChange={(v: string) => updateArrayItem('certificates', idx, { name: v })} />
                        <Input label="Issuer" value={cert.issuer} onChange={(v: string) => updateArrayItem('certificates', idx, { issuer: v })} />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <Input label="Date" value={cert.date} onChange={(v: string) => updateArrayItem('certificates', idx, { date: v })} placeholder="MM/YYYY" />
                            <Input label="Link (Optional)" value={cert.link} onChange={(v: string) => updateArrayItem('certificates', idx, { link: v })} placeholder="https://..." />
                        </div>
                    </div>
                ))}
            </Section>

        </div>
    );
};

// UI Helpers
const Input = ({ label, value, onChange, placeholder, className }: { label: string, value?: string, onChange: (val: string) => void, placeholder?: string, className?: string }) => (
    <div className={className}>
        <Label>{label}</Label>
        <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

const TagInput = ({ label, tags, onChange }: { label: string, tags: string[], onChange: (tags: string[]) => void }) => {
    const [input, setInput] = useState('');

    const addTag = () => {
        if (input.trim()) {
            onChange([...tags, input.trim()]);
            setInput('');
        }
    };

    const removeTag = (idx: number) => {
        onChange(tags.filter((_, i) => i !== idx));
    };

    return (
        <div>
            <Label>{label}</Label>
            <div className="flex flex-wrap gap-2 mb-2 p-2 border rounded-md min-h-[40px] bg-white">
                {tags.map((tag, idx) => (
                    <span key={idx} className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded flex items-center">
                        {tag}
                        <button onClick={() => removeTag(idx)} className="ml-1 text-gray-500 hover:text-red-500 text-sm">×</button>
                    </span>
                ))}
                <input
                    type="text"
                    className="flex-1 min-w-[100px] outline-none text-sm bg-transparent"
                    placeholder={tags.length === 0 ? "Type & Enter..." : ""}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag();
                        }
                        if (e.key === 'Backspace' && !input && tags.length > 0) {
                            removeTag(tags.length - 1);
                        }
                    }}
                />
            </div>
        </div>
    );
};

const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">{children}</label>
);

const Section = ({ title, onAdd, children }: { title: string, onAdd: () => void, children: React.ReactNode }) => (
    <div>
        <div className="flex justify-between items-center mb-2 border-b pb-1">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button onClick={onAdd} className="text-sm bg-indigo-50 text-indigo-600 px-2 py-1 rounded hover:bg-indigo-100">+ Add</button>
        </div>
        <div className="space-y-3">{children}</div>
    </div>
);

const RemoveButton = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 z-10">
        ✕
    </button>
);
