# Supabase Configuration

Créez un compte sur https://supabase.com et configurez votre projet.

## Variables d'environnement

Ajoutez ces variables à votre projet Supabase :

```env
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
```

## Configuration des tables

Exécutez ces requêtes SQL dans l'éditeur SQL de Supabase :

```sql
-- Activer l'extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bet', 'win', 'deposit', 'withdrawal')),
  amount DECIMAL(18, 2) NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_paris_user_id ON paris(user_id);
CREATE INDEX idx_paris_timestamp ON paris(timestamp);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);

-- Policy pour RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE paris ENABLE ROW LEVEL SECURITY;
ALTER TABLE jackpot ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy utilisateurs
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (auth.uid()::text = address);

CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = address);

-- Policy paris
CREATE POLICY "Users can view their own bets" ON paris
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE address = auth.uid()::text));

CREATE POLICY "Users can insert their own bets" ON paris
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE address = auth.uid()::text));

-- Policy transactions
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (user_id = (SELECT id FROM users WHERE address = auth.uid()::text));

CREATE POLICY "Users can insert their own transactions" ON transactions
  FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE address = auth.uid()::text));

-- Fonctions pour créer automatiquement les utilisateurs
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (address)
  VALUES (auth.uid()::text);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer utilisateur à la première connexion
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

## Configuration API REST

1. Allez dans l'onglet "API" de Supabase
2. Activez l'API REST
3. Les endpoints seront disponibles automatiquement

## Configuration Realtime

Pour l'historique en temps réel :

```sql
-- Configurer Realtime pour les paris
ALTER TABLE paris ENABLE REPLICA;

-- Créer la politique Realtime
CREATE POLICY "Enable realtime for paris" ON paris
  FOR ALL USING (true);

-- Créer la configuration Realtime
INSERT INTO realtime.public_settings (schema_name, table_name, slot_name, enabled, notify_payload)
VALUES ('public', 'paris', 'paris', true, 'true');
```

## Clés API

1. Récupérez votre URL et Anon Key depuis l'onglet "Settings" > "API"
2. Ajoutez-les à votre fichier `.env`

## Test de la connexion

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

const supabase = createClient(supabaseUrl, supabaseKey)

// Test de connexion
const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
```

---

🚀 Votre backend Supabase est prêt !