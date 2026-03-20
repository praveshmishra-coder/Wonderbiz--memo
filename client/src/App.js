import React, { useState } from 'react';
import Navbar from './components/Navbar';
import { ToastProvider } from './components/Toast';
import Home from './pages/Home';
import Memories from './pages/Memories';
import Photos from './pages/Photos';
import Videos from './pages/Videos';
import Feedback from './pages/Feedback';

export default function App() {
  const [page, setPage] = useState('home');

  const navigate = (tab) => {
    setPage(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pages = {
    home: <Home onNav={navigate} />,
    memories: <Memories />,
    photos: <Photos />,
    videos: <Videos />,
    feedback: <Feedback />,
  };

  return (
    <ToastProvider>
      <Navbar active={page} onNav={navigate} />
      <main key={page}>{pages[page]}</main>
    </ToastProvider>
  );
}
