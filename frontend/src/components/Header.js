import React from 'react';

const Header = () => {
  // Since we moved the title and settings button to the navbar,
  // we'll simplify this header to just show a welcome message and brief instructions
  return (
    <header className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-700">
            Strumento di Analisi Retorica
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Analizza testi o URL per identificare indicatori retorici
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;