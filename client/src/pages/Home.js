import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import ServiceDetail from '../components/ServiceDetail';
import { 
  Calendar, User, Sparkles, Code, 
  Award, ChevronRight, Star, Globe, Smartphone,
  Monitor, Cpu, Database, Cloud, Mail, Phone, MessageSquare, Send
} from 'lucide-react';

// 动态图片轮播组件
const ServiceImageCarousel = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [carouselData, setCarouselData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取核心服务轮播数据
    const fetchCarouselData = async () => {
      try {
        const response = await axios.get('/api/core-service-carousel');
        setCarouselData(response.data);
      } catch (error) {
        console.error('Error fetching carousel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, []);

  useEffect(() => {
    if (carouselData && carouselData.images && carouselData.images.length > 1 && carouselData.autoPlay) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % carouselData.images.length);
      }, carouselData.interval || 3000);
      return () => clearInterval(interval);
    }
  }, [carouselData]);

  if (loading) {
    return (
      <div className="services-image-container">
        <div className="services-overview-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
          加载中...
        </div>
      </div>
    );
  }

  if (!carouselData || !carouselData.images || carouselData.images.length === 0) {
    return (
      <img 
        src="/services-overview.svg" 
        alt="雪珑AI核心服务" 
        className="services-overview-image"
      />
    );
  }

  return (
    <motion.div 
      className="services-carousel-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.img
        key={currentImageIndex}
        src={carouselData.images[currentImageIndex].url}
        alt={`核心服务轮播图片 ${currentImageIndex + 1}`}
        className="services-overview-image carousel-image"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      />
      {carouselData.images.length > 1 && (
        <div className="carousel-indicators">
          {carouselData.images.map((_, index) => (
            <button
              key={index}
              className={`carousel-indicator ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`切换到第${index + 1}张图片`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [companyInfo, setCompanyInfo] = useState({});
  const [founderInfo, setFounderInfo] = useState({});
  const [companyIntro, setCompanyIntro] = useState({});
  const [aiResources, setAiResources] = useState([]);
  const [services, setServices] = useState([]);
  const [newsItems, setNewsItems] = useState([]);
  const [newsSettings, setNewsSettings] = useState({ animationDelay: 0.8 });
  const [loading, setLoading] = useState(true);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [showServiceDetail, setShowServiceDetail] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [postsRes, partnersRes, companyRes, founderRes, introRes, aiRes, servicesRes, newsRes] = await Promise.all([
        axios.get('/api/posts'),
        axios.get('/api/partners'),
        axios.get('/api/company'),
        axios.get('/api/founder'),
        axios.get('/api/company-intro'),
        axios.get('/api/ai-resources'),
        axios.get('/api/services'),
        axios.get('/api/news')
      ]);
      
      setPosts(postsRes.data);
      setPartners(partnersRes.data);
      setCompanyInfo(companyRes.data);
      setFounderInfo(founderRes.data);
      setCompanyIntro(introRes.data);
      setAiResources(aiRes.data.filter(resource => resource.isActive));
      setServices(servicesRes.data.filter(service => service.isActive));
      setNewsItems(newsRes.data.news || []);
      setNewsSettings(newsRes.data.settings || { animationDelay: 0.8 });
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleServiceDetail = (serviceId) => {
    setSelectedServiceId(serviceId);
    setShowServiceDetail(true);
  };

  const closeServiceDetail = () => {
    setShowServiceDetail(false);
    setSelectedServiceId(null);
  };

  return (
    <div className="xuelong-home">
      {/* Hero Section - 全屏主视觉 */}
      <motion.section 
        className="hero-fullscreen"
        style={{ paddingTop: '80px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="hero-particles"></div>
        </div>
        
        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="logo-section">
              <img src="/logo.svg" alt="XUELONG AI" className="logo-icon" />
              <div className="title-container">
                <h1 className="main-title">{companyInfo.name || 'XUELONG AI'}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="title-accent">{companyInfo.subtitle || '雪珑人工智能设计工作室'}</span>
                  <motion.button 
                    className="btn-hero secondary"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ 
                      fontSize: '1rem', 
                      padding: '8px 16px',
                      height: 'auto',
                      lineHeight: '1.2',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    引领智能工作新方式
                  </motion.button>
                </div>

              </div>
            </div>
            
            {/* 滚动新闻 */}
            <motion.div
              className="news-ticker"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: newsSettings.animationDelay || 0.8 }}
            >
              <div className="news-ticker-wrapper">
                <div className="news-ticker-content">
                  {newsItems.length > 0 ? (
                    newsItems.map((news, index) => (
                      <span key={index} className="news-item">
                        {news.icon} {news.content}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="news-item">🎉 雪珑AI荣获2024年度最佳AI设计工作室奖</span>
                      <span className="news-item">🚀 新推出智能UI设计助手，提升设计效率300%</span>
                      <span className="news-item">💡 与知名企业达成战略合作，共建AI设计生态</span>
                      <span className="news-item">🔥 AI培训课程火热报名中，限时优惠50%</span>
                      <span className="news-item">⭐ 客户满意度达98%，服务质量行业领先</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        <div className="scroll-indicator">
          <motion.div 
            className="scroll-arrow"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronRight size={24} style={{ transform: 'rotate(90deg)' }} />
          </motion.div>
        </div>
      </motion.section>

      {/* 关于雪珑AI */}
      <section className="about-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">关于雪珑AI</h2>
            <p className="section-subtitle">专注于人工智能技术研发与应用的创新型工作室</p>
          </motion.div>
          
          <div className="about-content">
            <div className="about-main-row">
              <motion.div 
                className="about-text"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="about-card">
                  <h3>技术创新</h3>
                  <div className="innovation-content">
                    <div className="founder-section">
                      <div className="founder-photo">
                        <img src={founderInfo.photo || "/founder-photo.svg"} alt="雪珑AI创始人" className="founder-image" />
                      </div>
                      <div className="founder-info">
                        <h4>{founderInfo.name || '张雪珑'}</h4>
                        <p className="founder-title">{founderInfo.title || '创始人 & 首席技术官'}</p>
                        <p className="founder-description">
                          {founderInfo.description || '清华大学计算机科学博士，专注AI技术研发10余年，曾在顶级科技公司担任AI架构师，拥有多项AI专利。'}
                        </p>
                      </div>
                    </div>
                    <div className="company-intro">
                      {companyIntro.paragraphs && companyIntro.paragraphs.length > 0 ? (
                        companyIntro.paragraphs.map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))
                      ) : (
                        <>
                          <p>
                            雪珑AI工作室致力于推动人工智能技术的前沿发展，
                            专注于机器学习、深度学习、自然语言处理等核心技术领域。
                            我们以技术创新为驱动，为客户提供最前沿的AI解决方案，
                            助力企业数字化转型和智能化升级。
                          </p>
                          <p>
                            工作室汇聚了来自清华、北大、中科院等顶尖院校的AI专家，
                            拥有深厚的理论基础和丰富的实践经验，
                            致力于将最新的AI研究成果转化为实际应用。
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                className="ai-tools-section"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="ai-tools-card">
                  <h3>AI资源</h3>
                  <div className="ai-tools-list">
                    {aiResources.length > 0 ? (
                      aiResources.map((resource, index) => (
                        <div key={index} className="ai-tool-item">
                          • <a href={resource.url} target="_blank" rel="noopener noreferrer" className="ai-tool-link">
                            {resource.name}
                          </a> - {resource.description}
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="ai-tool-item">• <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="ai-tool-link">ChatGPT</a> - 智能对话助手，支持多轮对话和代码生成</div>
                        <div className="ai-tool-item">• <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="ai-tool-link">Claude</a> - 高质量文本分析和创作工具</div>
                        <div className="ai-tool-item">• <a href="https://midjourney.com" target="_blank" rel="noopener noreferrer" className="ai-tool-link">Midjourney</a> - 专业AI图像生成和艺术创作平台</div>
                        <div className="ai-tool-item">• <a href="https://github.com/features/copilot" target="_blank" rel="noopener noreferrer" className="ai-tool-link">GitHub Copilot</a> - 智能代码补全和编程助手</div>
                        <div className="ai-tool-item">• <a href="https://tensorflow.org" target="_blank" rel="noopener noreferrer" className="ai-tool-link">TensorFlow</a> - 开源机器学习框架和模型训练</div>
                        <div className="ai-tool-item">• <a href="https://pytorch.org" target="_blank" rel="noopener noreferrer" className="ai-tool-link">PyTorch</a> - 深度学习研究和生产部署平台</div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
            

          </div>
        </div>
      </section>

      {/* 核心服务展示 */}
      <section className="services-overview-section">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title">核心服务</h2>
            <p className="section-subtitle">
              全方位AI服务生态，从培训到开发，从合作到资讯
            </p>
          </motion.div>
          
          <motion.div
            className="services-overview-content"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="services-image-container">
              <ServiceImageCarousel />
            </div>
            
            <div className="services-description">
              <div className="service-highlights">
                {services.length > 0 ? (
                  services.map((service, index) => (
                    <motion.div 
                      key={service.id}
                      className="highlight-item"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="highlight-icon">
                        {service.icon === 'Code' && <Code size={24} />}
                        {service.icon === 'Monitor' && <Monitor size={24} />}
                        {service.icon === 'Award' && <Award size={24} />}
                        {!['Code', 'Monitor', 'Award'].includes(service.icon) && <Code size={24} />}
                      </div>
                      <div className="highlight-content">
                        <h4 
                          className="service-title-btn"
                          onClick={() => handleServiceDetail(service.id)}
                        >
                          {service.title}
                        </h4>
                        <p>{service.description}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <>
                    <motion.div 
                      className="highlight-item"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <div className="highlight-icon">
                        <Code size={24} />
                      </div>
                      <div className="highlight-content">
                        <h4>专业AI培训</h4>
                        <p>从基础到进阶，全面的人工智能课程体系</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="highlight-item"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <div className="highlight-icon">
                        <Monitor size={24} />
                      </div>
                      <div className="highlight-content">
                        <h4>定制项目开发</h4>
                        <p>量身打造的AI解决方案，满足您的业务需求</p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      className="highlight-item"
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <div className="highlight-icon">
                        <Award size={24} />
                      </div>
                      <div className="highlight-content">
                        <h4>校企合作</h4>
                        <p>与高等院校建立深度合作关系，共同推进AI人才培养</p>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
              

            </div>
          </motion.div>
        </div>
      </section>

       {/* 联系我们 */}
       <section className="contact-section">
         <div className="container">
           <motion.div
             className="contact-content"
             initial={{ opacity: 0, y: 50 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
           >
             <div className="contact-text">
               <h2>开启AI合作之旅</h2>
               <p>
                 无论您是想学习AI技术，还是需要定制化的AI解决方案，
                 雪珑AI工作室都将是您最佳的合作伙伴。
               </p>
               <div className="contact-info">
                 <div className="contact-item">
                   <strong>邮箱：</strong>{companyInfo.email || 'contact@xuelongai.com'}
                 </div>
                 <div className="contact-item">
                   <strong>电话：</strong>{companyInfo.phone || '400-888-9999'}
                 </div>
                 <div className="contact-item">
                   <strong>地址：</strong>{companyInfo.address || '北京市海淀区中关村科技园'}
                 </div>
               </div>
             </div>
           </motion.div>
         </div>
       </section>

       {/* Service Detail Modal */}
       {showServiceDetail && (
         <ServiceDetail 
           serviceId={selectedServiceId}
           onClose={closeServiceDetail}
         />
       )}
     </div>
   );
 };
 
 export default Home;