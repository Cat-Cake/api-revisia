# api-revisia

API REST pour **RévisIA** — importe un cours en PDF, extrait son texte et génère automatiquement (via une IA locale Ollama) un résumé, des flashcards et un quiz à choix multiples.

Stack : Node.js / Express, PostgreSQL (Sequelize), JWT, Ollama.

## Prérequis

- [Node.js](https://nodejs.org/) 20+
- [Docker](https://www.docker.com/) + Docker Compose (recommandé)
- [Ollama](https://ollama.com/) installé **nativement** sur ta machine (pas dans un conteneur)

## Installation

### 1. Installer et démarrer Ollama

```bash
brew install ollama
ollama serve            # ou lance l'app Ollama.app
ollama pull mistral      # télécharge le modèle utilisé par défaut
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Les valeurs par défaut fonctionnent telles quelles avec Docker Compose. Adapte `.env` si tu changes un port ou le modèle Ollama.

### 3. Lancer l'API

**Avec Docker (recommandé)** :

```bash
docker compose up --build
```

Au démarrage, l'API se connecte à Postgres et synchronise automatiquement les tables (`sequelize.sync()`) — aucune migration manuelle n'est nécessaire.

## Utilisation de l'API

Toutes les routes sont préfixées par `/api`. Les routes protégées attendent un header `Authorization: Bearer <token>` obtenu via `/api/auth/login` ou `/api/auth/register`.

### Authentification

| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Crée un compte (`nom`, `email`, `mot_de_passe`) | non |
| POST | `/api/auth/login` | Connexion (`email`, `mot_de_passe`), renvoie un `token` | non |
| POST | `/api/auth/logout` | Déconnexion (stateless, côté client) | non |
| GET | `/api/auth/me` | Infos du compte connecté | oui |

### Documents

| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/documents` | Upload d'un PDF (`multipart/form-data`, champ `file`) | oui |
| GET | `/api/documents` | Liste des documents de l'utilisateur | oui |
| GET | `/api/documents/:id` | Détail d'un document (texte extrait inclus) | oui |
| DELETE | `/api/documents/:id` | Supprime un document (et son résumé/flashcards/quiz) | oui |

### Génération IA

| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/documents/:id/summary` | Génère (via Ollama) un résumé court + détaillé | oui |
| GET | `/api/documents/:id/summary` | Récupère le résumé déjà généré | oui |
| POST | `/api/documents/:id/flashcards` | Génère des flashcards (`{"count": 10}` optionnel) | oui |
| GET | `/api/documents/:id/flashcards` | Récupère les flashcards déjà générées | oui |
| POST | `/api/documents/:id/quiz` | Génère un quiz (`{"count": 10}` optionnel) | oui |
| GET | `/api/documents/:id/quiz` | Récupère le quiz (sans les bonnes réponses) | oui |
| POST | `/api/documents/:id/quiz/submit` | Soumet des réponses, renvoie score + correction | oui |

### Résultats & tableau de bord

| Méthode | Route | Description | Auth |
|---|---|---|---|
| GET | `/api/results` | Historique des quiz réalisés | oui |
| GET | `/api/results/:id` | Détail d'un résultat | oui |
| GET | `/api/dashboard` | Statistiques (nb documents, nb quiz, score moyen, activité récente) | oui |