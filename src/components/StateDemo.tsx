'use client';

import { useState, useEffect } from 'react';

interface InternalState {
  energy: number;
  focus: number;
  curiosity: number;
  recent_memories: string[];
  current_goal?: string;
  emotional_state?: string;
  last_updated: number;
}

interface Character {
  id: string;
  name: string;
  state: InternalState;
}

export default function StateDemo() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const initialCharacters: Character[] = [
    {
      id: 'linxi',
      name: '林溪',
      state: {
        energy: 85,
        focus: 70,
        curiosity: 60,
        recent_memories: ['进入了酒馆', '观察了周围环境'],
        current_goal: '评估新来的人',
        emotional_state: '警觉',
        last_updated: Date.now()
      }
    },
    {
      id: 'chenhao',
      name: '陈浩',
      state: {
        energy: 45,
        focus: 90,
        curiosity: 30,
        recent_memories: ['被注意了', '感到紧张'],
        current_goal: '保持低调',
        emotional_state: '紧张',
        last_updated: Date.now()
      }
    }
  ];

  const stateModifiers = [
    {
      step: 1,
      character: 'linxi',
      changes: { focus: 80, curiosity: 70 },
      reason: '开始主动接触'
    },
    {
      step: 2,
      character: 'chenhao',
      changes: { energy: 35, focus: 95 },
      reason: '感受到压力'
    },
    {
      step: 3,
      character: 'linxi',
      changes: { energy: 80, curiosity: 85 },
      reason: '发现有趣的反应'
    },
    {
      step: 4,
      character: 'chenhao',
      changes: { energy: 25, focus: 85, curiosity: 40 },
      reason: '决定反击'
    },
    {
      step: 5,
      character: 'linxi',
      changes: { energy: 90, focus: 85, curiosity: 90 },
      reason: '兴奋于对抗'
    }
  ];

  useEffect(() => {
    setCharacters(initialCharacters);
    setSelectedCharacter(initialCharacters[0].id);
  }, []);

  const startDemo = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setCharacters(initialCharacters);
    
    stateModifiers.forEach((modifier, index) => {
      setTimeout(() => {
        setCurrentStep(index + 1);
        setCharacters(prev => prev.map(char => {
          if (char.id === modifier.character) {
            const newMemory = `步骤${index + 1}: ${modifier.reason}`;
            return {
              ...char,
              state: {
                ...char.state,
                ...modifier.changes,
                recent_memories: [...char.state.recent_memories.slice(-3), newMemory],
                last_updated: Date.now()
              }
            };
          }
          return char;
        }));
      }, (index + 1) * 2000);
    });

    setTimeout(() => {
      setIsRunning(false);
    }, stateModifiers.length * 2000 + 1000);
  };

  const resetDemo = () => {
    setCharacters(initialCharacters);
    setCurrentStep(0);
    setIsRunning(false);
  };

  const getProgressWidth = (value: number) => `${value}%`;
  const getProgressColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const selectedChar = characters.find(c => c.id === selectedCharacter);

  return (
    <div className="max-w-6xl mx-auto">
      {/* 控制面板 */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">🧠 内在状态系统控制台</h2>
          <div className="space-x-4">
            <button
              onClick={startDemo}
              disabled={isRunning}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
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

        {/* 角色选择 */}
        <div className="flex space-x-4 mb-4">
          {characters.map(char => (
            <button
              key={char.id}
              onClick={() => setSelectedCharacter(char.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCharacter === char.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {char.name}
            </button>
          ))}
        </div>

        {isRunning && (
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
            <p className="text-blue-400">
              🔄 进度: 步骤 {currentStep} / {stateModifiers.length}
            </p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 状态可视化 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">📊 {selectedChar?.name} 的内在状态</h3>
          
          {selectedChar && (
            <div className="space-y-4">
              {/* 能量值 */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-red-400 font-medium">⚡ 能量</span>
                  <span className="text-white">{selectedChar.state.energy}%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-3">
                  <div 
                    className={`status-bar energy h-full rounded-full transition-all duration-500 ${getProgressColor(selectedChar.state.energy)}`}
                    style={{ width: getProgressWidth(selectedChar.state.energy) }}
                  ></div>
                </div>
              </div>

              {/* 专注度 */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-blue-400 font-medium">🎯 专注度</span>
                  <span className="text-white">{selectedChar.state.focus}%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-3">
                  <div 
                    className={`status-bar focus h-full rounded-full transition-all duration-500 ${getProgressColor(selectedChar.state.focus)}`}
                    style={{ width: getProgressWidth(selectedChar.state.focus) }}
                  ></div>
                </div>
              </div>

              {/* 好奇心 */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-purple-400 font-medium">🔮 好奇心</span>
                  <span className="text-white">{selectedChar.state.curiosity}%</span>
                </div>
                <div className="bg-gray-700 rounded-full h-3">
                  <div 
                    className={`status-bar curiosity h-full rounded-full transition-all duration-500 ${getProgressColor(selectedChar.state.curiosity)}`}
                    style={{ width: getProgressWidth(selectedChar.state.curiosity) }}
                  ></div>
                </div>
              </div>

              {/* 情绪和目标 */}
              <div className="mt-6 space-y-3">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-yellow-400 font-medium">😊 情绪状态: </span>
                  <span className="text-white">{selectedChar.state.emotional_state}</span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-green-400 font-medium">🎯 当前目标: </span>
                  <span className="text-white">{selectedChar.state.current_goal}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 记忆和行为分析 */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">🧠 记忆与行为分析</h3>
          
          {selectedChar && (
            <div>
              <h4 className="text-lg font-medium text-cyan-400 mb-3">📚 近期记忆</h4>
              <div className="space-y-2 mb-6">
                {selectedChar.state.recent_memories.map((memory, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg animate-fade-in">
                    <span className="text-gray-400 text-sm">#{index + 1}</span>
                    <p className="text-gray-200">{memory}</p>
                  </div>
                ))}
              </div>

              <h4 className="text-lg font-medium text-orange-400 mb-3">🔍 状态分析</h4>
              <div className="space-y-2">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-gray-400">行为倾向: </span>
                  <span className="text-white">
                    {selectedChar.state.energy > 60 && selectedChar.state.focus > 60 ? '主动进攻型' :
                     selectedChar.state.focus > selectedChar.state.energy ? '谨慎观察型' : 
                     '被动防御型'}
                  </span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-gray-400">决策风格: </span>
                  <span className="text-white">
                    {selectedChar.state.curiosity > 70 ? '探索导向' :
                     selectedChar.state.focus > 80 ? '目标导向' : 
                     '稳健保守'}
                  </span>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <span className="text-gray-400">压力水平: </span>
                  <span className={selectedChar.state.energy < 40 ? 'text-red-400' : 
                                   selectedChar.state.energy < 70 ? 'text-yellow-400' : 'text-green-400'}>
                    {selectedChar.state.energy < 40 ? '高压力' :
                     selectedChar.state.energy < 70 ? '中等压力' : '低压力'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 技术说明 */}
      <div className="bg-gray-800 rounded-lg p-6 mt-6">
        <h3 className="text-xl font-bold mb-4">🔍 技术原理解析</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-purple-400 mb-2">内在状态设计理念</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>⚡ <strong>能量</strong>：影响行动的积极性和持续性</li>
              <li>🎯 <strong>专注度</strong>：影响决策的准确性和深度</li>
              <li>🔮 <strong>好奇心</strong>：影响探索新事物的倾向</li>
              <li>🧠 <strong>记忆</strong>：塑造角色的行为模式和反应</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-cyan-400 mb-2">系统特点</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✅ 完全私有，不对其他AI可见</li>
              <li>✅ 动态变化，响应环境刺激</li>
              <li>✅ 影响AI的决策和行为倾向</li>
              <li>✅ 为信念观察者提供行为分析基础</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}