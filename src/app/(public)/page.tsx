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

	const mappedSlideshows = slideshows.map((s) => ({
		...s,
		title: s.title || undefined,
	}));

	const mappedFacilities = facilities.map((f) => ({
		...f,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		highlights: f.highlights as any,
	}));

	const mappedAchievements = achievements.map((a) => ({
		...a,
		createdAt: a.createdAt.toISOString(),
		updatedAt: a.updatedAt.toISOString(),
	}));

	const mappedNews = news.map((n) => ({
		...n,
		imageUrl: n.imageUrl || undefined,
		publishDate: n.publishDate.toISOString(),
		createdAt: n.createdAt.toISOString(),
		updatedAt: n.updatedAt.toISOString(),
	}));

	return (
		<>
			<Hero />
			<Banner />
			<Slideshow initialSlides={mappedSlideshows} />
			<FacilitiesSection initialFacilities={mappedFacilities} />
			<AchievementsSection initialAchievements={mappedAchievements} />
			<News initialNews={mappedNews} />
			<Footer />
		</>
	);
}
