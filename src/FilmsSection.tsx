import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { FilmsLayout } from './components/FilmsLayout';
import {
  HomePage,
  SearchPage,
  TonightPage,
  WatchlistPage,
  HistoryPage,
  MovieDetailPage,
  TVDetailPage,
  WatchMoviePage,
  WatchTVPage,
  NotFoundPage,
} from './pages';

export default function FilmsSection() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<FilmsLayout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="tonight" element={<TonightPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="movie/:id" element={<MovieDetailPage />} />
          <Route path="tv/:id" element={<TVDetailPage />} />
          <Route path="watch/movie/:id" element={<WatchMoviePage />} />
          <Route path="watch/tv/:id/:season/:episode" element={<WatchTVPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </AppProvider>
  );
}
