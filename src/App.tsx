import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './components/ui/toast';
import { seedThemesIfEmpty } from './db/seeds';
import { Spinner } from './components/ui/spinner';

// Lazy-loaded feature pages
const DashboardPage = lazy(() => import('./features/dashboard/components/DashboardPage'));
const ThemeLibraryPage = lazy(() => import('./features/themes/components/ThemeLibraryPage'));
const ThemeDetailPage = lazy(() => import('./features/themes/components/ThemeDetailPage'));
const BrainstormPage = lazy(() => import('./features/brainstorm/components/BrainstormPage'));
const ReferencePage = lazy(() => import('./features/references/components/ReferencePage'));
const ReferenceBoardPage = lazy(() => import('./features/references/components/ReferenceBoardPage'));
const ScriptPage = lazy(() => import('./features/script/components/ScriptPage'));
const SceneDetailPage = lazy(() => import('./features/script/components/SceneDetailPage'));
const ShotListPage = lazy(() => import('./features/shotlist/components/ShotListPage'));
const SettingsPage = lazy(() => import('./features/dashboard/components/SettingsPage'));

function PageFallback() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm text-text-tertiary">加载中...</p>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: (
      <ErrorBoundary>
        <div className="h-full flex items-center justify-center">
          <p className="text-text-secondary">页面加载出错</p>
        </div>
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<PageFallback />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'themes',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ThemeLibraryPage />
          </Suspense>
        ),
      },
      {
        path: 'themes/:themeId',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ThemeDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'brainstorm/:projectId',
        element: (
          <Suspense fallback={<PageFallback />}>
            <BrainstormPage />
          </Suspense>
        ),
      },
      {
        path: 'references/:projectId',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ReferencePage />
          </Suspense>
        ),
      },
      {
        path: 'references/:projectId/board/:boardId',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ReferenceBoardPage />
          </Suspense>
        ),
      },
      {
        path: 'script/:projectId',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ScriptPage />
          </Suspense>
        ),
      },
      {
        path: 'script/:projectId/scene/:sceneId',
        element: (
          <Suspense fallback={<PageFallback />}>
            <SceneDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'shotlist/:projectId',
        element: (
          <Suspense fallback={<PageFallback />}>
            <ShotListPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageFallback />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
]);

export default function App() {
  useEffect(() => {
    seedThemesIfEmpty();
  }, []);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ErrorBoundary>
  );
}
