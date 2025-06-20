const BASE_URL = 'http://localhost:8080/api';

export interface SkillMatch {
  skill: string;
  matched: boolean;
  confidence?: number;
}

export interface ResumeSkillAnalysis {
  extractedSkills: string[];
  matchedSkills: SkillMatch[];
  matchPercentage: number;
  totalRequiredSkills: number;
  totalMatchedSkills: number;
}

// Predefined list of common job skills for demo purposes
const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Node.js',
  'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
  'HTML', 'CSS', 'SCSS', 'Tailwind CSS', 'Bootstrap',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
  'Git', 'GitHub', 'GitLab', 'Jenkins', 'CI/CD',
  'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum',
  'Project Management', 'Leadership', 'Communication',
  'Problem Solving', 'Analytical Thinking', 'Team Work'
];

export const skillExtractionService = {
  // Extract skills from resume text using simple keyword matching
  extractSkillsFromText: (resumeText: string): string[] => {
    const extractedSkills: string[] = [];
    const textLower = resumeText.toLowerCase();
    
    COMMON_SKILLS.forEach(skill => {
      if (textLower.includes(skill.toLowerCase())) {
        extractedSkills.push(skill);
      }
    });
    
    return [...new Set(extractedSkills)]; // Remove duplicates
  },

  // Calculate skill match percentage against job requirements
  calculateSkillMatch: (
    extractedSkills: string[], 
    requiredSkills: string[]
  ): ResumeSkillAnalysis => {
    const matchedSkills: SkillMatch[] = [];
    let matchedCount = 0;

    requiredSkills.forEach(requiredSkill => {
      const isMatched = extractedSkills.some(
        extractedSkill => 
          extractedSkill.toLowerCase() === requiredSkill.toLowerCase()
      );
      
      matchedSkills.push({
        skill: requiredSkill,
        matched: isMatched,
        confidence: isMatched ? 1 : 0
      });

      if (isMatched) matchedCount++;
    });

    const matchPercentage = requiredSkills.length > 0 
      ? Math.round((matchedCount / requiredSkills.length) * 100)
      : 0;

    return {
      extractedSkills,
      matchedSkills,
      matchPercentage,
      totalRequiredSkills: requiredSkills.length,
      totalMatchedSkills: matchedCount
    };
  },

  // Process uploaded resume file
  processResumeFile: async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const text = event.target?.result as string;
        // In a real implementation, you would use a proper PDF/DOCX parser
        // For demo purposes, we'll simulate text extraction
        const mockExtractedText = `
          John Doe
          Software Developer
          
          Skills: JavaScript, TypeScript, React, Node.js, Python, SQL, Git, AWS
          
          Experience:
          - Frontend Developer at TechCorp (2020-2023)
          - Built responsive web applications using React and TypeScript
          - Implemented REST APIs with Node.js
          - Worked with AWS services for deployment
          
          Education:
          - Bachelor's in Computer Science
          - Relevant coursework: Data Structures, Algorithms, Database Systems
        `;
        
        resolve(mockExtractedText);
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // For demo purposes, we'll use readAsText
      // In production, you'd need proper PDF/DOCX parsing libraries
      reader.readAsText(file);
    });
  }
};