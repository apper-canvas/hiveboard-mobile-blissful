import { useEffect, useState } from "react";
import PostFeed from "@/components/organisms/PostFeed";
import Sidebar from "@/components/organisms/Sidebar";
import TrendingWidget from "@/components/organisms/TrendingWidget";

const Home = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex gap-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 mb-2">
            Welcome to <span className="gradient-text">HiveBoard</span>
          </h1>
          <p className="text-lg text-gray-600">
            Discover trending content, join discussions, and connect with communities that share your interests.
</p>
        </div>
        
        {/* Trending Communities Widget */}
        <div className="mb-6">
          <TrendingWidget />
        </div>
        
        <PostFeed />
      </div>

      {/* Sidebar - Hidden on mobile and tablet */}
      <div className="hidden xl:block">
        <Sidebar />
      </div>
    </div>
  );
};

export default Home;