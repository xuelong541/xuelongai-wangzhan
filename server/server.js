const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Data file paths
const DATA_DIR = path.join(__dirname, 'data');
const COMPANY_DATA_FILE = path.join(DATA_DIR, 'company.json');
const FOUNDER_DATA_FILE = path.join(DATA_DIR, 'founder.json');
const INTRO_DATA_FILE = path.join(DATA_DIR, 'intro.json');
const SERVICES_DATA_FILE = path.join(DATA_DIR, 'services.json');
const CORE_SERVICE_CAROUSEL_FILE = path.join(DATA_DIR, 'core-service-carousel.json');
const NEWS_DATA_FILE = path.join(DATA_DIR, 'news.json');
const AI_RESOURCES_FILE = path.join(DATA_DIR, 'ai-resources.json');
const POSTS_DATA_FILE = path.join(DATA_DIR, 'posts.json');
const PARTNERS_DATA_FILE = path.join(DATA_DIR, 'partners.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Data loading and saving functions
const loadData = (filePath, defaultData) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading data from ${filePath}:`, error);
  }
  return defaultData;
};

const saveData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving data to ${filePath}:`, error);
  }
};

// Security headers middleware
app.use((req, res, next) => {
  // Prevent XSS attacks
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self';"
  );
  
  // Hide server information
  res.removeHeader('X-Powered-By');
  
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Add size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: '访问令牌缺失' });
  }
  
  const jwtSecret = process.env.JWT_SECRET || 'your-default-secret-key';
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '无效的访问令牌' });
    }
    req.user = user;
    next();
  });
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    const jwtSecret = process.env.JWT_SECRET || 'your-default-secret-key';
    jwt.verify(token, jwtSecret, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Rate limiting middleware
const rateLimitStore = new Map();
const rateLimit = (maxRequests = 10, windowMs = 15 * 60 * 1000) => {
  return (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    if (!rateLimitStore.has(clientIP)) {
      rateLimitStore.set(clientIP, []);
    }
    
    const requests = rateLimitStore.get(clientIP).filter(time => time > windowStart);
    
    if (requests.length >= maxRequests) {
      return res.status(429).json({ 
        message: '请求过于频繁，请稍后再试',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    requests.push(now);
    rateLimitStore.set(clientIP, requests);
    next();
  };
};

// Specific rate limit for login attempts
const loginRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Static file serving - serve uploads through API path for proper proxy handling
app.use('/api/uploads', express.static(UPLOADS_DIR));

// Also serve uploads directly for backward compatibility
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve uploads at root level for frontend proxy
app.use('/uploads', express.static(UPLOADS_DIR));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Sample data for development

// Company information
const defaultCompanyInfo = {
  id: 1,
  name: 'XUELONG AI',
  subtitle: '雪珑人工智能设计工作室',
  slogan: '引领智能工作新方式',
  description: '专注于人工智能技术研发与应用的创新型工作室',
  address: '北京市海淀区中关村科技园',
  phone: '400-888-9999',
  email: 'contact@xuelongai.com',
  updatedAt: new Date()
};

let companyInfo = loadData(COMPANY_DATA_FILE, defaultCompanyInfo);
// Save initial data if file doesn't exist
if (!fs.existsSync(COMPANY_DATA_FILE)) {
  saveData(COMPANY_DATA_FILE, companyInfo);
}

// Founder information
const defaultFounderInfo = {
  id: 1,
  name: '张雪珑',
  title: '创始人 & 首席技术官',
  description: '清华大学计算机科学博士，专注AI技术研发10余年，曾在顶级科技公司担任AI架构师，拥有多项AI专利。',
  photo: '/founder-photo.svg',
  updatedAt: new Date()
};

let founderInfo = loadData(FOUNDER_DATA_FILE, defaultFounderInfo);
if (!fs.existsSync(FOUNDER_DATA_FILE)) {
  saveData(FOUNDER_DATA_FILE, founderInfo);
}

// Company introduction
const defaultCompanyIntro = {
  id: 1,
  paragraphs: [
    '雪珑AI工作室致力于推动人工智能技术的前沿发展，专注于机器学习、深度学习、自然语言处理等核心技术领域。我们以技术创新为驱动，为客户提供最前沿的AI解决方案，助力企业数字化转型和智能化升级。',
    '工作室汇聚了来自清华、北大、中科院等顶尖院校的AI专家，拥有深厚的理论基础和丰富的实践经验，致力于将最新的AI研究成果转化为实际应用。'
  ],
  updatedAt: new Date()
};

let companyIntro = loadData(INTRO_DATA_FILE, defaultCompanyIntro);
if (!fs.existsSync(INTRO_DATA_FILE)) {
  saveData(INTRO_DATA_FILE, companyIntro);
}

// AI Resources - Default data
const defaultAiResources = [
  {
    id: 1,
    name: 'ChatGPT',
    description: '智能对话助手，支持多轮对话和代码生成',
    category: '对话AI',
    url: 'https://chat.openai.com',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 2,
    name: 'Claude',
    description: '高质量文本分析和创作工具',
    category: '文本AI',
    url: 'https://claude.ai',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 3,
    name: 'Midjourney',
    description: '专业AI图像生成和艺术创作平台',
    category: '图像AI',
    url: 'https://midjourney.com',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 4,
    name: 'GitHub Copilot',
    description: '智能代码补全和编程助手',
    category: '编程AI',
    url: 'https://github.com/features/copilot',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 5,
    name: 'TensorFlow',
    description: '开源机器学习框架和模型训练',
    category: '开发框架',
    url: 'https://tensorflow.org',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 6,
    name: 'PyTorch',
    description: '深度学习研究和生产部署平台',
    category: '开发框架',
    url: 'https://pytorch.org',
    isActive: true,
    createdAt: new Date()
  }
];

// Load AI resources data
let aiResources = loadData(AI_RESOURCES_FILE, defaultAiResources);
if (!fs.existsSync(AI_RESOURCES_FILE)) {
  saveData(AI_RESOURCES_FILE, aiResources);
}

// Core Services - Default data
const defaultServices = [
  {
    id: 1,
    title: '专业AI培训',
    description: '从基础到进阶，全面的人工智能课程体系',
    icon: 'Code',
    features: ['基础理论课程', '实战项目训练', '专家一对一指导', '就业推荐服务'],
    posterImage: null,
    isActive: true,
    order: 1,
    createdAt: new Date()
  },
  {
    id: 2,
    title: '定制项目开发',
    description: '量身打造的AI解决方案，满足您的业务需求',
    icon: 'Monitor',
    features: ['需求分析', '方案设计', '开发实施', '部署维护'],
    posterImage: null,
    isActive: true,
    order: 2,
    createdAt: new Date()
  },
  {
    id: 3,
    title: '校企合作',
    description: '与高等院校建立深度合作关系，共同推进AI人才培养',
    icon: 'Award',
    features: ['课程共建', '实习基地', '师资培训', '科研合作'],
    posterImage: null,
    isActive: true,
    order: 3,
    createdAt: new Date()
  }
];

// Load services data
let coreServices = loadData(SERVICES_DATA_FILE, defaultServices);

// Core service carousel data
const defaultCoreServiceCarousel = {
  id: 1,
  title: '核心服务轮播图片',
  images: [],
  isActive: true,
  autoPlay: true,
  interval: 3000,
  createdAt: new Date(),
  updatedAt: new Date()
};

let coreServiceCarousel = loadData(CORE_SERVICE_CAROUSEL_FILE, defaultCoreServiceCarousel);
if (!fs.existsSync(CORE_SERVICE_CAROUSEL_FILE)) {
  saveData(CORE_SERVICE_CAROUSEL_FILE, coreServiceCarousel);
}

// News data
const defaultNewsData = {
  news: [
    {
      id: 1,
      content: "🎉 雪珑AI荣获2024年度最佳AI设计工作室奖",
      type: "award",
      priority: 1,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      content: "🚀 新推出智能UI设计助手，提升设计效率300%",
      type: "product",
      priority: 2,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 3,
      content: "💡 与知名企业达成战略合作，共建AI设计生态",
      type: "partnership",
      priority: 3,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 4,
      content: "🔥 AI培训课程火热报名中，限时优惠50%",
      type: "promotion",
      priority: 4,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 5,
      content: "⭐ 客户满意度达98%，服务质量行业领先",
      type: "achievement",
      priority: 5,
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  settings: {
    scrollSpeed: 30,
    maxDisplayItems: 5,
    autoRefresh: true,
    refreshInterval: 300000
  }
};

let newsData = loadData(NEWS_DATA_FILE, defaultNewsData);
if (!fs.existsSync(NEWS_DATA_FILE)) {
  saveData(NEWS_DATA_FILE, newsData);
}

// Posts data - Default data
const defaultPosts = [
  {
    id: 1,
    title: 'XUELONG AI 深度学习框架发布',
    content: '我们很高兴地宣布XUELONG AI深度学习框架正式发布，为开发者提供更强大的AI开发工具。',
    author: 'XUELONG AI团队',
    createdAt: new Date('2024-01-15'),
    image: null,
    published: true
  },
  {
    id: 2,
    title: '人工智能在医疗领域的突破性应用',
    content: 'XUELONG AI在医疗影像识别方面取得重大突破，准确率达到99.5%，为医疗诊断提供强有力支持。',
    author: '研发部',
    createdAt: new Date('2024-01-10'),
    image: null,
    published: true
  },
  {
    id: 3,
    title: '智能语音助手技术升级',
    content: '最新版本的智能语音助手支持多语言识别和自然语言处理，用户体验显著提升。',
    author: '产品团队',
    createdAt: new Date('2024-01-05'),
    image: null,
    published: true
  }
];

// Load posts data
let samplePosts = loadData(POSTS_DATA_FILE, defaultPosts);
if (!fs.existsSync(POSTS_DATA_FILE)) {
  saveData(POSTS_DATA_FILE, samplePosts);
}

// Partners data - Default data
const defaultPartners = [
  {
    id: 1,
    name: '清华大学',
    description: '人工智能研究合作伙伴',
    logo: null,
    website: 'https://www.tsinghua.edu.cn'
  },
  {
    id: 2,
    name: '北京大学',
    description: '机器学习联合实验室',
    logo: null,
    website: 'https://www.pku.edu.cn'
  },
  {
    id: 3,
    name: '中科院',
    description: '深度学习技术研发',
    logo: null,
    website: 'https://www.cas.cn'
  },
  {
    id: 4,
    name: '华为技术',
    description: '5G+AI战略合作',
    logo: null,
    website: 'https://www.huawei.com'
  },
  {
    id: 5,
    name: '腾讯云',
    description: '云计算服务提供商',
    logo: null,
    website: 'https://cloud.tencent.com'
  },
  {
    id: 6,
    name: '阿里云',
    description: 'AI算力支持合作',
    logo: null,
    website: 'https://www.aliyun.com'
  }
];

// Load partners data
let samplePartners = loadData(PARTNERS_DATA_FILE, defaultPartners);
if (!fs.existsSync(PARTNERS_DATA_FILE)) {
  saveData(PARTNERS_DATA_FILE, samplePartners);
}

// Sample user for authentication
// Default password is 'password', hashed with bcrypt
const sampleUser = {
  id: 1,
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD_HASH || '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
  email: process.env.ADMIN_EMAIL || 'admin@xuelongai.com'
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'XUELONG AI Server is running' });
});

// Posts routes
app.get('/api/posts', (req, res) => {
  res.json(samplePosts);
});

app.get('/api/posts/:id', (req, res) => {
  const post = samplePosts.find(p => p.id === parseInt(req.params.id));
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  res.json(post);
});

app.post('/api/posts', authenticateToken, upload.single('image'), (req, res) => {
  const { title, content, author, published } = req.body;
  const newPost = {
    id: Math.max(...samplePosts.map(p => p.id), 0) + 1,
    title,
    content,
    author: author || 'XUELONG AI',
    published: published === 'true' || published === true,
    createdAt: new Date(),
    image: req.file ? `/uploads/${req.file.filename}` : null
  };
  samplePosts.unshift(newPost);
  
  // Save data to file
  saveData(POSTS_DATA_FILE, samplePosts);
  
  res.status(201).json(newPost);
});

app.put('/api/posts/:id', authenticateToken, upload.single('image'), (req, res) => {
  const postIndex = samplePosts.findIndex(p => p.id === parseInt(req.params.id));
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  const { title, content, author, published } = req.body;
  const updatedPost = {
    ...samplePosts[postIndex],
    title: title || samplePosts[postIndex].title,
    content: content || samplePosts[postIndex].content,
    author: author || samplePosts[postIndex].author,
    published: published !== undefined ? published === 'true' : samplePosts[postIndex].published,
    updatedAt: new Date()
  };
  
  // Handle image upload
  if (req.file) {
    updatedPost.image = `/uploads/${req.file.filename}`;
  }
  
  samplePosts[postIndex] = updatedPost;
  
  // Save data to file
  saveData(POSTS_DATA_FILE, samplePosts);
  
  res.json(samplePosts[postIndex]);
});

app.delete('/api/posts/:id', authenticateToken, (req, res) => {
  const postIndex = samplePosts.findIndex(p => p.id === parseInt(req.params.id));
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }
  
  samplePosts.splice(postIndex, 1);
  
  // Save data to file
  saveData(POSTS_DATA_FILE, samplePosts);
  
  res.json({ message: 'Post deleted successfully' });
});

// Partners routes
app.get('/api/partners', (req, res) => {
  res.json(samplePartners);
});

app.post('/api/partners', authenticateToken, (req, res) => {
  const { name, description, website } = req.body;
  const newPartner = {
    id: Math.max(...samplePartners.map(p => p.id), 0) + 1,
    name,
    description,
    website,
    createdAt: new Date()
  };
  samplePartners.push(newPartner);
  
  // Save data to file
  saveData(PARTNERS_DATA_FILE, samplePartners);
  
  res.status(201).json(newPartner);
});

app.put('/api/partners/:id', authenticateToken, (req, res) => {
  const partnerIndex = samplePartners.findIndex(p => p.id === parseInt(req.params.id));
  if (partnerIndex === -1) {
    return res.status(404).json({ message: 'Partner not found' });
  }
  
  const { name, description, website } = req.body;
  samplePartners[partnerIndex] = {
    ...samplePartners[partnerIndex],
    name: name || samplePartners[partnerIndex].name,
    description: description || samplePartners[partnerIndex].description,
    website: website || samplePartners[partnerIndex].website,
    updatedAt: new Date()
  };
  
  // Save data to file
  saveData(PARTNERS_DATA_FILE, samplePartners);
  
  res.json(samplePartners[partnerIndex]);
});

app.delete('/api/partners/:id', authenticateToken, (req, res) => {
  const partnerIndex = samplePartners.findIndex(p => p.id === parseInt(req.params.id));
  if (partnerIndex === -1) {
    return res.status(404).json({ message: 'Partner not found' });
  }
  
  samplePartners.splice(partnerIndex, 1);
  
  // Save data to file
  saveData(PARTNERS_DATA_FILE, samplePartners);
  
  res.json({ message: 'Partner deleted successfully' });
});

// Authentication routes
app.post('/api/auth/login', loginRateLimit, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    // Check username
    if (username !== sampleUser.username) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, sampleUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-default-secret-key';
    const token = jwt.sign(
      { 
        id: sampleUser.id, 
        username: sampleUser.username 
      },
      jwtSecret,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: sampleUser.id,
        username: sampleUser.username,
        email: sampleUser.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Input validation helper
const validateInput = (input, maxLength = 1000) => {
  if (typeof input !== 'string') return false;
  if (input.length > maxLength) return false;
  // Basic XSS prevention - remove script tags and dangerous patterns
  const dangerousPatterns = /<script[^>]*>.*?<\/script>/gi;
  return !dangerousPatterns.test(input);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  // Remove potentially dangerous HTML tags and scripts
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Contact form
app.post('/api/contact', (req, res) => {
  const { name, email, phone, service, message } = req.body;
  
  // Input validation
  if (!name || !email || !message) {
    return res.status(400).json({ message: '姓名、邮箱和留言内容不能为空' });
  }
  
  if (!validateInput(name, 100) || !validateInput(email, 100) || !validateInput(message, 2000)) {
    return res.status(400).json({ message: '输入内容包含非法字符或超出长度限制' });
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: '邮箱格式不正确' });
  }
  
  // Sanitize inputs
  const sanitizedData = {
    name: sanitizeInput(name),
    email: sanitizeInput(email),
    phone: phone ? sanitizeInput(phone) : '',
    service: service ? sanitizeInput(service) : '',
    message: sanitizeInput(message),
    timestamp: new Date()
  };
  
  // In production, you would save this to a database or send an email
  console.log('Contact form submission:', sanitizedData);
  
  res.json({ message: '感谢您的留言，我们会尽快与您联系！' });
});

// Company Information routes
app.get('/api/company', (req, res) => {
  res.json(companyInfo);
});

app.put('/api/company', authenticateToken, (req, res) => {
  const { name, subtitle, slogan, description, address, phone, email } = req.body;
  Object.assign(companyInfo, {
    name: name || companyInfo.name,
    subtitle: subtitle || companyInfo.subtitle,
    slogan: slogan || companyInfo.slogan,
    description: description || companyInfo.description,
    address: address || companyInfo.address,
    phone: phone || companyInfo.phone,
    email: email || companyInfo.email,
    updatedAt: new Date()
  });
  saveData(COMPANY_DATA_FILE, companyInfo);
  res.json(companyInfo);
});

// Founder Information routes
app.get('/api/founder', (req, res) => {
  res.json(founderInfo);
});

app.put('/api/founder', authenticateToken, upload.single('photo'), (req, res) => {
  const { name, title, description, photo } = req.body;
  Object.assign(founderInfo, {
    name: name || founderInfo.name,
    title: title || founderInfo.title,
    description: description || founderInfo.description,
    photo: req.file ? `/uploads/${req.file.filename}` : (photo || founderInfo.photo),
    updatedAt: new Date()
  });
  saveData(FOUNDER_DATA_FILE, founderInfo);
  res.json(founderInfo);
});

// Company Introduction routes
app.get('/api/company-intro', (req, res) => {
  res.json(companyIntro);
});

app.put('/api/company-intro', authenticateToken, (req, res) => {
  const { paragraphs } = req.body;
  Object.assign(companyIntro, {
    paragraphs: paragraphs || companyIntro.paragraphs,
    updatedAt: new Date()
  });
  saveData(INTRO_DATA_FILE, companyIntro);
  res.json(companyIntro);
});

// AI Resources routes
app.get('/api/ai-resources', (req, res) => {
  res.json(aiResources);
});

app.get('/api/ai-resources/:id', (req, res) => {
  const resource = aiResources.find(r => r.id === parseInt(req.params.id));
  if (!resource) {
    return res.status(404).json({ message: 'AI Resource not found' });
  }
  res.json(resource);
});

app.post('/api/ai-resources', authenticateToken, (req, res) => {
  const { name, description, category, url, isActive } = req.body;
  
  // Input validation
  if (!name || !description || !category || !url) {
    return res.status(400).json({ message: '名称、描述、分类和URL不能为空' });
  }
  
  if (!validateInput(name, 100) || !validateInput(description, 500) || !validateInput(category, 50)) {
    return res.status(400).json({ message: '输入内容包含非法字符或超出长度限制' });
  }
  
  // URL validation
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ message: 'URL格式不正确' });
  }
  
  const newResource = {
    id: Math.max(...aiResources.map(r => r.id), 0) + 1,
    name: sanitizeInput(name),
    description: sanitizeInput(description),
    category: sanitizeInput(category),
    url: sanitizeInput(url),
    isActive: isActive !== undefined ? isActive : true,
    createdAt: new Date()
  };
  aiResources.push(newResource);
  
  // Save data to file
  saveData(AI_RESOURCES_FILE, aiResources);
  
  res.status(201).json(newResource);
});

app.put('/api/ai-resources/:id', authenticateToken, (req, res) => {
  const resourceIndex = aiResources.findIndex(r => r.id === parseInt(req.params.id));
  if (resourceIndex === -1) {
    return res.status(404).json({ message: 'AI Resource not found' });
  }
  
  const { name, description, category, url, isActive } = req.body;
  aiResources[resourceIndex] = {
    ...aiResources[resourceIndex],
    name: name || aiResources[resourceIndex].name,
    description: description || aiResources[resourceIndex].description,
    category: category || aiResources[resourceIndex].category,
    url: url || aiResources[resourceIndex].url,
    isActive: isActive !== undefined ? isActive : aiResources[resourceIndex].isActive,
    updatedAt: new Date()
  };
  
  // Save data to file
  saveData(AI_RESOURCES_FILE, aiResources);
  
  res.json(aiResources[resourceIndex]);
});

app.delete('/api/ai-resources/:id', authenticateToken, (req, res) => {
  const resourceIndex = aiResources.findIndex(r => r.id === parseInt(req.params.id));
  if (resourceIndex === -1) {
    return res.status(404).json({ message: 'AI Resource not found' });
  }
  
  aiResources.splice(resourceIndex, 1);
  
  // Save data to file
  saveData(AI_RESOURCES_FILE, aiResources);
  
  res.json({ message: 'AI Resource deleted successfully' });
});

// Core Services routes
app.get('/api/services', (req, res) => {
  res.json(coreServices.sort((a, b) => a.order - b.order));
});

app.get('/api/services/:id', (req, res) => {
  const service = coreServices.find(s => s.id === parseInt(req.params.id));
  if (!service) {
    return res.status(404).json({ message: 'Service not found' });
  }
  res.json(service);
});

app.post('/api/services', authenticateToken, (req, res) => {
  const { title, description, icon, features, isActive, order } = req.body;
  const newService = {
    id: coreServices.length + 1,
    title,
    description,
    icon,
    features: features || [],
    isActive: isActive !== undefined ? isActive : true,
    order: order || coreServices.length + 1,
    createdAt: new Date()
  };
  coreServices.push(newService);
  
  // Save data to file
  saveData(SERVICES_DATA_FILE, coreServices);
  
  res.status(201).json(newService);
});

app.put('/api/services/:id', authenticateToken, (req, res) => {
  const serviceIndex = coreServices.findIndex(s => s.id === parseInt(req.params.id));
  if (serviceIndex === -1) {
    return res.status(404).json({ message: 'Service not found' });
  }
  
  const { title, description, icon, features, isActive, order } = req.body;
  coreServices[serviceIndex] = {
    ...coreServices[serviceIndex],
    title: title || coreServices[serviceIndex].title,
    description: description || coreServices[serviceIndex].description,
    icon: icon || coreServices[serviceIndex].icon,
    features: features || coreServices[serviceIndex].features,
    isActive: isActive !== undefined ? isActive : coreServices[serviceIndex].isActive,
    order: order !== undefined ? order : coreServices[serviceIndex].order,
    updatedAt: new Date()
  };
  
  // Save data to file
  saveData(SERVICES_DATA_FILE, coreServices);
  
  res.json(coreServices[serviceIndex]);
});

// Upload poster image for service
// 创建一个支持混合字段的multer配置
const posterUpload = multer({ storage: storage }).fields([
  { name: 'posters', maxCount: 10 },
  { name: 'existingImages', maxCount: 1 }
]);

app.post('/api/services/:id/poster', authenticateToken, posterUpload, (req, res) => {
  const serviceIndex = coreServices.findIndex(s => s.id === parseInt(req.params.id));
  if (serviceIndex === -1) {
    return res.status(404).json({ message: 'Service not found' });
  }
  
  const service = coreServices[serviceIndex];
  const templateType = service.templateType || 'vertical';
  const appendMode = req.query.append === 'true'; // 检查是否为追加模式
  
  // 处理现有图片列表（从前端发送的保留图片）
  let existingImages = [];
  if (req.body.existingImages) {
    try {
      existingImages = JSON.parse(req.body.existingImages);
    } catch (error) {
      console.error('解析现有图片列表失败:', error);
    }
  }
  
  // 处理新上传的文件（使用fields后，文件在req.files.posters中）
  const newPosterUrls = req.files && req.files.posters ? req.files.posters.map(file => `/uploads/${file.filename}`) : [];
  
  if (templateType === 'grid' || templateType === 'horizontal' || templateType === 'vertical') {
    // 九宫格模式、横版模式和竖版模式：支持多图片
    if (appendMode && (templateType === 'horizontal' || templateType === 'vertical')) {
      // 横版和竖版模式的追加模式：保留现有图片 + 添加新图片
      service.posterImages = [...existingImages, ...newPosterUrls];
    } else {
      // 替换模式：使用现有图片 + 新图片（如果没有新文件，则只保留现有图片）
      service.posterImages = [...existingImages, ...newPosterUrls];
    }
    service.posterImage = null; // 清空单图字段
  } else {
    // 其他模式（如果有的话）：只取第一张图片
    if (newPosterUrls.length > 0) {
      service.posterImage = newPosterUrls[0];
    } else if (existingImages.length > 0) {
      service.posterImage = existingImages[0];
    } else {
      service.posterImage = null;
    }
    service.posterImages = []; // 清空多图字段
  }
  
  service.updatedAt = new Date();
  
  // Save data to file
  saveData(SERVICES_DATA_FILE, coreServices);
  
  res.json({ 
    message: 'Poster updated successfully',
    service: service,
    posterUrl: service.posterImage || (service.posterImages && service.posterImages[0])
  });
});

app.delete('/api/services/:id', authenticateToken, (req, res) => {
  const serviceIndex = coreServices.findIndex(s => s.id === parseInt(req.params.id));
  if (serviceIndex === -1) {
    return res.status(404).json({ message: 'Service not found' });
  }
  
  coreServices.splice(serviceIndex, 1);
  
  // Save data to file
  saveData(SERVICES_DATA_FILE, coreServices);
  
  res.json({ message: 'Service deleted successfully' });
});

// Core Service Carousel APIs
// Get core service carousel data
app.get('/api/core-service-carousel', (req, res) => {
  res.json(coreServiceCarousel);
});

// Update core service carousel settings
app.put('/api/core-service-carousel', authenticateToken, (req, res) => {
  const { title, isActive, autoPlay, interval } = req.body;
  
  coreServiceCarousel = {
    ...coreServiceCarousel,
    title: title || coreServiceCarousel.title,
    isActive: isActive !== undefined ? isActive : coreServiceCarousel.isActive,
    autoPlay: autoPlay !== undefined ? autoPlay : coreServiceCarousel.autoPlay,
    interval: interval || coreServiceCarousel.interval,
    updatedAt: new Date()
  };
  
  saveData(CORE_SERVICE_CAROUSEL_FILE, coreServiceCarousel);
  res.json(coreServiceCarousel);
});

// Upload images for core service carousel
const carouselUpload = multer({ storage: storage }).array('images', 10);

app.post('/api/core-service-carousel/images', authenticateToken, carouselUpload, (req, res) => {
  try {
    const uploadedImages = [];
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const imageUrl = `/uploads/${file.filename}`;
        uploadedImages.push({
          id: Date.now() + Math.random(),
          url: imageUrl,
          filename: file.filename,
          originalName: file.originalname,
          uploadedAt: new Date()
        });
      });
    }
    
    // Add new images to existing ones
    coreServiceCarousel.images = [...coreServiceCarousel.images, ...uploadedImages];
    coreServiceCarousel.updatedAt = new Date();
    
    saveData(CORE_SERVICE_CAROUSEL_FILE, coreServiceCarousel);
    
    res.json({
      message: 'Images uploaded successfully',
      images: uploadedImages,
      carousel: coreServiceCarousel
    });
  } catch (error) {
    console.error('Error uploading carousel images:', error);
    res.status(500).json({ message: 'Error uploading images' });
  }
});

// Delete image from core service carousel
app.delete('/api/core-service-carousel/images/:imageId', authenticateToken, (req, res) => {
  const imageId = req.params.imageId;
  
  const imageIndex = coreServiceCarousel.images.findIndex(img => img.id.toString() === imageId);
  
  if (imageIndex === -1) {
    return res.status(404).json({ message: 'Image not found' });
  }
  
  // Remove image from array
  const removedImage = coreServiceCarousel.images.splice(imageIndex, 1)[0];
  coreServiceCarousel.updatedAt = new Date();
  
  // Try to delete the physical file
  try {
    const filePath = path.join(UPLOADS_DIR, removedImage.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting physical file:', error);
  }
  
  saveData(CORE_SERVICE_CAROUSEL_FILE, coreServiceCarousel);
  
  res.json({ 
    message: 'Image deleted successfully',
    carousel: coreServiceCarousel
  });
});

// Clear all images from core service carousel
app.delete('/api/core-service-carousel/images', authenticateToken, (req, res) => {
  // Try to delete all physical files
  coreServiceCarousel.images.forEach(image => {
    try {
      const filePath = path.join(UPLOADS_DIR, image.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting physical file:', error);
    }
  });
  
  coreServiceCarousel.images = [];
  coreServiceCarousel.updatedAt = new Date();
  
  saveData(CORE_SERVICE_CAROUSEL_FILE, coreServiceCarousel);
  
  res.json({ 
    message: 'All images cleared successfully',
    carousel: coreServiceCarousel
  });
});

// News API endpoints
app.get('/api/news', (req, res) => {
  try {
    const activeNews = newsData.news.filter(item => item.isActive)
      .sort((a, b) => a.priority - b.priority)
      .slice(0, newsData.settings.maxDisplayItems);
    
    res.json({
      news: activeNews,
      settings: newsData.settings
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/news/:id', (req, res) => {
  try {
    const newsId = parseInt(req.params.id);
    const newsItem = newsData.news.find(item => item.id === newsId);
    
    if (!newsItem) {
      return res.status(404).json({ message: 'News item not found' });
    }
    
    res.json(newsItem);
  } catch (error) {
    console.error('Error fetching news item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/news', authenticateToken, (req, res) => {
  try {
    const { content, type, priority, isActive } = req.body;
    
    // Input validation
    if (!content) {
      return res.status(400).json({ message: '新闻内容不能为空' });
    }
    
    if (!validateInput(content, 1000)) {
      return res.status(400).json({ message: '新闻内容包含非法字符或超出长度限制' });
    }
    
    if (type && !['general', 'award', 'product', 'partnership', 'promotion', 'achievement'].includes(type)) {
      return res.status(400).json({ message: '新闻类型不正确' });
    }
    
    if (priority && (priority < 1 || priority > 10)) {
      return res.status(400).json({ message: '优先级必须在1-10之间' });
    }
    
    const newId = Math.max(...newsData.news.map(item => item.id), 0) + 1;
    const newNewsItem = {
      id: newId,
      content: sanitizeInput(content),
      type: type || 'general',
      priority: priority || newsData.news.length + 1,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString()
    };
    
    newsData.news.push(newNewsItem);
    saveData(NEWS_DATA_FILE, newsData);
    
    res.status(201).json(newNewsItem);
  } catch (error) {
    console.error('Error creating news item:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

app.put('/api/news/:id', authenticateToken, (req, res) => {
  try {
    const newsId = parseInt(req.params.id);
    const { content, type, priority, isActive } = req.body;
    
    const newsIndex = newsData.news.findIndex(item => item.id === newsId);
    if (newsIndex === -1) {
      return res.status(404).json({ message: 'News item not found' });
    }
    
    if (content !== undefined) newsData.news[newsIndex].content = content;
    if (type !== undefined) newsData.news[newsIndex].type = type;
    if (priority !== undefined) newsData.news[newsIndex].priority = priority;
    if (isActive !== undefined) newsData.news[newsIndex].isActive = isActive;
    newsData.news[newsIndex].updatedAt = new Date().toISOString();
    
    saveData(NEWS_DATA_FILE, newsData);
    
    res.json(newsData.news[newsIndex]);
  } catch (error) {
    console.error('Error updating news item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/news/:id', authenticateToken, (req, res) => {
  try {
    const newsId = parseInt(req.params.id);
    const newsIndex = newsData.news.findIndex(item => item.id === newsId);
    
    if (newsIndex === -1) {
      return res.status(404).json({ message: 'News item not found' });
    }
    
    newsData.news.splice(newsIndex, 1);
    saveData(NEWS_DATA_FILE, newsData);
    
    res.json({ message: 'News item deleted successfully' });
  } catch (error) {
    console.error('Error deleting news item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/news-settings', authenticateToken, (req, res) => {
  try {
    const { scrollSpeed, maxDisplayItems, autoRefresh, refreshInterval, animationDelay } = req.body;
    
    if (scrollSpeed !== undefined) newsData.settings.scrollSpeed = scrollSpeed;
    if (maxDisplayItems !== undefined) newsData.settings.maxDisplayItems = maxDisplayItems;
    if (autoRefresh !== undefined) newsData.settings.autoRefresh = autoRefresh;
    if (refreshInterval !== undefined) newsData.settings.refreshInterval = refreshInterval;
    if (animationDelay !== undefined) newsData.settings.animationDelay = animationDelay;
    
    saveData(NEWS_DATA_FILE, newsData);
    
    res.json(newsData.settings);
  } catch (error) {
    console.error('Error updating news settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalPosts: samplePosts.length,
    totalPartners: samplePartners.length,
    totalAiResources: aiResources.length,
    totalServices: coreServices.length,
    activeAiResources: aiResources.filter(r => r.isActive).length,
    activeServices: coreServices.filter(s => s.isActive).length
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 XUELONG AI Server is running on port ${PORT}`);
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;