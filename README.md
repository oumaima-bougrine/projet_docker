#  Gesture App – Projet Fullstack Dockerisé

Ce projet est une application **fullstack** composée de :

-  **Frontend** : Vite + Node.js (build puis servi par Nginx)
-  **Backend** : Node.js (API)
-  **Base de données** : MySQL
-  **Docker & Docker Compose** pour orchestrer l’ensemble

L’objectif est de pouvoir **lancer toute l’application avec une seule commande**, sans installer Node ou MySQL localement.

---

##  Architecture du projet

```
.
├── backend/
│   ├── src/                    
│   ├── node_modules/           
│   ├── .dockerignore           
│   ├── .env                    
│   ├── Dockerfile              
│   ├── package.json            
│   └── package-lock.json       
│
├── frontend/
│   ├── src/                   
│   ├── node_modules/           
│   ├── .dockerignore           
│   ├── .env.local              
│   ├── Dockerfile              
│   ├── index.html              
│   ├── vite.config.js          
│   ├── package.json            
│   └── package-lock.json       
│
├── secrets/
│   ├── db_password.txt         
│   ├── db_password.txt.example 
│   └── db_root_password.txt    
│
├── compose.yaml                
├── compose.override.yaml       
├── .env.example                
├── .gitignore                 
└── README.md                   

```

---

##  Prérequis

Vérification :

```bash
docker --version
docker compose version
```

---

##  Gestion des secrets (MySQL)

Les mots de passe sont stockés dans :

```
secrets/
├── db_root_password.txt
└── db_password.txt
```

Exemple de contenu :

```txt
password123
```

Ils sont utilisés via **Docker secrets** dans `compose.yaml`.

---

##  Services Docker

| Service   | Description |
|----------|-------------|
| frontend | Application Vite buildée et servie par Nginx |
| backend  | API Node.js |
| db       | Base de données MySQL |

---

##  Lancer le projet

### 1️ Cloner le dépôt

```bash
git clone <url-du-depo>
cd <nom-du-projet>
```

---

### 2️ Lancer l’application

```bash
docker compose up --build
```

---

### 3️ Accès

- Frontend : http://localhost  
- Backend : http://localhost:4000  
- MySQL :
  - Host : localhost
  - Port : 3306
  - User : gesture_user
  - Database : gesture_app

---

##  Mode développement

Le fichier `compose.override.yaml` permet :
- le hot reload
- le montage des dossiers `src`
- une meilleure expérience développeur

Il est chargé automatiquement par Docker Compose.

---

##  Détails techniques

### Frontend

- Build avec Vite
- Variable d’environnement `VITE_API_URL`
- Servi par Nginx

### Backend

- Multi-stage Dockerfile
- Mode développement et production séparés
- Utilisateur non-root en production

---

##  Arrêter le projet

```bash
docker compose down
```

Supprimer aussi les volumes :

```bash
docker compose down -v
```

---

##  Debug

Logs :

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

Rebuild complet :

```bash
docker compose build --no-cache
docker compose up
```

---



---

##  Commandes Docker utiles

### Lancer les services avec un fichier spécifique (pour la prod)

```bash
docker compose -f compose.yaml up
```

Avec rebuild des images :

```bash
docker compose -f compose.yaml up --build
```

---

### Arrêter les services

```bash
docker compose -f compose.yaml down
```

Arrêter et supprimer les volumes (base de données incluse) :

```bash
docker compose -f compose.yaml down -v
```

---

### Voir les conteneurs en cours d’exécution

```bash
docker compose ps
```

---

### Vérifier les variables d’environnement du backend

Cette commande permet de vérifier que le backend tourne bien dans le bon environnement (`NODE_ENV`) :

```bash
docker exec -it gesture-backend env | findstr NODE_ENV
```

Résultat attendu en production :

```txt
NODE_ENV=production
```

Ou en développement :

```txt
NODE_ENV=development
```


##  Conclusion

Projet fullstack dockerisé, reproductible et simple à lancer, respectant les bonnes pratiques de développement et de déploiement.
