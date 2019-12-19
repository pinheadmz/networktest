'use strict';

const NodeFactory = require('./nodefactory');
const BN = require('bcoin/node_modules/bcrypto/lib/bn.js');

const nodeFactory = new NodeFactory();

(async () => {
  const core1 = nodeFactory.createCore();
  const bcoin = await nodeFactory.createBcoin();


  bcoin.node.network.pow.chainwork = bcoin.node.network.pow.chainwork.mul( new BN(50) )

  // Core 1 generates 100 blocks
  await new Promise(r => setTimeout(r, 5000));
  await core1.rpc(
    'generatetoaddress',
    [100, 'mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8']
  );

  // bcoin connects to Core and syncs
  await new Promise(r => setTimeout(r, 5000));
  await bcoin.rpc(
    'addnode',
    [`127.0.0.1:${core1.ports.port}`, 'add']
  );

  // Output
  await new Promise(r => setTimeout(r, 20000));
  const core1info = await core1.rpc(
    'getblockchaininfo',
    []
  );
  const bcoininfo = await bcoin.rpc(
    'getblockchaininfo',
    []
  );

  // Close
  await new Promise(r => setTimeout(r, 5000));
  await core1.rpc(
    'stop',
    []
  );
  await bcoin.rpc(
    'stop',
    []
  );
  await new Promise(r => setTimeout(r, 5000));

  console.log('Core 1: ',
    core1info.blocks, core1info.headers, core1info.bestblockhash);
  console.log('bcoin: ',
    bcoininfo.blocks, bcoininfo.headers, bcoininfo.bestblockhash);
})();
