/** @format */
import facilities from "@/lib/facilities/facilities";
import FacilityPage from "@/components/public/faciltyPage"; // Update the path as needed

interface PageProps {
	params: Promise<{
		facility: string;
	}>;
}

export default async function Facilities({ params }: PageProps) {
	const { facility: facilityId } = await params;

	// Retrieve the facility data using the dynamic route parameter
	const facility = facilities.find((f) => f.id === facilityId);

	// Pass the facility data to the component
	if (!facility) {
		return <div>Facility not found</div>;
	}

	return <FacilityPage facility={facility} />;
}
