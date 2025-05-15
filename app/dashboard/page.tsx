'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Profile = {
  username: string;
  email: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputUrl, setInputUrl] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username, email')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Failed to load profile:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    loadProfile();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-white relative">
      {/* 右上角浮动菜单 */}
      <div className="absolute top-4 right-4 bg-gray-100 border px-4 py-3 rounded-md text-sm shadow space-y-2">
        <p><strong>Subscription:</strong> Free</p>
        <p><strong>Account Wallet:</strong> $0</p>
        <button
          onClick={handleLogout}
          className="w-full bg-black text-white py-1.5 rounded-md hover:opacity-90 transition text-sm"
        >
          Log Out
        </button>
      </div>

      {/* 主体内容 */}
      <div className="flex items-center justify-center h-full pt-20">
        <div className="w-full max-w-xl border px-8 py-10 rounded-md shadow">
          <h1 className="text-xl font-semibold mb-6">
            Welcome, {profile?.username ?? 'User'}
          </h1>

          <label htmlFor="competitorUrl" className="block text-gray-700 mb-1">
            Please type the competitor's website:
          </label>
          <input
            id="competitorUrl"
            type="text"
            placeholder="ex. https://www.example.com"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full mb-4 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-black"
          />

          <p className="text-gray-500 text-sm">
            The result will send to your email!
          </p>
        </div>
      </div>
    </div>
  );
}
