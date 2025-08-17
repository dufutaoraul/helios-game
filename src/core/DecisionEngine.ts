/**
 * AI 行为决策引擎 - 系统的"大脑"
 * 
 * 这是整个赫利俄斯项目的核心中的核心。这个决策引擎负责实现
 * "从观察到推断，再到决策"的高级AI思考链条。
 * 
 * 设计哲学：
 * 1. 多层次信息整合：内在状态 + 信念系统 + 场景上下文 + 历史记忆
 * 2. 渐进式推理：观察 → 分析 → 推断 → 决策 → 行动
 * 3. 个性化反应：不同角色对同样情况有完全不同的反应
 * 4. 动态适应：决策会影响内在状态，形成反馈循环
 */

import { 
  ChannelMessage, 
  DecisionRequest, 
  DecisionResponse, 
  InternalState, 
  BeliefSystem, 
  Scene,
  Character 
} from '../types';
import { globalInternalStateManager } from './InternalStateManager';
import { CommonStateModifiers } from './StateModifiers';
import { generateSceneSummary } from '../simulation/ChannelUtils';

/**
 * 决策上下文
 * 包含AI做决策时需要的所有信息
 */
interface DecisionContext {
  /** 当前角色信息 */
  character: Character;
  /** 角色的内在状态 */
  internalState: InternalState;
  /** 角色的信念系统（如果存在） */
  beliefSystem?: BeliefSystem;
  /** 当前场景信息 */
  scene: Scene;
  /** 最近的场景事件 */
  recentEvents: ChannelMessage[];
  /** 场景摘要 */
  sceneSummary: string;
  /** 决策超时时间（毫秒） */
  timeoutMs: number;
  /** 上次决策的时间 */
  lastDecisionTime?: number;
}

/**
 * LLM推理步骤结果
 * 记录AI思考过程的各个阶段
 */
interface ReasoningSteps {
  /** 步骤1：观察分析 */
  observation: {
    keyEvents: string[];
    environmentalFactors: string[];
    socialDynamics: string[];
  };
  /** 步骤2：内在状态影响分析 */
  internalAnalysis: {
    energyInfluence: string;
    focusInfluence: string;
    curiosityInfluence: string;
    overallMood: string;
  };
  /** 步骤3：信念系统过滤 */
  beliefFiltering: {
    relevantBeliefs: string[];
    conflictingBeliefs: string[];
    motivationalFactors: string[];
  };
  /** 步骤4：行为选项生成 */
  optionGeneration: {
    possibleActions: Array<{
      action: string;
      type: 'dialogue' | 'action' | 'wait';
      risk: 'low' | 'medium' | 'high';
      reward: 'low' | 'medium' | 'high';
    }>;
  };
  /** 步骤5：最终决策 */
  finalDecision: {
    chosenAction: string;
    actionType: 'dialogue' | 'action' | 'wait';
    reasoning: string;
    confidence: number;
    expectedOutcome: string;
  };
}

/**
 * AI行为决策引擎
 * 
 * 这个引擎实现了复杂的AI决策逻辑，将多个信息源整合起来，
 * 通过结构化的推理过程，生成符合角色特性的行为决策。
 */
export class DecisionEngine {
  /** 决策历史记录 */
  private decisionHistory: Map<string, DecisionResponse[]> = new Map();

  constructor() {
    console.log('🧠 AI决策引擎已启动 - 准备进行复杂推理');
  }

  /**
   * 执行AI决策的主函数
   * 
   * 这是整个系统最重要的函数，它整合所有可用信息，
   * 通过精心设计的Prompt引导LLM完成复杂的决策过程。
   */
  async makeDecision(request: DecisionRequest): Promise<DecisionResponse> {
    console.log(`\n🤔 开始为角色 ${request.character_id} 进行决策分析...`);

    try {
      // 1. 收集决策上下文
      const context = await this.gatherDecisionContext(request);
      
      // 2. 构建决策Prompt
      const prompt = this.buildDecisionPrompt(context);
      
      // 3. 调用LLM进行推理
      const reasoning = await this.performLLMReasoning(prompt, context);
      
      // 4. 构建决策响应
      const response = this.buildDecisionResponse(context, reasoning);
      
      // 5. 记录决策历史
      this.recordDecision(request.character_id, response);
      
      // 6. 更新内在状态
      await this.updateInternalStateFromDecision(context, response);
      
      console.log(`✅ 决策完成: ${response.decision.type} - "${response.decision.content || response.decision.description}"`);
      
      return response;
      
    } catch (error) {
      console.error(`❌ 决策过程出错:`, error);
      return this.createFallbackDecision(request);
    }
  }

  /**
   * 收集决策所需的所有上下文信息
   */
  private async gatherDecisionContext(request: DecisionRequest): Promise<DecisionContext> {
    // 获取角色信息（这里简化处理，实际应该从数据库获取）
    const character: Character = {
      id: request.character_id,
      name: request.character_id.replace(/_\d+$/, ''), // 简化处理
      role: '待定', // 实际应该从数据库获取
      core_motivation: '待定',
      type: 'ai_npc',
      is_online: true,
      current_scene: request.current_scene.id,
      created_at: Date.now()
    };

    // 获取内在状态
    const internalState = globalInternalStateManager.getCharacterState(request.character_id);
    if (!internalState) {
      throw new Error(`角色 ${request.character_id} 的内在状态不存在`);
    }

    // 获取信念系统（这里模拟，实际应该从数据库获取）
    const beliefSystem: BeliefSystem | undefined = undefined; // 暂时为空

    // 生成场景摘要
    const sceneSummary = generateSceneSummary(request.scene_events, 200);

    return {
      character,
      internalState,
      beliefSystem,
      scene: request.current_scene,
      recentEvents: request.scene_events.slice(-10), // 最近10个事件
      sceneSummary,
      timeoutMs: request.timeout_ms || 30000
    };
  }

  /**
   * 构建决策Prompt - 这是整个系统的核心所在
   * 
   * 这个函数构建了一个精心设计的Prompt，引导LLM完成
   * "从观察到推断，再到决策"的完整思考过程。
   */
  private buildDecisionPrompt(context: DecisionContext): string {
    const { character, internalState, scene, recentEvents, sceneSummary } = context;

    return `你是一个高级AI角色扮演代理，正在扮演角色"${character.name}"。你需要基于当前情况做出符合角色特性的行为决策。

## 🎭 角色基本信息
- **姓名**: ${character.name}
- **身份**: ${character.role}
- **核心动机**: ${character.core_motivation}
- **当前位置**: ${scene.name} - ${scene.description}

## 🧠 当前内在状态 (这是你的"内心世界"，影响你的所有决策)
- **能量水平**: ${internalState.energy.toFixed(1)}/10 ${this.getEnergyDescription(internalState.energy)}
- **专注程度**: ${internalState.focus.toFixed(1)}/10 ${this.getFocusDescription(internalState.focus)}
- **好奇心**: ${internalState.curiosity.toFixed(1)}/10 ${this.getCuriosityDescription(internalState.curiosity)}

## 📍 当前场景状况
${sceneSummary}

## 📜 最近发生的事件 (按时间顺序)
${this.formatEventsForPrompt(recentEvents)}

## 🎯 决策任务
请按照以下5个步骤进行系统性思考，并以JSON格式返回你的推理过程：

### 步骤1: 观察分析 🔍
仔细观察当前场景，识别：
- 关键事件和变化
- 环境因素（氛围、物理条件等）
- 社交动态（角色关系、权力结构等）

### 步骤2: 内在状态影响分析 💭
分析你的内在状态如何影响你的感知和倾向：
- 当前能量水平让你倾向于什么行为？
- 你的专注程度如何影响你的决策质量？
- 你的好奇心水平是否驱动你探索或询问？
- 综合来看，你现在的"心情"如何？

### 步骤3: 信念系统过滤 ⚖️
基于你的角色设定和动机，思考：
- 哪些价值观和信念与当前情况相关？
- 是否存在内在冲突的信念？
- 什么最能驱动你的行为选择？

### 步骤4: 行为选项生成 🎲
基于上述分析，生成3-5个可能的行为选项：
- 每个选项包括：行为描述、类型、风险评估、潜在收益
- 确保选项符合你的角色特性和当前状态

### 步骤5: 最终决策 ⚡
选择最符合你角色特性和当前状态的行为：
- 明确说明你的选择和理由
- 评估决策的信心程度（0-1）
- 预期这个行为会产生什么结果

## 📋 返回格式要求
请严格按照以下JSON格式返回你的完整推理过程：

\`\`\`json
{
  "observation": {
    "keyEvents": ["事件1", "事件2", "..."],
    "environmentalFactors": ["因素1", "因素2", "..."],
    "socialDynamics": ["动态1", "动态2", "..."]
  },
  "internalAnalysis": {
    "energyInfluence": "能量水平的影响分析",
    "focusInfluence": "专注程度的影响分析",
    "curiosityInfluence": "好奇心的影响分析",
    "overallMood": "整体心理状态描述"
  },
  "beliefFiltering": {
    "relevantBeliefs": ["相关信念1", "相关信念2", "..."],
    "conflictingBeliefs": ["冲突信念1", "冲突信念2", "..."],
    "motivationalFactors": ["动机因素1", "动机因素2", "..."]
  },
  "optionGeneration": {
    "possibleActions": [
      {
        "action": "具体行为描述",
        "type": "dialogue|action|wait",
        "risk": "low|medium|high",
        "reward": "low|medium|high"
      }
    ]
  },
  "finalDecision": {
    "chosenAction": "最终选择的行为",
    "actionType": "dialogue|action|wait",
    "reasoning": "选择这个行为的详细理由",
    "confidence": 0.85,
    "expectedOutcome": "预期的结果"
  }
}
\`\`\`

## ⚠️ 重要提醒
1. **保持角色一致性**: 你的决策必须符合角色设定和动机
2. **考虑内在状态**: 你的能量、专注度、好奇心直接影响行为倾向
3. **响应环境变化**: 根据最新事件和环境因素调整策略
4. **展现个性**: 不要给出通用的、模板化的回应
5. **考虑后果**: 思考你的行为可能产生的连锁反应

现在，请开始你的决策推理过程：`;
  }

  /**
   * 使用DeepSeek API进行推理
   */
  private async performLLMReasoning(prompt: string, context: DecisionContext): Promise<ReasoningSteps> {
    try {
      // 调用DeepSeek API
      const { generateAIDecision } = await import('../lib/deepseek');
      console.log('🔄 正在调用DeepSeek API进行推理...');
      
      const reasoning = await generateAIDecision(prompt);
      
      console.log('📝 DeepSeek API推理完成，解析结果...');
      return reasoning;
      
    } catch (error) {
      console.warn('⚠️ DeepSeek API调用失败，使用模拟推理:', error);
      
      // 如果API调用失败，使用模拟推理作为后备
      const mockReasoning = this.generateMockReasoning(context);
      console.log('📝 模拟推理完成');
      return mockReasoning;
    }
  }

  /**
   * 生成模拟的推理结果（用于演示）
   * 在实际项目中，这里会被真实的LLM响应替换
   */
  private generateMockReasoning(context: DecisionContext): ReasoningSteps {
    const { character, internalState, recentEvents } = context;
    
    // 基于内在状态决定行为倾向
    const isHighEnergy = internalState.energy > 6;
    const isHighFocus = internalState.focus > 6;
    const isHighCuriosity = internalState.curiosity > 6;
    
    // 分析最近事件
    const hasDialogue = recentEvents.some(e => e.type === 'dialogue');
    const hasConflict = recentEvents.some(e => 
      e.type === 'dialogue' && (e as any).content?.includes('威胁') ||
      e.type === 'action' && (e as any).description?.includes('拍桌')
    );

    return {
      observation: {
        keyEvents: recentEvents.map(e => 
          e.type === 'dialogue' ? `${(e as any).character}说话` : 
          e.type === 'action' ? `${(e as any).character}行动` : '环境变化'
        ),
        environmentalFactors: ['酒馆环境', '烛光摇曳', '其他客人在场'],
        socialDynamics: hasConflict ? ['紧张对峙', '注意力集中'] : ['相对平静', '正常交流']
      },
      internalAnalysis: {
        energyInfluence: isHighEnergy ? '能量充沛，倾向于主动行动' : '能量不足，倾向于保守',
        focusInfluence: isHighFocus ? '专注度高，能够深入思考' : '注意力涣散，容易受干扰',
        curiosityInfluence: isHighCuriosity ? '好奇心强，想要探索了解' : '对新事物兴趣有限',
        overallMood: this.determineMood(internalState)
      },
      beliefFiltering: {
        relevantBeliefs: [`${character.core_motivation}是核心驱动`],
        conflictingBeliefs: hasConflict ? ['想要和平但面临冲突'] : [],
        motivationalFactors: [character.core_motivation]
      },
      optionGeneration: {
        possibleActions: this.generateActionOptions(context, hasConflict, isHighEnergy, isHighCuriosity)
      },
      finalDecision: this.makeFinalDecision(context, hasConflict, isHighEnergy, isHighFocus, isHighCuriosity)
    };
  }

  /**
   * 生成行为选项
   */
  private generateActionOptions(context: DecisionContext, hasConflict: boolean, isHighEnergy: boolean, isHighCuriosity: boolean) {
    const options = [];

    if (hasConflict) {
      if (isHighEnergy) {
        options.push({
          action: '直接回应挑战',
          type: 'dialogue' as const,
          risk: 'high' as const,
          reward: 'medium' as const
        });
      }
      options.push({
        action: '试图缓解紧张气氛',
        type: 'dialogue' as const,
        risk: 'medium' as const,
        reward: 'high' as const
      });
      options.push({
        action: '观察等待',
        type: 'wait' as const,
        risk: 'low' as const,
        reward: 'low' as const
      });
    } else {
      if (isHighCuriosity) {
        options.push({
          action: '主动打招呼询问',
          type: 'dialogue' as const,
          risk: 'low' as const,
          reward: 'medium' as const
        });
      }
      options.push({
        action: '继续自己的事情',
        type: 'action' as const,
        risk: 'low' as const,
        reward: 'low' as const
      });
    }

    return options;
  }

  /**
   * 做出最终决策
   */
  private makeFinalDecision(context: DecisionContext, hasConflict: boolean, isHighEnergy: boolean, isHighFocus: boolean, isHighCuriosity: boolean) {
    const { character } = context;
    
    if (hasConflict) {
      if (character.name.includes('林溪') && isHighEnergy) {
        return {
          chosenAction: '挑衅性地回应，显示自己不怕事',
          actionType: 'dialogue' as const,
          reasoning: '作为流浪者，不能显示怯懦，需要维护自己的地位',
          confidence: 0.8,
          expectedOutcome: '可能升级冲突，但确立自己的地位'
        };
      } else if (character.name.includes('陈浩')) {
        return {
          chosenAction: '冷静地表明立场，不寻求冲突',
          actionType: 'dialogue' as const,
          reasoning: '专注型人格，不喜欢冲突，但会保护自己',
          confidence: 0.9,
          expectedOutcome: '试图缓解紧张，避免不必要的麻烦'
        };
      }
    } else {
      if (isHighCuriosity) {
        return {
          chosenAction: '观察新来的人，考虑是否交流',
          actionType: 'action' as const,
          reasoning: '好奇心驱动，想了解新情况',
          confidence: 0.7,
          expectedOutcome: '获得更多信息，可能开启新的互动'
        };
      }
    }

    // 默认决策
    return {
      chosenAction: '继续观察当前情况',
      actionType: 'wait' as const,
      reasoning: '当前状态下最安全的选择',
      confidence: 0.6,
      expectedOutcome: '保持现状，等待更好的机会'
    };
  }

  /**
   * 构建决策响应
   */
  private buildDecisionResponse(context: DecisionContext, reasoning: ReasoningSteps): DecisionResponse {
    const { character, scene } = context;
    const { finalDecision } = reasoning;

    // 根据决策类型构建具体的行为消息
    let decision: ChannelMessage;
    
    if (finalDecision.actionType === 'dialogue') {
      decision = {
        type: 'dialogue',
        character: character.name,
        content: finalDecision.chosenAction,
        timestamp: Date.now(),
        scene_id: scene.id
      };
    } else if (finalDecision.actionType === 'action') {
      decision = {
        type: 'action',
        character: character.name,
        description: finalDecision.chosenAction,
        timestamp: Date.now(),
        scene_id: scene.id
      };
    } else {
      // wait类型，不产生可观测行为
      decision = {
        type: 'action',
        character: character.name,
        description: '安静地观察着周围的情况',
        timestamp: Date.now(),
        scene_id: scene.id
      };
    }

    return {
      character_id: character.id,
      decision,
      reasoning: JSON.stringify(reasoning, null, 2),
      confidence: finalDecision.confidence
    };
  }

  /**
   * 记录决策历史
   */
  private recordDecision(characterId: string, response: DecisionResponse): void {
    const history = this.decisionHistory.get(characterId) || [];
    history.push(response);
    
    // 限制历史记录长度
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    this.decisionHistory.set(characterId, history);
  }

  /**
   * 根据决策更新内在状态
   */
  private async updateInternalStateFromDecision(context: DecisionContext, response: DecisionResponse): Promise<void> {
    // 简单的状态更新逻辑
    if (response.decision.type === 'dialogue') {
      // 说话消耗能量，但可能增加专注度
      globalInternalStateManager.applyStateModifier(context.character.id, {
        energyDelta: -0.2,
        focusDelta: 0.3,
        curiosityDelta: 0.1,
        reason: '进行对话交流'
      });
    } else if (response.decision.type === 'action') {
      // 行动消耗能量
      globalInternalStateManager.applyStateModifier(context.character.id, {
        energyDelta: -0.3,
        focusDelta: 0.1,
        curiosityDelta: -0.1,
        reason: '执行物理行动'
      });
    }
  }

  /**
   * 创建回退决策（当出错时使用）
   */
  private createFallbackDecision(request: DecisionRequest): DecisionResponse {
    return {
      character_id: request.character_id,
      decision: {
        type: 'action',
        character: request.character_id.replace(/_\d+$/, ''),
        description: '困惑地看着周围，似乎在思考什么',
        timestamp: Date.now(),
        scene_id: request.current_scene.id
      },
      reasoning: '决策过程出现错误，使用默认行为',
      confidence: 0.3
    };
  }

  // === 辅助方法 ===

  private getEnergyDescription(energy: number): string {
    if (energy > 7) return '(精力充沛)';
    if (energy > 4) return '(状态正常)';
    if (energy > 2) return '(有些疲倦)';
    return '(精疲力竭)';
  }

  private getFocusDescription(focus: number): string {
    if (focus > 7) return '(高度专注)';
    if (focus > 4) return '(注意力集中)';
    if (focus > 2) return '(容易分心)';
    return '(无法集中)';
  }

  private getCuriosityDescription(curiosity: number): string {
    if (curiosity > 7) return '(极度好奇)';
    if (curiosity > 4) return '(有些兴趣)';
    if (curiosity > 2) return '(兴趣不大)';
    return '(毫无兴趣)';
  }

  private determineMood(state: InternalState): string {
    const total = state.energy + state.focus + state.curiosity;
    if (total > 20) return '积极活跃';
    if (total > 15) return '状态良好';
    if (total > 10) return '平静普通';
    if (total > 5) return '略显消沉';
    return '情绪低落';
  }

  private formatEventsForPrompt(events: ChannelMessage[]): string {
    if (events.length === 0) {
      return '暂时没有特殊事件发生。';
    }

    return events.map((event, index) => {
      const timeStr = new Date(event.timestamp).toLocaleTimeString();
      
      switch (event.type) {
        case 'dialogue':
          const dialogue = event as any;
          return `${index + 1}. [${timeStr}] ${dialogue.character}说: "${dialogue.content}"`;
        case 'action':
          const action = event as any;
          return `${index + 1}. [${timeStr}] ${action.character} ${action.description}`;
        case 'environment':
          const env = event as any;
          return `${index + 1}. [${timeStr}] 环境变化: ${env.description}`;
        default:
          return `${index + 1}. [${timeStr}] 未知事件`;
      }
    }).join('\n');
  }

  /**
   * 获取角色的决策历史
   */
  getDecisionHistory(characterId: string, limit?: number): DecisionResponse[] {
    const history = this.decisionHistory.get(characterId) || [];
    return limit ? history.slice(-limit) : [...history];
  }
}

/**
 * 全局决策引擎实例
 */
export const globalDecisionEngine = new DecisionEngine();