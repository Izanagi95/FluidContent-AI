/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const Auth = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

const BASE_URL = 'http://localhost:8000/api'; // adjust this based on your FastAPI host

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.email || !formData.password) {
    toast.error('Please fill in all fields');
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      email: formData.email,
      password: formData.password,
    });

    const user = response.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');

    toast.success('Logged in successfully!');
    navigate('/dashboard');
  } catch (error: any) {
    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      // Handle FastAPI validation errors
      const messages = detail.map((err: any) => {
        const field = err.loc?.[1] ?? 'field';
        return `${field}: ${err.msg}`;
      });
      toast.error(messages.join('\n'));
    } else if (typeof detail === 'string') {
      toast.error(detail);
    } else {
      toast.error('Login failed');
    }
  } finally {
    setLoading(false);
  }
};

const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.email || !formData.password || !formData.name) {
    toast.error('Please fill in all fields');
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }

  setLoading(true);
  try {
    const response = await axios.post(`${BASE_URL}/signup`, {
      email: formData.email,
      password: formData.password,
      name: formData.name,
    });

    const user = response.data.user;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');

    toast.success('Account created successfully!');
    navigate('/dashboard');
  } catch (error: any) {
    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      // Handle FastAPI validation errors
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const messages = detail.map((err: any) => {
        const field = err.loc?.[1] ?? 'field';
        return `${field}: ${err.msg}`;
      });
      toast.error(messages.join('\n'));
    } else if (typeof detail === 'string') {
      toast.error(detail);
    } else {
      toast.error('Signup failed');
    }
  } finally {
    setLoading(false);
  }
};

  const userRole = localStorage.getItem('userRole') || 'consumer';
  const getRoleTitle = () => {
    switch (userRole) {
      case 'maker': return 'Content Maker';
      case 'provider': return 'Content Provider';
      default: return 'Content Consumer';
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img src="/resources/logo.png" alt="FluidContent AI Logo" className="h-16 w-16" />
            {/* <Sparkles className="h-8 w-8 text-primary" /> */}
            <span className="text-2xl font-bold gradient-text">FluidContent AI</span>
          </div>
          <p className="text-gray-600">Welcome back, {getRoleTitle()}</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/onboarding')}
              className="text-sm"
            >
              Change Role
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
