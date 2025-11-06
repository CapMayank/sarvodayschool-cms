/** @format */

"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

interface ModalProps {
	showModal: boolean;
	setShowModal: (value: boolean) => void;
	imageUrl: string;
}

const Modal: React.FC<ModalProps> = ({ showModal, setShowModal, imageUrl }) => {
	if (!showModal) return null;

	return createPortal(
		<div
			className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center"
			onClick={() => setShowModal(false)}
		>
			<motion.img
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3 }}
				src={imageUrl}
				alt="Full View"
				className="max-w-[90%] max-h-[90%] rounded-xl shadow-2xl"
			/>
		</div>,
		document.body
	);
};

export default Modal;
