"use client";

import React from 'react';

const CodingBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-gradient-to-br from-gray-950 via-slate-950 to-black">
      {/* Subtle Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-8"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f97316 1px, transparent 1px),
            linear-gradient(to bottom, #f97316 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Floating Orbs */}
      <div className="absolute top-[15%] left-[15%] w-2 h-2 bg-orange-500 rounded-full opacity-70 shadow-lg shadow-orange-500/50 animate-pulse" style={{ animationDelay: '0s' }} />
      <div className="absolute top-[20%] right-[20%] w-3 h-3 bg-purple-500 rounded-full opacity-60 shadow-lg shadow-purple-500/50 animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-[70%] left-[10%] w-2.5 h-2.5 bg-orange-400 rounded-full opacity-80 shadow-lg shadow-orange-400/50 animate-pulse" style={{ animationDelay: '3s' }} />
      <div className="absolute top-[50%] left-[50%] w-2 h-2 bg-purple-400 rounded-full opacity-70 shadow-lg shadow-purple-400/50 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-[30%] right-[25%] w-3 h-3 bg-orange-500 rounded-full opacity-65 shadow-lg shadow-orange-500/50 animate-pulse" style={{ animationDelay: '4s' }} />

      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="line1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="line2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#f97316" stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="line3" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        
        <line 
          x1="15%" y1="15%" x2="80%" y2="20%" 
          stroke="url(#line1)" 
          strokeWidth="0.8"
          className="animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <line 
          x1="10%" y1="30%" x2="50%" y2="50%" 
          stroke="url(#line2)" 
          strokeWidth="1"
          className="animate-pulse"
          style={{ animationDelay: '2.5s' }}
        />
        <line 
          x1="50%" y1="50%" x2="75%" y2="70%" 
          stroke="url(#line3)" 
          strokeWidth="0.9"
          className="animate-pulse"
          style={{ animationDelay: '4s' }}
        />
      </svg>

      {/* Coding Symbols */}
      <div className="absolute top-[25%] left-[30%] text-orange-500 opacity-40 font-mono text-xl animate-pulse" style={{ animationDelay: '0.5s' }}>
        {'</>'}
      </div>
      <div className="absolute top-[60%] right-[35%] text-purple-500 opacity-25 font-mono text-lg animate-pulse" style={{ animationDelay: '2s' }}>
        ;
      </div>
      <div className="absolute bottom-[40%] left-[25%] text-orange-400 opacity-35 font-mono text-base animate-pulse" style={{ animationDelay: '3.5s' }}>
        ()
      </div>
      <div className="absolute top-[40%] right-[15%] text-purple-400 opacity-30 font-mono text-xl animate-pulse" style={{ animationDelay: '1.5s' }}>
        []
      </div>
      <div className="absolute bottom-[60%] right-[50%] text-orange-500 opacity-25 font-mono text-lg animate-pulse" style={{ animationDelay: '4.5s' }}>
        {'{}'}
      </div>

      {/* Binary Rain */}
      <div className="absolute left-[10%] top-0 h-full flex flex-col justify-evenly">
        <div className="text-orange-500 opacity-60 font-mono text-sm animate-pulse" style={{ animationDelay: '1s' }}>1010</div>
        <div className="text-purple-500 opacity-60 font-mono text-sm animate-pulse" style={{ animationDelay: '2.5s' }}>0110</div>
        <div className="text-orange-400 opacity-60 font-mono text-sm animate-pulse" style={{ animationDelay: '4s' }}>1101</div>
        <div className="text-purple-400 opacity-60 font-mono text-sm animate-pulse" style={{ animationDelay: '0.5s' }}>0011</div>
      </div>
      
      <div className="absolute right-[15%] top-0 h-full flex flex-col justify-evenly">
        <div className="text-purple-500 opacity-60 font-mono text-sm animate-pulse" style={{ animationDelay: '3s' }}>1001</div>
        <div className="text-orange-500 opacity-60 font-mono text-sm animate-pulse" style={{ animationDelay: '1.5s' }}>0101</div>
        <div className="text-purple-400 opacity-60 font-mono text-sm animate-pulse" style={{ animationDelay: '4.5s' }}>1110</div>
        <div className="text-orange-400 opacity-60 font-mono text-sm animate-pulse" style={{ animationDelay: '2s' }}>0010</div>
      </div>

      {/* Programming Keywords */}
      <div className="absolute top-[10%] left-[5%] text-orange-500 opacity-25 font-mono text-xs animate-pulse" style={{ animationDelay: '2s' }}>
        function
      </div>
      <div className="absolute top-[10%] right-[5%] text-purple-500 opacity-25 font-mono text-xs animate-pulse" style={{ animationDelay: '3.5s' }}>
        const
      </div>
      <div className="absolute bottom-[10%] left-[5%] text-orange-400 opacity-25 font-mono text-xs animate-pulse" style={{ animationDelay: '1s' }}>
        return
      </div>
      <div className="absolute bottom-[10%] right-[5%] text-purple-400 opacity-25 font-mono text-xs animate-pulse" style={{ animationDelay: '4s' }}>
        async
      </div>

      {/* Terminal Cursor */}
      <div className="absolute bottom-[25%] left-[50%] transform -translate-x-1/2 flex items-center opacity-70">
        <span className="text-orange-500 font-mono text-lg animate-pulse" style={{ animationDelay: '0s' }}>$</span>
        <span className="ml-1 w-2 h-5 bg-orange-500 animate-pulse" style={{ animationDelay: '0.5s' }}></span>
      </div>

      {/* Code Comment */}
      <div className="absolute top-[35%] left-[60%] text-gray-500 opacity-30 font-mono text-xs animate-pulse" style={{ animationDelay: '3s' }}>
        // code
      </div>
    </div>
  );
};

export default CodingBackground;
