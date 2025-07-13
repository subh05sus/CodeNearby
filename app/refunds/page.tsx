import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Cancellations and Refunds Policy | CodeNearby",
  description:
    "Read CodeNearby's cancellations and refunds policy. Learn about our no-refund policy and contact information for special cases and exceptions.",
  openGraph: {
    title: "Cancellations and Refunds Policy | CodeNearby",
    description:
      "Read CodeNearby's cancellations and refunds policy. Learn about our no-refund policy and contact information for special cases and exceptions.",
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Phone, AlertTriangle, Info } from "lucide-react";
import Link from "next/link";
import { updatedDate } from "@/consts/BASIC";

export default function CancellationsRefundsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Cancellations and Refunds Policy</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Please read our cancellations and refunds policy carefully to understand our terms and conditions.
        </p>
        <p className="text-sm text-muted-foreground mt-2">Last updated: {updatedDate}</p>
      </div>

      {/* Main Policy Alert */}
      <Alert className="mb-8 border-destructive/50 bg-destructive/5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive font-medium">
          <strong>Important Notice:</strong> No refunds and cancellations will be provided for any services or purchases made through CodeNearby.
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        {/* Policy Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Policy Overview
            </CardTitle>
            <CardDescription>
              Our standard cancellation and refund terms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">General Policy</h3>
              <p className="text-muted-foreground">
                CodeNearby operates on a strict no-refund and no-cancellation policy. Once a service is purchased or a transaction is completed, it cannot be reversed, cancelled, or refunded under normal circumstances.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Scope of Policy</h3>
              <p className="text-muted-foreground">
                This policy applies to all services, subscriptions, premium features, and any other paid content or services offered through the CodeNearby platform.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">User Responsibility</h3>
              <p className="text-muted-foreground">
                Users are advised to carefully review all service details, terms, and pricing before making any purchases. By proceeding with a transaction, you acknowledge and agree to this no-refund policy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Special Cases */}
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-amber-700 dark:text-amber-300">Special Cases</CardTitle>
            <CardDescription className="text-amber-600 dark:text-amber-400">
              Exceptional circumstances may be considered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-amber-700 dark:text-amber-300">
              While our standard policy is no refunds or cancellations, we understand that exceptional circumstances may arise. In very rare cases, we may consider special requests at our sole discretion.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-medium text-amber-800 dark:text-amber-200">Examples of special cases may include:</h4>
              <ul className="list-disc list-inside space-y-1 text-amber-700 dark:text-amber-300 text-sm">
                <li>Technical issues preventing service access for extended periods</li>
                <li>Billing errors or unauthorized charges</li>
                <li>Service not delivered as described due to platform errors</li>
                <li>Legal or regulatory requirements</li>
              </ul>
            </div>

            <Alert className="border-amber-300 bg-amber-100/50 dark:border-amber-700 dark:bg-amber-900/20">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <strong>Note:</strong> Special case reviews are conducted on a case-by-case basis and approval is not guaranteed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Contact Us for Special Cases</CardTitle>
            <CardDescription>
              If you believe your situation qualifies as a special case, please contact us
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Primary Email</p>
                  <a 
                    href="mailto:hello@codenearby.space" 
                    className="text-primary hover:underline text-sm"
                  >
                    hello@codenearby.space
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                <Mail className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Developer Contact</p>
                  <a 
                    href="mailto:sahasubhadip54@gmail.com" 
                    className="text-primary hover:underline text-sm"
                  >
                    sahasubhadip54@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 sm:col-span-2">
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <a 
                    href="tel:+918653462940" 
                    className="text-primary hover:underline text-sm"
                  >
                    +91 8653462940
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>When contacting us:</strong> Please provide detailed information about your situation, including transaction details, dates, and specific circumstances that may qualify for special consideration.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Related Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Related Information</CardTitle>
            <CardDescription>
              Additional policies and information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href="/terms">Terms of Service</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/privacy">Privacy Policy</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/about">About CodeNearby</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          This policy is subject to change. Please check this page regularly for updates. For questions about this policy, please contact us using the information provided above.
        </p>
      </div>
    </div>
  );
}
