/** @format */

import Image from "next/image";
import React, { useEffect, useCallback } from "react";
import { FaTimes, FaDownload } from "react-icons/fa";
import { saveAs } from "file-saver";

interface ModalProps {
	showModal: boolean;
	setShowModal: (show: boolean) => void;
	imageUrl: string;
}

const Modal: React.FC<ModalProps> = ({ showModal, setShowModal, imageUrl }) => {
	// Close on Escape key - memoize with useCallback
	const handleKeyDown = useCallback(
		(event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setShowModal(false);
			}
		},
		[setShowModal] // Only depends on setShowModal
	);

	useEffect(() => {
		// Add event listener for escape key
		document.addEventListener("keydown", handleKeyDown);

		// Prevent scrolling when modal is open
		if (showModal) {
			document.body.style.overflow = "hidden";
		}

		// Cleanup function
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "auto"; // Re-enable scrolling when component unmounts
		};
	}, [handleKeyDown, showModal]); // Include both dependencies

	if (!showModal) return null;

	// Close when clicking outside the image
	const handleOutsideClick = (event: React.MouseEvent<HTMLDivElement>) => {
		if ((event.target as HTMLDivElement).id === "modal-overlay") {
			setShowModal(false);
		}
	};

	// Download Image
	const downloadImage = () => {
		const fileName =
			imageUrl.substring(imageUrl.lastIndexOf("/") + 1) || "download";
		saveAs(imageUrl, fileName);
	};

	return (
		<div
			id="modal-overlay"
			className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md p-4 transition-opacity duration-300"
			onClick={handleOutsideClick}
		>
			<div
				className="relative bg-white/10 rounded-lg overflow-hidden shadow-lg flex flex-col items-center justify-center"
				style={{
					maxWidth: "90vw",
					maxHeight: "90vh",
					width: "auto",
					height: "auto",
				}}
			>
				{/* Controls */}
				<button
					className="absolute top-3 right-3 bg-gray-800 text-white rounded-full p-2 text-lg hover:bg-gray-600 transition z-10"
					onClick={() => setShowModal(false)}
					aria-label="Close"
				>
					<FaTimes />
				</button>

				{/* Image Container */}
				<div className="flex items-center justify-center h-full w-full p-2">
					<Image
						src={imageUrl}
						alt="Full Screen"
						width={1000}
						height={1000}
						className="object-contain"
						style={{
							maxWidth: "100%",
							maxHeight: "80vh",
							width: "auto",
							height: "auto",
						}}
					/>
				</div>

				{/* Download Button */}
				{/* <button
					className="absolute bottom-3 right-3 bg-red-600 text-white rounded-full p-2 text-lg hover:bg-red-500 transition z-10"
					onClick={downloadImage}
					aria-label="Download"
				>
					<FaDownload />
				</button> */}
			</div>
		</div>
	);
};

export default Modal;
