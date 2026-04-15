import { Button } from "@/components/ui/button";
import {
  useCreateFavoriteProductMutation,
  useDeleteUserFavoriteProductMutation,
} from "@cms/sdk/favorite-products/hooks/mutations";
import { useUserFavoritesListQueryOptions } from "@cms/sdk/favorite-products/hooks/queries";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useMemo } from "react";

export default function FavoriteButton({
  productId,
  className,
}: {
  productId: string;
  className?: string;
}) {
  const createFavoriteProductMutation = useCreateFavoriteProductMutation();
  const deleteUserFavoriteProductMutation =
    useDeleteUserFavoriteProductMutation();
  const { data: favoritesList, isFetching: isFavoritesListFetching } = useQuery(
    useUserFavoritesListQueryOptions({
      queryOptions: {
        staleTime: Infinity,
      },
    })
  );

  const isFavoriteProduct = useMemo(() => {
    return favoritesList?.items.some((item) => item.product_id === productId);
  }, [favoritesList?.items, productId]);

  function addProductToFavoritesList() {
    if (isFavoriteProduct) {
      deleteUserFavoriteProductMutation.mutateAsync(productId);
      return;
    }

    createFavoriteProductMutation.mutateAsync(productId);
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={`group border-none ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();

        addProductToFavoritesList();
      }}
      disabled={
        createFavoriteProductMutation.isPending ||
        deleteUserFavoriteProductMutation.isPending ||
        isFavoritesListFetching
      }
    >
      <Heart
        className={`${isFavoriteProduct ? "text-main-red" : "text-neutral-gray"} group-hover:text-main-red`}
      />
    </Button>
  );
}
