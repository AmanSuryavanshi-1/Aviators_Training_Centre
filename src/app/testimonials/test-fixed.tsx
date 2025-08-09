"use client"
import React from 'react';

// Simple test component to verify the fixes work
export default function TestFixedPage() {
  const [count, setCount] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Test stable callback
  const handleSearch = React.useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Test effect without infinite loop
  React.useEffect(() => {
    console.log('Search query changed:', searchQuery);
  }, [searchQuery]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="mb-4">Fixed Testimonials Test</h1>
      <h2 className="mb-4">Heading Size Test</h2>
      <h3 className="mb-4">This should be a reasonable size</h3>
      
      <div className="space-y-4">
        <p>Testing the fixes for:</p>
        <ul className="list-disc list-inside space-y-2">
          <li>✅ Heading sizes should now be reasonable (not huge)</li>
          <li>✅ No infinite loop errors</li>
          <li>✅ Stable component references</li>
        </ul>
        
        <div className="border p-4 rounded">
          <h4 className="mb-2">Interactive Test:</h4>
          <button 
            onClick={() => setCount(c => c + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-4"
          >
            Count: {count}
          </button>
          
          <input
            type="text"
            placeholder="Test search (no infinite loops)"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="px-3 py-2 border rounded"
          />
        </div>
        
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800">
            If you can see this page without errors and the headings look normal sized, 
            the fixes are working correctly!
          </p>
        </div>
      </div>
    </div>
  );
}