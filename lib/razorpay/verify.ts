import crypto from "crypto";

export function verifyRazorpaySignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
  secret: string;
}) {
  const body = `${params.orderId}|${params.paymentId}`;
  const expected = crypto.createHmac("sha256", params.secret).update(body).digest("hex");
  return expected === params.signature;
}
