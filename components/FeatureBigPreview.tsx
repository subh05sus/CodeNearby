import { Bot, ExternalLink } from "lucide-react";
import React from "react";
import { CardContent, Card } from "./ui/card";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";
function FeatureBigPreview() {
  return (
    <Card className="overflow-hidden border-2 border-primary/10 bg-gradient-to-br from-background to-primary/5">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-6 md:p-8">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 p-2 rounded-full mr-3">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Meet AI-Connect</h3>
            </div>
            <p className="text-lg mb-6">
              Our newest feature uses Meta Llama AI to help you find the perfect
              developers for your projects. Search by skills, location, or
              specific requirements through a conversational interface.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Find React developers in San Francisco</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Search for Python experts near your location</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Look up specific GitHub users</span>
              </li>
            </ul>
            <Button asChild className="rounded-full">
              <Link
                href="/about/ai-connect"
                className="inline-flex items-center"
              >
                Learn more about AI-Connect
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="md:w-1/2 relative  md:h-auto flex justify-center items-center">
            <Image
              src="/ai.gif"
              alt="AI-Connect feature preview"
              width={300}
              height={300}
              className="object-cover"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FeatureBigPreview;
