/**
 * 赫利俄斯项目 - 快速演示启动器
 * 
 * 这个脚本提供了一个简单的命令行界面，让用户可以选择运行不同的演示程序。
 */

const { spawn } = require('child_process');
const readline = require('readline');

// 控制台颜色
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

// 演示选项
const demos = {
  '1': {
    name: '频道模拟系统演示',
    description: '展示三类信息的记录和处理、消息分发、行为分析',
    file: 'src/simulation/ChannelExample.ts',
    emoji: '📡'
  },
  '2': {
    name: '内在状态系统演示', 
    description: '展示AI NPC的私有状态管理、状态修改器、行为倾向分析',
    file: 'src/core/InternalStateExample.ts',
    emoji: '🧠'
  },
  '3': {
    name: '数据库模拟系统演示',
    description: '展示完整的数据流程、行为记录、信念生成',
    file: 'src/database/DatabaseExample.ts',
    emoji: '🗄️'
  },
  '4': {
    name: 'DeepSeek API测试',
    description: '测试API连接、AI推理功能、性能基准',
    file: 'src/lib/deepseek-test.ts',
    emoji: '🤖'
  },
  '5': {
    name: '完整系统集成演示',
    description: '运行所有演示，展示完整的系统功能',
    file: 'all',
    emoji: '🎭'
  }
};

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showWelcome() {
  console.clear();
  colorLog('', 'reset');
  colorLog('🎭 ═══════════════════════════════════════════════════════', 'cyan');
  colorLog('    赫利俄斯项目 MVP - 本我之镜', 'bright');
  colorLog('    AI驱动的意识探索与演化沙盒游戏', 'yellow');
  colorLog('🎭 ═══════════════════════════════════════════════════════', 'cyan');
  colorLog('', 'reset');
}

function showMenu() {
  colorLog('📋 请选择要运行的演示程序：', 'bright');
  colorLog('', 'reset');
  
  Object.entries(demos).forEach(([key, demo]) => {
    colorLog(`  ${demo.emoji} ${key}. ${demo.name}`, 'green');
    colorLog(`     ${demo.description}`, 'yellow');
    colorLog('', 'reset');
  });
  
  colorLog('  ❌ 0. 退出程序', 'red');
  colorLog('', 'reset');
  colorLog('💡 提示：首次运行建议选择选项5（完整系统演示）', 'blue');
  colorLog('', 'reset');
}

function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    colorLog(`🚀 正在启动: ${command} ${args.join(' ')}`, 'cyan');
    colorLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true
    });
    
    child.on('close', (code) => {
      colorLog('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
      if (code === 0) {
        colorLog('✅ 演示运行完成', 'green');
        resolve();
      } else {
        colorLog(`❌ 演示运行失败，退出代码: ${code}`, 'red');
        reject(new Error(`Process exited with code ${code}`));
      }
    });
    
    child.on('error', (error) => {
      colorLog(`❌ 启动失败: ${error.message}`, 'red');
      reject(error);
    });
  });
}

async function runDemo(choice) {
  const demo = demos[choice];
  
  if (!demo) {
    colorLog('❌ 无效的选择，请重新选择', 'red');
    return false;
  }
  
  colorLog(`\n🎯 准备运行: ${demo.emoji} ${demo.name}`, 'bright');
  colorLog(`📝 描述: ${demo.description}`, 'yellow');
  colorLog('', 'reset');
  
  try {
    if (demo.file === 'all') {
      // 运行所有演示
      colorLog('🎪 开始运行完整系统集成演示...', 'magenta');
      
      for (let i = 1; i <= 4; i++) {
        const currentDemo = demos[i];
        colorLog(`\n📍 步骤 ${i}/4: ${currentDemo.name}`, 'bright');
        await runCommand('npx', ['ts-node', currentDemo.file]);
        
        if (i < 4) {
          colorLog('\n⏸️  演示暂停3秒...', 'yellow');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      colorLog('\n🎉 完整系统演示完成！', 'green');
    } else {
      // 运行单个演示
      await runCommand('npx', ['ts-node', demo.file]);
    }
    
    return true;
    
  } catch (error) {
    colorLog(`\n💥 演示运行过程中出现错误:`, 'red');
    colorLog(`   ${error.message}`, 'red');
    
    colorLog('\n🔧 故障排除建议:', 'yellow');
    colorLog('   1. 确保已安装所有依赖: npm install', 'yellow');
    colorLog('   2. 检查TypeScript配置: npm run typecheck', 'yellow');
    colorLog('   3. 查看详细错误信息并参考README.md', 'yellow');
    
    return false;
  }
}

function askForChoice() {
  return new Promise((resolve) => {
    rl.question('👉 请输入选项编号 (0-5): ', (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  showWelcome();
  
  while (true) {
    showMenu();
    
    const choice = await askForChoice();
    
    if (choice === '0') {
      colorLog('\n👋 感谢使用赫利俄斯项目演示系统！', 'cyan');
      colorLog('🔗 更多信息请查看: README.md 和 ARCHITECTURE_EXPLAINED.md', 'blue');
      break;
    }
    
    if (demos[choice]) {
      const success = await runDemo(choice);
      
      if (success) {
        colorLog('\n🎊 演示完成！你可以继续选择其他演示或退出。', 'green');
      }
      
      colorLog('\n⏱️  按回车键继续...', 'blue');
      await new Promise((resolve) => {
        rl.question('', resolve);
      });
      
      console.clear();
      showWelcome();
    } else {
      colorLog('\n❌ 无效的选择，请输入 0-5 之间的数字', 'red');
      colorLog('⏱️  2秒后重新显示菜单...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.clear();
      showWelcome();
    }
  }
  
  rl.close();
}

// 处理退出信号
process.on('SIGINT', () => {
  colorLog('\n\n👋 程序被用户中断，正在退出...', 'yellow');
  rl.close();
  process.exit(0);
});

// 启动主程序
main().catch((error) => {
  colorLog(`💥 程序启动失败: ${error.message}`, 'red');
  rl.close();
  process.exit(1);
});