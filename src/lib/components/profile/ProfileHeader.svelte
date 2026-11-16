<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';

	// En-tête du Profil : bandeau photo, avatar, identité, et deux chiffres du quotidien
	interface Props {
		name: string;
		initials: string;
		roleLabel: string;
		statusLabel: string;
		/** Couleur du point de statut (ex : « bg-green-500 ») */
		statusDotClass: string;
		memberSince: string;
		/** En pause : la date de fin, affichée sous les badges */
		breakEndLabel?: string | null;
		/** Chats à l'adoption ou à sociabiliser que la bénévole suit */
		catsFollowed: number;
		/** Demandes en attente qui lui sont attribuées */
		pendingForms: number;
	}

	let {
		name,
		initials,
		roleLabel,
		statusLabel,
		statusDotClass,
		memberSince,
		breakEndLabel = null,
		catsFollowed,
		pendingForms
	}: Props = $props();

	const stats = $derived([
		{ value: catsFollowed, label: catsFollowed > 1 ? 'chats suivis' : 'chat suivi' },
		{ value: pendingForms, label: pendingForms > 1 ? 'demandes à traiter' : 'demande à traiter' }
	]);
</script>

<Card.Root class="gap-0 overflow-hidden py-0">
	<!-- Bandeau : dégradé + chats qui marchent, alignés à droite.
	     PNG transparent recadré (static/img/chats-ligne-bandeau.png) : le dégradé se voit autour.
	     alt vide : l'image est décorative -->
	<div class="relative h-32 bg-linear-to-r from-primary/80 to-accent sm:h-44">
		<img
			src="/img/chats-ligne-bandeau.png"
			alt=""
			class="absolute right-4 bottom-0 h-[90%] w-auto max-w-[calc(100%-2rem)] object-contain object-bottom-right sm:right-8"
		/>
	</div>

	<div class="flex flex-wrap items-end gap-x-8 gap-y-4 px-6 pb-6">
		<!-- L'avatar chevauche le bandeau -->
		<div
			class="z-10 -mt-12 flex size-24 shrink-0 items-center justify-center rounded-full bg-primary text-3xl font-bold text-primary-foreground ring-4 ring-card sm:-mt-14 sm:size-28"
		>
			{initials}
		</div>

		<div class="min-w-0 flex-1 basis-64">
			<h1 class="mt-4 truncate text-2xl font-bold">{name}</h1>
			<div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
				<span class="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
					{roleLabel}
				</span>
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-0.5 text-xs font-medium"
				>
					<span class="size-2 rounded-full {statusDotClass}"></span>
					{statusLabel}
				</span>
				<span class="text-muted-foreground">Membre depuis {memberSince}</span>
			</div>
			{#if breakEndLabel}
				<p class="mt-2 text-xs text-muted-foreground">En pause jusqu'au {breakEndLabel} inclus</p>
			{/if}
		</div>

		<dl class="flex gap-8">
			{#each stats as stat (stat.label)}
				<!-- flex-col-reverse : le chiffre au-dessus, mais <dt> avant <dd> dans le HTML -->
				<div class="flex flex-col-reverse items-center">
					<dt class="text-xs text-muted-foreground">{stat.label}</dt>
					<dd class="text-2xl font-bold">{stat.value}</dd>
				</div>
			{/each}
		</dl>
	</div>
</Card.Root>
