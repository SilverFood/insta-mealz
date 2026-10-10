import InfoPage from "@/components/info-page";

export default function Page() {
  return (
    <InfoPage title="Track order">
      <p>
        Your order confirmation email includes your InstaMealz order ID. Keep it handy when you contact us about
        delivery.
      </p>
      <p>
        Live carrier tracking is not available on the website yet. For shipment status, email{" "}
        <a href="mailto:info@instamealz.in">info@instamealz.in</a> with your order ID and the name used at checkout,
        and we will update you from our dispatch records.
      </p>
    </InfoPage>
  );
}
