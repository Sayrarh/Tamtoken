// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

contract AccessControl{
    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);
  
    mapping(address => bool) private minters;

    error AccountHasRole();
    error AccountHasNoMinterRole();
    error AddressZero();
    error OnlyMinter();

    constructor(){
         minters[msg.sender] = true;
    }


    function addMinter(address account) public {
        if(!hasMinterRole(msg.sender)) revert OnlyMinter();
        if(minters[account] == true) revert AccountHasRole(); 
        if(account == address(0)) revert AddressZero();
        
        minters[account] = true;

        emit MinterAdded(account);
    }

    function removeMinter(address account) internal{
        if(!minters[account]) revert AccountHasNoMinterRole();
        if(account == address(0)) revert AddressZero();
        
        minters[account] = false;

        emit MinterRemoved(account);
    }

    function renounceMinterRole() public{
        minters[msg.sender] = false;

        emit MinterRemoved(msg.sender);
    }

    function hasMinterRole(address account) internal view returns(bool){
        return minters[account];
    }

}