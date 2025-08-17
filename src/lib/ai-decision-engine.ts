/**
 * AI决策引擎 - 世界心跳的智能核心
 * 
 * 🔧 重构：基于设计哲学的"观察-推断-决策"三步思考链
 * 🚀 升级：使用Vercel AI SDK 5标准，模型统一为alibaba/qwen-3-235b
 * 设计哲学：AI的决策必须是其"核心动机"、"内在状态"和"对外部事件的推断"三者结合的结果
 * 核心创新：AI拥有"自己的生活"，不再仅仅响应玩家，而是主动参与世界
 */

import { generateObject, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { CharacterState, AIDecisionResult, SceneEvent } from './world-engine';
import { getCharacterConfig } from './character_configs';

// 🚀 配置Vercel AI Gateway客户端
const openai = createOpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY || '',
  baseURL: 'https://gateway.ai.cloudflare.com/v1/vercel',
});

/**
 * AI决策上下文 - 传递给LLM的完整信息
 */
export interface AIDecisionContext {
  /** 当前角色状态 */
  character: CharacterState;
  /** 最近的场景事件 */
  recentEvents: SceneEvent[];
  /** 世界心跳计数 */
  tickCount: number;
  /** 距离上次发言的时间（毫秒） */
  timeSinceLastSpeech: number;
  /** 是否有导演强制指令 */
  forceCharacter?: string;
  /** 其他在场角色列表 */
  otherCharacters: CharacterState[];
}

/**
 * 🔧 新增：AI三步思考链的结果接口
 */
export interface AIThreeStepResult {
  /** 第一步：观察结果 */
  observation: {
    environment_summary: string;
    key_events: string[];
    other_characters_status: string[];
    notable_changes: string[];
  };
  /** 第二步：推断结果 */
  inference: {
    situation_analysis: string;
    opportunity_assessment: string;
    risk_evaluation: string;
    motivation_alignment: string;
  };
  /** 第三步：决策结果 */
  decision: AIDecisionResult;
}

/**
 * AI决策引擎类
 */
export class AIDecisionEngine {
  /**
   * 🔧 重构：执行AI自主决策 - 实施观察-推断-决策三步思考链
   */
  static async makeDecision(context: AIDecisionContext): Promise<AIDecisionResult> {
    console.log(`🧠 ${context.character.name} 开始三步思考链决策 (心跳 #${context.tickCount})`);

    // 0. 优先检查导演强制指令
    if (context.forceCharacter && context.forceCharacter === context.character.id) {
      console.log(`🎬 导演强制指令: ${context.character.name} 必须行动`);
      return await this.executeDirectorCommand(context);
    }

    try {
      // 🔧 实施三步思考链
      console.log(`👁️ 第一步：${context.character.name} 开始观察环境...`);
      const observation = await this.performObservation(context);
      
      console.log(`🧠 第二步：${context.character.name} 开始推断分析...`);
      const inference = await this.performInference(context, observation);
      
      console.log(`⚡ 第三步：${context.character.name} 开始最终决策...`);
      const decision = await this.performDecision(context, observation, inference);
      
      // 记录完整的思考过程（仅用于调试）
      console.log(`💭 ${context.character.name} 完整思考链:`, {
        观察: observation.environment_summary,
        推断: inference.situation_analysis,
        决策: decision.decision_reason
      });
      
      return decision;
      
    } catch (error) {
      console.error(`AI三步思考链失败 (${context.character.name}):`, error);
      return {
        should_act: false,
        decision_reason: `思考链失败: ${error}`,
      };
    }
  }

  /**
   * 🚀 升级：第一步 - 观察环境（使用结构化输出）
   */
  private static async performObservation(context: AIDecisionContext): Promise<AIThreeStepResult['observation']> {
    const observationPrompt = this.buildObservationPrompt(context);
    return await this.parseObservationResponse(observationPrompt, context.character);
  }

  /**
   * 🚀 升级：第二步 - 推断分析（使用结构化输出）
   */
  private static async performInference(
    context: AIDecisionContext, 
    observation: AIThreeStepResult['observation']
  ): Promise<AIThreeStepResult['inference']> {
    const inferencePrompt = this.buildInferencePrompt(context, observation);
    return await this.parseInferenceResponse(inferencePrompt, context.character);
  }

  /**
   * 🚀 升级：第三步 - 最终决策（使用结构化输出）
   */
  private static async performDecision(
    context: AIDecisionContext,
    observation: AIThreeStepResult['observation'],
    inference: AIThreeStepResult['inference']
  ): Promise<AIDecisionResult> {
    const decisionPrompt = this.buildFinalDecisionPrompt(context, observation, inference);
    return await this.parseDecisionResponse(decisionPrompt, context.character);
  }

  /**
   * 🔧 新增：构建观察阶段提示词
   */
  private static buildObservationPrompt(context: AIDecisionContext): string {
    const { character, recentEvents } = context;
    const config = getCharacterConfig(character.id);

    const eventsDescription = recentEvents.length > 0 
      ? recentEvents.map(event => `[${new Date(event.timestamp).toLocaleTimeString()}] ${event.speaker_id}: ${event.content}`).join('\n')
      : '(最近没有任何事件发生)';

    return `你是${character.name}，正在月影酒馆中。现在请仔细观察周围的环境。

【角色设定】
${config?.motivation || '你是一个普通的角色'}

【最近发生的事情】
${eventsDescription}

【观察任务】
请客观地观察和记录你所能感知到的信息，不要做任何推断或决策。只需要如实记录你看到、听到的事情。

请用以下JSON格式回复：
{
  "environment_summary": "对当前环境的总体描述",
  "key_events": ["重要事件1", "重要事件2"],
  "other_characters_status": ["其他角色的行为观察"],
  "notable_changes": ["值得注意的变化"]
}`;
  }

  /**
   * 🔧 新增：构建推断阶段提示词
   */
  private static buildInferencePrompt(context: AIDecisionContext, observation: AIThreeStepResult['observation']): string {
    const { character } = context;
    const state = character.internal_state;
    const config = getCharacterConfig(character.id);

    return `你是${character.name}，现在基于你的观察进行分析推断。

【角色设定】
${config?.motivation || '你是一个普通的角色'}

【你的当前内在状态】
- 能量值: ${state.energy}/100
- 专注度: ${state.focus}/100  
- 好奇心: ${state.curiosity}/100
- 无聊值: ${state.boredom}/100

【你的观察结果】
- 环境总结: ${observation.environment_summary}
- 关键事件: ${observation.key_events.join(', ')}
- 其他角色状态: ${observation.other_characters_status.join(', ')}
- 值得注意的变化: ${observation.notable_changes.join(', ')}

【推断任务】
基于你的观察和内在状态，分析当前情况并评估行动机会。

请用以下JSON格式回复：
{
  "situation_analysis": "对当前情况的分析",
  "opportunity_assessment": "评估是否有行动的机会",
  "risk_evaluation": "评估行动的风险",
  "motivation_alignment": "分析是否符合你的动机和性格"
}`;
  }

  /**
   * 🔧 新增：构建最终决策阶段提示词  
   */
  private static buildFinalDecisionPrompt(
    context: AIDecisionContext, 
    observation: AIThreeStepResult['observation'],
    inference: AIThreeStepResult['inference']
  ): string {
    const { character, timeSinceLastSpeech } = context;
    const timeDescription = timeSinceLastSpeech > 300000 ? `你已经沉默了${Math.round(timeSinceLastSpeech / 60000)}分钟`
      : timeSinceLastSpeech > 60000 ? `你上次发言是${Math.round(timeSinceLastSpeech / 60000)}分钟前`
      : '你刚刚还在参与对话';

    return `你是${character.name}，现在基于观察和推断做出最终决策。

【时间情况】
${timeDescription}

【你的观察】
${observation.environment_summary}

【你的推断】
情况分析: ${inference.situation_analysis}
机会评估: ${inference.opportunity_assessment}
风险评估: ${inference.risk_evaluation}
动机一致性: ${inference.motivation_alignment}

【决策要求】
基于以上三者结合（观察+推断+内在状态），决定你现在是否要行动。

🔧 重要：输出必须包含dialogue、action、thought三个字段（ActionPackage格式）

请用以下JSON格式回复：
{
  "should_act": true,
  "dialogue": "如果你要说话，写在这里（可选）",
  "action": "如果你要做什么动作，写在这里（可选）", 
  "thought": "你的内心想法，别人看不见，仅用于日志记录",
  "emotion_change": {
    "boredom": -20,
    "curiosity": 10
  },
  "decision_reason": "基于观察-推断-内在状态的决策理由"
}

约束条件：
1. 大部分时候应该保持沉默(should_act: false)
2. 无聊值>70时可考虑主动行动
3. thought字段必填但只用于后台日志，永不对玩家显示
4. 确保JSON格式正确，无尾部逗号`;
  }

  /**
   * 构建AI决策提示词（已废弃，保留用于向后兼容）
   */
  private static buildDecisionPrompt(context: AIDecisionContext): string {
    const { character, recentEvents, timeSinceLastSpeech } = context;
    const state = character.internal_state;
    const config = getCharacterConfig(character.id);

    // 格式化最近事件
    const eventsDescription = recentEvents.length > 0 
      ? recentEvents.map(event => `[${new Date(event.timestamp).toLocaleTimeString()}] ${event.speaker_id}: ${event.content}`).join('\n')
      : '(最近没有任何事件发生)';

    // 计算时间描述
    const timeDescription = timeSinceLastSpeech > 300000 // 5分钟
      ? `你已经沉默了${Math.round(timeSinceLastSpeech / 60000)}分钟`
      : timeSinceLastSpeech > 60000 // 1分钟
      ? `你上次发言是${Math.round(timeSinceLastSpeech / 60000)}分钟前`
      : '你刚刚还在参与对话';

    return `你是${character.name}，当前正在月影酒馆中。

【角色设定】
${config?.motivation || '你是一个普通的角色'}

【当前内在状态】
- 能量值: ${state.energy}/100 ${state.energy > 70 ? '(精力充沛)' : state.energy > 40 ? '(状态一般)' : '(有些疲惫)'}
- 专注度: ${state.focus}/100 ${state.focus > 60 ? '(注意力集中)' : state.focus > 30 ? '(有些分心)' : '(注意力分散)'}
- 好奇心: ${state.curiosity}/100 ${state.curiosity > 70 ? '(对周围很感兴趣)' : state.curiosity > 40 ? '(适度好奇)' : '(兴趣缺缺)'}
- 无聊值: ${state.boredom}/100 ${state.boredom > 70 ? '(非常无聊，想找点事做)' : state.boredom > 40 ? '(有点无聊)' : '(状态还不错)'}

【时间情况】
${timeDescription}

【最近发生的事情】
${eventsDescription}

【决策要求】
请基于你的角色设定、当前内在状态、以及周围环境，决定你现在是否要做什么。

重要约束：
1. 大部分时候应该保持沉默，只在有强烈动机时才行动
2. 如果无聊值很高(>70)，可以考虑主动找话题或做点什么
3. 如果好奇心很高(>80)且最近有有趣的事件，可以考虑询问或观察
4. 如果有人直接对你说话，通常应该回应
5. 你的对话和行动必须符合你的角色性格
6. 你看不到任何人的内心想法，只能观察外在行为

🔧 已废弃：请使用新的三步思考链决策流程

请用以下JSON格式回复（必须是有效的JSON，不要有尾部逗号）：
{
  "should_act": true,
  "dialogue": "如果你要说话，写在这里",
  "action": "如果你要做什么动作，写在这里", 
  "thought": "你的内心想法（仅用于后台日志）",
  "emotion_change": {
    "boredom": -20,
    "curiosity": 10
  },
  "decision_reason": "简单解释为什么做这个决定"
}`;
  }

  /**
   * 🔧 新增：调用LLM进行观察
   */
  private static async callLLMForObservation(prompt: string, character: CharacterState): Promise<string> {
    console.log(`👁️ 为 ${character.name} 调用LLM观察...`);
    return await this.callLLM(prompt, character, '观察');
  }

  /**
   * 🔧 新增：调用LLM进行推断
   */
  private static async callLLMForInference(prompt: string, character: CharacterState): Promise<string> {
    console.log(`🧠 为 ${character.name} 调用LLM推断...`);
    return await this.callLLM(prompt, character, '推断');
  }

  /**
   * 调用LLM进行决策
   */
  private static async callLLMForDecision(prompt: string, character: CharacterState): Promise<string> {
    console.log(`⚡ 为 ${character.name} 调用LLM决策...`);
    return await this.callLLM(prompt, character, '决策');
  }

  /**
   * 🚀 升级：使用Vercel AI SDK 5的统一LLM调用方法
   */
  private static async callLLM(prompt: string, character: CharacterState, phase: string): Promise<string> {
    console.log(`🤖 为 ${character.name} 调用LLM${phase}...`);
    
    try {
      // 🚀 使用Vercel AI SDK 5的generateText API
      const { text } = await generateText({
        model: openai('alibaba/qwen-3-235b'), // 🎯 统一模型ID
        system: `你是一个AI角色，正在进行${phase}阶段的思考。请严格按照要求的JSON格式回复。`,
        prompt: prompt,
        temperature: phase === '观察' ? 0.3 : phase === '推断' ? 0.6 : 0.8, // 观察客观，推断平衡，决策创新
        maxTokens: phase === '观察' ? 300 : phase === '推断' ? 400 : 500,
      });

      console.log(`🤖 ${character.name} ${phase}响应长度: ${text.length} 字符`);
      return text;
      
    } catch (error) {
      console.error(`🚀 Vercel AI SDK调用失败 (${character.name} ${phase}):`, error);
      throw new Error(`LLM调用失败: ${error}`);
    }
  }

  /**
   * 🚀 升级：使用Vercel AI SDK 5的结构化观察响应解析
   */
  private static async parseObservationResponse(prompt: string, character: CharacterState): Promise<AIThreeStepResult['observation']> {
    try {
      // 🚀 使用generateObject确保类型安全的结构化输出
      const observationSchema = z.object({
        environment_summary: z.string().describe('对当前环境的总体描述'),
        key_events: z.array(z.string()).describe('重要事件列表'),
        other_characters_status: z.array(z.string()).describe('其他角色的行为观察'),
        notable_changes: z.array(z.string()).describe('值得注意的变化')
      });

      const { object } = await generateObject({
        model: openai('alibaba/qwen-3-235b'), // 🎯 统一模型ID
        schema: observationSchema,
        system: `你是一个AI角色，正在进行观察阶段的思考。请客观地观察和记录你所能感知到的信息。`,
        prompt: prompt,
        temperature: 0.3, // 观察阶段要求客观
        maxTokens: 300,
      });

      console.log(`🚀 ${character.name} 结构化观察解析成功`);
      return object;
      
    } catch (error) {
      console.error('🚀 结构化观察解析失败:', error);
      return {
        environment_summary: '观察解析失败',
        key_events: [],
        other_characters_status: [],
        notable_changes: []
      };
    }
  }

  /**
   * 🚀 升级：使用Vercel AI SDK 5的结构化推断响应解析
   */
  private static async parseInferenceResponse(prompt: string, character: CharacterState): Promise<AIThreeStepResult['inference']> {
    try {
      // 🚀 使用generateObject确保类型安全的结构化输出
      const inferenceSchema = z.object({
        situation_analysis: z.string().describe('对当前情况的分析'),
        opportunity_assessment: z.string().describe('评估是否有行动的机会'),
        risk_evaluation: z.string().describe('评估行动的风险'),
        motivation_alignment: z.string().describe('分析是否符合角色动机和性格')
      });

      const { object } = await generateObject({
        model: openai('alibaba/qwen-3-235b'), // 🎯 统一模型ID
        schema: inferenceSchema,
        system: `你是一个AI角色，正在进行推断阶段的思考。基于观察进行分析推断。`,
        prompt: prompt,
        temperature: 0.6, // 推断阶段平衡客观性和创造性
        maxTokens: 400,
      });

      console.log(`🚀 ${character.name} 结构化推断解析成功`);
      return object;
      
    } catch (error) {
      console.error('🚀 结构化推断解析失败:', error);
      return {
        situation_analysis: '推断解析失败',
        opportunity_assessment: '无机会',
        risk_evaluation: '风险未知',
        motivation_alignment: '动机不明'
      };
    }
  }

  /**
   * 🚀 升级：使用Vercel AI SDK 5的结构化决策响应解析 - 支持ActionPackage格式
   */
  private static async parseDecisionResponse(prompt: string, character: CharacterState): Promise<AIDecisionResult> {
    try {
      // 🚀 使用generateObject确保类型安全的ActionPackage格式输出
      const decisionSchema = z.object({
        should_act: z.boolean().describe('是否决定行动'),
        dialogue: z.string().optional().describe('如果要说话，写在这里（可选）'),
        action: z.string().optional().describe('如果要做什么动作，写在这里（可选）'),
        thought: z.string().describe('内心想法，别人看不见，仅用于日志记录'),
        emotion_change: z.object({
          boredom: z.number().optional(),
          curiosity: z.number().optional(),
          energy: z.number().optional(),
          focus: z.number().optional()
        }).optional().describe('情绪变化'),
        decision_reason: z.string().describe('基于观察-推断-内在状态的决策理由')
      });

      const { object } = await generateObject({
        model: openai('alibaba/qwen-3-235b'), // 🎯 统一模型ID
        schema: decisionSchema,
        system: `你是一个AI角色，正在进行最终决策阶段的思考。基于观察和推断做出行动决策。`,
        prompt: prompt,
        temperature: 0.8, // 决策阶段允许创造性
        maxTokens: 500,
      });

      console.log(`🚀 ${character.name} 结构化决策解析成功: should_act=${object.should_act}`);
      
      return {
        should_act: object.should_act,
        dialogue: object.dialogue || undefined,
        action: object.action || undefined,
        internal_thought: object.thought, // 🔧 ActionPackage格式：thought -> internal_thought
        emotion_change: object.emotion_change || undefined,
        decision_reason: object.decision_reason || '无说明',
      };
      
    } catch (error) {
      console.error('🚀 结构化决策解析失败:', error);
      
      // 返回默认的"不行动"决策
      return {
        should_act: false,
        decision_reason: `响应解析失败: ${error}`,
      };
    }
  }

  // 🚀 注意：使用Vercel AI SDK 5的generateObject后，不再需要JSON清理方法
  // 结构化输出确保类型安全，无需手动解析JSON

  /**
   * 执行导演强制指令
   */
  private static async executeDirectorCommand(context: AIDecisionContext): Promise<AIDecisionResult> {
    // 导演命令通常用于强制AI说话或行动
    // 这里可以实现更复杂的导演逻辑
    return {
      should_act: true,
      dialogue: `(${context.character.name} 被导演强制行动)`,
      decision_reason: '导演强制指令',
    };
  }

  /**
   * 计算AI行动的基础概率
   */
  static calculateActionProbability(character: CharacterState, timeSinceLastSpeech: number): number {
    const state = character.internal_state;
    let probability = 0;

    // 基于无聊值
    if (state.boredom > 80) probability += 0.6;
    else if (state.boredom > 60) probability += 0.3;
    else if (state.boredom > 40) probability += 0.1;

    // 基于好奇心和能量
    if (state.curiosity > 70 && state.energy > 50) {
      probability += 0.3;
    }

    // 基于沉默时间
    const minutesSilent = timeSinceLastSpeech / (1000 * 60);
    if (minutesSilent > 10) probability += 0.4; // 沉默超过10分钟，增加行动概率
    else if (minutesSilent > 5) probability += 0.2;

    // 角色特性修正
    if (character.id === 'linxi') {
      // 林溪更主动
      probability *= 1.2;
    } else if (character.id === 'chenhao') {
      // 陈浩更被动
      probability *= 0.7;
    }

    return Math.min(probability, 0.9); // 最高90%概率
  }
}