# 🚀 前后端分离部署策略

## 📋 部署架构概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub        │    │   Vercel        │    │   Render        │
│   代码仓库       │───▶│   前端部署       │───▶│   后端API       │
│                 │    │   (React)       │    │   (Express)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   CDN分发        │    │   MongoDB Atlas │
                       │   静态资源       │    │   数据库存储     │
                       └─────────────────┘    └─────────────────┘
```

## 🎯 部署方案优势

### ✅ 前端 (Vercel)
- **免费额度充足** - 每月100GB带宽
- **全球CDN** - 快速访问速度
- **自动部署** - Git推送自动触发
- **域名支持** - 免费.vercel.app域名
- **HTTPS** - 自动SSL证书

### ✅ 后端 (Render)
- **免费计划** - 750小时/月免费运行时间
- **自动休眠** - 无请求时自动休眠节省资源
- **环境变量** - 安全的配置管理
- **日志监控** - 实时日志查看
- **数据库连接** - 支持外部数据库

### ✅ 数据存储 (MongoDB Atlas)
- **免费集群** - 512MB存储空间
- **云端托管** - 无需维护
- **全球部署** - 多区域支持
- **备份恢复** - 自动数据备份

## 📁 项目结构调整

```
xuelongai/
├── frontend/                 # 前端项目 (部署到Vercel)
│   ├── package.json
│   ├── vercel.json
│   └── src/
├── backend/                  # 后端项目 (部署到Render)
│   ├── package.json
│   ├── render.yaml
│   └── server.js
├── shared/                   # 共享配置
│   └── types/
└── docs/                     # 部署文档
    ├── frontend-deploy.md
    └── backend-deploy.md
```

## 🔧 部署步骤详解

### 第一步：项目重构

#### 1.1 分离前后端代码
```bash
# 创建新的目录结构
mkdir frontend backend shared docs

# 移动前端代码
mv client/* frontend/

# 移动后端代码
mv server/* backend/
```

#### 1.2 更新前端配置
```json
// frontend/package.json
{
  "name": "xuelong-ai-frontend",
  "scripts": {
    "build": "react-scripts build",
    "start": "react-scripts start"
  },
  "homepage": "."
}
```

#### 1.3 更新后端配置
```json
// backend/package.json
{
  "name": "xuelong-ai-backend",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

### 第二步：数据库迁移

#### 2.1 设置MongoDB Atlas
1. 注册 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 创建免费集群 (M0 Sandbox)
3. 创建数据库用户
4. 获取连接字符串
5. 配置网络访问 (0.0.0.0/0 允许所有IP)

#### 2.2 数据迁移脚本
```javascript
// backend/scripts/migrate-data.js
const mongoose = require('mongoose');
const fs = require('fs');

// 连接数据库
mongoose.connect(process.env.MONGODB_URI);

// 迁移JSON数据到MongoDB
async function migrateData() {
  // 读取本地JSON文件
  const companyData = JSON.parse(fs.readFileSync('./data/company.json'));
  const servicesData = JSON.parse(fs.readFileSync('./data/services.json'));
  
  // 插入到MongoDB
  await Company.create(companyData);
  await Service.insertMany(servicesData);
  
  console.log('数据迁移完成');
}
```

### 第三步：前端部署 (Vercel)

#### 3.1 创建前端仓库
```bash
# 在GitHub创建新仓库: xuelong-ai-frontend
git init
git remote add origin https://github.com/你的用户名/xuelong-ai-frontend.git
```

#### 3.2 Vercel配置
```json
// frontend/vercel.json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico))",
      "dest": "/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://your-backend.onrender.com"
  }
}
```

#### 3.3 环境变量配置
```javascript
// frontend/src/config/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### 第四步：后端部署 (Render)

#### 4.1 创建后端仓库
```bash
# 在GitHub创建新仓库: xuelong-ai-backend
git init
git remote add origin https://github.com/你的用户名/xuelong-ai-backend.git
```

#### 4.2 Render配置
```yaml
# backend/render.yaml
services:
  - type: web
    name: xuelong-ai-backend
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false  # 在Render控制台手动设置
      - key: JWT_SECRET
        generateValue: true
```

#### 4.3 CORS配置更新
```javascript
// backend/server.js
const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://your-frontend.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));
```

### 第五步：文件存储解决方案

#### 5.1 Cloudinary配置
```javascript
// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

#### 5.2 文件上传中间件
```javascript
// backend/middleware/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'xuelong-ai',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']
  }
});

const upload = multer({ storage });
module.exports = upload;
```

## 🔐 环境变量配置

### Vercel环境变量
```
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_ENVIRONMENT=production
```

### Render环境变量
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/xuelongai
JWT_SECRET=your-super-secret-jwt-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...
ADMIN_EMAIL=admin@xuelongai.com
```

## 🚀 部署流程

### 自动化部署
```bash
# 1. 推送前端代码
cd frontend
git add .
git commit -m "Deploy frontend"
git push origin main
# Vercel自动部署

# 2. 推送后端代码  
cd ../backend
git add .
git commit -m "Deploy backend"
git push origin main
# Render自动部署
```

### 部署验证
1. **前端检查**: 访问 `https://your-frontend.vercel.app`
2. **后端检查**: 访问 `https://your-backend.onrender.com/api/health`
3. **数据库检查**: 测试API数据读写
4. **文件上传检查**: 测试图片上传功能

## 📊 成本分析

| 服务 | 免费额度 | 付费升级 |
|------|----------|----------|
| Vercel | 100GB带宽/月 | $20/月 Pro |
| Render | 750小时/月 | $7/月 Starter |
| MongoDB Atlas | 512MB存储 | $9/月 M10 |
| Cloudinary | 25GB存储 | $89/月 Plus |

**总计**: 免费使用，升级约 $125/月

## 🔧 故障排除

### 常见问题

1. **CORS错误**
   - 检查后端CORS配置
   - 确认前端域名在允许列表中

2. **API连接失败**
   - 检查环境变量REACT_APP_API_URL
   - 确认后端服务正常运行

3. **数据库连接失败**
   - 检查MongoDB连接字符串
   - 确认网络访问配置

4. **文件上传失败**
   - 检查Cloudinary配置
   - 确认API密钥正确

## 📈 性能优化

### 前端优化
- 代码分割 (Code Splitting)
- 图片懒加载
- CDN缓存策略
- Gzip压缩

### 后端优化
- 数据库索引优化
- API响应缓存
- 请求限流
- 日志监控

## 🔄 CI/CD流程

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Render
        # Render自动部署
```

这个分离部署方案提供了更好的可扩展性、维护性和成本控制，同时保持了开发的灵活性。