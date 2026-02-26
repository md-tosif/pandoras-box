/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const { AbiCoder } = require('ethers');
const { ethers, solidityPacked, keccak256 } = require('ethers');

// Example: Node.js or browser JavaScript
async function getOptimismOutputAtBlock(rpcUrl, blockTagOrNumber) {
    // Ensure blockTagOrNumber is a hex string if it’s a number:
    // If a number is passed, convert: e.g., 12345678 -> '0xbc614e'
    let blockParam = blockTagOrNumber;
    if (typeof blockTagOrNumber === 'number') {
        blockParam = '0x' + blockTagOrNumber.toString(16);
    }
    // For 'latest' or other tags, pass as-is:
    const params = [blockParam];

    const body = {
        jsonrpc: '2.0',
        id: 1,
        method: 'optimism_outputAtBlock',
        params: params,
    };

    const resp = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!resp.ok) {
        throw new Error(`HTTP error ${resp.status}: ${await resp.text()}`);
    }
    const data = await resp.json();
    if (data.error) {
        throw new Error(`RPC error: ${JSON.stringify(data.error)}`);
    }
    // The result object:
    const result = data.result;
    console.log({ result });

    // Extract withdrawalStorageRoot and stateRoot:
    const withdrawalStorageRoot = result.withdrawalStorageRoot;
    const stateRoot = result.stateRoot;
    const blockHash = result.blockRef.hash;
    return { withdrawalStorageRoot, stateRoot, fullResult: result, blockHash };
}

(async () => {

    const dataFromRpc = await getOptimismOutputAtBlock('https://rpc.metall2.com', 19638098)

    // Define the required parameters
    const version = '0x00'; // Version as a single byte
    const stateRoot = dataFromRpc.stateRoot;
    const withdrawalStorageRoot = dataFromRpc.withdrawalStorageRoot;

    const blockHash = dataFromRpc.blockHash;

    const abicode = new AbiCoder();

    // Encode the parameters using Solidity's packed encoding
    const packed = abicode.encode(
        ['bytes1', 'bytes32', 'bytes32', 'bytes32'],
        [version, stateRoot, withdrawalStorageRoot, blockHash]
    );

    // Compute the Keccak-256 hash of the packed data
    const outputRoot = keccak256(packed);

    console.log('Computed _outputRoot: ', outputRoot);
})().then().catch()