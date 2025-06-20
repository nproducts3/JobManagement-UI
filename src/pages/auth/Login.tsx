import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { redirectPath } = await login(email, password);
      toast({
        title: "Success",
        description: "You have been logged in successfully.",
      });
      // Role-based redirect
      navigate(redirectPath);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
  };

  const handleGoogleSignIn = () => {
    toast({
      title: "Coming Soon",
      description: "Google Sign-In will be implemented with backend integration.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your email and password to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900">Demo Login Credentials</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Job Seeker</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDemoLogin('jobseeker@demo.com')}
                >
                  Use Demo
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Employer</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDemoLogin('employer@demo.com')}
                >
                  Use Demo
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Employee</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDemoLogin('employee@demo.com')}
                >
                  Use Demo
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Admin</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDemoLogin('admin@demo.com')}
                >
                  Use Demo
                </Button>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Password: demo123
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
            Sign in with Google
          </Button>

          <div className="text-center space-y-2">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot your password?
            </Link>
            <div className="text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
