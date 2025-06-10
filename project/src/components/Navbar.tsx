import React, { useState, useEffect } from 'react';
import { Menu, X, Truck, User, LogOut, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import logo from '../assets/img/1Rental_Logo_Blue.svg';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      // Clear auth store
      useAuthStore.getState().setUser(null);
      // Redirect to home page
      navigate('/');
      
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const shouldShowTransparentNav = isHomePage && !isScrolled;
  const handleScrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate to home with hash
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }
    // Scroll immediately if we're already on home page
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle hash changes for scrolling
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash]);

  const menuItems = [
    { 
      label: 'Home', 
      path: '/', 
      onClick: () => {
        if (location.pathname !== '/') {
          navigate('/');
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    },
    { 
      label: 'About', 
      path: '/#about', 
      onClick: () => handleScrollToSection('about') 
    },
    { 
      label: 'How It Works', 
      path: '/#how-it-works', 
      onClick: () => handleScrollToSection('how-it-works') 
    },
    { 
      label: 'Equipment', 
      path: '/#equipment', 
      onClick: () => handleScrollToSection('equipment') 
    },
    { 
      label: 'Contact', 
      path: '/#contact', 
      onClick: () => handleScrollToSection('contact') 
    },
  ];

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        shouldShowTransparentNav
          ? 'bg-transparent py-4'
          : 'bg-white shadow-md py-2'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            onClick={() => {
              if (location.pathname !== '/') {
                navigate('/');
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }} 
            className="flex items-center"
          >
            <img src={logo} alt="Logo" className="h-4 md:h-6" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  if (item.onClick) {
                    item.onClick();
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`px-4 py-2 text-blue-900 hover:text-blue-700 transition-colors`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4 pl-32">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center space-x-2 ${
                    shouldShowTransparentNav ? 'text-blue-900' : 'text-blue-800'
                  }`}
                >
                  <User className="h-5 w-5" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="inline-block h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleSignOut();
                      }}
                      className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    >
                      <LogOut className="inline-block h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className={`flex items-center space-x-0.5 ${
                  'text-gray-800 hover:text-gray-600'
                } transition-colors text-xs sm:text-sm md:text-base whitespace-nowrap`}
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden ${
                'text-gray-800'
              } focus:outline-none`}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg mt-2">
            <div className="flex flex-col space-y-3 p-4">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      navigate(item.path);
                    }
                    setIsOpen(false);
                  }}
                  className="text-gray-800 hover:text-yellow-600"
                >
                  {item.label}
                </button>
              ))}
              {/* {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-800 hover:text-yellow-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-800 hover:text-yellow-600"
                    onClick={() => setIsOpen(false)}
                  >
                    Profile Settings
                  </Link>
                </>
              )} */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;