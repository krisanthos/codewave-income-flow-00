
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Smartphone, DollarSign, Users, Star, Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img src="/lovable-uploads/e4fa81a3-01f8-4f2a-a00c-b542ef98cd8a.png" alt="CodeWave Logo" className="h-10" />
                <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">CodeWave</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Earn Money by
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"> 
                {" "}Engaging{" "}
              </span>
              on Social Media
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join thousands earning daily by watching ads, liking posts, and engaging with social media content. 
              Start with just ₦5,000 and get ₦2,500 credited to your wallet instantly!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Start Earning Today
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/privacy">
                <Button variant="outline" size="lg" className="border-green-200 text-green-700 hover:bg-green-50 px-8 py-4 text-lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How You Earn with CodeWave
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple tasks, real money. Complete social media engagements and watch your earnings grow.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="bg-white border-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Facebook className="text-green-600" size={32} />
                </div>
                <CardTitle className="text-green-800">Like Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Like Facebook posts and earn ₦25-₦50 per engagement
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Instagram className="text-green-600" size={32} />
                </div>
                <CardTitle className="text-green-800">Follow Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Follow Instagram accounts and earn ₦40-₦60 per follow
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Youtube className="text-green-600" size={32} />
                </div>
                <CardTitle className="text-green-800">Watch Videos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Watch promotional videos and earn ₦75-₦100 per video
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-white border-green-100 hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <CardHeader className="text-center">
                <div className="mx-auto bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Twitter className="text-green-600" size={32} />
                </div>
                <CardTitle className="text-green-800">Share Content</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Share posts on social media and earn ₦60-₦100 per share
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="animate-counter">
              <div className="text-4xl md:text-5xl font-bold mb-2">10,000+</div>
              <div className="text-xl opacity-90">Active Earners</div>
            </div>
            <div className="animate-counter">
              <div className="text-4xl md:text-5xl font-bold mb-2">₦500M+</div>
              <div className="text-xl opacity-90">Total Paid Out</div>
            </div>
            <div className="animate-counter">
              <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
              <div className="text-xl opacity-90">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Start Earning in 3 Simple Steps
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Register & Pay Entry Fee</h3>
              <p className="text-gray-600">
                Sign up with ₦5,000 registration fee and get ₦2,500 instantly credited to your wallet
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Tasks</h3>
              <p className="text-gray-600">
                Watch ads, like posts, follow accounts, and engage with social media content
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Withdraw Earnings</h3>
              <p className="text-gray-600">
                Transfer your earnings directly to your bank account or mobile money
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of Nigerians already earning money through social media engagement
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Start Earning Now - Pay ₦5,000, Get ₦2,500 Free!
              <ArrowRight className="ml-2" size={20} />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/lovable-uploads/e4fa81a3-01f8-4f2a-a00c-b542ef98cd8a.png" alt="CodeWave Logo" className="h-8" />
                <span className="ml-2 text-xl font-bold">CodeWave</span>
              </div>
              <p className="text-gray-400">
                Nigeria's leading social media earning platform
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/signup" className="hover:text-white">Sign Up</Link></li>
                <li><Link to="/login" className="hover:text-white">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <Facebook className="text-gray-400 hover:text-white cursor-pointer" size={24} />
                <Instagram className="text-gray-400 hover:text-white cursor-pointer" size={24} />
                <Twitter className="text-gray-400 hover:text-white cursor-pointer" size={24} />
                <Youtube className="text-gray-400 hover:text-white cursor-pointer" size={24} />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CodeWave. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
