import InfoPage from "@/components/info-page";

export default function Page() {
  return (
    <InfoPage title="Privacy Policy">
      <p>
        When you place an order, we collect your email, delivery address, and phone number (if provided) to fulfill the
        order and send confirmations. Payment is processed by Razorpay; we do not store your full card or UPI credentials
        on our servers.
      </p>
      <p>
        Your cart and order note may be stored in this browser (local storage) until checkout completes. Order details
        are stored securely in our database for fulfillment and support.
      </p>
      <p>
        We use your contact information only to process orders, respond to support requests, and—if you opt in at
        checkout—send news and offers. We do not sell your personal information to third parties.
      </p>
      <p>
        For privacy questions or to request correction of your data, call +91 98256 73899 or use the contact page on this
        site.
      </p>
    </InfoPage>
  );
}
