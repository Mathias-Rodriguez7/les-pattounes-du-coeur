<script lang="ts">
	import * as NavigationMenu from '$lib/components/ui/navigation-menu/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
</script>

<header class="bg-accent sticky top-0 z-50 w-full">
	<!-- ================= MOBILE ================= -->
	<div class="flex items-center justify-between px-4 md:hidden">
		<!-- Burger -->
		<Sheet.Root>
			<Sheet.Trigger class={buttonVariants({ variant: 'ghost' })}>☰</Sheet.Trigger>

			<Sheet.Content side="left" class="w-72">
				<Sheet.Header>
					<Sheet.Title>Menu</Sheet.Title>
				</Sheet.Header>

				<nav class="mt-6 flex flex-col gap-4 px-4 text-lg">
					<a href="#">Adoptions</a>
					<a href="#">Donation</a>
					<a href="#">Association</a>
					<a href="#">Contact</a>
				</nav>
			</Sheet.Content>
		</Sheet.Root>

		<!-- Logo -->
		<img src="/img/logo.png" alt="logo" class="h-12 w-12" />

		<!-- Login Sheet -->
		<Sheet.Root>
			<Sheet.Trigger>
				<img src="/img/cat-sleeping.png" alt="login" class="h-10 w-10" />
			</Sheet.Trigger>

			<Sheet.Content side="right" class="w-80">
				<Sheet.Header>
					<Sheet.Title>Connexion</Sheet.Title>
				</Sheet.Header>

				<div class="mt-6 grid gap-4 px-4">
					<div class="grid gap-2">
						<Label>Email</Label>
						<Input />
					</div>

					<div class="grid gap-2">
						<Label>Mot de passe</Label>
						<Input type="password" />
					</div>

					<Button class="mt-2 w-full">Connexion</Button>
				</div>
			</Sheet.Content>
		</Sheet.Root>
	</div>

	<!-- ================= DESKTOP ================= -->
	<div class="hidden w-full items-center px-5 md:flex">
		<!-- Logo -->
		<img src="/img/logo.png" alt="logo" class="h-20 w-20" />

		<!-- NAV CENTER -->
		<div class="flex min-w-0 flex-1 justify-center">
			<NavigationMenu.Root viewport={false}>
				<NavigationMenu.List class="flex items-center gap-6">
					<NavigationMenu.Item>
						<NavigationMenu.Trigger class="text-2xl">Adoptions</NavigationMenu.Trigger>
						<NavigationMenu.Content class="shadow-md">
							<ul class="grid w-52 gap-2 p-3">
								<li>
									<NavigationMenu.Link href="/adoptions/chat" class="text-2xl"
										>Chats</NavigationMenu.Link
									>
								</li>
								<li>
									<NavigationMenu.Link href="/adoptions/formChat" class="text-2xl"
										>Formulaire</NavigationMenu.Link
									>
								</li>
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Link
							href="https://www.helloasso.com/associations/les-pattounes-du-coeur/formulaires/1"
							target="_blank"
							class="text-2xl">Donation</NavigationMenu.Link
						>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Link href="/">
							<img src="/img/logo.png" alt="logo" class="h-20 w-20" />
						</NavigationMenu.Link>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Trigger class="text-2xl">Association</NavigationMenu.Trigger>
						<NavigationMenu.Content class="shadow-md">
							<ul class="grid w-52 gap-2 p-3">
								<li>
									<NavigationMenu.Link href="/association/info" class="text-2xl"
										>Info</NavigationMenu.Link
									>
								</li>
								<li>
									<NavigationMenu.Link href="/association/news" class="text-2xl"
										>News</NavigationMenu.Link
									>
								</li>
								<li>
									<NavigationMenu.Link href="/association/conseils" class="text-2xl"
										>Conseils</NavigationMenu.Link
									>
								</li>
								<li>
									<NavigationMenu.Link href="#" class="text-2xl">Boutique</NavigationMenu.Link>
								</li>
							</ul>
						</NavigationMenu.Content>
					</NavigationMenu.Item>

					<NavigationMenu.Item>
						<NavigationMenu.Link href="/contact" class="text-2xl">Contact</NavigationMenu.Link>
					</NavigationMenu.Item>
				</NavigationMenu.List>
			</NavigationMenu.Root>
		</div>

		<!-- LOGIN DESKTOP -->
		<Sheet.Root>
			<Sheet.Trigger class={buttonVariants}>
				<img src="/img/cat-sleeping.png" alt="login" class="h-20 w-20" />
			</Sheet.Trigger>

			<Sheet.Content side="right" class="w-96">
				<Sheet.Header>
					<Sheet.Title>Connexion</Sheet.Title>
				</Sheet.Header>

				<div class="mt-6 grid gap-4 px-4">
					<Label>Email</Label>
					<Input />

					<Label>Mot de passe</Label>
					<Input type="password" />

					<Button class="w-full">Connexion</Button>
				</div>
			</Sheet.Content>
		</Sheet.Root>
	</div>
</header>
