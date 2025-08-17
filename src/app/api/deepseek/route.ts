import { NextRequest, NextResponse } from 'next/server';
import { globalDeepSeekClient } from '@/lib/deepseek';

export async function POST(request: NextRequest) {
  try {
    const { prompt, characterId } = await request.json();
    
    console.log(`🚀 API route: 处理${characterId}的AI请求`);
    
    if (!prompt) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing prompt' 
      }, { status: 400 });
    }

    // 调用DeepSeek API
    const decision = await globalDeepSeekClient.generateDecisionReasoning(prompt);
    
    console.log(`✅ API route: ${characterId}的AI决策完成`, decision.finalDecision);

    return NextResponse.json({
      success: true,
      decision,
      characterId
    });

  } catch (error) {
    console.error('❌ API route 错误:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误',
      fallback: true
    }, { status: 500 });
  }
}