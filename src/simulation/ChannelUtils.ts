/**
 * 频道模拟系统 - 工具函数集
 * 
 * 提供一些常用的工具函数，用于处理频道消息、格式化输出、
 * 以及为"信念观察者"提供数据分析的辅助方法。
 */

import { ChannelMessage, DialogueMessage, ActionMessage, EnvironmentMessage } from '../types';

/**
 * 格式化消息为人类可读的字符串
 * 主要用于日志输出和调试
 */
export function formatMessage(message: ChannelMessage): string {
  const timeStr = new Date(message.timestamp).toLocaleTimeString();
  
  switch (message.type) {
    case 'dialogue':
      const dialogue = message as DialogueMessage;
      return `[${timeStr}] 💬 ${dialogue.character}: "${dialogue.content}"`;
    
    case 'action':
      const action = message as ActionMessage;
      return `[${timeStr}] 🎭 ${action.character} ${action.description}`;
    
    case 'environment':
      const env = message as EnvironmentMessage;
      const affected = env.affected_characters ? 
        ` (影响: ${env.affected_characters.join(', ')})` : '';
      return `[${timeStr}] 🌍 ${env.description}${affected}`;
    
    default:
      return `[${timeStr}] ❓ 未知消息类型`;
  }
}

/**
 * 将消息列表格式化为场景叙述
 * 这个函数将原始的消息流转换为连贯的叙述文本
 */
export function formatAsNarrative(messages: ChannelMessage[]): string {
  if (messages.length === 0) {
    return '场景中暂时没有发生任何事情...';
  }

  // 按时间排序
  const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);
  
  const narrative = sortedMessages.map(message => {
    switch (message.type) {
      case 'dialogue':
        const dialogue = message as DialogueMessage;
        return `${dialogue.character}说道："${dialogue.content}"`;
      
      case 'action':
        const action = message as ActionMessage;
        return `${action.character}${action.description}`;
      
      case 'environment':
        const env = message as EnvironmentMessage;
        return `这时，${env.description}`;
      
      default:
        return '';
    }
  }).filter(line => line.length > 0);

  return narrative.join('。 ') + '。';
}

/**
 * 分析角色的行为模式
 * 为"信念观察者"提供统计数据
 */
export function analyzeCharacterBehavior(messages: ChannelMessage[], characterId: string): {
  totalActions: number;
  dialogueCount: number;
  actionCount: number;
  averageWordsPerDialogue: number;
  mostCommonActionTypes: string[];
  timeActivity: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
} {
  // 过滤出该角色的消息
  const characterMessages = messages.filter(msg => 
    (msg.type === 'dialogue' || msg.type === 'action') && 
    (msg as DialogueMessage | ActionMessage).character === characterId
  );

  let dialogueCount = 0;
  let actionCount = 0;
  let totalWords = 0;
  const actionTypes: string[] = [];
  const timeActivity = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  characterMessages.forEach(msg => {
    // 分析时间分布
    const hour = new Date(msg.timestamp).getHours();
    if (hour >= 6 && hour < 12) timeActivity.morning++;
    else if (hour >= 12 && hour < 18) timeActivity.afternoon++;
    else if (hour >= 18 && hour < 22) timeActivity.evening++;
    else timeActivity.night++;

    if (msg.type === 'dialogue') {
      dialogueCount++;
      const dialogue = msg as DialogueMessage;
      totalWords += dialogue.content.split(/\s+/).length;
    } else if (msg.type === 'action') {
      actionCount++;
      const action = msg as ActionMessage;
      // 简单的动作类型提取（从描述中提取动词）
      const actionType = extractActionType(action.description);
      if (actionType) actionTypes.push(actionType);
    }
  });

  // 统计最常见的动作类型
  const actionTypeCount: Record<string, number> = {};
  actionTypes.forEach(type => {
    actionTypeCount[type] = (actionTypeCount[type] || 0) + 1;
  });
  
  const mostCommonActionTypes = Object.entries(actionTypeCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([type]) => type);

  return {
    totalActions: characterMessages.length,
    dialogueCount,
    actionCount,
    averageWordsPerDialogue: dialogueCount > 0 ? totalWords / dialogueCount : 0,
    mostCommonActionTypes,
    timeActivity
  };
}

/**
 * 从动作描述中提取动作类型
 * 这是一个简化的自然语言处理函数
 */
function extractActionType(description: string): string | null {
  // 常见动作关键词映射
  const actionKeywords: Record<string, string> = {
    '走': '移动',
    '跑': '移动',
    '坐': '休息',
    '站': '移动',
    '笑': '表情',
    '哭': '表情',
    '摇头': '表情',
    '点头': '表情',
    '拿': '物品交互',
    '放': '物品交互',
    '喝': '饮食',
    '吃': '饮食',
    '看': '观察',
    '听': '观察',
    '说': '交流',
    '喊': '交流',
    '打': '冲突',
    '推': '冲突',
    '拉': '物理交互',
    '开': '物品交互',
    '关': '物品交互'
  };

  for (const [keyword, type] of Object.entries(actionKeywords)) {
    if (description.includes(keyword)) {
      return type;
    }
  }

  return '其他';
}

/**
 * 检测可能的"认知失调"事件
 * 当角色的行为与其表达的观点矛盾时，返回true
 */
export function detectCognitiveDissonance(messages: ChannelMessage[], characterId: string): {
  hasPotentialDissonance: boolean;
  conflicts: Array<{
    statement: string;
    contradictingAction: string;
    confidence: number;
  }>;
} {
  const characterMessages = messages.filter(msg => 
    (msg.type === 'dialogue' || msg.type === 'action') && 
    (msg as DialogueMessage | ActionMessage).character === characterId
  );

  const conflicts: Array<{
    statement: string;
    contradictingAction: string;
    confidence: number;
  }> = [];

  // 简单的矛盾检测规则
  const contradictionRules = [
    {
      statementKeywords: ['和平', '非暴力', '善良'],
      actionKeywords: ['打', '推', '威胁'],
      confidence: 0.8
    },
    {
      statementKeywords: ['诚实', '真实', '坦率'],
      actionKeywords: ['隐瞒', '撒谎', '欺骗'],
      confidence: 0.9
    },
    {
      statementKeywords: ['节约', '节俭', '省钱'],
      actionKeywords: ['浪费', '挥霍', '奢侈'],
      confidence: 0.7
    }
  ];

  // 提取角色的所有语言表达
  const statements = characterMessages
    .filter(msg => msg.type === 'dialogue')
    .map(msg => (msg as DialogueMessage).content);

  // 提取角色的所有行为
  const actions = characterMessages
    .filter(msg => msg.type === 'action')
    .map(msg => (msg as ActionMessage).description);

  // 检测矛盾
  contradictionRules.forEach(rule => {
    statements.forEach(statement => {
      if (rule.statementKeywords.some(keyword => statement.includes(keyword))) {
        actions.forEach(action => {
          if (rule.actionKeywords.some(keyword => action.includes(keyword))) {
            conflicts.push({
              statement,
              contradictingAction: action,
              confidence: rule.confidence
            });
          }
        });
      }
    });
  });

  return {
    hasPotentialDissonance: conflicts.length > 0,
    conflicts
  };
}

/**
 * 生成场景摘要
 * 为AI决策提供简洁的上下文信息
 */
export function generateSceneSummary(messages: ChannelMessage[], maxLength: number = 200): string {
  if (messages.length === 0) {
    return '场景中目前很安静，没有发生什么特别的事情。';
  }

  // 获取最近的消息
  const recentMessages = messages.slice(-10);
  
  // 识别主要角色
  const characters = new Set<string>();
  recentMessages.forEach(msg => {
    if (msg.type === 'dialogue' || msg.type === 'action') {
      characters.add((msg as DialogueMessage | ActionMessage).character);
    }
  });

  // 构建摘要
  let summary = `当前有${characters.size}个角色在场`;
  if (characters.size > 0) {
    summary += `：${Array.from(characters).join('、')}`;
  }
  summary += '。';

  // 添加最新的重要事件
  const lastImportantEvent = recentMessages[recentMessages.length - 1];
  if (lastImportantEvent) {
    summary += ' 最近';
    if (lastImportantEvent.type === 'dialogue') {
      const dialogue = lastImportantEvent as DialogueMessage;
      summary += `${dialogue.character}说了："${dialogue.content}"`;
    } else if (lastImportantEvent.type === 'action') {
      const action = lastImportantEvent as ActionMessage;
      summary += `${action.character}${action.description}`;
    } else {
      const env = lastImportantEvent as EnvironmentMessage;
      summary += env.description;
    }
  }

  // 如果摘要太长，截断它
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength - 3) + '...';
  }

  return summary;
}