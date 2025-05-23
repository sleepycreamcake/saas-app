import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    // 使用 Supabase 推荐的方式获取 cookies
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // 验证用户身份
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

    // 现在可以安全地调用 OpenRouter API
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      console.error('❌ OpenRouter API key not found');
      return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    // 调用 OpenRouter API 的示例
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

    // 可选：将分析结果保存到数据库
    const { error: dbError } = await supabase
      .from('analysis_history') // 假设你有这个表
      .insert({
        user_id: user.id,
        url: url,
        result: analysisResult,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.warn('⚠️ Failed to save to database:', dbError);
      // 不阻断流程，只是记录警告
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