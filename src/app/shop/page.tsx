import type { Metadata } from "next";

import { EquipmentShop } from "@/components/equipment-shop";

export const metadata: Metadata = { title: "像素装备铺" };

export default function ShopPage(): React.ReactNode {
  return (
    <main className="page-container" id="main-content">
      <EquipmentShop />
    </main>
  );
}
