/**
 * DeepSeek API 测试和验证工具
 * 
 * 这个文件提供了测试DeepSeek API连接和功能的工具函数，
 * 确保API集成的正确性和可靠性。
 */

import { globalDeepSeekClient, generateAIDecision, DecisionReasoning } from './deepseek';
import { appConfig } from './config';

/**
 * 测试DeepSeek API的基础连接
 */
export async function testDeepSeekConnection(): Promise<boolean> {
  console.log('\n🔄 开始测试DeepSeek API连接...');
  
  try {
    const isConnected = await globalDeepSeekClient.testConnection();
    
    if (isConnected) {
      console.log('✅ DeepSeek API连接测试成功');
      return true;
    } else {
      console.log('⚠️ DeepSeek API连接测试跳过（未配置API密钥）');
      return false;
    }
  } catch (error) {
    console.error('❌ DeepSeek API连接测试失败:', error);
    return false;
  }
}

/**
 * 测试AI决策推理功能
 */
export async function testAIDecisionReasoning(): Promise<boolean> {
  console.log('\n🧠 开始测试AI决策推理功能...');
  
  // 构建一个简单的测试场景
  const testPrompt = `你是一个高级AI角色扮演代理，正在扮演角色"测试角色"。你需要基于当前情况做出符合角色特性的行为决策。

## 🎭 角色基本信息
- **姓名**: 测试角色
- **身份**: 酒馆常客
- **核心动机**: 测试AI决策系统的功能
- **当前位置**: 测试场景

## 🧠 当前内在状态
- **能量水平**: 7.0/10 (精力充沛)
- **专注程度**: 8.0/10 (高度专注)
- **好奇心**: 6.0/10 (有些兴趣)

## 📍 当前场景状况
这是一个测试场景，用于验证AI决策系统的功能。

## 📜 最近发生的事件
1. 系统启动了一个测试会话
2. 正在验证AI推理能力

请按照标准的5步推理过程，以JSON格式返回你的决策分析。`;

  try {
    const reasoning = await generateAIDecision(testPrompt);
    
    // 验证返回结果的结构
    const isValid = validateReasoningStructure(reasoning);
    
    if (isValid) {
      console.log('✅ AI决策推理测试成功');
      console.log('📋 推理结果摘要:');
      console.log(`   最终决策: ${reasoning.finalDecision.chosenAction}`);
      console.log(`   决策类型: ${reasoning.finalDecision.actionType}`);
      console.log(`   信心程度: ${reasoning.finalDecision.confidence}`);
      return true;
    } else {
      console.log('❌ AI决策推理测试失败：返回结构不正确');
      return false;
    }
    
  } catch (error) {
    console.error('❌ AI决策推理测试失败:', error);
    return false;
  }
}

/**
 * 验证推理结果的结构完整性
 */
function validateReasoningStructure(reasoning: DecisionReasoning): boolean {
  try {
    // 检查必需的字段
    const requiredFields = [
      'observation',
      'internalAnalysis', 
      'beliefFiltering',
      'optionGeneration',
      'finalDecision'
    ];
    
    for (const field of requiredFields) {
      if (!(field in reasoning)) {
        console.error(`❌ 缺少必需字段: ${field}`);
        return false;
      }
    }
    
    // 检查observation结构
    const obs = reasoning.observation;
    if (!obs.keyEvents || !obs.environmentalFactors || !obs.socialDynamics) {
      console.error('❌ observation字段结构不完整');
      return false;
    }
    
    // 检查finalDecision结构
    const decision = reasoning.finalDecision;
    if (!decision.chosenAction || !decision.actionType || !decision.reasoning) {
      console.error('❌ finalDecision字段结构不完整');
      return false;
    }
    
    // 检查confidence范围
    if (decision.confidence < 0 || decision.confidence > 1) {
      console.error('❌ confidence值超出有效范围');
      return false;
    }
    
    console.log('✅ 推理结构验证通过');
    return true;
    
  } catch (error) {
    console.error('❌ 推理结构验证失败:', error);
    return false;
  }
}

/**
 * 运行完整的DeepSeek API测试套件
 */
export async function runDeepSeekTestSuite(): Promise<{
  connection: boolean;
  reasoning: boolean;
  overall: boolean;
}> {
  console.log('\n🧪 === DeepSeek API 测试套件 ===\n');
  
  // 显示当前配置信息
  const configInfo = globalDeepSeekClient.getConfigInfo();
  console.log('⚙️ 当前配置:');
  console.log(`   API基础URL: ${configInfo.baseURL}`);
  console.log(`   模型: ${configInfo.model}`);
  console.log(`   超时时间: ${configInfo.timeout}ms`);
  console.log(`   最大重试: ${configInfo.maxRetries}次`);
  console.log(`   环境: ${appConfig.environment}`);
  console.log(`   调试模式: ${appConfig.debugMode}`);
  
  // 运行测试
  const results = {
    connection: await testDeepSeekConnection(),
    reasoning: await testAIDecisionReasoning(),
    overall: false
  };
  
  results.overall = results.connection && results.reasoning;
  
  // 输出测试结果摘要
  console.log('\n📊 === 测试结果摘要 ===');
  console.log(`🔗 连接测试: ${results.connection ? '✅ 通过' : '❌ 失败'}`);
  console.log(`🧠 推理测试: ${results.reasoning ? '✅ 通过' : '❌ 失败'}`);
  console.log(`🎯 总体评估: ${results.overall ? '✅ 系统就绪' : '⚠️ 存在问题'}`);
  
  if (!results.overall) {
    console.log('\n💡 故障排除建议:');
    if (!results.connection) {
      console.log('- 检查DEEPSEEK_API_KEY环境变量是否正确设置');
      console.log('- 验证网络连接和API服务状态');
      console.log('- 确认API密钥的权限和配额');
    }
    if (!results.reasoning) {
      console.log('- 检查API返回格式是否符合预期');
      console.log('- 验证JSON解析逻辑');
      console.log('- 确认模型支持结构化输出');
    }
  } else {
    console.log('\n🎉 DeepSeek API集成测试全部通过！系统已准备就绪。');
  }
  
  return results;
}

/**
 * 性能基准测试
 */
export async function benchmarkDeepSeekPerformance(): Promise<{
  averageLatency: number;
  successRate: number;
  errorTypes: Record<string, number>;
}> {
  console.log('\n⚡ 开始DeepSeek API性能基准测试...');
  
  const testCases = 5; // 测试案例数量
  const results: Array<{ success: boolean; latency: number; error?: string }> = [];
  
  for (let i = 1; i <= testCases; i++) {
    console.log(`🔄 执行测试案例 ${i}/${testCases}...`);
    
    const startTime = Date.now();
    
    try {
      const testPrompt = `简单测试案例 ${i}：请返回一个基本的JSON决策结构。`;
      await generateAIDecision(testPrompt);
      
      const latency = Date.now() - startTime;
      results.push({ success: true, latency });
      
      console.log(`  ✅ 案例 ${i} 成功 (${latency}ms)`);
      
    } catch (error) {
      const latency = Date.now() - startTime;
      results.push({ 
        success: false, 
        latency, 
        error: error instanceof Error ? error.message : '未知错误'
      });
      
      console.log(`  ❌ 案例 ${i} 失败 (${latency}ms): ${error}`);
    }
    
    // 避免API限流，稍作延迟
    if (i < testCases) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // 计算统计信息
  const successfulResults = results.filter(r => r.success);
  const averageLatency = successfulResults.length > 0 
    ? successfulResults.reduce((sum, r) => sum + r.latency, 0) / successfulResults.length
    : 0;
  
  const successRate = successfulResults.length / results.length;
  
  const errorTypes: Record<string, number> = {};
  results.filter(r => !r.success).forEach(r => {
    const errorType = r.error || '未知错误';
    errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
  });
  
  // 输出性能报告
  console.log('\n📈 === 性能基准测试报告 ===');
  console.log(`📊 测试案例数: ${testCases}`);
  console.log(`✅ 成功率: ${(successRate * 100).toFixed(1)}%`);
  console.log(`⚡ 平均延迟: ${averageLatency.toFixed(0)}ms`);
  
  if (Object.keys(errorTypes).length > 0) {
    console.log(`❌ 错误类型分布:`);
    Object.entries(errorTypes).forEach(([error, count]) => {
      console.log(`   - ${error}: ${count}次`);
    });
  }
  
  return { averageLatency, successRate, errorTypes };
}

/**
 * 如果直接运行此文件，执行完整的测试套件
 */
if (require.main === module) {
  runDeepSeekTestSuite()
    .then(() => {
      console.log('\n🏁 测试完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 测试执行失败:', error);
      process.exit(1);
    });
}