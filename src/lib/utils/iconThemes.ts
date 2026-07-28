export const iconThemes = {
	cats: { textColor: 'text-blue-600' },
	fa: { textColor: 'text-teal-600' },
	adoptions: { textColor: 'text-pink-600' },
	pending: { textColor: 'text-amber-600' },
	volunteers: { textColor: 'text-purple-600' }
} as const;

export function getGradientStyle(theme: string): string {
	const themeMap: Record<string, string> = {
		cats: 'linear-gradient(135deg, hsl(210 100% 50%), hsl(210 100% 35%))',
		fa: 'linear-gradient(135deg, hsl(150 40% 60%), hsl(150 40% 40%))',
		adoptions: 'linear-gradient(135deg, hsl(350 70% 90%), hsl(350 80% 65%))',
		pending: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(38 92% 35%))',
		volunteers: 'linear-gradient(135deg, hsl(280 85% 55%), hsl(280 85% 35%))',
		applications: 'linear-gradient(135deg, hsl(38 92% 50%), hsl(38 92% 35%))',
		communication: 'linear-gradient(135deg, hsl(280 85% 55%), hsl(280 85% 35%))',
		tasks: 'linear-gradient(135deg, hsl(150 40% 60%), hsl(150 40% 40%))'
	};

	return themeMap[theme] || 'linear-gradient(135deg, hsl(210 100% 50%), hsl(210 100% 35%))';
}
