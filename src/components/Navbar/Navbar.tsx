import { useState } from 'react';
import type { TypedUseSelectorHook } from 'react-redux';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import styles from './Navbar.module.css';
import logo from '../../assets/logo.svg';
import searchIcon from '../../assets/search.svg';
import dropdownIcon from '../../assets/dropdown.svg';
import { startOAuthFlow } from '../../services/auth';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/auth/authSlice';
import { useEffect, useRef } from 'react';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dispatch = useDispatch();

  const toggleSearch = () => setShowSearch(!showSearch);
  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleLogin = () => {
    startOAuthFlow();
  };
  const handleLogout = () => {
    setShowDropdown(false);
    dispatch(logout()); // Your logout redux action
    localStorage.removeItem('reddit_access_token');
    localStorage.removeItem('reddit_refresh_token');
  };

  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const currentSubreddit = useTypedSelector((state) => state.subreddit.current);
  const isAuthenticated = useTypedSelector((state) => state.auth.isAuthenticated);
  const username = useTypedSelector((state) => state.auth.userData?.name);

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
      <h1 className={styles.subredditTitle}>{currentSubreddit || 'Front Page'}</h1>
    </div>

    {/* Right - Actions */}
    <div className={styles.actionsContainer}>
      {/* Search */}
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

      {/* Auth */}
      {isAuthenticated ? (
        <div className={styles.userDropdown} ref={dropdownRef}>
          <button className={styles.usernameButton} onClick={toggleDropdown}>
            {username}
            <img src={dropdownIcon} alt="Menu" className={styles.icon} />
          </button>
          {showDropdown && (
            <div className={styles.dropdownMenu}>
              <Link
                to={`/user/${username}`}
                className={styles.dropdownItem}
                onClick={() => setShowDropdown(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className={`${styles.dropdownItem} ${styles.logoutButton}`}
                type="button"
              >
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
</nav>

  );
};

export default Navbar;
