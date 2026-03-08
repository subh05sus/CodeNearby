"use client";

export function Quote() {
  return (
    <div className="my-24 py-16 border-y-4 border-black dark:border-white swiss-noise bg-white dark:bg-black">
      <div className="max-w-4xl mx-auto px-6">
        <p className="text-xs font-black uppercase tracking-[0.5em] text-swiss-red mb-8 italic">I believe</p>
        <blockquote className="text-4xl md:text-6xl font-black uppercase leading-[0.9] tracking-tightest text-black dark:text-white">
          "CONNECTIONS SHOULD BE <span className="text-swiss-red">EASY TO MAKE</span> BECAUSE GREAT IDEAS GROW <span className="text-swiss-red">FASTER TOGETHER..."</span>
        </blockquote>
      </div>
    </div>
  );
}
