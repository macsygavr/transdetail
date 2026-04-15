import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import CategoriesSlider from "./CategoriesSlider";
import { useCategoriesListQueryOptions } from "@cms/sdk/categories/hooks/queries";
import { Category } from "@cms/sdk/categories/entities";
import { useQuery } from "@tanstack/react-query";

export function CategoriesSection() {
  const { data: categoriesData, isLoading } = useQuery(
    useCategoriesListQueryOptions({
      params: {
        parent_id: null,
        include_inactive: false,
      },
    })
  );

  const allCategories: Category[] = categoriesData ? categoriesData.items : [];
  const popularCategories = allCategories.length
    ? allCategories.filter((item) => item.is_popular)
    : [];

  return (
    <div className="3xl:w-240">
      <Tabs defaultValue={popularCategories.length ? "popular" : "all"}>
        <TabsList>
          {popularCategories.length > 0 && (
            <TabsTrigger value="popular">Популярные категории</TabsTrigger>
          )}
          <TabsTrigger value="all">Все категории</TabsTrigger>
        </TabsList>

        {popularCategories.length > 0 && (
          <TabsContent value="popular">
            <CategoriesSlider
              isLoading={isLoading}
              categories={popularCategories}
            />
          </TabsContent>
        )}
        <TabsContent value="all">
          <CategoriesSlider isLoading={isLoading} categories={allCategories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
