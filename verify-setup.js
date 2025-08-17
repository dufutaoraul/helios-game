/**
 * 赫利俄斯项目 - 安装验证脚本
 * 
 * 这个脚本验证项目是否正确安装和配置
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function colorLog(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// 检查文件是否存在
function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  if (exists) {
    colorLog(`✅ ${description}`, 'green');
  } else {
    colorLog(`❌ ${description}`, 'red');
  }
  return exists;
}

// 检查目录是否存在
function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  if (exists) {
    colorLog(`✅ ${description}`, 'green');
  } else {
    colorLog(`❌ ${description}`, 'red');
  }
  return exists;
}

function main() {
  colorLog('\n🔍 赫利俄斯项目安装验证', 'magenta');
  colorLog('═'.repeat(50), 'blue');
  
  let allGood = true;
  
  // 检查核心文件
  colorLog('\n📋 检查核心配置文件:', 'blue');
  allGood &= checkFile('package.json', 'package.json - 项目配置');
  allGood &= checkFile('tsconfig.json', 'tsconfig.json - TypeScript配置');
  allGood &= checkFile('.env.example', '.env.example - 环境变量模板');
  allGood &= checkFile('README.md', 'README.md - 项目文档');
  allGood &= checkFile('ARCHITECTURE_EXPLAINED.md', 'ARCHITECTURE_EXPLAINED.md - 架构解析');
  allGood &= checkFile('demo.js', 'demo.js - 演示启动器');
  
  // 检查源代码目录
  colorLog('\n📂 检查源代码目录结构:', 'blue');
  allGood &= checkDirectory('src', 'src/ - 源代码根目录');
  allGood &= checkDirectory('src/types', 'src/types/ - 类型定义');
  allGood &= checkDirectory('src/lib', 'src/lib/ - 工具库');
  allGood &= checkDirectory('src/simulation', 'src/simulation/ - 频道模拟系统');
  allGood &= checkDirectory('src/core', 'src/core/ - AI核心系统');
  allGood &= checkDirectory('src/database', 'src/database/ - 数据库模拟系统');
  
  // 检查核心源文件
  colorLog('\n📄 检查核心源文件:', 'blue');
  allGood &= checkFile('src/index.ts', 'src/index.ts - 主入口文件');
  allGood &= checkFile('src/types/index.ts', 'src/types/index.ts - 类型定义');
  allGood &= checkFile('src/lib/config.ts', 'src/lib/config.ts - 配置管理');
  allGood &= checkFile('src/lib/deepseek.ts', 'src/lib/deepseek.ts - DeepSeek API');
  allGood &= checkFile('src/simulation/ChannelManager.ts', 'src/simulation/ChannelManager.ts - 频道管理器');
  allGood &= checkFile('src/core/DecisionEngine.ts', 'src/core/DecisionEngine.ts - 决策引擎');
  allGood &= checkFile('src/core/InternalStateManager.ts', 'src/core/InternalStateManager.ts - 状态管理器');
  allGood &= checkFile('src/database/DatabaseSimulator.ts', 'src/database/DatabaseSimulator.ts - 数据库模拟器');
  allGood &= checkFile('src/database/BeliefObserver.ts', 'src/database/BeliefObserver.ts - 信念观察者');
  
  // 检查演示文件
  colorLog('\n🎭 检查演示文件:', 'blue');
  allGood &= checkFile('src/simulation/ChannelExample.ts', 'ChannelExample.ts - 频道演示');
  allGood &= checkFile('src/core/InternalStateExample.ts', 'InternalStateExample.ts - 状态演示');
  allGood &= checkFile('src/database/DatabaseExample.ts', 'DatabaseExample.ts - 数据库演示');
  allGood &= checkFile('src/lib/deepseek-test.ts', 'deepseek-test.ts - API测试');
  
  // 检查package.json内容
  colorLog('\n📦 检查package.json配置:', 'blue');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    if (packageJson.scripts && packageJson.scripts.demo) {
      colorLog('✅ 演示脚本已配置', 'green');
    } else {
      colorLog('❌ 演示脚本未配置', 'red');
      allGood = false;
    }
    
    const requiredDeps = ['typescript', 'ai', 'zod', 'dotenv'];
    for (const dep of requiredDeps) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        colorLog(`✅ 依赖 ${dep} 已配置`, 'green');
      } else if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
        colorLog(`✅ 依赖 ${dep} 已配置 (开发依赖)`, 'green');
      } else {
        colorLog(`❌ 依赖 ${dep} 未配置`, 'red');
        allGood = false;
      }
    }
  } catch (error) {
    colorLog('❌ package.json 解析失败', 'red');
    allGood = false;
  }
  
  // 检查node_modules
  colorLog('\n📚 检查依赖安装:', 'blue');
  if (fs.existsSync('node_modules')) {
    colorLog('✅ node_modules 目录存在', 'green');
    
    // 检查关键依赖
    const keyDeps = ['typescript', 'zod', 'dotenv'];
    for (const dep of keyDeps) {
      if (fs.existsSync(path.join('node_modules', dep))) {
        colorLog(`✅ ${dep} 已安装`, 'green');
      } else {
        colorLog(`⚠️ ${dep} 可能未正确安装`, 'yellow');
      }
    }
  } else {
    colorLog('❌ node_modules 目录不存在，请运行 npm install', 'red');
    allGood = false;
  }
  
  // 总结
  colorLog('\n' + '═'.repeat(50), 'blue');
  if (allGood) {
    colorLog('🎉 项目验证通过！所有文件和配置都正确。', 'green');
    colorLog('\n🚀 你现在可以运行以下命令开始使用：', 'blue');
    colorLog('   npm run demo          - 交互式演示菜单', 'green');
    colorLog('   npm run demo:channel  - 频道模拟系统演示', 'green');
    colorLog('   npm run demo:state    - 内在状态系统演示', 'green');
    colorLog('   npm run demo:database - 数据库模拟系统演示', 'green');
    colorLog('   npm run demo:api      - DeepSeek API测试', 'green');
  } else {
    colorLog('⚠️ 项目验证发现问题，请检查上述错误。', 'yellow');
    colorLog('\n🔧 常见解决方案：', 'blue');
    colorLog('   1. 运行 npm install 安装依赖', 'yellow');
    colorLog('   2. 检查文件是否正确创建', 'yellow');
    colorLog('   3. 确认目录结构是否正确', 'yellow');
  }
  
  colorLog('', 'reset');
}

main();