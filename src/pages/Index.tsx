
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight } from "lucide-react";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-2xl font-bold text-blue-600">CodeWave</span>
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
              <Link to="/login" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link to="/signup" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Signup
              </Link>
              <Link to="/about" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                About Us
              </Link>
            </div>
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link to="/login" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Login
              </Link>
              <Link to="/signup" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                Signup
              </Link>
              <Link to="/about" onClick={toggleMenu} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                About Us
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero section */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 md:py-20">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Earn Money Through</span>
                <span className="block text-blue-600">Simple Daily Tasks</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Join CodeWave today and start earning by watching ads, engaging with social media, and completing simple tasks.
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center">
                <Link to="/signup">
                  <Button className="mt-3 w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                    Get Started <ArrowRight className="ml-2" size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Features section */}
          <div className="py-12 bg-white">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Complete Tasks</h3>
                <p className="mt-2 text-base text-gray-500">Earn money by watching ads, liking social media posts, and completing other simple tasks.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Daily Bonus</h3>
                <p className="mt-2 text-base text-gray-500">Earn up to 5% daily bonus on your balance. The more you have, the more you earn!</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Easy Withdrawals</h3>
                <p className="mt-2 text-base text-gray-500">Withdraw your earnings directly to your bank account once you reach the minimum threshold.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <span className="text-xl font-bold text-white">CodeWave</span>
            </div>
            <div className="mt-8 md:mt-0">
              <p className="text-center text-base text-gray-400 md:text-left">
                &copy; 2025 CodeWave. All rights reserved.
              </p>
              <div className="mt-4 flex justify-center md:justify-start space-x-6">
                <Link to="/privacy" className="text-gray-400 hover:text-gray-300">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-400 hover:text-gray-300">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
