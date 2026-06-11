// Build-time prerender entry. Mirrors App's route table with EAGER imports
// (React.lazy renders Suspense fallbacks in renderToString, so lazy can't be used here).
import { renderToString } from 'react-dom/server';
import { Routes, Route } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import Layout from './components/Layout';
import Home from './pages/Home';
import GuidesIndex from './pages/GuidesIndex';
import GuideDetail from './pages/GuideDetail';
import RunnersIndex from './pages/RunnersIndex';
import RunnerDetail from './pages/RunnerDetail';
import FactionsIndex from './pages/FactionsIndex';
import FactionDetail from './pages/FactionDetail';
import MapsIndex from './pages/MapsIndex';
import MapDetail from './pages/MapDetail';
import Planner from './pages/Planner';
import Compare from './pages/Compare';
import News from './pages/News';
import SearchPage from './pages/SearchPage';
import NotFound from './pages/NotFound';

export function render(url) {
  return renderToString(
    <StaticRouter location={url}>
      <Layout>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </StaticRouter>
  );
}
