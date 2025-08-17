'use client';

import { useState, useEffect, useRef } from 'react';
import { getCoreAICharacters } from '@/lib/character_configs';

interface Character {
  id: string;
  name: string;
  type: 'player' | 'ai';
  avatar: string;
  description: string;
  status: string;
  energy: number;
  mood: string;
}

// 🆕 支持言行合一的消息接口
interface Message {
  id: string;
  character: string;
  content: string;
  type: 'dialogue' | 'action' | 'thought';
  timestamp: number;
  // 🆕 言行合一扩展字段
  actionData?: {
    dialogue?: string;
    action?: string;
    thought?: string;
  };
  // 🆕 动态角色身份显示字段
  displayName?: string;
  characterAvatar?: string;
}

interface GameState {
  location: string;
  description: string;
  atmosphere: string;
  tension: number;
}

export default function GameInterface() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  // 🆕 玩家输入模式状态
  const [inputMode, setInputMode] = useState<'dialogue' | 'action'>('dialogue');
  // 🆕 移动端侧边栏状态
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    location: '月影酒馆',
    description: '昏暗的灯光下，木质桌椅散发着岁月的痕迹。空气中弥漫着酒精和烟草的味道，角落里传来低沉的交谈声。',
    atmosphere: '紧张而神秘',
    tension: 30
  });

  // 终极简化：只保留核心AI角色
  const initializeCharacters = () => {
    const gameCharacters: Character[] = [
      {
        id: 'player',
        name: '',
        type: 'player',
        avatar: '🧑‍💼',
        description: '一个神秘的访客，刚刚踏入这个充满秘密的世界',
        status: '刚刚到达',
        energy: 100,
        mood: '好奇'
      }
    ];
    
    // 只添加核心AI角色（林溪、陈浩）
    getCoreAICharacters().forEach(config => {
      gameCharacters.push({
        id: config.id,
        name: config.name,
        type: 'ai',
        avatar: config.avatar || '🤖',
        description: config.description || config.motivation.substring(0, 50) + '...',
        status: '正在观察新来者',
        energy: 85,
        mood: '警觉'
      });
    });
    
    return gameCharacters;
  };
  
  const [characters, setCharacters] = useState<Character[]>(initializeCharacters());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🆕 优化的滚动体验 - 智能滚动和延迟
  const scrollToBottom = (immediate: boolean = false) => {
    if (messagesEndRef.current) {
      const scrollContainer = messagesEndRef.current.parentElement;
      if (scrollContainer) {
        // 检查用户是否在底部附近（100px内）
        const isNearBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight < 100;
        
        if (immediate || isNearBottom) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: immediate ? "auto" : "smooth",
            block: "end" 
          });
        }
      }
    }
  };

  // 🆕 智能滚动逻辑 - 新消息时延迟滚动以确保内容已渲染
  useEffect(() => {
    if (messages.length > 0) {
      // 短暂延迟确保DOM已更新
      const timeoutId = setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  // 🆕 向后兼容的简单消息添加
  const addMessage = (character: string, content: string, type: 'dialogue' | 'action' | 'thought') => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      character,
      content,
      type,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  // 🆕 言行合一消息添加器（支持动态角色身份）
  const addActionPackageMessage = (character: string, actionPackage: any, characterInfo?: any) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      character,
      content: actionPackage.dialogue || actionPackage.content || '...',
      type: actionPackage.actionType || 'dialogue',
      timestamp: Date.now(),
      actionData: {
        dialogue: actionPackage.dialogue,
        action: actionPackage.action,
        thought: actionPackage.thought // 🔒 内心想法仍保存在数据中，但不显示
      },
      // 🆕 动态角色身份信息
      displayName: characterInfo?.name || character,
      characterAvatar: characterInfo?.avatar
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  // 🆕 终极AI响应生成器 - 核心AI + 万能系统 AI（支持输入类型）
  const generateAIResponse = async (playerMessage: string, playerInputType: 'dialogue' | 'action' = 'dialogue') => {
    const lowerMessage = playerMessage.toLowerCase();
    
    // 检查是否@了核心AI角色
    const isTargetingLinxi = lowerMessage.includes('@林溪') || lowerMessage.includes('@linxi');
    const isTargetingChenhao = lowerMessage.includes('@陈浩') || lowerMessage.includes('@chenhao');
    
    // 使用终极调度中心处理AI响应
    const callIntelligentDispatchCenter = async (userMessage: string) => {
      try {
        console.log(`📡 调用终极调度中心: "${userMessage}"`);
        
        // 构建聊天历史
        const recentMessages = messages.slice(-5).map(m => 
          `${m.character === 'player' ? playerName : m.character === 'system' ? '系统' : m.character}: ${m.content}`
        ).join('\n');
        
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userMessage: userMessage,
            chatHistory: recentMessages,
            playerName: playerName,
            playerInputType: playerInputType // 🆕 传递玩家输入类型
          })
        });

        if (!response.ok) {
          throw new Error(`终极调度中心请求失败: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ 终极调度中心响应:`, data);
        
        return data;
        
      } catch (error) {
        console.error(`❌ 终极调度中心调用失败:`, error);
        throw error;
      }
    };

    // 🆕 处理终极调度中心的响应结果（言行合一版本）
    const handleDispatchCenterResponse = (data: any) => {
      if (!data.success) {
        throw new Error(data.error || '终极调度中心响应失败');
      }

      if (data.routingType === 'CORE_AI_DIRECT') {
        // 🆕 核心AI的直接响应（ActionPackage）
        const character = data.character;
        const actionPackage = data.actionPackage;
        
        console.log(`🎯 核心AI言行合一响应: ${character.name}`, actionPackage);
        
        // 使用新的ActionPackage消息添加器
        addActionPackageMessage(character.id, actionPackage, character);
        
        // 更新核心AI状态
        setCharacters(prev => prev.map(char => 
          char.id === character.id ? { 
            ...char, 
            status: '正在回应',
            energy: Math.max(char.energy - 3, 0)
          } : char
        ));
        
      } else if (data.routingType === 'CORE_AI_PARALLEL') {
        // 🆕 并行核心AI响应处理
        const responses = data.responses || [];
        
        console.log(`🎭 并行核心AI响应: ${responses.length}个AI同时回应`);
        
        // 处理所有并行响应
        responses.forEach(({ character, actionPackage }: any) => {
          addActionPackageMessage(character.id, actionPackage, character);
          
          // 更新对应AI状态
          setCharacters(prev => prev.map(char => 
            char.id === character.id ? { 
              ...char, 
              status: '正在回应',
              energy: Math.max(char.energy - 5, 0) // 并行响应消耗更多能量
            } : char
          ));
        });
        
      } else if (data.routingType === 'UNIVERSAL_SYSTEM_AI') {
        // 🆕 万能系统AI的动态响应（ActionPackage）
        const character = data.character;
        const actionPackage = data.actionPackage;
        
        console.log(`🌌 万能系统AI言行合一响应: 动态角色扮演 ${character.name}`, actionPackage);
        
        // 🎭 万能系统AI使用动态角色身份
        addActionPackageMessage('system', actionPackage, character);
        
        // 不需要更新角色状态，因为系统AI不在角色列表中
      } else if (data.action) {
        // 🆕 向后兼容：处理旧格式的简单action响应
        const character = data.character;
        const action = data.action;
        
        console.log(`📦 向后兼容响应: ${character?.name || 'Unknown'}`);
        
        const messageType = action.actionType === 'dialogue' ? 'dialogue' : 'action';
        addMessage(character?.id || 'system', action.content, messageType);
      }
    };

    // 特殊处理@指定核心AI的情况
    if (isTargetingLinxi || isTargetingChenhao) {
      const delay = 1000 + Math.random() * 2000;
      setTimeout(async () => {
        try {
          const result = await callIntelligentDispatchCenter(playerMessage);
          handleDispatchCenterResponse(result);
        } catch (error) {
          console.error('核心AI响应失败:', error);
          addMessage('system', '📡 AI响应暂时中断了...', 'thought');
        }
      }, delay);
      return; // 提前返回，避免重复处理
    }

    // 公共消息：终极调度中心处理（核心AI 或 万能系统 AI）
    if (!isTargetingLinxi && !isTargetingChenhao) {
      const delay = 1000 + Math.random() * 2000;
      setTimeout(async () => {
        try {
          const result = await callIntelligentDispatchCenter(playerMessage);
          handleDispatchCenterResponse(result);
        } catch (error) {
          console.error('终极调度失败:', error);
          // 不再使用任何硬编码的兜底响应
          addMessage('system', '🌌 系统暂时无法响应，请稍后再试...', 'thought');
        }
      }, delay);
    }
  };

  const startGame = () => {
    if (!playerName.trim()) return;
    
    setCharacters(prev => prev.map(char => 
      char.id === 'player' ? { ...char, name: playerName } : char
    ));
    
    setGameStarted(true);
    
    // 🎭 全新设计：自然的匿名进入开场序列
    // 设计哲学：模拟真实酒馆的社交逻辑，陌生人进入时的自然反应
    const initializeNaturalOpening = async () => {
      // 第一阶段：匿名环境描述（不暴露玩家姓名）
      const anonymousEnvironmentMessages = [
        '一位陌生的访客推开了月影酒馆厚重的木门...',
        '酒馆的门被轻轻推开，一个身影踏入了昏暗的空间...',
        '门铃轻响，一位新客人走进了月影酒馆...'
      ];
      
      const selectedEnv = anonymousEnvironmentMessages[Math.floor(Math.random() * anonymousEnvironmentMessages.length)];
      
      setTimeout(() => {
        addMessage('system', selectedEnv, 'action');
      }, 1000);
      
      // 第二阶段：环境反应（描述其他人的自然反应）
      setTimeout(() => {
        addMessage('system', '酒馆内的几道目光不约而同地投向门口，打量着这位新来者...', 'action');
      }, 2500);
      
      // 第三阶段：自然的社交响应（只有合理的角色会主动响应）
      // 🎭 核心设计改变：不再强制所有AI响应，而是根据角色性格和社交逻辑决定
      setTimeout(async () => {
        try {
          // 🎭 自然开场：让系统AI作为酒保自然地询问新客人
          const naturalGreeting = '有新客人进入酒馆，作为酒保，我应该主动询问';
          
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userMessage: naturalGreeting,
              chatHistory: '', 
              playerName: '', // 🎭 关键：不传递玩家姓名，保持匿名
              playerInputType: 'dialogue',
              isNaturalOpening: true // 🎭 标记为自然开场，用于特殊处理
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.actionPackage) {
              console.log(`🎭 自然开场：酒保主动招呼`, data.actionPackage);
              addActionPackageMessage('system', data.actionPackage, data.character);
            }
          }
        } catch (error) {
          console.error(`💥 自然开场异常:`, error);
        }
      }, 4000);
      
      // 第四阶段：核心AI的观察反应（低概率，符合真实社交逻辑）
      // 🎭 设计原则：大多数人会观察，只有少数人会主动说话
      getCoreAICharacters().forEach((character, index) => {
        // 🎭 基于角色性格的响应概率
        const naturalResponseChance = character.id === 'linxi' ? 0.4 : 0.2; // 林溪作为调查员更可能观察新人
        const delay = 5500 + (index * 2000) + Math.random() * 3000;
        
        if (Math.random() < naturalResponseChance) {
          setTimeout(async () => {
            try {
              console.log(`🎭 ${character.name} 基于性格选择观察新来者`);
              
              // 🎭 关键改变：发送观察行为而非预知姓名的消息
              const observationTrigger = '一位陌生人刚刚进入酒馆';
              
              const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userMessage: observationTrigger,
                  chatHistory: '', 
                  playerName: '', // 🎭 保持匿名
                  playerInputType: 'observation', // 🎭 特殊输入类型：观察
                  targetCharacter: character.id // 🎭 指定观察者而非强制响应
                })
              });

              if (response.ok) {
                const data = await response.json();
                if (data.success && data.actionPackage) {
                  console.log(`✅ ${character.name} 自然观察反应`, data.actionPackage);
                  addActionPackageMessage(character.id, data.actionPackage, data.character);
                  
                  // 更新角色状态
                  setCharacters(prev => prev.map(char => 
                    char.id === character.id ? { 
                      ...char, 
                      status: '正在观察新来者',
                      energy: Math.max(char.energy - 1, 0) // 观察消耗很少能量
                    } : char
                  ));
                }
              }
            } catch (error) {
              console.error(`💥 ${character.name} 观察反应异常:`, error);
            }
          }, delay);
        } else {
          console.log(`🤫 ${character.name} 选择安静地观察 (概率: ${Math.round(naturalResponseChance * 100)}%)`);
        }
      });
    };
    
    // 🎭 启动全新的自然开场序列
    initializeNaturalOpening();
  };

  // 🆕 支持双输入模式的发送消息函数
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // 🆕 根据输入模式决定消息类型
    const messageType = inputMode === 'action' ? 'action' : 'dialogue';
    
    // 🆕 为行动模式的消息添加括号格式
    const displayContent = inputMode === 'action' ? `(${inputMessage})` : inputMessage;
    
    addMessage('player', displayContent, messageType);
    const playerMessage = inputMessage;
    const playerInputType = inputMode; // 🆕 记录玩家输入类型
    setInputMessage('');
    
    // 调用异步的AI响应生成器，传递输入类型信息
    setTimeout(async () => {
      await generateAIResponse(playerMessage, playerInputType);
    }, 1000 + Math.random() * 2000);
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'dialogue': return 'bg-blue-900/30 border-blue-500/30';
      case 'action': return 'bg-purple-900/30 border-purple-500/30';
      case 'thought': return 'bg-gray-900/30 border-gray-500/30 italic';
      default: return 'bg-gray-800/30 border-gray-600/30';
    }
  };

  // 🆕 支持动态头像的获取函数
  const getCharacterAvatar = (characterId: string, message?: Message) => {
    // 优先使用消息中的动态头像
    if (message?.characterAvatar) {
      return message.characterAvatar;
    }
    
    // 回退到角色列表中的头像
    const char = characters.find(c => c.id === characterId || c.name === characterId);
    return char?.avatar || '🎭';
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto p-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              🎭 《日识》终极版
            </h1>
            <h2 className="text-2xl text-yellow-300 mb-4">核心AI + 万能系统AI</h2>
            <p className="text-lg text-gray-300 mb-8">
              终极简化架构：只有林溪和陈浩两个核心AI角色，其他所有角色由万能系统AI动态扮演。
              彻底消除硬编码，实现真正的智能对话体验。
            </p>
          </div>

          <div className="bg-gray-800/70 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">🌍 当前场景：月影酒馆</h3>
            <p className="text-gray-300 mb-4">{gameState.description}</p>
            <p className="text-yellow-300">氛围：{gameState.atmosphere}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {characters.filter(c => c.type === 'ai').map(char => (
              <div key={char.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600/30">
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-3">{char.avatar}</span>
                  <div>
                    <h4 className="font-bold text-white">{char.name}</h4>
                    <p className="text-sm text-gray-400">{char.status}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-300">{char.description}</p>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-blue-400">能量: {char.energy}%</span>
                  <span className="text-purple-400">情绪: {char.mood}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-800/70 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-400 mb-4">👤 创建你的角色</h3>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="输入你的角色名字..."
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 mb-4"
              onKeyPress={(e) => e.key === 'Enter' && startGame()}
            />
            <button
              onClick={startGame}
              disabled={!playerName.trim()}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold rounded-lg transition-all duration-300"
            >
              🚪 进入《日识》世界
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="bg-gray-800/70 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {/* 🆕 移动端侧边栏切换按钮 */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                📊
              </button>
              <div>
                <h2 className="text-xl font-bold text-cyan-400">📍 {gameState.location}</h2>
                <p className="text-gray-300 text-sm">{gameState.description}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">紧张度</div>
              <div className="flex items-center">
                <div className="w-20 bg-gray-700 rounded-full h-2 mr-2">
                  <div 
                    className="bg-red-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${gameState.tension}%` }}
                  ></div>
                </div>
                <span className="text-red-400 text-sm">{gameState.tension}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🆕 优化布局 - 响应式设计和更好的空间利用 */}
        <div className="flex gap-4 h-[calc(100vh-180px)]">
          {/* 左侧角色状态面板 - 响应式宽度和移动端支持 */}
          <div className={`
            w-64 lg:w-72 xl:w-80 flex-shrink-0 overflow-y-auto transition-all duration-300
            ${sidebarOpen ? 'block absolute md:relative z-10 bg-gray-900/95 md:bg-transparent h-full' : 'hidden'} 
            md:block md:relative md:z-auto md:bg-transparent
          `}>
            <div className="bg-gray-800/70 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-bold text-green-400 mb-3">👥 核心AI角色</h3>
              <div className="space-y-3">
                {characters.map(char => (
                  <div key={char.id} className="bg-gray-700/50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">{char.avatar}</span>
                      <div className="flex-1">
                        <div className="font-medium text-white">{char.name}</div>
                        <div className="text-xs text-gray-400">{char.status}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-blue-400">能量</span>
                        <span className="text-white">{char.energy}%</span>
                      </div>
                      <div className="bg-gray-600 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${char.energy}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-purple-400">情绪: {char.mood}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/70 rounded-lg p-4">
              <h3 className="text-lg font-bold text-orange-400 mb-3">🌌 系统说明</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p><strong>🆕 言行合一：</strong>AI不仅会说话，还会有行动和内心想法</p>
                <p><strong>核心AI：</strong>林溪、陈浩拥有独立人格，支持并行响应</p>
                <p><strong>万能AI：</strong>动态扮演所有其他角色，智能角色推断</p>
                <p><strong>零硬编码：</strong>所有回复都是实时AI生成</p>
                <p><strong>🎲 概率响应：</strong>AI会根据相关性智能决定是否参与对话</p>
              </div>
            </div>
          </div>

          {/* 右侧对话区域 - 优化空间利用和滚动体验 */}
          <div className="flex-1 bg-gray-800/70 rounded-lg p-3 md:p-4 flex flex-col min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-cyan-400">💬 实时对话</h3>
              <div className="text-xs text-gray-400">
                {messages.length} 条消息
              </div>
            </div>
            
            {/* 🆕 优化的消息渲染区域 - 更好的空间利用和滚动体验 */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {messages.map(message => (
                <div key={message.id} className={`p-3 rounded-lg border ${getMessageStyle(message.type)} animate-fade-in`}>
                  <div className="flex items-start space-x-2">
                    <span className="text-xl flex-shrink-0">{getCharacterAvatar(message.character, message)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1.5">
                        <span className="font-medium text-white text-sm">
                          {message.character === 'player' ? playerName : 
                           message.character === 'linxi' ? '林溪' :
                           message.character === 'chenhao' ? '陈浩' :
                           message.character === 'system' ? (message.displayName || '系统') :
                           message.character}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">
                          {message.type === 'dialogue' ? '💬' : 
                           message.type === 'action' ? '🎭' : '💭'}
                        </span>
                        {/* 🆕 紧凑的言行合一标识 */}
                        {message.actionData && (
                          <span className="text-xs px-1.5 py-0.5 bg-green-600/30 border border-green-500/30 rounded text-green-300">
                            ⭐
                          </span>
                        )}
                      </div>
                      
                      {/* 🆕 优化的言行合一内容渲染 - 更紧凑的空间利用 */}
                      {message.actionData ? (
                        <div className="space-y-1.5">
                          {/* 对话内容 */}
                          {message.actionData.dialogue && (
                            <div className="bg-blue-900/20 border-l-2 border-blue-500 pl-2 py-1.5">
                              <p className="text-gray-200 text-sm leading-relaxed">{message.actionData.dialogue}</p>
                            </div>
                          )}
                          
                          {/* 行动描述 */}
                          {message.actionData.action && (
                            <div className="bg-purple-900/20 border-l-2 border-purple-500 pl-2 py-1.5">
                              <p className="text-gray-300 text-xs italic">{message.actionData.action}</p>
                            </div>
                          )}
                          
                          {/* 🔒 内心想法完全隐藏 - 只作为后台日志存在 */}
                          {/* 
                          内心想法已从UI中完全移除，确保角色隐私性：
                          - message.actionData.thought 仍然存在于数据中
                          - 但不再在任何玩家界面中显示
                          - 只保留在后台日志中用于调试和分析
                          */}
                        </div>
                      ) : (
                        /* 优化的传统单一内容显示 */
                        <p className="text-gray-200 text-sm leading-relaxed break-words">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* 🆕 优化的输入区域 - 更紧凑和高效的布局 */}
            <div className="space-y-2 border-t border-gray-600 pt-3">
              {/* 🆕 紧凑的输入模式切换和快捷指令 */}
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex flex-wrap space-x-1 md:space-x-2">
                  <button
                    onClick={() => setInputMessage(prev => prev + '@林溪 ')}
                    className="px-2 py-1 bg-purple-600/50 hover:bg-purple-600 text-white rounded text-xs transition-colors"
                  >
                    @林溪
                  </button>
                  <button
                    onClick={() => setInputMessage(prev => prev + '@陈浩 ')}
                    className="px-2 py-1 bg-blue-600/50 hover:bg-blue-600 text-white rounded text-xs transition-colors"
                  >
                    @陈浩
                  </button>
                  <button
                    onClick={() => setInputMessage('')}
                    className="px-2 py-1 bg-gray-600/50 hover:bg-gray-600 text-white rounded text-xs transition-colors"
                  >
                    清空
                  </button>
                </div>
                
                {/* 🆕 紧凑的输入模式切换按钮 */}
                <div className="flex space-x-1 bg-gray-700 rounded-md p-0.5">
                  <button
                    onClick={() => setInputMode('dialogue')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      inputMode === 'dialogue' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    💬 对话
                  </button>
                  <button
                    onClick={() => setInputMode('action')}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      inputMode === 'action' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-600'
                    }`}
                  >
                    🎭 行动
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    inputMode === 'dialogue' 
                      ? "与AI对话..." 
                      : "描述你的行动..."
                  }
                  className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim()}
                  className={`px-4 py-3 rounded-lg transition-colors font-medium text-white text-sm ${
                    inputMode === 'dialogue'
                      ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600'
                      : 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600'
                  }`}
                >
                  {inputMode === 'dialogue' ? '💬' : '🎭'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}