import { useState, useEffect, useRef } from 'react';
import type { TypedUseSelectorHook } from 'react-redux';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, NavLink, Link } from 'react-router-dom';
import type { RootState } from '../../store/store';
import styles from './Navbar.module.css';
import logo from '../../assets/logo.svg';
import searchIcon from '../../assets/search.svg';
import dropdownIcon from '../../assets/dropdown.svg';
import { startOAuthFlow } from '../../services/auth';
import { logout } from '../../store/auth/authSlice';
import SortButtons from '../SortButtons/SortButtons';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

const sortOptions = ['best', 'hot', 'new', 'top'] as const;

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleSearch = () => setShowSearch(!showSearch);
  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleLogin = () => startOAuthFlow();

  const handleLogout = () => {
    setShowDropdown(false);
    dispatch(logout());
    localStorage.removeItem('reddit_access_token');
    localStorage.removeItem('reddit_refresh_token');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSubreddit = useTypedSelector((state) => state.subreddit.current);
  const isAuthenticated = useTypedSelector((state) => state.auth.isAuthenticated);
  const username = useTypedSelector((state) => state.auth.userData?.name);

  const sortOptions = ['hot', 'new', 'top'] as const;
  type SortOption = (typeof sortOptions)[number];

  const getCurrentSort = (): SortOption => {
    const path = location.pathname.split('/');
    const sort = path[1];
    return sortOptions.includes(sort as SortOption) ? (sort as SortOption) : 'hot';
  };

  const currentSort = getCurrentSort();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        {/* Left - Logo */}
        <div className={styles.logoContainer}>
          <Link to="/">
            <img src={logo} alt="Reddit Logo" className={styles.logo} />
          </Link>
        </div>

        {/* Center - Subreddit */}
        <div className={styles.subredditContainer}>
          <h1 className={styles.subredditTitle}>{currentSubreddit || 'Reddit'}</h1>
        </div>

        {/* Right - Search & Auth */}
        <div className={styles.actionsContainer}>
          <div className={styles.searchWrapper}>
            {showSearch && (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                placeholder="Search Reddit"
                autoFocus
              />
            )}
            <button onClick={toggleSearch} className={styles.iconButton}>
              <img src={searchIcon} alt="Search" className={styles.icon} />
            </button>
          </div>

          {isAuthenticated ? (
            <div className={styles.userDropdown} ref={dropdownRef}>
              <button className={styles.usernameButton} onClick={toggleDropdown}>
                {username}
                <img src={dropdownIcon} alt="Menu" className={styles.icon} />
              </button>
              {showDropdown && (
                <div className={styles.dropdownMenu}>
                  <Link to={`/user/${username}`} className={styles.dropdownItem} onClick={() => setShowDropdown(false)}>
                    Profile
                  </Link>
                  <button onClick={handleLogout} className={`${styles.dropdownItem} ${styles.logoutButton}`}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className={styles.loginButton} onClick={handleLogin}>
              Login
            </button>
          )}
        </div>
      </div>

      {/* Sort Buttons */}

      <SortButtons currentSort={currentSort} />
    </nav>
  );
};

export default Navbar;
