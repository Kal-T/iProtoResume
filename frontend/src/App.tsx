import { useState } from 'react';
import { ResumeForm } from './components/ResumeForm';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { ATSScoreView } from './components/ATSScoreView';
import type { ResumeData, ATSScore } from './types';
import { useMutation, gql } from '@apollo/client';

const VALIDATE_RESUME = gql`
  mutation ValidateResume($input: ValidateResumeInput!) {
    validateResume(input: $input) {
      score
      feedback
      missingKeywords
    }
  }
`;

const TAILOR_RESUME = gql`
  mutation TailorResume($input: TailorResumeInput!) {
    tailorResume(input: $input) {
      tailoredResume {
        summary
        skills
      }
      coverLetter
    }
  }
`;

function App() {
  const [resume, setResume] = useState<ResumeData>({
    fullName: '',
    email: '',
    skills: [],
    experience: [],
    education: [],
  });
  const [jd, setJd] = useState('');
  const [atsResult, setAtsResult] = useState<ATSScore | null>(null);

  const [validateResume, { loading: validating }] = useMutation(VALIDATE_RESUME);
  const [tailorResume, { loading: tailoring, data: tailoredData }] = useMutation(TAILOR_RESUME);

  const handleAnalyze = async () => {
    try {
      const { data } = await validateResume({
        variables: {
          input: {
            resume: {
              ...resume,
              // Cleanup optional fields for GraphQL
              phone: resume.phone || null,
              summary: resume.summary || null,
            },
            jobDescription: jd,
          },
        },
      });
      setAtsResult(data.validateResume);
    } catch (err) {
      console.error(err);
      alert('Error validating resume. Check console.');
    }
  };

  const handleTailor = async () => {
    try {
      await tailorResume({
        variables: {
          input: {
            originalResume: resume,
            jobDescription: jd,
          },
        },
      });
    } catch (err) {
      console.error(err);
      alert('Error tailoring resume.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">iProtoResume 🚀</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <ResumeForm initialData={resume} onChange={setResume} />
            <JobDescriptionInput value={jd} onChange={setJd} />

            <div className="mt-6 flex gap-4">
              <button
                onClick={handleAnalyze}
                disabled={validating}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {validating ? 'Analyzing...' : 'Analyze Match'}
              </button>
              <button
                onClick={handleTailor}
                disabled={tailoring}
                className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {tailoring ? 'Tailor with AI' : '✨ Tailor Resume'}
              </button>
            </div>
          </div>

          <div>
            <ATSScoreView result={atsResult} />

            {tailoredData && (
              <div className="bg-white p-6 rounded-lg shadow-md mt-6 border-t-4 border-purple-500">
                <h2 className="text-xl font-bold mb-4">✨ Tailored Suggestion</h2>
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-700">New Summary:</h3>
                  <p className="text-gray-600 italic">{tailoredData.tailorResume.tailoredResume.summary}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">Recommended Skills:</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tailoredData.tailorResume.tailoredResume.skills.map((s: string, i: number) => (
                      <span key={i} className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
