```mermaid
sequenceDiagram
  autonumber
  participant Client
  participant App
  participant AuthMiddleware
  participant RoleMiddleware
  participant LotController
  participant LotService
  participant RolesManagerContract
  participant FishLotNFTContract
  participant LotDao
  participant DB

  Client->>App: POST /lots (body con dati lotto)
  
  App->>AuthMiddleware: verifica JWT token
  AuthMiddleware-->>App: user con eth_address

  App->>RoleMiddleware: verifica ruolo FISHER_ROLE on-chain
  RoleMiddleware->>RolesManagerContract: hasRolePublic(FISHER_ROLE, eth_address)
  RolesManagerContract-->>RoleMiddleware: true/false
  RoleMiddleware-->>App: next() o 403

  App->>LotController: create(req.body, req.user.eth_address)

  LotController->>LotService: createLot(payload + eth_address)

  LotService->>RolesManagerContract: hasRolePublic(FISHER_ROLE, eth_address)
  RolesManagerContract-->>LotService: true/false

  LotService->>LotService: getFAOArea(lat, lon)

  LotService->>FishLotNFTContract: estimateGas mintLot(...)
  FishLotNFTContract-->>LotService: gasEstimate

  LotService->>FishLotNFTContract: send mintLot(...) with gasEstimate
  FishLotNFTContract-->>LotService: tx receipt con tokenId

  LotService->>LotDao: create({tokenId, owner, specie, ...})
  LotDao->>DB: INSERT INTO lots ...
  DB-->>LotDao: lotto creato

  LotService->>LotDao: addHistory(lotId, "FISHER", eth_address)
  LotDao->>DB: INSERT INTO lot_history ...
  DB-->>LotDao: ok

  LotDao-->>LotService: result

  LotService-->>LotController: { tx, db, tokenId }

  LotController-->>App: res.status(201).json(result)

  App-->>Client: 201 Created + dati lotto
