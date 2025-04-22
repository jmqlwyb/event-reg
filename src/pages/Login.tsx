
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to events
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/events");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Handle admin login explicitly
      const loginEmail = email === "admin" ? "admin@example.com" : email;
      const loginPassword = email === "admin" ? "admin123" : password;
      
      const success = await login(loginEmail, loginPassword);
      
      if (success) {
        toast.success("Successfully logged in");
        navigate("/events");
      } else {
        setError("Invalid credentials");
        toast.error("Invalid credentials");
      }
    } catch (error) {
      setError("An error occurred during login");
      toast.error("An error occurred during login");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[calc(100vh-72px)]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="event-card w-full max-w-md"
        >
          <h1 className="text-2xl font-bold text-center mb-6">Log In</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-md bg-red-900/20 border border-red-800 flex items-center gap-2">
                  <AlertCircle className="text-red-500 h-5 w-5" />
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="input-label">Email Address:</label>
                <div className="relative">
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pr-10"
                    placeholder="example@email.com or 'admin'"
                  />
                  <User className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="input-label">Password:</label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? 
                      <EyeOff className="h-5 w-5" /> : 
                      <Eye className="h-5 w-5" />
                    }
                  </button>
                </div>
              </div>
              
              <div className="text-left">
                <Link to="#" className="text-sm text-gray-300 hover:text-gray-200 transition-colors">
                  Forgot Password?
                </Link>
              </div>
            </div>
            
            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="primary-button w-full uppercase"
            >
              {isLoading ? "Logging in..." : "LOG IN"}
            </motion.button>
            
            <div className="text-center text-sm">
              don't have an account? <Link to="/register" className="text-gray-400 hover:text-gray-300 transition-colors">Register now</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Login;
