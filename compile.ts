import { CompileFailedError, CompileResult, compileSol } from "solc-typed-ast";
import fs from 'fs';


const compile = async () => {
  const contractPath = './contracts/Lottery.sol';
  const contractName = 'Lottery';

  const result = await compileSol(contractPath, 'auto', );
  const contractData = result.data.contracts[contractPath][contractName];

  const abi = contractData.abi;
  const bytecode = contractData.evm.bytecode.object;

  //Writing to file
  fs.writeFileSync('./metadata/abi.json', JSON.stringify(abi));

  // console.log(Object.keys(contractData));
}

void compile();
