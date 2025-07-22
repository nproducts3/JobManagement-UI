import React, { useEffect, useState } from 'react';
import { SuggestionCard, Suggestion } from '@/components/JobSuggestions';

interface JobMatch {
  jobId: string;
  jobTitle: string;
  companyName: string;
  aiSuggestions: string;
  matchPercentage: number;
  // ...other fields
}

const JobSuggestionsPage: React.FC = () => {
  const [jobSuggestions, setJobSuggestions] = useState<Record<string, { jobTitle: string; companyName: string; suggestions: Suggestion[] }>>({});

  useEffect(() => {
    const jobMatchesStored = localStorage.getItem('resumeJobMatches');
    if (jobMatchesStored) {
      try {
        const jobMatches: JobMatch[] = JSON.parse(jobMatchesStored);
        const suggestionsByJob: Record<string, { jobTitle: string; companyName: string; suggestions: Suggestion[] }> = {};
        jobMatches.forEach((jm) => {
          // Example: parse aiSuggestions into Suggestion objects (customize as needed)
          if (jm.aiSuggestions && jm.aiSuggestions.trim() !== '') {
            suggestionsByJob[jm.jobId] = {
              jobTitle: jm.jobTitle,
              companyName: jm.companyName,
              suggestions: jm.aiSuggestions.split(/\n\n|\n/).filter(s => s.trim() !== '').map((desc, idx) => ({
                title: `Suggestion ${idx + 1}`,
                points: 10,
                description: desc,
                autofix: 'Auto-fix this suggestion',
                color: ['blue', 'green', 'orange', 'purple', 'indigo'][idx % 5],
              })),
            };
          }
        });
        setJobSuggestions(suggestionsByJob);
      } catch {
        // ignore
      }
    }
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">All Smart AI Suggestions</h1>
      {Object.entries(jobSuggestions).length === 0 && (
        <div className="text-gray-500">No suggestions found.</div>
      )}
      {Object.entries(jobSuggestions).map(([jobId, { jobTitle, companyName, suggestions }]) => (
        <div key={jobId} className="mb-8">
          <div className="mb-2 text-lg font-semibold">
            {jobTitle} <span className="text-gray-500 font-normal">at {companyName}</span>
          </div>
          {suggestions.map((sugg, idx) => (
            <SuggestionCard key={idx} suggestion={sugg} onAutoFix={() => {}} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default JobSuggestionsPage; 