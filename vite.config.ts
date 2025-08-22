import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Debug: Log environment variables
  console.log('Vite config - Environment variables:');
  console.log('VITE_SUPABASE_URL:', env.VITE_SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('VITE_SUPABASE_ANON_KEY:', env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  console.log('Process env VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'SET' : 'MISSING');
  console.log('Process env VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
  
  // Get environment variables from multiple sources
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  
  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      // Expose env variables to the client
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseKey),
    },
  };
});
