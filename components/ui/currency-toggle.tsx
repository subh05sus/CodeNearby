import { Switch } from "@/components/ui/switch";
import { Currency } from "@/consts/pricing";

interface CurrencyToggleProps {
  currency: Currency;
  onToggle: () => void;
}

export function CurrencyToggle({ currency, onToggle }: CurrencyToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-sm ${
          currency.code === "USD" ? "font-semibold" : "text-muted-foreground"
        }`}
      >
        USD ($)
      </span>
      <Switch
        checked={currency.code === "INR"}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
      <span
        className={`text-sm ${
          currency.code === "INR" ? "font-semibold" : "text-muted-foreground"
        }`}
      >
        INR (₹)
      </span>
    </div>
  );
}
