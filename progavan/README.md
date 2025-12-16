# FishLot Traceability API
# Descrizione del Progetto

**FishLot** è una piattaforma blockchain-based per la tracciabilità della filiera ittica.  
Consente agli utenti registrati di creare lotti di pesce certificati (NFT), avanzare gli stati di lavorazione e monitorare la storia del prodotto attraverso un sistema decentralizzato che integra smart contract, un database tradizionale e API REST sicure con autenticazione JWT.

---

# Tabella delle Rotte API

| Metodo | Rotta                       | Parametri                             | Descrizione                          |
|--------|-----------------------------|-------------------------------------|------------------------------------|
| POST   | /auth/register              | email, password, role, ethAddress   | Registrazione utente e assegnazione ruolo on-chain |
| POST   | /auth/login                 | email, password                     | Login e generazione token JWT      |
| POST   | /users                     | email, password, role, ethAddress   | Creazione utente (solo admin)      |
| GET    | /users                     | Nessuno                            | Lista utenti (autenticato)         |
| GET    | /users/:id                 | id (path)                         | Dettaglio utente                   |
| PUT    | /users/:id                 | id (path), role                     | Aggiornamento ruolo utente         |
| DELETE | /users/:id                 | id (path)                         | Eliminazione utente                 |
| POST   | /lots                      | species, quantity, lat, lon, vessel | Creazione lotto (FISHER_ROLE)      |
| POST   | /lots/:tokenId/advance     | tokenId (path), actorEth (opzionale) | Avanzamento stato lotto            |
| GET    | /lots/:tokenId             | tokenId (path)                    | Dettaglio lotto                    |
| GET    | /lots/:tokenId/history     | tokenId (path)                    | Cronologia stati lotto (on-chain) |

---

# Pattern Architetturali e Parte On-Chain

Questo progetto combina architetture software consolidate con tecnologie blockchain per garantire sicurezza, modularità e tracciabilità.

---

## Pattern Architetturali Utilizzati

### 1. Model-Service-Controller (MSC)

Il progetto utilizza il pattern **MSC** che suddivide l’applicazione in tre livelli principali:

- **Model (DAO)**: si occupa dell’interazione con il database, gestendo query SQL e manipolazione dati.
- **Service**: contiene la logica di business, orchestrando le operazioni complesse, validazioni e interazioni con la blockchain.
- **Controller**: riceve e risponde alle richieste HTTP, coordinando i service per fornire la risposta al client.

**Vantaggi:**
- Chiarezza nella separazione delle responsabilità.
- Facilità di testing e manutenzione.
- Modularità e riuso del codice.

---

### 2. Singleton

L’istanza di Web3 e le connessioni ai contratti smart (`lotContract`, `rolesManagerContract`) sono implementate secondo il pattern **Singleton**.

- **Motivazioni**:
  - Assicurare una singola connessione Web3 condivisa in tutto il backend.
  - Ridurre l’overhead di inizializzazioni multiple.
  - Centralizzare la gestione degli smart contract e delle loro ABI.

---

## Parte On-Chain: Smart Contracts e Interazione

### Smart Contracts principali

- **FishLotNFT.sol**
  - Contratto ERC721 che rappresenta i lotti di pesce come NFT unici.
  - Include funzioni per minting (creazione) di lotti e avanzamento del loro stato nella filiera.
  - Registra la cronologia degli stati on-chain tramite eventi e strutture dati.

- **RolesManager.sol**
  - Basato su OpenZeppelin `AccessControl`.
  - Gestisce ruoli on-chain (`FISHER_ROLE`, `PROCESSOR_ROLE`, `DISTRIBUTOR_ROLE`, `RETAILER_ROLE`).
  - Permette di assegnare e revocare ruoli, controllando i permessi per le azioni critiche sugli NFT.

---

### Workflow On-Chain

1. **Deploy dei contratti**
   - I contratti vengono distribuiti su una blockchain di sviluppo (ad esempio Ganache o testnet).
2. **Assegnazione dei ruoli**
   - I ruoli sono assegnati agli indirizzi Ethereum degli utenti tramite il contratto `RolesManager`.
3. **Minting Lotto**
   - Solo un indirizzo con `FISHER_ROLE` può creare un nuovo lotto NFT chiamando `mintLot`.
4. **Avanzamento Stato**
   - Solo gli utenti con ruoli specifici possono avanzare lo stato del lotto (PROCESSOR_ROLE, DISTRIBUTOR_ROLE, RETAILER_ROLE).
5. **Tracciamento Storico**
   - Ogni avanzamento genera eventi on-chain e aggiorna la storia dello stato per audit e trasparenza.

---

### Tooling e Ambiente di sviluppo

| Tool      | Scopo                              | Note                                    |
|-----------|-----------------------------------|-----------------------------------------|
| **Ganache** | Blockchain locale per sviluppo e test | Emula una blockchain Ethereum privata e veloce |
| **Truffle** | Suite per compilazione e deploy smart contract | Gestisce build, migrazione e test       |
| **Web3.js** | Libreria per interagire con Ethereum da Node.js | Usata nel backend per chiamare i contratti |

---

### Come usare Ganache e Truffle

1. **Avviare Ganache**

   Ganache crea una blockchain privata locale, utile per sviluppo e test.

   ```bash
   ganache-cli
   ```
2. **Compilare e migrare i contratti**
  Con Truffle, si compilano i contratti e si deployano su Ganache.
   
   ```bash
   truffle compile
   truffle migrate --network development
   ```

3. **Configurazione del backend**

- Impostare in .env la variabile RPC_URL puntando a Ganache (http://localhost:8545).

- Definire gli indirizzi deployati per LOT_CONTRACT_ADDRESS e CONTRACT_ADDRESS (RolesManager).

- Il backend utilizza web3.js per interagire con i contratti tramite queste variabili.

## Funzionamento del Progetto

Di seguito viene descritto il funzionamento delle principali rotte API del progetto **FishLot Traceability**, con esempi di richieste, risposte e meccanismi sottostanti.

---



## POST: `/auth/login`

Questa rotta consente al client di **autenticarsi** e ricevere un **token JWT** per autorizzare le chiamate successive.

---

### Richiesta

```http
POST /auth/login
Content-Type: application/json
```


```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Meccanismo

Il flusso di registrazione segue i seguenti passaggi:
 - Ricerca utente tramite email nel database
 - Verifica della password confrontando l’hash con bcrypt
 - Se validi, genera un token JWT con payload contenente id, email, ruolo e indirizzo eth
 - Restituisce il token e i dati utente (senza la password)

```mermaid
sequenceDiagram
  autonumber

  participant Client
  participant App (Express)
  participant UserController
  participant UserService
  participant UserDAO
  participant Bcrypt
  participant JWTService

  Client->>App: POST /auth/login (email, password)

  App->>UserController: login(req)

  UserController->>UserService: login(email, password)

  UserService->>UserDAO: findByEmail(email)
  UserDAO-->>UserService: user

  UserService->>Bcrypt: compare(password, user.password_hash)
  Bcrypt-->>UserService: ok

  UserService->>JWTService: sign({ id, email, role, eth_address })
  JWTService-->>UserService: token

  UserService-->>UserController: { user, token }

  UserController-->>App: res.json({ user, token })

  App-->>Client: 200 OK + JSON token e user

```

### Risposta in caso di successo

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "FISHER_ROLE",
    "ethAddress": "0xAbC1234567890abcdef1234567890abcdef1234"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Risposte in caso di errore

#### 400 – Email o password mancanti o errati
```json
{
  "error": "Credenziali errate"
}
```

#### 400 – Utente non trovato
```json
{
  "error": "Utente non trovato"
}
```

#### 500 – Errore interno server
```json
{
  "error": "Errore interno del server"
}
```


---

## POST: `/users`

Questa rotta consente la **registrazione di un nuovo utente** e l’**assegnazione del ruolo on-chain** tramite smart contract `RolesManager`.

---

### Richiesta

```http
POST /users
Authorization: Bearer <JWT>
```

```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "FISHER_ROLE",
  "ethAddress": "0xAbC1234567890abcdef1234567890abcdef1234"
}
```

---

### Meccanismo

Il flusso di registrazione segue i seguenti passaggi:

- Validazione dell’indirizzo Ethereum (`ethAddress`)
- Verifica che l’email non sia già registrata
- Hash sicuro della password tramite **bcrypt**
- Creazione dell’utente nel database relazionale
- Assegnazione del ruolo **on-chain** tramite smart contract `RolesManager`
- Restituzione dei dati utente creati



---

###  Diagramma di sequenza

```mermaid
sequenceDiagram
  autonumber

  participant Client
  participant App (Express)
  participant UserController
  participant UserService
  participant UserDAO
  participant Bcrypt
  participant RolesManager (On-chain)

  Client->>App: POST /auth/register (email, password, role, ethAddress)

  App->>UserController: register(req)

  UserController->>UserService: register(email, password, role, ethAddress)

  UserService->>UserDAO: findByEmail(email)
  UserDAO-->>UserService: null

  UserService->>Bcrypt: hash(password)
  Bcrypt-->>UserService: password_hash

  UserService->>UserDAO: createUser(...)
  UserDAO-->>UserService: user

  UserService->>RolesManager (On-chain): grantRoleTo(roleHash, ethAddress)
  RolesManager-->>UserService: tx confirmed

  UserService-->>UserController: user

  UserController-->>App: res.status(201).json(user)
  App-->>Client: 201 Created
```

---

### Risposta in caso di successo

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": "FISHER_ROLE",
  "eth_address": "0xAbC1234567890abcdef1234567890abcdef1234"
}
```

---

### Risposte in caso di errore

#### 400 – Indirizzo Ethereum non valido
```json
{
  "error": "Indirizzo Ethereum non valido"
}
```

#### 400 – Email già registrata
```json
{
  "error": "Email già registrata"
}
```

#### 403 – Ruolo non assegnabile on-chain
```json
{
  "error": "AccessControl: account is missing role"
}
```

#### 500 – Errore blockchain o server
```json
{
  "error": "Errore interno del server"
}
```

---

## POST: `/lots`

Questa rotta permette a un utente con ruolo `FISHER_ROLE` di creare un nuovo lotto di pesce sulla blockchain e salvarlo nel database.

---

### Richiesta

```http
POST /lots
Content-Type: application/json
Authorization: Bearer <token_jwt>
```

```json
{
  "species": "Tuna",
  "quantity": 100,
  "lat": 45.4642,
  "lon": 9.1900,
  "vessel": "VesselName"
}
```

### Meccanismo

- Il flusso di registrazione segue i seguenti passaggi:

- Middleware auth verifica il token JWT e decodifica i dati utente

- Middleware requireRole("FISHER_ROLE") controlla che l'utente abbia il ruolo on-chain

- Controller riceve i dati e aggiunge l'indirizzo Ethereum dell'utente (dal token)

- Service:

-- Verifica la validità dell’indirizzo Ethereum

-- Controlla il ruolo on-chain FISHER_ROLE

-- Calcola l’area FAO dalla latitudine e longitudine

-- Stima il gas necessario e invia la transazione di minting NFT on-chain

-- Recupera il tokenId dall’evento della transazione

-- Salva il lotto nel database

-- Registra la storia (history) associata

- Restituisce dati di transazione, database e tokenId

```mermaid
sequenceDiagram
  autonumber

  participant Client
  participant App (Express)
  participant MiddlewareAuth
  participant MiddlewareRole
  participant LotController
  participant LotService
  participant RolesManagerContract
  participant LotContract
  participant FaOSvc
  participant LotDAO
  participant DB

  Client->>App: POST /lots + JSON body + JWT

  App->>MiddlewareAuth: authenticate JWT
  MiddlewareAuth-->>App: user data

  App->>MiddlewareRole: requireRole("FISHER_ROLE")
  MiddlewareRole->>RolesManagerContract: hasRolePublic(FISHER_ROLE, user.eth_address)
  RolesManagerContract-->>MiddlewareRole: true
  MiddlewareRole-->>App: next()

  App->>LotController: create(req)

  LotController->>LotService: createLot(payload + user.eth_address)

  LotService->>RolesManagerContract: hasRolePublic(FISHER_ROLE, callerEthAddress)
  RolesManagerContract-->>LotService: true

  LotService->>FaOSvc: getFAOArea(lat, lon)
  FaOSvc-->>LotService: faoArea

  LotService->>LotContract: estimateGas(mintLot)
  LotService->>LotContract: send(mintLot)

  LotContract-->>LotService: transaction receipt (with tokenId)

  LotService->>LotDAO: create(dbObj)
  LotDAO->>DB: INSERT lot

  LotService->>LotDAO: addHistory(lotId, "FISHED", callerEthAddress)

  LotDAO-->>LotService: ok

  LotService-->>LotController: result(tx, db, tokenId)

  LotController-->>App: res.status(201).json(result)

  App-->>Client: 201 Created + JSON con dati lotto e tx
```

### Risposta in caso di successo

```json
{
  {
  "tx": {
    "transactionHash": "0x123abc...",
    "events": {
      "Transfer": {
        "returnValues": {
          "tokenId": "42"
        }
      }
    }
  },
  "db": {
    "id": 1,
    "token_id": 42,
    "owner_eth_address": "0xAbC1234567890abcdef1234567890abcdef1234",
    "species": "Tuna",
    "quantity": 100,
    "coordinates_or_area": "27.4.a",
    "vessel": "VesselName",
    "state": "FISHED",
    "completed": false
  },
  "tokenId": 42
}

}
```

---

### Risposte in caso di errore

#### 400 – Dati mancanti o invalidi
```json
{
   "error": "callerEthAddress non valido o mancante"
}
```

#### 403 – Ruolo on-chain non assegnato
```json
{
  "error": "L'account non ha il ruolo FISHER_ROLE"
}
```

#### 500 – Errore interno server o blockchain
```json
{
  "error": "Errore nella transazione blockchain"
}
```

---

## POST: `/lots/:tokenId/advance`

Questa rotta permette a un utente con il ruolo on-chain corrispondente di avanzare lo stato di un lotto specifico della filiera ittica.

---

### Richiesta

```http
POST /lots/42/advance
Content-Type: application/json
Authorization: Bearer <token_jwt>
```

### Meccanismo
- Middleware auth verifica il token JWT e decodifica i dati utente
- Controller riceve tokenId e actorEth (da body o JWT)
- Service:
-- Verifica la validità dell’indirizzo Ethereum actorEth
-- Stima il gas necessario e invia la transazione on-chain advanceState(tokenId) usando l’actorEth come sender
-- Recupera lo stato aggiornato on-chain e aggiorna il record nel database
-- Aggiunge una voce di storia (history) associata allo stato avanzato
- Restituisce i dati aggiornati e la transazione

```mermaid
sequenceDiagram
  autonumber

  participant Client
  participant App (Express)
  participant MiddlewareAuth
  participant LotController
  participant LotService
  participant LotContract
  participant LotDAO
  participant DB

  Client->>App: POST /lots/:tokenId/advance + JWT + optional actorEth

  App->>MiddlewareAuth: authenticate JWT
  MiddlewareAuth-->>App: user data

  App->>LotController: advance(req)

  LotController->>LotService: advanceState(tokenId, actorEth or user.eth_address)

  LotService->>LotContract: estimateGas(advanceState(tokenId), { from: actorEth })

  LotService->>LotContract: send(advanceState(tokenId), { from: actorEth })

  LotContract-->>LotService: transaction receipt

  LotService->>LotContract: getLot(tokenId)

  LotService->>LotDAO: updateStateByToken(tokenId, newState, completed)

  LotService->>LotDAO: addHistory(lotId, newState, actorEth)

  LotDAO-->>LotService: ok

  LotService-->>LotController: result(updated, tx)

  LotController-->>App: res.json(result)

  App-->>Client: 200 OK + JSON con stato aggiornato e tx
```

### Risposta in caso di successo

```json
{
  {
  "updated": {
    "id": 1,
    "token_id": 42,
    "state": "PROCESSING",
    "completed": false
  },
  "tx": {
    "transactionHash": "0xabc123...",
    "events": {
      "StateAdvanced": {
        "returnValues": {
          "tokenId": "42",
          "newState": "PROCESSING",
          "actor": "0x1234567890abcdef1234567890abcdef12345678"
        }
      }
    }
  }
}

}
```

---

### Risposte in caso di errore

#### 400 – Dati mancanti o invalidi
```json
{
   "error": "actorEthAddress non valido o mancante"
}
```

#### 500 – Errore interno server o blockchain
```json
{
  "error": "Errore nella transazione blockchain"
}
```

---

## GET: `/lots/:tokenId/history`

Questa rotta restituisce la cronologia degli stati (history) di un lotto specifico, recuperata on-chain.

---

### Richiesta

```http
GET /lots/42/history
Authorization: Bearer <token_jwt>
```

### Meccanismo

- Middleware auth verifica il token JWT e decodifica i dati utente

- Controller riceve il tokenId dalla URL

- Service richiama il contratto blockchain per ottenere la cronologia degli stati (getHistory(tokenId))

- Restituisce la cronologia degli eventi (stati, timestamp, attori)

```mermaid
sequenceDiagram
  autonumber

  participant Client
  participant App (Express)
  participant MiddlewareAuth
  participant LotController
  participant LotService
  participant LotContract

  Client->>App: GET /lots/:tokenId/history + JWT

  App->>MiddlewareAuth: authenticate JWT
  MiddlewareAuth-->>App: user data

  App->>LotController: getHistory(req)

  LotController->>LotService: getHistoryOnChain(tokenId)

  LotService->>LotContract: getHistory(tokenId)

  LotContract-->>LotService: history[]

  LotService-->>LotController: history[]

  LotController-->>App: res.json(history)

  App-->>Client: 200 OK + JSON con lista history

```

### Risposta in caso di successo

```json
{
  {
  "tokenId": 42,
  "lot": {
    "id": 42,
    "species": "Tuna",
    "quantity": 150,
    "area": "27.8.b",
    "vessel": "FishingBoat01",
    "stateIndex": 2,
    "state": "DISTRIBUTING",
    "completed": false
  },
  "history": [
    {
      "stepIndex": 0,
      "state": "FISHED",
      "timestamp": 1690000000,
      "actor": "0xabc123..."
    },
    {
      "stepIndex": 1,
      "state": "PROCESSING",
      "timestamp": 1690005000,
      "actor": "0xdef456..."
    },
    {
      "stepIndex": 2,
      "state": "DISTRIBUTING",
      "timestamp": 1690010000,
      "actor": "0x123789..."
    }
  ]
}


}
```

---

### Risposte in caso di errore

#### 400 – Parametro tokenId non valido
```json
{
  "error": "tokenId non valido"
}
```

#### 404 – Lotto non trovato
```json
{
  "error": "Not found"
}
```

#### 500 – Errore interno server
```json
{
  "error": "Errore del server"
}
```

---

## Testing

Per testare il progetto correttamente, è importante seguire alcuni passaggi chiave per configurare l’ambiente di sviluppo e avviare i test in modo efficace. Ecco una guida nei seguenti passaggi:

1. **Scarica il progetto**: Clona il repository tramite URL Git oppure scarica il file ZIP ed estrailo.
2. **Importa le richieste API**: Per facilitare i test delle API, è disponibile una collection Postman con tutte le chiamate preconfigurate.

- Scarica il file `fishlot_postman_collection.json` dalla cartella `/progavan` 

- Importa la collection in Postman tramite **Import > File > seleziona il file**.

- La collection contiene tutte le rotte principali con esempi di body, header e parametri.

- Assicurati che la variabile `base_url` sia impostata a `http://localhost:3000` o all'URL corretto del tuo server.


3. **Avvia i servizi**: Apri un terminale nella cartella `/progavan` e lancia il comando:
  ```bash
    docker-compose up ganache truffle 
  ```
  Aspettare i deploy dei contratti fino a quando non uscirà la scritta truffle **truffle exited with code 0**
  4. **Configura l’ambiente**: Compila il file `.env` con i dati richiesti, prendere i contract addres e inserirli nell' `.env`.
  ![deploy1](deploy1.png)
  ![deploy2](deploy2.png)

