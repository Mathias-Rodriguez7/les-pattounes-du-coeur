// Les « puces » des filtres actifs, affichées sous la recherche : « Âge : Junior × ».
// On voit d'un coup d'œil ce qui filtre la liste, et un clic sur × retire ce filtre.

export interface FilterChip {
	/** Le texte de la puce : « Âge : Junior » */
	label: string;
	/** Retire ce filtre */
	clear: () => void;
}

interface FilterDef {
	/** Le nom du filtre (souvent le placeholder de la liste) : « Âge » */
	name: string;
	value: string;
	options: readonly { value: string; label: string }[];
	clear: () => void;
}

/** Une puce par filtre qui a une valeur (les filtres vides n'en ont pas) */
export function filterChips(defs: FilterDef[]): FilterChip[] {
	return defs
		.filter((def) => def.value)
		.map((def) => ({
			label: `${def.name} : ${def.options.find((o) => o.value === def.value)?.label ?? def.value}`,
			clear: def.clear
		}));
}
