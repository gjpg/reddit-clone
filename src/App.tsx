import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Callback from './components/Callback/Callback';
import PostList from './components/posts/PostList';
import UserPage from './components/UserPage/UserPage';

import { useAuthInit } from './store/hooks';

// App.tsx simplified:

const App = () => {
  useAuthInit();
  // no dispatch(fetchPosts) here

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/:sort" element={<PostList />} />
        <Route path="/r/:subreddit" element={<PostList />} />
        <Route path="/r/:subreddit/:sort" element={<PostList />} />

        <Route path="/callback" Component={Callback} />
        <Route path="/user/:username" element={<UserPage />} />
      </Routes>
    </>
  );
};

export default App;
