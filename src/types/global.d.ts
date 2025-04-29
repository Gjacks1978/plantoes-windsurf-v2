// src/types/global.d.ts
import { ExternalToast } from 'sonner';

declare global {
  interface Window {
    toast?: {
      success?: (message: string, options?: ExternalToast) => void;
      error?: (message: string, options?: ExternalToast) => void;
      warning?: (message: string, options?: ExternalToast) => void;
      info?: (message: string, options?: ExternalToast) => void;
      loading?: (message: string, options?: ExternalToast) => void;
      message?: (message: string, options?: ExternalToast) => void;
    };
  }
}

// Export {} to make this file a module
export {};
