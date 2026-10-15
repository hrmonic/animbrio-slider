<p align="center"><img src="docs/assets/project-hero.svg" alt="Animbrio Slider — visual editor, animation timeline and React player" width="100%"></p>

<h1 align="center">Animbrio Slider</h1>

<p align="center"><strong>Éditeur visuel et moteur d'animation pour le web</strong><br>Créer des séquences animées dans l'éditeur, les publier sous forme de modules et les afficher dans une application React.</p>

<p align="center"><a href="README.md">Read in English</a> · <a href="#overview">Présentation</a> · <a href="#features">Fonctions</a> · <a href="#architecture">Architecture</a> · <a href="#start">Installation</a> · <a href="#quality">Qualité</a> · <a href="#faq">FAQ</a> · <a href="#license">Licence</a></p>

<p align="center"><a href="LICENSE"><img alt="Apache 2.0 License" src="https://img.shields.io/badge/license-Apache%202.0-475569"></a> <img alt="React and TypeScript" src="https://img.shields.io/badge/stack-React%20%2F%20TypeScript-475569"></p>

<a id="overview"></a>
## Présentation

**Animbrio Slider** est un projet open source d'éditeur visuel et de moteur de rendu React/Next.js pour créer des hero sections, sliders et scènes animées pilotées par une timeline. Le format de scène, le moteur d'animation et le lecteur sont séparés pour permettre l'édition et l'intégration web sans dupliquer la logique.



**Public cible :** Développeurs frontend, créateurs de sites et équipes produit.

<a id="features"></a>
## Fonctionnalités

| Fonction | Description |
| --- | --- |
| **Éditeur visuel** | Canvas, calques, propriétés et timeline de keyframes. |
| **Moteur d'animation** | Évaluation déterministe de l'état d'une scène à un instant donné. |
| **Lecteur React** | Composants réutilisables ModulePlayer et ModuleStatic. |
| **Format de projet** | Schéma JSON validé avec Zod. |
| **Interaction et accessibilité** | Helpers de parallaxe, timeline au scroll et gestion des mouvements réduits. |
| **Publication** | API de lecture des modules publiés, séparée des opérations d'édition. |

<a id="architecture"></a>
## Architecture

Le monorepo pnpm comprend apps/editor (éditeur Next.js), apps/integration-demo (démonstration d'intégration) et les packages schema, animation-engine, interaction-engine, renderer, editor-core et persistence. Les guides disponibles expliquent l'intégration React et Next.js.

<a id="start"></a>
## Démarrage

Node.js 20+ et pnpm 9.15+ sont nécessaires. Démarrer l'éditeur après installation et compilation du package schema. L'éditeur est configuré sur http://localhost:3840 et la démonstration sur http://localhost:3841.



```bash
git clone https://github.com/hrmonic/animbrio-slider.git
cd animbrio-slider
pnpm install
pnpm --filter @animbrio/schema build
pnpm dev
```



Configurer apps/editor/.env.local à partir de .env.example si des clés API ou des chemins de stockage personnalisés sont nécessaires. La commande pnpm dev:demo lance la démonstration d'intégration ; pnpm -r run test et pnpm -r run build permettent des validations locales.

<a id="quality"></a>
## Qualité et limites

Le dépôt contient des tests dans plusieurs packages et une CI GitHub Actions exécutant des contrôles et des builds. La présence de tests ne remplace pas un examen visuel du rendu, une vérification navigateur ou un audit d'accessibilité.



### Précautions

- La fiche du dépôt ne fournit pas encore de démonstration publique hébergée.
- Les animations doivent être évaluées sur la performance et l'accessibilité, notamment avec reduced motion.
- Les packages sont regroupés en workspace ; une publication séparée sur npm n'est pas garantie.
- L'exposition de l'éditeur doit être précédée d'une vérification des clés et permissions API.



### Prochaines améliorations

- Ajouter de véritables captures et exemples de scènes.
- Étendre les tests E2E de la timeline et de l'intégration.
- Documenter les changements de version du format JSON.

### Documents utiles

- [Architecture](docs/architecture.md)
- [Project JSON format](docs/project-format.md)
- [Next.js integration](docs/integration-nextjs.md)
- [React integration](docs/integration-react.md)
- [Contribution](CONTRIBUTING.md)

<a id="faq"></a>
## Questions fréquentes

### Peut-on intégrer le résultat dans React ?

Oui. Le dépôt contient un renderer React et les guides d'intégration associés.

### Faut-il utiliser WordPress ?

Non. L'éditeur et l'exemple sont construits avec Next.js.

### Comment diffuser une scène publiée ?

Une API dédiée aux modules publiés est documentée, distincte des routes d'administration.

### Est-ce une bibliothèque npm déjà publiée ?

Le dépôt contient des packages de workspace ; leur publication externe doit être vérifiée.

<a id="license"></a>
## Licence

Le code est distribué sous [licence Apache 2.0](LICENSE).



**Auteur :** [Réda Touzani (@hrmonic)](https://github.com/hrmonic).
