'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Profile = {
  username: string;
  email: string;
};

type AnalysisResult = {
  result?: string;
  error?: string;
  details?: string;
  responseStructure?: any;
};

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputUrl, setInputUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // Load user profile from Supabase after verifying authentication
  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login'); // Redirect if not authenticated
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

  // Handle logout and redirect to login
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Normalize URL to ensure it includes protocol
  const normalizeUrl = (input: string) => {
    if (!input.startsWith('http://') && !input.startsWith('https://')) {
      return 'https://' + input;
    }
    return input;
  };

  // Validate if the URL is a Facebook domain
  const isValidFacebookUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.includes('facebook.com');
    } catch {
      return false;
    }
  };

  // Trigger analysis request
  const handleAnalyze = async () => {
    setError(null);
    setStatusMessage('');
    setAnalysisResult(null);
    setIsAnalyzing(true);

    const fullUrl = normalizeUrl(inputUrl);

    if (!isValidFacebookUrl(fullUrl)) {
      setError('Please enter a valid Facebook link.');
      setIsAnalyzing(false);
      return;
    }

    console.log('✅ Valid Facebook URL:', fullUrl);
    setStatusMessage('🔄 Analyzing Facebook page... This may take up to 30 seconds.');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ url: fullUrl }),
      });

      const data: AnalysisResult = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze URL');
      }

      if (data?.result) {
        console.log('💡 Analysis Result:', data.result);
        setStatusMessage('✅ Analysis complete!');
        setAnalysisResult(data.result);
      } else {
        console.error('❌ API returned no result:', data.error || 'Unknown error');
        setStatusMessage('❌ Failed to get analysis.');

        if (data.responseStructure) {
          console.error('Response structure:', data.responseStructure);
        }

        setError(data.error || 'Failed to analyze Facebook page. Please try again later.');
      }
    } catch (err: any) {
      console.error('❌ API Error:', err);
      setStatusMessage('❌ Error analyzing Facebook page.');
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-white relative">
      {/* Floating account/logout box */}
      <div className="absolute top-4 right-4 bg-gray-100 border px-4 py-3 rounded-md text-sm shadow space-y-2 text-right">
        <p><strong>Subscription:</strong> Free</p>
        <p><strong>Account Wallet:</strong> $0</p>
        <button
          onClick={handleLogout}
          className="w-full bg-black text-white py-1.5 rounded-md hover:opacity-90 transition text-sm"
        >
          Log Out
        </button>
      </div>

      {/* Main dashboard content */}
      <div className="flex items-center justify-center h-full pt-20">
        <div className="w-full max-w-xl border px-8 py-10 rounded-md shadow">
          <h1 className="text-xl font-semibold mb-6">
            Welcome, {profile?.username ?? 'User'}
          </h1>

          {/* Input for Facebook page URL */}
          <label htmlFor="competitorUrl" className="block text-gray-700 mb-1">
            Please type the competitor's Facebook page:
          </label>
          <input
            id="competitorUrl"
            type="text"
            placeholder="ex. https://www.facebook.com/somepage"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full mb-4 px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-black"
          />

          <p className="text-gray-500 text-sm mb-4">
            Analysis results will appear below once completed.
          </p>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className={`w-full py-2 rounded-md transition ${
              isAnalyzing
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-black text-white hover:opacity-90'
            }`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Page'}
          </button>

          {/* Status and error messages */}
          {statusMessage && (
            <p className="mt-4 text-center text-sm text-blue-600">{statusMessage}</p>
          )}

          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}

          {/* Result box */}
          {analysisResult && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md border">
              <h3 className="font-semibold mb-2">Analysis Results:</h3>
              <div className="whitespace-pre-line text-sm">
                {analysisResult}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
