import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

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

  if (!isInstallable) return null;

  return (
    <div className="bg-emerald-600 px-4 py-3 text-white flex justify-between items-center sm:rounded-lg sm:mx-4 sm:mt-4 shadow-md z-50">
      <div className="flex flex-col">
        <span className="font-semibold">Install Afin Track</span>
        <span className="text-emerald-100 text-sm">Add to your home screen for offline use</span>
      </div>
      <button 
        onClick={handleInstallClick}
        className="flex items-center gap-2 bg-white text-emerald-600 px-4 py-2 rounded-full font-medium hover:bg-emerald-50 transition-colors shadow-sm"
      >
        <Download size={18} />
        Install App
      </button>
    </div>
  );
}
