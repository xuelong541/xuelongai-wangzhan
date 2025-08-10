import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/AdminLayout';
import { Edit, Trash2, Plus, Eye, EyeOff, Search, Filter } from 'lucide-react';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/admin/posts');
      setPosts(response.data);
    } catch (error) {
      toast.error('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这篇文章吗？')) {
      try {
        await axios.delete(`/api/posts/${id}`);
        setPosts(posts.filter(post => post.id !== id));
        toast.success('文章删除成功');
      } catch (error) {
        toast.error('删除文章失败');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && post.published) ||
                         (filterStatus === 'draft' && !post.published);
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="admin-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* 页面头部 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
                文章管理
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}>
                管理您的所有文章内容
              </p>
            </div>
            <Link to="/admin/posts/create" className="btn btn-primary">
              <Plus size={16} className="mr-2" />
              创建新文章
            </Link>
          </div>

          {/* 搜索和筛选 */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ marginBottom: '24px' }}
          >
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ flex: '1', minWidth: '200px', position: 'relative' }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#666'
                  }} 
                />
                <input
                  type="text"
                  placeholder="搜索文章标题或内容..."
                  className="form-control"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={16} style={{ color: '#666' }} />
                <select
                  className="form-control"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ width: 'auto', minWidth: '120px' }}
                >
                  <option value="all">全部状态</option>
                  <option value="published">已发布</option>
                  <option value="draft">草稿</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* 文章列表 */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #667eea',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px'
                }}></div>
                XUELONG AI
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>标题</th>
                      <th>状态</th>
                      <th>作者</th>
                      <th>创建时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post, index) => (
                      <motion.tr
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td>
                          <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                            {post.title}
                          </div>
                          <div style={{ 
                            fontSize: '0.8rem', 
                            color: '#666',
                            maxWidth: '300px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {post.content}
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${
                            post.published ? 'status-published' : 'status-draft'
                          }`}>
                            {post.published ? (
                              <><Eye size={12} className="mr-1" />已发布</>
                            ) : (
                              <><EyeOff size={12} className="mr-1" />草稿</>
                            )}
                          </span>
                        </td>
                        <td style={{ color: '#666' }}>{post.author}</td>
                        <td style={{ color: '#666', fontSize: '0.9rem' }}>
                          {formatDate(post.createdAt)}
                        </td>
                        <td>
                          <div className="actions">
                            <Link 
                              to={`/admin/posts/edit/${post.id}`}
                              className="btn btn-primary btn-sm"
                              title="编辑文章"
                            >
                              <Edit size={14} />
                            </Link>
                            <button 
                              onClick={() => handleDelete(post.id)}
                              className="btn btn-danger btn-sm"
                              title="删除文章"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>📝</div>
                <h3 style={{ marginBottom: '8px', color: '#333' }}>没有找到文章</h3>
                <p style={{ marginBottom: '24px' }}>
                  {searchTerm || filterStatus !== 'all' 
                    ? '尝试调整搜索条件或筛选器' 
                    : '还没有创建任何文章'}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Link to="/admin/posts/create" className="btn btn-primary">
                    <Plus size={16} className="mr-2" />
                    创建第一篇文章
                  </Link>
                )}
              </div>
            )}
          </motion.div>

          {/* 统计信息 */}
          {!loading && posts.length > 0 && (
            <motion.div
              style={{ 
                marginTop: '24px', 
                padding: '16px 24px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.9rem'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              显示 {filteredPosts.length} / {posts.length} 篇文章
              {searchTerm && ` · 搜索: "${searchTerm}"`}
              {filterStatus !== 'all' && ` · 筛选: ${filterStatus === 'published' ? '已发布' : '草稿'}`}
            </motion.div>
          )}
        </motion.div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AdminLayout>
  );
};

export default Posts;