<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';
	import { Badge } from '$lib/components/ui/badge';
	import { FileText, PawPrint, AlertTriangle } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { fade, fly } from 'svelte/transition';
</script>

<main in:fade={{ duration: 200 }}>
	<div in:fly={{ y: 20, duration: 300 }} class="flex flex-col gap-6 p-16">
		<header class="space-y-6">
			<h1 class="text-2xl font-semibold">Conseils</h1>
			<p class="text-muted-foreground">Tous les guides essentiels pour accompagner votre chat.</p>
		</header>

		<!-- GRID 3 COL -->
		<div class="grid gap-6 md:grid-cols-2">
			<!-- ================= COHABITATION ================= -->
			<section class="bg-card space-y-4 rounded-2xl p-5 shadow-sm">
				<div class="flex items-center justify-between">
					<h2 class="flex items-center gap-2 text-lg font-semibold">
						<PawPrint class="h-4 w-4" />
						Cohabitation
					</h2>
					<Badge variant="secondary">Guide</Badge>
				</div>

				<Accordion.Root type="single" collapsible class="w-full">
					<Accordion.Item value="chat">
						<Accordion.Trigger>Avec un chat</Accordion.Trigger>

						<Accordion.Content class="space-y-3 pt-2 text-sm">
							<p class="text-muted-foreground">
								Protocole pour introduire deux chats progressivement.
							</p>

							<a
								href="https://drive.google.com/file/d/1RykO1L_D0e1Jdfy_5t_NbNuRKgk5JTIk/view?usp=sharing"
								target="_blank"
								class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition"
							>
								📄 Télécharger le protocole
							</a>
						</Accordion.Content>
					</Accordion.Item>

					<Accordion.Item value="chien">
						<Accordion.Trigger>Avec un chien</Accordion.Trigger>

						<Accordion.Content class="space-y-2 pt-2 text-sm">
							<p class="text-muted-foreground">
								Le protocole de cohabitation est valable également pour un chien, mais quelques
								précautions supplémentaires sont à prendre:
							</p>
							<a
								href="https://drive.google.com/file/d/1RykO1L_D0e1Jdfy_5t_NbNuRKgk5JTIk/view?usp=sharing"
								target="_blank"
								class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition"
							>
								📄 Télécharger le protocole
							</a>
							<ul class="text-muted-foreground list-disc space-y-1 pl-5">
								<li class="text-muted-foreground">
									Installer les gamelles du chat en hauteur pour les rendre inaccessibles au chien
								</li>
								<li class="text-muted-foreground">
									Avant la première rencontre, promener le chien avant pour le défouler afin qu’il
									soit calme pendant la rencontre
								</li>
								<li class="text-muted-foreground">Introduction progressive</li>
							</ul>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			</section>

			<!-- ================= PERDU / TROUVÉ ================= -->
			<section class="bg-card space-y-4 rounded-2xl p-5 shadow-sm">
				<div class="flex items-center justify-between">
					<h2 class="flex items-center gap-2 text-lg font-semibold">
						<FileText class="h-4 w-4" />
						Perdu / Trouvé
					</h2>
					<Badge variant="secondary">Urgence</Badge>
				</div>

				<Accordion.Root type="single" collapsible>
					<Accordion.Item value="perdu">
						<Accordion.Trigger>Chat perdu</Accordion.Trigger>

						<Accordion.Content class="pt-2">
							<a
								href="https://drive.google.com/file/d/1pLGFdUBs8EqYobSi30-M8oWmdYGA85OB/view?usp=sharing"
								target="_blank"
								class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition"
							>
								📄 Télécharger la fiche
							</a>
						</Accordion.Content>
					</Accordion.Item>

					<Accordion.Item value="trouve">
						<Accordion.Trigger>Chat trouvé</Accordion.Trigger>

						<Accordion.Content class="pt-2">
							<a
								href="https://drive.google.com/file/d/1bbi_so6YKm4HT71rJALpIc17Nx0gDbdC/view?usp=sharing"
								target="_blank"
								class="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition"
							>
								📄 Télécharger la fiche
							</a>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			</section>

			<!-- ================= COMPORTEMENT ================= -->
			<section class="bg-card space-y-4 rounded-2xl p-5 shadow-sm md:col-span-2">
				<div class="flex items-center justify-between">
					<h2 class="flex items-center gap-2 text-lg font-semibold">
						<AlertTriangle class="text-destructive h-4 w-4" />
						Comportement
					</h2>
					<Badge variant="destructive">Important</Badge>
				</div>

				<Accordion.Root type="single" collapsible>
					<Accordion.Item value="malproprete">
						<Accordion.Trigger>Malpropreté</Accordion.Trigger>
						<Accordion.Content class="text-muted-foreground space-y-2 pt-2 text-sm">
							<p class="text-muted-foreground">
								Pour un chat qui était propre avant, il faut tout d’abord éliminer la piste du
								problème médical en consultant un vétérinaire.
							</p>
							<p class="text-muted-foreground">
								Il peut en effet s’agir d’une cystite par exemple, qui peut causer des problèmes de
								propreté.
							</p>
							<div class="flex">
								<div class="flex-1">
									<p class="text-muted-foreground">
										S’il n’y a pas de problème de santé, cela peut être dû à des changements dans
										l’environnement du chat:
									</p>
									<ul class="list-disc space-y-1 pl-5">
										<li class="text-muted-foreground">Objets déplacés</li>
										<li class="text-muted-foreground">Nouveaux objets</li>
										<li class="text-muted-foreground">Nouveaux bruits</li>
										<li class="text-muted-foreground">Changement d’habitudes</li>
										<li class="text-muted-foreground">Nouveaux habitants dans le logement</li>
									</ul>
									<p class="text-muted-foreground">
										Dans ce cas, il faut chercher la source pour la modifier si possible.
									</p>
								</div>
								<Separator orientation="vertical" class="my-4" />
								<div class="flex-1">
									<p>Quelques conseils qui peuvent fonctionner:</p>
									<ul class="list-disc space-y-1 pl-5">
										<li class="text-muted-foreground">
											Acheter une plus grande litière (dans l’idéal, au moins 1,5 fois la longueur
											du chat)
										</li>
										<li class="text-muted-foreground">
											Enlever la porte et le couvercle dans le cas d’une litière fermée
										</li>
										<li>
											Changer l’emplacement de la litière: endroit calme, en retrait sans être trop
											isolé
										</li>
										<li class="text-muted-foreground">
											Changer le type de substrat utilisé • Installer un deuxième bac
										</li>
									</ul>
								</div>
							</div>
						</Accordion.Content>
					</Accordion.Item>

					<Accordion.Item value="craintif">
						<Accordion.Trigger>Chat craintif</Accordion.Trigger>
						<Accordion.Content class="text-muted-foreground space-y-2 pt-2 text-sm">
							<p class="text-muted-foreground">
								Avant d’arriver chez vous, un minou peut avoir connu beaucoup d’expériences, parfois
								négatives envers l’humain.
							</p>
							<p class="text-muted-foreground">
								Il se peut donc qu’il soit particulièrement craintif.
							</p>
							<p class="text-muted-foreground">
								Pour mettre en confiance ce type de profil, il faut beaucoup de patience et de
								calme.
							</p>
							<p class="text-muted-foreground">Quelques conseils:</p>
							<ul class="list-disc space-y-1 pl-5">
								<li class="text-muted-foreground">
									Leur parler régulièrement, d’une voix douce et posée
								</li>
								<li class="text-muted-foreground">
									Se mettre à leur hauteur pour interagir avec eux
								</li>
								<li class="text-muted-foreground">Ne pas faire de gestes brusques</li>
								<li class="text-muted-foreground">Ne pas punir</li>
								<li class="text-muted-foreground">
									Passer par le jeu et les friandises pour développer leur confiance
								</li>
							</ul>
						</Accordion.Content>
					</Accordion.Item>

					<Accordion.Item value="agressif">
						<Accordion.Trigger>Chat agressif</Accordion.Trigger>
						<Accordion.Content class="pt-2 text-sm">
							<p class="text-muted-foreground">
								Pour un chat qui devient agressif du jour au lendemain, il est nécessaire de
								consulter un vétérinaire pour vérifier que cela n’est pas dû à un problème de santé.
							</p>
							<p class="text-muted-foreground">
								Sans problème médical, cela demande l’intervention d’un.e comportementaliste pour
								définir les causes et les résoudre.
							</p>
							<p class="text-muted-foreground">
								Dans tous les cas, il ne faut pas répondre aux attaques par des gestes violents.
							</p>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
			</section>
		</div>
	</div>
</main>
