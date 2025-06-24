
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, PieChart } from 'lucide-react';

const AnalyticsTab = () => {
  const applicationTrends = [
    { month: 'Jan', applications: 45 },
    { month: 'Feb', applications: 52 },
    { month: 'Mar', applications: 48 },
    { month: 'Apr', applications: 61 },
    { month: 'May', applications: 55 },
    { month: 'Jun', applications: 67 }
  ];

  const topPerformingJobs = [
    { title: 'Senior Software Engineer', department: 'Engineering', applications: 25 },
    { title: 'Marketing Manager', department: 'Engineering', applications: 23 },
    { title: 'UI/UX Designer', department: 'Engineering', applications: 10 }
  ];

  const candidateSources = [
    { source: 'LinkedIn', percentage: 35, color: 'bg-blue-500' },
    { source: 'Indeed', percentage: 28, color: 'bg-green-500' },
    { source: 'Company Website', percentage: 20, color: 'bg-purple-500' },
    { source: 'Referrals', percentage: 17, color: 'bg-orange-500' }
  ];

  const hiringFunnel = [
    { stage: 'Applications', count: 54, color: 'bg-blue-500' },
    { stage: 'Screening', count: 32, color: 'bg-green-500' },
    { stage: 'Interviews', count: 18, color: 'bg-yellow-500' },
    { stage: 'Offers', count: 6, color: 'bg-purple-500' },
    { stage: 'Hires', count: 4, color: 'bg-red-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Application Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Application Trends
            </CardTitle>
            <CardDescription>Applications received over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {applicationTrends.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-blue-500 w-full rounded-t transition-all duration-300 hover:bg-blue-600"
                    style={{ height: `${(item.applications / 70) * 200}px` }}
                  />
                  <span className="text-xs mt-2 text-gray-600">{item.month}</span>
                  <span className="text-xs font-medium">{item.applications}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 mt-4">Chart placeholder - Application trends over time</p>
          </CardContent>
        </Card>

        {/* Top Performing Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Jobs
            </CardTitle>
            <CardDescription>Jobs with highest application rates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingJobs.map((job, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-sm text-gray-600">{job.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{job.applications}</p>
                    <p className="text-sm text-gray-600">applications</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Candidate Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Candidate Sources
            </CardTitle>
            <CardDescription>Where candidates are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {candidateSources.map((source, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{source.source}</span>
                    <span className="text-sm text-gray-600">{source.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${source.color} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 mt-4">Chart placeholder - Candidate source breakdown</p>
          </CardContent>
        </Card>

        {/* Hiring Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Hiring Funnel
            </CardTitle>
            <CardDescription>Candidate progression through stages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hiringFunnel.map((stage, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                    <span className="font-medium">{stage.stage}</span>
                  </div>
                  <span className="font-bold">{stage.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;
