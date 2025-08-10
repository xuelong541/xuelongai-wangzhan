# 🔐 环境变量配置模板

## 📋 环境变量总览

### 开发环境 vs 生产环境

| 变量名 | 开发环境 | 生产环境 | 说明 |
|--------|----------|----------|------|
| NODE_ENV | development | production | 运行环境 |
| PORT | 5000 | 10000 | 服务端口 |
| MONGODB_URI | localhost | Atlas连接串 | 数据库连接 |
| CORS_ORIGIN | localhost:3000 | vercel.app域名 | 跨域设置 |

---

## 🖥️ 本地开发环境

### backend/.env
```bash
# 服务器配置
NODE_ENV=development
PORT=5000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/xuelongai
# 或者使用Atlas测试环境:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xuelongai-dev

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-for-development
JWT_EXPIRES_IN=7d

# 管理员账户
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$example.hash.here
ADMIN_EMAIL=admin@localhost

# 文件上传配置
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS配置
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# Cloudinary配置 (可选)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# 调试配置
DEBUG=app:*
LOG_LEVEL=debug
```

### frontend/.env
```bash
# API配置
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development

# 功能开关
REACT_APP_ENABLE_ANALYTICS=false
REACT_APP_ENABLE_DEBUG=true

# 第三方服务
REACT_APP_GOOGLE_ANALYTICS_ID=
REACT_APP_SENTRY_DSN=

# 构建配置
GENERATE_SOURCEMAP=true
ESLINT_NO_DEV_ERRORS=true
```

---

## ☁️ 生产环境配置

### Render (后端) 环境变量

在Render控制台设置以下环境变量:

```bash
# 基础配置
NODE_ENV=production
PORT=10000

# 数据库配置
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xuelongai?retryWrites=true&w=majority

# JWT配置 (使用强密钥)
JWT_SECRET=生成一个64字符的随机字符串
JWT_EXPIRES_IN=7d

# 管理员账户
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=使用bcrypt生成的哈希值
ADMIN_EMAIL=admin@yourdomain.com

# 文件上传配置
MAX_FILE_SIZE=10485760

# CORS配置 (替换为实际域名)
CORS_ORIGIN=https://your-frontend.vercel.app,https://*.vercel.app

# Cloudinary配置
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret

# 监控配置
LOG_LEVEL=info
ENABLE_LOGGING=true

# 安全配置
TRUST_PROXY=true
SECURE_COOKIES=true
```

### Vercel (前端) 环境变量

在Vercel控制台设置以下环境变量:

```bash
# API配置
REACT_APP_API_URL=https://xuelong-ai-backend.onrender.com
REACT_APP_ENVIRONMENT=production

# 功能开关
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_DEBUG=false

# 第三方服务
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# 构建优化
GENERATE_SOURCEMAP=false
REACT_APP_BUILD_VERSION=$VERCEL_GIT_COMMIT_SHA
REACT_APP_BUILD_TIME=$VERCEL_BUILD_TIME

# SEO配置
REACT_APP_SITE_URL=https://your-frontend.vercel.app
REACT_APP_SITE_NAME=雪龙AI
REACT_APP_SITE_DESCRIPTION=专业的AI解决方案提供商
```

---

## 🔑 密钥生成指南

### JWT Secret生成
```bash
# 方法1: 使用Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 方法2: 使用OpenSSL
openssl rand -hex 64

# 方法3: 在线生成
# 访问: https://generate-secret.vercel.app/64
```

### 密码哈希生成
```javascript
// 使用bcrypt生成密码哈希
const bcrypt = require('bcrypt');
const password = 'your-admin-password';
const hash = await bcrypt.hash(password, 10);
console.log(hash);
```

### MongoDB连接字符串格式
```
mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority

# 示例:
mongodb+srv://xuelongai:mypassword@cluster0.abc123.mongodb.net/xuelongai?retryWrites=true&w=majority
```

---

## 🛠️ 环境变量管理工具

### 1. 使用dotenv-cli
```bash
# 安装
npm install -g dotenv-cli

# 使用不同环境文件运行
dotenv -e .env.development npm start
dotenv -e .env.production npm start
```

### 2. 环境变量验证
```javascript
// config/env-validation.js
const requiredEnvVars = [
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD_HASH'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`❌ 缺少必需的环境变量: ${envVar}`);
    process.exit(1);
  }
});

console.log('✅ 所有必需的环境变量已设置');
```

### 3. 环境变量加密存储
```bash
# 使用git-crypt加密敏感文件
git-crypt init
echo ".env.production" >> .gitattributes
echo ".env.production filter=git-crypt diff=git-crypt" >> .gitattributes
git-crypt add-gpg-user your-gpg-key-id
```

---

## 🔍 环境变量检查清单

### 部署前检查
- [ ] 所有必需的环境变量已设置
- [ ] 密钥足够复杂和安全
- [ ] 数据库连接字符串正确
- [ ] CORS域名配置正确
- [ ] 文件上传限制合理
- [ ] 日志级别适当

### 安全检查
- [ ] 生产环境不使用默认密钥
- [ ] 密码已正确哈希
- [ ] API密钥未暴露在前端代码中
- [ ] 敏感信息未提交到Git
- [ ] 使用HTTPS连接

### 性能检查
- [ ] 数据库连接池配置合理
- [ ] 文件上传大小限制适当
- [ ] 缓存策略配置正确
- [ ] 日志级别不会影响性能

---

## 🚨 常见问题解决

### 1. MongoDB连接失败
```bash
# 检查连接字符串格式
# 确保密码中的特殊字符已URL编码
# 检查网络访问白名单
# 验证用户权限
```

### 2. CORS错误
```bash
# 检查CORS_ORIGIN是否包含前端域名
# 确保协议(http/https)匹配
# 检查端口号是否正确
```

### 3. JWT验证失败
```bash
# 确保JWT_SECRET在前后端一致
# 检查token过期时间设置
# 验证token格式正确
```

### 4. 文件上传失败
```bash
# 检查Cloudinary配置
# 验证文件大小限制
# 确认文件类型允许
```

---

## 📚 参考资源

- [Vercel环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [Render环境变量文档](https://render.com/docs/environment-variables)
- [MongoDB Atlas连接指南](https://docs.atlas.mongodb.com/connect-to-cluster/)
- [Node.js环境变量最佳实践](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [JWT最佳实践](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

记住：**永远不要将敏感信息提交到版本控制系统！**