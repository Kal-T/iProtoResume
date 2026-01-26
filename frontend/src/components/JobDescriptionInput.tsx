import React from 'react';

interface Props {
    value: string;
    onChange: (value: string) => void;
}

export const JobDescriptionInput: React.FC<Props> = ({ value, onChange }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-bold mb-4">Job Description</h2>
            <textarea
                className="w-full h-40 p-3 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Paste the job description here..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
};
