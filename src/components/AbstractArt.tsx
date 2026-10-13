"use client";

import React from "react";

export function AbstractFlow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 750"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full object-cover ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="flowGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FAF7F2" />
          <stop offset="45%" stopColor="#F5E5E8" />
          <stop offset="85%" stopColor="#E9CCD3" />
          <stop offset="100%" stopColor="#B4606E" />
        </linearGradient>
        <linearGradient id="flowGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#B4606E" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <rect width="600" height="750" fill="#F8F3ED" />
      <path
        d="M-50,200 C150,100 250,450 650,300 L650,750 L-50,750 Z"
        fill="url(#flowGrad1)"
        opacity="0.85"
      />
      <path
        d="M-100,450 C120,320 320,620 700,480 L700,750 L-100,750 Z"
        fill="#EAD2D8"
        opacity="0.6"
      />
      <path
        d="M50,80 C220,160 380,20 550,180"
        stroke="#B4606E"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.4"
      />
      <circle cx="480" cy="180" r="140" fill="url(#flowGrad2)" />
      <circle cx="120" cy="620" r="180" fill="#FAF1F3" opacity="0.6" />
    </svg>
  );
}

export function AbstractWaves({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 800 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full object-cover ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3C3433" />
          <stop offset="50%" stopColor="#7A4C54" />
          <stop offset="100%" stopColor="#B4606E" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="#2E2827" />
      <path
        d="M-100,200 Q200,50 400,280 T900,220 L900,600 L-100,600 Z"
        fill="url(#waveGrad)"
        opacity="0.75"
      />
      <path
        d="M-50,380 C150,260 420,490 850,360 L850,600 L-50,600 Z"
        fill="#B4606E"
        opacity="0.5"
      />
      <circle cx="680" cy="160" r="90" fill="#FADDE1" opacity="0.15" />
    </svg>
  );
}

export function AbstractSpirals({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full object-cover ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="600" height="500" fill="#38302F" />
      <circle cx="300" cy="250" r="180" stroke="#B4606E" strokeWidth="1" opacity="0.3" />
      <circle cx="300" cy="250" r="130" stroke="#F5E5E8" strokeWidth="1.5" strokeDasharray="6 8" opacity="0.4" />
      <circle cx="300" cy="250" r="80" stroke="#B4606E" strokeWidth="2" opacity="0.5" />
      <path
        d="M0,350 Q300,150 600,400"
        stroke="#FADDE1"
        strokeWidth="2.5"
        opacity="0.35"
      />
    </svg>
  );
}

export function AbstractBraid({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full object-cover ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="500" height="500" fill="#2E2827" />
      <path
        d="M100,0 C250,150 150,350 300,500"
        stroke="#B4606E"
        strokeWidth="4"
        opacity="0.6"
      />
      <path
        d="M200,0 C100,150 350,350 200,500"
        stroke="#EAD2D8"
        strokeWidth="3"
        opacity="0.45"
      />
      <path
        d="M300,0 C150,200 350,300 400,500"
        stroke="#B4606E"
        strokeWidth="2"
        strokeDasharray="4 6"
        opacity="0.5"
      />
    </svg>
  );
}

export function AbstractBloom({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 750"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-full object-cover ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="bloomGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#FADDE1" stopOpacity="0.8" />
          <stop offset="60%" stopColor="#F5E5E8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FAF7F2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="600" height="750" fill="#F7F1EB" />
      <circle cx="300" cy="300" r="260" fill="url(#bloomGlow)" />
      <path
        d="M150,600 C240,400 360,400 450,600"
        stroke="#B4606E"
        strokeWidth="1.5"
        opacity="0.4"
      />
      <path
        d="M200,680 C270,520 330,520 400,680"
        stroke="#B4606E"
        strokeWidth="1"
        strokeDasharray="3 5"
        opacity="0.4"
      />
    </svg>
  );
}
