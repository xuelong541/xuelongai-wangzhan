import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const ServiceDetail = ({ serviceId, onClose }) => {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/services/${serviceId}`);
        setService(response.data);
        setCurrentImageIndex(0); // 重置轮播索引
      } catch (err) {
        setError('获取服务详情失败');
        console.error('Error fetching service detail:', err);
      } finally {
        setLoading(false);
      }
    };

    if (serviceId) {
      fetchServiceDetail();
    }
  }, [serviceId]);

  if (loading) {
    return (
      <motion.div 
        className="service-detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="service-detail-modal">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>XUELONG AI</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="service-detail-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="service-detail-modal">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={onClose} className="btn-primary">关闭</button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!service) {
    return null;
  }

  return (
    <motion.div 
      className="service-detail-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="service-detail-modal"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 退出按钮 - 置于顶层 */}
        <button 
          className="close-btn-overlay"
          onClick={onClose}
          aria-label="关闭"
        >
          <X size={24} />
        </button>

        {/* 头部 */}
        <div className="service-detail-header">
          <div className="service-detail-title">
            <h2>{service.title}</h2>
          </div>
        </div>

        {/* 内容 */}
        <div className="service-detail-content">
          {/* 海报图片 */}
          <div className={`service-poster-section template-${service.templateType || 'vertical'}`}>
            {service.templateType === 'grid' ? (
              // 九宫格模式
              <div className="service-poster-grid">
                {service.posterImages && service.posterImages.length > 0 ? (
                  service.posterImages.map((image, index) => (
                    <motion.div 
                      key={index}
                      className="service-poster-grid-item"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <img 
                      src={image.startsWith('http') ? image : image}
                      alt={`${service.title} 第${index + 1}张图片`}
                      className="service-poster-grid-image"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = image.startsWith('http') ? image : image;
                        link.download = `${service.title}-图片${index + 1}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        style={{ cursor: 'pointer' }}
                        draggable={false}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="service-poster-placeholder">
                    <p>暂无图片</p>
                  </div>
                )}
                <div className="poster-download-hint">
                  <span>点击任意图片下载</span>
                </div>
              </div>
            ) : service.templateType === 'horizontal' && service.posterImages && service.posterImages.length > 0 ? (
              // 横版多图模式
              <div className="service-poster-horizontal-grid">
                {service.posterImages.map((image, index) => (
                  <motion.div 
                    key={index}
                    className="service-poster-horizontal-item"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <img 
                      src={image.startsWith('http') ? image : image}
                      alt={`${service.title} 第${index + 1}张图片`}
                      className="service-poster-horizontal-image"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = image.startsWith('http') ? image : image;
                        link.download = `${service.title}-图片${index + 1}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      style={{ cursor: 'pointer' }}
                      draggable={false}
                    />
                  </motion.div>
                ))}
                <div className="poster-download-hint">
                  <span>点击任意图片下载</span>
                </div>
              </div>
            ) : service.templateType === 'vertical' && service.posterImages && service.posterImages.length > 0 ? (
              // 竖版轮播模式
              <motion.div 
                className="vertical-carousel-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="vertical-carousel-wrapper">
                  {/* 左箭头 */}
                  {service.posterImages.length > 1 && (
                    <button 
                      className="vertical-carousel-btn prev"
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? service.posterImages.length - 1 : prev - 1
                      )}
                      aria-label="上一张图片"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  
                  {/* 图片显示区域 */}
                  <div className="vertical-carousel-image-container">
                    <img 
                      src={service.posterImages[currentImageIndex]}
                      alt={`${service.title} 第${currentImageIndex + 1}张图片`}
                      className="vertical-carousel-image"
                      onClick={() => {
                        const imageUrl = service.posterImages[currentImageIndex];
                        const link = document.createElement('a');
                        link.href = imageUrl;
                        link.download = `${service.title}-图片${currentImageIndex + 1}.jpg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      draggable={false}
                    />
                  </div>
                  
                  {/* 右箭头 */}
                  {service.posterImages.length > 1 && (
                    <button 
                      className="vertical-carousel-btn next"
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === service.posterImages.length - 1 ? 0 : prev + 1
                      )}
                      aria-label="下一张图片"
                    >
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
                
                {/* 指示器 */}
                {service.posterImages.length > 1 && (
                  <div className="vertical-carousel-indicators">
                    {service.posterImages.map((_, index) => (
                      <button
                        key={index}
                        className={`vertical-indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                        aria-label={`切换到第${index + 1}张图片`}
                      />
                    ))}
                  </div>
                )}
                
                {/* 下载提示 */}
                <div className="vertical-carousel-info">
                  <span className="download-hint">点击图片下载</span>
                  <span className="image-counter">{currentImageIndex + 1} / {service.posterImages.length}</span>
                </div>
              </motion.div>
            ) : (
              // 暂无图片
              <div className="service-poster-placeholder">
                <p>暂无海报图片</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ServiceDetail;