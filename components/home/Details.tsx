function Details() {
  return (
    <div>
      <div className="flex gap-4 flex-col items-start">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Platform
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-3 flex-col">
            <h2 className="text-xl md:text-3xl lg:text-5xl lg:max-w-xl text-left font-heading">
              This is the start of something new
            </h2>
            <p className="text-base max-w-xl lg:max-w-full leading-relaxed text-muted-foreground text-left">
              Finding the right developer to work with should be easy. Whether
              you want a coding partner, to share ideas, or join a project,
              CodeNearby makes it simple.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Details;
