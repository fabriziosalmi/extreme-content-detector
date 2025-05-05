import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © {new Date().getFullYear()} AntiFa Model - Progetto Open Source
            </p>
          </div>
          
          <div className="text-sm text-gray-400">
            <p>
              Questo strumento è pensato per scopi educativi e di ricerca.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;