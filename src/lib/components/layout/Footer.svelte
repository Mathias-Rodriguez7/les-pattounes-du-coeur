<script>
	import { resolve } from '$app/paths';
</script>

<footer class="bg-accent/70 w-full border-t border-black/10 px-6 py-12 backdrop-blur-lg">
	<section class="mx-auto grid max-w-6xl gap-10 md:grid-cols-2">
		<!-- GAUCHE : LOGO + SOCIALS -->
		<div class="flex flex-col items-center gap-6">
			<!-- LOGO -->
			<div class="flex w-80 items-center gap-3">
				<img src="/img/logo.png" alt="logo" class="h-25 w-25 object-contain" />
				<p class="text-sm leading-relaxed text-wrap opacity-70">
					Association pour la protection des animaux abandonnés sur Montpellier et ses alentours.
				</p>
			</div>

			<!-- SOCIALS -->
			<div class="flex flex-col gap-3">
				<h4 class="text-sm font-semibold tracking-wider uppercase">Nous suivre</h4>
				<div class="flex flex-wrap gap-3">
					<a
						href="https://www.helloasso.com/associations/les-pattounes-du-coeur/formulaires/1"
						target="_blank"
						rel="noopener noreferrer"
						class="transition-opacity hover:opacity-80"
					>
						<img src="/img/helloasso.png" alt="don" class="h-14 w-auto object-contain" />
					</a>
					<a
						href="https://www.youtube.com/@lespattounesducoeur"
						target="_blank"
						class="transition-opacity hover:opacity-80"
					>
						<img src="/img/youtube.png" alt="youtube" class="h-14 w-auto object-contain" />
					</a>
					<a
						href="https://www.instagram.com/les_pattounes_du_coeur"
						target="_blank"
						class="transition-opacity hover:opacity-80"
					>
						<img src="/img/instagram.png" alt="instagram" class="h-14 w-auto object-contain" />
					</a>
					<a
						href="https://www.facebook.com/lespattounesducoeur"
						target="_blank"
						class="transition-opacity hover:opacity-80"
					>
						<img src="/img/facebook.png" alt="facebook" class="h-14 w-auto object-contain" />
					</a>
					<a
						href="https://www.tiktok.com/@les.pattounes.du.coeur?_r=1&_t=ZN-97XidE3ShwE"
						target="_blank"
						class="transition-opacity hover:opacity-80"
					>
						<img src="/img/tiktok.png" alt="tiktok" class="h-14 w-auto object-contain" />
					</a>
				</div>
			</div>
		</div>

		<!-- DROITE : NAVS -->
		<div class="grid grid-cols-3 gap-6">
			<!-- NAV 1 -->
			<nav class="flex flex-col gap-3">
				<h4 class="text-sm font-semibold tracking-wider uppercase">Adoption</h4>
				<ul class="flex flex-col gap-2 text-sm opacity-70">
					<li><a href={resolve('/')} class="transition-opacity hover:opacity-100">Accueil</a></li>
					<li>
						<a href={resolve('/adoptions/chat')} class="transition-opacity hover:opacity-100"
							>Nos chats</a
						>
					</li>
					<li>
						<a href={resolve('/adoptions/formChat')} class="transition-opacity hover:opacity-100"
							>Adoptions</a
						>
					</li>
					<li>
						<a
							href="https://www.helloasso.com/associations/les-pattounes-du-coeur/formulaires/1"
							class="transition-opacity hover:opacity-100"
						>
							Donation
						</a>
					</li>
				</ul>
			</nav>

			<!-- NAV 2 -->
			<nav class="flex flex-col gap-3">
				<h4 class="text-sm font-semibold tracking-wider uppercase">Association</h4>
				<ul class="flex flex-col gap-2 text-sm opacity-70">
					<li>
						<a href={resolve('/association/info')} class="transition-opacity hover:opacity-100"
							>Info</a
						>
					</li>
					<li>
						<a href={resolve('/association/news')} class="transition-opacity hover:opacity-100"
							>News</a
						>
					</li>
					<li>
						<a href={resolve('/association/conseils')} class="transition-opacity hover:opacity-100"
							>Conseils</a
						>
					</li>
				</ul>
			</nav>

			<!-- NAV 3 -->
			<nav class="flex flex-col gap-3">
				<h4 class="text-sm font-semibold tracking-wider uppercase">Agir</h4>
				<ul class="flex flex-col gap-2 text-sm opacity-70">
					<li>
						<a href={resolve('/contact')} class="transition-opacity hover:opacity-100"
							>Signaler un chat</a
						>
					</li>
					<li>
						<a href={resolve('/contact')} class="transition-opacity hover:opacity-100"
							>Famille d'accueil</a
						>
					</li>
					<li>
						<a href={resolve('/contact')} class="transition-opacity hover:opacity-100"
							>Devenir bénévole</a
						>
					</li>
					<li>
						<a href={resolve('/contact')} class="transition-opacity hover:opacity-100">Collaborer</a
						>
					</li>
				</ul>
			</nav>
		</div>
	</section>

	<!-- BOTTOM BAR -->
	<div class="mt-10 border-t border-black/10 pt-4 text-center text-xs opacity-50">
		© 2026 Les Pattounes du Coeur — Tous droits réservés
	</div>
</footer>
