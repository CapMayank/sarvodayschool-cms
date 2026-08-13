import PageTransition from "@/components/public/PageTransition";

export default function Template({ children }: { children: React.ReactNode }) {
	return <PageTransition>{children}</PageTransition>;
}
