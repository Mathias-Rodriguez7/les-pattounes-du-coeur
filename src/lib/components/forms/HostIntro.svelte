<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';

	// Le texte à lire AVANT le formulaire « Devenir famille d'accueil » (page Agir).
	// Le bouton du bas ouvre le formulaire.
	interface Props {
		onContinue: () => void;
	}

	let { onContinue }: Props = $props();
</script>

<article class="space-y-6 text-sm leading-relaxed">
	<header class="space-y-2">
		<!-- pr-8 : le titre ne passe pas sous la croix de fermeture -->
		<h2 class="pr-8 text-2xl font-semibold">Devenir famille d’accueil (FA) pour chats</h2>
		<p>
			Merci de proposer d’ouvrir votre foyer à des chats en détresse. Être FA est un acte généreux,
			mais aussi un engagement : prenez le temps d’y réfléchir, de lire nos conseils et de poser vos
			questions lors de l’entretien téléphonique avec une bénévole.
		</p>
	</header>

	<section class="space-y-2">
		<h3 class="text-lg font-semibold">Qui accueille-t-on ?</h3>
		<p>
			Des chats des rues sociables et en détresse, des chats que leurs propriétaires ne peuvent plus
			garder, ainsi que des chatons nés dehors ou abandonnés. Les naissances ont lieu au printemps ;
			à partir de l’automne, les besoins en FA chatons deviennent ponctuels. Pendant la saison, nous
			cherchons des FA pour biberonner, pour des chatons à socialiser, ou pour des chattes avec leur
			portée. Nous évitons de séparer les portées, car les chatons s’éduquent entre eux. Les besoins
			en FA pour adultes existent toute l’année.
		</p>
		<p>
			Le placement tient compte des besoins du chat et de votre situation (extérieur, calme, autres
			chats…). Une période d’adaptation est toujours nécessaire : suivez les conseils des bénévoles.
			Comme les chatons viennent souvent de l’extérieur et peuvent porter des virus, vos propres
			chats doivent impérativement être vaccinés.
		</p>
	</section>

	<section class="space-y-2">
		<h3 class="text-lg font-semibold">Le fonctionnement</h3>
		<p>
			Le placement est parfois rapide, sans visite vétérinaire préalable : celle-ci a lieu ensuite.
			Une bénévole référente vous suit jusqu’à l’adoption et reste votre contact pour tout conseil.
		</p>
	</section>

	<section class="space-y-2">
		<h3 class="text-lg font-semibold">Transport</h3>
		<p>
			Les FA doivent être véhiculées ou autonomes en transports en commun pour emmener le chat chez
			le vétérinaire.
		</p>
	</section>

	<section class="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
		<h3 class="text-lg font-semibold">Règles importantes</h3>
		<ul class="list-disc space-y-2 pl-5">
			<li>
				<strong>Pas d’adoption directe</strong> : les visiteurs ne repartent jamais avec le chat (sauf
				exception validée). Si vous souhaitez adopter, vous êtes prioritaire, à condition que vos conditions
				d’accueil conviennent au chat.
			</li>
			<li>Si une connaissance veut adopter, orientez-la vers la bénévole gestionnaire.</li>
			<li>Donnez régulièrement des nouvelles.</li>
			<li>
				En cas d’absence, prévenez <strong>au moins 15 jours à l’avance</strong> pour trouver une solution
				relais.
			</li>
			<li>
				<strong>Ne laissez pas sortir le chat</strong> (attendez 2 à 3 semaines si vous avez un accès
				extérieur) et veillez à fermer portes et fenêtres, même en hauteur.
			</li>
		</ul>
	</section>

	<div class="flex justify-end">
		<Button size="lg" onclick={onContinue}>
			J’ai lu, je remplis le formulaire
			<ArrowRight class="size-4" />
		</Button>
	</div>
</article>
