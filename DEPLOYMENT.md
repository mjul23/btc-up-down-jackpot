# Création de l'application BTC Up/Down Jackpot

## Instructions de déploiement

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration environnement
Créez un fichier `.env` à la racine :
```env
# Configuration Supabase
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Configuration Base L2
PRIVATE_KEY=your_private_key
BASE_RPC_URL=https://base-mainnet.blockpi.network/v1/rpc/public
BASE_SEPOLIA_RPC_URL=https://base-sepolia.blockpi.network/v1/rpc/public

# Configuration API
BASESCAN_API_KEY=your_basescan_api_key
BASE_SEPOLIA_API_KEY=your_basescan_sepolia_api_key
```

### 3. Lancement en développement
```bash
npm start
```

### 4. Déploiement

#### Frontend (Vercel)
```bash
npm run build
# Déployer sur Vercel
```

#### Smart Contracts
```bash
# Compiler les contrats
npm run compile

# Déployer sur Base L2
npm run deploy -- --network base

# Tester les contrats
npm test
```

### 5. Configuration Supabase
1. Créer un compte sur https://supabase.com
2. Créer un nouveau projet
3. Configurer les tables SQL :
   ```sql
   -- Table utilisateurs
   CREATE TABLE users (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     address TEXT UNIQUE NOT NULL,
     total_gagne DECIMAL(18, 2) DEFAULT 0,
     total_mise DECIMAL(18, 2) DEFAULT 0,
     paris_gagnes INTEGER DEFAULT 0,
     paris_total INTEGER DEFAULT 0,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Table paris
   CREATE TABLE paris (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     choix BOOLEAN NOT NULL,
     mise DECIMAL(18, 2) NOT NULL,
     prix_reference DECIMAL(18, 2),
     timestamp TIMESTAMPTZ DEFAULT NOW(),
     gagne BOOLEAN DEFAULT FALSE
   );

   -- Table jackpot
   CREATE TABLE jackpot (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     amount DECIMAL(18, 2) NOT NULL,
     timestamp TIMESTAMPTZ DEFAULT NOW()
   );

   -- Table transactions
   CREATE TABLE transactions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id),
     type TEXT NOT NULL,
     amount DECIMAL(18, 2) NOT NULL,
     description TEXT,
     timestamp TIMESTAMPTZ DEFAULT NOW()
   );
   ```

### 6. Variables d'environnement Base App
```json
{
  "name": "BTC Up/Down Jackpot",
  "description": "Pari sur le Bitcoin avec jackpot progressif",
  "category": "games",
  "icon": "https://your-domain.com/icon.png",
  "start_url": "/",
  "scope": "/",
  "theme_color": "#3b82f6",
  "background_color": "#0f172a"
}
```

## Fonctionnalités

### ✅ Implémentées
- Paris Up/Down sur BTC
- Jackpot progressif
- Historique des paris
- Classement des joueurs
- Intégration Coinbase Wallet
- Prix BTC en temps réel
- Anti-triche (1 pari par wallet par jour)
- Design mobile-first

### 🔧 Stack technique
- Frontend: React + Tailwind CSS
- Backend: Supabase
- Blockchain: Base L2
- Wallet: Coinbase SDK
- Prix: Pyth Network (simulation)

## Structure du projet

```
btc-up-down-jackpot/
├── src/
│   ├── components/          # Composants React
│   ├── services/           # Services API
│   ├── utils/              # Fonctions utilitaires
│   └── styles/             # Styles CSS
├── contracts/             # Smart contracts
├── scripts/               # Scripts de déploiement
└── test/                  # Tests des contrats
```

## Démarrage rapide

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd btc-up-down-jackpot
   ```

2. **Installer dépendances**
   ```bash
   npm install
   ```

3. **Configurer environnement**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos clés
   ```

4. **Lancer l'application**
   ```bash
   npm start
   ```

## Support

Pour toute question ou assistance :
- Créer une issue sur GitHub
- Contacter via Discord
- Voir la documentation complète

---

🚀 **Bon déploiement !**