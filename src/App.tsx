import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar/Navbar';
import Callback from './components/Callback/Callback';
import PostList from './components/posts/PostList';
import UserPage from './components/UserPage/UserPage';

import { fetchPosts } from './actions/fetchPosts';
import { useAppDispatch, useAppSelector, useAuthInit } from './store/hooks';

const App = () => {
  useAuthInit();
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  // Fetch posts when accessToken becomes available
  useEffect(() => {
    if (accessToken) {
      dispatch(fetchPosts(accessToken));
    }
  }, [accessToken, dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PostList />} />
        <Route path="/hot" element={<PostList />} />
        <Route path="/new" element={<PostList />} />
        <Route path="/top" element={<PostList />} />
        <Route path="/callback" Component={Callback} />
        <Route path="/user/:username" element={<UserPage />} />
        <Route path="/" element={<PostList />} />
      </Routes>
    </>
  );
};

export default App;
