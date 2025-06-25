import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Eye, Calendar, ArrowRight } from 'lucide-react';
import { JobSeeker } from '@/types/api';

const CandidatesTab = () => {
  const [candidates, setCandidates] = useState<JobSeeker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/job-seekers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched candidates:', data);
        setCandidates(data);
      } else {
        console.error('Failed to fetch candidates:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string = 'new') => {
    const styles = {
      new: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'new' },
      reviewing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'reviewing' },
      interview: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'interview' }
    };
    const style = styles[status as keyof typeof styles] || styles.new;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const getMatchColor = (match: number) => {
    if (match >= 90) return 'text-green-600';
    if (match >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName ? firstName.charAt(0).toUpperCase() : '';
    const last = lastName ? lastName.charAt(0).toUpperCase() : '';
    return first + last || 'JS';
  };

  const getRandomMatch = () => Math.floor(Math.random() * 40) + 60;
  const getRandomStatus = () => {
    const statuses = ['new', 'reviewing', 'interview'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  };

  const filteredCandidates = candidates.filter(candidate => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.toLowerCase();
    const location = (candidate.location || '').toLowerCase();
    const jobTypes = (candidate.preferredJobTypes || '').toLowerCase();
    
    return fullName.includes(searchLower) || 
           location.includes(searchLower) || 
           jobTypes.includes(searchLower);
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading candidates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Candidate Pipeline</h2>
          <p className="text-gray-600">Manage and review your job candidates</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search candidates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
        {filteredCandidates.map((candidate) => {
          const match = getRandomMatch();
          const status = getRandomStatus();
          const initials = getInitials(candidate.firstName, candidate.lastName);
          const fullName = `${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || 'Unknown Candidate';
          const skills = candidate.preferredJobTypes ? candidate.preferredJobTypes.split(',').slice(0, 4) : ['React', 'JavaScript'];
          
          return (
            <Card key={candidate.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      {initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{fullName}</h3>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getMatchColor(match)}`}>
                            {match}% Match
                          </span>
                          {getStatusBadge(status)}
                        </div>
                      </div>
                      {/* Jobseeker Type Badges and Info */}
                      <div className="flex items-center gap-2 mb-1">
                        {candidate.preferredJobTypes && candidate.preferredJobTypes.includes('Full-time') && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">Full-time</Badge>
                        )}
                        {candidate.preferredJobTypes && candidate.preferredJobTypes.includes('Part-time') && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">Part-time</Badge>
                        )}
                            {candidate.preferredJobTypes && candidate.preferredJobTypes.includes('Internship') && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">Internship</Badge>
                        )}
                          {!candidate.preferredJobTypes && (
                            <Badge variant="outline" className="text-xs">Job Seeker</Badge>
                          )}
                      </div>
                      {/* End Jobseeker Type Badges */}
                      <p className="text-gray-600 mb-1">{candidate.preferredJobTypes || 'Job Seeker'}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        {candidate.location || 'Location not specified'} 
                        {candidate.desiredSalary && ` • ${candidate.desiredSalary}`}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill.trim()}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Applied recently</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule Interview
                    </Button>
                    <Button size="sm" className="bg-black hover:bg-gray-800">
                      <ArrowRight className="h-4 w-4 mr-1" />
                      Move to Next Stage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCandidates.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No candidates found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CandidatesTab;
