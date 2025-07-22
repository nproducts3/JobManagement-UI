import React, { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

interface Suggestion {
  title: string;
  points: number;
  description: string;
  autofix: string;
  color: string;
}

interface ResumeOptimizationDashboardProps {
  open: boolean;
  onClose: () => void;
  score?: number;
  scoreLabel?: string;
  suggestionsFound?: number;
  completed?: number;
  remaining?: number;
  pointsGained?: number;
  suggestions?: Suggestion[];
}

const defaultSuggestions: Suggestion[] = [
  {
    title: "Add Key Technical Skills",
    points: 15,
    description: "Your resume is missing important skills like 'React', 'TypeScript', and 'Node.js' that are mentioned in the job description.",
    autofix: "Add React, TypeScript, Node.js to your skills section",
    color: "blue",
  },
  {
    title: "Include Job-Specific Keywords",
    points: 10,
    description: "Add keywords like 'Agile methodology', 'CI/CD', and 'cloud computing' to improve ATS compatibility.",
    autofix: "Insert relevant keywords throughout your experience section",
    color: "green",
  },
  {
    title: "Strengthen Professional Summary",
    points: 8,
    description: "Your summary could be more compelling. Consider highlighting your key achievements and years of experience.",
    autofix: "Rewrite summary to emphasize leadership and quantified achievements",
    color: "orange",
  },
  {
    title: "Improve Formatting Consistency",
    points: 5,
    description: "Some bullet points use different formatting. Consistent formatting improves readability.",
    autofix: "Standardize bullet point formatting and spacing",
    color: "purple",
  },
  {
    title: "Add Soft Skills",
    points: 7,
    description: "Include relevant soft skills like 'Team Leadership' and 'Project Management' mentioned in the job posting.",
    autofix: "Add leadership and project management skills to your competencies",
    color: "indigo",
  },
];

const parseSuggestions = (aiSuggestions: unknown): Suggestion[] => {
  if (typeof aiSuggestions !== 'string' || !aiSuggestions.trim()) return [];
  return aiSuggestions
    .split(/\n\n|\n/)
    .filter(s => s.trim() !== '')
    .map((desc, idx) => ({
      title: `Suggestion ${idx + 1}`,
      points: 10,
      description: desc,
      autofix: 'Auto-fix this suggestion',
      color: ['blue', 'green', 'orange', 'purple', 'indigo'][idx % 5],
    }));
};

export const ResumeOptimizationDashboard: React.FC<ResumeOptimizationDashboardProps> = ({
  open,
  onClose,
  score = 55,
  scoreLabel = "Needs Improvement",
  suggestionsFound = 5,
  completed = 0,
  remaining = 5,
  pointsGained = 0,
  suggestions = defaultSuggestions,
}) => {
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [resumeText, setResumeText] = useState<string>(
    "Nikitha Sharma - Data Analyst Resume\nEmail: nikitha.sharma@email.com\nPhone: +91-9876543210\nLocation: Hyderabad, India\nSummary\nDetail-oriented Data Analyst with 1 years of experience analyzing large datasets, generating actionable insights, and driving business performance through data-driven decision-making. Skilled in Tableau, and Python.\nWork Experience\nData Analyst\nTech Solutions Inc., Hyderabad\nJan 2022 – Present\n- Analyzed customer behavior and sales trends to improve product strategies, resulting in a 10% revenue increase.\n- Developed dashboards in Tableau to provide key metrics to leadership.\n- Automated reporting processes using Python, reducing manual effort by 30%.\nSkills\nTableau, Power BI, Python\nData Cleaning, Visualization, Statistical Analysis\nEducation\nBachelor of Technology in Computer Science, Osmania University, 2021\n"
  );
  const [improvedResume, setImprovedResume] = useState<string | null>(null);
  const [viewSuggestionIndex, setViewSuggestionIndex] = useState<number | null>(null);

  // Handler for auto-fix
  const handleAutoFix = async (suggestion: Suggestion, index: number) => {
    setLoadingIndex(index);
    try {
      const response = await fetch("http://localhost:8080/api/resume-analysis/auto-improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({
          action: "apply_suggestion",
          resumeText,
          googleJobId: "56e6f2d0-2f02-49e2-80d2-91e8c5587196",
          jobSeekerId: "b3e1c1e2-1234-4a5b-8c6d-12345678c001",
          suggestion: suggestion.description,
        }),
      });
      const data = await response.json();
      setImprovedResume(data.resumeText);
      // Optionally update suggestions, score, etc. here
    } catch (error) {
      alert("Failed to auto-fix: " + error);
    } finally {
      setLoadingIndex(null);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex gap-8 mb-8">
          <Card className="flex-1 p-6">
            <h2 className="text-lg font-semibold mb-2">Resume Optimization Score</h2>
            <div className="flex items-center gap-4">
              <Progress value={score} className="flex-1" />
              <span className="text-2xl font-bold text-red-500">{score}%</span>
            </div>
            <div className="text-sm text-gray-500 mt-2">{scoreLabel}</div>
          </Card>
          <Card className="w-64 p-6">
            <h2 className="text-lg font-semibold mb-2">Analysis Summary</h2>
            <div className="text-sm mb-1">Suggestions Found: <b>{suggestionsFound}</b></div>
            <div className="text-sm mb-1">Completed: <b>{completed}</b></div>
            <div className="text-sm mb-1">Remaining: <b>{remaining}</b></div>
            <div className="text-sm">Points Gained: <b>+{pointsGained}</b></div>
          </Card>
        </div>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Improvements Available <span className="text-gray-400">({suggestions.length})</span></h3>
          <div className="space-y-4">
            {suggestions.map((s, i) => (
              <Card key={i} className={`p-4 border-l-4 border-${s.color}-400`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {s.title} <span className="text-xs text-gray-500">+{s.points} points</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-2 px-2 py-0 text-xs"
                        onClick={() => setViewSuggestionIndex(i)}
                      >
                        View Suggestion
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600">{s.description}</div>
                    <div className="text-xs text-gray-400 mt-1">Auto-fix: {s.autofix}</div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleAutoFix(s, i)}
                    disabled={loadingIndex === i}
                  >
                    {loadingIndex === i ? "Applying..." : "Auto-fix"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>
        {improvedResume && (
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold mb-2">Improved Resume</h3>
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded">{improvedResume}</pre>
          </Card>
        )}
        {/* Suggestion Modal */}
        {viewSuggestionIndex !== null && suggestions[viewSuggestionIndex] && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                onClick={() => setViewSuggestionIndex(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-lg font-bold mb-2">Suggestion Details</h2>
              <div className="mb-2 font-semibold">{suggestions[viewSuggestionIndex].title}</div>
              <div className="mb-2 text-sm text-gray-700">{suggestions[viewSuggestionIndex].description}</div>
              <div className="mb-2 text-xs text-gray-500">Auto-fix: {suggestions[viewSuggestionIndex].autofix}</div>
              <div className="text-xs text-gray-400">Points: {suggestions[viewSuggestionIndex].points}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeOptimizationDashboard; 