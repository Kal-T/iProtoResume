import React, { useState } from 'react';
import type { ResumeData, SavedResume } from '../types';
import { gql, useQuery, useMutation } from '@apollo/client';

const LIST_RESUMES = gql`
  query ListResumes($filter: ListResumesFilter) {
    listResumes(filter: $filter) {
      id
      resume {
        fullName
        email
        phone
        summary
        skills
        experience {
          title
          company
          startDate
          endDate
          description
        }
        education {
          degree
          institution
          graduationDate
        }
        projects {
          title
          description
          techStack
          date
          location
        }
        certificates {
          name
          issuer
          date
          link
        }
        jobTitle
        location
        linkedin
        github
        website
        profileImage
        skillGroups {
          category
          items
        }
        languages {
          language
          proficiency
        }
        achievements {
          title
          description
        }
      }
      tags
      version
      createdAt
    }
  }
`;

const DELETE_RESUME = gql`
  mutation DeleteResume($id: ID!) {
    deleteResume(id: $id)
  }
`;

interface ResumeListDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (resume: ResumeData) => void;
}

export const ResumeListDialog: React.FC<ResumeListDialogProps> = ({ isOpen, onClose, onLoad }) => {
    const [tagFilter, setTagFilter] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const { data, loading, error, refetch } = useQuery(LIST_RESUMES, {
        variables: { filter: tagFilter ? { tags: [tagFilter] } : null },
        fetchPolicy: 'network-only'
    });
    const [deleteResume, { loading: deleting }] = useMutation(DELETE_RESUME, {
        onCompleted: () => {
            setDeleteConfirmId(null);
            refetch();
        },
        onError: (err) => {
            console.error('Failed to delete resume:', err);
            alert('Failed to delete resume: ' + err.message);
        }
    });

    if (!isOpen) return null;

    const handleLoad = (saved: SavedResume) => {
        const resumeToLoad: ResumeData = {
            ...saved.resume,
            // Ensure arrays are initialized if null
            experience: saved.resume.experience || [],
            education: saved.resume.education || [],
            projects: saved.resume.projects || [],
            certificates: saved.resume.certificates || [],
            // profileImage is now persisted

            themeColor: '#4b5563',
            templateId: 'modern'
        };
        onLoad(resumeToLoad);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">My Resumes</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <div className="mb-4 flex gap-2">
                    <input
                        type="text"
                        placeholder="Filter by tag..."
                        value={tagFilter}
                        onChange={(e) => setTagFilter(e.target.value)}
                        className="flex-1 p-2 border rounded"
                    />
                    <button onClick={() => refetch()} className="px-3 py-1 bg-gray-100 rounded">Refresh</button>
                </div>

                {loading && <div className="text-center py-4">Loading...</div>}
                {error && <div className="text-red-500 text-sm mb-4">Error: {error.message}</div>}

                <div className="flex-1 overflow-y-auto space-y-2">
                    {data?.listResumes?.map((item: SavedResume) => (
                        <div key={item.id} className="border p-3 rounded hover:bg-gray-50 flex justify-between items-center">
                            <div>
                                <div className="font-bold">{item.version}</div>
                                <div className="text-xs text-gray-500">
                                    {new Date(item.createdAt).toLocaleString()}
                                </div>
                                <div className="flex gap-1 mt-1">
                                    {item.tags.map(tag => (
                                        <span key={tag} className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded">{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleLoad(item)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                    Load
                                </button>
                                <button
                                    onClick={() => setDeleteConfirmId(item.id)}
                                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {data?.listResumes?.length === 0 && (
                        <div className="text-center text-gray-500 py-4">No resumes found.</div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                        <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
                        <p className="text-gray-700 mb-6">
                            Are you sure you want to delete this resume? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={deleting}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteResume({ variables: { id: deleteConfirmId } })}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
