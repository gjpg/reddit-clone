import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Callback from './components/Callback/Callback';
import PostList from './components/PostList/PostList';
import UserPage from './components/UserPage/UserPage';

import { useAuthInit } from './store/hooks';
import PostPage from './components/PostPage/PostPage';

const App = () => {
  useAuthInit();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/:sort" element={<PostList />} />
        <Route path="/r/:subreddit" element={<PostList />} />
        <Route path="/r/:subreddit/:sort" element={<PostList />} />

        {/* Add this: */}
        <Route path="/r/:subreddit/comments/:postId" element={<PostPage />} />

        <Route path="/callback" Component={Callback} />
        <Route path="/user/:username" element={<UserPage />} />
      </Routes>
    </>
  );
};

export default App;
