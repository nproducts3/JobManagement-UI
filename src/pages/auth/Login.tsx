import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, role, setToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Firebase login state
  const [showFirebaseForm, setShowFirebaseForm] = useState(false);
  const [firebaseEmail, setFirebaseEmail] = useState("");
  const [firebasePassword, setFirebasePassword] = useState("");
  const [firebaseToken, setFirebaseToken] = useState("");
  const [firebaseError, setFirebaseError] = useState("");

  const [googleError, setGoogleError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    setGoogleError("");
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Send the token to your backend
      const response = await fetch("http://localhost:8080/api/auth/firebase-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to authenticate with backend");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      setToken(data.token);
      // Store userId for AuthContext
      localStorage.setItem("userId", data.id);

      // Redirect to jobseeker dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setGoogleError(err.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFirebaseError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, firebaseEmail, firebasePassword);
      const idToken = await userCredential.user.getIdToken();
      setFirebaseToken(idToken);
    } catch (err: any) {
      setFirebaseError(err.message);
    }
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
                <span className="text-sm text-blue-700">Admin</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => { setEmail('bathalanikitha@gmail.com'); setPassword('Nikitha@123'); }}
                >
                  Use Demo
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Job Seeker</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => { setEmail('admin@ensarsolutions.com'); setPassword('Admin@123'); }}
                >
                  Use Demo
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Employer</span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => { setEmail('swaroop@ensarsolutions.com'); setPassword('Swaroop@123'); }}
                >
                  Use Demo
                </Button>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              Use the above email and password for each role
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

          {/* Google Login Option */}
          <div className="flex flex-col items-center mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full mb-2 flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 488 512"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <path fill="#4285F4" d="M488 261.8c0-17.8-1.6-35-4.6-51.6H249v97.8h134.2c-5.8 31.2-23.2 57.6-49.4 75.4v62h79.8c46.8-43.2 74-107 74-183.6z"/>
                  <path fill="#34A853" d="M249 492c66.6 0 122.6-22 163.4-59.8l-79.8-62c-22.2 15-50.6 23.8-83.6 23.8-64.2 0-118.6-43.2-138-101.2h-81v63.6C67.8 445.2 152.2 492 249 492z"/>
                  <path fill="#FBBC05" d="M111 292.8c-10.2-30-10.2-62.6 0-92.6v-63.6h-81C-10.2 180.8-10.2 331.2 111 292.8z"/>
                  <path fill="#EA4335" d="M249 97.6c36.2 0 68.6 12.4 94.2 36.6l70.6-70.6C371.6 24.2 314.6 0 249 0 152.2 0 67.8 46.8 30 119.2l81 63.6C130.4 140.8 184.8 97.6 249 97.6z"/>
                </g>
              </svg>
              {googleLoading ? "Signing in with Google..." : "Sign in with Google"}
            </Button>
            {googleError && <div className="text-red-500 text-xs mt-2">{googleError}</div>}
          </div>

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
