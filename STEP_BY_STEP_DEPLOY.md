# 🚀 分步部署指南

## 📋 部署前准备清单

### ✅ 必需账户
- [ ] GitHub账户
- [ ] Vercel账户 (用GitHub登录)
- [ ] Render账户 (用GitHub登录)
- [ ] MongoDB Atlas账户
- [ ] Cloudinary账户 (可选，用于图片存储)

### ✅ 本地环境
- [ ] Node.js 16+ 已安装
- [ ] Git 已安装
- [ ] 项目代码已准备

---

## 第一步：设置MongoDB Atlas数据库

### 1.1 创建MongoDB Atlas集群

1. 访问 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. 注册/登录账户
3. 点击 "Build a Database"
4. 选择 "FREE" 计划 (M0 Sandbox)
5. 选择云提供商和区域 (推荐AWS - N. Virginia)
6. 集群名称: `xuelong-ai-cluster`
7. 点击 "Create Cluster"

### 1.2 配置数据库访问

1. **创建数据库用户**:
   - 进入 "Database Access"
   - 点击 "Add New Database User"
   - 用户名: `xuelongai-user`
   - 密码: 生成强密码并保存
   - 权限: "Read and write to any database"

2. **配置网络访问**:
   - 进入 "Network Access"
   - 点击 "Add IP Address"
   - 选择 "Allow access from anywhere" (0.0.0.0/0)
   - 确认添加

3. **获取连接字符串**:
   - 进入 "Database" → "Connect"
   - 选择 "Connect your application"
   - 复制连接字符串，格式如下:
   ```
   mongodb+srv://xuelongai-user:<password>@xuelong-ai-cluster.xxxxx.mongodb.net/xuelongai?retryWrites=true&w=majority
   ```

### 1.3 迁移本地数据

```bash
# 1. 安装依赖
npm install mongoose dotenv

# 2. 创建环境变量文件
echo "MONGODB_URI=你的MongoDB连接字符串" > .env

# 3. 运行迁移脚本
node migrate-to-mongodb.js migrate

# 4. 验证数据迁移
node migrate-to-mongodb.js export
```

---

## 第二步：准备项目结构

### 2.1 重组项目目录

```bash
# 创建新的目录结构
mkdir frontend backend

# 移动前端代码
robocopy client frontend /E

# 移动后端代码
robocopy server backend /E

# 复制配置文件
copy frontend-vercel.json frontend\vercel.json
copy render.yaml backend\render.yaml
```

### 2.2 更新前端配置

编辑 `frontend/src/config/api.js`:
```javascript
// API配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
      config.headers.Authorization = `Bearer ${token}`;
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
```

### 2.3 更新后端配置

编辑 `backend/server.js`，添加MongoDB连接:
```javascript
const mongoose = require('mongoose');

// MongoDB连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/xuelongai', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB连接成功'))
.catch(err => console.error('❌ MongoDB连接失败:', err));

// CORS配置
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://xuelong-ai-frontend.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true
}));

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});
```

---

## 第三步：部署后端到Render

### 3.1 创建后端GitHub仓库

```bash
# 进入后端目录
cd backend

# 初始化Git仓库
git init
git add .
git commit -m "Initial backend commit"

# 在GitHub创建新仓库: xuelong-ai-backend
# 添加远程仓库
git remote add origin https://github.com/你的用户名/xuelong-ai-backend.git
git branch -M main
git push -u origin main
```

### 3.2 在Render部署后端

1. 访问 [Render](https://render.com)
2. 用GitHub账户登录
3. 点击 "New" → "Web Service"
4. 连接GitHub仓库 `xuelong-ai-backend`
5. 配置部署设置:
   - **Name**: `xuelong-ai-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

### 3.3 配置环境变量

在Render控制台添加环境变量:
```
NODE_ENV=production
PORT=10000
MONGODB_URI=你的MongoDB连接字符串
JWT_SECRET=你的JWT密钥
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=你的密码哈希
ADMIN_EMAIL=admin@xuelongai.com
CORS_ORIGIN=https://xuelong-ai-frontend.vercel.app
```

### 3.4 验证后端部署

```bash
# 检查健康状态
curl https://xuelong-ai-backend.onrender.com/api/health

# 应该返回:
# {"status":"OK","timestamp":"...","environment":"production"}
```

---

## 第四步：部署前端到Vercel

### 4.1 创建前端GitHub仓库

```bash
# 进入前端目录
cd ../frontend

# 初始化Git仓库
git init
git add .
git commit -m "Initial frontend commit"

# 在GitHub创建新仓库: xuelong-ai-frontend
git remote add origin https://github.com/你的用户名/xuelong-ai-frontend.git
git branch -M main
git push -u origin main
```

### 4.2 在Vercel部署前端

#### 方法一：通过Vercel网站
1. 访问 [Vercel](https://vercel.com)
2. 用GitHub账户登录
3. 点击 "New Project"
4. 导入 `xuelong-ai-frontend` 仓库
5. 配置项目:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

#### 方法二：通过Vercel CLI
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录Vercel
vercel login

# 部署项目
vercel --prod
```

### 4.3 配置环境变量

在Vercel控制台添加环境变量:
```
REACT_APP_API_URL=https://xuelong-ai-backend.onrender.com
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
```

### 4.4 更新后端CORS设置

获取Vercel分配的域名后，更新后端的CORS配置:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://你的项目名.vercel.app',  // 替换为实际域名
    'https://*.vercel.app'
  ],
  credentials: true
}));
```

---

## 第五步：设置文件存储 (可选)

### 5.1 配置Cloudinary

1. 注册 [Cloudinary](https://cloudinary.com)
2. 获取API凭据:
   - Cloud Name
   - API Key
   - API Secret

3. 在后端添加环境变量:
```
CLOUDINARY_CLOUD_NAME=你的cloud_name
CLOUDINARY_API_KEY=你的api_key
CLOUDINARY_API_SECRET=你的api_secret
```

### 5.2 更新文件上传代码

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

---

## 第六步：测试和验证

### 6.1 功能测试清单

- [ ] 前端页面正常加载
- [ ] API请求正常响应
- [ ] 用户登录/注册功能
- [ ] 数据增删改查功能
- [ ] 文件上传功能 (如果启用)
- [ ] 响应式设计在移动端正常

### 6.2 性能测试

```bash
# 使用Lighthouse测试前端性能
npx lighthouse https://你的项目名.vercel.app --output html

# 测试API响应时间
curl -w "@curl-format.txt" -o /dev/null -s https://xuelong-ai-backend.onrender.com/api/health
```

### 6.3 监控设置

1. **Vercel Analytics**: 在项目设置中启用
2. **Render Logs**: 监控后端日志
3. **MongoDB Atlas Monitoring**: 监控数据库性能

---

## 第七步：自动化部署

### 7.1 设置GitHub Actions (可选)

创建 `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build project
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### 7.2 配置自动部署

- **Vercel**: 默认启用Git集成，推送到main分支自动部署
- **Render**: 默认启用自动部署，推送到main分支自动部署

---

## 🎉 部署完成！

### 访问你的应用

- **前端**: `https://你的项目名.vercel.app`
- **后端API**: `https://xuelong-ai-backend.onrender.com/api`
- **API文档**: `https://xuelong-ai-backend.onrender.com/api/docs` (如果配置了)

### 下一步优化

1. **自定义域名**: 在Vercel和Render配置自定义域名
2. **CDN优化**: 配置图片和静态资源CDN
3. **监控告警**: 设置性能和错误监控
4. **备份策略**: 定期备份数据库
5. **安全加固**: 配置HTTPS、CSP等安全策略

### 故障排除

如果遇到问题，请检查:
1. 环境变量是否正确配置
2. CORS设置是否包含正确的域名
3. MongoDB连接字符串是否有效
4. API端点是否正确
5. 查看Render和Vercel的部署日志

---

## 📞 获取帮助

- **Vercel文档**: https://vercel.com/docs
- **Render文档**: https://render.com/docs
- **MongoDB Atlas文档**: https://docs.atlas.mongodb.com
- **React文档**: https://reactjs.org/docs
- **Express文档**: https://expressjs.com

祝你部署成功！🚀