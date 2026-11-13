<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { districtLabel } from '#lib/utils/districts.ts';
	import { VOLUNTEER_SECTION_CONFIG } from '#lib/constants/volunteer.ts';
	import type { VolunteerWithRelations } from '#lib/types/volunteer.ts';

	// Expérience (chats suivis, adoptés), contact et adresse d'un bénévole
	interface Props {
		volunteer: VolunteerWithRelations;
	}

	let { volunteer }: Props = $props();

	const location = $derived(
		volunteer.profil.district
			? districtLabel(volunteer.profil.district)
			: volunteer.profil.city || '—'
	);
	const adoptedCatsCount = $derived(
		volunteer.cats.filter((catVolunteer) => catVolunteer.cat.status === 'ADOPTED').length
	);
</script>

<section class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @3xl:grid-cols-8">
	<!-- Expérience -->
	<SectionCard
		icon={VOLUNTEER_SECTION_CONFIG.experience.icon}
		title={VOLUNTEER_SECTION_CONFIG.experience.label}
		color={VOLUNTEER_SECTION_CONFIG.experience.color}
		class="@3xl:col-span-2"
	>
		<div class="ml-6 grid gap-3">
			<div class="flex items-center justify-between gap-2">
				<span class="text-xs font-medium text-muted-foreground">Chats gérés</span>
				<Badge class="bg-blue-100 text-sm font-bold text-blue-800">{volunteer.cats.length}</Badge>
			</div>
			<div class="flex items-center justify-between gap-2">
				<span class="text-xs font-medium text-muted-foreground">Adoptions</span>
				<Badge class="bg-green-100 text-sm font-bold text-green-800">
					{adoptedCatsCount}
				</Badge>
			</div>
		</div>
	</SectionCard>

	<!-- Contact -->
	<SectionCard
		icon={VOLUNTEER_SECTION_CONFIG.contact.icon}
		title={VOLUNTEER_SECTION_CONFIG.contact.label}
		color={VOLUNTEER_SECTION_CONFIG.contact.color}
		class="@3xl:col-span-3"
	>
		<div class="ml-6 grid min-w-0 gap-3 text-sm">
			<div class="min-w-0">
				<p class="font-medium text-muted-foreground">Téléphone</p>
				<a
					href="tel:{volunteer.profil.phone}"
					class="flex items-center gap-2 text-blue-600 hover:underline"
				>
					<Icon name="phone" iconClass="size-4 shrink-0 text-muted-foreground" />
					{volunteer.profil.phone || '—'}
				</a>
			</div>
			<div class="min-w-0">
				<p class="font-medium text-muted-foreground">Email</p>
				<a
					href="mailto:{volunteer.profil.email}"
					class="flex min-w-0 items-center gap-2 text-blue-600 hover:underline"
					title={volunteer.profil.email}
				>
					<Icon name="mail" iconClass="size-4 shrink-0 text-muted-foreground" />
					<span class="truncate">{volunteer.profil.email}</span>
				</a>
			</div>
		</div>
	</SectionCard>

	<!-- Adresse : pleine largeur en 2 colonnes, 3/8 en grand -->
	<SectionCard
		icon={VOLUNTEER_SECTION_CONFIG.address.icon}
		title={VOLUNTEER_SECTION_CONFIG.address.label}
		color={VOLUNTEER_SECTION_CONFIG.address.color}
		class="@lg:col-span-2 @3xl:col-span-3"
	>
		<div class="ml-6 space-y-2 text-sm">
			<div>
				<p class="font-medium text-muted-foreground">Rue</p>
				<p class="font-medium text-gray-900">{volunteer.profil.address || '—'}</p>
			</div>
			<div class="flex flex-wrap gap-x-6 gap-y-2">
				<div>
					<p class="font-medium text-muted-foreground">Ville</p>
					<p class="font-medium text-gray-900">{volunteer.profil.city || '—'}</p>
				</div>
				<div>
					<p class="font-medium text-muted-foreground">CP</p>
					<p class="font-medium text-gray-900">{volunteer.profil.postalCode || '—'}</p>
				</div>
				<div>
					<p class="font-medium text-muted-foreground">Quartier</p>
					<Badge variant="secondary" class="mt-1 text-xs">{location}</Badge>
				</div>
			</div>
		</div>
	</SectionCard>
</section>
