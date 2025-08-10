#!/usr/bin/env node

/**
 * 自动化部署脚本
 * 使用方法: node deploy-script.js [command]
 * 命令:
 *   setup    - 初始化项目结构
 *   migrate  - 迁移数据到MongoDB
 *   frontend - 部署前端到Vercel
 *   backend  - 部署后端到Render
 *   all      - 执行完整部署流程
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 异步询问用户输入
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

// 执行命令
function runCommand(command, cwd = process.cwd()) {
  try {
    log(`执行命令: ${command}`, 'cyan');
    const result = execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    return result;
  } catch (error) {
    throw new Error(`命令执行失败: ${command}\n${error.message}`);
  }
}

// 检查文件是否存在
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// 创建目录
function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    success(`创建目录: ${dirPath}`);
  } else {
    info(`目录已存在: ${dirPath}`);
  }
}

// 复制文件
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    success(`复制文件: ${src} -> ${dest}`);
  } catch (error) {
    error(`复制文件失败: ${error.message}`);
  }
}

// 移动目录内容
function moveDirectory(src, dest) {
  try {
    if (process.platform === 'win32') {
      runCommand(`robocopy "${src}" "${dest}" /E /MOVE`);
    } else {
      runCommand(`mv "${src}"/* "${dest}"/`);
    }
    success(`移动目录: ${src} -> ${dest}`);
  } catch (error) {
    warning(`移动目录可能有问题: ${error.message}`);
  }
}

// 1. 项目结构初始化
async function setupProject() {
  log('🚀 开始初始化项目结构...', 'magenta');
  
  try {
    // 创建新目录结构
    createDirectory('frontend');
    createDirectory('backend');
    createDirectory('docs');
    
    // 移动前端代码
    if (fileExists('client')) {
      info('移动前端代码到 frontend 目录...');
      moveDirectory('client', 'frontend');
    }
    
    // 移动后端代码
    if (fileExists('server')) {
      info('移动后端代码到 backend 目录...');
      moveDirectory('server', 'backend');
    }
    
    // 复制配置文件
    if (fileExists('frontend-vercel.json')) {
      copyFile('frontend-vercel.json', 'frontend/vercel.json');
    }
    
    if (fileExists('render.yaml')) {
      copyFile('render.yaml', 'backend/render.yaml');
    }
    
    // 创建前端API配置
    const apiConfigContent = `
// API配置文件
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: \`\${API_BASE_URL}/api\`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
`;
    
    const apiConfigPath = 'frontend/src/config';
    createDirectory(apiConfigPath);
    fs.writeFileSync(path.join(apiConfigPath, 'api.js'), apiConfigContent);
    success('创建API配置文件');
    
    success('项目结构初始化完成！');
    
  } catch (error) {
    error(`项目初始化失败: ${error.message}`);
    throw error;
  }
}

// 2. 数据迁移
async function migrateData() {
  log('📊 开始数据迁移...', 'magenta');
  
  try {
    // 检查MongoDB连接字符串
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      const uri = await askQuestion('请输入MongoDB连接字符串: ');
      if (!uri) {
        throw new Error('MongoDB连接字符串不能为空');
      }
      process.env.MONGODB_URI = uri;
    }
    
    // 安装依赖
    if (!fileExists('node_modules')) {
      info('安装项目依赖...');
      runCommand('npm install mongoose dotenv');
    }
    
    // 运行迁移脚本
    if (fileExists('migrate-to-mongodb.js')) {
      info('执行数据迁移...');
      runCommand('node migrate-to-mongodb.js migrate');
      success('数据迁移完成！');
    } else {
      warning('未找到迁移脚本文件');
    }
    
  } catch (error) {
    error(`数据迁移失败: ${error.message}`);
    throw error;
  }
}

// 3. 前端部署
async function deployFrontend() {
  log('🎨 开始部署前端...', 'magenta');
  
  try {
    const frontendDir = 'frontend';
    if (!fileExists(frontendDir)) {
      throw new Error('前端目录不存在，请先运行 setup 命令');
    }
    
    // 进入前端目录
    process.chdir(frontendDir);
    
    // 初始化Git仓库
    if (!fileExists('.git')) {
      info('初始化Git仓库...');
      runCommand('git init');
      runCommand('git add .');
      runCommand('git commit -m "Initial frontend commit"');
      
      const repoUrl = await askQuestion('请输入前端GitHub仓库URL: ');
      if (repoUrl) {
        runCommand(`git remote add origin ${repoUrl}`);
        runCommand('git branch -M main');
        runCommand('git push -u origin main');
      }
    }
    
    // 检查是否安装了Vercel CLI
    try {
      runCommand('vercel --version');
    } catch {
      info('安装Vercel CLI...');
      runCommand('npm install -g vercel');
    }
    
    // 部署到Vercel
    const shouldDeploy = await askQuestion('是否立即部署到Vercel? (y/n): ');
    if (shouldDeploy.toLowerCase() === 'y') {
      runCommand('vercel --prod');
      success('前端部署完成！');
    }
    
    // 返回根目录
    process.chdir('..');
    
  } catch (error) {
    error(`前端部署失败: ${error.message}`);
    process.chdir('..');
    throw error;
  }
}

// 4. 后端部署
async function deployBackend() {
  log('⚙️  开始部署后端...', 'magenta');
  
  try {
    const backendDir = 'backend';
    if (!fileExists(backendDir)) {
      throw new Error('后端目录不存在，请先运行 setup 命令');
    }
    
    // 进入后端目录
    process.chdir(backendDir);
    
    // 初始化Git仓库
    if (!fileExists('.git')) {
      info('初始化Git仓库...');
      runCommand('git init');
      runCommand('git add .');
      runCommand('git commit -m "Initial backend commit"');
      
      const repoUrl = await askQuestion('请输入后端GitHub仓库URL: ');
      if (repoUrl) {
        runCommand(`git remote add origin ${repoUrl}`);
        runCommand('git branch -M main');
        runCommand('git push -u origin main');
      }
    }
    
    info('后端代码已推送到GitHub');
    info('请在Render控制台手动创建Web Service并连接GitHub仓库');
    info('Render部署配置文件: render.yaml');
    
    success('后端部署准备完成！');
    
    // 返回根目录
    process.chdir('..');
    
  } catch (error) {
    error(`后端部署失败: ${error.message}`);
    process.chdir('..');
    throw error;
  }
}

// 5. 完整部署流程
async function deployAll() {
  log('🚀 开始完整部署流程...', 'magenta');
  
  try {
    await setupProject();
    
    const shouldMigrate = await askQuestion('是否需要迁移数据到MongoDB? (y/n): ');
    if (shouldMigrate.toLowerCase() === 'y') {
      await migrateData();
    }
    
    await deployBackend();
    await deployFrontend();
    
    success('🎉 完整部署流程完成！');
    
    log('\n📋 后续步骤:', 'yellow');
    log('1. 在Render控制台配置后端环境变量');
    log('2. 在Vercel控制台配置前端环境变量');
    log('3. 更新CORS设置为实际域名');
    log('4. 测试前后端连接');
    log('5. 配置自定义域名（可选）');
    
  } catch (error) {
    error(`部署流程失败: ${error.message}`);
  }
}

// 显示帮助信息
function showHelp() {
  log('🛠️  雪龙AI部署脚本', 'cyan');
  log('\n使用方法: node deploy-script.js [command]\n');
  log('可用命令:', 'yellow');
  log('  setup    - 初始化项目结构');
  log('  migrate  - 迁移数据到MongoDB');
  log('  frontend - 部署前端到Vercel');
  log('  backend  - 部署后端到Render');
  log('  all      - 执行完整部署流程');
  log('  help     - 显示此帮助信息\n');
  log('示例:', 'green');
  log('  node deploy-script.js setup');
  log('  node deploy-script.js all');
}

// 主函数
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'setup':
        await setupProject();
        break;
      case 'migrate':
        await migrateData();
        break;
      case 'frontend':
        await deployFrontend();
        break;
      case 'backend':
        await deployBackend();
        break;
      case 'all':
        await deployAll();
        break;
      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;
      default:
        if (!command) {
          showHelp();
        } else {
          error(`未知命令: ${command}`);
          showHelp();
        }
        break;
    }
  } catch (error) {
    error(`执行失败: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = {
  setupProject,
  migrateData,
  deployFrontend,
  deployBackend,
  deployAll
};