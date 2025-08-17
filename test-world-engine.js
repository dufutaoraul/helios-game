/**
 * 世界引擎测试脚本
 * 用于验证新架构的核心功能
 */

const testWorldEngine = async () => {
  console.log('🧪 开始测试世界引擎...');
  
  const baseUrl = 'http://localhost:3002';
  
  try {
    // 1. 测试世界初始化
    console.log('\n1️⃣ 测试世界初始化...');
    const initResponse = await fetch(`${baseUrl}/api/world`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: '测试玩家进入世界',
        playerName: 'TestPlayer',
        sceneId: 'test_scene',
        isInitialEntry: true,
      }),
    });
    
    const initResult = await initResponse.json();
    console.log('✅ 世界初始化:', initResult.success ? '成功' : '失败');
    
    // 2. 测试SSE连接
    console.log('\n2️⃣ 测试SSE事件流...');
    const eventSource = new EventSource(`${baseUrl}/api/events?sceneId=test_scene&playerId=TestPlayer`);
    
    let eventCount = 0;
    const maxEvents = 5;
    
    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log(`📡 收到SSE事件 #${++eventCount}:`, message.type);
        
        if (eventCount >= maxEvents) {
          eventSource.close();
          console.log('✅ SSE测试完成');
          testPlayerInteraction();
        }
      } catch (error) {
        console.error('❌ SSE解析错误:', error);
      }
    };
    
    eventSource.onerror = (error) => {
      console.error('❌ SSE连接错误:', error);
      eventSource.close();
    };
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
};

const testPlayerInteraction = async () => {
  console.log('\n3️⃣ 测试玩家交互...');
  
  const baseUrl = 'http://localhost:3002';
  
  try {
    const response = await fetch(`${baseUrl}/api/world`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: '大家好，我是新来的',
        playerName: 'TestPlayer',
        sceneId: 'test_scene',
        playerInputType: 'dialogue',
      }),
    });
    
    const result = await response.json();
    console.log('✅ 玩家交互:', result.success ? '成功' : '失败');
    console.log('📊 返回事件数量:', result.events?.length || 0);
    
    // 4. 测试世界状态
    console.log('\n4️⃣ 测试世界状态查询...');
    const stateResponse = await fetch(`${baseUrl}/api/world?sceneId=test_scene`);
    const stateResult = await stateResponse.json();
    
    console.log('✅ 世界状态查询:', stateResult.success ? '成功' : '失败');
    console.log('🌍 世界信息:', {
      scene_id: stateResult.world_state?.scene_id,
      tick_count: stateResult.world_state?.tick_count,
      character_count: stateResult.world_state?.character_count,
    });
    
    console.log('\n🎉 世界引擎测试完成！');
    
  } catch (error) {
    console.error('❌ 交互测试失败:', error);
  }
};

// 在浏览器控制台中运行
if (typeof window !== 'undefined') {
  window.testWorldEngine = testWorldEngine;
  console.log('🔧 在浏览器控制台运行: testWorldEngine()');
} else {
  // Node.js 环境
  testWorldEngine();
}