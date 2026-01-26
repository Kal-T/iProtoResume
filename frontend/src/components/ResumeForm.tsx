import React, { useState } from 'react';
import type { ResumeData } from '../types';

interface Props {
    initialData: ResumeData;
    onChange: (data: ResumeData) => void;
}

export const ResumeForm: React.FC<Props> = ({ initialData, onChange }) => {
    const [data, setData] = useState<ResumeData>(initialData);
    const [skillInput, setSkillInput] = useState('');

    const handleChange = (field: keyof ResumeData, value: any) => {
        const newData = { ...data, [field]: value };
        setData(newData);
        onChange(newData);
    };

    const handleAddSkill = () => {
        if (skillInput.trim()) {
            const newSkills = [...data.skills, skillInput.trim()];
            handleChange('skills', newSkills);
            setSkillInput('');
        }
    };

    const removeSkill = (index: number) => {
        const newSkills = data.skills.filter((_, i) => i !== index);
        handleChange('skills', newSkills);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Your Resume</h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={data.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={data.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <button
                        onClick={handleAddSkill}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {data.skills.map((skill, idx) => (
                        <span key={idx} className="bg-indigo-100 text-indigo-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded flex items-center">
                            {skill}
                            <button onClick={() => removeSkill(idx)} className="ml-1 text-indigo-600 hover:text-indigo-900">×</button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Simplified Experience for MVP */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Experience (Latest Role)</label>
                <input
                    type="text"
                    placeholder="Job Title"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border mb-2"
                    onChange={(e) => {
                        const exp = [...data.experience];
                        if (exp.length === 0) exp.push({ title: '', company: '', description: '' });
                        exp[0].title = e.target.value;
                        handleChange('experience', exp);
                    }}
                />
                <textarea
                    placeholder="Description"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                    rows={3}
                    onChange={(e) => {
                        const exp = [...data.experience];
                        if (exp.length === 0) exp.push({ title: '', company: '', description: '' });
                        exp[0].description = e.target.value;
                        handleChange('experience', exp);
                    }}
                />
            </div>
        </div>
    );
};
