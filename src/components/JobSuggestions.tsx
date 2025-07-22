import React from 'react';
import { Button } from './ui/button';
import { Sparkles, Hash, Text, List, User } from 'lucide-react';

export interface Suggestion {
  title: string;
  points: number;
  description: string;
  autofix: string;
  color: string;
}

interface JobSuggestionsProps {
  jobId: string;
  suggestions: Suggestion[];
  isApplying?: boolean;
  onApply: (jobId: string, suggestion: Suggestion) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  blue: <Sparkles className="text-blue-400" />,
  green: <Hash className="text-green-400" />,
  orange: <Text className="text-orange-400" />,
  purple: <List className="text-purple-400" />,
  indigo: <User className="text-indigo-400" />,
};

const bgMap: Record<string, string> = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  orange: 'bg-orange-50 border-orange-200',
  purple: 'bg-purple-50 border-purple-200',
  indigo: 'bg-indigo-50 border-indigo-200',
};

export const SuggestionCard: React.FC<{ suggestion: Suggestion; onAutoFix: () => void; isApplying?: boolean }> = ({ suggestion, onAutoFix, isApplying }) => (
  <div
    className={`border rounded-lg p-4 mb-3 flex items-start gap-4 ${bgMap[suggestion.color]}`}
  >
    <div className="mt-1">{iconMap[suggestion.color] || <Sparkles className="text-gray-400" />}</div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold">{suggestion.title}</span>
        <span className="bg-white border rounded-full px-2 py-0.5 text-xs font-medium text-gray-600 ml-2">
          +{suggestion.points} points
        </span>
      </div>
      <div className="text-gray-700 text-sm mb-1">{suggestion.description}</div>
      <div className="text-xs text-gray-500">
        <span className="font-semibold">Auto-fix:</span> {suggestion.autofix}
      </div>
    </div>
    <Button
      size="sm"
      className="ml-2"
      disabled={isApplying}
      onClick={onAutoFix}
    >
      <Sparkles className="w-4 h-4 mr-1" /> {isApplying ? 'Applying...' : 'Auto-fix'}
    </Button>
  </div>
);

const JobSuggestions: React.FC<JobSuggestionsProps> = ({ jobId, suggestions, isApplying, onApply }) => {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <div>
      {suggestions.map((sugg, idx) => (
        <SuggestionCard
          key={idx}
          suggestion={sugg}
          isApplying={isApplying}
          onAutoFix={() => onApply(jobId, sugg)}
        />
      ))}
    </div>
  );
};

export default JobSuggestions; 