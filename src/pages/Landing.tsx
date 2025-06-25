
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Users, User, Briefcase, Target, Star, ChevronRight, CheckCircle, TrendingUp, Award, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleJob } from '@/types/api';

const Landing = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<GoogleJob[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/google-jobs');
      if (response.ok) {
        const data = await response.json();
        // Get first 4 jobs for featured section
        setFeaturedJobs(data.slice(0, 4));
      }
    } catch (error) {
      console.error('Failed to fetch featured jobs:', error);
    }
  };

  const handleJobSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/google-jobs?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Start Your Job Search */}
            <header className="w-full bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
           {/* Logo and Site Name */}
           <div className="flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-blue-600" />             <span className="text-2xl font-bold text-blue-700">EnsarJob</span>
           </div>
           {/* Center Navigation */}
           <nav>
             <Link to="/google-jobs" className="text-lg font-medium text-black hover:text-blue-600 transition">
               Find Jobs
             </Link>
           </nav>
           {/* Auth Buttons */}
           <div className="flex gap-2">
             <Button
               variant="outline"
               className="border border-gray-300 text-black hover:bg-gray-100"
               asChild
             >
               <Link to="/login">Log In</Link>
             </Button>
             <Button
               className="bg-black text-white hover:bg-gray-800"
              asChild
             >
               <Link to="/register">Sign Up</Link>
             </Button>
           </div>
         </div>
       </header>
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find Your Dream Job Today
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Connect with top employers and discover opportunities that match your skills and aspirations.
          </p>
          
          {/* Job Search */}
          <form onSubmit={handleJobSearch} className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search jobs, companies, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 py-3 text-gray-900"
                />
              </div>
              <Button type="submit" size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                Search Jobs
              </Button>
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/google-jobs">Browse All Jobs</Link>
            </Button>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
              <Link to="/register">Start Your Career Journey</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Opportunities</h2>
            <p className="text-xl text-gray-600">
              Discover hand-picked job opportunities from top companies
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {featuredJobs.map((job) => {
              const companyName = job.companyName || 'Unknown Company';
              const jobTitle = job.title || 'Unknown Position';
              
              return (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {companyName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{jobTitle}</CardTitle>
                        <p className="text-gray-600">{companyName}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
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
                        {job.scheduleType === 'Full-time' && (
                          <Badge variant="outline">Remote</Badge>
                        )}
                      </div>
                      
                      {job.salary && (
                        <div className="text-lg font-semibold text-green-600">
                          ${job.salary.toLocaleString()}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {['JavaScript', 'React', 'Node.js'].slice(0, Math.floor(Math.random() * 3) + 1).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                        <Badge variant="outline" className="text-xs">+3 more</Badge>
                      </div>
                      
                      {job.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {job.description.substring(0, 100)}...
                        </p>
                      )}
                      
                      <Button className="w-full bg-gray-900 hover:bg-gray-800" asChild>
                        <Link to={`${job.id}`}>Apply Now</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );  
            })}
          </div>
          
          <div className="text-center">
            <Button size="lg" asChild>
              <Link to="/google-jobs">Explore All Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Personalized Job Recommendations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🤖 Personalized Job Recommendations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered matching system analyzes your skills and preferences to find the perfect job opportunities for you.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Smart Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Advanced algorithms match your skills with job requirements for highly relevant recommendations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Career Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Get suggestions for roles that align with your career progression and salary expectations.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Skill Development</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Discover opportunities that match your current skills while suggesting areas for growth.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">⚙️ How It Works</h2>
            <p className="text-xl text-gray-600">
              Get started in just a few simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Profile</h3>
              <p className="text-gray-600">Sign up and build your comprehensive professional profile</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Resume</h3>
              <p className="text-gray-600">Upload your resume for AI-powered job matching</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Matched</h3>
              <p className="text-gray-600">Receive personalized job recommendations based on your profile</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Apply & Succeed</h3>
              <p className="text-gray-600">Apply to jobs with one click and track your progress</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      {/* <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">🌟 Featured Opportunities</h2>
            <p className="text-xl text-gray-600">
              Explore trending job categories and top companies
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { title: "Software Engineering", count: "2,500+ jobs", icon: "💻" },
              { title: "Data Science", count: "1,200+ jobs", icon: "📊" },
              { title: "Product Management", count: "800+ jobs", icon: "🚀" },
              { title: "Digital Marketing", count: "1,500+ jobs", icon: "📱" },
              { title: "UI/UX Design", count: "900+ jobs", icon: "🎨" },
              { title: "Sales & Business", count: "2,000+ jobs", icon: "💼" }
            ].map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl mb-2">{category.icon}</div>
                      <h3 className="font-semibold text-lg">{category.title}</h3>
                      <p className="text-gray-600">{category.count}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button size="lg" asChild>
              <Link to="/jobs">Explore All Categories</Link>
            </Button>
          </div>
        </div>
      </section> */}

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose JobPortal?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Search className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Smart Job Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Our AI-powered system matches your skills with the perfect job opportunities for maximum relevance.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Top Employers</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Connect with leading companies across various industries looking for talent like you.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Resume Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Get your resume analyzed and optimized to increase your chances of getting hired.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ready to Transform Your Career */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">🚀 Ready to Transform Your Career?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of job seekers who found their perfect match and took the next step in their career journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <div className="flex items-center text-lg">
              <CheckCircle className="h-6 w-6 mr-2 text-green-300" />
              Free to join
            </div>
            <div className="flex items-center text-lg">
              <CheckCircle className="h-6 w-6 mr-2 text-green-300" />
              Instant job matches
            </div>
            <div className="flex items-center text-lg">
              <CheckCircle className="h-6 w-6 mr-2 text-green-300" />
              Career support
            </div>
          </div>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" asChild>
            <Link to="/register">Create Your Account Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">JobPortal</h3>
              <p className="text-gray-400">
                Your gateway to finding the perfect career opportunity.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/google-jobs" className="hover:text-white">Browse Jobs</Link></li>
                <li><Link to="/register" className="hover:text-white">Create Account</Link></li>
                <li><Link to="/dashboard" className="hover:text-white">Career Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/post-job" className="hover:text-white">Post Jobs</Link></li>
                <li><Link to="/employer-dashboard" className="hover:text-white">Employer Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 JobPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;