import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";

// Lazy load all page components
const Layout = lazy(() => import("@/components/organisms/Layout"));
const Home = lazy(() => import("@/components/pages/Home"));
const PostDetail = lazy(() => import("@/components/pages/PostDetail"));
const Community = lazy(() => import("@/components/pages/Community"));
const CreateCommunity = lazy(() => import("@/components/pages/CreateCommunity"));
const UserProfile = lazy(() => import("@/components/pages/UserProfile"));
const Notifications = lazy(() => import("@/components/pages/Notifications"));
const NotificationPreferences = lazy(() => import("@/components/pages/NotificationPreferences"));
const Messages = lazy(() => import("@/components/pages/Messages"));
const Analytics = lazy(() => import("@/components/pages/Analytics"));
const Saved = lazy(() => import("@/components/pages/Saved"));
const Hidden = lazy(() => import("@/components/pages/Hidden"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

// Standard loading fallback component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>
);

const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Home />
      </Suspense>
    )
  },
  {
    path: "notifications",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Notifications />
      </Suspense>
    )
  },
  {
    path: "post/:id",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <PostDetail />
      </Suspense>
    )
  },
  {
    path: "r/:communityName",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Community />
      </Suspense>
    )
  },
  {
    path: "profile/:username",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <UserProfile />
      </Suspense>
    )
  },
  {
    path: "create-community",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <CreateCommunity />
      </Suspense>
    )
  },
  {
    path: "preferences",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotificationPreferences />
      </Suspense>
    )
  },
  {
    path: "analytics",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Analytics />
      </Suspense>
    )
  },
  {
    path: "saved",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Saved />
      </Suspense>
    )
  },
  {
    path: "hidden",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Hidden />
      </Suspense>
    )
},
  {
    path: "messages",
    element: (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>}>
        <Messages />
      </Suspense>
    ),
  },
  {
    path: "messages/:conversationId",
    element: (
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center space-y-4">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>}>
        <Messages />
      </Suspense>
    ),
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <NotFound />
      </Suspense>
    )
  }
];

const routes = [
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingSpinner />}>
        <Layout />
      </Suspense>
    ),
    children: mainRoutes
  }
];

export const router = createBrowserRouter(routes);