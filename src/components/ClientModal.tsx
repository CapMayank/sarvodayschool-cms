/** @format */
"use client";

import { useState } from "react";
import Modal from "@/components/public/modals";

interface ClientModalProps {
	children: React.ReactNode;
	imageUrl: string;
	altText: string;
}

export default function ClientModal({
	children,
	imageUrl,
	altText,
}: ClientModalProps) {
	const [showModal, setShowModal] = useState(false);

	return (
		<>
			{/* Clickable content that opens the modal */}
			<div onClick={() => setShowModal(true)} className="cursor-pointer">
				{children}
			</div>

			{/* Modal that appears when clicked */}
			{showModal && (
				<Modal
					showModal={showModal}
					setShowModal={setShowModal}
					imageUrl={imageUrl}
				/>
			)}
		</>
	);
}
