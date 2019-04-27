'use strict';

const NodeFactory = require('./nodefactory');

const nodeFactory = new NodeFactory();

(async () => {
  const core = nodeFactory.createCore();
  const bcoin = await nodeFactory.createBcoin();

  // Core generates 100 blocks
  await new Promise(r => setTimeout(r, 2000));
  const blocks = await core.rpc(
    'generatetoaddress',
    [100, 'mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8']
  );

  // bcoin connects to Core and syncs
  await new Promise(r => setTimeout(r, 5000));
  await bcoin.rpc(
    'addnode',
    [`127.0.0.1:${core.ports.port}`, 'add']
  );

  // Core prompts a reorg by invalidating an old block
  // then building a new chain on top of its parent.
  // Mine new blocks to different address.
  await new Promise(r => setTimeout(r, 5000));
  await core.rpc(
    'invalidateblock',
    [blocks[blocks.length - 5]]
  );
  await core.rpc(
    'generatetoaddress',
    [10, 'mrkZVNDhZufJfCSw4nbXAgSUPqroNRPYto']
  );

  // Output
  await new Promise(r => setTimeout(r, 10000));
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
