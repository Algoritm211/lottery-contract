import ganache from 'ganache';
import Web3 from "web3";
import {Contract} from 'web3-eth-contract'
import {abi, bytecode} from '../compile'
const web3 = new Web3(ganache.provider() as any);

describe('Testing Lottery contract', () => {
  let lottery: Contract;
  let accounts: string[];

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(abi)
      .deploy({data: bytecode})
      .send({from: accounts[0], gas: 1_000_000})
  })

  it('Contract is deployed successfully', () => {
    const deployedContract = lottery.options.address;
    expect(deployedContract).toBeTruthy();
  })

  it('One user can enter the contract', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.02', 'ether'),
    })

    const players = await lottery.methods.getPlayers().call();

    expect(players[0]).toBe(accounts[0]);
    expect(players.length).toBe(1);
  });

  it('Allow multiple accounts to enter', async () => {
    const getSendConfig = (account: string) => {
      return {
        from: account,
        value: web3.utils.toWei('0.02', 'ether'),
      }
    }
    await lottery.methods.enter().send(getSendConfig(accounts[0]))
    await lottery.methods.enter().send(getSendConfig(accounts[1]))
    await lottery.methods.enter().send(getSendConfig(accounts[2]))

    const players = await lottery.methods.getPlayers().call();

    expect(players[0]).toBe(accounts[0]);
    expect(players[1]).toBe(accounts[1]);
    expect(players[2]).toBe(accounts[2]);
    expect(players.length).toBe(3);
  });

  it('Enter validation works good (user can`t enter with less than 0.01 ETH)', async () => {
    const errorEnterToLottery = () => lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('0.0001', 'ether'),
    })

    await expect(errorEnterToLottery()).rejects.toThrowError();
  });

  it('Only manager can pick winner', async () => {
    // Make at least one user in lottery
    await lottery.methods.enter().send({
      from: accounts[5],
      value: web3.utils.toWei('0.02', 'ether'),
    })

    const pickWinnerFromAnotherAccount = () => lottery.methods.pickWinner().send({
      from: accounts[1],
    })
    await expect(pickWinnerFromAnotherAccount()).rejects.toThrowError();
  });

  it('Send money to winner, clear players array and contract balance', async () => {
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei('10', 'ether'),
    })

    const balanceAfterEntry = await web3.eth.getBalance(accounts[0]);
    await lottery.methods.pickWinner().send({from: accounts[0]});
    const balanceAfterWin = await web3.eth.getBalance(accounts[0]);

    const difference = Number(balanceAfterWin) - Number(balanceAfterEntry);
    const players = await lottery.methods.getPlayers().call()
    const contractBalance = Number(await web3.eth.getBalance(lottery.options.address));

    expect(difference).toBeGreaterThan(+web3.utils.toWei('9.8', 'ether'));
    expect(players.length).toBe(0);
    expect(contractBalance).toBe(0);
  });
})
