'use strict';

const NodeFactory = require('./nodefactory');

const nodeFactory = new NodeFactory();

(async () => {
  const core1 = nodeFactory.createCore();
  const core2 = nodeFactory.createCore();
  const bcoin = await nodeFactory.createBcoin();

  // Core 1 generates 1000 blocks
  await new Promise(r => setTimeout(r, 2000));
  await core1.client.execute(
    '',
    'generatetoaddress',
    [1000, 'mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8']
  );

  // Core 2 connects to Core 1 and syncs
  await new Promise(r => setTimeout(r, 5000));
  await core2.client.execute(
    '',
    'addnode',
    [`127.0.0.1:${core1.ports.port}`, 'add']
  );

  // bcoin connects to Core 1 and Core 2 and syncs from both
  await new Promise(r => setTimeout(r, 5000));
  await bcoin.client.execute(
    '',
    'addnode',
    [`127.0.0.1:${core1.ports.port}`, 'add']
  );
  await bcoin.client.execute(
    '',
    'addnode',
    [`127.0.0.1:${core2.ports.port}`, 'add']
  );

  // Output
  await new Promise(r => setTimeout(r, 10000));
  const core1info = await core1.client.execute(
    '',
    'getblockchaininfo',
    []
  );
  const core2info = await core2.client.execute(
    '',
    'getblockchaininfo',
    []
  );
  const bcoininfo = await bcoin.client.execute(
    '',
    'getblockchaininfo',
    []
  );

  console.log('Core 1: ', core1info);
  console.log('Core 2: ', core2info);
  console.log('bcoin: ', bcoininfo);
})();