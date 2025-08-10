# 雪珑AI项目安全配置指南

## 已实施的安全措施

### 1. 身份认证和授权
- ✅ 移除硬编码密码，使用bcrypt哈希
- ✅ 实施JWT令牌认证
- ✅ 为所有管理API端点添加认证中间件
- ✅ 令牌过期时间设置为24小时

### 2. 输入验证和XSS防护
- ✅ 添加输入长度限制和格式验证
- ✅ 实施XSS过滤，移除危险HTML标签
- ✅ URL格式验证
- ✅ 邮箱格式验证
- ✅ 新闻类型和优先级验证

### 3. 速率限制
- ✅ 登录端点：15分钟内最多5次尝试
- ✅ 通用API端点：15分钟内最多10次请求
- ✅ 自动清理过期的速率限制记录

### 4. 安全头部
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Content-Security-Policy 配置
- ✅ 隐藏X-Powered-By头部

### 5. 请求大小限制
- ✅ JSON和URL编码请求限制为10MB
- ✅ 文件上传大小限制

## 环境变量配置

### 当前配置（开发环境）
```env
# JWT密钥 - 生产环境必须更改！
JWT_SECRET=xuelong-ai-super-secret-jwt-key-change-in-production-2024

# 管理员配置
ADMIN_USERNAME=admin
# 密码哈希对应 'password' - 生产环境必须更改！
ADMIN_PASSWORD_HASH=$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
ADMIN_EMAIL=admin@xuelongai.com
```

## 生产环境安全建议

### 1. 立即更改的配置
```bash
# 生成强JWT密钥
JWT_SECRET=your-super-strong-jwt-secret-key-at-least-32-characters

# 更改管理员用户名
ADMIN_USERNAME=your-secure-admin-username

# 生成新的密码哈希（使用bcrypt）
# 在Node.js中运行：
# const bcrypt = require('bcryptjs');
# const hash = bcrypt.hashSync('your-strong-password', 10);
ADMIN_PASSWORD_HASH=your-generated-password-hash

# 更新管理员邮箱
ADMIN_EMAIL=your-admin@yourdomain.com
```

### 2. 服务器配置
- 使用HTTPS（SSL/TLS证书）
- 配置防火墙，只开放必要端口
- 定期更新Node.js和依赖包
- 使用PM2或类似工具管理进程
- 配置日志记录和监控

### 3. 数据库安全（未来扩展）
- 使用数据库连接池
- 实施SQL注入防护
- 定期备份数据
- 限制数据库访问权限

### 4. 文件上传安全
- 验证文件类型和大小
- 扫描恶意文件
- 存储在安全目录
- 定期清理临时文件

### 5. 监控和日志
- 记录所有认证尝试
- 监控异常API调用
- 设置安全事件告警
- 定期安全审计

## 安全检查清单

### 部署前检查
- [ ] 更改所有默认密码和密钥
- [ ] 配置HTTPS
- [ ] 设置防火墙规则
- [ ] 配置安全头部
- [ ] 测试认证和授权
- [ ] 验证输入过滤
- [ ] 测试速率限制

### 定期维护
- [ ] 更新依赖包
- [ ] 检查安全漏洞
- [ ] 审查访问日志
- [ ] 测试备份恢复
- [ ] 更新安全策略

## 应急响应

### 发现安全问题时
1. 立即隔离受影响的系统
2. 评估影响范围
3. 修复安全漏洞
4. 更新所有密钥和密码
5. 通知相关人员
6. 记录事件和处理过程

### 联系信息
- 技术负责人：admin@xuelongai.com
- 紧急联系：[待配置]

---

**重要提醒：** 本文档包含敏感的安全配置信息，请妥善保管，不要提交到公共代码仓库。