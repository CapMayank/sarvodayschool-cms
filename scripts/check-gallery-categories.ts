/** @format */

import { prisma } from "../src/lib/prisma";

async function checkCategories() {
	try {
		const categories = await prisma.galleryCategory.findMany({
			orderBy: { order: "asc" },
		});

		console.log("\n📋 Gallery Categories in Database:");
		console.log("================================");

		if (categories.length === 0) {
			console.log("❌ No categories found in database");
		} else {
			categories.forEach((cat, index) => {
				console.log(`\n${index + 1}. ID: ${cat.id}`);
				console.log(`   Name: "${cat.name}"`);
				console.log(`   Title: "${cat.title}"`);
				console.log(`   Description: "${cat.description}"`);
				console.log(`   Order: ${cat.order}`);
			});
		}

		console.log("\n================================");
		console.log(`Total categories: ${categories.length}\n`);
	} catch (error) {
		console.error("Error fetching categories:", error);
	} finally {
		await prisma.$disconnect();
	}
}

checkCategories();
