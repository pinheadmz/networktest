'use strict';

const NodeFactory = require('./nodefactory');

const nodeFactory = new NodeFactory();

(async () => {
  const core1 = nodeFactory.createCore();
  const bcoin = await nodeFactory.createBcoin();

  // Core 1 generates 100 blocks
  await new Promise(r => setTimeout(r, 5000));
  await core1.rpc(
    'generatetoaddress',
    [100, 'mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8']
  );

  // bcoin connects to Core 1, 2, 3, 4 and syncs from all
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
