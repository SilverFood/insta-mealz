export type PackageSize = {
  id: string;
  label: string;
  note: string;
  priceFactor: number;
};

export const PACKAGE_SIZES: PackageSize[] = [
  { id: "250gm", label: "250gm", note: "250gm pack", priceFactor: 1 },
];

export const DEFAULT_PACKAGE_SIZE_ID = PACKAGE_SIZES[0].id;

const byId = new Map(PACKAGE_SIZES.map((size) => [size.id, size]));

export function getPackageSize(id: string | undefined | null): PackageSize | undefined {
  if (!id) return undefined;
  return byId.get(id.trim());
}

export function isPackageSizeId(id: string | undefined | null): boolean {
  return getPackageSize(id) != null;
}

export function unitPriceInr(basePrice: number, packageSizeId: string): number {
  const size = getPackageSize(packageSizeId);
  if (!size) {
    throw new Error(`Invalid package size: ${packageSizeId}`);
  }
  return basePrice * size.priceFactor;
}

export function packageSizeLabel(id: string): string {
  return getPackageSize(id)?.note ?? id;
}
