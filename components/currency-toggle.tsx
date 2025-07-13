"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { CurrencyInfo } from "@/lib/pricing-utils";

interface CurrencyToggleProps {
  currency: CurrencyInfo;
  onToggle: () => void;
  className?: string;
}

export function CurrencyToggle({
  currency,
  onToggle,
  className,
}: CurrencyToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={`flex items-center space-x-2 ${className}`}
    >
      <Globe className="h-4 w-4" />
      <span>Currency:</span>
      <Badge variant="secondary" className="ml-1">
        {currency.code}
      </Badge>
    </Button>
  );
}
