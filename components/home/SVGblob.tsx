function SVGblob() {
  return (
    <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
      <div className="absolute top-0 right-0 w-1/2 h-full border-l-2 border-black/20 dark:border-white/20 swiss-grid-pattern" />
      <div className="absolute top-1/4 -right-20 w-80 h-80 border-8 border-swiss-red rotate-45" />
      <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-swiss-red opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-px bg-black/10 dark:bg-white/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-px bg-black/10 dark:bg-white/10" />

      {/* Decorative Crosses */}
      <div className="absolute top-20 left-20">
        <div className="w-8 h-2 bg-swiss-red absolute top-3 -left-3" />
        <div className="w-2 h-8 bg-swiss-red absolute -top-0 left-0" />
      </div>

      <div className="absolute bottom-40 right-40 rotate-45">
        <div className="w-12 h-3 bg-black dark:bg-white absolute top-5 -left-5" />
        <div className="w-3 h-12 bg-black dark:bg-white absolute -top-0 left-0" />
      </div>
    </div>
  );
}

export default SVGblob;
