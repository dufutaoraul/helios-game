'use client';

import { useState, useEffect } from 'react';

interface SystemEvent {
  id: string;
  timestamp: number;
  type: 'channel' | 'state' | 'decision' | 'belief' | 'api';
  character?: string;
  content: string;
  details?: any;
  processed: boolean;
}

interface Character {
  id: string;
  name: string;
  energy: number;
  focus: number;
  curiosity: number;
  emotional_state: string;
  current_goal: string;
  beliefs: {
    worldview: string[];
    self_perception: string[];
    values: string[];
  };
}

export default function FullSystemDemo() {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<string>('linxi');

  const initialCharacters: Character[] = [
    {
      id: 'linxi',
      name: '林溪',
      energy: 85,
      focus: 70,
      curiosity: 60,
      emotional_state: '警觉',
      current_goal: '评估环境和潜在威胁',
      beliefs: {
        worldview: [],
        self_perception: [],
        values: []
      }
    },
    {
      id: 'chenhao',
      name: '陈浩',
      energy: 45,
      focus: 90,
      curiosity: 30,
      emotional_state: '紧张',
      current_goal: '保持低调，避免冲突',
      beliefs: {
        worldview: [],
        self_perception: [],
        values: []
      }
    }
  ];

  const demoScenario = [
    {
      step: 1,
      events: [
        {
          type: 'channel' as const,
          content: '环境信息：酒馆内灯光昏暗，空气中弥漫着酒精和烟草的味道',
          details: { message_type: 'environment', location: '酒馆' }
        },
        {
          type: 'channel' as const,
          character: 'linxi',
          content: '行为信息：林溪推开酒馆门，目光扫视室内',
          details: { message_type: 'action', action: '进入并观察' }
        }
      ],
      stateChanges: {
        linxi: { focus: 75, curiosity: 65 }
      }
    },
    {
      step: 2,
      events: [
        {
          type: 'state' as const,
          character: 'linxi',
          content: '状态更新：专注度提升至75，好奇心增加至65',
          details: { focus: 75, curiosity: 65, reason: '环境评估' }
        },
        {
          type: 'channel' as const,
          character: 'chenhao',
          content: '行为信息：陈浩注意到新来者，手不自觉握紧酒杯',
          details: { message_type: 'action', action: '警觉反应' }
        }
      ],
      stateChanges: {
        chenhao: { energy: 40, focus: 95 }
      }
    },
    {
      step: 3,
      events: [
        {
          type: 'api' as const,
          character: 'linxi',
          content: 'AI推理：开始5步决策过程分析',
          details: { api_call: 'decision_engine', model: 'deepseek-chat' }
        },
        {
          type: 'decision' as const,
          character: 'linxi',
          content: '决策分析：观察→内省→信念过滤→选项生成→决策',
          details: {
            step1: '观察到一个紧张的男子',
            step2: '我的出现让他感到威胁',
            step3: '基于经验，紧张往往隐藏秘密',
            step4: ['直接接触', '继续观察', '假装不在意'],
            step5: '选择继续观察，收集更多信息'
          }
        }
      ],
      stateChanges: {
        linxi: { curiosity: 80, current_goal: '深入观察陈浩的行为' }
      }
    },
    {
      step: 4,
      events: [
        {
          type: 'belief' as const,
          character: 'linxi',
          content: '信念生成：从行为中推断出新的世界观',
          details: {
            new_worldview: '环境中的异常行为往往暗示隐藏信息',
            confidence: 0.75
          }
        },
        {
          type: 'channel' as const,
          character: 'linxi',
          content: '对话信息：来杯威士忌，不加冰',
          details: { message_type: 'dialogue', tone: '平静但观察' }
        }
      ],
      beliefUpdates: {
        linxi: {
          worldview: ['环境中的异常行为往往暗示隐藏信息'],
          self_perception: ['我具备敏锐的观察和分析能力'],
          values: ['信息获取', '战略思考']
        }
      }
    },
    {
      step: 5,
      events: [
        {
          type: 'api' as const,
          character: 'chenhao',
          content: 'AI推理：分析林溪的行为意图',
          details: { api_call: 'decision_engine', model: 'deepseek-chat' }
        },
        {
          type: 'decision' as const,
          character: 'chenhao',
          content: '决策分析：感受到被观察的压力',
          details: {
            step1: '林溪在观察我',
            step2: '我感到不安和威胁',
            step3: '我需要保护自己的秘密',
            step4: ['立即离开', '主动交流', '继续伪装'],
            step5: '选择继续伪装，但准备应对'
          }
        }
      ],
      stateChanges: {
        chenhao: { energy: 30, focus: 85, emotional_state: '高度警觉' }
      }
    },
    {
      step: 6,
      events: [
        {
          type: 'belief' as const,
          character: 'chenhao',
          content: '信念生成：强化自我保护意识',
          details: {
            new_self_perception: '我必须时刻保持警惕以保护自己',
            confidence: 0.85
          }
        },
        {
          type: 'channel' as const,
          content: '环境信息：酒馆内的气氛变得微妙，其他客人开始注意到两人间的暗流',
          details: { message_type: 'environment', tension_level: 'rising' }
        }
      ],
      beliefUpdates: {
        chenhao: {
          worldview: ['世界充满潜在威胁和危险'],
          self_perception: ['我必须时刻保持警惕以保护自己'],
          values: ['安全', '隐私', '生存']
        }
      }
    }
  ];

  const startDemo = () => {
    setIsRunning(true);
    setEvents([]);
    setCharacters(initialCharacters);
    setCurrentStep(0);

    demoScenario.forEach((scenario, scenarioIndex) => {
      scenario.events.forEach((eventData, eventIndex) => {
        const delay = (scenarioIndex * 3 + eventIndex) * 2000;
        
        setTimeout(() => {
          const newEvent: SystemEvent = {
            id: `event-${scenarioIndex}-${eventIndex}`,
            timestamp: Date.now(),
            type: eventData.type,
            character: eventData.character,
            content: eventData.content,
            details: eventData.details,
            processed: false
          };

          setEvents(prev => [...prev, newEvent]);

          setTimeout(() => {
            setEvents(prev => prev.map(e => 
              e.id === newEvent.id ? { ...e, processed: true } : e
            ));

            if (scenario.stateChanges) {
              setCharacters(prev => prev.map(char => {
                const changes = scenario.stateChanges[char.id];
                if (changes) {
                  return { ...char, ...changes };
                }
                return char;
              }));
            }

            if (scenario.beliefUpdates) {
              setCharacters(prev => prev.map(char => {
                const beliefUpdate = scenario.beliefUpdates[char.id];
                if (beliefUpdate) {
                  return {
                    ...char,
                    beliefs: {
                      worldview: [...char.beliefs.worldview, ...beliefUpdate.worldview],
                      self_perception: [...char.beliefs.self_perception, ...beliefUpdate.self_perception],
                      values: [...char.beliefs.values, ...beliefUpdate.values]
                    }
                  };
                }
                return char;
              }));
            }
          }, 1000);
        }, delay);
      });

      setTimeout(() => {
        setCurrentStep(scenarioIndex + 1);
      }, (scenarioIndex * 3 + 2) * 2000);
    });

    setTimeout(() => {
      setIsRunning(false);
    }, demoScenario.length * 6000 + 2000);
  };

  const resetDemo = () => {
    setEvents([]);
    setCharacters(initialCharacters);
    setCurrentStep(0);
    setIsRunning(false);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'channel': return '📡';
      case 'state': return '🧠';
      case 'decision': return '🎯';
      case 'belief': return '🔮';
      case 'api': return '🤖';
      default: return '📝';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'channel': return 'border-blue-500 bg-blue-900/20';
      case 'state': return 'border-purple-500 bg-purple-900/20';
      case 'decision': return 'border-orange-500 bg-orange-900/20';
      case 'belief': return 'border-cyan-500 bg-cyan-900/20';
      case 'api': return 'border-green-500 bg-green-900/20';
      default: return 'border-gray-500 bg-gray-900/20';
    }
  };

  const selectedChar = characters.find(c => c.id === selectedCharacter);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">🎭 完整系统集成演示</h2>
          <div className="space-x-4">
            <button
              onClick={startDemo}
              disabled={isRunning}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {isRunning ? '🎬 演示进行中...' : '▶️ 开始完整演示'}
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
          {characters.map(char => (
            <button
              key={char.id}
              onClick={() => setSelectedCharacter(char.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCharacter === char.id
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {char.name}
            </button>
          ))}
        </div>

        {isRunning && (
          <div className="bg-red-900/30 p-4 rounded-lg border border-red-500/30">
            <p className="text-red-400">
              🔄 系统演示进度: 场景 {currentStep} / {demoScenario.length}
            </p>
            <div className="mt-2 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-red-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / demoScenario.length) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🌊 系统事件流</h3>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>系统待机中，点击"开始完整演示"查看所有系统协同工作</p>
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 rounded-lg border transition-all duration-500 ${
                    event.processed ? 'opacity-100' : 'opacity-60'
                  } ${getEventColor(event.type)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getEventIcon(event.type)}</span>
                      <span className="font-medium text-white capitalize">{event.type}</span>
                      {event.character && (
                        <span className="text-sm text-gray-400">- {characters.find(c => c.id === event.character)?.name}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {event.processed && <span className="text-green-400 text-sm">✅</span>}
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-200 mb-2">{event.content}</p>
                  {event.details && (
                    <div className="bg-gray-700 p-2 rounded text-sm">
                      <pre className="text-gray-300 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">👤 {selectedChar?.name} 实时状态</h3>
          
          {selectedChar && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-red-400">⚡ 能量</span>
                    <span className="text-white">{selectedChar.energy}%</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedChar.energy}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-400">🎯 专注度</span>
                    <span className="text-white">{selectedChar.focus}%</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedChar.focus}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-purple-400">🔮 好奇心</span>
                    <span className="text-white">{selectedChar.curiosity}%</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${selectedChar.curiosity}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-yellow-400 font-medium">😊 情绪: </span>
                  <span className="text-white">{selectedChar.emotional_state}</span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-green-400 font-medium">🎯 目标: </span>
                  <span className="text-white text-sm">{selectedChar.current_goal}</span>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-cyan-400 mb-3">🔮 信念系统</h4>
                
                {selectedChar.beliefs.worldview.length === 0 && 
                 selectedChar.beliefs.self_perception.length === 0 && 
                 selectedChar.beliefs.values.length === 0 ? (
                  <p className="text-gray-500 text-sm">信念系统尚未形成，等待行为数据积累...</p>
                ) : (
                  <div className="space-y-3">
                    {selectedChar.beliefs.worldview.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-blue-400 mb-1">🌍 世界观</h5>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {selectedChar.beliefs.worldview.map((view, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-400 mr-2">•</span>
                              {view}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedChar.beliefs.self_perception.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-purple-400 mb-1">👤 自我认知</h5>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {selectedChar.beliefs.self_perception.map((perception, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-purple-400 mr-2">•</span>
                              {perception}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedChar.beliefs.values.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-yellow-400 mb-1">💎 价值观</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedChar.beliefs.values.map((value, index) => (
                            <span key={index} className="bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded text-xs">
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h3 className="text-xl font-bold mb-4">🎯 "本我之镜" 核心理念演示</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-red-400 mb-2">🔍 系统集成特点</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📡 <strong>频道系统</strong>：实时分类处理对话、行为、环境信息</li>
              <li>🧠 <strong>内在状态</strong>：每个AI拥有独立的心理状态系统</li>
              <li>🎯 <strong>决策引擎</strong>：5步渐进式推理框架指导AI决策</li>
              <li>🔮 <strong>信念观察者</strong>：从行为中自动推断世界观、自我观、价值观</li>
              <li>🤖 <strong>API集成</strong>：真实AI推理 + 智能降级机制</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-cyan-400 mb-2">✨ 哲学创新</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>🪞 <strong>本我之镜</strong>：不预设信念，从行为中发现真相</li>
              <li>🎭 <strong>意识演化</strong>：AI角色在互动中自然形成独特人格</li>
              <li>🔒 <strong>隐私保护</strong>：每个AI的内在状态完全私有</li>
              <li>🌱 <strong>动态成长</strong>：信念系统随经历不断演化</li>
              <li>🎪 <strong>真实互动</strong>：基于真实心理状态的自然对话</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-6 bg-gradient-to-r from-red-900/30 to-cyan-900/30 border border-red-500/30 rounded-lg p-4">
          <p className="text-center text-lg text-white">
            🎭 <strong>"每个AI都是一面镜子，映照出行为背后的真实自我"</strong> 🎭
          </p>
          <p className="text-center text-sm text-gray-300 mt-2">
            通过观察AI的行为模式，我们不仅能理解它们的决策逻辑，更能发现它们独特的世界观和价值体系
          </p>
        </div>
      </div>
    </div>
  );
}