
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, X } from 'lucide-react';
import { skillsService, SkillData } from '@/services/skillsService';
import { JobSeekerSkill } from '@/types/api';

interface SkillsTabProps {
  jobSeekerId?: string;
  onNextTab?: () => void;
}

export const SkillsTab = ({ jobSeekerId, onNextTab }: SkillsTabProps) => {
  const [skills, setSkills] = useState<JobSeekerSkill[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (jobSeekerId) {
      fetchSkills();
    }
  }, [jobSeekerId]);

  const fetchSkills = async () => {
    try {
      const data: SkillData[] = await skillsService.getByJobSeekerId(jobSeekerId!);
      setSkills(data.map(s => ({
        id: s.id || '',
        jobSeekerId: s.jobSeekerId,
        skillName: s.skillName,
      })));
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      toast({
        title: "Error",
        description: "Failed to load skills. Please try again.",
        variant: "destructive",
      });
    }
  };

  const addSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim() || !jobSeekerId) return;

    setIsLoading(true);

    try {
      const skillData: SkillData = {
        jobSeekerId: jobSeekerId,
        skillName: newSkill.trim(),
      };
      const skill = await skillsService.create(skillData);
      setSkills(prev => [
        ...prev,
        { id: skill.id || '', jobSeekerId: skill.jobSeekerId, skillName: skill.skillName }
      ]);
      setNewSkill('');
      toast({
        title: "Success",
        description: "Skill added successfully.",
      });
      if (onNextTab) onNextTab();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add skill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeSkill = async (skillId: string) => {
    try {
      await skillsService.delete(skillId);
      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      toast({
        title: "Success",
        description: "Skill removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove skill. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Add your skills to help employers find you for relevant positions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Skill */}
        <form onSubmit={addSkill} className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="skillName" className="sr-only">Skill Name</Label>
            <Input
              id="skillName"
              placeholder="Enter a skill (e.g., JavaScript, Project Management)"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isLoading || !newSkill.trim()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </form>

        {/* Skills List */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Your Skills</h3>
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill.id} variant="secondary" className="text-sm px-3 py-1">
                  {skill.skillName}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-2 hover:bg-transparent"
                    onClick={() => removeSkill(skill.id!)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills added yet. Add your first skill above.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
