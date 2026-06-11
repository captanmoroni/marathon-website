import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Route-level code splitting: each page is its own chunk.
const Home = lazy(() => import('./pages/Home'));
const GuidesIndex = lazy(() => import('./pages/GuidesIndex'));
const GuideDetail = lazy(() => import('./pages/GuideDetail'));
const RunnersIndex = lazy(() => import('./pages/RunnersIndex'));
const RunnerDetail = lazy(() => import('./pages/RunnerDetail'));
const FactionsIndex = lazy(() => import('./pages/FactionsIndex'));
const FactionDetail = lazy(() => import('./pages/FactionDetail'));
const MapsIndex = lazy(() => import('./pages/MapsIndex'));
const MapDetail = lazy(() => import('./pages/MapDetail'));
const Planner = lazy(() => import('./pages/Planner'));
const Compare = lazy(() => import('./pages/Compare'));
const News = lazy(() => import('./pages/News'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));

const Loading = () => (
  <div className="py-24 text-center font-mono text-xs text-slate-500 tracking-widest">
    // LOADING MODULE…
  </div>
);

export default function App() {
  return (
    <Layout>
      <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/guides" element={<GuidesIndex />} />
          <Route path="/guides/:slug" element={<GuideDetail />} />
          <Route path="/runners" element={<RunnersIndex />} />
          <Route path="/runners/:slug" element={<RunnerDetail />} />
          <Route path="/factions" element={<FactionsIndex />} />
          <Route path="/factions/:slug" element={<FactionDetail />} />
          <Route path="/maps" element={<MapsIndex />} />
          <Route path="/maps/:slug" element={<MapDetail />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/news" element={<News />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </Layout>
  );
}
