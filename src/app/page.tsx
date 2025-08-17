'use client';

import { useState } from 'react';
import ChannelDemo from '@/components/ChannelDemo';
import StateDemo from '@/components/StateDemo';
import DatabaseDemo from '@/components/DatabaseDemo';
import ApiDemo from '@/components/ApiDemo';
import FullSystemDemo from '@/components/FullSystemDemo';
import GameInterface from '@/components/GameInterface';
import WorldEngineInterface from '@/components/WorldEngineInterface';

type DemoType = 'channel' | 'state' | 'database' | 'api' | 'full' | 'game' | 'world-engine' | null;

export default function Home() {
  const [currentDemo, setCurrentDemo] = useState<DemoType>('world-engine'); // 🔧 修复：默认进入世界引擎
  const [isRunning, setIsRunning] = useState(true);

  const demos = [
    {
      id: 'world-engine' as const,
      icon: '🌍',
      title: '世界引擎 - 活着的世界',
      description: '🚀 NEW! 实时世界模拟器：AI拥有自主生活，世界永不停止，内心想法完全隐藏',
      color: 'bg-gradient-to-r from-cyan-500 to-blue-500'
    },
    {
      id: 'game' as const,
      icon: '🎮',
      title: '互动游戏体验',
      description: '🔥 真正的三人互动！你作为玩家与两个AI角色实时对话和互动',
      color: 'bg-red-500'
    },
    {
      id: 'channel' as const,
      icon: '📡',
      title: '频道模拟系统演示',
      description: '展示三类信息的记录和处理、消息分发、行为分析',
      color: 'bg-blue-500'
    },
    {
      id: 'state' as const,
      icon: '🧠',
      title: '内在状态系统演示',
      description: '展示AI NPC的私有状态管理、状态修改器、行为倾向分析',
      color: 'bg-purple-500'
    },
    {
      id: 'database' as const,
      icon: '🗄️',
      title: '数据库模拟系统演示',
      description: '展示完整的数据流程、行为记录、信念生成',
      color: 'bg-green-500'
    },
    {
      id: 'api' as const,
      icon: '🤖',
      title: 'DeepSeek API测试',
      description: '测试API连接、AI推理功能、性能基准',
      color: 'bg-orange-500'
    },
    {
      id: 'full' as const,
      icon: '🎭',
      title: '完整系统集成演示',
      description: '运行所有演示，展示完整的系统功能',
      color: 'bg-indigo-500'
    }
  ];

  const startDemo = (demoId: DemoType) => {
    setCurrentDemo(demoId);
    setIsRunning(true);
  };

  const stopDemo = () => {
    setCurrentDemo(null);
    setIsRunning(false);
  };

  if (currentDemo) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">
              {demos.find(d => d.id === currentDemo)?.icon} {demos.find(d => d.id === currentDemo)?.title}
            </h1>
            <button
              onClick={stopDemo}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              🔙 返回主菜单
            </button>
          </div>
          
          {currentDemo === 'world-engine' && <WorldEngineInterface />}
          {currentDemo === 'game' && <GameInterface />}
          {currentDemo === 'channel' && <ChannelDemo />}
          {currentDemo === 'state' && <StateDemo />}
          {currentDemo === 'database' && <DatabaseDemo />}
          {currentDemo === 'api' && <ApiDemo />}
          {currentDemo === 'full' && <FullSystemDemo />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              🎭 赫利俄斯项目 MVP
            </h1>
            <h2 className="text-2xl text-yellow-300 mb-2">本我之镜</h2>
            <p className="text-lg text-gray-300">AI驱动的意识探索与演化沙盒游戏</p>
          </div>
          
          <div className="border-t border-b border-cyan-500 py-4 mb-8">
            <p className="text-cyan-300 text-lg">
              ✨ 不预设信念，从行为中发现真相 ✨
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-blue-500/30">
            <h3 className="text-xl font-bold text-blue-400 mb-2">🧠 AI意识模拟</h3>
            <p className="text-gray-300">每个AI拥有独立的内在状态和动态信念系统</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-purple-500/30">
            <h3 className="text-xl font-bold text-purple-400 mb-2">🎯 5步推理引擎</h3>
            <p className="text-gray-300">观察→内省→信念过滤→选项生成→决策</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-green-500/30">
            <h3 className="text-xl font-bold text-green-400 mb-2">🔮 信念观察者</h3>
            <p className="text-gray-300">从AI行为中自动推断世界观、自我观、价值观</p>
          </div>
        </div>

        {/* Demo Selection */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-8">
            🎮 选择体验模式
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demos.map((demo) => (
              <div key={demo.id} className="group">
                <div className={`bg-gray-800/70 hover:bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-500 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  demo.id === 'game' ? 'ring-2 ring-red-500/50 bg-red-900/20' : ''
                }`}
                     onClick={() => startDemo(demo.id)}>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-3">{demo.icon}</div>
                    <h3 className={`text-xl font-bold group-hover:text-cyan-400 transition-colors ${
                      demo.id === 'world-engine' ? 'text-cyan-400' :
                      demo.id === 'game' ? 'text-red-400' : 'text-white'
                    }`}>
                      {demo.title}
                    </h3>
                    {demo.id === 'world-engine' && (
                      <div className="text-cyan-300 text-sm font-medium mt-1">🚀 最新架构</div>
                    )}
                    {demo.id === 'game' && (
                      <div className="text-red-300 text-sm font-medium mt-1">🔥 推荐体验</div>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {demo.description}
                  </p>
                  <div className={`w-full h-1 ${demo.id === 'world-engine' ? demo.color : demo.color} rounded-full opacity-70 group-hover:opacity-100 transition-opacity`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start Tip */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-cyan-400 mb-2">🌍 终极架构体验</h3>
          <p className="text-gray-300 mb-3">
            全新推出 <span className="text-cyan-400 font-bold">🌍 世界引擎 - 活着的世界</span>！
            这是我们最新的架构成果，AI角色拥有真正的自主生活，世界永不停止运转。
          </p>
          <p className="text-yellow-300 text-sm">
            🚀 体验实时世界模拟、SSE事件流、内心想法隐藏等终极特性！
          </p>
        </div>

        {/* Technical Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>🔧 基于 Next.js + TypeScript + DeepSeek API 构建</p>
          <p>📚 详细文档请查看项目根目录的 README.md 和 ARCHITECTURE_EXPLAINED.md</p>
        </div>
      </div>
    </div>
  );
}