import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact Us | CodeNearby",
  description:
    "Get in touch with the CodeNearby team. Find our contact information including email, phone, and website details for support and inquiries.",
  openGraph: {
    title: "Contact Us | CodeNearby",
    description:
      "Get in touch with the CodeNearby team. Find our contact information including email, phone, and website details for support and inquiries.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Globe } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We&apos;re here to help! Reach out to us through any of the channels below and we&apos;ll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Primary Contact */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Primary Email</CardTitle>
            </div>
            <CardDescription>
              For general inquiries and support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href="mailto:hello@codenearby.space" 
                  className="text-primary hover:underline font-medium"
                >
                  hello@codenearby.space
                </a>
              </div>
              <Badge variant="secondary" className="w-fit">
                Business Inquiries
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Developer Contact */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>Developer Contact</CardTitle>
            </div>
            <CardDescription>
              Direct line to our development team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href="mailto:sahasubhadip54@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  sahasubhadip54@gmail.com
                </a>
              </div>
              <Badge variant="secondary" className="w-fit">
                Technical Support
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Phone Contact */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <CardTitle>Phone Support</CardTitle>
            </div>
            <CardDescription>
              Call us for urgent matters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href="tel:+918653462940" 
                  className="text-primary hover:underline font-medium"
                >
                  +91 8653462940
                </a>
              </div>
              <Badge variant="secondary" className="w-fit">
                Emergency Support
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Website */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Website</CardTitle>
            </div>
            <CardDescription>
              Visit our main platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href="https://codenearby.space" 
                  className="text-primary hover:underline font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  codenearby.space
                </a>
              </div>
              <Badge variant="secondary" className="w-fit">
                Main Platform
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-center">Quick Contact Summary</CardTitle>
          <CardDescription className="text-center">
            All our contact information at a glance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <Mail className="h-6 w-6 mx-auto text-primary" />
              <div className="space-y-1">
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">hello@codenearby.space</p>
                <p className="text-sm text-muted-foreground">sahasubhadip54@gmail.com</p>
              </div>
            </div>
            <div className="space-y-2">
              <Phone className="h-6 w-6 mx-auto text-primary" />
              <div className="space-y-1">
                <p className="font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">+91 8653462940</p>
              </div>
            </div>
            <div className="space-y-2">
              <Globe className="h-6 w-6 mx-auto text-primary" />
              <div className="space-y-1">
                <p className="font-medium">Website</p>
                <p className="text-sm text-muted-foreground">codenearby.space</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-4">
          Looking for something specific? Check out our other pages:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/about">About Us</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/privacy">Privacy Policy</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/terms">Terms of Service</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/report-issue">Report an Issue</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
