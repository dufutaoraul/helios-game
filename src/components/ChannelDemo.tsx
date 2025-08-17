'use client';

import { useState, useEffect } from 'react';

interface ChannelMessage {
  type: 'dialogue' | 'action' | 'environment';
  character?: string;
  content?: string;
  description?: string;
  timestamp: number;
  scene_id: string;
}

export default function ChannelDemo() {
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps = [
    {
      delay: 0,
      message: {
        type: 'environment' as const,
        description: '夜幕降临，酒馆里烟雾缭绕，烛光摇曳',
        timestamp: Date.now(),
        scene_id: 'tavern_main_hall'
      }
    },
    {
      delay: 1000,
      message: {
        type: 'action' as const,
        character: '林溪',
        description: '推开酒馆的门，扫视了一下里面的情况',
        timestamp: Date.now(),
        scene_id: 'tavern_main_hall'
      }
    },
    {
      delay: 1500,
      message: {
        type: 'dialogue' as const,
        character: '林溪',
        content: '哟，新来的？也是要通宵啊。',
        timestamp: Date.now(),
        scene_id: 'tavern_main_hall'
      }
    },
    {
      delay: 2500,
      message: {
        type: 'action' as const,
        character: '陈浩',
        description: '猛地一拍桌子',
        timestamp: Date.now(),
        scene_id: 'tavern_main_hall'
      }
    },
    {
      delay: 3000,
      message: {
        type: 'dialogue' as const,
        character: '陈浩',
        content: '我不是来找麻烦的，只是想安静地喝一杯。',
        timestamp: Date.now(),
        scene_id: 'tavern_main_hall'
      }
    },
    {
      delay: 4000,
      message: {
        type: 'environment' as const,
        description: '咖啡吧的灯光闪烁了一下，然后恢复正常',
        timestamp: Date.now(),
        scene_id: 'tavern_main_hall'
      }
    },
    {
      delay: 5000,
      message: {
        type: 'action' as const,
        character: '林溪',
        description: '慢慢走向陈浩的桌子，眼神变得锐利',
        timestamp: Date.now(),
        scene_id: 'tavern_main_hall'
      }
    },
    {
      delay: 6000,
      message: {
        type: 'dialogue' as const,
        character: '林溪',
        content: '安静？在我的地盘上，没有什么是真正安静的。',
        timestamp: Date.now(),
        scene_id: 'tavern_main_hall'
      }
    }
  ];

  const startDemo = () => {
    setIsPlaying(true);
    setMessages([]);
    setCurrentStep(0);
    
    demoSteps.forEach((step, index) => {
      setTimeout(() => {
        setMessages(prev => [...prev, step.message]);
        setCurrentStep(index + 1);
      }, step.delay);
    });
  };

  const resetDemo = () => {
    setMessages([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'dialogue': return '💬';
      case 'action': return '🎭';
      case 'environment': return '🌍';
      default: return '📝';
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'dialogue': return 'bg-blue-600/20 border-blue-500/30';
      case 'action': return 'bg-purple-600/20 border-purple-500/30';
      case 'environment': return 'bg-green-600/20 border-green-500/30';
      default: return 'bg-gray-600/20 border-gray-500/30';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 控制面板 */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">📡 频道模拟系统控制台</h2>
          <div className="space-x-4">
            <button
              onClick={startDemo}
              disabled={isPlaying}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {isPlaying ? '🎬 演示进行中...' : '▶️ 开始演示'}
            </button>
            <button
              onClick={resetDemo}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              🔄 重置
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-center">
          <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500/30">
            <h3 className="font-bold text-blue-400 mb-2">💬 对话消息</h3>
            <p className="text-2xl font-bold">
              {messages.filter(m => m.type === 'dialogue').length}
            </p>
            <p className="text-sm text-gray-400">角色主动选择要说的话</p>
          </div>
          <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/30">
            <h3 className="font-bold text-purple-400 mb-2">🎭 行为消息</h3>
            <p className="text-2xl font-bold">
              {messages.filter(m => m.type === 'action').length}
            </p>
            <p className="text-sm text-gray-400">身体语言和无意识行为</p>
          </div>
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-500/30">
            <h3 className="font-bold text-green-400 mb-2">🌍 环境事件</h3>
            <p className="text-2xl font-bold">
              {messages.filter(m => m.type === 'environment').length}
            </p>
            <p className="text-sm text-gray-400">影响所有角色的客观事实</p>
          </div>
        </div>
      </div>

      {/* 场景显示 */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">🏛️ 场景：港口酒馆主厅</h3>
        <div className="bg-gray-900/50 rounded-lg p-4 min-h-[400px]">
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message-bubble p-4 rounded-lg border ${getMessageStyle(message.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getMessageIcon(message.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-white text-sm">
                        {message.type.toUpperCase()}
                      </span>
                      {message.character && (
                        <span className="text-yellow-400 font-medium">
                          [{message.character}]
                        </span>
                      )}
                      <span className="text-gray-400 text-xs">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-200">
                      {message.content || message.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isPlaying && currentStep < demoSteps.length && (
              <div className="animate-pulse text-center py-4">
                <div className="inline-block w-2 h-2 bg-blue-500 rounded-full mx-1 animate-bounce"></div>
                <div className="inline-block w-2 h-2 bg-purple-500 rounded-full mx-1 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="inline-block w-2 h-2 bg-green-500 rounded-full mx-1 animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 技术说明 */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">🔍 技术原理解析</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-bold text-cyan-400 mb-2">三类信息的哲学意义</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>💬 <strong>对话</strong>：角色主动选择要让外界知道的想法</li>
              <li>🎭 <strong>行为</strong>：身体语言往往比话语更真实</li>
              <li>🌍 <strong>环境</strong>：构成所有角色都必须认同的"客观"基础</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-orange-400 mb-2">系统特点</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✅ 实时消息分发和订阅机制</li>
              <li>✅ 支持场景和消息类型过滤</li>
              <li>✅ 完整的消息历史记录</li>
              <li>✅ 为信念观察者提供行为分析数据</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}