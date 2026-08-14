/** @format */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

const HERO_HEIGHT = 300; // px — switch to solid after this scroll depth

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [hidden, setHidden] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [lastScroll, setLastScroll] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			const currentScroll = window.scrollY;

			if (currentScroll > lastScroll && currentScroll > 100) {
				setHidden(true);
			} else {
				setHidden(false);
			}

			setScrolled(currentScroll > HERO_HEIGHT);
			setLastScroll(currentScroll);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [lastScroll]);

	return (
		<header
			className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ease-in-out
				${hidden ? "-translate-y-full" : "translate-y-0"}
				${scrolled
					? "bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.10)] border-b border-gray-200/80"
					: "bg-white/10 backdrop-blur-md border-b border-white/20 shadow-lg"
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
							className="drop-shadow-md hover:scale-105 transition duration-200"
						/>
					</Link>

					<Link href="/">
						<div className="leading-tight">
							<span className={`font-black text-xl md:text-2xl lg:text-3xl drop-shadow-md transition-colors duration-300
								${scrolled ? "text-red-700" : "heading-text-red text-white"}`}>
								SARVODAYA ENGLISH HIGHER SECONDARY SCHOOL LAKHNADON
							</span>
							<p className={`text-sm md:text-base font-semibold transition-colors duration-300
								${scrolled ? "text-slate-500" : "heading-text-yellow"}`}>
								A Commitment to Best Education &amp; Discipline for a Better World
							</p>
						</div>
					</Link>
				</div>

				{/* Desktop CTA + Socials */}
				<div className="hidden md:flex items-center gap-4">
					<SpotlightButton href="/admission">
						Get Admission
					</SpotlightButton>

					<div className="flex gap-3">
						<Link
							href="https://www.youtube.com/@sarvodayaschoollakhnadon"
							className={`transition-colors duration-300
								${scrolled ? "text-slate-500 hover:text-red-600" : "text-white hover:text-red-300"}`}
						>
							<FontAwesomeIcon icon={faYoutube as IconProp} size="lg" />
						</Link>
						<Link
							href="https://www.facebook.com/people/Sarvodaya-English-Higher-Secondary-School-Lakhnadon/61559633950802/"
							className={`transition-colors duration-300
								${scrolled ? "text-slate-500 hover:text-blue-600" : "text-white hover:text-blue-300"}`}
						>
							<FontAwesomeIcon icon={faFacebook as IconProp} size="lg" />
						</Link>
					</div>
				</div>

				{/* Mobile Menu Button */}
				<button
					className={`md:hidden text-2xl transition-colors duration-300
						${scrolled ? "text-slate-700" : "text-white"}`}
					onClick={() => setIsOpen(!isOpen)}
					aria-label="Toggle menu"
				>
					<FontAwesomeIcon icon={isOpen ? (faXmark as IconProp) : (faBars as IconProp)} />
				</button>
			</div>

			{/* ===== MENU BAR (Desktop) ===== */}
			<nav className={`hidden md:flex justify-center py-2.5 text-base font-semibold tracking-wide transition-all duration-500
				${scrolled ? "bg-gray-100/70 border-t border-gray-200/60" : "bg-white/10 backdrop-blur-md"}`}>
				<div className="flex gap-8">
					<NavItem href="/" scrolled={scrolled}>Home</NavItem>
					<NavItem href="/admission" scrolled={scrolled}>Admission</NavItem>
					<NavItem href="/result" scrolled={scrolled}>Result</NavItem>
					<NavItem href="/careers" scrolled={scrolled}>Careers</NavItem>
					<NavItem href="/gallery" scrolled={scrolled}>Gallery</NavItem>
					<NavItem href="/contact" scrolled={scrolled}>Contact Us</NavItem>
					<NavItem href="/about" scrolled={scrolled}>About</NavItem>
					<NavItem href="/dashboard" scrolled={scrolled}>Admin</NavItem>
				</div>
			</nav>

			{/* ===== MOBILE MENU ===== */}
			<div
				className={`md:hidden transition-all duration-300 overflow-hidden border-t
					${isOpen ? "max-h-[420px] py-4" : "max-h-0"}
					${scrolled
						? "bg-white/90 backdrop-blur-xl border-gray-200/70"
						: "bg-black/30 backdrop-blur-md border-white/20"
					}`}
			>
				<div className="flex flex-col items-center gap-4 text-lg font-semibold">
					{[
						{ href: "/", label: "Home" },
						{ href: "/admission", label: "Admission" },
						{ href: "/result", label: "Result" },
						{ href: "/careers", label: "Careers" },
						{ href: "/gallery", label: "Gallery" },
						{ href: "/contact", label: "Contact Us" },
						{ href: "/about", label: "About" },
						{ href: "/dashboard", label: "Admin" },
					].map(({ href, label }) => (
						<NavItem key={href} href={href} scrolled={scrolled} onClick={() => setIsOpen(false)}>
							{label}
						</NavItem>
					))}
				</div>
			</div>
		</header>
	);
};

const NavItem = ({
	href,
	children,
	onClick,
	scrolled,
}: {
	href: string;
	children: React.ReactNode;
	onClick?: () => void;
	scrolled?: boolean;
}) => (
	<Link
		href={href}
		onClick={onClick}
		className={`relative group transition-all duration-200 pb-0.5
			${scrolled ? "text-slate-700 hover:text-red-600" : "text-white hover:text-yellow-300"}`}
	>
		{children}
		{/* animated underline */}
		<span className={`absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full rounded-full
			${scrolled ? "bg-red-600" : "bg-yellow-300"}`} />
	</Link>
);

function SpotlightButton({ href, children }: { href: string; children: React.ReactNode }) {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
		const { left, top } = currentTarget.getBoundingClientRect();
		mouseX.set(clientX - left);
		mouseY.set(clientY - top);
	}

	return (
		<Link
			href={href}
			onMouseMove={handleMouseMove}
			className="group relative overflow-hidden bg-red-600 text-white font-bold px-6 py-2.5 rounded-lg shadow-lg transition-all hover:bg-red-700 hover:shadow-red-900/40 hover:shadow-xl"
		>
			<motion.div
				className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-10"
				style={{
					background: useMotionTemplate`
						radial-gradient(
							60px circle at ${mouseX}px ${mouseY}px,
							rgba(255, 255, 255, 0.4),
							transparent 80%
						)
					`,
				}}
			/>
			<span className="relative z-20">{children}</span>
		</Link>
	);
}

export default Navbar;
