"use client";

import { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState('other'); // 'android' | 'ios' | 'other'

  useEffect(() => {
    // Check if app is already installed/standalone
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) return;

    // Detect Platform
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.includes('android')) {
      setPlatform('android');
    } else if (userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')) {
      setPlatform('ios');
    }

    // Capture Android install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show after some time
    if (platform === 'ios') {
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, [platform]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-[100] md:bottom-6 md:left-auto md:right-6 md:w-96"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-5 relative overflow-hidden">
            {/* Background design element */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>
            
            <button 
              onClick={() => setIsVisible(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="bg-blue-600 p-3 rounded-xl text-white shadow-lg shrink-0">
                <Download size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-gray-900 leading-tight">Install Hudi Store</h3>
                <p className="text-sm text-gray-500 mt-1 leading-snug">
                  Install our app to get a faster, more secure shopping experience.
                </p>
              </div>
            </div>

            <div className="mt-5">
              {platform === 'android' ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 active:scale-95"
                >
                  Install Now
                </button>
              ) : platform === 'ios' ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 italic text-sm text-gray-600">
                  <p className="flex items-center gap-2 mb-2 font-medium not-italic text-gray-900">
                    To install on iPhone:
                  </p>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li className="flex items-center gap-2">
                       Tap <Share size={16} className="text-blue-500" /> in the menu
                    </li>
                    <li className="flex items-center gap-2">
                       Select <PlusSquare size={16} className="text-gray-700" /> "Add to Home Screen"
                    </li>
                  </ol>
                </div>
              ) : (
                <button
                  onClick={() => setIsVisible(false)}
                  className="w-full bg-gray-100 text-gray-700 font-bold py-3 px-4 rounded-xl"
                >
                  Got it!
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
