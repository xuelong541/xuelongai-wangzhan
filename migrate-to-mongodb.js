/**
 * 数据迁移脚本 - 将本地JSON数据迁移到MongoDB Atlas
 * 使用方法: node migrate-to-mongodb.js
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// MongoDB连接
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xuelongai';

// 定义数据模型
const CompanySchema = new mongoose.Schema({
  name: String,
  description: String,
  founded: Date,
  location: String,
  website: String,
  logo: String,
  employees: Number,
  industry: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ServiceSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  price: Number,
  features: [String],
  image: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const NewsSchema = new mongoose.Schema({
  title: String,
  content: String,
  summary: String,
  author: String,
  category: String,
  tags: [String],
  image: String,
  publishedAt: Date,
  isPublished: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const FounderSchema = new mongoose.Schema({
  name: String,
  title: String,
  bio: String,
  avatar: String,
  email: String,
  linkedin: String,
  twitter: String,
  experience: [{
    company: String,
    position: String,
    duration: String,
    description: String
  }],
  education: [{
    institution: String,
    degree: String,
    year: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    bio: String
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// 创建模型
const Company = mongoose.model('Company', CompanySchema);
const Service = mongoose.model('Service', ServiceSchema);
const News = mongoose.model('News', NewsSchema);
const Founder = mongoose.model('Founder', FounderSchema);
const User = mongoose.model('User', UserSchema);

// 读取JSON文件的辅助函数
function readJSONFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } else {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ 读取文件失败 ${filePath}:`, error.message);
    return null;
  }
}

// 迁移函数
async function migrateData() {
  try {
    console.log('🚀 开始连接MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB连接成功!');

    // 清空现有数据（可选）
    const clearExisting = process.argv.includes('--clear');
    if (clearExisting) {
      console.log('🗑️  清空现有数据...');
      await Company.deleteMany({});
      await Service.deleteMany({});
      await News.deleteMany({});
      await Founder.deleteMany({});
      await User.deleteMany({});
      console.log('✅ 现有数据已清空');
    }

    // 迁移公司信息
    const companyData = readJSONFile(path.join(__dirname, 'server/data/company.json'));
    if (companyData) {
      console.log('📊 迁移公司信息...');
      const company = new Company(companyData);
      await company.save();
      console.log('✅ 公司信息迁移完成');
    }

    // 迁移服务信息
    const servicesData = readJSONFile(path.join(__dirname, 'server/data/services.json'));
    if (servicesData && Array.isArray(servicesData)) {
      console.log('🛠️  迁移服务信息...');
      await Service.insertMany(servicesData);
      console.log(`✅ ${servicesData.length}个服务迁移完成`);
    }

    // 迁移新闻信息
    const newsData = readJSONFile(path.join(__dirname, 'server/data/news.json'));
    if (newsData && Array.isArray(newsData)) {
      console.log('📰 迁移新闻信息...');
      const newsWithDates = newsData.map(item => ({
        ...item,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date()
      }));
      await News.insertMany(newsWithDates);
      console.log(`✅ ${newsData.length}条新闻迁移完成`);
    }

    // 迁移创始人信息
    const founderData = readJSONFile(path.join(__dirname, 'server/data/founder.json'));
    if (founderData) {
      console.log('👤 迁移创始人信息...');
      const founder = new Founder(founderData);
      await founder.save();
      console.log('✅ 创始人信息迁移完成');
    }

    // 创建管理员用户
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      console.log('👨‍💼 创建管理员用户...');
      const adminUser = new User({
        username: process.env.ADMIN_USERNAME || 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@xuelongai.com',
        passwordHash: process.env.ADMIN_PASSWORD_HASH || '$2a$10$defaulthash',
        role: 'admin',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'System Administrator'
        }
      });
      await adminUser.save();
      console.log('✅ 管理员用户创建完成');
    } else {
      console.log('ℹ️  管理员用户已存在，跳过创建');
    }

    // 显示迁移统计
    console.log('\n📈 迁移统计:');
    console.log(`   公司: ${await Company.countDocuments()} 条`);
    console.log(`   服务: ${await Service.countDocuments()} 条`);
    console.log(`   新闻: ${await News.countDocuments()} 条`);
    console.log(`   创始人: ${await Founder.countDocuments()} 条`);
    console.log(`   用户: ${await User.countDocuments()} 条`);

    console.log('\n🎉 数据迁移完成!');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已关闭');
  }
}

// 导出数据到JSON（备份功能）
async function exportData() {
  try {
    console.log('📤 开始导出数据...');
    await mongoose.connect(MONGODB_URI);

    const exportDir = path.join(__dirname, 'backup');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // 导出各种数据
    const company = await Company.findOne();
    const services = await Service.find();
    const news = await News.find();
    const founders = await Founder.find();
    const users = await User.find().select('-passwordHash'); // 不导出密码

    // 写入文件
    if (company) fs.writeFileSync(path.join(exportDir, 'company.json'), JSON.stringify(company, null, 2));
    if (services.length) fs.writeFileSync(path.join(exportDir, 'services.json'), JSON.stringify(services, null, 2));
    if (news.length) fs.writeFileSync(path.join(exportDir, 'news.json'), JSON.stringify(news, null, 2));
    if (founders.length) fs.writeFileSync(path.join(exportDir, 'founders.json'), JSON.stringify(founders, null, 2));
    if (users.length) fs.writeFileSync(path.join(exportDir, 'users.json'), JSON.stringify(users, null, 2));

    console.log(`✅ 数据已导出到 ${exportDir} 目录`);
    
  } catch (error) {
    console.error('❌ 导出失败:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// 主函数
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'migrate':
      await migrateData();
      break;
    case 'export':
      await exportData();
      break;
    default:
      console.log('📖 使用方法:');
      console.log('  node migrate-to-mongodb.js migrate [--clear]  # 迁移数据到MongoDB');
      console.log('  node migrate-to-mongodb.js export             # 从MongoDB导出数据');
      console.log('');
      console.log('环境变量:');
      console.log('  MONGODB_URI - MongoDB连接字符串');
      console.log('  ADMIN_USERNAME - 管理员用户名');
      console.log('  ADMIN_EMAIL - 管理员邮箱');
      console.log('  ADMIN_PASSWORD_HASH - 管理员密码哈希');
      break;
  }
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  Company,
  Service,
  News,
  Founder,
  User,
  migrateData,
  exportData
};