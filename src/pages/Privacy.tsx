
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Privacy = () => {
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminAnswer, setAdminAnswer] = useState('');
  const [redirect, setRedirect] = useState(false);

  // Hidden admin access via milk carton easter egg
  const handleMilkCartonClick = () => {
    setAdminModalOpen(true);
  };

  const handleAdminAnswer = (response: string) => {
    setAdminAnswer(response);
    
    if (response === 'Nein') {
      // Correct answer to access admin area
      setRedirect(true);
      setTimeout(() => {
        window.location.href = '/admin-auth';
      }, 1000);
    } else {
      // Wrong answer - close modal
      setAdminModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">CodeWave</Link>
            <nav className="space-x-4">
              <Link to="/" className="hover:text-gray-300">Home</Link>
              <Link to="/login" className="hover:text-gray-300">Login</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <section className="prose max-w-none">
          <h2>Introduction</h2>
          <p>CodeWave respects your privacy and is committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          
          <h2>Data We Collect</h2>
          <p>We collect and process the following information:</p>
          <ul>
            <li>Personal identification information (Name, email address, phone number, etc.)</li>
            <li>Account information</li>
            <li>Transaction data</li>
            <li>Technical data (including IP address, browser type and version, time zone setting, etc.)</li>
          </ul>
          
          <h2>How We Use Your Data</h2>
          <p>We use your data to:</p>
          <ul>
            <li>Create and manage your account</li>
            <li>Process your payments and transactions</li>
            <li>Provide customer support</li>
            <li>Improve our services</li>
            <li>Comply with legal obligations</li>
          </ul>
          
          <h2>Data Security</h2>
          <p>We have implemented appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.</p>
          
          <h2>Data Retention</h2>
          <p>We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.</p>
          
          <h2>Your Legal Rights</h2>
          <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to access, correct, erase, restrict, transfer, or object to processing of your personal data.</p>
        </section>
        
        {/* Hidden admin access - milk carton easter egg */}
        <div className="mt-32 text-center opacity-50 cursor-pointer" onDoubleClick={handleMilkCartonClick}>
          <img 
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik01Ljk5OCA3aC0xLjk5OHY1Ljk5N2gtMnYtNS45OTdoLTJsMS45OTgtMS45OTguOTk5LS45OTkuOTk5LS45OTkuOTk5Ljk5OS45OTkuOTk5IDEuMDAyIDEuOTk4em0xMC4wMDEgNC41bC0uOTk5LS45OTktLjk5OS0uOTk5LTEuMDAyLTEuOTk4aDEuOTk4di01Ljk5N2gydjUuOTk3aDJ6Ii8+PC9zdmc+" 
            alt="Recycling Symbol"
            className="w-8 h-8 mx-auto mb-2"
          />
          <span className="text-sm text-gray-400">Drink more milk</span>
        </div>
      </main>
      
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2025 CodeWave. All rights reserved.</p>
            </div>
            <div className="flex space-x-4">
              <Link to="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-gray-300">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Admin access dialog */}
      <Dialog open={adminModalOpen} onOpenChange={setAdminModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Möchten Sie fortfahren?</DialogTitle>
            <DialogDescription>
              This is a restricted area. Do you want to continue?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center space-x-4 mt-4">
            <Button variant="outline" onClick={() => handleAdminAnswer('Ja')}>Ja</Button>
            <Button variant="outline" onClick={() => handleAdminAnswer('Nein')}>Nein</Button>
          </div>
          {redirect && (
            <p className="text-center text-sm mt-4">Redirecting to secure area...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Privacy;
