import ganache from 'ganache';
import Web3 from "web3";
import {Contract} from 'web3-eth-contract'
import {abi, bytecode} from '../compile'
const web3 = new Web3(ganache.provider() as any);

describe('Testing Lottery contract', () => {
  let lottery: Contract;
  let accounts: string[];

  beforeAll(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(abi)
      .deploy({data: bytecode})
      .send({from: accounts[0], gas: 1_000_000})
  })
})
