'use strict';

const NodeFactory = require('./nodefactory');

const nodeFactory = new NodeFactory();

(async () => {
  const core1 = nodeFactory.createCore();
  const bcoin = await nodeFactory.createBcoin();

  // Core 1 generates 500 blocks
  await new Promise(r => setTimeout(r, 5000));
  const blocks = await core1.rpc(
    'generatetoaddress',
    [25, 'mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8']
  );

  // Add checkpoints
  const cp100 = Buffer.from(blocks[4], 'hex').reverse();
  const cp200 = Buffer.from(blocks[9], 'hex').reverse();
  const cp300 = Buffer.from(blocks[14], 'hex').reverse();
  const cp400 = Buffer.from(blocks[19], 'hex').reverse();
  bcoin.node.pool.network.lastCheckpoint = 20;
  bcoin.node.pool.network.checkpointMap = {
    5: cp100,
    10: cp200,
    15: cp300,
    20: cp400
  };
  bcoin.node.pool.network.checkpoints = [
    {hash: cp100, height: 5},
    {hash: cp200, height: 10},
    {hash: cp300, height: 15},
    {hash: cp400, height: 20}
  ];

  // Force bcoin pool to reload checkpoints
  bcoin.node.pool.resetCheckpoints();

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
