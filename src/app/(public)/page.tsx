/** @format */

import Hero from "@/components/public/hero";
import Footer from "@/components/public/footer";
import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // ISR: Cache for 60 seconds

const Banner = dynamic(() => import("@/components/public/banner"));
const Slideshow = dynamic(() => import("@/components/public/slideshow"), {
	loading: () => <div className="w-full h-[650px] bg-gray-100 animate-pulse" />,
});
const FacilitiesSection = dynamic(() => import("@/components/public/facilities"));
const AchievementsSection = dynamic(() => import("@/components/public/achievements"));
const News = dynamic(() => import("@/components/public/news"));

export default async function Home() {
	// Fetch all data server-side in parallel
	const [slideshows, facilities, achievements, news] = await Promise.all([
		prisma.slideShow.findMany({
			where: { isActive: true },
			orderBy: { order: "asc" },
		}),
		prisma.facility.findMany({
			where: { isActive: true },
			orderBy: { order: "asc" },
		}),
		prisma.achievement.findMany({
			orderBy: { order: "asc" },
		}),
		prisma.news.findMany({
			where: { isPublished: true },
			orderBy: { publishDate: "desc" },
			take: 10,
		}),
	]);

	return (
		<>
			<Hero />
			<Banner />
			<Slideshow initialSlides={slideshows} />
			<FacilitiesSection initialFacilities={facilities} />
			<AchievementsSection initialAchievements={achievements} />
			<News initialNews={news} />
			<Footer />
		</>
	);
}
