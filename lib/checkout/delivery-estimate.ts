const INDIAN_PIN_PATTERN = /^[1-9][0-9]{5}$/;

export type DeliveryEstimate = {
  dispatchNote: string;
  transitMinDays: number;
  transitMaxDays: number;
  label: string;
};

const DISPATCH_NOTE =
  "We pack in Valsad, Gujarat and aim to ship within 2 working days of your order.";

function isGujaratPin(pin: string) {
  const prefix = pin.slice(0, 2);
  return prefix >= "36" && prefix <= "39";
}

/** Transit bands after dispatch, by India postal zone (first PIN digit). */
function transitDaysForPin(pin: string): { min: number; max: number } {
  if (isGujaratPin(pin)) return { min: 2, max: 4 };

  const zone = pin[0];
  switch (zone) {
    case "4": // Maharashtra, Goa, MP, Chhattisgarh
      return { min: 3, max: 5 };
    case "3": // Rajasthan, Gujarat (non-36–39 handled above), etc.
    case "5": // AP, Karnataka, Telangana
    case "6": // TN, Kerala
      return { min: 4, max: 6 };
    case "1":
    case "2":
    case "7":
    case "8":
    case "9":
    default:
      return { min: 5, max: 7 };
  }
}

export function getDeliveryEstimate(postalCode: string): DeliveryEstimate | null {
  const pin = postalCode.trim();
  if (pin.length !== 6 || !INDIAN_PIN_PATTERN.test(pin)) return null;

  const { min, max } = transitDaysForPin(pin);
  const range = min === max ? `${min}` : `${min}–${max}`;
  return {
    dispatchNote: DISPATCH_NOTE,
    transitMinDays: min,
    transitMaxDays: max,
    label: `Estimated delivery: ${range} business days after dispatch`,
  };
}
