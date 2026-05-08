<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { fade, fly } from 'svelte/transition';
	import FormSOS from '$lib/components/forms/FormSOS.svelte';
	import FormHost from '$lib/components/forms/FormHost.svelte';
	import FormVolunteer from '$lib/components/forms/FormVolunteer.svelte';

	let { data } = $props();
</script>

<main in:fade={{ duration: 200 }} class="flex justify-center px-4 py-8">
	<div in:fly={{ y: 20, duration: 300 }} class="mx-auto flex w-full max-w-7xl flex-col gap-6">
		<!-- 🚨 HERO -->
		<Card.Root class="border-destructive/20 overflow-hidden">
			<div class="grid gap-6 px-12 lg:grid-cols-2">
				<div class="flex flex-col justify-center">
					<Card.Header class="p-0">
						<Card.Title class="text-2xl font-bold lg:text-3xl">SOS : Aide immédiate</Card.Title>

						<Card.Description class="mt-4 text-base leading-relaxed lg:text-lg">
							Chaque signalement peut sauver la vie d’un chat en détresse.
						</Card.Description>
					</Card.Header>

					<Card.Content class="mt-6 space-y-4 p-0">
						<ul class="space-y-3">
							<li class="flex items-start gap-3">
								<span class="text-primary mt-1">•</span>
								<span>Chats errants repérés dans les rues</span>
							</li>

							<li class="flex items-start gap-3">
								<span class="text-primary mt-1">•</span>
								<span>Chats maltraités ou abandonnés</span>
							</li>

							<li class="flex items-start gap-3">
								<span class="text-primary mt-1">•</span>
								<span>Intervention rapide grâce à vos signalements</span>
							</li>

							<li class="flex items-start gap-3">
								<span class="text-primary mt-1">•</span>
								<span>Offrez une nouvelle chance à un animal en danger</span>
							</li>
						</ul>

						<div class="text-muted-foreground pt-2 text-sm">+120 chats sauvés cette année 🐱</div>
					</Card.Content>

					<Card.Footer class="mt-8 justify-start p-0">
						<Dialog.Root>
							<Dialog.Trigger>
								<Button size="lg">Faire un signalement</Button>
							</Dialog.Trigger>
							<Dialog.Content class="sm:max-w-125">
								<FormSOS data={data.sosForm} />
							</Dialog.Content>
						</Dialog.Root>
					</Card.Footer>
				</div>

				<!-- IMAGE -->
				<div class="flex items-center justify-center p-6">
					<img
						src="/img/cats/cats.help.jpg"
						alt="Chat secouru"
						class="h-full w-full rounded-2xl object-contain"
					/>
				</div>
			</div>
		</Card.Root>

		<!-- ❤️ GRID -->
		<div class="grid gap-6 lg:grid-cols-2">
			<!-- 🏠 FAMILLE -->
			<Card.Root class="flex flex-col">
				<Card.Header>
					<Card.Title class="text-2xl font-bold lg:text-3xl">Devenir Famille d’Accueil</Card.Title>
				</Card.Header>

				<Card.Content class="flex-1 space-y-4 leading-relaxed">
					<p>Offrez un foyer temporaire et sécurisé à un chat en détresse.</p>

					<p>Vous l’aidez à reprendre confiance et à se préparer pour une future adoption.</p>

					<p>Un engagement précieux qui change durablement leur vie.</p>
				</Card.Content>

				<Card.Footer class="justify-end">
					<Dialog.Root>
						<Dialog.Trigger>
							<Button size="lg">Faire un signalement</Button>
						</Dialog.Trigger>
						<Dialog.Content class="sm:max-w-125">
							<FormHost data={data.hostForm} />
						</Dialog.Content>
					</Dialog.Root>
				</Card.Footer>
			</Card.Root>

			<!-- 🙌 BÉNÉVOLE -->
			<Card.Root class="flex flex-col">
				<Card.Header>
					<Card.Title class="text-2xl font-bold lg:text-3xl">Devenir Bénévole</Card.Title>
				</Card.Header>

				<Card.Content class="flex-1 space-y-4 leading-relaxed">
					<p>Participez activement au sauvetage et au bien-être des chats.</p>

					<p>
						Aidez lors des urgences, accompagnez les familles d’accueil et participez aux adoptions.
					</p>

					<p>Chaque action, même petite, a un impact immense.</p>
				</Card.Content>

				<Card.Footer class="justify-end">
					<Dialog.Root>
						<Dialog.Trigger>
							<Button size="lg">Faire un signalement</Button>
						</Dialog.Trigger>
						<Dialog.Content class="sm:max-w-125">
							<FormVolunteer data={data.volunteerForm} />
						</Dialog.Content>
					</Dialog.Root>
				</Card.Footer>
			</Card.Root>
		</div>

		<!-- 🤝 PARTENAIRES -->
		<Card.Root class="overflow-hidden">
			<div class="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
				<!-- TEXTE -->
				<div class="p-8">
					<Card.Header class="p-0">
						<Card.Title class="text-2xl font-bold lg:text-3xl">Collaborer avec nous</Card.Title>

						<Card.Description class="mt-3 text-base leading-relaxed">
							Ensemble, construisons un impact durable pour les chats en détresse.
						</Card.Description>
					</Card.Header>

					<Card.Content class="mt-6 space-y-4 p-0 leading-relaxed">
						<p>
							Entreprises, associations ou acteurs engagés : votre soutien peut sauver des vies.
						</p>

						<p>
							Dons, mécénat, logistique ou actions communes — chaque collaboration aide nos
							bénévoles et familles d’accueil.
						</p>

						<p>Faisons évoluer ensemble la protection animale.</p>
					</Card.Content>

					<Card.Footer class="mt-8 justify-start p-0">
						<Dialog.Root>
							<Dialog.Trigger>
								<Button size="lg">Nous contacter</Button>
							</Dialog.Trigger>
							<Dialog.Content class="sm:max-w-125">
								<Dialog.Header>
									<Dialog.Title>Signaler un chat en détresse</Dialog.Title>

									<Dialog.Description>
										Décrivez la situation afin que notre équipe puisse intervenir rapidement.
									</Dialog.Description>
								</Dialog.Header>

								<div class="space-y-4 py-4">
									<p>Vous pourrez bientôt :</p>

									<ul class="space-y-2 text-sm">
										<li>• Ajouter une adresse</li>
										<li>• Décrire l’état du chat</li>
										<li>• Envoyer des photos</li>
										<li>• Être recontacté par un bénévole</li>
									</ul>
								</div>

								<Dialog.Footer>
									<Button>Continuer</Button>
								</Dialog.Footer>
							</Dialog.Content>
						</Dialog.Root>
					</Card.Footer>
				</div>

				<!-- IMAGE -->
				<div class="flex items-center justify-center p-6">
					<img
						src="/img/logo.png"
						alt="Collaboration association"
						class="h-full max-h-70 w-full object-contain"
					/>
				</div>
			</div>
		</Card.Root>
	</div>
</main>
