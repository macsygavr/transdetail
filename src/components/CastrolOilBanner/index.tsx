import Image from "next/image";

export default function CastrolOilBanner() {
  return (
    <div className="overflow-hidden w-full h-auto rounded-[12px]">
      <Image
        className="w-full h-full object-cover object-center"
        src="/mocks/castrol-edge.png"
        width={269}
        height={240}
        alt="Масло Castrol"
      />
    </div>
  );
}
