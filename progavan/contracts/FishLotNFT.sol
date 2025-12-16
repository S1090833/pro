// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

interface IRolesManager {
    function hasRolePublic(bytes32 role, address account) external view returns (bool);
}

contract FishLotNFT is ERC721URIStorage {

    IRolesManager public rolesManager;

    bytes32 public constant FISHER_ROLE = keccak256("FISHER_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");

    enum State { FISHED, PROCESSING, DISTRIBUTING, RETAILING, SOLD }

    struct History {
        State step;
        address actor;
    }

    struct Lot {
        uint256 id;
        string species;
        uint256 quantity;
        string area;
        string vessel;
        State state;
        bool completed;
        bool approved;
    }

    uint256 private _tokenIds;

    mapping(uint256 => Lot) public lots;
    mapping(uint256 => History[]) private histories;

    event LotMinted(uint256 indexed tokenId, address indexed owner);
    event StateAdvanced(uint256 indexed tokenId, State newState, address indexed actor);

    constructor(address _rolesManager) ERC721("FishLot", "FLOT") {
        rolesManager = IRolesManager(_rolesManager);
    }

    modifier onlyRole(bytes32 role) {
        require(
            rolesManager.hasRolePublic(role, msg.sender),
            "Non hai il ruolo richiesto"
        );
        _;
    }

    
    // MINT LOT
    
    function mintLot(
        address to,
        string memory species,
        uint256 quantity,
        string memory area,
        //uint256 timestampCapture,
        string memory vessel
    ) external onlyRole(FISHER_ROLE) returns (uint256) {

        _tokenIds++;
        uint256 newId = _tokenIds;
        _mint(to, newId);

        lots[newId] = Lot({
            id: newId,
            species: species,
            quantity: quantity,
            area: area,
            vessel: vessel,
            state: State.FISHED,
            completed: false,
            approved: false
        });

       histories[newId].push(History(State.FISHED, msg.sender));

        emit LotMinted(newId, to);
        emit StateAdvanced(newId, State.FISHED, msg.sender);

        return newId;
    }


    // ADVANCE STATE

    function advanceState(uint256 tokenId) external {
        require(_exists(tokenId), "Token non esistente");

        Lot storage lot = lots[tokenId];
        require(!lot.completed, "Filiera completata");

        State current = lot.state;
        State next;

        if (current == State.FISHED) {
            require(
                rolesManager.hasRolePublic(PROCESSOR_ROLE, msg.sender),
                "Solo PROCESSOR_ROLE puo avanzare da FISHED"
            );
            next = State.PROCESSING;
            lot.approved = true;
        } else if (current == State.PROCESSING) {
            require(
                rolesManager.hasRolePublic(DISTRIBUTOR_ROLE, msg.sender),
                "Solo DISTRIBUTOR_ROLE puo avanzare da PROCESSING"
            );
            next = State.DISTRIBUTING;

        } else if (current == State.DISTRIBUTING) {
            require(
                rolesManager.hasRolePublic(RETAILER_ROLE, msg.sender),
                "Solo RETAILER_ROLE puo avanzare da DISTRIBUTING"
            );
            next = State.RETAILING;

        } else if (current == State.RETAILING) {
            require(
                rolesManager.hasRolePublic(RETAILER_ROLE, msg.sender),
                "Solo RETAILER_ROLE puo avanzare a SOLD"
            );
            next = State.SOLD;
            lot.completed = true;

        } else {
            revert("Stato finale raggiunto");
        }

        lot.state = next;
      histories[tokenId].push(History(next, msg.sender));

        emit StateAdvanced(tokenId, next, msg.sender);
    }


    // READ DATA

    function getHistory(uint256 tokenId) external view returns (History[] memory) {
        return histories[tokenId];
    }

    function getLot(uint256 tokenId) external view returns (Lot memory) {
        return lots[tokenId];
    }
}
