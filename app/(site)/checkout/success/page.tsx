import { CheckoutSuccess } from "@/components/checkout-success";

type SuccessPageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { order } = await searchParams;

  return <CheckoutSuccess order={order} />;
}
