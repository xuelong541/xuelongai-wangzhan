#!/usr/bin/env node

/**
 * 一键部署脚本
 * 使用方法：node one-click-deploy.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function execCommand(command, description) {
  try {
    log(`\n🔄 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} 完成`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} 失败: ${error.message}`, 'red');
    return false;
  }
}

async function checkPrerequisites() {
  log('\n🔍 检查环境...', 'yellow');
  
  // 检查Git
  try {
    execSync('git --version', { stdio: 'ignore' });
    log('✅ Git 已安装', 'green');
  } catch {
    log('❌ 请先安装 Git', 'red');
    process.exit(1);
  }
  
  // 检查Node.js
  try {
    execSync('node --version', { stdio: 'ignore' });
    log('✅ Node.js 已安装', 'green');
  } catch {
    log('❌ 请先安装 Node.js', 'red');
    process.exit(1);
  }
}

async function generateSecrets() {
  log('\n🔐 生成安全密钥...', 'yellow');
  
  const crypto = require('crypto');
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  
  log('\n📋 请保存以下信息，稍后需要在Vercel中配置：', 'bold');
  log(`JWT_SECRET=${jwtSecret}`, 'blue');
  
  return { jwtSecret };
}

async function setupGitRepo() {
  log('\n📦 设置Git仓库...', 'yellow');
  
  const repoUrl = await question('请输入GitHub仓库地址 (例: https://github.com/username/xuelongai.git): ');
  
  if (!repoUrl.trim()) {
    log('❌ 仓库地址不能为空', 'red');
    process.exit(1);
  }
  
  // 初始化Git仓库
  if (!fs.existsSync('.git')) {
    execCommand('git init', '初始化Git仓库');
  }
  
  // 添加远程仓库
  try {
    execSync('git remote remove origin', { stdio: 'ignore' });
  } catch {}
  
  execCommand(`git remote add origin ${repoUrl}`, '添加远程仓库');
  
  return repoUrl;
}

async function commitAndPush() {
  log('\n🚀 提交并推送代码...', 'yellow');
  
  execCommand('git add .', '添加所有文件');
  execCommand('git commit -m "Deploy: 一键部署配置"', '提交代码');
  execCommand('git branch -M main', '设置主分支');
  execCommand('git push -u origin main', '推送到GitHub');
}

function showDeploymentInstructions(secrets) {
  log('\n🎉 代码已推送到GitHub！', 'green');
  log('\n📋 接下来请按以下步骤在Vercel部署：', 'bold');
  
  log('\n1️⃣ 访问 https://vercel.com 并登录', 'blue');
  log('2️⃣ 点击 "Import Project"', 'blue');
  log('3️⃣ 选择你的GitHub仓库', 'blue');
  log('4️⃣ 在环境变量中添加以下配置：', 'blue');
  
  log('\n🔧 环境变量配置：', 'yellow');
  log(`   MONGODB_URI=你的MongoDB连接字符串`, 'green');
  log(`   JWT_SECRET=${secrets.jwtSecret}`, 'green');
  log(`   NODE_ENV=production`, 'green');
  
  log('\n5️⃣ 点击 "Deploy" 完成部署', 'blue');
  
  log('\n💡 MongoDB Atlas设置：', 'yellow');
  log('   1. 访问 https://cloud.mongodb.com', 'green');
  log('   2. 创建免费集群', 'green');
  log('   3. 创建数据库用户', 'green');
  log('   4. 获取连接字符串', 'green');
  
  log('\n🎯 部署完成后，你的网站将在 https://你的项目名.vercel.app 上线！', 'bold');
}

async function main() {
  try {
    log('🚀 雪龙AI一键部署工具', 'bold');
    log('================================', 'blue');
    
    await checkPrerequisites();
    const secrets = await generateSecrets();
    
    const continueSetup = await question('\n是否继续设置Git仓库？(y/n): ');
    if (continueSetup.toLowerCase() !== 'y') {
      log('\n部署已取消', 'yellow');
      process.exit(0);
    }
    
    await setupGitRepo();
    await commitAndPush();
    showDeploymentInstructions(secrets);
    
  } catch (error) {
    log(`\n❌ 部署失败: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };