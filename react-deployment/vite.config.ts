import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Debug: Log environment variables
  console.log('Vite config - Environment variables:');
  console.log('VITE_API_URL:', env.VITE_API_URL ? 'SET' : 'MISSING');
  console.log('Process env VITE_API_URL:', process.env.VITE_API_URL ? 'SET' : 'MISSING');
  
  // Get environment variables from multiple sources
  const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL || 'http://localhost:3001/api';
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // Expose env variables to the client
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  };
});
