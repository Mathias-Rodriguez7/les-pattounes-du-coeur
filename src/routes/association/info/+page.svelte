<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<main class="flex flex-col gap-6 p-4 sm:p-8 lg:p-16">
	<h1 class="text-2xl font-bold">L'Association</h1>
	<section>
		<div class="flex flex-col gap-6 lg:flex-row">
			<div class="flex-1">
				<Card.Root>
					<Card.Header>
						<Card.Title>Présentation de l’association</Card.Title>
						<Card.Description>
							Créée en février 2013, Les Pattounes du Cœur est une association de protection féline
							basée à Montpellier et ses alentours. Née de l’initiative de passionnées rassemblaient
							autour d'une même cause : venir en aide aux chats abandonnés et sans foyer. À travers
							ses actions, l’association œuvre chaque jour pour améliorer leur quotidien et
							sensibiliser à la protection animale.
						</Card.Description>
					</Card.Header>

					<Card.Content class="flex flex-col  gap-4">
						<p class="text-muted-foreground leading-relaxed">
							Au fil des années, l’association s’est développée autour d’une mission simple : agir
							concrètement pour améliorer la vie des chats tout en sensibilisant à leur protection.
							Indépendante, elle fonctionne uniquement grâce aux dons et au soutien de sa
							communauté.
						</p>
						<p class="text-muted-foreground leading-relaxed">
							Chaque sauvetage représente un engagement important et des coûts significatifs : soins
							vétérinaires (stérilisation, identification, consultations...), alimentation pour les
							chats libres, ainsi que tout le nécessaire pour les chats en famille d’accueil
							(nourriture, litière, antiparasitaires…).
						</p>
					</Card.Content>
				</Card.Root>
			</div>
			<div class="flex-1">
				<Card.Root>
					<Card.Header>
						<Card.Title>Les actions de l’association</Card.Title>
						<Card.Description>
							Sur le terrain, l’association intervient auprès des chats errants pour les soigner,
							les stériliser et les identifier. Cette approche permet de stabiliser les populations
							tout en garantissant de meilleures conditions de vie aux chats, désormais suivis et
							nourris chaque jour via différents points de nourrissage.
						</Card.Description>
					</Card.Header>

					<Card.Content class="flex flex-col gap-4">
						<p class="text-muted-foreground leading-relaxed">
							En parallèle, les chats sociables et les chatons sont pris en charge, accueillis en
							famille d’accueil, puis proposés à l’adoption. Ce passage en foyer temporaire leur
							permet de se remettre, de s’habituer à l’humain et d’être adoptés dans les meilleures
							conditions.
						</p>
						<p class="text-muted-foreground leading-relaxed">
							L’ensemble de ces actions repose sur des ressources importantes (soins vétérinaires,
							alimentation, matériel), financées par les dons et des partenaires. Ces contributions
							sont indispensables pour poursuivre les actions sur le terrain et continuer à offrir
							une prise en charge adaptée à chaque chat.
						</p>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</section>

	<section>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			<div class="aspect-3/2 overflow-hidden rounded-2xl">
				<img src="/img/association/asso.1.jpg" alt="asso" class="h-full w-full object-cover" />
			</div>
			<div class="aspect-3/2 overflow-hidden rounded-2xl">
				<img src="/img/association/asso.5.jpg" alt="asso" class="h-full w-full object-cover" />
			</div>
			<div class="aspect-3/2 overflow-hidden rounded-2xl">
				<img src="/img/association/asso.3.jpg" alt="asso" class="h-full w-full object-cover" />
			</div>
			<div class="aspect-3/2 overflow-hidden rounded-2xl">
				<img src="/img/association/asso.4.jpg" alt="asso" class="h-full w-full object-cover" />
			</div>
		</div>
	</section>

	<section>
		<Card.Root>
			<Card.Header>
				<Card.Title>Présentation des rôles dans l’association</Card.Title>
			</Card.Header>

			<Card.Content class="flex flex-col gap-4">
				<p class="text-muted-foreground leading-relaxed">
					L’association repose uniquement sur des bénévoles, nous n’avons aucun emploi salarié.
					Différents rôles sont présents dans l’association :
				</p>

				<ul class="text-muted-foreground list-decimal space-y-2 pl-5 leading-relaxed">
					<li>
						<span class="font-bold">Les familles d’accueil</span> ont pour rôle d’accueillir des minous
						jusqu’à leur adoption. Les chats placés sont souvent malades, peu sociables, ou trop jeunes
						pour être adoptés directement : la famille d’accueil permet donc de les rendre adoptables
						tout en leur apportant plein d’amour.
					</li>
					<li>
						<span class="font-bold">Les bénévoles trappeur-ses</span> s’occupent des soins et stérilisations
						des chats errants. À l’aide d’une cage trappe, les chats sauvages peuvent être récupérés,
						et sont ensuite libérés après les soins.
					</li>
					<li>
						<span class="font-bold">Les bénévoles gestionnaires</span> s’occupent de la gestion courante
						des chats en famille d’accueil : logistique, conseils aux familles d’accueil, suivi de la
						santé, recherche d’adoptants et adoptions.
					</li>
					<li>
						<span class="font-bold">Les bénévoles du stock</span> s’occupent de gérer le stock afin de
						récupérer les dons et de fournir le matériel aux familles d’accueil.
					</li>
					<li>
						<span class="font-bold">Les bénévoles administratif</span> gèrent le tri des mails, la gestion
						des registres et des suivis, les entretiens aux familles d’accueil et bénévoles, la trésorerie,
						et plein d’autres tâches invisibles mais très utiles !
					</li>
					<li>
						<span class="font-bold">Les bénévoles trajet</span> interviennent ponctuellement pour emmener
						un chat chez le véto, chez sa nouvelle famille d’accueil, ou encore pour récupérer un minou
						abandonné.
					</li>
					<li>
						<span class="font-bold">Les bénévoles événementiel</span> organisent les événements ou y participent
						(collectes, conférences, forum des assos, cœur animal…).
					</li>
					<li>
						<span class="font-bold">Les bénévoles communication</span> s’occupent des réseaux sociaux
						(Instagram, Facebook, TikTok) avec la gestion et la création de contenus mettant en valeur
						nos pensionnaires !
					</li>
				</ul>
			</Card.Content>
		</Card.Root>
	</section>

	<section>
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			<div class="aspect-3/2 overflow-hidden rounded-2xl">
				<img src="/img/association/asso.2.jpg" alt="asso" class="h-full w-full object-cover" />
			</div>
			<div class="aspect-3/2 overflow-hidden rounded-2xl">
				<img src="/img/association/asso.6.jpg" alt="asso" class="h-full w-full object-cover" />
			</div>
			<div class="aspect-3/2 overflow-hidden rounded-2xl">
				<img src="/img/association/asso.7.jpg" alt="asso" class="h-full w-full object-cover" />
			</div>
			<div class="aspect-3/2 overflow-hidden rounded-2xl">
				<img src="/img/association/asso.8.jpg" alt="asso" class="h-full w-full object-cover" />
			</div>
		</div>
	</section>

	<section>
		<Card.Root>
			<Card.Header>
				<Card.Title>Nos partenaires</Card.Title>
				<Card.Description
					>L’association n’est pas seule dans ses actions ! Nous recevons des financements et
					collaborons avec de nombreux partenaires, que nous remercions chaleureusement.
				</Card.Description>
			</Card.Header>
			<Card.Content class="">
				<div class="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-4">
					<div>
						<a href="https://www.montpellier.fr/" target="_blank" rel="noopener noreferrer">
							<img
								src="/img/partners/mairie.MTP.png"
								alt="Mairie de Montpellier"
								class="mx-auto h-16 object-contain"
							/>
						</a>
					</div>

					<div>
						<a href="https://www.montpellier.fr/" target="_blank" rel="noopener noreferrer">
							<img
								src="/img/partners/metropole.MTP.jpeg"
								alt="Montpellier Méditerranée Métropole"
								class="mx-auto h-16 object-contain"
							/>
						</a>
					</div>

					<div>
						<a
							href="https://www.instagram.com/laubergeduchat.mtp/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<img
								src="/img/partners/auberge.du.chat.jpg"
								alt="Auberge du Chat"
								class="mx-auto h-16 object-contain"
							/>
						</a>
					</div>

					<div>
						<a href="https://www.almonature.com/fr/" target="_blank" rel="noopener noreferrer">
							<img
								src="/img/partners/almo-nature.png"
								alt="Almo Nature"
								class="mx-auto h-16 object-contain"
							/>
						</a>
					</div>

					<div>
						<a
							href="https://fondazionecapellino.org/fr/fondazione-capellino"
							target="_blank"
							rel="noopener noreferrer"
						>
							<img
								src="/img/partners/fondazione.png"
								alt="Fondazione Capellino"
								class="mx-auto h-16 object-contain"
							/>
						</a>
					</div>

					<div>
						<a
							href="https://www.instagram.com/fatbobstudio/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<img
								src="/img/partners/fat.bob.studio.png"
								alt="Fatbobstudio"
								class="mx-auto h-16 object-contain"
							/>
						</a>
					</div>

					<div>
						<a href="https://www.safti.fr/" target="_blank" rel="noopener noreferrer">
							<img src="/img/partners/safti.png" alt="Safti" class="mx-auto h-16 object-contain" />
						</a>
					</div>

					<div>
						<a href="https://www.ville-clapiers.fr/" target="_blank" rel="noopener noreferrer">
							<img
								src="/img/partners/clapiers.png"
								alt="Clapiers"
								class="mx-auto h-16 object-contain"
							/>
						</a>
					</div>

					<div>
						<a
							href="https://www.saint-clement-de-riviere.fr/"
							target="_blank"
							rel="noopener noreferrer"
						>
							<img
								src="/img/partners/saint.clement.de.riviere.png"
								alt="Saint Clément de Rivière"
								class="mx-auto h-16 object-contain"
							/>
						</a>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	</section>
</main>
