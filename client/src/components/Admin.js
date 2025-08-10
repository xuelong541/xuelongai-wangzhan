import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('company');
  const [companyInfo, setCompanyInfo] = useState({});
  const [founderInfo, setFounderInfo] = useState({});
  const [companyIntro, setCompanyIntro] = useState({});
  const [aiResources, setAiResources] = useState([]);
  const [services, setServices] = useState([]);
  const [coreServiceCarousel, setCoreServiceCarousel] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [newsSettings, setNewsSettings] = useState({});
  // const [posts, setPosts] = useState([]);
  // const [partners, setPartners] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [companyRes, founderRes, introRes, aiRes, servicesRes, carouselRes, postsRes, partnersRes, statsRes, newsRes] = await Promise.all([
        axios.get('/api/company'),
        axios.get('/api/founder'),
        axios.get('/api/company-intro'),
        axios.get('/api/ai-resources'),
        axios.get('/api/services'),
        axios.get('/api/core-service-carousel'),
        axios.get('/api/posts'),
        axios.get('/api/partners'),
        axios.get('/api/dashboard/stats'),
        axios.get('/api/news')
      ]);
      
      setCompanyInfo(companyRes.data);
      setFounderInfo(founderRes.data);
      setCompanyIntro(introRes.data);
      setAiResources(aiRes.data);
      setServices(servicesRes.data);
      setCoreServiceCarousel(carouselRes.data);
      setNewsItems(newsRes.data.news || []);
      setNewsSettings(newsRes.data.settings || {});
      // setPosts(postsRes.data);
      // setPartners(partnersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const updateCompanyInfo = async (data) => {
    try {
      await axios.put('/api/company', data);
      setCompanyInfo(data);
      showMessage('公司信息更新成功');
    } catch (error) {
      showMessage('更新失败');
    }
  };

  const updateFounderInfo = async (data) => {
    try {
      await axios.put('/api/founder', data);
      setFounderInfo(data);
      showMessage('创始人信息更新成功');
    } catch (error) {
      showMessage('更新失败');
    }
  };

  const updateCompanyIntro = async (data) => {
    try {
      await axios.put('/api/company-intro', data);
      setCompanyIntro(data);
      showMessage('公司介绍更新成功');
    } catch (error) {
      showMessage('更新失败');
    }
  };

  const addAiResource = async (resource) => {
    try {
      const response = await axios.post('/api/ai-resources', resource);
      setAiResources([...aiResources, response.data]);
      showMessage('AI资源添加成功');
    } catch (error) {
      showMessage('添加失败');
    }
  };

  const updateAiResource = async (id, resource) => {
    try {
      const response = await axios.put(`/api/ai-resources/${id}`, resource);
      setAiResources(aiResources.map(r => r.id === id ? response.data : r));
      showMessage('AI资源更新成功');
    } catch (error) {
      showMessage('更新失败');
    }
  };

  const deleteAiResource = async (id) => {
    try {
      await axios.delete(`/api/ai-resources/${id}`);
      setAiResources(aiResources.filter(r => r.id !== id));
      showMessage('AI资源删除成功');
    } catch (error) {
      showMessage('删除失败');
    }
  };

  const addService = async (service) => {
    try {
      const response = await axios.post('/api/services', service);
      setServices([...services, response.data]);
      showMessage('服务添加成功');
    } catch (error) {
      showMessage('添加失败');
    }
  };

  const updateService = async (id, service) => {
    try {
      const response = await axios.put(`/api/services/${id}`, service);
      setServices(services.map(s => s.id === id ? response.data : s));
      showMessage('服务更新成功');
    } catch (error) {
      showMessage('更新失败');
    }
  };

  const deleteService = async (id) => {
    try {
      await axios.delete(`/api/services/${id}`);
      setServices(services.filter(s => s.id !== id));
      showMessage('服务删除成功');
    } catch (error) {
      showMessage('删除失败');
    }
  };

  // 新闻管理函数
  const addNews = async (news) => {
    try {
      const response = await axios.post('/api/news', news);
      setNewsItems([...newsItems, response.data]);
      showMessage('新闻添加成功');
    } catch (error) {
      showMessage('添加失败');
    }
  };

  const updateNews = async (id, news) => {
    try {
      const response = await axios.put(`/api/news/${id}`, news);
      setNewsItems(newsItems.map(n => n.id === id ? response.data : n));
      showMessage('新闻更新成功');
    } catch (error) {
      showMessage('更新失败');
    }
  };

  const deleteNews = async (id) => {
    try {
      await axios.delete(`/api/news/${id}`);
      setNewsItems(newsItems.filter(n => n.id !== id));
      showMessage('新闻删除成功');
    } catch (error) {
      showMessage('删除失败');
    }
  };

  const updateNewsSettings = async (settings) => {
    try {
      const response = await axios.put('/api/news-settings', settings);
      setNewsSettings(response.data);
      showMessage('新闻设置更新成功');
    } catch (error) {
      showMessage('设置更新失败');
    }
  };

  // 轮播图片管理函数
  const updateCarouselSettings = async (settings) => {
    try {
      const response = await axios.put('/api/core-service-carousel', settings);
      setCoreServiceCarousel(response.data);
      showMessage('轮播设置更新成功');
    } catch (error) {
      showMessage('更新失败');
    }
  };

  const uploadCarouselImages = async (files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await axios.post('/api/core-service-carousel/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setCoreServiceCarousel(response.data.carousel);
      showMessage(`成功上传 ${response.data.images.length} 张图片`);
    } catch (error) {
      showMessage('图片上传失败');
    }
  };

  const deleteCarouselImage = async (imageId) => {
    try {
      const response = await axios.delete(`/api/core-service-carousel/images/${imageId}`);
      setCoreServiceCarousel(response.data.carousel);
      showMessage('图片删除成功');
    } catch (error) {
      showMessage('删除失败');
    }
  };

  const clearCarouselImages = async () => {
    try {
      const response = await axios.delete('/api/core-service-carousel/images');
      setCoreServiceCarousel(response.data.carousel);
      showMessage('所有图片已清空');
    } catch (error) {
      showMessage('清空失败');
    }
  };

  const renderCompanyTab = () => (
    <div className="admin-section">
      <h3>公司信息管理</h3>
      <CompanyForm 
        data={companyInfo} 
        onSubmit={updateCompanyInfo}
      />
    </div>
  );

  const renderFounderTab = () => (
    <div className="admin-section">
      <h3>创始人信息管理</h3>
      <FounderForm 
        data={founderInfo} 
        onSubmit={updateFounderInfo}
      />
    </div>
  );

  const renderIntroTab = () => (
    <div className="admin-section">
      <h3>公司介绍管理</h3>
      <IntroForm 
        data={companyIntro} 
        onSubmit={updateCompanyIntro}
      />
    </div>
  );

  const renderAiResourcesTab = () => (
    <div className="admin-section">
      <h3>AI资源管理</h3>
      <AiResourcesManager 
        resources={aiResources}
        onAdd={addAiResource}
        onUpdate={updateAiResource}
        onDelete={deleteAiResource}
      />
    </div>
  );

  const renderServicesTab = () => (
    <div className="admin-section">
      <h3>核心服务管理</h3>
      <ServicesManager 
        services={services}
        onAdd={addService}
        onUpdate={updateService}
        onDelete={deleteService}
      />
    </div>
  );

  const renderCarouselTab = () => (
    <div className="admin-section">
      <h3>核心服务轮播图片管理</h3>
      <CoreServiceCarouselManager 
        carouselData={coreServiceCarousel}
        onUpdate={updateCarouselSettings}
        onUploadImages={uploadCarouselImages}
        onDeleteImage={deleteCarouselImage}
        onClearImages={clearCarouselImages}
      />
    </div>
  );

  const renderNewsTab = () => (
    <div className="admin-section">
      <h3>滚动新闻管理</h3>
      <NewsManager 
        newsItems={newsItems}
        newsSettings={newsSettings}
        onAdd={addNews}
        onUpdate={updateNews}
        onDelete={deleteNews}
        onUpdateSettings={updateNewsSettings}
      />
    </div>
  );

  const renderDashboardTab = () => (
    <div className="admin-section">
      <h3>数据统计</h3>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>文章总数</h4>
          <p>{stats.totalPosts}</p>
        </div>
        <div className="stat-card">
          <h4>合作伙伴</h4>
          <p>{stats.totalPartners}</p>
        </div>
        <div className="stat-card">
          <h4>AI资源</h4>
          <p>{stats.totalAiResources}</p>
        </div>
        <div className="stat-card">
          <h4>核心服务</h4>
          <p>{stats.totalServices}</p>
        </div>
        <div className="stat-card">
          <h4>活跃AI资源</h4>
          <p>{stats.activeAiResources}</p>
        </div>
        <div className="stat-card">
          <h4>活跃服务</h4>
          <p>{stats.activeServices}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>雪龙AI后台管理系统</h1>
        {message && <div className="message">{message}</div>}
      </div>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          数据统计
        </button>
        <button 
          className={activeTab === 'company' ? 'active' : ''}
          onClick={() => setActiveTab('company')}
        >
          公司信息
        </button>
        <button 
          className={activeTab === 'founder' ? 'active' : ''}
          onClick={() => setActiveTab('founder')}
        >
          创始人信息
        </button>
        <button 
          className={activeTab === 'intro' ? 'active' : ''}
          onClick={() => setActiveTab('intro')}
        >
          公司介绍
        </button>
        <button 
          className={activeTab === 'ai-resources' ? 'active' : ''}
          onClick={() => setActiveTab('ai-resources')}
        >
          AI资源
        </button>
        <button 
          className={activeTab === 'services' ? 'active' : ''}
          onClick={() => setActiveTab('services')}
        >
          核心服务
        </button>
        <button 
          className={activeTab === 'carousel' ? 'active' : ''}
          onClick={() => setActiveTab('carousel')}
        >
          轮播图片
        </button>
        <button 
          className={activeTab === 'news' ? 'active' : ''}
          onClick={() => setActiveTab('news')}
        >
          滚动新闻
        </button>
      </div>

      <div className="admin-content">
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboardTab()}
            {activeTab === 'company' && renderCompanyTab()}
            {activeTab === 'founder' && renderFounderTab()}
            {activeTab === 'intro' && renderIntroTab()}
            {activeTab === 'ai-resources' && renderAiResourcesTab()}
            {activeTab === 'services' && renderServicesTab()}
            {activeTab === 'carousel' && renderCarouselTab()}
            {activeTab === 'news' && renderNewsTab()}
          </>
        )}
      </div>
    </div>
  );
};

// Company Form Component
const CompanyForm = ({ data, onSubmit }) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-group">
        <label>公司名称</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>副标题</label>
        <input
          type="text"
          value={formData.subtitle || ''}
          onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>标语</label>
        <input
          type="text"
          value={formData.slogan || ''}
          onChange={(e) => setFormData({...formData, slogan: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>公司描述</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>地址</label>
        <input
          type="text"
          value={formData.address || ''}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>电话</label>
        <input
          type="text"
          value={formData.phone || ''}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>邮箱</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>
      <button type="submit" className="btn-primary">更新公司信息</button>
    </form>
  );
};

// Founder Form Component
const FounderForm = ({ data, onSubmit }) => {
  const [formData, setFormData] = useState(data);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    setFormData(data);
    setPhotoPreview(data.photo);
  }, [data]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (photoFile) {
      // 如果有新上传的文件，使用FormData
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name || '');
      formDataToSend.append('title', formData.title || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('photo', photoFile);
      
      try {
        await axios.put('/api/founder', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        // 重新加载数据
        window.location.reload();
      } catch (error) {
        console.error('更新失败:', error);
      }
    } else {
      // 没有新文件，使用原来的方式
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-group">
        <label>姓名</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>职位</label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>描述</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
      <div className="form-group">
        <label>照片</label>
        {photoPreview && (
          <div style={{ marginBottom: '10px' }}>
            <img 
              src={photoPreview.startsWith('/uploads') ? `http://localhost:5000${photoPreview}` : photoPreview} 
              alt="创始人照片预览" 
              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          style={{ marginBottom: '10px' }}
        />
        <div style={{ fontSize: '12px', color: '#666' }}>
          支持 JPG、PNG、GIF 格式，建议尺寸 200x200 像素
        </div>
      </div>
      <button type="submit" className="btn-primary">更新创始人信息</button>
    </form>
  );
};

// Company Intro Form Component
const IntroForm = ({ data, onSubmit }) => {
  const [formData, setFormData] = useState(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateParagraph = (index, value) => {
    const newParagraphs = [...(formData.paragraphs || [])];
    newParagraphs[index] = value;
    setFormData({...formData, paragraphs: newParagraphs});
  };

  const addParagraph = () => {
    const newParagraphs = [...(formData.paragraphs || []), ''];
    setFormData({...formData, paragraphs: newParagraphs});
  };

  const removeParagraph = (index) => {
    const newParagraphs = formData.paragraphs.filter((_, i) => i !== index);
    setFormData({...formData, paragraphs: newParagraphs});
  };

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <div className="form-group">
        <label>公司介绍段落</label>
        {(formData.paragraphs || []).map((paragraph, index) => (
          <div key={index} className="paragraph-input">
            <textarea
              value={paragraph}
              onChange={(e) => updateParagraph(index, e.target.value)}
              placeholder={`段落 ${index + 1}`}
            />
            <button 
              type="button" 
              onClick={() => removeParagraph(index)}
              className="btn-danger"
            >
              删除
            </button>
          </div>
        ))}
        <button type="button" onClick={addParagraph} className="btn-secondary">
          添加段落
        </button>
      </div>
      <button type="submit" className="btn-primary">更新公司介绍</button>
    </form>
  );
};

// AI Resources Manager Component
const AiResourcesManager = ({ resources, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    url: '',
    isActive: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingResource) {
      onUpdate(editingResource.id, formData);
      setEditingResource(null);
    } else {
      onAdd(formData);
    }
    setFormData({ name: '', description: '', category: '', url: '', isActive: true });
    setShowForm(false);
  };

  const handleEdit = (resource) => {
    setEditingResource(resource);
    setFormData(resource);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingResource(null);
    setFormData({ name: '', description: '', category: '', url: '', isActive: true });
  };

  return (
    <div>
      <div className="section-header">
        <button 
          onClick={() => setShowForm(true)} 
          className="btn-primary"
        >
          添加AI资源
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>分类</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>链接</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({...formData, url: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              激活状态
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingResource ? '更新' : '添加'}
            </button>
            <button type="button" onClick={handleCancel} className="btn-secondary">
              取消
            </button>
          </div>
        </form>
      )}

      <div className="resources-list">
        {resources.map(resource => (
          <div key={resource.id} className="resource-item">
            <div className="resource-info">
              <h4>{resource.name}</h4>
              <p>{resource.description}</p>
              <span className={`status ${resource.isActive ? 'active' : 'inactive'}`}>
                {resource.isActive ? '激活' : '未激活'}
              </span>
            </div>
            <div className="resource-actions">
              <button onClick={() => handleEdit(resource)} className="btn-secondary">
                编辑
              </button>
              <button onClick={() => onDelete(resource.id)} className="btn-danger">
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Services Manager Component
const ServicesManager = ({ services, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    templateType: 'vertical'
  });
  
  // 简化状态管理：使用单一状态存储所有图片信息
  const [images, setImages] = useState([]); // 统一的图片状态
  // 图片对象结构：{ id, url, file, isExisting }
  // isExisting: true表示服务器已有图片，false表示新添加的图片

  const handlePosterChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const processFiles = async () => {
      const newImagePromises = files.map((file, index) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (readerEvent) => {
            resolve({
              id: Date.now() + index,
              url: readerEvent.target.result,
              file: file,
              isExisting: false
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      
      try {
        const newImages = await Promise.all(newImagePromises);
        
        // 竖版模板：支持多图增量添加
        if (formData.templateType === 'vertical') {
          if (editingService) {
            // 编辑模式：追加到现有图片
            setImages(prevImages => [...prevImages, ...newImages]);
          } else {
            // 新建模式：替换图片
            setImages(newImages);
          }
        } else if (formData.templateType === 'horizontal' && editingService) {
          // 横版编辑模式：增量添加
          setImages(prevImages => [...prevImages, ...newImages]);
        } else {
          // 其他情况：替换所有图片
          setImages(newImages);
        }
        
        console.log('图片处理完成，当前图片数量:', images.length + newImages.length);
      } catch (error) {
        console.error('图片处理失败:', error);
        alert('图片处理失败，请重新选择');
      }
    };
    
    processFiles();
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages(prevImages => 
      prevImages.filter((_, index) => index !== indexToRemove)
    );
    console.log('删除图片，剩余图片数量:', images.length - 1);
  };

  const handleClearAllImages = () => {
    if (window.confirm('确定要清空所有图片吗？此操作不可撤销。')) {
      setImages([]);
      console.log('清空所有图片');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 检查是否有图片（新增模式需要图片）
    if (images.length === 0 && !editingService) {
      alert('请选择海报图片');
      return;
    }

    const serviceData = {
      title: formData.title,
      templateType: formData.templateType,
      isActive: true,
      order: 1
    };

    if (editingService) {
      // 编辑现有服务
      try {
        const posterFormData = new FormData();
        
        // 分离现有图片和新图片
        const existingImages = images.filter(img => img.isExisting).map(img => img.url);
        const newFiles = images.filter(img => !img.isExisting && img.file);
        
        // 添加新文件
        newFiles.forEach(img => {
          posterFormData.append('posters', img.file);
        });
        
        // 发送保留的现有图片列表
        if (existingImages.length > 0) {
          posterFormData.append('existingImages', JSON.stringify(existingImages));
        }
        
        // 竖版和横版模板支持追加模式
        const isAppendMode = (formData.templateType === 'vertical' || formData.templateType === 'horizontal');
        
        const url = isAppendMode 
          ? `/api/services/${editingService.id}/poster?append=true`
          : `/api/services/${editingService.id}/poster`;
        
        const response = await axios.post(url, posterFormData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // 重新加载服务数据以获取最新状态
        await reloadServiceData();
        
        // 更新services列表中的服务数据
        serviceData.posterImage = response.data.posterUrl;
        onUpdate(editingService.id, serviceData);
        
        // 显示成功消息
        if (newFiles.length > 0 && existingImages.length > 0) {
          alert('图片更新成功！');
        } else if (newFiles.length > 0) {
          alert('图片添加成功！');
        } else {
          alert('图片删除成功！');
        }
        
      } catch (error) {
        console.error('海报更新失败:', error);
        alert('海报更新失败，请重试');
        return;
      }
    } else {
      // 新增服务
      const newService = await onAdd(serviceData);
      
      if (images.length > 0 && newService && newService.id) {
        try {
          const posterFormData = new FormData();
          images.forEach(img => {
            if (img.file) {
              posterFormData.append('posters', img.file);
            }
          });
          
          await axios.post(`/api/services/${newService.id}/poster`, posterFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          alert('服务添加成功！');
        } catch (error) {
          console.error('海报上传失败:', error);
          alert('服务创建成功，但海报上传失败，请重新编辑上传海报');
        }
      }
      
      // 新增模式下重置表单
      setFormData({ title: '', templateType: 'vertical' });
      setImages([]);
      setShowForm(false);
    }
  };
  
  // 重新加载服务数据的辅助函数
  const reloadServiceData = async () => {
    try {
      const response = await axios.get(`/api/services/${editingService.id}`);
      const updatedService = response.data;
      
      // 更新编辑状态
      setEditingService(updatedService);
      
      // 重新设置图片状态
      const newImages = [];
      if ((updatedService.templateType === 'grid' || updatedService.templateType === 'horizontal' || updatedService.templateType === 'vertical') && updatedService.posterImages) {
        updatedService.posterImages.forEach((imgUrl, index) => {
          let fullUrl;
          if (imgUrl.startsWith('http')) {
            fullUrl = imgUrl;
          } else {
            fullUrl = imgUrl;
          }
          newImages.push({
            id: Date.now() + index,
            url: fullUrl,
            file: null,
            isExisting: true
          });
        });
      } else if (updatedService.posterImage) {
        let fullUrl;
        if (updatedService.posterImage.startsWith('http')) {
          fullUrl = updatedService.posterImage;
        } else {
          fullUrl = updatedService.posterImage;
        }
        newImages.push({
          id: Date.now(),
          url: fullUrl,
          file: null,
          isExisting: true
        });
      }
      
      setImages(newImages);
      console.log('重新加载完成，图片数量:', newImages.length);
      
    } catch (error) {
      console.error('重新加载服务数据失败:', error);
      alert('数据重新加载失败，但操作已完成');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      templateType: service.templateType || 'vertical'
    });
    
    // 使用新的统一状态管理设置图片
    const newImages = [];
    if ((service.templateType === 'grid' || service.templateType === 'horizontal' || service.templateType === 'vertical') && service.posterImages) {
      service.posterImages.forEach((imgUrl, index) => {
        const fullUrl = imgUrl.startsWith('http') ? imgUrl : imgUrl;
        newImages.push({
          id: Date.now() + index,
          url: fullUrl,
          file: null,
          isExisting: true
        });
      });
    } else if (service.posterImage) {
      const fullUrl = service.posterImage.startsWith('http') ? service.posterImage : service.posterImage;
      newImages.push({
        id: Date.now(),
        url: fullUrl,
        file: null,
        isExisting: true
      });
    }
    
    setImages(newImages);
    setShowForm(true);
    console.log('编辑模式：设置图片数量:', newImages.length);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
    setFormData({ title: '', templateType: 'vertical' });
    setImages([]);
  };

  // 已移除特性管理相关函数，简化为只管理海报

  return (
    <div>
      <div className="section-header">
        <button 
          onClick={() => setShowForm(true)} 
          className="btn-primary"
        >
          添加服务
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>标题</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>模板类型</label>
            <select
              value={formData.templateType}
              onChange={(e) => setFormData({...formData, templateType: e.target.value})}
            >
              <option value="vertical">竖版多张海报</option>
              <option value="horizontal">横版多图海报</option>
              <option value="grid">九宫格多图</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              {formData.templateType === 'vertical' && '竖版海报图片 (可选择多张，建议比例9:16)'}
              {formData.templateType === 'horizontal' && '横版海报图片 (可选择多张，建议比例16:9)'}
              {formData.templateType === 'grid' && '九宫格图片 (可选择多张，建议正方形比例1:1)'}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp"
              onChange={handlePosterChange}
              className="file-input"
              multiple={true}
            />
            {(formData.templateType === 'horizontal' || formData.templateType === 'vertical') && editingService && images.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  {formData.templateType === 'horizontal' ? '提示：选择新图片将添加到现有图片中，而不是替换' : '提示：选择新图片将添加到现有图片中'}
                </div>
                <button
                  type="button"
                  onClick={handleClearAllImages}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  清空所有图片
                </button>
              </div>
            )}
            {images.length > 0 && (
              <div className="image-preview">
                {images.map((image, index) => (
                  <div key={image.id} style={{ position: 'relative', display: 'inline-block', margin: '5px' }}>
                    <img 
                      src={image.url} 
                      alt={`海报预览 ${index + 1}`} 
                      style={{
                        maxWidth: '150px', 
                        maxHeight: formData.templateType === 'horizontal' ? '100px' : '200px',
                        objectFit: 'cover',
                        aspectRatio: formData.templateType === 'vertical' ? '9/16' : formData.templateType === 'horizontal' ? '16/9' : '1/1',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }} 
                      onError={(e) => {
                        console.error(`图片 ${index + 1} 加载失败:`, image.url);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                      onLoad={(e) => {
                        // 图片加载成功，隐藏错误提示
                        if (e.target.nextSibling && e.target.nextSibling.classList.contains('image-error')) {
                          e.target.nextSibling.style.display = 'none';
                        }
                      }}
                    />
                    <div 
                      className="image-error"
                      style={{
                        display: 'none',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '150px',
                        height: formData.templateType === 'horizontal' ? '100px' : '200px',
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        fontSize: '12px',
                        color: '#666'
                      }}
                    >
                      <div>📷</div>
                      <div>图片加载失败</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'rgba(220, 53, 69, 0.8)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="删除图片"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingService ? '确定' : '添加服务'}
            </button>
            <button type="button" onClick={handleCancel} className="btn-secondary">
              取消
            </button>
          </div>
        </form>
      )}

      <div className="services-list">
        {services.map(service => (
          <div key={service.id} className="service-item">
            <div className="service-info">
               <h4>{service.title}</h4>
               <p>模板类型: {service.templateType === 'vertical' ? '竖版单张' : service.templateType === 'horizontal' ? '横版多图' : '九宫格多图'}</p>
               <div className="service-poster-preview">
                 {(service.templateType === 'grid' || service.templateType === 'horizontal') && service.posterImages && service.posterImages.length > 0 ? (
                   service.posterImages.map((image, index) => (
                     <img 
                       key={index}
                       src={image.startsWith('http') ? image : image}
                       alt={`${service.title} ${index + 1}`}
                       style={{
                         width: service.templateType === 'horizontal' ? '80px' : '60px', 
                         height: service.templateType === 'horizontal' ? '45px' : '60px', 
                         objectFit: 'cover', 
                         margin: '2px'
                       }}
                     />
                   ))
                 ) : service.posterImage ? (
                   <img 
                     src={service.posterImage.startsWith('http') ? service.posterImage : service.posterImage}
                     alt={service.title}
                     style={{
                       width: service.templateType === 'horizontal' ? '120px' : '80px', 
                       height: service.templateType === 'horizontal' ? '70px' : '120px', 
                       objectFit: 'cover'
                     }}
                   />
                 ) : (
                   <div style={{width: '80px', height: '120px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>无图片</div>
                 )}
               </div>
             </div>
            <div className="service-actions">
              <button onClick={() => handleEdit(service)} className="btn-secondary">
                编辑
              </button>
              <button onClick={() => onDelete(service.id)} className="btn-danger">
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 核心服务轮播图片管理组件
const CoreServiceCarouselManager = ({ carouselData, onUpdate, onUploadImages, onDeleteImage, onClearImages }) => {
  const [settings, setSettings] = useState({
    title: '',
    isActive: true,
    autoPlay: true,
    interval: 3000
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (carouselData) {
      setSettings({
        title: carouselData.title || '',
        isActive: carouselData.isActive !== undefined ? carouselData.isActive : true,
        autoPlay: carouselData.autoPlay !== undefined ? carouselData.autoPlay : true,
        interval: carouselData.interval || 3000
      });
    }
  }, [carouselData]);

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    onUpdate(settings);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onUploadImages(selectedFiles);
      setSelectedFiles([]);
      // 清空文件输入
      const fileInput = document.getElementById('carousel-file-input');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleClearAll = () => {
    if (window.confirm('确定要清空所有轮播图片吗？此操作不可恢复。')) {
      onClearImages();
    }
  };

  if (!carouselData) {
    return <div>加载中...</div>;
  }

  return (
    <div className="carousel-manager">
      {/* 轮播设置 */}
      <div className="carousel-settings">
        <h4>轮播设置</h4>
        <form onSubmit={handleSettingsSubmit}>
          <div className="form-group">
            <label>标题:</label>
            <input
              type="text"
              value={settings.title}
              onChange={(e) => setSettings({...settings, title: e.target.value})}
              placeholder="轮播图片标题"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={settings.isActive}
                onChange={(e) => setSettings({...settings, isActive: e.target.checked})}
              />
              启用轮播
            </label>
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) => setSettings({...settings, autoPlay: e.target.checked})}
              />
              自动播放
            </label>
          </div>
          <div className="form-group">
            <label>切换间隔 (毫秒):</label>
            <input
              type="number"
              value={settings.interval}
              onChange={(e) => setSettings({...settings, interval: parseInt(e.target.value) || 3000})}
              min="1000"
              max="10000"
              step="500"
            />
          </div>
          <button type="submit" className="btn-primary">更新设置</button>
        </form>
      </div>

      {/* 图片上传 */}
      <div className="carousel-upload">
        <h4>上传图片</h4>
        <div className="upload-section">
          <input
            id="carousel-file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
          />
          {selectedFiles.length > 0 && (
            <div className="selected-files">
              <p>已选择 {selectedFiles.length} 个文件:</p>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
              <button onClick={handleUpload} className="btn-primary">上传图片</button>
            </div>
          )}
        </div>
      </div>

      {/* 当前图片列表 */}
      <div className="carousel-images">
        <div className="images-header">
          <h4>当前轮播图片 ({carouselData.images ? carouselData.images.length : 0})</h4>
          {carouselData.images && carouselData.images.length > 0 && (
            <button onClick={handleClearAll} className="btn-danger">清空所有图片</button>
          )}
        </div>
        
        {carouselData.images && carouselData.images.length > 0 ? (
          <div className="images-grid">
            {carouselData.images.map((image, index) => (
              <div key={image.id} className="image-item">
                <div className="image-preview">
                  <img
                    src={image.url}
                    alt={`轮播图片 ${index + 1}`}
                    style={{
                      width: '150px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  <div 
                    className="image-error"
                    style={{
                      display: 'none',
                      width: '150px',
                      height: '100px',
                      backgroundColor: '#f8f9fa',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      fontSize: '12px',
                      color: '#666'
                    }}
                  >
                    <div>📷</div>
                    <div>图片加载失败</div>
                  </div>
                </div>
                <div className="image-info">
                  <p>文件名: {image.filename}</p>
                  <p>上传时间: {new Date(image.uploadedAt).toLocaleString()}</p>
                  <button
                    onClick={() => onDeleteImage(image.id)}
                    className="btn-danger btn-small"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-images">
            <p>暂无轮播图片，请上传图片。</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 新闻管理组件
const NewsManager = ({ newsItems, newsSettings, onAdd, onUpdate, onDelete, onUpdateSettings }) => {
  const [editingNews, setEditingNews] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({
    content: '',
    icon: '📢',
    type: 'general',
    priority: 1,
    isActive: true
  });
  const [settingsData, setSettingsData] = useState({
    scrollSpeed: 30,
    maxDisplayItems: 10,
    autoRefresh: true,
    refreshInterval: 60,
    animationDelay: 0.8
  });

  useEffect(() => {
    if (newsSettings) {
      setSettingsData({
        scrollSpeed: newsSettings.scrollSpeed || 30,
        maxDisplayItems: newsSettings.maxDisplayItems || 10,
        autoRefresh: newsSettings.autoRefresh || true,
        refreshInterval: newsSettings.refreshInterval || 60,
        animationDelay: newsSettings.animationDelay || 0.8
      });
    }
  }, [newsSettings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNews) {
      onUpdate(editingNews.id, formData);
      setEditingNews(null);
    } else {
      onAdd(formData);
      setShowAddForm(false);
    }
    setFormData({
      content: '',
      icon: '📢',
      type: 'general',
      priority: 1,
      isActive: true
    });
  };

  const handleEdit = (news) => {
    setEditingNews(news);
    setFormData({
      content: news.content,
      icon: news.icon,
      type: news.type,
      priority: news.priority,
      isActive: news.isActive
    });
    setShowAddForm(true);
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    onUpdateSettings(settingsData);
    setShowSettings(false);
  };

  const iconOptions = ['📢', '🎉', '🚀', '💡', '🔥', '⭐', '📰', '🎯', '💼', '🌟'];
  const typeOptions = [
    { value: 'general', label: '一般' },
    { value: 'achievement', label: '成就' },
    { value: 'product', label: '产品' },
    { value: 'partnership', label: '合作' },
    { value: 'promotion', label: '推广' }
  ];

  return (
    <div className="news-manager">
      <div className="manager-header">
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '取消添加' : '添加新闻'}
        </button>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowSettings(!showSettings)}
        >
          {showSettings ? '取消设置' : '滚动设置'}
        </button>
      </div>

      {showSettings && (
        <form onSubmit={handleSettingsSubmit} className="settings-form">
          <h4>滚动新闻设置</h4>
          <div className="form-group">
            <label>滚动速度 (秒):</label>
            <input
              type="number"
              value={settingsData.scrollSpeed}
              onChange={(e) => setSettingsData({...settingsData, scrollSpeed: parseInt(e.target.value)})}
              min="10"
              max="120"
            />
          </div>
          <div className="form-group">
            <label>最大显示条数:</label>
            <input
              type="number"
              value={settingsData.maxDisplayItems}
              onChange={(e) => setSettingsData({...settingsData, maxDisplayItems: parseInt(e.target.value)})}
              min="1"
              max="20"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={settingsData.autoRefresh}
                onChange={(e) => setSettingsData({...settingsData, autoRefresh: e.target.checked})}
              />
              自动刷新
            </label>
          </div>
          {settingsData.autoRefresh && (
            <div className="form-group">
              <label>刷新间隔 (秒):</label>
              <input
                type="number"
                value={settingsData.refreshInterval}
                onChange={(e) => setSettingsData({...settingsData, refreshInterval: parseInt(e.target.value)})}
                min="30"
                max="300"
              />
            </div>
          )}
          <div className="form-group">
            <label>动画延迟 (秒):</label>
            <input
              type="number"
              step="0.1"
              value={settingsData.animationDelay}
              onChange={(e) => setSettingsData({...settingsData, animationDelay: parseFloat(e.target.value)})}
              min="0"
              max="5"
            />
            <small style={{color: '#666', fontSize: '0.8rem', display: 'block', marginTop: '4px'}}>控制滚动新闻出现的延迟时间</small>
          </div>
          <button type="submit" className="btn btn-primary">保存设置</button>
        </form>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="news-form">
          <h4>{editingNews ? '编辑新闻' : '添加新闻'}</h4>
          <div className="form-group">
            <label>新闻内容:</label>
            <input
              type="text"
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              required
              placeholder="请输入新闻内容"
            />
          </div>
          <div className="form-group">
            <label>图标:</label>
            <select
              value={formData.icon}
              onChange={(e) => setFormData({...formData, icon: e.target.value})}
            >
              {iconOptions.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>类型:</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              {typeOptions.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>优先级:</label>
            <input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
              min="1"
            />
          </div>
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              />
              启用
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingNews ? '更新' : '添加'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setShowAddForm(false);
                setEditingNews(null);
                setFormData({
                  content: '',
                  icon: '📢',
                  type: 'general',
                  priority: 1,
                  isActive: true
                });
              }}
            >
              取消
            </button>
          </div>
        </form>
      )}

      <div className="news-list">
        <h4>新闻列表</h4>
        {newsItems.length === 0 ? (
          <p>暂无新闻</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>图标</th>
                <th>内容</th>
                <th>类型</th>
                <th>优先级</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {newsItems
                .sort((a, b) => a.priority - b.priority)
                .map(news => (
                <tr key={news.id}>
                  <td>{news.icon}</td>
                  <td>{news.content}</td>
                  <td>{typeOptions.find(t => t.value === news.type)?.label || news.type}</td>
                  <td>{news.priority}</td>
                  <td>
                    <span className={`status ${news.isActive ? 'active' : 'inactive'}`}>
                      {news.isActive ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td>{new Date(news.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleEdit(news)}
                    >
                      编辑
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => {
                        if (window.confirm('确定要删除这条新闻吗？')) {
                          onDelete(news.id);
                        }
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Admin;