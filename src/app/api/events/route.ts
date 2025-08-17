/**
 * Server-Sent Events (SSE) API - 实时事件推送端点
 * 
 * 设计理念：将服务器端的世界心跳事件实时推送到客户端
 * 通信方式：单向推送（服务器 → 客户端），足够满足实时世界模拟需求
 */

import { NextRequest, NextResponse } from 'next/server';
import { WorldEngine } from '@/lib/world-engine';

/**
 * GET 端点：建立SSE连接，订阅世界事件流
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sceneId = searchParams.get('sceneId') || 'default';
  const playerId = searchParams.get('playerId') || 'anonymous';

  console.log(`📡 SSE连接请求: sceneId=${sceneId}, playerId=${playerId}`);

  // 创建SSE响应流
  const stream = new ReadableStream({
    async start(controller) {
      console.log(`🔗 SSE连接已建立: ${playerId} @ ${sceneId}`);

      try {
        // 🔧 修复：使用新的异步单例模式获取世界引擎实例
        const worldEngine = await WorldEngine.getInstance(sceneId, '月影酒馆');

        // 发送连接确认事件
        const welcomeEvent = {
          id: `welcome_${playerId}_${Date.now()}`,
          type: 'system',
          speaker_id: 'system',
          content: `欢迎来到实时世界，${playerId}`,
          timestamp: Date.now(),
        };

        // 立即发送欢迎事件
        controller.enqueue(formatSSEMessage('event', welcomeEvent));

        // 发送当前世界状态
        const recentEvents = worldEngine.getRecentEvents(20);
        controller.enqueue(formatSSEMessage('history', recentEvents));

        // 订阅世界引擎的事件流
        const unsubscribe = worldEngine.subscribe((event) => {
          try {
            controller.enqueue(formatSSEMessage('event', event));
          } catch (error) {
            console.error('SSE推送错误:', error);
          }
        });

        // 启动世界心跳（如果尚未启动）
        worldEngine.startHeartbeat(2000); // 每2秒一次心跳

        // 定期发送心跳包，保持连接活跃
        const heartbeatInterval = setInterval(() => {
          try {
            controller.enqueue(formatSSEMessage('heartbeat', { 
              timestamp: Date.now(),
              sceneId,
              playerId
            }));
          } catch (error) {
            console.error('心跳包发送失败:', error);
            clearInterval(heartbeatInterval);
          }
        }, 30000); // 每30秒发送一次心跳

        // 清理函数：当连接关闭时调用
        request.signal.addEventListener('abort', () => {
          console.log(`🔌 SSE连接已断开: ${playerId} @ ${sceneId}`);
          unsubscribe();
          clearInterval(heartbeatInterval);
          
          // 如果没有其他订阅者，停止世界心跳
          const worldState = worldEngine.getWorldState();
          // TODO: 实现引用计数，当没有玩家时停止心跳
        });

      } catch (error) {
        console.error('🔧 SSE连接建立失败:', error);
        controller.error(error);
      }
    },
  });

  // 返回SSE响应
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}

/**
 * 格式化SSE消息
 */
function formatSSEMessage(type: string, data: any): string {
  const message = {
    type,
    data,
    timestamp: Date.now(),
  };

  return `data: ${JSON.stringify(message)}\n\n`;
}

/**
 * OPTIONS 端点：处理CORS预检请求
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
}