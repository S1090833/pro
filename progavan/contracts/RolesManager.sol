// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;


import "@openzeppelin/contracts/access/AccessControl.sol";


contract RolesManager is AccessControl {
bytes32 public constant FISHER_ROLE = keccak256("FISHER_ROLE");
bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
bytes32 public constant RETAILER_ROLE = keccak256("RETAILER_ROLE");


event RoleGrantedEvent(bytes32 role, address account, address sender);
event RoleRevokedEvent(bytes32 role, address account, address sender);


constructor(address admin) {
// grant DEFAULT_ADMIN_ROLE to deployer/admin
_setupRole(DEFAULT_ADMIN_ROLE, admin);
_setRoleAdmin(FISHER_ROLE, DEFAULT_ADMIN_ROLE);
_setRoleAdmin(PROCESSOR_ROLE, DEFAULT_ADMIN_ROLE);
_setRoleAdmin(DISTRIBUTOR_ROLE, DEFAULT_ADMIN_ROLE);
_setRoleAdmin(RETAILER_ROLE, DEFAULT_ADMIN_ROLE);
}


function grantRoleTo(bytes32 role, address account) public onlyRole(getRoleAdmin(role)) {
super.grantRole(role, account);
emit RoleGrantedEvent(role, account, msg.sender);
}


function revokeRoleFrom(bytes32 role, address account) public onlyRole(getRoleAdmin(role)) {
super.revokeRole(role, account);
emit RoleRevokedEvent(role, account, msg.sender);
}


// helper view
function hasRolePublic(bytes32 role, address account) external view returns (bool) {
return hasRole(role, account);
}
}