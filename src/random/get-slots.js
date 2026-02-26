/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { writeFile } = require("fs/promises");

const RPC_URL = 'https://internal-arbitrum-sepolia-net.zeeve.net/Dwmc5q4EXoA3zu5o3v/rpc'; // or Alchemy, Ankr, etc.
const contractAddresses = ['0x74Fb4D87c1bEA5f16AfE7B6F4Dc5eB9E7A34F4e4', '0xF0C7eC2cc2866F482009818F1Ea343d6e7f181e9', '0xb6eFF1F58BDc08D032b74Da39512d90b1Db6263a', '0x36060895B231CbFfdEb65aa09F61E1516248508A'];

// Helper to call JSON-RPC
async function callRpc(method, params) {
    const response = await fetch(RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method,
            params,
        }),
    });

    const json = await response.json();
    return json.result;
}

// Get bytecode of the contract
async function getCode(contractAddress) {
    const code = await callRpc('eth_getCode', [contractAddress, 'latest']);
    console.log('Contract bytecode:', code);
    return code;
}

// Read N storage slots from 0x0 to 0x(N-1)
async function getSlots(contractAddress, n) {
    let slots = {};
    for (let i = 0; i < n; i++) {
        const slot = '0x' + i.toString(16).padStart(64, '0'); // padded 32-byte hex
        const value = await callRpc('eth_getStorageAt', [
            contractAddress,
            slot,
            'latest',
        ]);

        if (!/^0x0*$/.test(value)) {
            slots[i] = value;
            console.log(`Slot ${i}:`, value);
        }
    }
    return slots;
}

(async () => {
    await getCode();
    await getSlots(5); // reads first 5 storage slots
    const queries = contractAddresses.map(async (e, i) => {
        return {
            contractAddresses: e,
            getCode: "await getCode(e)",
            getSlots: await getSlots(e, 100),
        }
    })
    const data = await Promise.all(queries);

    writeFile('./data.json', JSON.stringify(data, null, 4));
})();
