export const iconThemes = {
	cats: { textColor: 'text-blue-600' },
	fa: { textColor: 'text-teal-600' },
	adoptions: { textColor: 'text-pink-600' },
	pending: { textColor: 'text-amber-600' },
	volunteers: { textColor: 'text-purple-600' },
	news: { textColor: 'text-indigo-600' },
	dog: { textColor: 'text-red-600' },
	baby: { textColor: 'text-yellow-600' },
	trees: { textColor: 'text-green-600' },
	socializing: { textColor: 'text-orange-600' },
	activ: { textColor: 'text-green-600' },
	break: { textColor: 'text-amber-600' },
	stop: { textColor: 'text-red-600' }
} as const;

export function getGradientStyle(theme: string): string {
	const themeMap: Record<string, string> = {
		// ===== ANIMAUX =====
		cats: 'linear-gradient(135deg, hsl(210 100% 50%), hsl(210 100% 35%))',
		dog: 'linear-gradient(135deg, hsl(0 100% 50%), hsl(0 100% 35%))',
		baby: 'linear-gradient(135deg, hsl(31 84.9% 70%), hsl(31 84.9% 50%))',
		trees: 'linear-gradient(135deg, hsl(120 60% 70%), hsl(120 60% 50%))',

		// ===== ADOPTION & VOLONTARIAT =====
		adoptions: 'linear-gradient(135deg, hsl(350 70% 90%), hsl(350 80% 65%))',
		volunteers: 'linear-gradient(135deg, hsl(280 85% 55%), hsl(280 85% 35%))',
		fa: 'linear-gradient(135deg, hsl(150 40% 60%), hsl(150 40% 40%))',
		socializing: 'linear-gradient(135deg, hsl(27 95% 65%), hsl(27 95% 45%))',
		colab: 'linear-gradient(135deg, hsl(170 75% 60%), hsl(170 75% 40%))',
		other: 'linear-gradient(135deg, hsl(0 0% 65%), hsl(0 0% 45%))',

		// ===== AUTRES =====
		pending: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(38 92% 35%))',
		activ: 'linear-gradient(135deg, hsl(120 60% 70%), hsl(120 60% 50%))',
		stop: 'linear-gradient(135deg, hsl(0 100% 50%), hsl(0 100% 35%))',
		break: 'linear-gradient(135deg, hsl(116 20.3% 81%), hsl(116 8.1% 81%)',

		// ===== CONTENU =====
		news: 'linear-gradient(135deg, hsl(237 74% 90%), hsl(237 74% 70%))'
	};

	return themeMap[theme] || 'linear-gradient(135deg, hsl(210 100% 50%), hsl(210 100% 35%))';
}
