/**
 * 快速API测试
 */

require('dotenv').config({ path: '.env.local' });

async function testAPI() {
  console.log('🤖 测试DeepSeek API连接...\n');
  
  const apiKey = process.env.DEEPSEEK_API_KEY;
  console.log('API密钥:', apiKey ? '✅ 已配置' : '❌ 未找到');
  
  if (!apiKey) {
    console.log('❌ 请检查.env.local文件中的DEEPSEEK_API_KEY配置');
    return;
  }
  
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: '请简单回复"API连接成功"'
          }
        ],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      console.log(`❌ API请求失败: ${response.status} ${response.statusText}`);
      return;
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content;
    
    console.log('✅ DeepSeek API连接成功！');
    console.log('🤖 AI回复:', reply);
    console.log('\n🎉 您现在可以体验完整的AI推理功能了！');
    console.log('\n📚 建议运行以下完整演示：');
    console.log('   node quick-demo.js  - 查看刚才的演示');
    console.log('   npm run demo        - 交互式完整演示菜单');
    
  } catch (error) {
    console.log('❌ API测试失败:', error.message);
    console.log('\n🔧 可能的原因：');
    console.log('   1. 网络连接问题');
    console.log('   2. API密钥不正确');
    console.log('   3. API服务暂时不可用');
    console.log('\n💡 即使API不可用，系统也会使用模拟模式运行');
  }
}

testAPI();