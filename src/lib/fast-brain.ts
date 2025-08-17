/**
 * 《日识》核心互动原型 - "快脑"系统
 * 
 * 本模块专门处理需要快速响应的实时聊天交互。
 * 与复杂的5步推理"慢脑"系统完全分离，确保毫秒级响应。
 * 
 * 核心设计原则：
 * - 极简Schema，最大化Zod验证成功率
 * - 快速响应优先，深度分析留给异步的"慢脑"
 * - 智能重试机制，彻底消除Mock Fallback
 */

import { z } from 'zod';

/**
 * 极简的AI行动Schema - 保持向后兼容
 */
export const SimpleActionSchema = z.object({
  actionType: z.enum(['dialogue', 'action']).describe("行动类型：dialogue表示对话，action表示动作"),
  content: z.string().min(1).describe("如果是dialogue，这里是对话内容；如果是action，这里是动作描述。")
});

export type SimpleAction = z.infer<typeof SimpleActionSchema>;

/**
 * 言行合一 - ActionPackageSchema
 * 升级版Schema，支持同时返回对话和行动，实现更丰富的AI体验
 * 设计原则：保持简洁性，避免过度复杂化
 */
export const ActionPackageSchema = z.object({
  // 核心对话内容（必须）
  dialogue: z.string().min(1).describe("角色说的话，必须提供"),
  
  // 可选的行动描述
  action: z.string().optional().describe("角色的动作描述，可选"),
  
  // 可选的内心想法
  thought: z.string().optional().describe("角色的内心想法，可选"),
  
  // 动作类型标识，用于前端渲染
  actionType: z.enum(['dialogue', 'action', 'thought']).default('dialogue').describe("主要表现类型")
});

export type ActionPackage = z.infer<typeof ActionPackageSchema>;

/**
 * 快脑DeepSeek客户端
 * 专门优化用于快速响应的场景
 */
export class FastBrainClient {
  private config: {
    apiKey: string;
    baseURL: string;
    model: string;
    timeout: number;
    maxRetries: number;
  };

  constructor() {
    this.config = {
      apiKey: process.env.DEEPSEEK_API_KEY || 'your_deepseek_api_key_here',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com',
      model: 'deepseek-chat',
      timeout: 15000, // 快脑模式：15秒超时
      maxRetries: 2   // 快脑模式：最多重试2次
    };

    if (this.config.apiKey === 'your_deepseek_api_key_here') {
      console.warn('⚠️ DeepSeek API密钥未配置，快脑系统将无法正常工作');
    } else {
      console.log('🧠 快脑系统已初始化');
    }
  }

  /**
   * 生成快速响应（向后兼容方法）
   * 使用极简Schema和智能重试，确保高成功率
   */
  async generateFastResponse(
    characterName: string,
    characterMotivation: string,
    chatHistory: string,
    userMessage: string,
    temperature: number = 0.7
  ): Promise<SimpleAction> {
    
    if (this.config.apiKey === 'your_deepseek_api_key_here') {
      throw new Error('API密钥未配置，无法调用快脑系统');
    }

    // 构建专门优化的快脑Prompt
    const prompt = this.buildFastBrainPrompt(
      characterName, 
      characterMotivation, 
      chatHistory, 
      userMessage
    );

    let lastError: Error | null = null;

    // 智能重试机制
    for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
      try {
        console.log(`🧠 快脑尝试 ${attempt}/${this.config.maxRetries + 1}: 为${characterName}生成响应`);
        
        const response = await this.makeAPIRequest(prompt, temperature, attempt > 1 ? lastError : null);
        const action = this.parseAndValidateResponse(response, attempt > 1);
        
        console.log(`✅ 快脑成功为${characterName}生成响应:`, action);
        return action;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ 快脑尝试 ${attempt} 失败:`, error);
        
        if (attempt === this.config.maxRetries + 1) {
          // 所有重试都失败了，抛出错误（不再有Mock Fallback）
          throw new Error(`快脑系统调用失败，已重试${this.config.maxRetries}次: ${lastError.message}`);
        }
        
        // 等待一段时间后重试
        await this.sleep(1000 * attempt);
      }
    }

    // 这里永远不会到达，但为了TypeScript类型检查
    throw new Error('未知错误');
  }

  /**
   * 构建专门优化的快脑Prompt
   * 重点强调快速响应和格式严格性
   */
  private buildFastBrainPrompt(
    characterName: string,
    characterMotivation: string,
    chatHistory: string,
    userMessage: string
  ): string {
    return `你是${characterName}，你的核心动机是${characterMotivation}。

基于以下的聊天记录，请对玩家的最新一句话做出一个快速、符合你身份的回应。

最近的聊天记录：
${chatHistory}

玩家刚才说: "${userMessage}"

请严格按照以下JSON格式回应，不要包含任何其他内容：
{
  "actionType": "dialogue",
  "content": "你的回应内容"
}

或者

{
  "actionType": "action", 
  "content": "你的动作描述"
}

注意：
- actionType只能是"dialogue"或"action"
- content必须是非空字符串
- 回应要快速、自然、符合角色身份
- 不要进行复杂的推理，专注于即时反应`;
  }

  /**
   * 发起API请求
   * 支持错误反馈的重试机制
   */
  private async makeAPIRequest(
    prompt: string, 
    temperature: number, 
    previousError: Error | null = null
  ): Promise<any> {
    
    // 如果是重试，在prompt中包含上次的错误信息
    let enhancedPrompt = prompt;
    if (previousError) {
      enhancedPrompt = prompt + `\n\n[系统提示：上次返回格式不正确（${previousError.message}），请严格按照要求的JSON格式重试]`;
    }

    const requestBody = {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的AI角色扮演助手。请严格按照指定的JSON格式返回结果，确保格式完全正确。'
        },
        {
          role: 'user',
          content: enhancedPrompt
        }
      ],
      temperature: temperature,
      max_tokens: 1024, // 快脑模式：减少token数量
      response_format: { type: 'json_object' }
    };

    const response = await fetch(`${this.config.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(this.config.timeout)
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 解析并验证API响应
   * 使用严格的Zod验证确保数据正确性
   */
  private parseAndValidateResponse(response: any, isRetry: boolean = false): SimpleAction {
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
          throw new Error(`无法解析JSON响应: ${content}`);
        }
      }

      // 使用极简Schema验证
      const validatedData = SimpleActionSchema.parse(jsonData);
      
      if (isRetry) {
        console.log('🎯 智能重试成功，格式验证通过');
      } else {
        console.log('📋 快脑响应验证成功');
      }
      
      return validatedData;
      
    } catch (error) {
      console.error('❌ 快脑响应解析失败:', error);
      throw new Error(`响应解析失败: ${error}`);
    }
  }

  /**
   * 工具函数：睡眠
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 🆕 言行合一 - 生成完整行动包
   * 支持同时生成对话、行动和思考，实现更丰富的AI体验
   */
  async generateActionPackage(
    characterName: string,
    characterMotivation: string,
    chatHistory: string,
    userMessage: string,
    temperature: number = 0.7
  ): Promise<ActionPackage> {
    
    if (this.config.apiKey === 'your_deepseek_api_key_here') {
      throw new Error('API密钥未配置，无法调用快脑系统');
    }

    // 构建言行合一的专用Prompt
    const prompt = this.buildActionPackagePrompt(
      characterName, 
      characterMotivation, 
      chatHistory, 
      userMessage
    );

    let lastError: Error | null = null;

    // 智能重试机制
    for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
      try {
        console.log(`🎭 言行合一尝试 ${attempt}/${this.config.maxRetries + 1}: 为${characterName}生成完整行动包`);
        
        const response = await this.makeAPIRequest(prompt, temperature, attempt > 1 ? lastError : null);
        const actionPackage = this.parseAndValidateActionPackage(response, attempt > 1);
        
        console.log(`✅ 言行合一成功为${characterName}生成行动包:`, actionPackage);
        return actionPackage;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ 言行合一尝试 ${attempt} 失败:`, error);
        
        if (attempt === this.config.maxRetries + 1) {
          throw new Error(`言行合一系统调用失败，已重试${this.config.maxRetries}次: ${lastError.message}`);
        }
        
        await this.sleep(1000 * attempt);
      }
    }

    throw new Error('未知错误');
  }

  /**
   * 构建言行合一的专用Prompt
   * 指导AI生成包含对话、行动和思考的完整响应
   */
  private buildActionPackagePrompt(
    characterName: string,
    characterMotivation: string,
    chatHistory: string,
    userMessage: string
  ): string {
    return `你是${characterName}，你的核心动机是${characterMotivation}。

基于以下的聊天记录，请对玩家的最新一句话做出一个完整的、言行合一的回应。

最近的聊天记录：
${chatHistory}

玩家刚才说: "${userMessage}"

请提供一个包含对话、行动和思考的完整响应。严格按照以下JSON格式：

{
  "dialogue": "你要说的话（必须提供）",
  "action": "你的动作描述（可选，如果有明显的动作行为）",
  "thought": "你的内心想法（可选，用于展现角色内心）",
  "actionType": "dialogue"
}

要求：
- dialogue是必须的，这是角色要说的话
- action是可选的，只有当角色有明显的动作时才提供
- thought是可选的，用于展现角色的内心活动
- actionType通常是"dialogue"，除非主要是行动或思考
- 保持角色的一致性和真实感
- 回应要自然、生动、符合情境`;
  }

  /**
   * 解析并验证ActionPackage响应
   */
  private parseAndValidateActionPackage(response: any, isRetry: boolean = false): ActionPackage {
    try {
      const content = response.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('API响应中没有内容');
      }

      let jsonData: any;
      try {
        jsonData = JSON.parse(content);
      } catch (parseError) {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonData = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error(`无法解析JSON响应: ${content}`);
        }
      }

      // 使用ActionPackageSchema验证
      const validatedData = ActionPackageSchema.parse(jsonData);
      
      if (isRetry) {
        console.log('🎯 言行合一智能重试成功，格式验证通过');
      } else {
        console.log('📋 言行合一响应验证成功');
      }
      
      return validatedData;
      
    } catch (error) {
      console.error('❌ 言行合一响应解析失败:', error);
      throw new Error(`响应解析失败: ${error}`);
    }
  }

  /**
   * 测试快脑系统连接
   */
  async testConnection(): Promise<boolean> {
    if (this.config.apiKey === 'your_deepseek_api_key_here') {
      console.log('⚠️ API密钥未配置，跳过快脑连接测试');
      return false;
    }

    try {
      console.log('🔄 测试快脑系统连接...');
      
      const testAction = await this.generateFastResponse(
        '测试角色',
        '进行连接测试',
        '系统: 正在进行连接测试',
        '你好',
        0.1
      );
      
      console.log('✅ 快脑系统连接测试成功', testAction);
      return true;
      
    } catch (error) {
      console.error('❌ 快脑系统连接测试失败:', error);
      return false;
    }
  }
}

/**
 * 全局快脑客户端实例
 */
export const globalFastBrainClient = new FastBrainClient();

/**
 * 便捷的快脑API调用函数（向后兼容）
 */
export async function generateFastAction(
  characterName: string,
  characterMotivation: string,
  chatHistory: string,
  userMessage: string
): Promise<SimpleAction> {
  return await globalFastBrainClient.generateFastResponse(
    characterName,
    characterMotivation,
    chatHistory,
    userMessage
  );
}

/**
 * 🆕 便捷的言行合一API调用函数
 * 支持生成包含对话、行动和思考的完整行动包
 */
export async function generateActionPackage(
  characterName: string,
  characterMotivation: string,
  chatHistory: string,
  userMessage: string
): Promise<ActionPackage> {
  return await globalFastBrainClient.generateActionPackage(
    characterName,
    characterMotivation,
    chatHistory,
    userMessage
  );
}