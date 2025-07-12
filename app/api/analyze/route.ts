// This handler processes POST requests to /api/analyze
// It validates user authentication using Supabase
// Then sends a request to OpenRouter API to analyze a Facebook page
// Finally returns the analysis result and optionally saves it to Supabase

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // get cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // verify user identity
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('❌ Supabase auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL input.' }, { status: 400 });
    }

    // OpenRouter API
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      console.error('❌ OpenRouter API key not found');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // Example of how to call OpenRouter API 
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Facebook Page Analyzer'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a Facebook page analyzer. Analyze the given Facebook page URL and provide insights.'
          },
          {
            role: 'user',
            content: `Please analyze this Facebook page: ${url}`
          }
        ],
        max_tokens: 1000
      })
    });

    if (!openRouterResponse.ok) {
      const errorData = await openRouterResponse.text();
      console.error('❌ OpenRouter API error:', errorData);
      return NextResponse.json({ error: 'Failed to analyze page' }, { status: 500 });
    }

    const openRouterData = await openRouterResponse.json();
    const analysisResult = openRouterData.choices?.[0]?.message?.content || 'No analysis available';

    // Optional: Store result to database
    const { error: dbError } = await supabase
      .from('analysis_history') // assume I have this table
      .insert({
        user_id: user.id,
        url: url,
        result: analysisResult,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.warn('⚠️ Failed to save to database:', dbError);
    }

    return NextResponse.json({ result: analysisResult });

  } catch (err: any) {
    console.error('🔥 Internal error in /api/analyze:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
