Réseau social d'entreprise à destination du groupe "GROUPOMANIA".

Afin que le site soit fonctionnel, réaliser ces différentes étapes !

1:
Vérifier que vous avez installé mysql et le lancer 

2:
Copier et cloner le lien du projet sur le github.

3:
Installer les dépendences en quelques étapes :
    1 : Ouvrir le projet dans un terminal.
    2 : Placez-vous dans le dossier "backend".
    3 : Entrer la commande : npm install.
    4 : Placez-vous dans le dossier "frontend".
    5 : Entrer la commande : npm install.

4:
Dans le terminal, orienté sur le dossier "backend", utiliser la commande : npx sequelize init.
Modifier le fichier config.json se trouvant dans le dossier "backend", lui même dans le sous dossier "config".
    1 : Changer le username.
    2 : Changer le mot de passe.
    3 : Changer le nom de la database.

5:
Créer la base de donnée du projet via ces commandes :
Dans un terminal orienté sur le dossier "backend", entrer les commandes suivantes :
    1 : npx sequelize db:create
    2 : npx sequelize db:migrate
    3 : npx sequelize-cli db:seed:all

6:
Pour démarrer le projet entièrement, faire tourner "l'api" ainsi que "l'app" :
    1 : Utiliser un terminal orienté sur le dossier "backend".
    2 : Entrer la commande : npm run server
    3 : Utiliser un terminal orienté sur le dossier "frontend".
    4 : Entrer la commande : npm start

7:
Une fois le projet lancé voici les informations de connexion pour le compte admin
    email: admin@groupomania.com 
    password: Motdepasse1!
