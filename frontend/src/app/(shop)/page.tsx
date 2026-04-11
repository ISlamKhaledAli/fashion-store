import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { BrandStory } from "@/components/home/BrandStory";
import { CTABanner } from "@/components/home/CTABanner";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <Categories />
      <FeaturedProducts />
      <BrandStory />
      <CTABanner />
    </div>
  );
}
