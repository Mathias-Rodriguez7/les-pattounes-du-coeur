export const iconThemes = {
	cats: { textColor: 'text-blue-600' },
	fa: { textColor: 'text-teal-600' },
	adoptions: { textColor: 'text-pink-600' },
	pending: { textColor: 'text-amber-600' },
	volunteers: { textColor: 'text-purple-600' },
	news: { textColor: 'text-indigo-600' },
	dog: { textColor: 'text-red-600' },
	baby: { textColor: 'text-yellow-600' },
	trees: { textColor: 'text-green-600' }
} as const;

export function getGradientStyle(theme: string): string {
	const themeMap: Record<string, string> = {
		cats: 'linear-gradient(135deg, hsl(210 100% 50%), hsl(210 100% 35%))',
		fa: 'linear-gradient(135deg, hsl(150 40% 60%), hsl(150 40% 40%))',
		adoptions: 'linear-gradient(135deg, hsl(350 70% 90%), hsl(350 80% 65%))',
		pending: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(38 92% 35%))',
		volunteers: 'linear-gradient(135deg, hsl(280 85% 55%), hsl(280 85% 35%))',
		news: 'linear-gradient(135deg, hsl(237 74% 90%), hsl(237 74% 70%))',
		dog: 'linear-gradient(135deg, hsl(0 100% 50%), hsl(0 100% 35%))',
		baby: 'linear-gradient(135deg, hsl(50 100% 80%), hsl(50 100% 60%))',
		trees: 'linear-gradient(135deg, hsl(120 60% 70%), hsl(120 60% 50%))'
	};

	return themeMap[theme] || 'linear-gradient(135deg, hsl(210 100% 50%), hsl(210 100% 35%))';
}
