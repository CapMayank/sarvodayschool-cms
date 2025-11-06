/** @format */

// /** @format */
// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
// import { faBars } from "@fortawesome/free-solid-svg-icons";
// import { IconProp } from "@fortawesome/fontawesome-svg-core";

// const Navbar = () => {
// 	const [isOpen, setIsOpen] = useState(false);

// 	return (
// 		<header className="absolute  top-0 left-0 w-full z-50 backdrop-blur-xl bg-white/10 border-b border-white/20">
// 			{/* TOP BAR */}
// 			<div className="flex items-center justify-between px-4 md:px-12 py-3">
// 				{/* Logo + Title */}
// 				<div className="flex items-center gap-4">
// 					<Link href="/">
// 						<Image
// 							src="/logoMin.png"
// 							alt="School Logo"
// 							width={65}
// 							height={65}
// 							className="drop-shadow-md hover:scale-105 transition"
// 						/>
// 					</Link>

// 					<Link href="/">
// 						<div className="leading-tight">
// 							<h1 className="font-black heading-text-red  text-xl md:text-2xl lg:text-3xl text-white tracking-wide drop-shadow-md">
// 								SARVODAYA ENGLISH HIGHER SECONDARY SCHOOL LAKHNADON
// 							</h1>
// 							<p className="heading-text-yellow text-sm md:text-base font-semibold">
// 								A Commitment to Best Education & Discipline for a Better World
// 							</p>
// 						</div>
// 					</Link>
// 				</div>

// 				{/* Right Side (Desktop) */}
// 				<div className="hidden md:flex items-center gap-4">
// 					<Link
// 						href="/admission"
// 						className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-lg shadow-lg transition-all"
// 					>
// 						Get Admission
// 					</Link>

// 					<div className="flex gap-3 text-white">
// 						<Link href="https://www.youtube.com/@sarvodayaschoollakhnadon">
// 							<FontAwesomeIcon
// 								icon={faYoutube as IconProp}
// 								size="lg"
// 								className="hover:text-red-300"
// 							/>
// 						</Link>
// 						<Link href="https://www.facebook.com/people/Sarvodaya-English-Higher-Secondary-School-Lakhnadon/61559633950802/">
// 							<FontAwesomeIcon
// 								icon={faFacebook as IconProp}
// 								size="lg"
// 								className="hover:text-red-300"
// 							/>
// 						</Link>
// 					</div>
// 				</div>

// 				{/* Mobile Hamburger */}
// 				<button
// 					className="md:hidden text-white text-2xl"
// 					onClick={() => setIsOpen(!isOpen)}
// 				>
// 					<FontAwesomeIcon icon={faBars as IconProp} />
// 				</button>
// 			</div>

// 			{/* MENU BAR (Desktop) */}
// 			<nav className="hidden md:flex justify-center bg-white/10 backdrop-blur-md py-3 text-lg font-semibold tracking-wide">
// 				<div className="flex gap-8 text-white">
// 					<NavItem href="/">Home</NavItem>
// 					<NavItem href="/admission">Admission</NavItem>
// 					<NavItem href="/result">Result</NavItem>
// 					<NavItem href="/careers">Careers</NavItem>
// 					<NavItem href="/gallery">Gallery</NavItem>
// 					<NavItem href="/contact">Contact Us</NavItem>
// 					<NavItem href="/about">About</NavItem>
// 					<NavItem href="/admin">Admin</NavItem>
// 				</div>
// 			</nav>

// 			{/* MOBILE MENU */}
// 			<div
// 				className={`md:hidden transition-all bg-white/10 backdrop-blur-md border-t border-white/20 overflow-hidden ${
// 					isOpen ? "max-h-[400px] py-4" : "max-h-0"
// 				}`}
// 			>
// 				<div className="flex flex-col items-center gap-3 text-white text-lg font-semibold">
// 					<NavItem href="/" onClick={() => setIsOpen(false)}>
// 						Home
// 					</NavItem>
// 					<NavItem href="/admission" onClick={() => setIsOpen(false)}>
// 						Admission
// 					</NavItem>
// 					<NavItem href="/result" onClick={() => setIsOpen(false)}>
// 						Result
// 					</NavItem>
// 					<NavItem href="/careers" onClick={() => setIsOpen(false)}>
// 						Careers
// 					</NavItem>
// 					<NavItem href="/gallery" onClick={() => setIsOpen(false)}>
// 						Gallery
// 					</NavItem>
// 					<NavItem href="/contact" onClick={() => setIsOpen(false)}>
// 						Contact Us
// 					</NavItem>
// 					<NavItem href="/about" onClick={() => setIsOpen(false)}>
// 						About
// 					</NavItem>
// 					<NavItem href="/admin" onClick={() => setIsOpen(false)}>
// 						Admin
// 					</NavItem>
// 				</div>
// 			</div>
// 		</header>
// 	);
// };

// // ✅ Helper component for cleaner links
// const NavItem = ({ href, children, onClick }: any) => (
// 	<Link
// 		href={href}
// 		onClick={onClick}
// 		className="hover:text-yellow-300 transition-all duration-200"
// 	>
// 		{children}
// 	</Link>
// );

// export default Navbar;

// /** @format */
// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
// import { faBars } from "@fortawesome/free-solid-svg-icons";
// import { IconProp } from "@fortawesome/fontawesome-svg-core";

// const Navbar = () => {
// 	const [isOpen, setIsOpen] = useState(false);

// 	return (
// 		<header className="fixed top-0 left-0 w-full z-[100] bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg">
// 			{/* ===== TOP BAR ===== */}
// 			<div className="flex items-center justify-between px-4 md:px-12 py-3">
// 				{/* Logo + Name */}
// 				<div className="flex items-center gap-4">
// 					<Link href="/">
// 						<Image
// 							src="/logoMin.png"
// 							alt="School Logo"
// 							width={65}
// 							height={65}
// 							className="drop-shadow-md hover:scale-105 transition"
// 						/>
// 					</Link>

// 					<Link href="/">
// 						<div className="leading-tight">
// 							<h1 className="font-black heading-text-red text-xl md:text-2xl lg:text-3xl text-white drop-shadow-md">
// 								SARVODAYA ENGLISH HIGHER SECONDARY SCHOOL LAKHNADON
// 							</h1>
// 							<p className="heading-text-yellow text-sm md:text-base font-semibold">
// 								A Commitment to Best Education & Discipline for a Better World
// 							</p>
// 						</div>
// 					</Link>
// 				</div>

// 				{/* Desktop CTA + Socials */}
// 				<div className="hidden md:flex items-center gap-4">
// 					<Link
// 						href="/admission"
// 						className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-lg shadow-lg transition-all"
// 					>
// 						Get Admission
// 					</Link>

// 					<div className="flex gap-3 text-white">
// 						<Link href="https://www.youtube.com/@sarvodayaschoollakhnadon">
// 							<FontAwesomeIcon
// 								icon={faYoutube as IconProp}
// 								size="lg"
// 								className="hover:text-red-300"
// 							/>
// 						</Link>
// 						<Link href="https://www.facebook.com/people/Sarvodaya-English-Higher-Secondary-School-Lakhnadon/61559633950802/">
// 							<FontAwesomeIcon
// 								icon={faFacebook as IconProp}
// 								size="lg"
// 								className="hover:text-red-300"
// 							/>
// 						</Link>
// 					</div>
// 				</div>

// 				{/* Mobile Menu Button */}
// 				<button
// 					className="md:hidden text-white text-2xl"
// 					onClick={() => setIsOpen(!isOpen)}
// 				>
// 					<FontAwesomeIcon icon={faBars as IconProp} />
// 				</button>
// 			</div>

// 			{/* ===== MENU BAR (Desktop) ===== */}
// 			<nav className="hidden md:flex justify-center bg-white/10 backdrop-blur-md py-3 text-lg font-semibold tracking-wide">
// 				<div className="flex gap-8 text-white">
// 					<NavItem href="/">Home</NavItem>
// 					<NavItem href="/admission">Admission</NavItem>
// 					<NavItem href="/result">Result</NavItem>
// 					<NavItem href="/careers">Careers</NavItem>
// 					<NavItem href="/gallery">Gallery</NavItem>
// 					<NavItem href="/contact">Contact Us</NavItem>
// 					<NavItem href="/about">About</NavItem>
// 					<NavItem href="/admin">Admin</NavItem>
// 				</div>
// 			</nav>

// 			{/* ===== MOBILE MENU ===== */}
// 			<div
// 				className={`md:hidden transition-all bg-white/10 backdrop-blur-md border-t border-white/20 overflow-hidden ${
// 					isOpen ? "max-h-[400px] py-4" : "max-h-0"
// 				}`}
// 			>
// 				<div className="flex flex-col items-center gap-3 text-white text-lg font-semibold">
// 					<NavItem href="/" onClick={() => setIsOpen(false)}>
// 						Home
// 					</NavItem>
// 					<NavItem href="/admission" onClick={() => setIsOpen(false)}>
// 						Admission
// 					</NavItem>
// 					<NavItem href="/result" onClick={() => setIsOpen(false)}>
// 						Result
// 					</NavItem>
// 					<NavItem href="/careers" onClick={() => setIsOpen(false)}>
// 						Careers
// 					</NavItem>
// 					<NavItem href="/gallery" onClick={() => setIsOpen(false)}>
// 						Gallery
// 					</NavItem>
// 					<NavItem href="/contact" onClick={() => setIsOpen(false)}>
// 						Contact Us
// 					</NavItem>
// 					<NavItem href="/about" onClick={() => setIsOpen(false)}>
// 						About
// 					</NavItem>
// 					<NavItem href="/admin" onClick={() => setIsOpen(false)}>
// 						Admin
// 					</NavItem>
// 				</div>
// 			</div>
// 		</header>
// 	);
// };

// const NavItem = ({ href, children, onClick }: any) => (
// 	<Link
// 		href={href}
// 		onClick={onClick}
// 		className="hover:text-yellow-300 transition-all duration-200"
// 	>
// 		{children}
// 	</Link>
// );

// export default Navbar;

/** @format */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [hidden, setHidden] = useState(false);
	const [lastScroll, setLastScroll] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentScroll = window.scrollY;

			if (currentScroll > lastScroll && currentScroll > 100) {
				setHidden(true); // scrolling down -> hide
			} else {
				setHidden(false); // scrolling up -> show
			}

			setLastScroll(currentScroll);
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [lastScroll]);

	return (
		<header
			className={`fixed top-0 left-0 w-full z-100 bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-lg transition-transform duration-300 ${
				hidden ? "-translate-y-full" : "translate-y-0"
			}`}
		>
			{/* ===== TOP BAR ===== */}
			<div className="flex items-center justify-between px-4 md:px-12 py-3">
				{/* Logo + Name */}
				<div className="flex items-center gap-4">
					<Link href="/">
						<Image
							src="/logoMin.png"
							alt="School Logo"
							width={65}
							height={65}
							className="drop-shadow-md hover:scale-105 transition"
						/>
					</Link>

					<Link href="/">
						<div className="leading-tight">
							<h1 className="font-black heading-text-red text-xl md:text-2xl lg:text-3xl text-white drop-shadow-md">
								SARVODAYA ENGLISH HIGHER SECONDARY SCHOOL LAKHNADON
							</h1>
							<p className="heading-text-yellow text-sm md:text-base font-semibold">
								A Commitment to Best Education & Discipline for a Better World
							</p>
						</div>
					</Link>
				</div>

				{/* Desktop CTA + Socials */}
				<div className="hidden md:flex items-center gap-4">
					<Link
						href="/admission"
						className="bg-red-500 hover:bg-red-600 text-white font-bold px-5 py-2 rounded-lg shadow-lg transition-all"
					>
						Get Admission
					</Link>

					<div className="flex gap-3 text-white">
						<Link href="https://www.youtube.com/@sarvodayaschoollakhnadon">
							<FontAwesomeIcon
								icon={faYoutube as IconProp}
								size="lg"
								className="hover:text-red-300"
							/>
						</Link>
						<Link href="https://www.facebook.com/people/Sarvodaya-English-Higher-Secondary-School-Lakhnadon/61559633950802/">
							<FontAwesomeIcon
								icon={faFacebook as IconProp}
								size="lg"
								className="hover:text-red-300"
							/>
						</Link>
					</div>
				</div>

				{/* Mobile Menu Button */}
				<button
					className="md:hidden text-white text-2xl"
					onClick={() => setIsOpen(!isOpen)}
				>
					<FontAwesomeIcon icon={faBars as IconProp} />
				</button>
			</div>

			{/* ===== MENU BAR (Desktop) ===== */}
			<nav className="hidden md:flex justify-center bg-white/10 backdrop-blur-md py-3 text-lg font-semibold tracking-wide">
				<div className="flex gap-8 text-white">
					<NavItem href="/">Home</NavItem>
					<NavItem href="/admission">Admission</NavItem>
					<NavItem href="/result">Result</NavItem>
					<NavItem href="/careers">Careers</NavItem>
					<NavItem href="/gallery">Gallery</NavItem>
					<NavItem href="/contact">Contact Us</NavItem>
					<NavItem href="/about">About</NavItem>
					<NavItem href="/dashboard">Admin</NavItem>
				</div>
			</nav>

			{/* ===== MOBILE MENU ===== */}
			<div
				className={`md:hidden transition-all bg-white/10 backdrop-blur-md border-t border-white/20 overflow-hidden ${
					isOpen ? "max-h-[400px] py-4" : "max-h-0"
				}`}
			>
				<div className="flex flex-col items-center gap-3 text-white text-lg font-semibold">
					<NavItem href="/" onClick={() => setIsOpen(false)}>
						Home
					</NavItem>
					<NavItem href="/admission" onClick={() => setIsOpen(false)}>
						Admission
					</NavItem>
					<NavItem href="/result" onClick={() => setIsOpen(false)}>
						Result
					</NavItem>
					<NavItem href="/careers" onClick={() => setIsOpen(false)}>
						Careers
					</NavItem>
					<NavItem href="/gallery" onClick={() => setIsOpen(false)}>
						Gallery
					</NavItem>
					<NavItem href="/contact" onClick={() => setIsOpen(false)}>
						Contact Us
					</NavItem>
					<NavItem href="/about" onClick={() => setIsOpen(false)}>
						About
					</NavItem>
					<NavItem href="/dashboard" onClick={() => setIsOpen(false)}>
						Admin
					</NavItem>
				</div>
			</div>
		</header>
	);
};

const NavItem = ({ href, children, onClick }: any) => (
	<Link
		href={href}
		onClick={onClick}
		className="hover:text-yellow-300 transition-all duration-200"
	>
		{children}
	</Link>
);

export default Navbar;
