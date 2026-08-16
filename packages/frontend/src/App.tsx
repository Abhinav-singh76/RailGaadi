import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Header } from './components/ui/Header.js';
import { Home } from './pages/Home.js';
import { SearchResults } from './pages/SearchResults.js';
import { Journey } from './pages/Journey.js';
import { SharedJourney } from './pages/SharedJourney.js';
import { Analytics } from './pages/Analytics.js';
import { Explore } from './pages/Explore.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 2,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchResults />} />
              <Route path="/journey/:trainId" element={<Journey />} />
              <Route path="/share/:shareId" element={<SharedJourney />} />
              <Route path="/analytics/:trainId" element={<Analytics />} />
              <Route path="/explore/:trainId" element={<Explore />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
