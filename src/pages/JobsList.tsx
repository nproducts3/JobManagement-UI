
// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Slider } from '@/components/ui/slider';
// import { Search, MapPin, Clock, Star, Bookmark, Filter as FilterIcon } from 'lucide-react';
// import { GoogleJob } from '@/types/api';

// const JobsList = () => {
//   const [jobs, setJobs] = useState<GoogleJob[]>([]);
//   const [filteredJobs, setFilteredJobs] = useState<GoogleJob[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [sortBy, setSortBy] = useState('relevance');
//   const [salaryRange, setSalaryRange] = useState([0]);
//   const navigate = useNavigate();

//   // Filter states
//   const [jobTypeFilters, setJobTypeFilters] = useState({
//     fullTime: false,
//     partTime: false,
//     contract: false,
//     internship: false
//   });

//   const [experienceFilters, setExperienceFilters] = useState({
//     entryLevel: false,
//     midLevel: false,
//     seniorLevel: false,
//     executive: false
//   });

//   const [remoteFilters, setRemoteFilters] = useState({
//     remote: false,
//     hybrid: false,
//     onsite: false
//   });

//   const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

//   useEffect(() => {
//     fetchJobs();
//   }, []);

//   useEffect(() => {
//     applyFilters();
//   }, [searchTerm, jobs, jobTypeFilters, experienceFilters, remoteFilters, selectedSkills, salaryRange]);

//   const fetchJobs = async () => {
//     try {
//       const response = await fetch('http://localhost:8080/api/google-jobs');
//       if (response.ok) {
//         const data = await response.json();
//         console.log('Fetched jobs:', data);
//         setJobs(data);
//         setFilteredJobs(data);
//       }
//     } catch (error) {
//       console.error('Failed to fetch jobs:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const applyFilters = () => {
//     let filtered = [...jobs];

//     // Search filter
//     if (searchTerm) {
//       filtered = filtered.filter(
//         job =>
//           (job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
//           (job.companyName && job.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
//           (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
//       );
//     }

//     // Job type filters
//     const activeJobTypes = Object.entries(jobTypeFilters)
//       .filter(([_, active]) => active)
//       .map(([type, _]) => type);

//     if (activeJobTypes.length > 0) {
//       filtered = filtered.filter(job => {
//         const jobType = job.scheduleType?.toLowerCase() || '';
//         return activeJobTypes.some(type => {
//           switch (type) {
//             case 'fullTime':
//               return jobType.includes('full-time') || jobType.includes('full time');
//             case 'partTime':
//               return jobType.includes('part-time') || jobType.includes('part time');
//             case 'contract':
//               return jobType.includes('contract');
//             case 'internship':
//               return jobType.includes('internship');
//             default:
//               return false;
//           }
//         });
//       });
//     }

//     // Experience level filters
//     const activeExperienceLevels = Object.entries(experienceFilters)
//       .filter(([_, active]) => active)
//       .map(([level, _]) => level);

//     if (activeExperienceLevels.length > 0) {
//       filtered = filtered.filter(job => {
//         const jobTitle = job.title?.toLowerCase() || '';
//         return activeExperienceLevels.some(level => {
//           switch (level) {
//             case 'entryLevel':
//               return jobTitle.includes('junior') || jobTitle.includes('entry') || jobTitle.includes('associate');
//             case 'midLevel':
//               return jobTitle.includes('mid') || (!jobTitle.includes('senior') && !jobTitle.includes('junior') && !jobTitle.includes('entry'));
//             case 'seniorLevel':
//               return jobTitle.includes('senior') || jobTitle.includes('lead');
//             case 'executive':
//               return jobTitle.includes('manager') || jobTitle.includes('director') || jobTitle.includes('vp') || jobTitle.includes('cto') || jobTitle.includes('ceo');
//             default:
//               return false;
//           }
//         });
//       });
//     }

//     // Remote filters
//     const activeRemoteOptions = Object.entries(remoteFilters)
//       .filter(([_, active]) => active)
//       .map(([option, _]) => option);

//     if (activeRemoteOptions.length > 0) {
//       filtered = filtered.filter(job => {
//         const location = job.location?.toLowerCase() || '';
//         const description = job.description?.toLowerCase() || '';
        
//         return activeRemoteOptions.some(option => {
//           switch (option) {
//             case 'remote':
//               return location.includes('remote') || description.includes('remote');
//             case 'hybrid':
//               return location.includes('hybrid') || description.includes('hybrid');
//             case 'onsite':
//               return !location.includes('remote') && !location.includes('hybrid');
//             default:
//               return false;
//           }
//         });
//       });
//     }

//     // Salary filter
//     if (salaryRange[0] > 0) {
//       filtered = filtered.filter(job => {
//         if (!job.salary) return true;
//         const salaryNum = parseInt(job.salary.replace(/[^0-9]/g, '')) || 0;
//         return salaryNum >= salaryRange[0];
//       });
//     }

//     // Skills filter
//     if (selectedSkills.length > 0) {
//       filtered = filtered.filter(job => {
//         const description = job.description?.toLowerCase() || '';
//         const title = job.title?.toLowerCase() || '';
//         return selectedSkills.some(skill => 
//           description.includes(skill.toLowerCase()) || title.includes(skill.toLowerCase())
//         );
//       });
//     }

//     setFilteredJobs(filtered);
//   };

//   const handleApplyNow = (jobId: string, e: React.MouseEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     navigate(`/jobs/${jobId}`);
//   };

//   const getMatchPercentage = () => {
//     return Math.floor(Math.random() * 40) + 60; // Random percentage between 60-100 for demo
//   };

//   const resetFilters = () => {
//     setJobTypeFilters({ fullTime: false, partTime: false, contract: false, internship: false });
//     setExperienceFilters({ entryLevel: false, midLevel: false, seniorLevel: false, executive: false });
//     setRemoteFilters({ remote: false, hybrid: false, onsite: false });
//     setSelectedSkills([]);
//     setSalaryRange([0]);
//     setSearchTerm('');
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-lg">Loading jobs...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex gap-8">
//         {/* Sidebar Filters */}
//         <div className="w-80 flex-shrink-0">
//           <Card>
//             <CardHeader className="pb-4">
//               <div className="flex items-center justify-between">
//                 <CardTitle className="text-lg flex items-center gap-2">
//                   <FilterIcon className="h-5 w-5" />
//                   Filters
//                 </CardTitle>
//                 <Button variant="ghost" size="sm" onClick={resetFilters}>
//                   Reset
//                 </Button>
//               </div>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               {/* Job Type */}
//               <div>
//                 <h3 className="font-medium mb-3 flex items-center gap-2">
//                   <Clock className="h-4 w-4" />
//                   Job Type
//                 </h3>
//                 <div className="space-y-2">
//                   {Object.entries(jobTypeFilters).map(([key, checked]) => (
//                     <div key={key} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={key}
//                         checked={checked}
//                         onCheckedChange={(checked) =>
//                           setJobTypeFilters(prev => ({ ...prev, [key]: !!checked }))
//                         }
//                       />
//                       <label htmlFor={key} className="text-sm capitalize">
//                         {key.replace(/([A-Z])/g, ' $1').trim()}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Experience Level */}
//               <div>
//                 <h3 className="font-medium mb-3 flex items-center gap-2">
//                   <Clock className="h-4 w-4" />
//                   Experience Level
//                 </h3>
//                 <div className="space-y-2">
//                   {Object.entries(experienceFilters).map(([key, checked]) => (
//                     <div key={key} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={key}
//                         checked={checked}
//                         onCheckedChange={(checked) =>
//                           setExperienceFilters(prev => ({ ...prev, [key]: !!checked }))
//                         }
//                       />
//                       <label htmlFor={key} className="text-sm capitalize">
//                         {key.replace(/([A-Z])/g, ' $1').trim()}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Remote Options */}
//               <div>
//                 <h3 className="font-medium mb-3">Remote Options</h3>
//                 <div className="space-y-2">
//                   {Object.entries(remoteFilters).map(([key, checked]) => (
//                     <div key={key} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={key}
//                         checked={checked}
//                         onCheckedChange={(checked) =>
//                           setRemoteFilters(prev => ({ ...prev, [key]: !!checked }))
//                         }
//                       />
//                       <label htmlFor={key} className="text-sm capitalize">
//                         {key === 'onsite' ? 'On-site' : key}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Salary Range */}
//               <div>
//                 <h3 className="font-medium mb-3">Salary Range</h3>
//                 <div className="px-2">
//                   <Slider
//                     value={salaryRange}
//                     onValueChange={setSalaryRange}
//                     max={200000}
//                     step={10000}
//                     className="w-full"
//                   />
//                   <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
//                     <span>$0</span>
//                     <span>${salaryRange[0].toLocaleString()}</span>
//                     <span>$200k+</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Skills */}
//               <div>
//                 <h3 className="font-medium mb-3">Skills</h3>
//                 <div className="flex flex-wrap gap-2 mb-2">
//                   {['JavaScript', 'React', 'Python', 'AWS', 'Node.js', 'TypeScript'].map((skill) => (
//                     <Badge
//                       key={skill}
//                       variant={selectedSkills.includes(skill) ? "default" : "outline"}
//                       className="cursor-pointer"
//                       onClick={() => {
//                         setSelectedSkills(prev =>
//                           prev.includes(skill)
//                             ? prev.filter(s => s !== skill)
//                             : [...prev, skill]
//                         );
//                       }}
//                     >
//                       {skill}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Main Content */}
//         <div className="flex-1">
//           {/* Header */}
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold mb-2">
//               {filteredJobs.length} Jobs Found
//             </h1>
//             <p className="text-gray-600">Based on your search criteria</p>
//           </div>

//           {/* Search and Sort */}
//           <div className="flex gap-4 mb-6">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
//               <Input
//                 placeholder="Search job title, company, or location..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm">Sort by:</span>
//               <Select value={sortBy} onValueChange={setSortBy}>
//                 <SelectTrigger className="w-32">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="relevance">Relevance</SelectItem>
//                   <SelectItem value="date">Date</SelectItem>
//                   <SelectItem value="salary">Salary</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Jobs List */}
//           <div className="space-y-4">
//             {filteredJobs.map((job) => {
//               const matchPercentage = getMatchPercentage();
//               const companyName = job.companyName || 'Unknown Company';
//               const jobTitle = job.title || 'Unknown Position';
              
//               return (
//                 <Card key={job.id} className="hover:shadow-md transition-shadow">
//                   <CardContent className="p-6">
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <div className="flex items-start gap-4">
//                           <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
//                             <span className="text-lg font-semibold text-gray-600">
//                               {companyName.charAt(0).toUpperCase()}
//                             </span>
//                           </div>
                          
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-1">
//                               <Link 
//                                 to={`/jobs/${job.id}`}
//                                 className="text-xl font-semibold hover:text-blue-600 transition-colors"
//                               >
//                                 {jobTitle}
//                               </Link>
//                               <Bookmark className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
//                             </div>
                            
//                             <p className="text-gray-600 mb-2">{companyName}</p>
                            
//                             <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
//                               {job.location && (
//                                 <span className="flex items-center gap-1">
//                                   <MapPin className="h-4 w-4" />
//                                   {job.location}
//                                 </span>
//                               )}
//                               <span className="flex items-center gap-1">
//                                 <Clock className="h-4 w-4" />
//                                 {job.scheduleType || 'Full-time'}
//                               </span>
//                               {job.salary && (
//                                 <span className="font-medium">{job.salary}</span>
//                               )}
//                             </div>

//                             {/* Skills/Tags */}
//                             <div className="flex flex-wrap gap-2 mb-4">
//                               {job.scheduleType === 'Full-time' && (
//                                 <Badge variant="secondary">Remote</Badge>
//                               )}
//                               {['JavaScript', 'React', 'Node.js', 'TypeScript'].slice(0, Math.floor(Math.random() * 4) + 1).map((skill, index) => (
//                                 <Badge key={index} variant="outline">{skill}</Badge>
//                               ))}
//                               <Badge variant="outline">+2 more</Badge>
//                             </div>

//                             {job.description && (
//                               <p className="text-gray-600 text-sm line-clamp-2 mb-4">
//                                 {job.description.substring(0, 150)}...
//                               </p>
//                             )}

//                             <div className="flex items-center gap-2 text-sm text-gray-500">
//                               <span>Posted {job.postedAt || '1 months ago'}</span>
//                               <span>•</span>
//                               <span>Via {job.via || 'LinkedIn'}</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="flex flex-col items-end gap-3 ml-4">
//                         <div className="flex items-center gap-2">
//                           <div className="flex items-center">
//                             {[...Array(5)].map((_, i) => (
//                               <Star
//                                 key={i}
//                                 className={`h-4 w-4 ${
//                                   i < Math.floor(matchPercentage / 20) 
//                                     ? 'fill-yellow-400 text-yellow-400' 
//                                     : 'text-gray-300'
//                                 }`}
//                               />
//                             ))}
//                           </div>
//                           <span className="text-sm font-medium">{matchPercentage}% Match</span>
//                         </div>
                        
//                         <Button 
//                           className="bg-blue-600 hover:bg-blue-700"
//                           onClick={(e) => handleApplyNow(job.id, e)}
//                         >
//                           Apply
//                         </Button>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               );
//             })}
//           </div>

//           {filteredJobs.length === 0 && !isLoading && (
//             <div className="text-center py-12">
//               <p className="text-gray-500 text-lg">No jobs found matching your search.</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default JobsList;



import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Clock, Star, Bookmark, Filter as FilterIcon } from 'lucide-react';
import { GoogleJob } from '@/types/api';

const JobsList = () => {
  const [jobs, setJobs] = useState<GoogleJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<GoogleJob[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [salaryRange, setSalaryRange] = useState([0]);
  const navigate = useNavigate();

  // Filter states
  const [jobTypeFilters, setJobTypeFilters] = useState({
    fullTime: false,
    partTime: false,
    contract: false,
    internship: false
  });

  const [experienceFilters, setExperienceFilters] = useState({
    entryLevel: false,
    midLevel: false,
    seniorLevel: false,
    executive: false
  });

  const [remoteFilters, setRemoteFilters] = useState({
    remote: false,
    hybrid: false,
    onsite: false
  });

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, jobs, jobTypeFilters, experienceFilters, remoteFilters, selectedSkills, salaryRange]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/google-jobs');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched jobs:', data);
        setJobs(data);
        setFilteredJobs(data);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        job =>
          (job.title && job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (job.companyName && job.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Job type filters
    const activeJobTypes = Object.entries(jobTypeFilters)
      .filter(([_, active]) => active)
      .map(([type, _]) => type);

    if (activeJobTypes.length > 0) {
      filtered = filtered.filter(job => {
        const jobType = job.scheduleType?.toLowerCase() || '';
        return activeJobTypes.some(type => {
          switch (type) {
            case 'fullTime':
              return jobType.includes('full-time') || jobType.includes('full time');
            case 'partTime':
              return jobType.includes('part-time') || jobType.includes('part time');
            case 'contract':
              return jobType.includes('contract');
            case 'internship':
              return jobType.includes('internship');
            default:
              return false;
          }
        });
      });
    }

    // Experience level filters
    const activeExperienceLevels = Object.entries(experienceFilters)
      .filter(([_, active]) => active)
      .map(([level, _]) => level);

    if (activeExperienceLevels.length > 0) {
      filtered = filtered.filter(job => {
        const jobTitle = job.title?.toLowerCase() || '';
        return activeExperienceLevels.some(level => {
          switch (level) {
            case 'entryLevel':
              return jobTitle.includes('junior') || jobTitle.includes('entry') || jobTitle.includes('associate');
            case 'midLevel':
              return jobTitle.includes('mid') || (!jobTitle.includes('senior') && !jobTitle.includes('junior') && !jobTitle.includes('entry'));
            case 'seniorLevel':
              return jobTitle.includes('senior') || jobTitle.includes('lead');
            case 'executive':
              return jobTitle.includes('manager') || jobTitle.includes('director') || jobTitle.includes('vp') || jobTitle.includes('cto') || jobTitle.includes('ceo');
            default:
              return false;
          }
        });
      });
    }

    // Remote filters
    const activeRemoteOptions = Object.entries(remoteFilters)
      .filter(([_, active]) => active)
      .map(([option, _]) => option);

    if (activeRemoteOptions.length > 0) {
      filtered = filtered.filter(job => {
        const location = job.location?.toLowerCase() || '';
        const description = job.description?.toLowerCase() || '';
        
        return activeRemoteOptions.some(option => {
          switch (option) {
            case 'remote':
              return location.includes('remote') || description.includes('remote');
            case 'hybrid':
              return location.includes('hybrid') || description.includes('hybrid');
            case 'onsite':
              return !location.includes('remote') && !location.includes('hybrid');
            default:
              return false;
          }
        });
      });
    }

    // Salary filter
    if (salaryRange[0] > 0) {
      filtered = filtered.filter(job => {
        if (!job.salary) return true;
        const salaryNum = parseInt(job.salary.replace(/[^0-9]/g, '')) || 0;
        return salaryNum >= salaryRange[0];
      });
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      filtered = filtered.filter(job => {
        const description = job.description?.toLowerCase() || '';
        const title = job.title?.toLowerCase() || '';
        return selectedSkills.some(skill => 
          description.includes(skill.toLowerCase()) || title.includes(skill.toLowerCase())
        );
      });
    }

    setFilteredJobs(filtered);
  };

  const handleApplyNow = (jobId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/jobs/${jobId}`);
  };

  const getMatchPercentage = () => {
    return Math.floor(Math.random() * 40) + 60; // Random percentage between 60-100 for demo
  };

  const resetFilters = () => {
    setJobTypeFilters({ fullTime: false, partTime: false, contract: false, internship: false });
    setExperienceFilters({ entryLevel: false, midLevel: false, seniorLevel: false, executive: false });
    setRemoteFilters({ remote: false, hybrid: false, onsite: false });
    setSelectedSkills([]);
    setSalaryRange([0]);
    setSearchTerm('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <div className="w-80 flex-shrink-0">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FilterIcon className="h-5 w-5" />
                  Filters
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Job Type */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Job Type
                </h3>
                <div className="space-y-2">
                  {Object.entries(jobTypeFilters).map(([key, checked]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setJobTypeFilters(prev => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <label htmlFor={key} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Experience Level
                </h3>
                <div className="space-y-2">
                  {Object.entries(experienceFilters).map(([key, checked]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setExperienceFilters(prev => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <label htmlFor={key} className="text-sm capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remote Options */}
              <div>
                <h3 className="font-medium mb-3">Remote Options</h3>
                <div className="space-y-2">
                  {Object.entries(remoteFilters).map(([key, checked]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={checked}
                        onCheckedChange={(checked) =>
                          setRemoteFilters(prev => ({ ...prev, [key]: !!checked }))
                        }
                      />
                      <label htmlFor={key} className="text-sm capitalize">
                        {key === 'onsite' ? 'On-site' : key}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <h3 className="font-medium mb-3">Salary Range</h3>
                <div className="px-2">
                  <Slider
                    value={salaryRange}
                    onValueChange={setSalaryRange}
                    max={200000}
                    step={10000}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
                    <span>$0</span>
                    <span>${salaryRange[0].toLocaleString()}</span>
                    <span>$200k+</span>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="font-medium mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {['JavaScript', 'React', 'Python', 'AWS', 'Node.js', 'TypeScript'].map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedSkills(prev =>
                          prev.includes(skill)
                            ? prev.filter(s => s !== skill)
                            : [...prev, skill]
                        );
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {filteredJobs.length} Jobs Found
            </h1>
            <p className="text-gray-600">Based on your search criteria</p>
          </div>

          {/* Search and Sort */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search job title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {filteredJobs.map((job) => {
              const matchPercentage = getMatchPercentage();
              const companyName = job.companyName || 'Unknown Company';
              const jobTitle = job.title || 'Unknown Position';
              
              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg font-semibold text-gray-600">
                              {companyName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Link 
                                to={`/jobs/${job.id}`}
                                className="text-xl font-semibold hover:text-blue-600 transition-colors"
                              >
                                {jobTitle}
                              </Link>
                              <Bookmark className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                            </div>
                            
                            <p className="text-gray-600 mb-2">{companyName}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              {job.location && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {job.location}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {job.scheduleType || 'Full-time'}
                              </span>
                              {job.salary && (
                                <span className="font-medium">{job.salary}</span>
                              )}
                            </div>

                            {/* Skills/Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.scheduleType === 'Full-time' && (
                                <Badge variant="secondary">Remote</Badge>
                              )}
                              {['JavaScript', 'React', 'Node.js', 'TypeScript'].slice(0, Math.floor(Math.random() * 4) + 1).map((skill, index) => (
                                <Badge key={index} variant="outline">{skill}</Badge>
                              ))}
                              <Badge variant="outline">+2 more</Badge>
                            </div>

                            {job.description && (
                              <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                                {job.description.substring(0, 150)}...
                              </p>
                            )}

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>Posted {job.postedAt || '1 months ago'}</span>
                              <span>•</span>
                              <span>Via {job.via || 'LinkedIn'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-3 ml-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(matchPercentage / 20) 
                                    ? 'fill-yellow-400 text-yellow-400' 
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium">{matchPercentage}% Match</span>
                        </div>
                        
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => handleApplyNow(job.id, e)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredJobs.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No jobs found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobsList;