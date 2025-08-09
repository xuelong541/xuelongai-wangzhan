# 雪珑AI项目部署指南

## 项目结构
```
xuelongai/
├── client/          # React前端应用
├── server/          # Node.js后端API
└── DEPLOYMENT.md    # 部署说明文档
```

## 本地开发环境

### 1. 启动后端服务
```bash
cd server
npm install
npm start
```
后端服务将运行在: http://localhost:5000

### 2. 启动前端服务
```bash
cd client
npm install
npm start
```
前端服务将运行在: http://localhost:3000

## 生产环境部署

### 方法一：传统服务器部署

#### 1. 构建前端应用
```bash
cd client
npm run build
```
这将在 `client/build` 目录生成静态文件。

#### 2. 部署到服务器
- 将 `client/build` 目录的所有文件上传到服务器的网站根目录
- 将 `server` 目录上传到服务器
- 在服务器上安装Node.js依赖并启动后端服务

#### 3. 配置Web服务器（如Nginx）
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/client/build;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端API代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 方法二：使用PM2管理Node.js进程

#### 1. 安装PM2
```bash
npm install -g pm2
```

#### 2. 启动后端服务
```bash
cd server
pm2 start server.js --name "xuelong-ai-server"
```

#### 3. 使用PM2管理前端（可选）
```bash
cd client
pm2 serve build 3000 --name "xuelong-ai-client" --spa
```

## 环境变量配置

### 后端环境变量 (server/.env)
```
PORT=5000
NODE_ENV=production
JWT_SECRET=your-jwt-secret
```

### 前端环境变量 (client/.env)
```
REACT_APP_API_URL=http://your-domain.com/api
```

## 常见问题解决

### 1. 找不到首页
- 确保Web服务器配置了正确的fallback规则（try_files $uri $uri/ /index.html）
- 检查build文件是否正确上传到服务器根目录
- 确认路由配置正确

### 2. API请求失败
- 检查后端服务是否正常运行
- 确认API代理配置正确
- 检查防火墙和端口设置

### 3. 静态资源加载失败
- 确认所有build文件都已上传
- 检查文件权限设置
- 验证Web服务器配置

## 健康检查

访问以下URL确认服务状态：
- 前端首页: http://your-domain.com
- 后端健康检查: http://your-domain.com/api/health

## 技术支持

如果遇到部署问题，请检查：
1. Node.js版本兼容性
2. 网络连接和防火墙设置
3. 服务器资源和权限
4. 日志文件中的错误信息