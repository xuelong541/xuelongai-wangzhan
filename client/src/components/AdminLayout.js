import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Plus, Settings, Home } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    {
      path: '/admin',
      label: '仪表板',
      icon: <LayoutDashboard size={18} />
    },
    {
      path: '/admin/posts',
      label: '文章管理',
      icon: <FileText size={18} />
    },
    {
      path: '/admin/posts/create',
      label: '创建文章',
      icon: <Plus size={18} />
    }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px'
          }}>
            管理后台
          </h2>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            内容管理系统
          </p>
        </div>
        
        <nav>
          <ul className="sidebar-nav">
            <li>
              <Link 
                to="/" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px 16px',
                  textDecoration: 'none',
                  color: '#666',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  marginBottom: '8px'
                }}
              >
                <Home size={18} />
                返回首页
              </Link>
            </li>
            
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={isActive(item.path) ? 'active' : ''}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px'
                  }}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        <div style={{ 
          marginTop: 'auto', 
          padding: '16px', 
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Settings size={16} style={{ color: '#667eea' }} />
            <span style={{ fontWeight: '600', color: '#333' }}>系统信息</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
            AI Studio v1.0.0
          </p>
          <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
            管理员面板
          </p>
        </div>
      </aside>
      
      <main style={{ flex: 1, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;