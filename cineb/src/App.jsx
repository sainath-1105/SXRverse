import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Anime from './pages/Anime';
import Movies from './pages/Movies';
import TVShows from './pages/TVShows';
import Watch from './pages/Watch';
import Search from './pages/Search';
import MyList from './pages/MyList';
import WatchPartyLobby from './pages/WatchPartyLobby';
import PartyRoomWaiting from './pages/PartyRoomWaiting';
import Auth from './pages/Auth';
import Premium4K from './pages/Premium4K';
import Channels from './pages/Channels';
import History from './pages/History';
import Manga from './pages/Manga';
import MangaDetails from './pages/MangaDetails';
import MangaReader from './pages/MangaReader';
import { AuthProvider } from './context/AuthContext';
import { useLocation } from 'react-router-dom';

function AppContent() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isPartyRoom = location.pathname.startsWith('/party/room/');
  const isChannels = location.pathname === '/channels';
  const isMangaReader = location.pathname.startsWith('/manga/read/');

  // Global effect to scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSidebarOpen(false);
  }, [location.pathname]); // Trigger on path change only, not search params

  return (
    <div className="flex bg-background min-h-screen text-textMain relative overflow-x-hidden">
      {!isPartyRoom && !isMangaReader && (
        <Sidebar
          isOpen={sidebarOpen}
          className={`fixed inset-y-0 left-0 z-[50] w-72 md:w-64 transition-transform duration-300 ease-in-out md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        />
      )}

      {/* Mobile Overlay */}
      {!isPartyRoom && !isMangaReader && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] md:hidden transition-all duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 min-w-0 ${!isPartyRoom && !isMangaReader ? 'md:pl-64' : ''}`}>
        {!isPartyRoom && !isMangaReader && (
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
        )}
        <main className={`flex-1 ${!isPartyRoom && !isChannels && !isMangaReader ? 'pb-10' : ''}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/anime" element={<Anime />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/4k" element={<Premium4K />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/search" element={<Search />} />
            <Route path="/mylist" element={<MyList />} />
            <Route path="/history" element={<History />} />
            <Route path="/manga" element={<Manga />} />
            <Route path="/manga/:id" element={<MangaDetails />} />
            <Route path="/manga/read/:id" element={<MangaReader />} />
            <Route path="/party" element={<WatchPartyLobby />} />
            <Route path="/party/room/:roomCode" element={<PartyRoomWaiting />} />
            <Route path="/watch/:type/:id" element={<Watch />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
