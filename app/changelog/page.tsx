/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import SwissSection from "@/components/swiss/SwissSection";
import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
import { CHANGELOG } from "@/consts/Changelog";
import { format } from "date-fns";
import { ArrowLeft, Clock } from "lucide-react";

export default function ChangelogPage() {
  return (
    <SwissSection variant="white" className="py-24 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col items-start mb-20">
          <Link
            href="/"
            className="flex items-center text-xs font-black uppercase tracking-widest mb-6 text-black dark:text-white hover:text-swiss-red dark:hover:text-swiss-red transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            RETURN_TO_HOME
          </Link>
          <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter italic leading-none border-b-8 border-black dark:border-white pb-6 text-black dark:text-white">
            VERSION_LOGS
          </h1>
          <p className="text-sm font-bold uppercase tracking-widest opacity-40 mt-6 text-black dark:text-white">
            TRACKING_SYSTEM_EVOLUTION // SINCE_INITIALIZATION
          </p>
        </div>

        {/* Change History Grid */}
        <div className="space-y-16">
          {CHANGELOG.map((entry: any, index: any) => (
            <div key={index} className="relative pl-12 md:pl-0">
              {/* Vertical Timeline Node */}
              <div className="absolute left-0 top-0 bottom-0 md:-left-12 w-1 bg-black dark:bg-white hidden md:block" />
              <div className="absolute -left-[5px] top-6 w-3 h-3 bg-swiss-red md:-left-[53px] md:top-8 md:w-5 md:h-5 border-4 border-black dark:border-white" />

              <SwissCard className="p-8 md:p-12 border-4 md:border-8 border-black dark:border-white bg-white dark:bg-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,0.1)] hover:shadow-[16px_16px_0_0_rgba(255,0,0,1)] transition-all">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic leading-none text-black dark:text-white">
                        V.{entry.version}
                      </h2>
                      {entry.beta ? (
                        <span className="bg-swiss-red text-white px-3 py-1 font-black text-[10px] tracking-widest">
                          BETA_STREAM
                        </span>
                      ) : (
                        <span className="bg-black dark:bg-white text-white dark:text-black px-3 py-1 font-black text-[10px] tracking-widest">
                          STABLE_BUILD
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 text-black dark:text-white">
                      <Clock className="h-3 w-3" />
                      {format(new Date(entry.date), "yyyy.MM.dd")}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {entry.changes.map((change: any, changeIndex: any) => (
                    <div
                      key={changeIndex}
                      className="flex items-start gap-4 p-4 bg-neutral-100/50 dark:bg-neutral-900/50 border-l-4 border-black dark:border-white group hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                    >
                      <span className="text-swiss-red font-black text-lg leading-none mt-1">
                        +
                      </span>
                      <p className="text-sm md:text-lg font-bold uppercase tracking-tight italic opacity-80 leading-tight text-black dark:text-white">
                        {change}
                      </p>
                    </div>
                  ))}
                </div>
              </SwissCard>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-24 border-t-8 border-black dark:border-white pt-12 flex justify-center">
          <SwissButton
            asChild
            variant="primary"
            className="h-16 px-12 border-4 dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]"
          >
            <Link href="/" className="flex items-center gap-4">
              <ArrowLeft className="h-5 w-5" />
              RETURN_TO_BASE_STATION
            </Link>
          </SwissButton>
        </div>
      </div>
    </SwissSection>
  );
}
