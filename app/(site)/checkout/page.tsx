import { CheckoutPage } from "@/components/cart-checkout";
import { isSandbox } from "@/lib/env";

export default function Page() {
  return <CheckoutPage testMode={isSandbox()} />;
}
