'use strict';

const NodeFactory = require('./nodefactory');
const base32 = require('bs32');

const nodeFactory = new NodeFactory();

(async () => {
  const hsd1 = await nodeFactory.createHSD();
  const hsd2 = await nodeFactory.createHSD();

  await new Promise(r => setTimeout(r, 5000));
  const hsd1key = base32.encode(hsd1.node.pool.hosts.address.key);

  // // HSD 1 generates 100 blocks
  // await new Promise(r => setTimeout(r, 5000));
  // await hsd1.rpc(
  //   'generatetoaddress',
  //   [100, 'rs1qpu06wprkwleh579mureghcasjhu9uwge6pltn5']
  // );

  // bcoin connects to Core 1, 2, 3, 4 and syncs from all
  await new Promise(r => setTimeout(r, 5000));
  await hsd2.rpc(
    'addnode',
    [`${hsd1key}@127.0.0.1:${hsd1.ports.port}`, 'add']
  );

  // Output
  await new Promise(r => setTimeout(r, 20000));
  const hsd1info = await hsd1.rpc(
    'getblockchaininfo',
    []
  );
  const hsd2info = await hsd2.rpc(
    'getblockchaininfo',
    []
  );

  // Close
  await new Promise(r => setTimeout(r, 5000));
  await hsd1.rpc(
    'stop',
    []
  );
  await hsd2.rpc(
    'stop',
    []
  );
  await new Promise(r => setTimeout(r, 5000));

  console.log('hsd 1: ', hsd1info);
  console.log('hsd 2: ', hsd2info);
})();
