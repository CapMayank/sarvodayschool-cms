/** @format */
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
	return (
		<section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden  ">
			{/* Background Image covers entire screen including behind navbar */}
			<Image
				src="/bg.jpg"
				alt="School Building"
				fill
				priority
				className="absolute inset-0 z-[-2] w-full h-full object-cover "
			/>

			{/*  Gradient Overlay */}
			<div className="absolute inset-0 z-[-1] bg-linear-to-b from-transparent to-black/90" />
			{/* <div className="absolute inset-0 z-[-1] bg-blue-600/2" /> */}

			<div className="w-[90%] mt-96 md:flex items-center animate-fadeUp ">
				<div className=" md:w-[60%] h-full">
					<h1 className="heading-text-yellow text-xl md:text-4xl font-black sm:mb-2 md:mb-4">
						WELCOME TO SARVODAYA ENGLISH HIGHER SECONDARY SCHOOL
					</h1>
					<p className=" heading-text-red text-3xl md:text-5xl sm:mb-4 md:mb-8">
						Best Education & Discipline Expertise
					</p>

					<Link href="/admission">
						<button className="bg-red-500 text-white mt-4 mr-4 p-4 rounded-md md:w-60 hover:scale-110">
							Get Admission Now
						</button>
					</Link>

					<a href="https://www.google.com/maps/place/Sarvodaya+Higher+Secondary+School+Lakhnadon/@22.600395,79.6115581,17z/data=!3m1!4b1!4m6!3m5!1s0x398016e5aebf0369:0xd1749e600ccabbcf!8m2!3d22.600395!4d79.6141384!16s%2Fg%2F11bwjdj890?entry=ttu">
						<button className="bg-white text-red-500 mt-4 mr-4 p-4 rounded-md md:w-60 hover:scale-110">
							Visit Campus
						</button>
					</a>
				</div>
			</div>
		</section>
	);
};

export default Hero;
