"use client";
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Lock, ArrowRight, ShoppingCart } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/profile';

  useEffect(() => {
    if (user) {
      router.push(redirect);
    }
  }, [user, redirect, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header Setup */}
        <div className="bg-[#2563EB] px-8 pt-8 pb-12 relative">
           <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
             <div className="bg-[#fae8b2] w-12 h-12 rounded-full flex items-center justify-center text-[#F97316]">
               <ShoppingCart size={24} />
             </div>
           </div>
           <h2 className="text-center text-3xl font-extrabold text-white">
             Welcome Back
           </h2>
           <p className="mt-2 text-center text-sm text-blue-100 font-medium">
             Sign in to your Hudi Supermarket account
           </p>
        </div>

        {/* Login Form */}
        <div className="px-8 pt-12 pb-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold mb-6 border border-red-100 shadow-sm animate-pulse">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
             <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB] focus:z-10 sm:text-sm font-medium transition"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-[#2563EB] focus:border-[#2563EB] focus:z-10 sm:text-sm font-medium transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#2563EB] focus:ring-[#2563EB] border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-[#F97316] hover:underline">
                  Forgot password?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-[#2563EB] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2563EB] shadow-md transition disabled:opacity-70"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
              {!isLoading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>
          
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500 font-medium">New to Hudi Supermarket?</span>
            </div>
          </div>
          
          <div className="mt-6">
            <Link
              href={`/register?redirect=${redirect}`}
              className="w-full flex justify-center py-3 px-4 border-2 border-gray-200 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition"
            >
              Create your account
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
