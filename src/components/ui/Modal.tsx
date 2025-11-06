/** @format */

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 0.4 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black z-40"
						onClick={onClose}
					/>
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: 50 }}
						className="fixed inset-x-0 top-[20%] mx-auto max-w-2xl z-50 p-6 bg-white rounded-lg shadow-xl"
					>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold">{title}</h3>
							<button
								onClick={onClose}
								className="text-gray-500 hover:text-gray-700"
							>
								<X className="w-5 h-5" />
							</button>
						</div>
						{children}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
