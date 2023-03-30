// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.4;

interface IERC20{
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approved(address indexed owner, address indexed spender, uint256 amount);

    function totalSupply() external view returns(uint256);

    function balanceOf(address account) external view returns(uint256);

    function allowance(address owner, address spender, uint256 amount) external returns(uint256);

    function transfer(address recipient, uint256 amount) external returns(bool);

    function approve(address owner, address spender, uint256 amount) external returns(bool);

    function transferFrom(address owner, address to, uint256 amount) external returns(bool);
}