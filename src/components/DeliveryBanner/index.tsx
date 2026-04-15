"use client";

import Truck from "@/assets/banners/truck_delivery.png";
import BackgroundTruck from "@/assets/banners/background_truck_delivery.png";
import Boxes from "@/assets/banners/boxes_delivery.png";
import LogoTD from "@/assets/logo-td.svg";
import Image from "next/image";

export default function DeliveryBanner({
  text,
  price,
}: {
  text: string;
  price: string;
}) {
  return (
    <div className="flex w-full bg-[#F7F6FA] rounded-md items-center justify-between px-12 h-[150px]  mt-20">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-bold text-gray-800">{text}</div>
        <div className="text-xl font-medium text-gray-800 ">{price}</div>
      </div>
      <div className="relative mr-8 mb-20">
        <Image src={Truck.src} alt="Truck" width={502} height={100} />
        <Image
          src={Boxes.src}
          alt="Boxes"
          width={280}
          className="absolute -right-26 bottom-22 z-50"
        />
        <Image
          src={BackgroundTruck.src}
          alt="BackgroundTruck"
          width={308}
          height={100}
          className="absolute left-38 top-44"
        />
        <Image
          src={LogoTD.src}
          alt="Transdetail"
          width={202}
          className="absolute left-50 top-50"
        />
      </div>
    </div>
  );
}
