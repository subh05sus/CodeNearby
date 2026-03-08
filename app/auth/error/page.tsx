import SwissCard from "@/components/swiss/SwissCard";
import SwissButton from "@/components/swiss/SwissButton";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ErrorPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-swiss-white p-6">
      <SwissCard className="w-full max-w-xl p-12 border-8 border-swiss-black bg-swiss-red text-swiss-white shadow-[24px_24px_0_0_rgba(0,0,0,1)]">
        <div className="space-y-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-swiss-white text-swiss-black">
              <AlertCircle className="h-12 w-12" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">
              SYSTEM_FAILURE
            </h1>
          </div>

          <div className="space-y-4">
            <p className="text-2xl font-black uppercase tracking-tighter italic border-b-4 border-swiss-white/20 pb-4">
              AUTHENTICATION_ERROR_REPORTED
            </p>
            <p className="text-xl font-bold uppercase tracking-tight opacity-80 leading-tight">
              PROTOCOLS INTERRUPTED DURING UPLINK ESTABLISHMENT. SOURCE DATA INCOMPLETE OR ACCESS REVOKED.
            </p>
          </div>

          <SwissButton variant="secondary" size="lg" className="w-full h-20 text-xl bg-swiss-white text-swiss-black border-0 shadow-[8px_8px_0_0_rgba(0,0,0,0.5)]" asChild>
            <Link href="/auth/signin">RE_INITIALIZE_UPLINK</Link>
          </SwissButton>
        </div>
      </SwissCard>
    </div>
  )
}

