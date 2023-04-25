# CorpTrack
<a name="readme-top"></a>

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/nico-vrn/CorpTrack">
    <img src="public/images/logo_corptrack.png" alt="Logo" width="150" height="120">
  </a>

  <h3 align="center">CorpTrack</h3>

  <p align="center">
    Site d'information et de recherche de vulnérabilités sur les entreprises française 
    <br />
   </p>
</div>

## Prérequis

- Node.js installé (version recommandée : 14.x ou supérieure)
- Un éditeur de code tel que Visual Studio Code

## Installation

1. Clonez le dépôt git :
```sh
git https://github.com/nico-vrn/CorpTrack
```

2. Accédez au dossier du projet :
```sh
cd CorpTrack
```

3. Installez les dépendances du projet :
```sh
npm install
```

## Utilisation

### Configuration avec fichier.env 

Dans ce projet, nous utilisons un fichier `.env` pour gérer les variables d'environnement sensibles, telles que les clés d'API. Pour vous assurer que vos clés ne sont pas exposées publiquement, vous devez créer un fichier .env local en vous basant sur le fichier `.env.template` fourni.

Voici les étapes pour créer et configurer votre fichier `.env` :

1. Renommez le fichier `.env.template` en `.env` Vous pouvez le faire en exécutant la commande suivante :
```sh
cp .env.template .env
```

2. Ouvrez le fichier `.env` avec votre éditeur de code préféré.

3. Remplacez les valeurs des variables d'environnement par vos propres clés d'API et autres informations sensibles. Par exemple, remplacez `YOUR_API_KEY` par la clé d'API réelle que vous avez obtenue pour une API spécifique.

4. Enregistrez et fermez le fichier `.env.`

Une fois que vous avez configuré votre fichier `.env`, le projet lira automatiquement les variables d'environnement définies dans ce fichier. Vous n'avez pas besoin de modifier le code du projet pour utiliser vos propres clés d'API.

### Lancement du serveur Express

1. Démarrez le serveur de développement local avec Express :
```sh
node server.js
```

Le serveur devrait démarrer sur `http://localhost:3000`.

2. Ouvrez votre navigateur et accédez à `http://localhost:3000`.

## Fonctionnalités principales

- Liste des fonctionnalités principales de votre projet.

## Contribution

Les contributions sont les bienvenues ! Pour contribuer, suivez les étapes suivantes :

1. Forkez le dépôt.
2. Créez une nouvelle branche avec un nom descriptif pour votre fonctionnalité ou correctif.
3. Faites vos modifications et soumettez-les avec un commit.
4. Créez une pull request vers la branche `main` du dépôt d'origine.

##Dependances:

API utilisés :
- [API recherche d'entreprise française](https://api.gouv.fr/documentation/api-recherche-entreprises)
- [API shodan](https://developer.shodan.io/api) 
- [API NVD](https://nvd.nist.gov/developers/vulnerabilities)

## Auteurs

- Lefranc Nicolas, [@nico-vrn](https://github.com/nico-vrn)
- Gigon Le GrainAlix, [alixxila](https://github.com/alixxila)
- Montanari Aurélien, [aurmtnr](https://github.com/aurmtn)

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/nico-vrn/CorpTrack?style=for-the-badge
[contributors-url]: https://github.com/nico-vrn/CorpTrack/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/nico-vrn/CorpTrack.svg?style=for-the-badge
[forks-url]: https://github.com/nico-vrn/CorpTrack/network/members
[stars-shield]: https://img.shields.io/github/stars/nico-vrn/CorpTrack.svg?style=for-the-badge
[stars-url]: https://github.com/nico-vrn/CorpTrack/stargazers
[issues-shield]: https://img.shields.io/github/issues/nico-vrn/CorpTrack.svg?style=for-the-badge
[issues-url]: https://github.com/nico-vrn/CorpTrack/issues
