import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      <Hero />
      <Categories />
      <FeaturedProducts />
      
      {/* Brand Story Section */}
      <section className="py-32 px-8 bg-primary text-on-primary">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-12">
            <h2 className="text-4xl md:text-6xl font-medium tracking-tighter leading-[1.1]">
              Crafted for the <br /> Discerning Eye.
            </h2>
            <p className="text-xl text-on-primary/60 leading-relaxed max-w-lg">
              Our philosophy is rooted in the belief that true luxury lies in restraint. 
              Each piece is a dialogue between form and function, material and movement.
            </p>
            <div className="flex gap-12 pt-8">
              <div>
                <div className="text-3xl font-bold tracking-tighter mb-2">100%</div>
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-40">Virgin Wool</div>
              </div>
              <div>
                <div className="text-3xl font-bold tracking-tighter mb-2">Hand</div>
                <div className="text-[10px] uppercase tracking-[0.2em] opacity-40">Finished Seams</div>
              </div>
            </div>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden grayscale contrast-[1.1]">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQ6t-m_V_x6eNnF_6vW_6K8h_z_e_r_t_n_w_s_v_5_m_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h_h"
              alt="Artisan at work"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
