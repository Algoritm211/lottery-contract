// @ts-ignore
import solc from 'solc';
import fs from 'fs';
import path from "path";

const inboxContractPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const contractSource = fs.readFileSync(inboxContractPath, 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'Lottery.sol': {
      content: contractSource,
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

export const abi = output.contracts['Lottery.sol']['Lottery'].abi
export const bytecode = output.contracts['Lottery.sol']['Lottery'].evm.bytecode.object

fs.writeFileSync('./metadata/abi.json', JSON.stringify(abi));
