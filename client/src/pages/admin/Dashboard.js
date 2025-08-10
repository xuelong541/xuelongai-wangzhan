import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../App';
import AdminLayout from '../../components/AdminLayout';
import { FileText, Plus, Eye, Edit, BarChart3, Users, Calendar } from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/posts');
      const posts = response.data;
      
      setStats({
        totalPosts: posts.length,
        publishedPosts: posts.filter(p => p.published).length,
        draftPosts: posts.filter(p => !p.published).length
      });
      
      setRecentPosts(posts.slice(0, 5));
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const statsCards = [
    {
      title: '总文章数',
      value: stats.totalPosts,
      icon: <FileText size={24} />,
      color: '#667eea',
      bgColor: 'rgba(102, 126, 234, 0.1)'
    },
    {
      title: '已发布',
      value: stats.publishedPosts,
      icon: <Eye size={24} />,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: '草稿',
      value: stats.draftPosts,
      icon: <Edit size={24} />,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    }
  ];

  return (
    <AdminLayout>
      <div className="admin-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
              欢迎回来，{user?.username}！
            </h1>
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}>
              管理您的AI工作室内容
            </p>
          </div>

          {/* 统计卡片 */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '24px',
            marginBottom: '40px'
          }}>
            {statsCards.map((stat, index) => (
              <motion.div
                key={index}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                style={{
                  background: `linear-gradient(135deg, ${stat.bgColor} 0%, rgba(255, 255, 255, 0.95) 100%)`,
                  border: `1px solid ${stat.color}20`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ 
                      fontSize: '0.9rem', 
                      fontWeight: '600', 
                      color: '#666',
                      marginBottom: '8px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {stat.title}
                    </h3>
                    <p style={{ 
                      fontSize: '2.5rem', 
                      fontWeight: '700', 
                      color: stat.color,
                      margin: 0
                    }}>
                      {loading ? '...' : stat.value}
                    </p>
                  </div>
                  <div style={{ color: stat.color, opacity: 0.7 }}>
                    {stat.icon}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 快速操作 */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ marginBottom: '32px' }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
              <BarChart3 className="inline-block mr-2" size={20} />
              快速操作
            </h2>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link to="/admin/posts/create" className="btn btn-primary">
                <Plus size={16} className="mr-2" />
                创建新文章
              </Link>
              <Link to="/admin/posts" className="btn btn-secondary">
                <FileText size={16} className="mr-2" />
                管理文章
              </Link>
            </div>
          </motion.div>

          {/* 最近文章 */}
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px', color: '#333' }}>
              <Calendar className="inline-block mr-2" size={20} />
              最近文章
            </h2>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                XUELONG AI
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>标题</th>
                      <th>状态</th>
                      <th>创建时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPosts.map((post) => (
                      <motion.tr
                        key={post.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td style={{ fontWeight: '500' }}>{post.title}</td>
                        <td>
                          <span className={`status-badge ${
                            post.published ? 'status-published' : 'status-draft'
                          }`}>
                            {post.published ? '已发布' : '草稿'}
                          </span>
                        </td>
                        <td style={{ color: '#666' }}>{formatDate(post.createdAt)}</td>
                        <td>
                          <Link 
                            to={`/admin/posts/edit/${post.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            <Edit size={14} />
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <FileText size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>还没有文章，<Link to="/admin/posts/create">创建第一篇文章</Link></p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;