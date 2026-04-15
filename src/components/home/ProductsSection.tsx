import HeaderProductsGroup, {
  Variants,
} from "@/components/HeaderProductsGroup";
import SmallProductCard from "@/components/SmallProductCard/SmallProductCard";
import { Product } from "@cms/sdk/products/entities";
// import { Button } from "@/components/ui/button";

type Props = {
  variant: Variants;
  products: Product[];
  title: string;
  linkText: string;
  linkAddress: string;
};

export default function ProductsSection({
  variant,
  title,
  linkText,
  linkAddress,
  products,
}: Props) {
  return (
    <div>
      <HeaderProductsGroup
        variant={variant}
        title={title}
        linkAddress={linkAddress}
        linkText={linkText}
      />

      <ul
        className="
        grid grid-cols-2 md:grid-cols-3 2md:grid-cols-4 1lg:grid-cols-5 3xl:grid-cols-4
        gap-[6px] md:gap-[8px]

      "
      >
        {products.map((item) => {
          return <SmallProductCard key={item.id} product={item} />;
        })}
      </ul>

      {/* <Button className="mx-auto mt-[20px] md:mt-[24px]" type="button" variant="tertiary">Загрузить ещё</Button> */}
    </div>
  );
}
