import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom'; // remove BrowserRouter import here
import Navbar from './components/Navbar/Navbar';
import Callback from './components/Callback/Callback';
import PostList from './components/posts/PostList';
import { useSelector } from 'react-redux';
import { fetchPosts } from './actions/fetchPosts';
import type { RootState } from './store/store';
import { useAppDispatch } from './store/hooks';

const App = () => {
  const dispatch = useAppDispatch();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchPosts(accessToken));
    }
  }, [accessToken, dispatch]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/callback" Component={Callback} />
        <Route path="/" element={<PostList />} />
      </Routes>
    </>
  );
};

export default App;
