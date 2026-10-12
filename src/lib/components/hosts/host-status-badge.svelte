<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import type { ColabActivity } from '@prisma/client';

	let { status }: { status: ColabActivity } = $props();

	const variants: Record<ColabActivity, string> = {
		ACTIVE: 'bg-green-100 text-green-800',
		BREAK: 'bg-yellow-100 text-yellow-800',
		STOP: 'bg-red-100 text-red-800'
	};

	const labels: Record<ColabActivity, string> = {
		ACTIVE: 'Actif',
		BREAK: 'Pause',
		STOP: 'Arrêté'
	};
</script>

<Badge class={variants[status]}>{labels[status]}</Badge>
