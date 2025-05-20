import { useState } from 'react';
import type { TypedUseSelectorHook } from 'react-redux';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import styles from './Navbar.module.css';
import logo from '../../assets/logo.svg'; // Replace with your logo
import searchIcon from '../../assets/search.svg'; // Replace with your icon
import dropdownIcon from '../../assets/dropdown.svg'; // Replace with your icon
import { startOAuthFlow } from '../../services/auth';

const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;

const Navbar = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSearch = () => setShowSearch(!showSearch);
  const handleLogin = () => {
    startOAuthFlow();
  };

  // Retrieve authentication and user data from Redux state
  const currentSubreddit = useTypedSelector((state) => state.subreddit.current);
  const isAuthenticated = useTypedSelector((state) => state.auth.isAuthenticated);
  const username = useTypedSelector((state) => state.auth.userData?.name);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        {/* Left - Logo */}
        <div className={styles.logoContainer}>
          <img src={logo} alt="Reddit Logo" className={styles.logo} />
        </div>

        {/* Center - Subreddit */}
        <div className={styles.subredditContainer}>
          <h1 className={styles.subredditTitle}>{currentSubreddit || 'Front Page'}</h1>
        </div>

        {/* Right - Actions */}
        <div className={styles.actionsContainer}>
          {/* Search */}
          <div className={styles.searchWrapper}>
            {showSearch ? (
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                placeholder="Search Reddit"
                autoFocus
              />
            ) : null}
            <button onClick={toggleSearch} className={styles.iconButton}>
              <img src={searchIcon} alt="Search" className={styles.icon} />
            </button>
          </div>

          {/* Auth */}
          {isAuthenticated ? (
            <div className={styles.userDropdown}>
              {/* Display the username on a button */}
              <button className={styles.usernameButton}>
                {username}
                <img src={dropdownIcon} alt="Menu" className={styles.icon} />
              </button>
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
