/**
 * 数据库模拟器
 * 
 * 这个模拟器通过控制台日志的方式模拟数据库操作，为MVP开发阶段
 * 提供完整的数据存储和查询功能。在实际部署时，可以很容易地
 * 替换为真实的Supabase数据库操作。
 * 
 * 设计原理：
 * 1. 完全兼容实际数据库的接口设计
 * 2. 使用内存存储+控制台日志记录所有操作
 * 3. 提供丰富的查询和分析功能
 * 4. 为未来迁移到真实数据库做好准备
 */

import { 
  Character, 
  AgentLog, 
  BeliefSystem, 
  GameEvent, 
  Scene, 
  InternalState 
} from '../types';

/**
 * 数据库表接口
 */
interface DatabaseTables {
  characters: Map<string, Character>;
  agent_logs: Map<string, AgentLog>;
  belief_systems: Map<string, BeliefSystem>;
  events: Map<string, GameEvent>;
  scenes: Map<string, Scene>;
  internal_states: Map<string, InternalState>; // 模拟内部状态存储
}

/**
 * 数据库操作类型
 */
type DatabaseOperation = 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT';

/**
 * 数据库操作记录
 */
interface DatabaseOperationLog {
  id: string;
  timestamp: number;
  operation: DatabaseOperation;
  table: keyof DatabaseTables;
  recordId: string;
  data?: any;
  query?: string;
  result?: any;
  duration: number;
}

/**
 * 查询条件接口
 */
interface QueryCondition {
  field: string;
  operator: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE' | 'IN';
  value: any;
}

/**
 * 查询选项
 */
interface QueryOptions {
  where?: QueryCondition[];
  orderBy?: { field: string; direction: 'ASC' | 'DESC' }[];
  limit?: number;
  offset?: number;
}

/**
 * 数据库模拟器
 * 
 * 这个类模拟了完整的数据库功能，包括增删改查、事务处理、
 * 索引查询等。所有操作都会记录详细的日志，便于调试和分析。
 */
export class DatabaseSimulator {
  /** 模拟的数据表 */
  private tables: DatabaseTables;
  
  /** 操作日志 */
  private operationLogs: DatabaseOperationLog[] = [];
  
  /** 操作计数器 */
  private operationCounter = 0;
  
  /** 是否启用详细日志 */
  private verboseLogging: boolean;

  constructor(verboseLogging: boolean = true) {
    this.verboseLogging = verboseLogging;
    
    // 初始化所有表
    this.tables = {
      characters: new Map(),
      agent_logs: new Map(),
      belief_systems: new Map(),
      events: new Map(),
      scenes: new Map(),
      internal_states: new Map()
    };

    this.log('🗄️ 数据库模拟器已启动', 'SYSTEM');
    this.log('📊 数据表已初始化: characters, agent_logs, belief_systems, events, scenes, internal_states', 'SYSTEM');
  }

  // ===========================================
  // 核心CRUD操作
  // ===========================================

  /**
   * 插入记录
   */
  async insert<T extends keyof DatabaseTables>(
    table: T, 
    record: DatabaseTables[T] extends Map<string, infer U> ? U : never
  ): Promise<string> {
    const startTime = Date.now();
    const recordId = this.generateId();
    
    try {
      this.tables[table].set(recordId, record);
      
      const duration = Date.now() - startTime;
      
      // 记录操作日志
      this.logOperation({
        id: this.generateOperationId(),
        timestamp: Date.now(),
        operation: 'INSERT',
        table,
        recordId,
        data: record,
        duration
      });

      this.log(`✅ INSERT ${table}: 成功插入记录 ${recordId}`, 'INSERT');
      if (this.verboseLogging) {
        this.log(`📄 数据内容: ${JSON.stringify(record, null, 2)}`, 'DATA');
      }
      
      return recordId;
      
    } catch (error) {
      this.log(`❌ INSERT ${table}: 插入失败 - ${error}`, 'ERROR');
      throw error;
    }
  }

  /**
   * 更新记录
   */
  async update<T extends keyof DatabaseTables>(
    table: T,
    recordId: string,
    updates: Partial<DatabaseTables[T] extends Map<string, infer U> ? U : never>
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const existingRecord = this.tables[table].get(recordId);
      if (!existingRecord) {
        this.log(`⚠️ UPDATE ${table}: 记录 ${recordId} 不存在`, 'WARNING');
        return false;
      }

      // 合并更新
      const updatedRecord = { ...existingRecord, ...updates };
      this.tables[table].set(recordId, updatedRecord);
      
      const duration = Date.now() - startTime;
      
      // 记录操作日志
      this.logOperation({
        id: this.generateOperationId(),
        timestamp: Date.now(),
        operation: 'UPDATE',
        table,
        recordId,
        data: updates,
        duration
      });

      this.log(`✅ UPDATE ${table}: 成功更新记录 ${recordId}`, 'UPDATE');
      if (this.verboseLogging) {
        this.log(`📄 更新内容: ${JSON.stringify(updates, null, 2)}`, 'DATA');
      }
      
      return true;
      
    } catch (error) {
      this.log(`❌ UPDATE ${table}: 更新失败 - ${error}`, 'ERROR');
      throw error;
    }
  }

  /**
   * 删除记录
   */
  async delete<T extends keyof DatabaseTables>(
    table: T,
    recordId: string
  ): Promise<boolean> {
    const startTime = Date.now();
    
    try {
      const existed = this.tables[table].has(recordId);
      if (!existed) {
        this.log(`⚠️ DELETE ${table}: 记录 ${recordId} 不存在`, 'WARNING');
        return false;
      }

      this.tables[table].delete(recordId);
      
      const duration = Date.now() - startTime;
      
      // 记录操作日志
      this.logOperation({
        id: this.generateOperationId(),
        timestamp: Date.now(),
        operation: 'DELETE',
        table,
        recordId,
        duration
      });

      this.log(`✅ DELETE ${table}: 成功删除记录 ${recordId}`, 'DELETE');
      
      return true;
      
    } catch (error) {
      this.log(`❌ DELETE ${table}: 删除失败 - ${error}`, 'ERROR');
      throw error;
    }
  }

  /**
   * 查询记录
   */
  async select<T extends keyof DatabaseTables>(
    table: T,
    options?: QueryOptions
  ): Promise<Array<DatabaseTables[T] extends Map<string, infer U> ? U & { id: string } : never>> {
    const startTime = Date.now();
    
    try {
      let results: any[] = [];
      
      // 获取所有记录
      for (const [id, record] of this.tables[table]) {
        results.push({ ...record, id });
      }
      
      // 应用WHERE条件
      if (options?.where) {
        results = results.filter(record => {
          return options.where!.every(condition => {
            return this.evaluateCondition(record, condition);
          });
        });
      }
      
      // 应用排序
      if (options?.orderBy) {
        results.sort((a, b) => {
          for (const sort of options.orderBy!) {
            const aVal = a[sort.field];
            const bVal = b[sort.field];
            
            let comparison = 0;
            if (aVal < bVal) comparison = -1;
            else if (aVal > bVal) comparison = 1;
            
            if (comparison !== 0) {
              return sort.direction === 'DESC' ? -comparison : comparison;
            }
          }
          return 0;
        });
      }
      
      // 应用分页
      if (options?.offset) {
        results = results.slice(options.offset);
      }
      if (options?.limit) {
        results = results.slice(0, options.limit);
      }
      
      const duration = Date.now() - startTime;
      
      // 记录操作日志
      this.logOperation({
        id: this.generateOperationId(),
        timestamp: Date.now(),
        operation: 'SELECT',
        table,
        recordId: 'QUERY',
        query: JSON.stringify(options),
        result: `${results.length} records`,
        duration
      });

      this.log(`🔍 SELECT ${table}: 查询返回 ${results.length} 条记录 (${duration}ms)`, 'SELECT');
      if (this.verboseLogging && options) {
        this.log(`📋 查询条件: ${JSON.stringify(options, null, 2)}`, 'QUERY');
      }
      
      return results;
      
    } catch (error) {
      this.log(`❌ SELECT ${table}: 查询失败 - ${error}`, 'ERROR');
      throw error;
    }
  }

  /**
   * 根据ID获取单条记录
   */
  async findById<T extends keyof DatabaseTables>(
    table: T,
    id: string
  ): Promise<(DatabaseTables[T] extends Map<string, infer U> ? U & { id: string } : never) | null> {
    const startTime = Date.now();
    
    try {
      const record = this.tables[table].get(id);
      const duration = Date.now() - startTime;
      
      if (record) {
        this.log(`🔍 FIND_BY_ID ${table}: 找到记录 ${id} (${duration}ms)`, 'SELECT');
        return { ...record, id } as any;
      } else {
        this.log(`🔍 FIND_BY_ID ${table}: 记录 ${id} 不存在 (${duration}ms)`, 'SELECT');
        return null;
      }
      
    } catch (error) {
      this.log(`❌ FIND_BY_ID ${table}: 查询失败 - ${error}`, 'ERROR');
      throw error;
    }
  }

  // ===========================================
  // 专门的agent_logs表操作（核心功能）
  // ===========================================

  /**
   * 插入代理行为日志
   * 这是整个系统最重要的函数之一，记录每一次AI行为
   */
  async insertAgentLog(log: Omit<AgentLog, 'id'>): Promise<string> {
    const logId = await this.insert('agent_logs', { id: '', ...log } as AgentLog);
    
    // 特殊的agent_logs日志格式
    this.log('🤖 === 代理行为记录 ===', 'AGENT_LOG');
    this.log(`📋 角色: ${log.character_id}`, 'AGENT_LOG');
    this.log(`🎬 场景: ${log.scene_id}`, 'AGENT_LOG');
    this.log(`🎯 行为类型: ${log.action_type}`, 'AGENT_LOG');
    this.log(`📝 输入: ${log.input}`, 'AGENT_LOG');
    this.log(`💭 输出: ${log.output}`, 'AGENT_LOG');
    
    if (log.belief_snapshot) {
      this.log(`🧠 信念快照: ${JSON.stringify(log.belief_snapshot, null, 2)}`, 'AGENT_LOG');
    }
    
    if (log.internal_state_snapshot) {
      this.log(`💗 内在状态: E=${log.internal_state_snapshot.energy?.toFixed(1)} F=${log.internal_state_snapshot.focus?.toFixed(1)} C=${log.internal_state_snapshot.curiosity?.toFixed(1)}`, 'AGENT_LOG');
    }
    
    this.log('🤖 === 记录完成 ===\n', 'AGENT_LOG');
    
    return logId;
  }

  /**
   * 查询角色的行为历史
   */
  async getCharacterLogs(characterId: string, limit?: number): Promise<AgentLog[]> {
    const options: QueryOptions = {
      where: [{ field: 'character_id', operator: '=', value: characterId }],
      orderBy: [{ field: 'timestamp', direction: 'DESC' }]
    };
    
    if (limit) {
      options.limit = limit;
    }
    
    return await this.select('agent_logs', options);
  }

  /**
   * 查询场景的活动历史
   */
  async getSceneLogs(sceneId: string, limit?: number): Promise<AgentLog[]> {
    const options: QueryOptions = {
      where: [{ field: 'scene_id', operator: '=', value: sceneId }],
      orderBy: [{ field: 'timestamp', direction: 'ASC' }]
    };
    
    if (limit) {
      options.limit = limit;
    }
    
    return await this.select('agent_logs', options);
  }

  // ===========================================
  // 信念系统操作
  // ===========================================

  /**
   * 更新角色的信念系统
   */
  async updateBeliefSystem(characterId: string, beliefSystem: Omit<BeliefSystem, 'character_id'>): Promise<string> {
    const existingBelief = await this.select('belief_systems', {
      where: [{ field: 'character_id', operator: '=', value: characterId }]
    });

    const beliefRecord: BeliefSystem = {
      character_id: characterId,
      ...beliefSystem
    };

    let beliefId: string;
    
    if (existingBelief.length > 0) {
      // 更新现有信念系统
      beliefId = existingBelief[0].id;
      await this.update('belief_systems', beliefId, beliefRecord);
      this.log(`🧠 信念系统更新: 角色 ${characterId} 的信念已更新`, 'BELIEF_UPDATE');
    } else {
      // 创建新的信念系统
      beliefId = await this.insert('belief_systems', beliefRecord as any);
      this.log(`🧠 信念系统创建: 为角色 ${characterId} 创建了新的信念系统`, 'BELIEF_CREATE');
    }

    // 详细的信念分析日志
    this.log('🔮 === 信念系统分析 ===', 'BELIEF_ANALYSIS');
    this.log(`👤 角色: ${characterId}`, 'BELIEF_ANALYSIS');
    this.log(`🌍 世界观信念 (${beliefSystem.worldview.length}条):`, 'BELIEF_ANALYSIS');
    beliefSystem.worldview.forEach((belief, index) => {
      this.log(`   ${index + 1}. ${belief.description} (强度: ${belief.weight.toFixed(2)})`, 'BELIEF_ANALYSIS');
    });
    
    this.log(`🪞 自我认知 (${beliefSystem.selfview.length}条):`, 'BELIEF_ANALYSIS');
    beliefSystem.selfview.forEach((belief, index) => {
      this.log(`   ${index + 1}. ${belief.description} (强度: ${belief.weight.toFixed(2)})`, 'BELIEF_ANALYSIS');
    });
    
    this.log(`💎 价值观念 (${beliefSystem.values.length}条):`, 'BELIEF_ANALYSIS');
    beliefSystem.values.forEach((belief, index) => {
      this.log(`   ${index + 1}. ${belief.description} (强度: ${belief.weight.toFixed(2)})`, 'BELIEF_ANALYSIS');
    });
    
    this.log(`📊 基于 ${beliefSystem.based_on_logs_count} 条行为记录生成`, 'BELIEF_ANALYSIS');
    this.log('🔮 === 分析完成 ===\n', 'BELIEF_ANALYSIS');

    return beliefId;
  }

  // ===========================================
  // 数据分析和统计
  // ===========================================

  /**
   * 获取数据库统计信息
   */
  getStatistics(): Record<string, any> {
    const stats = {
      timestamp: Date.now(),
      tables: {} as Record<string, number>,
      totalRecords: 0,
      operationCounts: {} as Record<DatabaseOperation, number>,
      recentOperations: this.operationLogs.slice(-10)
    };

    // 统计每个表的记录数
    for (const [tableName, table] of Object.entries(this.tables)) {
      const count = table.size;
      stats.tables[tableName] = count;
      stats.totalRecords += count;
    }

    // 统计操作类型
    for (const log of this.operationLogs) {
      stats.operationCounts[log.operation] = (stats.operationCounts[log.operation] || 0) + 1;
    }

    return stats;
  }

  /**
   * 生成数据库报告
   */
  generateReport(): void {
    const stats = this.getStatistics();
    
    this.log('\n📊 === 数据库模拟器状态报告 ===', 'REPORT');
    this.log(`🕐 报告时间: ${new Date(stats.timestamp).toLocaleString()}`, 'REPORT');
    this.log(`📈 总记录数: ${stats.totalRecords}`, 'REPORT');
    
    this.log('\n📋 数据表统计:', 'REPORT');
    for (const [table, count] of Object.entries(stats.tables)) {
      this.log(`   ${table}: ${count} 条记录`, 'REPORT');
    }
    
    this.log('\n⚡ 操作统计:', 'REPORT');
    for (const [operation, count] of Object.entries(stats.operationCounts)) {
      this.log(`   ${operation}: ${count} 次`, 'REPORT');
    }
    
    this.log(`\n🔄 总操作数: ${this.operationLogs.length}`, 'REPORT');
    
    // 性能分析
    if (this.operationLogs.length > 0) {
      const avgDuration = this.operationLogs.reduce((sum, log) => sum + log.duration, 0) / this.operationLogs.length;
      this.log(`⚡ 平均操作耗时: ${avgDuration.toFixed(2)}ms`, 'REPORT');
    }
    
    this.log('📊 === 报告结束 ===\n', 'REPORT');
  }

  // ===========================================
  // 私有辅助方法
  // ===========================================

  /**
   * 记录操作日志
   */
  private logOperation(operation: DatabaseOperationLog): void {
    this.operationLogs.push(operation);
    
    // 限制日志大小
    if (this.operationLogs.length > 1000) {
      this.operationLogs.splice(0, this.operationLogs.length - 1000);
    }
  }

  /**
   * 统一的日志输出
   */
  private log(message: string, category: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = this.getCategoryPrefix(category);
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  /**
   * 获取分类前缀
   */
  private getCategoryPrefix(category: string): string {
    const prefixes: Record<string, string> = {
      'SYSTEM': '🗄️ [DB-SYS]',
      'INSERT': '➕ [DB-INS]',
      'UPDATE': '🔄 [DB-UPD]',
      'DELETE': '🗑️ [DB-DEL]',
      'SELECT': '🔍 [DB-SEL]',
      'QUERY': '📋 [DB-QRY]',
      'DATA': '📄 [DB-DAT]',
      'ERROR': '❌ [DB-ERR]',
      'WARNING': '⚠️ [DB-WRN]',
      'AGENT_LOG': '🤖 [AGENT]',
      'BELIEF_UPDATE': '🧠 [BELIEF]',
      'BELIEF_CREATE': '🆕 [BELIEF]',
      'BELIEF_ANALYSIS': '🔮 [BELIEF]',
      'REPORT': '📊 [REPORT]'
    };
    
    return prefixes[category] || '📝 [DB]';
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成操作ID
   */
  private generateOperationId(): string {
    return `op_${++this.operationCounter}`;
  }

  /**
   * 评估查询条件
   */
  private evaluateCondition(record: any, condition: QueryCondition): boolean {
    const fieldValue = record[condition.field];
    const targetValue = condition.value;

    switch (condition.operator) {
      case '=':
        return fieldValue === targetValue;
      case '!=':
        return fieldValue !== targetValue;
      case '>':
        return fieldValue > targetValue;
      case '<':
        return fieldValue < targetValue;
      case '>=':
        return fieldValue >= targetValue;
      case '<=':
        return fieldValue <= targetValue;
      case 'LIKE':
        return typeof fieldValue === 'string' && fieldValue.includes(targetValue);
      case 'IN':
        return Array.isArray(targetValue) && targetValue.includes(fieldValue);
      default:
        return false;
    }
  }

  /**
   * 清理资源
   */
  cleanup(): void {
    this.log('🧹 正在清理数据库模拟器资源...', 'SYSTEM');
    
    // 生成最终报告
    this.generateReport();
    
    // 清空所有数据
    for (const table of Object.values(this.tables)) {
      table.clear();
    }
    
    this.operationLogs = [];
    this.operationCounter = 0;
    
    this.log('✅ 数据库模拟器已清理完成', 'SYSTEM');
  }
}

/**
 * 全局数据库模拟器实例
 */
export const globalDatabaseSimulator = new DatabaseSimulator(true);