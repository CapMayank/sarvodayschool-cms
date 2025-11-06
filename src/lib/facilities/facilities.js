/** @format */

const facilities = [
	{
		id: "assembly-ground",
		title: "Assembly Ground",
		imageUrl: "/facilities/assembly-ground/assembly.jpg",
		description:
			"A large assembly ground for events & gatherings and playground.",
		highlights: [
			{ title: "Capacity", value: "1000+ People" },
			{ title: "Features", value: "Open-air, Spacious" },
			{ title: "Facilities", value: "Pre-built Stage" },
		],
		facilityFeatures: [
			{
				title: "Events Hosted",
				value: "Annual Sports, School Assemblies, Cultural Events",
			},
			{
				title: "Safety Measures",
				value: "CCTV, Fire safety, First-aid facilities",
			},
		],
		mediaGallery: [
			{
				type: "image",
				src: "/facilities/assembly-ground/IndependenceDay.jpg",
				caption: "Independence Day Celebration",
			},
			{
				type: "youtube",
				src: "n6U7VgrejiY?si=u2q6anBCrIUSPwgr",
				caption: "Assembly Ground Highlights",
			},
		],
	},
	{
		id: "smart-classrooms",
		title: "Smart Classrooms",
		imageUrl: "/facilities/classroom.jpg",
		description: "Spacious and well-ventilated classrooms with smart boards.",
		highlights: [
			{ title: "Capacity", value: "80 Students" },
			{
				title: "Technology",
				value: "Smart Boards & Interactive Learning Tools",
			},
			{ title: "Environment", value: "Well-ventilated, Brightly lit" },
		],
		facilityFeatures: [
			{
				title: "Teaching Tools",
				value: "Interactive Flat Panel, Interactive Learning Tools",
			},
			{
				title: "Safety Measures",
				value: "Fire safety, CCTV surveillance",
			},
		],
		mediaGallery: [
			// {
			// 	type: "image",
			// 	src: "/facilities/smart-classroom-setup.jpg",
			// 	caption: "Classroom Setup",
			// },
			// {
			// 	type: "video",
			// 	src: "/facilities/smart-classroom-tour.mp4",
			// 	caption: "Tour of a Smart Classroom",
			// },
		],
	},
	{
		id: "laboratories",
		title: "Laboratories",
		imageUrl: "/facilities/lab/lab.jpg",
		description:
			"Well-equipped Physics, Chemistry, and Biology labs for practical learning.",
		highlights: [
			{ title: "Subjects", value: "Physics, Chemistry, Biology" },
			{ title: "Equipment", value: "Latest Lab Equipment" },
			{ title: "Capacity", value: "40 Students per Lab" },
		],
		facilityFeatures: [
			{ title: "Labs", value: "Fully equipped labs for all science subjects" },
			{
				title: "Safety Measures",
				value: "Proper ventilation, Fire extinguishers, First-aid kits",
			},
		],
		mediaGallery: [
			{
				type: "image",
				src: "/facilities/lab/physicsLab.jpg",
				caption: "Physics Lab Setup",
			},
			{
				type: "image",
				src: "/facilities/lab/chemistryLab.jpg",
				caption: "Chemistry Lab Setup",
			},
			{
				type: "image",
				src: "/facilities/lab/bioLab.jpg",
				caption: "Biology Lab Setup",
			},
		],
	},
	{
		id: "monthly-awards",
		title: "Monthly Awards",
		imageUrl: "/facilities/awards/awards.jpg",
		description: "Monthly awards for students with outstanding performance.",
		highlights: [
			{ title: "Frequency", value: "Monthly" },
			{ title: "Awards", value: "Certificates, Trophies" },
			{ title: "Eligibility", value: "All Students" },
		],
		facilityFeatures: [
			{
				title: "Types of Awards",
				value:
					"Top Student Awards, Quaterly Examination, Half Yearly Examination",
			},
			{
				title: "Competitions",
				value:
					"Essay Writing, Quiz Competitions, Sports Achievements, Rangoli Competitions",
			},
		],
		mediaGallery: [
			{
				type: "image",
				src: "/facilities/awards/monthlyAward.jpg",
				caption: "Monthly Award Ceremony",
			},
			{
				type: "image",
				src: "/facilities/awards/certificates.jpg",
				caption: "Competition Certificates",
			},
			{
				type: "image",
				src: "/facilities/awards/bestMorningStudents.jpg",
				caption: "Best Morning Students",
			},
		],
	},
	{
		id: "parents-meeting",
		title: "Parents Meeting",
		imageUrl: "/facilities/ptm/ptm.jpg",
		description: "Annual Parents Meeting to discuss student's progress.",
		highlights: [
			{ title: "Frequency", value: "Annual" },
			{
				title: "Topics Discussed",
				value: "Academic Progress, Behavior, Extracurricular Activities",
			},
			{ title: "Attendance", value: "Mandatory for Parents" },
		],
		facilityFeatures: [
			{
				title: "Answer-Sheets Review by Parents",
				value: "Opportunity to review answer sheets with teachers",
			},
			{
				title: "Feedback & Suggestions",
				value: "Opportunity to provide feedback and suggest improvements",
			},
		],
		mediaGallery: [
			{
				type: "image",
				src: "/facilities/ptm/ptmSetup.jpg",
				caption: "Parent-Teacher Discussions",
			},
			{
				type: "image",
				src: "/facilities/ptm/ptmPublic.jpg",
				caption: "Highlights from the Last PTM",
			},
			{
				type: "image",
				src: "/facilities/ptm/ptmLecture.jpg",
				caption: "Director's Address",
			},
		],
	},
];

module.exports = facilities;
