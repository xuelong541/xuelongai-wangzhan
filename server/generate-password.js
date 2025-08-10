#!/usr/bin/env node
/**
 * 密码哈希生成工具
 * 用于生成bcrypt密码哈希，供生产环境使用
 * 
 * 使用方法：
 * node generate-password.js [password]
 * 
 * 如果不提供密码参数，将提示输入
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

// 生成密码哈希
function generatePasswordHash(password) {
  const saltRounds = 10;
  const hash = bcrypt.hashSync(password, saltRounds);
  return hash;
}

// 验证密码哈希
function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

// 主函数
function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // 从命令行参数获取密码
    const password = args[0];
    const hash = generatePasswordHash(password);
    
    console.log('\n=== 密码哈希生成结果 ===');
    console.log('原始密码:', password);
    console.log('哈希值:', hash);
    console.log('\n验证测试:', verifyPassword(password, hash) ? '✅ 通过' : '❌ 失败');
    
    console.log('\n=== 环境变量配置 ===');
    console.log('请将以下内容添加到 .env 文件中：');
    console.log(`ADMIN_PASSWORD_HASH=${hash}`);
    
    console.log('\n⚠️  安全提醒：');
    console.log('1. 请妥善保管原始密码');
    console.log('2. 不要将密码明文存储在代码中');
    console.log('3. 定期更换密码');
    console.log('4. 使用强密码（至少8位，包含大小写字母、数字和特殊字符）');
    
  } else {
    // 交互式输入密码
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('=== 雪珑AI密码哈希生成工具 ===\n');
    
    rl.question('请输入要生成哈希的密码: ', (password) => {
      if (!password || password.trim().length === 0) {
        console.log('❌ 密码不能为空');
        rl.close();
        return;
      }
      
      if (password.length < 8) {
        console.log('⚠️  警告：密码长度少于8位，建议使用更强的密码');
      }
      
      const hash = generatePasswordHash(password);
      
      console.log('\n=== 密码哈希生成结果 ===');
      console.log('哈希值:', hash);
      console.log('\n验证测试:', verifyPassword(password, hash) ? '✅ 通过' : '❌ 失败');
      
      console.log('\n=== 环境变量配置 ===');
      console.log('请将以下内容添加到 .env 文件中：');
      console.log(`ADMIN_PASSWORD_HASH=${hash}`);
      
      console.log('\n⚠️  安全提醒：');
      console.log('1. 请妥善保管原始密码');
      console.log('2. 不要将密码明文存储在代码中');
      console.log('3. 定期更换密码');
      console.log('4. 使用强密码（至少8位，包含大小写字母、数字和特殊字符）');
      
      rl.close();
    });
  }
}

// 密码强度检查
function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };
  
  const score = Object.values(checks).filter(Boolean).length;
  
  console.log('\n=== 密码强度分析 ===');
  console.log('长度 >= 8位:', checks.length ? '✅' : '❌');
  console.log('包含小写字母:', checks.lowercase ? '✅' : '❌');
  console.log('包含大写字母:', checks.uppercase ? '✅' : '❌');
  console.log('包含数字:', checks.numbers ? '✅' : '❌');
  console.log('包含特殊字符:', checks.special ? '✅' : '❌');
  
  let strength = '';
  if (score <= 2) strength = '弱';
  else if (score <= 3) strength = '中等';
  else if (score <= 4) strength = '强';
  else strength = '很强';
  
  console.log(`密码强度: ${strength} (${score}/5)`);
  
  if (score < 4) {
    console.log('\n💡 建议：使用包含大小写字母、数字和特殊字符的密码');
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generatePasswordHash,
  verifyPassword,
  checkPasswordStrength
};