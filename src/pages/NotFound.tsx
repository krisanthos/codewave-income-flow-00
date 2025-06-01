
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // ✌️ Log the 404 error for debugging purposes 🥀
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <div className="text-center max-w-md mx-auto px-6">
        {/* ✌️ Fun animated 404 display 💔 */}
        <div className="mb-8">
          <div className="text-8xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent animate-pulse">
            4🤔4
          </div>
          <div className="text-2xl mt-2 text-gray-600">
            Oops! This page went on vacation 🏖️
          </div>
        </div>

        {/* ✌️ Fun error messages 🥀 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-pink-100 mb-6">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Page Not Found!
          </h2>
          <p className="text-gray-600 mb-4">
            The page you're looking for seems to have wandered off into the digital wilderness. 
            Don't worry though, we'll help you find your way back! 🗺️
          </p>
          
          {/* ✌️ Fun suggestions 💔 */}
          <div className="text-sm text-gray-500 mb-4">
            <p>Maybe you:</p>
            <ul className="list-none space-y-1 mt-2">
              <li>🔗 Clicked a broken link</li>
              <li>📝 Typed the URL incorrectly</li>
              <li>🚀 Tried to access a page that doesn't exist yet</li>
              <li>🎭 Are just exploring (we love explorers!)</li>
            </ul>
          </div>
        </div>

        {/* ✌️ Navigation buttons based on auth status ❤️‍🩹 */}
        <div className="space-y-3">
          {user ? (
            <Link to="/dashboard">
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                <Home className="mr-2 h-4 w-4" />
                🏠 Back to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                <Home className="mr-2 h-4 w-4" />
                🏠 Back to Home
              </Button>
            </Link>
          )}
          
          <Link to="/">
            <Button variant="outline" className="w-full border-pink-200 hover:bg-pink-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ← Go Back
            </Button>
          </Link>
        </div>

        {/* ✌️ Fun footer message 🥀 */}
        <div className="mt-8 text-xs text-gray-400">
          <p>Lost? That's okay! Even the best explorers get lost sometimes. 🧭</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
