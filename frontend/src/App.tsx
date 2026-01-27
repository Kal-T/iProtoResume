import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { ResumeForm } from './components/ResumeForm';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { ATSScoreView } from './components/ATSScoreView';
import { ResumePreview } from './components/ResumePreview';
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
  // Expanded DB state
  const [resume, setResume] = useState<ResumeData>({
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    website: '',
    themeColor: '#4b5563', // Gray default
    profileImage: '', // Base64 or URL
    skills: [],
    skillGroups: [{ category: 'Technical Skills', items: [] }],
    languages: [],
    experience: [],
    projects: [],
    certificates: [],
    education: [],
    achievements: [],
    summary: '',
  });
  const [jd, setJd] = useState('');
  const [atsResult, setAtsResult] = useState<ATSScore | null>(null);

  const [validateResume, { loading: validating }] = useMutation(VALIDATE_RESUME);
  const [tailorResume, { loading: tailoring, data: tailoredData }] = useMutation(TAILOR_RESUME);

  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `${resume.fullName || 'Resume'}_CV`,
  });

  // Helper to remove extra fields that GraphQL doesn't know about yet
  // The GraphQL ResumeInput only has: fullName, email, phone, summary, skills, experience, education
  const sanitizeResumeForBackend = (data: ResumeData) => {
    return {
      fullName: data.fullName,
      email: data.email,
      phone: data.phone || null,
      summary: data.summary || null,
      skills: data.skills, // AI still uses the flat list for now
      // Projects and Certificates are local-only for now until backend schema updates
      experience: data.experience.map(e => ({
        title: e.title,
        company: e.company,
        startDate: e.startDate || null,
        endDate: e.endDate || null,
        description: e.description || null
      })),
      education: data.education.map(e => ({
        degree: e.degree,
        institution: e.institution,
        graduationDate: e.graduationDate || null
      }))
    };
  };

  const handleAnalyze = async () => {
    try {
      const { data } = await validateResume({
        variables: {
          input: {
            resume: sanitizeResumeForBackend(resume),
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
            originalResume: sanitizeResumeForBackend(resume),
            jobDescription: jd,
          },
        },
      });
    } catch (err) {
      console.error(err);
      alert('Error tailoring resume.');
    }
  };

  // Merge tailored data into preview if available
  const previewData = tailoredData ? {
    ...resume,
    summary: tailoredData.tailorResume.tailoredResume.summary,
    skills: tailoredData.tailorResume.tailoredResume.skills,
    // Keep local fields that AI doesn't touch yet
    themeColor: resume.themeColor,
    profileImage: resume.profileImage,
    projects: resume.projects,
    skillGroups: resume.skillGroups,
    languages: resume.languages,
    achievements: resume.achievements
  } : resume;

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm z-10 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>iProtoResume</span>
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded">Beta</span>
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => handlePrint && handlePrint()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <span>Download PDF</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Panel: Editor */}
        <div className="w-1/2 overflow-y-auto border-r border-gray-200 bg-white p-6 scrollbar-thin">
          <div className="max-w-2xl mx-auto space-y-8">

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📝 Resume Details
              </h2>
              <ResumeForm initialData={resume} onChange={setResume} />
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                🎯 Job Target
              </h2>
              <JobDescriptionInput value={jd} onChange={setJd} />
            </section>

            <section className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleAnalyze}
                disabled={validating}
                className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 py-3 px-4 rounded-lg font-medium hover:bg-blue-100 transition disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {validating ? (
                  'Analyzing...'
                ) : (
                  <>
                    <span>Analyze Match</span>
                    <span className="text-xs bg-blue-200 px-1.5 py-0.5 rounded text-blue-800">Basic</span>
                  </>
                )}
              </button>
              <button
                onClick={handleTailor}
                disabled={tailoring}
                className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 shadow-sm flex justify-center items-center gap-2"
              >
                {tailoring ? (
                  'Tailoring...'
                ) : (
                  <>
                    <span>✨ Tailor with AI</span>
                  </>
                )}
              </button>
            </section>

            {/* Analysis Results */}
            {atsResult && (
              <section className="mt-6">
                <ATSScoreView result={atsResult} />
              </section>
            )}

          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="w-1/2 bg-gray-100 p-8 overflow-y-auto flex flex-col items-center justify-start scrollbar-thin">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">Live Preview</h2>

          {/* Resume Page Preview */}
          <div className="bg-white shadow-2xl origin-top transform transition-transform duration-200" style={{ transform: 'scale(0.85)' }}>
            <ResumePreview ref={componentRef} data={previewData} />
          </div>

          {tailoredData && (
            <div className="mt-8 w-full max-w-xl bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-purple-900 font-bold mb-2 text-sm uppercase">AI Suggestions Applied</h3>
              <p className="text-purple-700 text-sm mb-2">
                The resume preview above has been updated with the AI-tailored summary and skills.
              </p>
              <div className="text-xs text-purple-600">
                Summary used: <span className="italic">"{tailoredData.tailorResume.tailoredResume.summary.substring(0, 100)}..."</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;
