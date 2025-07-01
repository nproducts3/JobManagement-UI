import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";

const FirebaseLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
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
      // Save JWT/token as needed (localStorage, context, etc.)
      localStorage.setItem("token", data.token);

      // Redirect to jobseeker dashboard
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGoogleLogin();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {isLoading ? (
        <div className="text-lg">Redirecting to Google sign-in...</div>
      ) : error ? (
        <div className="text-red-500 text-xs mt-2">{error}</div>
      ) : null}
    </div>
  );
};

export default FirebaseLogin;
