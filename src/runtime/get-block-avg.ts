import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { formatUnits } from '@ethersproject/units';
import Logger from '../logger/logger';


async function getAvgBlockTimeAndGas(provider: JsonRpcProvider, startBlock: number, endBlock:number) {
    const totalTime = 0;
    let totalGasPrice = BigNumber.from(0);
    let count = 0;

    const start = await provider.getBlock(startBlock);
    const end = await provider.getBlock(endBlock);

    for (let i = startBlock; i <= endBlock; i++) {
        const block = await provider.getBlock(i);
        const baseFeePerGas = block.baseFeePerGas; // for EIP-1559
        const gasUsed = block.gasUsed;

        if (baseFeePerGas) {
            totalGasPrice = totalGasPrice.add(baseFeePerGas);
        }

        Logger.info(
            `Block ${i}: Gas Price: ${formatUnits(baseFeePerGas || 0, 'gwei')} gwei, Gas Used: ${gasUsed}`
        );

        count++;
    }

    const avgBlockTime =
        (end.timestamp - start.timestamp) / (endBlock - startBlock);
    const avgGasPrice = totalGasPrice.div(count);

    return {
        avgBlockTime: avgBlockTime.toFixed(2) + ' sec',
        avgGasPrice: formatUnits(avgGasPrice, 'gwei') + ' gwei',
    };
}

// Example usage:
const provider = new JsonRpcProvider(
    'https://sequencer.arb-benchmark-test.zeeve.net'
);
getAvgBlockTimeAndGas(provider, 16405, 16426).then(console.log);
