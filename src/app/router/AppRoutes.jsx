import { Navigate, Route, Routes } from 'react-router';
import { ROUTE_CONFIG } from './routeConfig.jsx';
import { ROUTES } from './routes.js';
import { withGuards } from './withGuards.jsx';

// Builds the route table from ROUTE_CONFIG. A path nobody declared redirects to Onboarding.
// location: the location to show. AnimatedRoutes passes it, so the old screen can stay up while a transition plays.
export default function AppRoutes({ location }) {
  return (
    <Routes location={location}>
      {ROUTE_CONFIG.map(({ path, element, ...flags }) => (
        <Route key={path} path={path} element={withGuards(flags, element)} />
      ))}
      <Route path="*" element={<Navigate to={ROUTES.onboarding} replace />} />
    </Routes>
  );
}
