import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { Save, Eye, Upload, X, ArrowLeft } from 'lucide-react';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: false
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('图片大小不能超过5MB');
        return;
      }
      
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('请输入文章标题');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('请输入文章内容');
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('published', formData.published);
      if (image) {
        submitData.append('image', image);
      }

      await axios.post('/api/posts', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('文章创建成功！');
      navigate('/admin/posts');
    } catch (error) {
      toast.error(error.response?.data?.message || '创建文章失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 页面头部 */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <button 
                onClick={() => navigate('/admin/posts')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <ArrowLeft size={16} />
                返回
              </button>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', margin: 0 }}>
                创建新文章
              </h1>
            </div>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}>
              发布您的AI工作室最新动态
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
              {/* 主要内容区域 */}
              <div>
                <motion.div
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  style={{ marginBottom: '24px' }}
                >
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '#333' }}>
                    文章内容
                  </h2>
                  
                  <div className="form-group">
                    <label htmlFor="title">文章标题 *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      className="form-control"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="输入一个吸引人的标题..."
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="content">文章内容 *</label>
                    <textarea
                      id="content"
                      name="content"
                      className="form-control"
                      value={formData.content}
                      onChange={handleChange}
                      placeholder="分享您的想法和见解..."
                      rows={12}
                      required
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </motion.div>

                {/* 图片上传区域 */}
                <motion.div
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '#333' }}>
                    文章图片
                  </h2>
                  
                  {!imagePreview ? (
                    <div style={{
                      border: '2px dashed #e1e5e9',
                      borderRadius: '8px',
                      padding: '40px',
                      textAlign: 'center',
                      background: '#f8f9fa',
                      transition: 'all 0.3s ease'
                    }}>
                      <Upload size={48} style={{ color: '#667eea', marginBottom: '16px' }} />
                      <p style={{ marginBottom: '16px', color: '#666' }}>
                        点击上传图片或拖拽图片到此处
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        style={{ display: 'none' }}
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="btn btn-primary">
                        <Upload size={16} className="mr-2" />
                        选择图片
                      </label>
                      <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '8px' }}>
                        支持 JPG, PNG, GIF 格式，最大 5MB
                      </p>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={imagePreview}
                        alt="预览"
                        style={{
                          width: '100%',
                          maxHeight: '300px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(0, 0, 0, 0.7)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* 侧边栏 */}
              <div>
                <motion.div
                  className="card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  style={{ position: 'sticky', top: '24px' }}
                >
                  <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px', color: '#333' }}>
                    发布设置
                  </h2>
                  
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        name="published"
                        checked={formData.published}
                        onChange={handleChange}
                        style={{ transform: 'scale(1.2)' }}
                      />
                      <span style={{ fontWeight: '500' }}>立即发布</span>
                    </label>
                    <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>
                      {formData.published ? '文章将立即对外可见' : '文章将保存为草稿'}
                    </small>
                  </div>

                  <div style={{ 
                    borderTop: '1px solid #e1e5e9', 
                    paddingTop: '20px', 
                    marginTop: '20px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                      >
                        {loading ? (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <div style={{
                              width: '16px',
                              height: '16px',
                              border: '2px solid rgba(255,255,255,0.3)',
                              borderTop: '2px solid white',
                              borderRadius: '50%',
                              animation: 'spin 1s linear infinite'
                            }}></div>
                            {formData.published ? '发布中...' : '保存中...'}
                          </span>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {formData.published ? <Eye size={16} /> : <Save size={16} />}
                            {formData.published ? '发布文章' : '保存草稿'}
                          </span>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => navigate('/admin/posts')}
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                      >
                        取消
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .admin-content form > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
};

export default CreatePost;