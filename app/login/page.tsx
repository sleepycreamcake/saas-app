'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoToSignup = () => {
    router.push('/signup');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-full max-w-md px-8 py-10 shadow-md rounded-md border border-gray-200">
        <h1 className="text-2xl font-semibold text-center mb-8">Competitor Analyze</h1>

        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 text-gray-700">
            Email:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-black"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block mb-1 text-gray-700">
            Password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-black"
          />
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2 rounded-md hover:opacity-90 transition"
        >
          Login
        </button>

        <button
          onClick={handleGoToSignup}
          className="w-full border border-black text-black py-2 rounded-md mt-4 hover:bg-gray-100 transition"
        >
          Signup
        </button>

        {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}
