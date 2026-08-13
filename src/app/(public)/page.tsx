/** @format */

import Hero from "@/components/public/hero";
import Footer from "@/components/public/footer";
import dynamic from "next/dynamic";

const Banner = dynamic(() => import("@/components/public/banner"));
const Slideshow = dynamic(() => import("@/components/public/slideshow"), {
	loading: () => <div className="w-full h-[650px] bg-gray-100 animate-pulse" />,
});
const FacilitiesSection = dynamic(() => import("@/components/public/facilities"));
const AchievementsSection = dynamic(() => import("@/components/public/achievements"));
const News = dynamic(() => import("@/components/public/news"));

export default function Home() {
	return (
		<>
			<Hero />
			<Banner />
			<Slideshow />
			<FacilitiesSection />
			<AchievementsSection />
			<News />
			<Footer />
		</>
	);
}
