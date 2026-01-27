import React, { useState } from 'react';
import type { ResumeData } from '../types';
import { gql, useMutation } from '@apollo/client';

const SAVE_RESUME = gql`
  mutation SaveResume($input: SaveResumeInput!) {
    saveResume(input: $input) {
      id
      version
      tags
      createdAt
    }
  }
`;

interface SaveResumeDialogProps {
    resume: ResumeData;
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
}

export const SaveResumeDialog: React.FC<SaveResumeDialogProps> = ({ resume, isOpen, onClose, onSaved }) => {
    const [tags, setTags] = useState('');
    const [version, setVersion] = useState('1.0');
    const [saveResume, { loading, error }] = useMutation(SAVE_RESUME);

    if (!isOpen) return null;

    const handleSave = async () => {
        try {
            // Remove local-only fields if necessary, or backend handles it.
            // Ideally sanitize resume data (remove undefined)

            const tagList = tags.split(',').map(t => t.trim()).filter(t => t);

            await saveResume({
                variables: {
                    input: {
                        resume: {
                            fullName: resume.fullName,
                            email: resume.email,
                            phone: resume.phone,
                            summary: resume.summary,
                            skills: resume.skills,
                            experience: resume.experience.map(e => ({
                                title: e.title,
                                company: e.company,
                                startDate: e.startDate,
                                endDate: e.endDate,
                                description: e.description
                            })),
                            education: resume.education.map(e => ({
                                degree: e.degree,
                                institution: e.institution,
                                graduationDate: e.graduationDate
                            })),
                            projects: (resume.projects || []).map(p => ({
                                title: p.title,
                                description: p.description,
                                techStack: p.techStack,
                                date: p.date,
                                location: p.location
                            })),
                            certificates: (resume.certificates || []).map(c => ({
                                name: c.name,
                                issuer: c.issuer,
                                date: c.date,
                                link: c.link
                            })),
                            // Additional profile fields
                            jobTitle: resume.jobTitle,
                            location: resume.location,
                            linkedin: resume.linkedin,
                            github: resume.github,
                            website: resume.website,
                            profileImage: resume.profileImage,
                            // Structured data
                            skillGroups: (resume.skillGroups || []).map(sg => ({
                                category: sg.category,
                                items: sg.items
                            })),
                            languages: (resume.languages || []).map(l => ({
                                language: l.language,
                                proficiency: l.proficiency
                            })),
                            achievements: (resume.achievements || []).map(a => ({
                                title: a.title,
                                description: a.description
                            }))
                        },
                        tags: tagList,
                        version: version
                    }
                }
            });
            onSaved();
            onClose();
        } catch (err) {
            console.error("Failed to save resume:", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h2 className="text-xl font-bold mb-4">Save Resume</h2>

                {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error.message}</div>}

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Version Name</label>
                    <input
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="e.g. 1.0, DevOps-v1"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="e.g. DevOps, Senior, Draft"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};
