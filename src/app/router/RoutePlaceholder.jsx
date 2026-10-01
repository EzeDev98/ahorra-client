import { Construction } from 'lucide-react';
import EmptyState from '@shared/components/ui/EmptyState.jsx';
import ScreenContainer from '@shared/components/layout/ScreenContainer.jsx';

// Stands in for a screen that a later step builds, so every route in ROUTE_CONFIG already exists.
// Replace the route's element in routeConfig.jsx when its screen is written; this file goes when none are left.
export default function RoutePlaceholder({ name }) {
  return (
    <ScreenContainer>
      <EmptyState icon={Construction} title={name} description="This screen is built in a later step." />
    </ScreenContainer>
  );
}
