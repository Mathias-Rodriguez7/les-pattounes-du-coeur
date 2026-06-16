# Documentation de déploiement - Les Pattounes du Cœur

## 1. Présentation

L'application **Les Pattounes du Cœur** est une plateforme web destinée à faciliter la mise en relation entre l'association et les personnes souhaitant adopter, héberger ou aider les animaux pris en charge.

L'application est développée avec :

- SvelteKit
- Node.js 24
- Prisma ORM
- PostgreSQL
- Railway (hébergement)
- GitHub (gestion du code source)
- GitHub Actions (intégration continue)

Le déploiement s'inscrit dans une démarche DevOps visant à automatiser les contrôles qualité avant toute mise en production.

---

## 2. Architecture de déploiement

Le code source est hébergé sur GitHub.

Chaque modification est soumise à une pipeline d'intégration continue via GitHub Actions qui :

1. Installe les dépendances du projet.
2. Génère les fichiers nécessaires à SvelteKit.
3. Génère le client Prisma.
4. Exécute les tests unitaires.
5. Valide ou refuse l'intégration du code.

Une fois les contrôles validés, Railway déploie automatiquement la dernière version de la branche principale.

### Flux de déploiement

Développeur → GitHub → GitHub Actions → Railway → Utilisateurs

---

## 3. Prérequis

Pour déployer l'application, les éléments suivants sont nécessaires :

- Un compte GitHub.
- Un compte Railway.
- Node.js 24 ou supérieur.
- Les accès au dépôt GitHub.
- Les variables d'environnement configurées sur Railway.

---

## 4. Variables d'environnement

Les informations sensibles sont stockées sous forme de variables d'environnement sur Railway afin de ne jamais être exposées dans le code source.

### Base de données PostgreSQL

| Variable          | Description                                                                           |
| ----------------- | ------------------------------------------------------------------------------------- |
| DATABASE_URL      | Chaîne de connexion utilisée par Prisma pour accéder à la base de données PostgreSQL. |
| POSTGRES_DB       | Nom de la base de données.                                                            |
| POSTGRES_USER     | Utilisateur autorisé à accéder à la base de données.                                  |
| POSTGRES_PASSWORD | Mot de passe associé à l'utilisateur PostgreSQL.                                      |

Les valeurs réelles de ces variables sont configurées directement dans Railway et ne sont pas versionnées dans le dépôt GitHub.

---

## 5. Contrôle qualité avant déploiement

Avant toute mise en production, plusieurs contrôles sont réalisés.

### Tests unitaires

Les formulaires utilisateurs disposent de tests unitaires permettant de valider :

- les champs obligatoires ;
- les formats de données ;
- les contraintes métier ;
- les cas d'erreur ;
- les données invalides.

Les tests sont exécutés automatiquement par GitHub Actions.

Exemple de résultat :

- 6 suites de tests ;
- 42 tests unitaires ;
- 100 % des tests validés.

### Validation manuelle

Une phase de recette est réalisée sur les fonctionnalités accessibles aux visiteurs :

- consultation des animaux ;
- navigation sur le site ;
- affichage responsive ;
- soumission des formulaires ;
- gestion des erreurs.

---

## 6. Procédure de déploiement

### Étape 1 : Développement

Les nouvelles fonctionnalités sont développées sur une branche dédiée.

### Étape 2 : Validation locale

Exécution des tests :

```bash
npm run test
```

### Étape 3 : Publication du code

Envoi des modifications vers GitHub :

```bash
git push origin nom-branche
```

### Étape 4 : Pull Request

Une Pull Request est créée vers la branche principale.

GitHub Actions déclenche automatiquement :

- l'installation des dépendances ;
- la synchronisation SvelteKit ;
- la génération Prisma ;
- l'exécution des tests unitaires.

### Étape 5 : Validation

Le merge vers la branche principale est autorisé uniquement si l'ensemble des tests est validé.

### Étape 6 : Déploiement Railway

Railway détecte automatiquement les modifications de la branche principale et lance un nouveau déploiement.

Le processus comprend :

- récupération du code ;
- installation des dépendances ;
- génération Prisma ;
- compilation de l'application ;
- démarrage du serveur.

---

## 7. Vérifications post-déploiement

Après chaque mise en production, les contrôles suivants sont réalisés :

- accès à la page d'accueil ;
- consultation des fiches animaux ;
- fonctionnement des formulaires ;
- réception des emails ;
- consultation des logs Railway ;
- vérification de la connexion à la base de données.

---

## 8. Gestion des incidents

En cas d'échec du déploiement :

1. Consultation des logs Railway.
2. Identification de l'origine de l'erreur.
3. Correction sur une branche dédiée.
4. Validation via GitHub Actions.
5. Nouveau déploiement.

Cette procédure permet de garantir la stabilité et la disponibilité de l'application.

---

## 9. Démarche DevOps

Le projet applique plusieurs principes DevOps :

- gestion du code source avec GitHub ;
- intégration continue avec GitHub Actions ;
- automatisation des tests ;
- contrôle qualité avant fusion ;
- déploiement automatisé sur Railway ;
- amélioration continue grâce aux retours utilisateurs.

Cette démarche contribue à sécuriser les mises en production et à maintenir la qualité de l'application.
