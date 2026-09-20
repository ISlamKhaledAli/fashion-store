import { Hero } from "@/components/home/Hero";
import { PromotionalBanners } from "@/components/home/PromotionalBanners";
import { Categories } from "@/components/home/Categories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandStory } from "@/components/home/BrandStory";
import { CTABanner } from "@/components/home/CTABanner";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col gap-y-12">
      <Hero />
      <PromotionalBanners />
      <Categories />
      <FeaturedProducts />
      <BrandStory />
      <CTABanner />
    </div>
  );
}
