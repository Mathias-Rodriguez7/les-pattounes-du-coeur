<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.ts';
	import Icon from '#lib/components/Icon.svelte';
	import SectionCard from '#lib/components/cards/SectionCard.svelte';
	import { Mail, Phone, FileText } from '@lucide/svelte';
	import { formatDate, formatDateNum } from '#lib/utils/date.ts';
	import type { BlacklistPerson } from '#lib/types/blacklist.ts';
	import BlacklistLiftDialog from './BlacklistLiftDialog.svelte';
	import { ACCOUNT_LABELS, personName } from './blacklistDisplay.ts';

	interface Props {
		person: BlacklistPerson | null;
	}

	let { person }: Props = $props();

	const name = $derived(person ? personName(person) : null);
	// Lignes déjà levées : l'historique sous la raison actuelle
	const pastEntries = $derived(person?.history.filter((entry) => !entry.isBlacklisted) ?? []);
</script>

{#if person}
	<Card.Root class="gap-4">
		<!-- En-tête : identité + action -->
		<Card.Header class="flex flex-row flex-wrap items-start justify-between gap-3">
			<div class="min-w-0">
				<Card.Title class="truncate text-xl font-bold" title={name ?? person.email}>
					{name ?? person.email}
				</Card.Title>
				<div class="mt-1 flex flex-wrap items-center gap-2">
					<Badge class="bg-red-100 text-red-700">Blacklisté</Badge>
					{#if person.account}
						<Badge variant="secondary">Compte {ACCOUNT_LABELS[person.account]} désactivé</Badge>
					{/if}
				</div>
			</div>
			<BlacklistLiftDialog
				email={person.email}
				name={name ?? person.email}
				hasAccount={person.account !== null}
			/>
		</Card.Header>

		<Card.Content class="@container grid gap-4">
			<!-- Raison actuelle -->
			<SectionCard icon="Ban" title="Raison" color="red">
				<p class="text-sm whitespace-pre-line">{person.reason}</p>
				<p class="mt-2 text-xs text-muted-foreground">
					Blacklisté depuis le {formatDate(person.since)}
				</p>
			</SectionCard>

			<!-- Contact -->
			<SectionCard icon="user" title="Contact" color="gray">
				<ul class="grid gap-2 text-sm @lg:grid-cols-2">
					<li class="flex min-w-0 items-center gap-2">
						<Mail class="size-4 shrink-0 text-muted-foreground" />
						<span class="truncate" title={person.email}>{person.email}</span>
					</li>
					<li class="flex items-center gap-2">
						<Phone class="size-4 shrink-0 text-muted-foreground" />
						<span>{person.phone ?? 'Non renseigné'}</span>
					</li>
					<li class="flex items-center gap-2 @lg:col-span-2">
						<FileText class="size-4 shrink-0 text-muted-foreground" />
						<span>
							{person.formsCount === 0
								? 'Aucune demande avec cet email'
								: `${person.formsCount} demande${person.formsCount > 1 ? 's' : ''} avec cet email`}
						</span>
					</li>
				</ul>
				{#if !name}
					<p class="mt-2 text-xs text-muted-foreground">
						Nom inconnu : ni compte, ni demande avec cet email.
					</p>
				{/if}
			</SectionCard>

			<!-- Historique : les blacklists précédentes, déjà levées -->
			{#if pastEntries.length > 0}
				<SectionCard icon="clock" title="Historique ({pastEntries.length})" color="slate">
					<ol class="grid gap-3">
						{#each pastEntries as entry (entry.id)}
							<li class="border-l-2 border-muted pl-3">
								<p class="text-xs text-muted-foreground">
									Du {formatDateNum(entry.createdAt)} au {formatDateNum(entry.updatedAt)}
								</p>
								<p class="text-sm whitespace-pre-line">{entry.description}</p>
							</li>
						{/each}
					</ol>
				</SectionCard>
			{/if}
		</Card.Content>
	</Card.Root>
{:else}
	<Card.Root class="flex h-full min-h-60 items-center justify-center">
		<Card.Content class="text-center text-muted-foreground">
			<Icon name="Ban" class="mx-auto mb-4 h-12 w-12 opacity-50" />
			<p>Sélectionnez une personne pour voir le détail</p>
		</Card.Content>
	</Card.Root>
{/if}
