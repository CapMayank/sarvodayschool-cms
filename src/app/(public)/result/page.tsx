/** @format */
"use client";
import Header from "@/components/public/header";
import Footer from "@/components/public/footer";
import React, { useState, useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "lucide-react";

// Update the TopperData interface to include session
interface TopperData {
	name: string;
	class: string;
	percentage: number;
	rank?: string; // State/District rank
	schoolRank: number; // Added school rank
	stream?: string;
	imageUrl: string;
	special?: boolean;
	session: string; // Add this field
}

const getOrdinalSuffix = (number: number): string => {
	const j = number % 10;
	const k = number % 100;
	if (j === 1 && k !== 11) return "st";
	if (j === 2 && k !== 12) return "nd";
	if (j === 3 && k !== 13) return "rd";
	return "th";
};

const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	const day = date.getDate();
	const month = date.getMonth() + 1;
	const year = date.getFullYear();
	return `${day.toString().padStart(2, "0")}/${month
		.toString()
		.padStart(2, "0")}/${year}`;
};

const Result = () => {
	const [isButtonEnabled, setIsButtonEnabled] = useState(false);
	const [timeLeft, setTimeLeft] = useState("");
	const [selectedYear, setSelectedYear] =
		useState<keyof typeof sessionConfig>("2024-25");
	const [publishedResult, setPublishedResult] = useState<{
		academicYear: string;
		publishDate: string;
		isPublished: boolean;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Fetch published result data
	useEffect(() => {
		const fetchPublishedResult = async () => {
			try {
				const response = await fetch("/api/result/publication/public");
				const data = await response.json();
				setPublishedResult(data.publication);
			} catch (error) {
				console.error("Error fetching published result:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchPublishedResult();
	}, []);

	useEffect(() => {
		if (!publishedResult?.isPublished || !publishedResult?.publishDate) return;

		const targetDate = new Date(publishedResult.publishDate);

		const updateTimer = () => {
			const currentDate = new Date();
			const difference = targetDate.getTime() - currentDate.getTime();

			if (difference <= 0) {
				setIsButtonEnabled(true);
				setTimeLeft("");
			} else {
				setIsButtonEnabled(false);
				const days = Math.floor(difference / (1000 * 60 * 60 * 24));
				const hours = Math.floor(
					(difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
				);
				const minutes = Math.floor(
					(difference % (1000 * 60 * 60)) / (1000 * 60)
				);
				const seconds = Math.floor((difference % (1000 * 60)) / 1000);

				setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
			}
		};

		updateTimer(); // Call immediately
		const timerInterval = setInterval(updateTimer, 1000);

		return () => clearInterval(timerInterval);
	}, [publishedResult?.isPublished, publishedResult?.publishDate]);

	// Update your toppers data to include session

	const toppers: TopperData[] = [
		//2024-25
		{
			name: "Meenakshi Vishwakarma",
			class: "10th",
			percentage: 98.2,
			rank: "MP State Topper Rank 10",
			schoolRank: 1,
			imageUrl: "/result/10th/MeenakshiVishwakarma.jpg",
			special: true,
			session: "2024-25", // Add session to each topper
		},
		{
			name: "Sanjana Rajak",
			class: "10th",
			percentage: 98.0,
			rank: "Seoni District Topper Rank 1",
			schoolRank: 2,
			imageUrl: "/result/10th/SanjanaRajak.jpg",
			special: true,
			session: "2024-25",
		},
		{
			name: "Priya Tiwari",
			class: "10th",
			percentage: 97.6,
			rank: "",
			schoolRank: 3,
			imageUrl: "/result/10th/PriyaTiwari.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Shivani Golhani",
			class: "10th",
			percentage: 95.2,
			rank: "",
			schoolRank: 4,
			imageUrl: "/result/10th/ShivaniGolhani.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Vaishnavi Golhani",
			class: "10th",
			percentage: 95.0,
			rank: "",
			schoolRank: 5,
			imageUrl: "/result/10th/VaishnaviGolhani.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Poorva Jhariya",
			class: "10th",
			percentage: 94.0,
			rank: "",
			schoolRank: 6,
			imageUrl: "/result/10th/PoorvaJhariya.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Arpita Yadav",
			class: "10th",
			percentage: 93.8,
			rank: "",
			schoolRank: 7,
			imageUrl: "/result/10th/ArpitaYadav.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Kratika Kushwaha",
			class: "10th",
			percentage: 93.6,
			rank: "",
			schoolRank: 8,
			imageUrl: "/result/10th/KratikaKushwaha.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Sanchita Awadhiya",
			class: "10th",
			percentage: 92.6,
			rank: "",
			schoolRank: 9,
			imageUrl: "/result/10th/SanchitaAwadhiya.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Satyam Chouhan",
			class: "10th",
			percentage: 92.4,
			rank: "",
			schoolRank: 10,
			imageUrl: "/result/10th/SatyamChouhan.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Anshika Chandra",
			class: "12th",
			percentage: 93.4,
			rank: "",
			schoolRank: 1,
			imageUrl: "/result/12th/AnshikaChandra.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Sanskrati Awadhiya",
			class: "12th",
			percentage: 87.2,
			rank: "",
			schoolRank: 2,
			imageUrl: "/result/12th/SanskratiAwadhiya.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Daksh Tiwari",
			class: "12th",
			percentage: 86.4,
			rank: "",
			schoolRank: 3,
			imageUrl: "/result/12th/DakshTiwari.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Kavya Yadav",
			class: "12th",
			percentage: 84.2,
			rank: "",
			schoolRank: 4,
			imageUrl: "/result/12th/KavyaYadav.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Parul Shivhare",
			class: "12th",
			percentage: 78.0,
			rank: "",
			schoolRank: 5,
			imageUrl: "/result/12th/ParulShivhare.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Sonali Ahirwar",
			class: "12th",
			percentage: 77.6,
			rank: "",
			schoolRank: 6,
			imageUrl: "/result/12th/SonaliAhirwar.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Khushi Sahu",
			class: "12th",
			percentage: 74.0,
			rank: "",
			schoolRank: 7,
			imageUrl: "/result/12th/KhushiSahu.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Vaishnavi Tiwari",
			class: "12th",
			percentage: 73.6,
			rank: "",
			schoolRank: 8,
			imageUrl: "/result/12th/VaishnaviTiwari.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Shreya Sahu",
			class: "12th",
			percentage: 73.4,
			rank: "",
			schoolRank: 9,
			imageUrl: "/result/12th/ShreyaSahu.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Satyam Bhalavi",
			class: "12th",
			percentage: 69.8,
			rank: "",
			schoolRank: 10,
			imageUrl: "/result/12th/SatyamBhalavi.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Aaradhya Soni",
			class: "8th",
			percentage: 95.0,
			rank: "",
			schoolRank: 1,
			imageUrl: "/result/8th/AaradhyaSoni.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Rishika Uikey",
			class: "8th",
			percentage: 91.0,
			rank: "",
			schoolRank: 2,
			imageUrl: "/result/8th/RishikaUikey.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Sakshi Barkade",
			class: "8th",
			percentage: 90.0,
			rank: "",
			schoolRank: 3,
			imageUrl: "/result/8th/SakshiBarkade.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Jiya Dehariya",
			class: "8th",
			percentage: 90.0,
			rank: "",
			schoolRank: 4,
			imageUrl: "/result/8th/JiyaDehariya.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Arpit Yadav",
			class: "8th",
			percentage: 89.0,
			rank: "",
			schoolRank: 5,
			imageUrl: "/result/8th/ArpitYadav.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Akshay Shivhare",
			class: "8th",
			percentage: 87.0,
			rank: "",
			schoolRank: 6,
			imageUrl: "/result/8th/AkshayShivhare.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Vaibhav Mishra",
			class: "8th",
			percentage: 87.0,
			rank: "",
			schoolRank: 7,
			imageUrl: "/result/8th/VaibhavMishra.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Shrashti Baisle",
			class: "8th",
			percentage: 86.0,
			rank: "",
			schoolRank: 8,
			imageUrl: "/result/8th/ShrashtiBaisle.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Shubhanshi Thakur",
			class: "8th",
			percentage: 82.7,
			rank: "",
			schoolRank: 9,
			imageUrl: "/result/8th/ShubhanshiThakur.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Jagrat Jhariya",
			class: "8th",
			percentage: 86.0,
			rank: "",
			schoolRank: 10,
			imageUrl: "/result/8th/JagratJhariya.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Raghav Tiwari",
			class: "5th",
			percentage: 86.0,
			rank: "",
			schoolRank: 1,
			imageUrl: "/result/5th/RaghavTiwari.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Arpan Bilthare",
			class: "5th",
			percentage: 84.0,
			rank: "",
			schoolRank: 2,
			imageUrl: "/result/5th/ArpanBilthare.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Shivansh Golhani",
			class: "5th",
			percentage: 82.0,
			rank: "",
			schoolRank: 3,
			imageUrl: "/result/5th/ShivanshGolhani.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Yuvan Thakur",
			class: "5th",
			percentage: 80.0,
			rank: "",
			schoolRank: 4,
			imageUrl: "/result/5th/YuvanThakur.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Riddhi Nath",
			class: "5th",
			percentage: 79.0,
			rank: "",
			schoolRank: 5,
			imageUrl: "/result/5th/RiddhiNath.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Bhagya Chourasiya",
			class: "5th",
			percentage: 79.0,
			rank: "",
			schoolRank: 6,
			imageUrl: "/result/5th/BhagyaChourasiya.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Saket Sharma",
			class: "5th",
			percentage: 79.0,
			rank: "",
			schoolRank: 7,
			imageUrl: "/result/5th/SaketSharma.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Devanshi Dehariya",
			class: "5th",
			percentage: 78.0,
			rank: "",
			schoolRank: 8,
			imageUrl: "/result/5th/DevanshiDehariya.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Gaurav Patel",
			class: "5th",
			percentage: 78.0,
			rank: "",
			schoolRank: 9,
			imageUrl: "/result/5th/GauravPatel.jpg",
			special: false,
			session: "2024-25",
		},
		{
			name: "Anshika Uikey",
			class: "5th",
			percentage: 77.0,
			rank: "",
			schoolRank: 10,
			imageUrl: "/result/5th/AnshikaUikey.jpg",
			special: false,
			session: "2024-25",
		},

		//2023-24
		// Class 10th
		{
			name: "Ishika Sahu",
			class: "10th",
			percentage: 92.6,
			rank: "",
			schoolRank: 1,
			imageUrl: "/result/202324/10th/IshikaSahu.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Kajal Golhani",
			class: "10th",
			percentage: 89.8,
			rank: "",
			schoolRank: 2,
			imageUrl: "/result/202324/10th/KajalGolhani.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Soniya Ahirwar",
			class: "10th",
			percentage: 89.6,
			rank: "",
			schoolRank: 3,
			imageUrl: "/result/202324/10th/SoniyaAhirwar.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Laxmi Nema",
			class: "10th",
			percentage: 89.4,
			rank: "",
			schoolRank: 4,
			imageUrl: "/result/202324/10th/LaxmiNema.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Om Sirothiya",
			class: "10th",
			percentage: 89.4,
			rank: "",
			schoolRank: 5,
			imageUrl: "/result/202324/10th/OmSirothiya.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Pooja Patel",
			class: "10th",
			percentage: 86.6,
			rank: "",
			schoolRank: 6,
			imageUrl: "/result/202324/10th/PoojaPatel.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Gaurav Mishra",
			class: "10th",
			percentage: 85.4,
			rank: "",
			schoolRank: 7,
			imageUrl: "/result/202324/10th/GauravMishra.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Divyansh Kumre",
			class: "10th",
			percentage: 84.8,
			rank: "",
			schoolRank: 8,
			imageUrl: "/result/202324/10th/DivyanshKumre.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Siddharth Rathor",
			class: "10th",
			percentage: 84,
			rank: "",
			schoolRank: 9,
			imageUrl: "/result/202324/10th/SiddharthRathor.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Pratibha Soni",
			class: "10th",
			percentage: 83.3,
			rank: "",
			schoolRank: 10,
			imageUrl: "/result/202324/10th/PratibhaSoni.jpg",
			special: false,
			session: "2023-24",
		},

		// Class 12th
		{
			name: "Vivek Patel",
			class: "12th",
			percentage: 87,
			rank: "",
			schoolRank: 1,
			imageUrl: "/result/202324/12th/VivekPatel.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Anshika Agrawal",
			class: "12th",
			percentage: 86,
			rank: "",
			schoolRank: 2,
			imageUrl: "/result/202324/12th/AnshikaAgrawal.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Unnati Parashar",
			class: "12th",
			percentage: 85.6,
			rank: "",
			schoolRank: 3,
			imageUrl: "/result/202324/12th/UnnatiParashar.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Charu Gautam",
			class: "12th",
			percentage: 84.8,
			rank: "",
			schoolRank: 4,
			imageUrl: "/result/202324/12th/CharuGautam.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Paras Parashar",
			class: "12th",
			percentage: 84.6,
			rank: "",
			schoolRank: 5,
			imageUrl: "/result/202324/12th/ParasParashar.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Aman Sahu",
			class: "12th",
			percentage: 83,
			rank: "",
			schoolRank: 6,
			imageUrl: "/result/202324/12th/AmanSahu.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Manvendra Singh Paraste",
			class: "12th",
			percentage: 80.02,
			rank: "",
			schoolRank: 7,
			imageUrl: "/result/202324/12th/ManvendraSinghParaste.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Krinjal Awadhiya",
			class: "12th",
			percentage: 79.8,
			rank: "",
			schoolRank: 8,
			imageUrl: "/result/202324/12th/KrinjalAwadhiya.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Deeti Biswas",
			class: "12th",
			percentage: 77,
			rank: "",
			schoolRank: 9,
			imageUrl: "/result/202324/12th/DeetiBiswas.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Palak Dehariya",
			class: "12th",
			percentage: 74.8,
			rank: "",
			schoolRank: 10,
			imageUrl: "/result/202324/12th/PalakDehariya.jpg",
			special: false,
			session: "2023-24",
		},

		// Class 5th
		{
			name: "Anushri Soni",
			class: "5th",
			percentage: 88.6,
			rank: "",
			schoolRank: 1,
			imageUrl: "/result/202324/5th/AnushriSoni.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Arushi Ahirwar",
			class: "5th",
			percentage: 88,
			rank: "",
			schoolRank: 2,
			imageUrl: "/result/202324/5th/ArushiAhirwar.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Shubhi Patva",
			class: "5th",
			percentage: 86,
			rank: "",
			schoolRank: 3,
			imageUrl: "/result/202324/5th/ShubhiPatva.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Sonakshi Yadav",
			class: "5th",
			percentage: 84,
			rank: "",
			schoolRank: 4,
			imageUrl: "/result/202324/5th/SonakshiYadav.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Vedpratap Gumasta",
			class: "5th",
			percentage: 84,
			rank: "",
			schoolRank: 5,
			imageUrl: "/result/202324/5th/VedpratapGumasta.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Karishma Sen",
			class: "5th",
			percentage: 82,
			rank: "",
			schoolRank: 6,
			imageUrl: "/result/202324/5th/KarishmaSen.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Aditi Wastri",
			class: "5th",
			percentage: 82,
			rank: "",
			schoolRank: 7,
			imageUrl: "/result/202324/5th/AditiWastri.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Aabha Jhariya",
			class: "5th",
			percentage: 81,
			rank: "",
			schoolRank: 8,
			imageUrl: "/result/202324/5th/AabhaJhariya.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Mayank Dehariya",
			class: "5th",
			percentage: 81,
			rank: "",
			schoolRank: 9,
			imageUrl: "/result/202324/5th/MayankDehariya.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Ayush Dubey",
			class: "5th",
			percentage: 80,
			rank: "",
			schoolRank: 10,
			imageUrl: "/result/202324/5th/AyushDubey.jpg",
			special: false,
			session: "2023-24",
		},

		// Class 8th
		{
			name: "Mannat Parashar",
			class: "8th",
			percentage: 90,
			rank: "",
			schoolRank: 1,
			imageUrl: "/result/202324/8th/MannatParashar.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Shreya Vishwakarma",
			class: "8th",
			percentage: 88,
			rank: "",
			schoolRank: 2,
			imageUrl: "/result/202324/8th/ShreyaVishwakarma.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Arpit Kumre",
			class: "8th",
			percentage: 88,
			rank: "",
			schoolRank: 3,
			imageUrl: "/result/202324/8th/ArpitKumre.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Shivam Ahirwar",
			class: "8th",
			percentage: 88,
			rank: "",
			schoolRank: 4,
			imageUrl: "/result/202324/8th/ShivamAhirwar.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Anshuman Bakode",
			class: "8th",
			percentage: 87,
			rank: "",
			schoolRank: 5,
			imageUrl: "/result/202324/8th/AnshumanBakode.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Aditya Yadav",
			class: "8th",
			percentage: 87,
			rank: "",
			schoolRank: 6,
			imageUrl: "/result/202324/8th/AdityaYadav.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Arti Patel",
			class: "8th",
			percentage: 86,
			rank: "",
			schoolRank: 7,
			imageUrl: "/result/202324/8th/ArtiPatel.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Tanish Jaiswal",
			class: "8th",
			percentage: 86,
			rank: "",
			schoolRank: 8,
			imageUrl: "/result/202324/8th/TanishJaiswal.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Muskan Yadav",
			class: "8th",
			percentage: 85,
			rank: "",
			schoolRank: 9,
			imageUrl: "/result/202324/8th/MuskanYadav.jpg",
			special: false,
			session: "2023-24",
		},
		{
			name: "Siddhi Shivhare",
			class: "8th",
			percentage: 86,
			rank: "",
			schoolRank: 10,
			imageUrl: "/result/202324/8th/SiddhiShivhare.jpg",
			special: false,
			session: "2023-24",
		},
	];

	const sessionConfig = {
		"2024-25": {
			sequence: ["10th", "12th", "8th", "5th"],
			title: "Current Academic Session",
		},
		"2023-24": {
			sequence: ["10th", "8th", "5th", "12th"], // Different sequence for previous year
			title: "Previous Academic Session",
		},
	} as const;

	return (
		<>
			<Header title="Result" />
			<div className="flex justify-center items-center bg-gray-100 p-8">
				<div className="flex flex-col gap-6 bg-white/80 backdrop-blur-lg shadow-2xl p-10 rounded-2xl text-center w-full max-w-2xl border border-gray-300">
					<h2 className="text-red-600 text-4xl md:text-5xl font-extrabold">
						Annual Examination Result
					</h2>
					<p className="text-gray-600 text-lg font-medium">
						Stay updated with the latest results for your academic session.
					</p>

					{isLoading ? (
						<div className="text-gray-600 text-xl">
							Loading result information...
						</div>
					) : !publishedResult ? (
						<div className="text-center">
							<div className="text-gray-700 text-2xl font-semibold mb-4">
								No results to display
							</div>
							<p className="text-gray-600">
								No results have been published yet. Please check back later.
							</p>
						</div>
					) : (
						<>
							{/* Session Details */}
							<div className="flex flex-col gap-2 text-gray-700 text-xl font-semibold">
								<div className="flex items-center justify-center gap-2">
									<FaCheckCircle className="text-green-600 text-2xl" />
									<span>Session: {publishedResult.academicYear}</span>
								</div>
								<div className="flex items-center justify-center gap-2">
									<FaCheckCircle className="text-green-600 text-2xl" />
									<span>Date: {formatDate(publishedResult.publishDate)}</span>
								</div>
							</div>

							{/* Countdown Timer or Status */}
							<div className="text-gray-700 text-2xl font-semibold">
								{isButtonEnabled
									? "Results are now available!"
									: timeLeft
									? `Time left: ${timeLeft}`
									: "Loading..."}
							</div>

							{/* Button */}
							{isButtonEnabled ? (
								<a href="/result/search">
									<button className="bg-linear-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg transition-transform transform hover:scale-105 hover:shadow-xl focus:ring-4 focus:ring-red-300">
										Check Result From Here
									</button>
								</a>
							) : (
								<button
									disabled
									className="bg-gray-400 text-white px-8 py-4 rounded-lg text-lg font-bold shadow-lg cursor-not-allowed"
								>
									Results Available Soon
								</button>
							)}
						</>
					)}
				</div>
			</div>

			{/* Add this new section after the countdown */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="max-w-7xl mx-auto px-4 py-16"
			>
				<div className="text-center mb-16">
					<h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-lionear-to-r from-red-500 to-red-600 mb-4">
						Our Outstanding Achievers
					</h2>

					{/* Year Selector */}
					<div className="flex flex-col items-center gap-4 my-6">
						<div className="flex justify-center gap-4">
							{Object.keys(sessionConfig).map((year) => (
								<button
									key={year}
									onClick={() =>
										setSelectedYear(year as keyof typeof sessionConfig)
									}
									className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
										selectedYear === year
											? "bg-red-600 text-white shadow-lg scale-105"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200"
									}`}
								>
									{year}
								</button>
							))}
						</div>
						<p className="text-xl text-gray-600">
							{sessionConfig[selectedYear as keyof typeof sessionConfig].title}
						</p>
					</div>

					<div className="w-40 h-1 bg-linear-to-r from-red-500 to-red-600 mx-auto mt-6 rounded-full"></div>
				</div>

				{sessionConfig[selectedYear as keyof typeof sessionConfig].sequence.map(
					(className) => (
						<div key={className} className="mb-20">
							<div className="flex items-center gap-4 mb-8">
								<div className="flex-1 h-px bg-linear-to-r from-gray-200 to-gray-300"></div>
								<h3 className="text-2xl md:text-3xl font-bold px-6 py-3 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm">
									Class {className}{" "}
									<span className="text-red-600">Toppers</span>
								</h3>
								<div className="flex-1 h-px bg-linear-to-l from-gray-200 to-gray-300"></div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
								{toppers
									.filter(
										(topper) =>
											topper.class === className &&
											topper.session === selectedYear
									)
									.map((topper, index) => (
										<motion.div
											key={index}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.5, delay: index * 0.1 }}
											className={`relative overflow-hidden rounded-2xl w-[260px] mx-auto ${
												topper.special
													? "bg-linear-to-br from-yellow-50 via-orange-50 to-amber-50 border-2 border-yellow-200"
													: "bg-white"
											} shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-all duration-300 group`}
										>
											{topper.special && (
												<div className="absolute top-2 right-2 z-10">
													<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-linear-to-r from-yellow-400 to-amber-500 text-white shadow-lg">
														<Badge className="w-3 h-3 mr-1" />
														{topper.rank}
													</span>
												</div>
											)}

											<div className="relative w-full h-60">
												<Image
													src={topper.imageUrl}
													alt={topper.name}
													fill
													className="object-cover group-hover:scale-105 transition-transform duration-500"
													sizes="260px"
													priority
												/>
											</div>

											<div className="p-3 relative">
												{topper.special && (
													<div className="absolute -top-4 left-3 bg-linear-to-r from-red-500 to-red-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow-lg">
														Special Achievement
													</div>
												)}

												<h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors truncate">
													{topper.name}
												</h3>

												<div className="space-y-1">
													<div className="flex items-center gap-2">
														<div className="w-1.5 h-1.5 rounded-full bg-red-500" />
														<p className="text-sm text-gray-700 font-medium">
															Class: {topper.class}
															{topper.stream && (
																<span className="ml-1 text-red-600">
																	({topper.stream})
																</span>
															)}
														</p>
													</div>

													<div className="flex items-center gap-2">
														<div className="w-1.5 h-1.5 rounded-full bg-green-500" />
														<p className="text-sm text-gray-700 font-medium">
															Percentage:{" "}
															<span className="text-green-600 font-bold">
																{topper.percentage}%
															</span>
														</p>
													</div>

													<div className="flex items-center gap-2">
														<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
														<p className="text-sm text-gray-700 font-medium">
															School Rank:{" "}
															<span className="text-blue-600 font-bold">
																{topper.schoolRank}
																{getOrdinalSuffix(topper.schoolRank)}
															</span>
														</p>
													</div>

													{topper.rank && (
														<div className="flex items-center gap-2">
															<div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
															<p className="text-sm text-gray-700 font-medium">
																Achievement:{" "}
																<span className="text-yellow-600 font-bold">
																	{topper.rank}
																</span>
															</p>
														</div>
													)}
												</div>
											</div>
										</motion.div>
									))}
							</div>
						</div>
					)
				)}
			</motion.div>

			<Footer />
		</>
	);
};

export default Result;
