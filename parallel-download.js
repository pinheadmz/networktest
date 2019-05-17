'use strict';

const NodeFactory = require('./nodefactory');

const nodeFactory = new NodeFactory();

(async () => {
  const core1 = nodeFactory.createCore();
  const core2 = nodeFactory.createCore();
  const core3 = nodeFactory.createCore();
  const core4 = nodeFactory.createCore();
  const bcoin = await nodeFactory.createBcoin();

  // Core 1 generates 1000 blocks
  await new Promise(r => setTimeout(r, 5000));
  await core1.rpc(
    'generatetoaddress',
    [1000, 'mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8']
  );

  // Core 2, 3 and 4 connects to Core 1 and syncs
  await new Promise(r => setTimeout(r, 5000));
  await core2.rpc(
    'addnode',
    [`127.0.0.1:${core1.ports.port}`, 'add']
  );
  await core3.rpc(
    'addnode',
    [`127.0.0.1:${core1.ports.port}`, 'add']
  );
  await core4.rpc(
    'addnode',
    [`127.0.0.1:${core1.ports.port}`, 'add']
  );

  // bcoin connects to Core 1, 2, 3, 4 and syncs from all
  await new Promise(r => setTimeout(r, 5000));
  await bcoin.rpc(
    'addnode',
    [`127.0.0.1:${core1.ports.port}`, 'add']
  );
  await bcoin.rpc(
    'addnode',
    [`127.0.0.1:${core2.ports.port}`, 'add']
  );

  await bcoin.rpc(
    'addnode',
    [`127.0.0.1:${core3.ports.port}`, 'add']
  );

  await bcoin.rpc(
    'addnode',
    [`127.0.0.1:${core4.ports.port}`, 'add']
  );

  // Output
  await new Promise(r => setTimeout(r, 20000));
  const core1info = await core1.rpc(
    'getblockchaininfo',
    []
  );
  const core2info = await core2.rpc(
    'getblockchaininfo',
    []
  );
  const core3info = await core3.rpc(
    'getblockchaininfo',
    []
  );
  const core4info = await core4.rpc(
    'getblockchaininfo',
    []
  );
  const bcoininfo = await bcoin.rpc(
    'getblockchaininfo',
    []
  );
  const bcoinpeers = await bcoin.rpc(
    'getpeerinfo',
    []
  );

  // Close
  await new Promise(r => setTimeout(r, 5000));
  await core1.rpc(
    'stop',
    []
  );
  await core2.rpc(
    'stop',
    []
  );
  await core3.rpc(
    'stop',
    []
  );
  await core4.rpc(
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
  console.log('Core 2: ',
    core2info.blocks, core2info.headers, core2info.bestblockhash);
  console.log('Core 3: ',
    core3info.blocks, core3info.headers, core3info.bestblockhash);
  console.log('Core 4: ',
    core4info.blocks, core4info.headers, core4info.bestblockhash);
  console.log('bcoin: ',
    bcoininfo.blocks, bcoininfo.headers, bcoininfo.bestblockhash);
  console.log('bcoin peers: ', bcoinpeers);
})();
