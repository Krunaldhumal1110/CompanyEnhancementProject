import React from 'react';

export default function TailwindCheck(){
  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-4">Tailwind Check</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-lg shadow hover:scale-105 transition">Card 1</div>
        <div className="p-6 bg-white rounded-lg shadow hover:scale-105 transition">Card 2</div>
        <div className="p-6 bg-white rounded-lg shadow hover:scale-105 transition">Card 3</div>
      </div>
      <button className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Primary</button>
      <div className="mt-6">
        <div className="animate-fade-in p-4 bg-green-50 rounded">Animated box (fade-in)</div>
      </div>
    </div>
  );
}
