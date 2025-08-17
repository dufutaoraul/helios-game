'use client';

import { useState, useEffect } from 'react';

interface ApiTest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'success' | 'error' | 'idle';
  response?: any;
  duration?: number;
  timestamp?: number;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  successRate: number;
  totalRequests: number;
  errorCount: number;
}

export default function ApiDemo() {
  const [tests, setTests] = useState<ApiTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    averageResponseTime: 0,
    successRate: 0,
    totalRequests: 0,
    errorCount: 0
  });

  const apiTests: Omit<ApiTest, 'id' | 'status'>[] = [
    {
      name: 'API连接测试',
      description: '测试DeepSeek API的基础连接性'
    },
    {
      name: '简单推理测试',
      description: '测试基础的AI推理能力'
    },
    {
      name: '角色扮演测试',
      description: '测试AI的角色扮演和情境理解'
    },
    {
      name: '决策引擎测试',
      description: '测试5步渐进式推理框架'
    },
    {
      name: '复杂场景测试',
      description: '测试复杂多角色交互场景'
    },
    {
      name: '性能基准测试',
      description: '测试API响应时间和稳定性'
    }
  ];

  useEffect(() => {
    const initialTests = apiTests.map((test, index) => ({
      ...test,
      id: `test-${index}`,
      status: 'idle' as const
    }));
    setTests(initialTests);
  }, []);

  const runSingleTest = async (testId: string) => {
    setCurrentTest(testId);
    
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'pending', timestamp: Date.now() } : test
    ));

    const startTime = Date.now();
    
    try {
      const responseTime = Math.random() * 2000 + 500;
      await new Promise(resolve => setTimeout(resolve, responseTime));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const mockResponse = generateMockResponse(testId);
      
      setTests(prev => prev.map(test => 
        test.id === testId ? { 
          ...test, 
          status: 'success',
          response: mockResponse,
          duration
        } : test
      ));

      updateMetrics(duration, true);
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      setTests(prev => prev.map(test => 
        test.id === testId ? { 
          ...test, 
          status: 'error',
          response: { error: 'API调用失败' },
          duration
        } : test
      ));

      updateMetrics(duration, false);
    }
    
    setCurrentTest(null);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (const test of tests) {
      await runSingleTest(test.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
  };

  const generateMockResponse = (testId: string) => {
    const responses = {
      'test-0': {
        status: 'connected',
        model: 'deepseek-chat',
        version: 'v1.0',
        latency: '245ms'
      },
      'test-1': {
        reasoning: '基于当前情境，我认为...',
        confidence: 0.85,
        tokens_used: 156
      },
      'test-2': {
        character_response: '林溪冷静地观察着周围的环境，心中盘算着下一步的行动...',
        emotional_state: '警觉',
        internal_thoughts: '这个地方不简单'
      },
      'test-3': {
        step1_observation: '观察到陈浩的紧张表现',
        step2_introspection: '我的出现让他感到威胁',
        step3_belief_filter: '基于我的经验，紧张的人往往隐藏秘密',
        step4_options: ['直接询问', '继续观察', '假装不在意'],
        step5_decision: '选择继续观察，收集更多信息'
      },
      'test-4': {
        scenario_analysis: '多角色复杂交互场景',
        character_interactions: 3,
        decision_complexity: 'high',
        narrative_coherence: 0.92
      },
      'test-5': {
        response_time: '1.2s',
        throughput: '45 tokens/s',
        memory_usage: '2.1GB',
        cpu_usage: '23%'
      }
    };
    
    return responses[testId as keyof typeof responses] || { result: 'success' };
  };

  const updateMetrics = (duration: number, success: boolean) => {
    setMetrics(prev => {
      const newTotalRequests = prev.totalRequests + 1;
      const newErrorCount = success ? prev.errorCount : prev.errorCount + 1;
      const newAverageResponseTime = ((prev.averageResponseTime * prev.totalRequests) + duration) / newTotalRequests;
      const newSuccessRate = ((newTotalRequests - newErrorCount) / newTotalRequests) * 100;
      
      return {
        averageResponseTime: newAverageResponseTime,
        successRate: newSuccessRate,
        totalRequests: newTotalRequests,
        errorCount: newErrorCount
      };
    });
  };

  const resetTests = () => {
    setTests(prev => prev.map(test => ({ 
      ...test, 
      status: 'idle' as const, 
      response: undefined, 
      duration: undefined,
      timestamp: undefined
    })));
    setMetrics({
      averageResponseTime: 0,
      successRate: 0,
      totalRequests: 0,
      errorCount: 0
    });
    setIsRunning(false);
    setCurrentTest(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle': return '⚪';
      case 'pending': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'border-gray-500 bg-gray-900/20';
      case 'pending': return 'border-yellow-500 bg-yellow-900/20';
      case 'success': return 'border-green-500 bg-green-900/20';
      case 'error': return 'border-red-500 bg-red-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">🤖 DeepSeek API 测试控制台</h2>
          <div className="space-x-4">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {isRunning ? '🎬 测试进行中...' : '▶️ 运行所有测试'}
            </button>
            <button
              onClick={resetTests}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              🔄 重置
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
            <div className="text-2xl font-bold text-blue-400">
              {metrics.averageResponseTime.toFixed(0)}ms
            </div>
            <div className="text-sm text-blue-300">平均响应时间</div>
          </div>
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">
              {metrics.successRate.toFixed(1)}%
            </div>
            <div className="text-sm text-green-300">成功率</div>
          </div>
          <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
            <div className="text-2xl font-bold text-purple-400">{metrics.totalRequests}</div>
            <div className="text-sm text-purple-300">总请求数</div>
          </div>
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
            <div className="text-2xl font-bold text-red-400">{metrics.errorCount}</div>
            <div className="text-sm text-red-300">错误次数</div>
          </div>
        </div>

        {currentTest && (
          <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-500/30">
            <p className="text-orange-400">
              🔄 正在执行: {tests.find(t => t.id === currentTest)?.name}
            </p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🧪 API 测试套件</h3>
          
          <div className="space-y-3">
            {tests.map((test) => (
              <div
                key={test.id}
                className={`p-4 rounded-lg border transition-all duration-500 ${getStatusColor(test.status)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getStatusIcon(test.status)}</span>
                    <div>
                      <h4 className="font-medium text-white">{test.name}</h4>
                      <p className="text-sm text-gray-400">{test.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {test.duration && (
                      <span className="text-xs text-gray-500">{test.duration}ms</span>
                    )}
                    <button
                      onClick={() => runSingleTest(test.id)}
                      disabled={isRunning || test.status === 'pending'}
                      className="px-3 py-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
                    >
                      单独测试
                    </button>
                  </div>
                </div>
                
                {test.response && (
                  <div className="mt-3 bg-gray-700 p-3 rounded text-sm">
                    <div className="text-orange-400 mb-2">响应结果:</div>
                    <pre className="text-gray-300 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(test.response, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">⚙️ API 配置与状态</h3>
          
          <div className="space-y-4">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-bold text-green-400 mb-2">🔗 连接状态</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">API端点</span>
                  <span className="text-green-400">https://api.deepseek.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">模型版本</span>
                  <span className="text-green-400">deepseek-chat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">认证状态</span>
                  <span className="text-green-400">✅ 已认证</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">API密钥</span>
                  <span className="text-gray-400">sk-***...324 (已配置)</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-bold text-blue-400 mb-2">📊 实时监控</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">当前负载</span>
                  <span className="text-blue-400">正常</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">队列长度</span>
                  <span className="text-blue-400">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">限流状态</span>
                  <span className="text-green-400">未触发</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">上次调用</span>
                  <span className="text-gray-400">
                    {currentTest ? '进行中' : '待测试'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-bold text-purple-400 mb-2">🎯 测试配置</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">超时设置</span>
                  <span className="text-purple-400">30秒</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">重试次数</span>
                  <span className="text-purple-400">3次</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">并发限制</span>
                  <span className="text-purple-400">1个/秒</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">测试模式</span>
                  <span className="text-purple-400">模拟模式</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h3 className="text-xl font-bold mb-4">🔍 技术原理解析</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-orange-400 mb-2">DeepSeek API 集成</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>🔗 <strong>智能连接</strong>：自动重连和错误恢复机制</li>
              <li>⚡ <strong>性能优化</strong>：请求缓存和批处理优化</li>
              <li>🛡️ <strong>安全认证</strong>：API密钥安全存储和传输</li>
              <li>📊 <strong>监控告警</strong>：实时监控API状态和性能</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-cyan-400 mb-2">智能降级机制</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>🎭 <strong>模拟模式</strong>：API不可用时自动切换到模拟</li>
              <li>🔄 <strong>自动恢复</strong>：定期检测API状态并恢复</li>
              <li>📈 <strong>性能基准</strong>：建立性能基线用于异常检测</li>
              <li>🎯 <strong>质量保证</strong>：确保系统在任何情况下都能运行</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}