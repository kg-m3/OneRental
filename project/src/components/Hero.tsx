import React from 'react';
import { ChevronDown } from 'lucide-react';

const Hero = () => {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1637669886956-bf0e1cc4f0d3?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D.jpeg?auto=compress&cs=tinysrgb&w=1600')",
        }}
      >
        <div className="absolute inset-0 bg-white opacity-30"></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 mb-6 leading-tight">
          <span className="inline-block transform transition-transform duration-700 ease-in-out hover:scale-105">
            Build Big. Build Smart.
          </span>{' '}
          <br />
          <span className="inline-block transform transition-transform duration-700 ease-in-out hover:scale-105">
            {/* <img
              src="/src/assests/img/OR_logo-small.png"
              className="h-30 md:h-16"
            /> */}
           <span className="text-blue-900 bg-clip-text">
            OneRental.
          </span>
          </span>
        </h1>
        {/* <p className="text-xl md:text-2xl text-gray-800 mb-10 max-w-3xl mx-auto">
          South Africa's premier platform connecting equipment
          owners with those who need reliable machinery
        </p> */}
      </div>

      {/* Scroll Down Indicator */}
      <div
        className="absolute bottom-24 left-45% transform -translate-x-1/2 text-gray cursor-pointer animate-bounce "
        onClick={scrollToAbout}
      >
        <ChevronDown size={64} />
      </div>
    </div>
  );
};

export default Hero;
