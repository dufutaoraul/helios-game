/**
 * 数据库模拟系统 - 统一导出
 * 
 * 这个文件提供了整个数据库模拟系统的统一访问接口，
 * 包括数据库模拟器、信念观察者、以及演示功能。
 */

// 数据库模拟器
export { DatabaseSimulator, globalDatabaseSimulator } from './DatabaseSimulator';

// 信念观察者
export { BeliefObserver, globalBeliefObserver } from './BeliefObserver';

// 演示功能
export { runDatabaseDemo } from './DatabaseExample';

// 重新导出相关类型
export type {
  AgentLog,
  BeliefSystem,
  Character,
  Scene,
  GameEvent,
  WorldviewBelief,
  SelfviewBelief,
  ValueBelief
} from '../types';