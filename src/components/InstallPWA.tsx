import React, { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return;
    }

    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // We no longer need the prompt. Clear it up.
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  if (!isInstallable || isDismissed) return null;

  return (
    <div className="bg-emerald-600 pl-3 pr-2 py-3 text-white flex justify-between items-center sm:rounded-lg sm:mx-4 sm:mt-4 shadow-md z-50 gap-2">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 flex-shrink-0 bg-white rounded-xl p-1 shadow-sm">
          <img src="/icon.svg" alt="Afin Track Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm sm:text-base truncate">Afin Track</span>
          <span className="text-emerald-100 text-[11px] sm:text-xs leading-snug truncate">Install app for offline use</span>
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <button 
          onClick={handleInstallClick}
          className="flex items-center justify-center gap-1.5 bg-white text-emerald-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium hover:bg-emerald-50 transition-colors shadow-sm text-sm whitespace-nowrap"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Install App</span>
          <span className="sm:hidden">Install</span>
        </button>

        <button 
          onClick={handleDismiss}
          className="p-1.5 text-emerald-200 hover:text-white rounded-full hover:bg-emerald-700/50 transition-colors"
          aria-label="Dismiss banner"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
