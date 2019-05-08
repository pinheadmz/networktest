'use strict';

const NodeFactory = require('./nodefactory');

const nodeFactory = new NodeFactory();

(async () => {
  const core = nodeFactory.createCore();
  const bcoin = await nodeFactory.createBcoinSPV();
  const wallet = bcoin.node.plugins.walletdb.wdb;
  const primary = await wallet.get('primary');
  const receive = await primary.receiveAddress(0);
  const addr = receive.toString('regtest');

  // Core generates 100 blocks
  await new Promise(r => setTimeout(r, 2000));
  await core.rpc(
    'generatetoaddress',
    [100, 'mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8']
  );

  // bcoin connects to Core and syncs
  await new Promise(r => setTimeout(r, 5000));
  await bcoin.rpc(
    'addnode',
    [`127.0.0.1:${core.ports.port}`, 'add']
  );

  // 1 new block with coinbase payout to SPV wallet
  await new Promise(r => setTimeout(r, 2000));
  await core.rpc(
    'generatetoaddress',
    [1, addr]
  );

  // Output
  await new Promise(r => setTimeout(r, 5000));
  const coreinfo = await core.rpc(
    'getblockchaininfo',
    []
  );
  const bcoininfo = await bcoin.rpc(
    'getblockchaininfo',
    []
  );

  console.log('Core: ', coreinfo);
  console.log('bcoin: ', bcoininfo);

  // Close
  await new Promise(r => setTimeout(r, 5000));
  await core.rpc(
    'stop',
    []
  );
  await bcoin.rpc(
    'stop',
    []
  );
  await new Promise(r => setTimeout(r, 5000));
})();
