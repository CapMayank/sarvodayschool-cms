/** @format */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/**
 * Converts absolute URL to relative URL for client-side requests
 * Server-side requests use absolute URL
 */
function getRequestUrl(url: string): string {
	// Only convert on client-side
	if (typeof window === "undefined") {
		return url;
	}

	// If already relative, return as is
	if (url.startsWith("/")) {
		return url;
	}

	// Convert absolute URL to relative
	if (url.startsWith("http://") || url.startsWith("https://")) {
		try {
			const urlObj = new URL(url);
			return urlObj.pathname + urlObj.search;
           // eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (e) {
			console.warn("Failed to parse URL:", url);
			return url;
		}
	}

	return url;
}

export const apiClient = {
	// ==================== ACHIEVEMENTS ====================
	getAchievements: async () => {
		const url = getRequestUrl(`${API_URL}/api/achievements`);
		const res = await fetch(url, {
			next: { revalidate: 60 },
		});
		if (!res.ok) throw new Error("Failed to fetch achievements");
		return res.json();
	},

                                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
	createAchievement: async (data: any) => {
		const url = getRequestUrl(`${API_URL}/api/achievements`);
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to create achievement");
		return res.json();
	},

                                             // eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateAchievement: async (id: number, data: any) => {
		const url = getRequestUrl(`${API_URL}/api/achievements/${id}`);
		const res = await fetch(url, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to update achievement");
		return res.json();
	},

	deleteAchievement: async (id: number) => {
		const url = getRequestUrl(`${API_URL}/api/achievements/${id}`);
		const res = await fetch(url, {
			method: "DELETE",
		});
		if (!res.ok) throw new Error("Failed to delete achievement");
		return res.json();
	},

	// ==================== SLIDESHOWS ====================
	getSlideshows: async () => {
		const url = getRequestUrl(`${API_URL}/api/slideshows`);
		const res = await fetch(url, {
			next: { revalidate: 60 },
		});
		if (!res.ok) throw new Error("Failed to fetch slideshows");
		return res.json();
	},

                               // eslint-disable-next-line @typescript-eslint/no-explicit-any
	createSlideshow: async (data: any) => {
		const url = getRequestUrl(`${API_URL}/api/slideshows`);
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to create slideshow");
		return res.json();
	},

                                           // eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateSlideshow: async (id: number, data: any) => {
		const url = getRequestUrl(`${API_URL}/api/slideshows/${id}`);
		const res = await fetch(url, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to update slideshow");
		return res.json();
	},

	deleteSlideshow: async (id: number) => {
		const url = getRequestUrl(`${API_URL}/api/slideshows/${id}`);
		const res = await fetch(url, {
			method: "DELETE",
		});
		if (!res.ok) throw new Error("Failed to delete slideshow");
		return res.json();
	},

	// ==================== NEWS ====================
	getNews: async (limit = 10) => {
		const url = getRequestUrl(`${API_URL}/api/news?limit=${limit}`);
		const res = await fetch(url, {
			next: { revalidate: 60 },
		});
		if (!res.ok) throw new Error("Failed to fetch news");
		return res.json();
	},

                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
	createNews: async (data: any) => {
		const url = getRequestUrl(`${API_URL}/api/news`);
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to create news");
		return res.json();
	},

                                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateNews: async (id: number, data: any) => {
		const url = getRequestUrl(`${API_URL}/api/news/${id}`);
		const res = await fetch(url, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to update news");
		return res.json();
	},

	deleteNews: async (id: number) => {
		const url = getRequestUrl(`${API_URL}/api/news/${id}`);
		const res = await fetch(url, {
			method: "DELETE",
		});
		if (!res.ok) throw new Error("Failed to delete news");
		return res.json();
	},

	// ==================== ADMISSION FORMS ====================
	getAdmissionForms: async () => {
		const url = getRequestUrl(`${API_URL}/api/admission-forms`);
		const res = await fetch(url);
		if (!res.ok) throw new Error("Failed to fetch admission forms");
		return res.json();
	},

                                   // eslint-disable-next-line @typescript-eslint/no-explicit-any
	submitAdmissionForm: async (data: any) => {
		const url = getRequestUrl(`${API_URL}/api/admission-forms`);
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to submit form");
		return res.json();
	},

                                               // eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateAdmissionForm: async (id: number, data: any) => {
		const url = getRequestUrl(`${API_URL}/api/admission-forms/${id}`);
		const res = await fetch(url, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to update form");
		return res.json();
	},

	deleteAdmissionForm: async (id: number) => {
		const url = getRequestUrl(`${API_URL}/api/admission-forms/${id}`);
		const res = await fetch(url, {
			method: "DELETE",
		});
		if (!res.ok) throw new Error("Failed to delete form");
		return res.json();
	},

	// ==================== TEACHER APPLICATIONS ====================
	getTeacherApplications: async () => {
		const url = getRequestUrl(`${API_URL}/api/teacher-applications`);
		const res = await fetch(url);
		if (!res.ok) throw new Error("Failed to fetch applications");
		return res.json();
	},

                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
	submitTeacherApplication: async (data: any) => {
		const url = getRequestUrl(`${API_URL}/api/teacher-applications`);
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to submit application");
		return res.json();
	},

                                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateTeacherApplication: async (id: number, data: any) => {
		const url = getRequestUrl(`${API_URL}/api/teacher-applications/${id}`);
		const res = await fetch(url, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to update application");
		return res.json();
	},

	deleteTeacherApplication: async (id: number) => {
		const url = getRequestUrl(`${API_URL}/api/teacher-applications/${id}`);
		const res = await fetch(url, {
			method: "DELETE",
		});
		if (!res.ok) throw new Error("Failed to delete application");
		return res.json();
	},

	// ==================== FACILITIES ====================
	getFacilities: async () => {
		const url = getRequestUrl(`${API_URL}/api/facilities`);
		const res = await fetch(url, {
			next: { revalidate: 60 },
		});
		if (!res.ok) throw new Error("Failed to fetch facilities");
		return res.json();
	},

                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
	createFacility: async (data: any) => {
		const url = getRequestUrl(`${API_URL}/api/facilities`);
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to create facility");
		return res.json();
	},

                                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
	updateFacility: async (id: number, data: any) => {
		const url = getRequestUrl(`${API_URL}/api/facilities/${id}`);
		const res = await fetch(url, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!res.ok) throw new Error("Failed to update facility");
		return res.json();
	},

	deleteFacility: async (id: number) => {
		const url = getRequestUrl(`${API_URL}/api/facilities/${id}`);
		const res = await fetch(url, {
			method: "DELETE",
		});
		if (!res.ok) throw new Error("Failed to delete facility");
		return res.json();
	},
};
