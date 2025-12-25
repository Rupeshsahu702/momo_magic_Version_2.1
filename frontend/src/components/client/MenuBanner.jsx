// ComboOfTheDay.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Home } from "lucide-react";
import menuBannerImg from "@/assets/menubanner.png";

const MenuBanner = () => {
  return (
    <section className="w-full bg-[#fafafa] px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <Card className="relative overflow-hidden rounded-3xl border-none bg-gradient-to-br from-[#3d3428] via-[#2d261d] to-[#4a3d2a] shadow-2xl">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
            {/* Left Content */}
            <div className="flex flex-col justify-center gap-6 p-8 lg:p-12">
              {/* Badge */}
              <Badge className="w-fit rounded-full border border-[#ff7a3c]/30 bg-[#ff7a3c]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-[#ff7a3c] hover:bg-[#ff7a3c]/10">
                <Home className="mr-1.5 h-3 w-3" />
                COMBO OF THE DAY
              </Badge>

              {/* Heading */}
              <div className="space-y-2">
                <h2 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
                  Magic Combo
                </h2>
                <h2 className="text-4xl font-bold leading-tight text-[#ff7a3c] lg:text-5xl">
                  Explosion
                </h2>
              </div>

              {/* Description */}
              <p className="max-w-md text-sm leading-relaxed text-[#d1cec9]">
                12pc Mixed Platter + Large Coke for just{" "}
                <span className="font-bold text-white">₹12.99</span>. Taste the
                spice of the Himalayas!
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  className="rounded-full bg-[#ff7a3c] px-8 text-sm font-bold text-white hover:bg-[#ff6825]"
                >
                  Order Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-[#5a4d3d] bg-transparent text-sm font-bold text-white hover:border-[#ff7a3c] hover:bg-[#ff7a3c]/10 hover:text-white"
                >
                  View Details
                </Button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative flex items-center justify-center p-8 lg:p-12">
              <div className="relative">
                {/* Dark card background for image */}
                <div className="rounded-2xl bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] p-0 shadow-2xl">
                  <img
                    src={menuBannerImg}
                    alt="Magic Combo - momos on teal plate"
                    className="h-[300px] w-full rounded-xl object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default MenuBanner;
