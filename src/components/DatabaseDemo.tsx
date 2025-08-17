'use client';

import { useState, useEffect } from 'react';

interface DatabaseOperation {
  id: string;
  type: 'INSERT' | 'UPDATE' | 'SELECT' | 'ANALYZE';
  table: string;
  description: string;
  timestamp: number;
  status: 'pending' | 'success' | 'error';
  result?: any;
}

interface BeliefData {
  character: string;
  worldview: string[];
  self_perception: string[];
  values: string[];
  confidence: number;
}

export default function DatabaseDemo() {
  const [operations, setOperations] = useState<DatabaseOperation[]>([]);
  const [beliefs, setBeliefs] = useState<BeliefData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTable, setSelectedTable] = useState<'all' | 'actions' | 'beliefs' | 'states'>('all');

  const demoOperations: Omit<DatabaseOperation, 'id' | 'timestamp' | 'status'>[] = [
    {
      type: 'INSERT',
      table: 'character_actions',
      description: '记录林溪进入酒馆的行为数据'
    },
    {
      type: 'INSERT',
      table: 'character_actions',
      description: '记录陈浩的观察行为'
    },
    {
      type: 'UPDATE',
      table: 'character_states',
      description: '更新林溪的内在状态 (专注度+10)'
    },
    {
      type: 'ANALYZE',
      table: 'character_actions',
      description: '分析林溪的行为模式，生成世界观信念'
    },
    {
      type: 'INSERT',
      table: 'character_beliefs',
      description: '插入林溪的新信念：环境评估能力'
    },
    {
      type: 'UPDATE',
      table: 'character_states',
      description: '更新陈浩的内在状态 (能量-10, 专注度+5)'
    },
    {
      type: 'ANALYZE',
      table: 'character_actions',
      description: '分析陈浩的防御行为，生成自我认知'
    },
    {
      type: 'INSERT',
      table: 'character_beliefs',
      description: '插入陈浩的新信念：自我保护意识'
    },
    {
      type: 'SELECT',
      table: 'character_beliefs',
      description: '查询所有角色的信念系统完整性'
    }
  ];

  const startDemo = () => {
    setIsRunning(true);
    setOperations([]);
    setBeliefs([]);
    setCurrentStep(0);

    demoOperations.forEach((op, index) => {
      setTimeout(() => {
        const newOp: DatabaseOperation = {
          ...op,
          id: `op-${index}`,
          timestamp: Date.now(),
          status: 'pending'
        };

        setOperations(prev => [...prev, newOp]);
        setCurrentStep(index + 1);

        setTimeout(() => {
          setOperations(prev => prev.map(o => 
            o.id === newOp.id ? { 
              ...o, 
              status: 'success',
              result: generateMockResult(op)
            } : o
          ));

          if (op.table === 'character_beliefs' && op.type === 'INSERT') {
            updateBeliefData(op.description);
          }
        }, 800);

      }, index * 2000);
    });

    setTimeout(() => {
      setIsRunning(false);
    }, demoOperations.length * 2000 + 1000);
  };

  const generateMockResult = (op: Omit<DatabaseOperation, 'id' | 'timestamp' | 'status'>) => {
    switch (op.type) {
      case 'INSERT':
        return { affected_rows: 1, insert_id: Math.floor(Math.random() * 1000) };
      case 'UPDATE':
        return { affected_rows: 1, changed_rows: 1 };
      case 'SELECT':
        return { rows_found: Math.floor(Math.random() * 10) + 1 };
      case 'ANALYZE':
        return { 
          patterns_found: Math.floor(Math.random() * 5) + 1,
          confidence: (Math.random() * 0.3 + 0.7).toFixed(2)
        };
      default:
        return {};
    }
  };

  const updateBeliefData = (description: string) => {
    if (description.includes('林溪')) {
      setBeliefs(prev => {
        const existing = prev.find(b => b.character === '林溪');
        if (existing) {
          return prev.map(b => b.character === '林溪' ? {
            ...b,
            worldview: [...b.worldview, '环境是可以被快速评估和掌控的'],
            confidence: Math.min(b.confidence + 0.1, 1.0)
          } : b);
        } else {
          return [...prev, {
            character: '林溪',
            worldview: ['环境是可以被快速评估和掌控的'],
            self_perception: ['我具备敏锐的观察力'],
            values: ['效率', '控制'],
            confidence: 0.7
          }];
        }
      });
    } else if (description.includes('陈浩')) {
      setBeliefs(prev => {
        const existing = prev.find(b => b.character === '陈浩');
        if (existing) {
          return prev.map(b => b.character === '陈浩' ? {
            ...b,
            self_perception: [...b.self_perception, '我需要保护自己免受威胁'],
            confidence: Math.min(b.confidence + 0.1, 1.0)
          } : b);
        } else {
          return [...prev, {
            character: '陈浩',
            worldview: ['世界充满潜在威胁'],
            self_perception: ['我需要保护自己免受威胁'],
            values: ['安全', '谨慎'],
            confidence: 0.6
          }];
        }
      });
    }
  };

  const resetDemo = () => {
    setOperations([]);
    setBeliefs([]);
    setCurrentStep(0);
    setIsRunning(false);
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'INSERT': return '➕';
      case 'UPDATE': return '✏️';
      case 'SELECT': return '🔍';
      case 'ANALYZE': return '🧠';
      default: return '📝';
    }
  };

  const getOperationColor = (type: string) => {
    switch (type) {
      case 'INSERT': return 'border-green-500 bg-green-900/20';
      case 'UPDATE': return 'border-blue-500 bg-blue-900/20';
      case 'SELECT': return 'border-purple-500 bg-purple-900/20';
      case 'ANALYZE': return 'border-orange-500 bg-orange-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const filteredOperations = selectedTable === 'all' 
    ? operations 
    : operations.filter(op => op.table.includes(selectedTable));

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">🗄️ 数据库模拟系统控制台</h2>
          <div className="space-x-4">
            <button
              onClick={startDemo}
              disabled={isRunning}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {isRunning ? '🎬 演示进行中...' : '▶️ 开始演示'}
            </button>
            <button
              onClick={resetDemo}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              🔄 重置
            </button>
          </div>
        </div>

        <div className="flex space-x-2 mb-4">
          {['all', 'actions', 'beliefs', 'states'].map(table => (
            <button
              key={table}
              onClick={() => setSelectedTable(table as any)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedTable === table
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {table === 'all' ? '📋 全部表' : `📊 ${table}`}
            </button>
          ))}
        </div>

        {isRunning && (
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
            <p className="text-green-400">
              🔄 数据库操作进度: {currentStep} / {demoOperations.length}
            </p>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / demoOperations.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📝 数据库操作日志</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredOperations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>暂无操作记录，点击"开始演示"查看数据库操作</p>
              </div>
            ) : (
              filteredOperations.map((operation) => (
                <div
                  key={operation.id}
                  className={`p-4 rounded-lg border transition-all duration-500 ${getOperationColor(operation.type)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getOperationIcon(operation.type)}</span>
                      <span className="font-medium text-white">{operation.type}</span>
                      <span className="text-sm text-gray-400">→ {operation.table}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStatusIcon(operation.status)}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(operation.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-200 mb-2">{operation.description}</p>
                  {operation.result && (
                    <div className="bg-gray-700 p-2 rounded text-sm">
                      <span className="text-green-400">结果: </span>
                      <span className="text-gray-300">
                        {JSON.stringify(operation.result, null, 2)}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🔮 信念系统生成</h3>
          
          <div className="space-y-4">
            {beliefs.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>信念系统尚未生成</p>
                <p className="text-sm">运行演示后将自动从行为中推断信念</p>
              </div>
            ) : (
              beliefs.map((belief) => (
                <div key={belief.character} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-cyan-400">{belief.character} 的信念系统</h4>
                    <div className="text-sm text-gray-400">
                      置信度: {(belief.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-blue-400 mb-1">🌍 世界观</h5>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {belief.worldview.map((view, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            {view}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-purple-400 mb-1">👤 自我认知</h5>
                      <ul className="text-sm text-gray-300 space-y-1">
                        {belief.self_perception.map((perception, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-purple-400 mr-2">•</span>
                            {perception}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium text-yellow-400 mb-1">💎 价值观</h5>
                      <div className="flex flex-wrap gap-2">
                        {belief.values.map((value, index) => (
                          <span key={index} className="bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded text-xs">
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h3 className="text-xl font-bold mb-4">🔍 技术原理解析</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-green-400 mb-2">数据库模拟系统</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📊 <strong>行为记录</strong>：自动记录所有AI行为数据</li>
              <li>🔄 <strong>状态同步</strong>：实时更新角色内在状态</li>
              <li>🧠 <strong>模式分析</strong>：从行为中识别决策模式</li>
              <li>💾 <strong>持久化</strong>：保存所有历史数据用于学习</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-cyan-400 mb-2">信念观察者 (Belief Observer)</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>🔮 <strong>自动推断</strong>：从行为模式推断信念系统</li>
              <li>📈 <strong>置信度评估</strong>：评估信念的可靠性</li>
              <li>🎯 <strong>三维分析</strong>：世界观、自我观、价值观</li>
              <li>⚡ <strong>实时更新</strong>：随着新行为动态调整信念</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}