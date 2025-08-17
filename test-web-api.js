// 测试Web API集成
const fetch = require('node-fetch');

async function testWebAPI() {
  console.log('🌐 测试Web API集成...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/deepseek', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `
你是林溪，一个经验丰富的调查员，当前在月影酒馆中。
刚刚有一个陌生人问："现在几点了？"

请作为林溪回应这个问题。

请返回JSON格式：
{
  "finalDecision": {
    "chosenAction": "你的具体回应内容",
    "actionType": "dialogue",
    "reasoning": "你的推理过程",
    "confidence": 0.8,
    "expectedOutcome": "你期望的结果"
  }
}`,
        characterId: 'linxi'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Web API调用成功！');
      console.log('🤖 AI角色：', data.characterId);
      console.log('💬 AI回应：', data.decision.finalDecision.chosenAction);
      console.log('🧠 推理过程：', data.decision.finalDecision.reasoning);
      console.log('📊 置信度：', data.decision.finalDecision.confidence);
      console.log('\n🎉 AI现在应该能够根据具体问题给出不同的回应了！');
    } else {
      console.log('❌ API返回错误：', data.error);
    }
    
  } catch (error) {
    console.error('❌ 测试失败：', error.message);
  }
}

testWebAPI();