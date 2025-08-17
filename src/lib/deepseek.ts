/**
 * DeepSeek API 集成模块
 * 
 * 本模块负责与DeepSeek AI模型进行通信，为AI NPC的决策提供强大的推理能力。
 * 
 * 重要说明：
 * - 本地开发时使用此配置文件中的API密钥
 * - 在Vercel云端部署时，API密钥将通过环境变量自动替换
 * - 确保生产环境中的API密钥安全性
 * 
 * DeepSeek模型特点：
 * - 强大的中文理解和推理能力
 * - 适合复杂的角色扮演和决策任务
 * - 支持长上下文和结构化输出
 */

import { z } from 'zod';

/**
 * DeepSeek API配置
 */
interface DeepSeekConfig {
  /** API密钥 - 本地开发使用，云端将被环境变量替换 */
  apiKey: string;
  /** API基础URL */
  baseURL: string;
  /** 默认模型名称 */
  model: string;
  /** 请求超时时间（毫秒） */
  timeout: number;
  /** 最大重试次数 */
  maxRetries: number;
}

/**
 * DeepSeek API响应的结构化输出Schema
 * 用于验证和解析AI决策的返回结果
 */
export const DecisionReasoningSchema = z.object({
  observation: z.object({
    keyEvents: z.array(z.string()),
    environmentalFactors: z.array(z.string()),
    socialDynamics: z.array(z.string())
  }),
  internalAnalysis: z.object({
    energyInfluence: z.string(),
    focusInfluence: z.string(),
    curiosityInfluence: z.string(),
    overallMood: z.string()
  }),
  beliefFiltering: z.object({
    relevantBeliefs: z.array(z.string()),
    conflictingBeliefs: z.array(z.string()),
    motivationalFactors: z.array(z.string())
  }),
  optionGeneration: z.object({
    possibleActions: z.array(z.object({
      action: z.string(),
      type: z.enum(['dialogue', 'action', 'wait']),
      risk: z.enum(['low', 'medium', 'high']),
      reward: z.enum(['low', 'medium', 'high'])
    }))
  }),
  finalDecision: z.object({
    chosenAction: z.string(),
    actionType: z.enum(['dialogue', 'action', 'wait']),
    reasoning: z.string(),
    confidence: z.number().min(0).max(1),
    expectedOutcome: z.string()
  })
});

export type DecisionReasoning = z.infer<typeof DecisionReasoningSchema>;

/**
 * DeepSeek API客户端
 * 
 * 这个客户端封装了与DeepSeek API的所有交互逻辑，
 * 提供了简洁的接口供决策引擎使用。
 */
export class DeepSeekClient {
  private config: DeepSeekConfig;

  constructor() {
    this.config = {
      // 本地开发API密钥配置
      // 注意：在生产环境中，这个值会被process.env.DEEPSEEK_API_KEY替换
      apiKey: process.env.DEEPSEEK_API_KEY || 'your_deepseek_api_key_here',
      
      // DeepSeek API基础URL
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      
      // 使用DeepSeek Chat模型
      model: 'deepseek-chat',
      
      // 请求配置
      timeout: 30000, // 30秒超时
      maxRetries: 3   // 最大重试3次
    };

    // 验证API密钥是否配置
    if (this.config.apiKey === 'your_deepseek_api_key_here') {
      console.warn('⚠️ DeepSeek API密钥未配置，将使用模拟模式');
    } else {
      console.log('✅ DeepSeek API客户端已初始化');
    }
  }

  /**
   * 调用DeepSeek API进行AI决策推理
   * 
   * @param prompt 决策提示词
   * @param temperature 创造性程度 (0.0-1.0)
   * @returns 结构化的决策推理结果
   */
  async generateDecisionReasoning(
    prompt: string, 
    temperature: number = 0.7
  ): Promise<DecisionReasoning> {
    
    // 如果API密钥未正确配置，使用模拟模式
    if (this.config.apiKey === 'your_deepseek_api_key_here') {
      console.log('🎭 使用模拟模式生成决策推理');
      return this.generateMockReasoning();
    }

    try {
      console.log('🚀 正在调用DeepSeek API...');
      
      const response = await this.makeAPIRequest(prompt, temperature);
      const reasoning = this.parseAPIResponse(response);
      
      console.log('✅ DeepSeek API调用成功');
      return reasoning;
      
    } catch (error) {
      console.error('❌ DeepSeek API调用失败:', error);
      
      // 如果API调用失败，返回模拟结果作为后备
      console.log('🎭 使用模拟模式作为后备方案');
      return this.generateMockReasoning();
    }
  }

  /**
   * 发起API请求
   */
  private async makeAPIRequest(prompt: string, temperature: number): Promise<any> {
    const requestBody = {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的AI角色扮演助手，擅长复杂的心理分析和决策推理。请严格按照指定的JSON格式返回结果。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: temperature,
      max_tokens: 4096,
      // 启用JSON模式以确保结构化输出
      response_format: { type: 'json_object' }
    };

    const response = await fetch(`${this.config.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API请求失败: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 解析API响应并验证结构
   */
  private parseAPIResponse(response: any): DecisionReasoning {
    try {
      // 提取内容
      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('API响应中没有内容');
      }

      // 解析JSON
      let jsonData: any;
      try {
        jsonData = JSON.parse(content);
      } catch (parseError) {
        // 如果直接解析失败，尝试从代码块中提取JSON
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('无法解析JSON响应');
        }
      }

      // 使用Zod验证结构
      const validatedData = DecisionReasoningSchema.parse(jsonData);
      
      console.log('📋 API响应验证成功');
      return validatedData;
      
    } catch (error) {
      console.error('❌ API响应解析失败:', error);
      throw new Error(`响应解析失败: ${error}`);
    }
  }

  /**
   * 生成模拟的决策推理结果
   * 用于演示和API不可用时的后备方案
   */
  private generateMockReasoning(): DecisionReasoning {
    return {
      observation: {
        keyEvents: ['检测到新的对话', '场景中有多个角色'],
        environmentalFactors: ['酒馆环境', '昏暗的灯光', '嘈杂的背景'],
        socialDynamics: ['存在潜在的紧张关系', '注意力集中在主要角色上']
      },
      internalAnalysis: {
        energyInfluence: '当前能量水平影响主动性和反应速度',
        focusInfluence: '专注程度决定对细节的关注度',
        curiosityInfluence: '好奇心水平影响探索倾向',
        overallMood: '整体状态平衡，适合做出理性决策'
      },
      beliefFiltering: {
        relevantBeliefs: ['避免不必要的冲突', '保护自己的利益'],
        conflictingBeliefs: ['想要了解真相但担心风险'],
        motivationalFactors: ['安全第一', '维护自身形象']
      },
      optionGeneration: {
        possibleActions: [
          {
            action: '仔细观察情况发展',
            type: 'wait',
            risk: 'low',
            reward: 'low'
          },
          {
            action: '主动介入对话',
            type: 'dialogue',
            risk: 'medium',
            reward: 'medium'
          },
          {
            action: '做出防御性姿态',
            type: 'action',
            risk: 'medium',
            reward: 'low'
          }
        ]
      },
      finalDecision: {
        chosenAction: '继续观察，保持警觉',
        actionType: 'wait',
        reasoning: '基于当前状态和环境，观察是最安全的选择',
        confidence: 0.75,
        expectedOutcome: '获得更多信息，避免不必要的冲突'
      }
    };
  }

  /**
   * 测试API连接
   */
  async testConnection(): Promise<boolean> {
    if (this.config.apiKey === 'your_deepseek_api_key_here') {
      console.log('⚠️ API密钥未配置，跳过连接测试');
      return false;
    }

    try {
      console.log('🔄 测试DeepSeek API连接...');
      
      const response = await this.makeAPIRequest(
        '请简单回复"连接测试成功"', 
        0.1
      );
      
      console.log('✅ DeepSeek API连接测试成功');
      return true;
      
    } catch (error) {
      console.error('❌ DeepSeek API连接测试失败:', error);
      return false;
    }
  }

  /**
   * 获取当前配置信息（不包含敏感信息）
   */
  getConfigInfo(): Omit<DeepSeekConfig, 'apiKey'> {
    return {
      baseURL: this.config.baseURL,
      model: this.config.model,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries
    };
  }
}

/**
 * 全局DeepSeek客户端实例
 * 
 * 在整个应用中使用单例模式，确保API调用的一致性
 * 并避免重复的初始化开销。
 */
export const globalDeepSeekClient = new DeepSeekClient();

/**
 * 便捷的API调用函数
 * 供决策引擎直接使用
 */
export async function generateAIDecision(prompt: string): Promise<DecisionReasoning> {
  return await globalDeepSeekClient.generateDecisionReasoning(prompt);
}