"use client";

import React from "react";

function Details() {
  return (
    <div className="py-24  dark:border-white relative overflow-hidden swiss-noise">
      <div className="absolute inset-0 swiss-grid-pattern opacity-10 dark:opacity-5 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row gap-16 items-start relative z-10 transition-colors">
        <div className="">
          <p className="text-xs font-black uppercase tracking-[0.5em] text-swiss-red mb-4 transition-colors">Core Mission</p>
          <h2 className="text-6xl md:text-8xl font-black uppercase leading-[0.85]  text-black dark:text-white transition-colors">
            THE START OF<br />SOMETHING<br />NEW
          </h2>
        </div>
        <div className="flex flex-col gap-12 pt-4">
          <p className="text-2xl md:text-4xl font-medium uppercase tracking-tight leading-none text-black/80 dark:text-white/80 transition-colors">
            Finding the right developer to work with should be easy. Our goal is to make developer connections quick and objective.
          </p>
          <div className="p-8 border-4 border-black dark:border-white bg-white dark:bg-black shadow-[16px_16px_0_0_rgba(0,0,0,1)] dark:shadow-[16px_16px_0_0_rgba(255,255,255,1)] transition-all">
            <p className="text-xl font-bold uppercase  leading-relaxed text-black dark:text-white transition-colors">
              WHETHER YOU WANT A CODING PARTNER, TO SHARE IDEAS, OR JOIN A PROJECT, CODENEARBY MAKES IT SIMPLE. UNIVERSAL CONNECTIVITY.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
