/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CHANGELOG } from "@/consts/Changelog";
import { format } from "date-fns";


export default function ChangelogPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Changelog</h1>
      <div className="space-y-8">
        {CHANGELOG.map((entry: any, index: any) => (
          <div key={index} className="border-b pb-6 last:border-b-0">
            <h2 className="text-2xl font-semibold mb-1">
              Version {entry.version}{" "}
              {entry.beta ? (
                <span
                  className={`text-[0.5rem] p-0.5 text-red-500 border-red-500 rounded border`}
                >
                  BETA
                </span>
              ) : (
                <span
                  className={`text-[0.5rem] p-0.5 text-blue-500 border-blue-500 rounded border`}
                >
                  STABLE
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500 mb-2">
              {format(new Date(entry.date), "MMMM d, yyyy")}
            </p>

            <ul className="list-disc list-inside space-y-2">
              {entry.changes.map((change: any, changeIndex: any) => (
                <li key={changeIndex}>{change}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
