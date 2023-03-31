// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import {IERC20} from "./IERC20.sol";
import {SafeMath} from "./SafeMath.sol";
import {Access} from "./Access.sol";

contract Tamtoken is IERC20, Access{
   using SafeMath for uint256;

  event MintingFinished();

  
   string public constant name = "Tamtoken"; //token name
   string public constant symbol = "TAM"; // token symbol
   uint8 public constant decimals = 18; //token decimal
   bool private _mintingFinished = false;
   uint256  private _totalSupply; 
  

   mapping(address => uint256) _balances;

   //owner's address => spender's address =>token  amount allowed
   mapping (address => mapping(address => uint256)) _allowed;


   ///////ERORS///////
   error AddressZero();
   error InsufficientToken();
   error InsufficientAllowance();
   error MintingHasFinished();



   //Getter for token total supply in existence
   function totalSupply() public view returns(uint256){
      return _totalSupply;
   }

   //Getting the token balance of a particular address/account
   function balanceOf(address account) public view returns(uint256){
      return _balances[account];
   }

   //Getting the token amount allowed for a particular spender 
   function allowance(address owner, address spender) public view returns(uint256){
      return _allowed[owner][spender];
   }


   //transfer token from one account to another account
   function transfer(address to, uint256 amount) external returns(bool){
      if(to == address(0)) revert AddressZero();

      if(amount > _balances[msg.sender]) revert InsufficientToken();
      
      _balances[msg.sender] = _balances[msg.sender].sub(amount);
      _balances[to] = _balances[to].add(amount);

      emit Transfer(msg.sender, to, amount);
      return true;
   }

   //approve enables a token owner give allowance to a third party to spend their token on their behalf
   function approve(address spender, uint256 amount) external returns(bool){
      if(spender == address(0)) revert AddressZero();
      if(amount > _allowed[msg.sender][spender]) revert InsufficientToken();

      _allowed[msg.sender][spender] = amount;
      emit Approved(msg.sender, spender, amount);
      return true;
   }

   // transferFrom enables an approved spender to spend a token on behalf of the owner
   // msg.sender == spender
   function transferFrom(address from, address to, uint256 amount) external returns(bool){
      if(amount > _allowed[from][msg.sender]) revert InsufficientAllowance();
      if(amount > _balances[from]) revert InsufficientToken();
      if(to == address(0)) revert AddressZero();

      _balances[from] = _balances[from].sub(amount);
      _balances[to] = _balances[to].add(amount);
      _allowed[from][msg.sender] = _allowed[from][msg.sender].sub(amount);

      emit Transfer(msg.sender, to, amount);
      return true;
   }

   // burn token to address(0)
   function _burn(address from , uint256 amount) internal {
      if(from == address(0)) revert AddressZero(); 
      if(amount > _balances[from]) revert InsufficientToken();

      _balances[from] = _balances[from].sub(amount);
      _totalSupply = _totalSupply.sub(amount);

      emit Transfer(from, address(0), amount);
   }

   //function for a particular approved spender to burn token on behalf of the token owner
   function burnFrom(address from,uint256 amount) internal{
      if(from == address(0)) revert AddressZero(); 
      if(amount > _allowed[from][msg.sender]) revert InsufficientAllowance();

      _balances[from] = _balances[from].sub(amount);
      _allowed[from][msg.sender] > _allowed[from][msg.sender].sub(amount);
      emit Transfer(from, address(0), amount);
   }

   //function to decrease allowance for a third party token holder
   function decreaseAllowance( address spender, uint256 subtractedAmount) external returns(bool){
      if(spender == address(0)) revert AddressZero();
      if(subtractedAmount > _allowed[msg.sender][spender]) revert InsufficientToken();

      _allowed[msg.sender][spender] = _allowed[msg.sender][spender].sub(subtractedAmount);
      emit Approved(msg.sender, spender, _allowed[msg.sender][spender]);
      return true;
   }


   //function to increaseAllowance for a third party to spend additional token on behalf of the token holder
   function increaseAllowance(address spender, uint256 amountToIncreaseBy) external returns(bool){
      if(spender == address(0)) revert AddressZero();
      if( amountToIncreaseBy > _balances[msg.sender]) revert InsufficientToken();

      _allowed[msg.sender][spender] = _allowed[msg.sender][spender].add(amountToIncreaseBy);
      emit Approved(msg.sender, spender,  _allowed[msg.sender][spender]);
      return true;
   }

   function _mint(address to, uint256 amount) internal {
      if(to == address(0)) revert AddressZero();

      _totalSupply = _totalSupply.add(amount);
      _balances[to] = _balances[to].add(amount);

      emit Transfer(address(0), to, amount);
   }


   //function to mint new tokens
   function mint(address to, uint256 amount) public onlyMinter returns(bool){
      if(_mintingFinished == true) revert MintingHasFinished();
      _mint(to, amount);
      return true;
   }

   /**
   * @return true if the minting is finished.
   */
  function mintingFinished() public view returns(bool) {
    return _mintingFinished;
  }

   /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting()
    public
    onlyMinter
    returns (bool)
  {
   if(_mintingFinished == true) revert MintingHasFinished();
   
    _mintingFinished = true;
    emit MintingFinished();
    return true;
  }

   
}
