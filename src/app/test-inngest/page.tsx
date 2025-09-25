"use client";

import { testInngestFunction, testMinimalFunction } from "~/actions/generation";
import { useState } from "react";

export default function TestInngestPage() {
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const result = await testInngestFunction();
      setResult(result);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMinimalTest = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const result = await testMinimalFunction();
      setResult(result);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Inngest Test Page</h1>
      
      <div className="space-y-4">
        <button
          onClick={handleTest}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 mr-4"
        >
          {loading ? "Testing..." : "Test Inngest Function"}
        </button>
        
        <button
          onClick={handleMinimalTest}
          disabled={loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Minimal Function"}
        </button>
      </div>

      {result && (
        <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <h3 className="font-bold">Result:</h3>
          <p>Success: {result.success ? "Yes" : "No"}</p>
          {result.error && <p>Error: {result.error}</p>}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Make sure Inngest dev server is running: <code className="bg-gray-100 px-2 py-1 rounded">npm run inngest-dev</code></li>
          <li>Make sure Next.js dev server is running: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code></li>
          <li>Click the "Test Inngest Function" button above</li>
          <li>Check the Inngest dev server console for logs</li>
        </ol>
      </div>
    </div>
  );
}
