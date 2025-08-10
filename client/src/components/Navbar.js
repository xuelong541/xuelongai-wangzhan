import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { 
  User, LogOut, Settings, Menu, X, 
  GraduationCap, Code, Users, Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: '首页', icon: Home, action: () => navigate('/') },
    { label: '关于雪珑AI', icon: Users, action: () => scrollToSection('.about-section') },
    { label: '核心服务', icon: Code, action: () => scrollToSection('.services-overview-section') }
  ];

  return (
    <motion.nav 
      className={`xuelong-navbar ${isScrolled ? 'scrolled' : ''}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            <img src="/logo.svg" alt="XUELONG AI" className="brand-logo" />
            <div className="brand-text">
              <span className="brand-main">XUELONG AI</span>
              <span className="brand-accent">雪珑人工智能设计工作室</span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <ul className="navbar-nav desktop-nav">
            {navItems.map((item, index) => (
              <motion.li 
                key={item.label}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <button 
                  onClick={item.action}
                  className="nav-link"
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              </motion.li>
            ))}
            
            {user ? (
              <>
                <motion.li
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <Link to="/admin" className="nav-link admin-link">
                    <Settings size={18} />
                    管理后台
                  </Link>
                </motion.li>
                <motion.li
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <button 
                    onClick={handleLogout}
                    className="btn-logout"
                  >
                    <LogOut size={18} />
                    退出
                  </button>
                </motion.li>
              </>
            ) : (
              <motion.li
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Link to="/login" className="btn-login">
                  <User size={18} />
                  登录
                </Link>
              </motion.li>
            )}
          </ul>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-nav-content">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={item.action}
                  className="mobile-nav-link"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <item.icon size={20} />
                  {item.label}
                </motion.button>
              ))}
              
              {user ? (
                <>
                  <motion.div
                    className="mobile-nav-divider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  />
                  <motion.button
                    onClick={() => {
                      navigate('/admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="mobile-nav-link admin"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <Settings size={20} />
                    管理后台
                  </motion.button>
                  <motion.button
                    onClick={handleLogout}
                    className="mobile-nav-link logout"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <LogOut size={20} />
                    退出
                  </motion.button>
                </>
              ) : (
                <motion.button
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="mobile-nav-link login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <User size={20} />
                  登录
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;