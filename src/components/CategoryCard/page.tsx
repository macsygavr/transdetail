import Image from "next/image";
import CategoryDefaultImage from "@/assets/category_default.png";
import { Category } from "@cms/sdk/categories/entities";

export default function CategoryCard({
  category,
  onClick,
}: {
  category: Category;
  onClick?: () => void;
}) {
  const categoryImage = category.icon
    ? `/media/${category.icon}/large.webp`
    : CategoryDefaultImage;

  const currentLang = navigator.language.split("-")[0].toLowerCase();
  const categoryName =
    category.name?.[currentLang] || category.name?.en || "Not translated";

  return (
    <div
      className="flex flex-col justify-between bg-white rounded-2xl p-4 text-center hover:shadow-md cursor-pointer group gap-3 border transition duration-300 h-[250px] w-[225px]"
      onClick={onClick}
    >
      <div className="flex justify-center items-center w-[185px] h-[130px] mt-1">
        <Image
          src={categoryImage}
          alt={categoryName}
          width={185}
          height={130}
          className="object-contain"
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-center text-lg font-semibold text-text group-hover:text-main-red transition duration-300 mb-1">
          {categoryName}
        </div>

        {/* <div className="flex flex-col justify-center items-center pb-4">
          <div className="flex text-neutral-gray gap-1">
            <p className="text-accent-blue">{category.itemsCount}</p>
            наименований
          </div>

          <div className="flex text-neutral-gray gap-1">
            для{" "}
            <p className="text-accent-blue">{category.transmissionsCount}</p>{" "}
            трансмиссий
          </div>
        </div> */}
      </div>
    </div>
  );
}
