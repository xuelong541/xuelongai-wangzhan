# XUELONG AI Studio

一个全栈AI工作室应用，包含React前端和Express后端。

## 项目结构

```
xuelongai/
├── client/          # React前端应用
├── server/          # Express后端API
├── vercel.json      # Vercel部署配置
└── README.md        # 项目说明
```

## 本地开发

### 前端开发
```bash
cd client
npm install
npm start
```
前端将运行在 http://localhost:3001

### 后端开发
```bash
cd server
npm install
npm start
```
后端将运行在 http://localhost:3000

## 部署到GitHub和Vercel

### 1. 部署到GitHub

#### 步骤1：初始化Git仓库
```bash
# 在项目根目录执行
git init
git add .
git commit -m "Initial commit"
```

#### 步骤2：创建GitHub仓库
1. 登录GitHub (https://github.com)
2. 点击右上角的 "+" 按钮，选择 "New repository"
3. 输入仓库名称（如：xuelong-ai-studio）
4. 选择 "Public" 或 "Private"
5. 不要勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

#### 步骤3：推送代码到GitHub
```bash
# 添加远程仓库（替换为你的GitHub用户名和仓库名）
git remote add origin https://github.com/你的用户名/xuelong-ai-studio.git
git branch -M main
git push -u origin main
```

### 2. 部署到Vercel

#### 方法1：通过Vercel网站部署（推荐）

1. **访问Vercel**
   - 打开 https://vercel.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你刚才创建的GitHub仓库
   - 点击 "Import"

3. **配置项目**
   - Project Name: 输入项目名称
   - Framework Preset: 选择 "Other"
   - Root Directory: 保持默认（./）
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/build`
   - Install Command: `npm install`

4. **环境变量设置**
   - 在 "Environment Variables" 部分添加必要的环境变量
   - 如果后端需要数据库连接，添加相应的环境变量

5. **部署**
   - 点击 "Deploy"
   - 等待部署完成

#### 方法2：通过Vercel CLI部署

1. **安装Vercel CLI**
```bash
npm install -g vercel
```

2. **登录Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
# 在项目根目录执行
vercel
```

### 3. 重要配置说明

#### vercel.json配置
项目已包含优化的`vercel.json`配置文件，支持：
- 前端静态文件托管
- 后端API路由
- 文件上传功能
- 生产环境变量

#### 环境变量
在Vercel中需要设置以下环境变量（如果后端使用）：
- `NODE_ENV`: production
- `MONGODB_URI`: MongoDB连接字符串（如果使用MongoDB）
- `JWT_SECRET`: JWT密钥
- 其他后端所需的环境变量

### 4. 自动部署

一旦连接到GitHub，每次推送代码到main分支时，Vercel会自动重新部署：

```bash
# 更新代码后
git add .
git commit -m "Update features"
git push origin main
```

### 5. 访问部署的应用

部署完成后，Vercel会提供一个URL，格式类似：
- `https://your-project-name.vercel.app`

### 6. 故障排除

#### 常见问题：

1. **构建失败**
   - 检查`package.json`中的依赖是否正确
   - 确保所有必要的环境变量已设置

2. **API路由不工作**
   - 检查`vercel.json`中的路由配置
   - 确保后端代码兼容Serverless环境

3. **静态文件404**
   - 检查构建输出目录是否正确
   - 确保静态文件路径配置正确

### 7. 本地测试生产构建

在部署前，建议本地测试生产构建：

```bash
# 构建前端
cd client
npm run build

# 使用serve测试构建结果
npx serve -s build
```

## 技术栈

- **前端**: React 18, React Router, Framer Motion, Axios
- **后端**: Node.js, Express, MongoDB, JWT
- **部署**: Vercel, GitHub

## 许可证

MIT License