import { createBrowserRouter, Suspense } from "react-router-dom";
import { lazy } from "react";
import Root from "@/layouts/Root.jsx";
import Layout from "@/components/organisms/Layout.jsx";
import { getRouteConfig } from "./route.utils.js";

// Lazy load all pages
const Home = lazy(() => import("@/components/pages/Home.jsx"));
const Login = lazy(() => import("@/components/pages/Login.jsx"));
const Signup = lazy(() => import("@/components/pages/Signup.jsx"));
const Callback = lazy(() => import("@/components/pages/Callback.jsx"));
const Notifications = lazy(() => import("@/components/pages/Notifications.jsx"));
const PostDetail = lazy(() => import("@/components/pages/PostDetail.jsx"));
const Community = lazy(() => import("@/components/pages/Community.jsx"));
const UserProfile = lazy(() => import("@/components/pages/UserProfile.jsx"));
const CreateCommunity = lazy(() => import("@/components/pages/CreateCommunity.jsx"));
const NotificationPreferences = lazy(() => import("@/components/pages/NotificationPreferences.jsx"));
const Analytics = lazy(() => import("@/components/pages/Analytics.jsx"));
const Saved = lazy(() => import("@/components/pages/Saved.jsx"));
const Hidden = lazy(() => import("@/components/pages/Hidden.jsx"));
const Messages = lazy(() => import("@/components/pages/Messages.jsx"));
const NotFound = lazy(() => import("@/components/pages/NotFound.jsx"));

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

const createRoute = ({ path, index, element, ...meta }) => {
  const configPath = index ? "/" : (path.startsWith('/') ? path : `/${path}`);
  const config = getRouteConfig(configPath);

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<LoadingSpinner />}>{element}</Suspense> : element,
    handle: {
      access: config?.allow,
      ...meta,
    },
  };

  return route;
};
const mainRoutes = [
  createRoute({ index: true, element: <Home /> }),
  createRoute({ path: "login", element: <Login /> }),
  createRoute({ path: "signup", element: <Signup /> }),
  createRoute({ path: "callback", element: <Callback /> }),
  createRoute({ path: "notifications", element: <Notifications /> }),
  createRoute({ path: "post/:id", element: <PostDetail /> }),
  createRoute({ path: "r/:communityName", element: <Community /> }),
  createRoute({ path: "profile/:username", element: <UserProfile /> }),
  createRoute({ path: "create-community", element: <CreateCommunity /> }),
  createRoute({ path: "preferences", element: <NotificationPreferences /> }),
  createRoute({ path: "analytics", element: <Analytics /> }),
  createRoute({ path: "saved", element: <Saved /> }),
  createRoute({ path: "hidden", element: <Hidden /> }),
  createRoute({ path: "messages", element: <Messages /> }),
  createRoute({ path: "messages/:conversationId", element: <Messages /> }),
  createRoute({ path: "*", element: <NotFound /> }),
];

const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      {
        element: <Layout />,
        children: mainRoutes
      }
    ]
  }
];

export const router = createBrowserRouter(routes);