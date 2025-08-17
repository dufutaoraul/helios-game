'use client';

/**
 * 《日识》世界引擎界面 - 瘦客户端实时模式
 * 
 * 设计哲学：纯粹的"渲染器和输入器"
 * 核心特性：
 * 1. 订阅SSE事件流，实时显示世界状态
 * 2. 玩家只能看到外在行为，内心想法完全隐藏
 * 3. 世界拥有自己的"生命"，即使玩家不动作也会有事件发生
 * 4. 支持匿名进入和自然社交逻辑
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 世界事件接口 - 玩家可见的公共事件
 */
interface WorldEvent {
  id: string;
  type: 'dialogue' | 'action' | 'system' | 'environment';
  speaker_id: string;
  content: string;
  timestamp: number;
  is_autonomous?: boolean; // 是否来自AI自主行为
}

/**
 * SSE消息接口
 */
interface SSEMessage {
  type: 'event' | 'history' | 'heartbeat';
  data: any;
  timestamp: number;
}

/**
 * 世界状态接口
 */
interface WorldState {
  scene_id: string;
  tick_count: number;
  active_characters: string[];
  is_connected: boolean;
  last_heartbeat: number;
}

export default function WorldEngineInterface() {
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [inputMode, setInputMode] = useState<'dialogue' | 'action'>('dialogue');
  
  // 世界状态
  const [worldEvents, setWorldEvents] = useState<WorldEvent[]>([]);
  const [worldState, setWorldState] = useState<WorldState>({
    scene_id: 'moonlight_tavern',
    tick_count: 0,
    active_characters: [],
    is_connected: false,
    last_heartbeat: 0,
  });

  // SSE连接引用
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * 🔧 重构：连接到SSE事件流 - 强化连接管理
   */
  const connectToWorldEngine = useCallback(() => {
    // 🔧 严格防止重复连接
    if (eventSourceRef.current) {
      if (eventSourceRef.current.readyState === EventSource.OPEN) {
        console.log('🔗 SSE连接已存在且正常，跳过重复连接');
        return;
      } else if (eventSourceRef.current.readyState === EventSource.CONNECTING) {
        console.log('🔗 SSE连接正在建立中，跳过重复连接');
        return;
      }
      
      // 强制清理异常连接
      console.log('🔌 清理异常SSE连接...');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const sceneId = worldState.scene_id;
    const playerId = playerName || 'anonymous';
    
    console.log(`📡 建立新的世界引擎SSE连接: ${playerId} @ ${sceneId}`);
    
    try {
      const eventSource = new EventSource(
        `/api/events?sceneId=${sceneId}&playerId=${encodeURIComponent(playerId)}`
      );

      eventSource.onopen = (event) => {
        console.log('🔗 SSE连接已建立', event);
        setWorldState(prev => ({ ...prev, is_connected: true }));
      };

      eventSource.onmessage = (event) => {
        try {
          const message: SSEMessage = JSON.parse(event.data);
          handleSSEMessage(message);
        } catch (error) {
          console.error('SSE消息解析错误:', error, event.data);
        }
      };

      eventSource.onerror = (error) => {
        console.error('🔧 SSE连接错误:', error);
        setWorldState(prev => ({ ...prev, is_connected: false }));
        
        // 🔧 严格的重连控制：避免无限重连
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('🔌 SSE连接已正常关闭，不进行重连');
          return;
        }
        
        // 🔧 智能重连逻辑：只有在连接意外断开时才重连
        if (eventSource.readyState === EventSource.CONNECTING) {
          console.log('⏳ SSE连接仍在尝试建立中，等待结果');
          return;
        }
        
        // 🔧 安全重连：添加更多检查条件
        const canReconnect = gameStarted && 
                           playerName && 
                           (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED);
        
        if (canReconnect) {
          console.log('🔄 SSE连接意外断开，3秒后尝试重连...');
          setTimeout(() => {
            // 🔧 重连前再次检查状态
            if (gameStarted && playerName && (!eventSourceRef.current || eventSourceRef.current.readyState === EventSource.CLOSED)) {
              connectToWorldEngine();
            }
          }, 3000);
        }
      };

      eventSourceRef.current = eventSource;
      
    } catch (error) {
      console.error('创建SSE连接失败:', error);
      setWorldState(prev => ({ ...prev, is_connected: false }));
    }
  }, [playerName, worldState.scene_id, gameStarted]);

  /**
   * 处理SSE消息
   */
  const handleSSEMessage = useCallback((message: SSEMessage) => {
    try {
      switch (message.type) {
        case 'event':
          // 单个新事件
          const event = message.data as WorldEvent;
          // 🔧 修复：防止重复消息，检查事件ID是否已存在
          setWorldEvents(prev => {
            const exists = prev.some(existingEvent => existingEvent.id === event.id);
            if (exists) {
              console.log(`⚠️ 跳过重复事件: ${event.id}`);
              return prev;
            }
            console.log(`📢 收到世界事件: [${event.type}] ${event.speaker_id}: ${event.content}`);
            return [...prev, event];
          });
          break;

        case 'history':
          // 历史事件批量
          const events = message.data as WorldEvent[];
          // 🔧 修复：批量添加时也要去重
          setWorldEvents(prev => {
            const existingIds = new Set(prev.map(e => e.id));
            const newEvents = events.filter(e => !existingIds.has(e.id));
            if (newEvents.length !== events.length) {
              console.log(`⚠️ 过滤了 ${events.length - newEvents.length} 个重复的历史事件`);
            }
            console.log(`📚 收到历史事件: ${newEvents.length} 条（新）`);
            return [...prev, ...newEvents];
          });
          break;

        case 'heartbeat':
          // 心跳包
          setWorldState(prev => ({
            ...prev,
            last_heartbeat: message.timestamp,
            tick_count: message.data.tick_count || prev.tick_count,
          }));
          break;
          
        default:
          console.warn('未知的SSE消息类型:', message.type);
      }
    } catch (error) {
      console.error('处理SSE消息时出错:', error, message);
    }
  }, []); // 🔧 修复：使用useCallback避免重复创建

  /**
   * 发送玩家消息到世界引擎
   */
  const sendPlayerMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageToSend = inputMessage.trim();
    console.log(`💬 发送玩家消息: "${messageToSend}" (类型: ${inputMode})`);
    
    // 🔧 修复：立即显示玩家消息到界面
    const playerEvent = {
      id: `player_${Date.now()}`,
      type: inputMode === 'action' ? 'action' : 'dialogue',
      speaker_id: playerName || 'anonymous',
      content: messageToSend,
      timestamp: Date.now(),
    } as WorldEvent;
    
    setWorldEvents(prev => [...prev, playerEvent]);
    setInputMessage('');

    try {
      const requestBody = {
        userMessage: messageToSend,
        playerName: playerName || 'anonymous',
        sceneId: worldState.scene_id,
        playerInputType: inputMode,
        isInitialEntry: false,
      };
      
      console.log('📤 API请求数据:', requestBody);

      const response = await fetch('/api/world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 API响应状态:', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📥 API响应数据:', result);
      
      if (!result.success) {
        console.error('发送消息失败:', result.error);
        // 🔧 修复：如果API失败，移除刚才添加的玩家消息
        setWorldEvents(prev => prev.filter(event => event.id !== playerEvent.id));
        alert(`发送消息失败: ${result.error}`);
        setInputMessage(messageToSend); // 恢复输入
      } else {
        console.log('✅ 消息发送成功');
      }

    } catch (error) {
      console.error('发送消息错误:', error);
      // 🔧 修复：如果请求失败，移除刚才添加的玩家消息
      setWorldEvents(prev => prev.filter(event => event.id !== playerEvent.id));
      alert(`发送消息错误: ${error}`);
      setInputMessage(messageToSend); // 恢复输入
    }
  };

  /**
   * 开始游戏：初始化世界和SSE连接
   */
  const startGame = async () => {
    if (!playerName.trim()) {
      alert('请输入你的名字');
      return;
    }

    console.log(`🌟 ${playerName} 开始游戏...`);

    try {
      // 🔧 修复：先设置游戏状态，再连接SSE，避免重复消息
      setGameStarted(true);
      
      // 1. 连接SSE事件流（先连接再初始化）
      setTimeout(() => {
        connectToWorldEngine();
      }, 500);
      
      // 2. 初始化世界状态（延迟确保SSE已连接）
      setTimeout(async () => {
        const response = await fetch('/api/world', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userMessage: `${playerName} 进入了月影酒馆`,
            playerName: playerName,
            sceneId: 'moonlight_tavern',
            playerInputType: 'action',
            isInitialEntry: true,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ 游戏初始化成功');
        } else {
          console.error('游戏初始化失败:', result.error);
        }
      }, 1500); // 确保SSE连接已建立

    } catch (error) {
      console.error('游戏启动错误:', error);
    }
  };

  /**
   * 组件挂载时设置SSE连接
   */
  useEffect(() => {
    if (gameStarted && playerName) {
      connectToWorldEngine();
    }

    // 清理函数：关闭SSE连接
    return () => {
      if (eventSourceRef.current) {
        console.log('🔌 清理SSE连接...');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        console.log('🔌 SSE连接已关闭');
      }
    };
  }, [gameStarted, connectToWorldEngine]);

  /**
   * 组件卸载时的清理
   */
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        console.log('🔌 组件卸载，关闭SSE连接...');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  /**
   * 自动滚动到最新消息
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [worldEvents]);

  /**
   * 键盘事件处理
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPlayerMessage();
    }
  };

  /**
   * 格式化时间显示
   */
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  /**
   * 🔧 重构：获取角色显示名称 - 支持动态临时角色
   */
  const getCharacterDisplayName = (speakerId: string) => {
    const characterMap: Record<string, string> = {
      'linxi': '林溪',
      'chenhao': '陈浩',
      'narrator': '旁白',
      'system': '系统',
      // 🔧 新增：动态临时角色映射
      'boss': '老板',
      'bartender': '调酒师',
      'waitress': '服务员',
      'cook': '厨师',
    };
    
    // 🔧 修复：如果是当前玩家，显示玩家名称
    if (speakerId === playerName || speakerId === 'anonymous') {
      return playerName || '匿名访客';
    }
    
    return characterMap[speakerId] || speakerId;
  };

  /**
   * 🔧 重构：获取角色头像 - 支持动态临时角色
   */
  const getCharacterAvatar = (speakerId: string) => {
    const avatarMap: Record<string, string> = {
      'linxi': '👩‍🦱',
      'chenhao': '👨‍💻',
      'narrator': '📖',
      'system': '⚙️',
      // 🔧 新增：动态临时角色头像
      'boss': '👔',
      'bartender': '🍸',
      'waitress': '👩‍🍳',
      'cook': '👨‍🍳',
    };
    
    // 🔧 修复：如果是当前玩家，显示玩家头像
    if (speakerId === playerName || speakerId === 'anonymous') {
      return '👨‍💼'; // 玩家头像
    }
    
    return avatarMap[speakerId] || '👤';
  };

  // 如果游戏未开始，显示开始界面
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">
            《日识》世界引擎
          </h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                你的名字
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="输入你的名字..."
                maxLength={20}
              />
            </div>
            <button
              onClick={startGame}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              进入世界
            </button>
          </div>
          <div className="mt-6 text-center text-gray-400 text-sm">
            <p>🌍 实时世界模拟器</p>
            <p>💓 AI拥有自主生活</p>
            <p>🔒 内心想法完全隐藏</p>
          </div>
        </div>
      </div>
    );
  }

  // 游戏主界面
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
        
        {/* 顶部状态栏 */}
        <div className="bg-gray-700 px-6 py-3 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">月影酒馆</h1>
              <div className={`flex items-center space-x-2 ${worldState.is_connected ? 'text-green-400' : 'text-red-400'}`}>
                <div className={`w-2 h-2 rounded-full ${worldState.is_connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm">
                  {worldState.is_connected ? '实时连接' : '连接断开'}
                </span>
              </div>
            </div>
            <div className="text-gray-300 text-sm">
              心跳 #{worldState.tick_count} | 玩家: {playerName}
            </div>
          </div>
        </div>

        {/* 消息显示区域 */}
        <div className="h-96 overflow-y-auto p-6 space-y-4 bg-gray-900">
          {worldEvents.map((event) => (
            <div key={event.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">{getCharacterAvatar(event.speaker_id)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-white">
                    {getCharacterDisplayName(event.speaker_id)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(event.timestamp)}
                  </span>
                  {event.is_autonomous && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      自主行为
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded ${
                    event.type === 'dialogue' ? 'bg-green-600' :
                    event.type === 'action' ? 'bg-yellow-600' :
                    event.type === 'system' ? 'bg-gray-600' :
                    'bg-purple-600'
                  } text-white`}>
                    {event.type}
                  </span>
                </div>
                <p className="text-gray-300 break-words">{event.content}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="bg-gray-700 p-6 border-t border-gray-600">
          <div className="flex items-center space-x-4 mb-3">
            <label className="flex items-center space-x-2 text-white">
              <input
                type="radio"
                name="inputMode"
                value="dialogue"
                checked={inputMode === 'dialogue'}
                onChange={(e) => setInputMode(e.target.value as 'dialogue')}
                className="text-blue-600"
              />
              <span>💬 对话</span>
            </label>
            <label className="flex items-center space-x-2 text-white">
              <input
                type="radio"
                name="inputMode"
                value="action"
                checked={inputMode === 'action'}
                onChange={(e) => setInputMode(e.target.value as 'action')}
                className="text-blue-600"
              />
              <span>🎭 行动</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={inputMode === 'dialogue' ? '说些什么...' : '做些什么...'}
              className="flex-1 px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={500}
            />
            <button
              onClick={sendPlayerMessage}
              disabled={!inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
            >
              发送
            </button>
          </div>
          
          <div className="mt-3 text-center text-gray-400 text-sm">
            💡 世界是活着的，即使你不说话，AI角色也会自主行动
          </div>
        </div>
      </div>
    </div>
  );
}