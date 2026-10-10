import InfoPage from "@/components/info-page";
import { formatInr } from "@/lib/money";
import { FREE_SHIPPING_SUBTOTAL_INR, SHIPPING_FEE_INR } from "@/lib/checkout/pricing";
import { DISPATCH_FROM_VALSAD_NOTE } from "@/lib/copy/shipping";

export default function Page() {
  return (
    <InfoPage title="Shipping policy">
      <p>
        Standard shipping is {formatInr(SHIPPING_FEE_INR)} when your meal subtotal is under{" "}
        {formatInr(FREE_SHIPPING_SUBTOTAL_INR, false)}. Orders of{" "}
        {formatInr(FREE_SHIPPING_SUBTOTAL_INR, false)} or more qualify for free standard shipping on the meal subtotal
        (before discounts).
      </p>
      <p>{DISPATCH_FROM_VALSAD_NOTE}</p>
      <p>
        Delivery time depends on your PIN code. After your order ships, most addresses in India receive delivery in
        about 3–7 business days. Gujarat and nearby regions are often faster; remote areas may take longer. The
        estimated range for your PIN is shown at checkout once you enter a valid 6-digit code.
      </p>
      <p>
        Promotions such as Buy 2 get 1 free and the INSTA10 code reduce what you pay but do not change the free-shipping
        threshold, which is based on the pre-promotion subtotal.
      </p>
    </InfoPage>
  );
}
