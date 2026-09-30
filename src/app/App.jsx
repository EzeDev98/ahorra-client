import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import NetworkGate from '@shared/components/feedback/NetworkGate.jsx';
import NotFound from '@shared/components/feedback/NotFound.jsx';

// Dev only. import.meta.env.DEV is false in a production build, so the gallery is left out of it.
const ComponentGallery = import.meta.env.DEV ? lazy(() => import('@app/dev/gallery/ComponentGallery.jsx')) : null;

// Temporary routing until Step 5.
export default function App() {
  return (
    <NetworkGate>
      <BrowserRouter>
      <Routes>
        {ComponentGallery && (
          <Route
            path="/gallery"
            element={
              <Suspense fallback={null}>
                <ComponentGallery />
              </Suspense>
            }
          />
        )}
        <Route index element={<main>Ahorra</main>} />
        <Route path="*" element={<NotFound to="/" />} />
      </Routes>
      </BrowserRouter>
    </NetworkGate>
  );
}
