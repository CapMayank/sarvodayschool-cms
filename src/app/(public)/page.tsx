/** @format */

import Hero from "@/components/public/hero";
import Banner from "@/components/public/banner";
import Slideshow from "@/components/public/slideshow";
import News from "@/components/public/news";
import Footer from "@/components/public/footer";
import FacilitiesSection from "@/components/public/facilities";
import AchievementsSection from "@/components/public/achievements";

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
