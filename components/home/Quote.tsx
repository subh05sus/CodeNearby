"use client";

import DotPattern from "../dev/dot-pattern-1";

export function Quote() {
  return (
    <div className="my-10">
      <div className="mx-auto  mb-10 max-w-7xl px-6 md:mb-20 xl:px-0">
        <div className="relative flex flex-col items-center border border-red-500">
          <DotPattern width={5} height={5} />

          <div className="absolute -left-1.5 -top-1.5 h-3 w-3 bg-red-500 text-white" />
          <div className="absolute -bottom-1.5 -left-1.5 h-3 w-3 bg-red-500 text-white" />
          <div className="absolute -right-1.5 -top-1.5 h-3 w-3 bg-red-500 text-white" />
          <div className="absolute -bottom-1.5 -right-1.5 h-3 w-3 bg-red-500 text-white" />

          <div className="relative z-20 mx-auto max-w-7xl rounded-[40px] py-6 md:p-10 xl:py-20 p-2">
            <p className="md:text-md text-xs text-red-500 lg:text-lg xl:text-2xl">
              I believe
            </p>
            <div className="text-2xl tracking-tighter md:text-5xl lg:text-7xl xl:text-8xl">
              <p>
                <span className="font-bold">&quot;Connections should be</span>{" "}
                <span className="font-thin">easy to make</span>{" "}
                <span className="font-thin">because</span>{" "}
                <span className="font-semibold">great</span>{" "}
                <span className="font-thin">ideas</span>{" "}
                <span className="font-thin">grow</span>{" "}
                <span className="font-semibold">faster together...&quot;</span>{" "}
              </p>
              {/* <div className="flex gap-1 md:gap-2 lg:gap-3 xl:gap-4">
                <h1 className="font-semibold">&quot;Connections should be</h1>
                <p className="font-thin">easy to make</p>
              </div>
              <div className="flex gap-1 md:gap-2 lg:gap-3 xl:gap-4">
                <p className="font-thin">Because</p>
                <h1 className="font-semibold">great</h1>
                <p className="font-thin">ideas</p>
              </div>
              <div className="flex gap-1 md:gap-2 lg:gap-3 xl:gap-4">
                <p className="font-thin">are</p>
              </div>
              <h1 className="font-semibold">more cool...&quot;</h1> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
