import InfoPage from "@/components/info-page";

export default function Page() {
  return (
    <InfoPage title="Terms & Conditions">
      <p>
        InstaMealz meals are vegetarian and freeze-dried. Add hot water and wait about five minutes before eating. Store
        sealed pouches in a cool, dry place.
      </p>
      <p>
        All prices are in Indian rupees (INR). Completing checkout and payment through Razorpay creates a binding order
        for the items and quantities shown. We may cancel or refund an order if a product is unavailable or if payment
        cannot be verified.
      </p>
      <p>
        Meals are prepared in our facility in Valsad, Gujarat. Delivery times vary by PIN code and carrier; estimates at
        checkout are guidelines, not guarantees.
      </p>
      <p>
        To the extent permitted by law, InstaMealz is not liable for indirect or consequential damages arising from use
        of our products or delays in delivery. Your statutory consumer rights under applicable Indian law remain
        unaffected.
      </p>
    </InfoPage>
  );
}
