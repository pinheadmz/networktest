'use strict';

const NodeFactory = require('./nodefactory');
const base32 = require('bs32');

const nodeFactory = new NodeFactory();

(async () => {
  const hsd1 = await nodeFactory.createHSD();
  const hsd2 = await nodeFactory.createHSD();
  const hsd3 = await nodeFactory.createHSD();
  const hsd4 = await nodeFactory.createHSD();

  await new Promise(r => setTimeout(r, 2000));
  const hsd1key = base32.encode(hsd1.node.pool.hosts.address.key);
  const hsd2key = base32.encode(hsd2.node.pool.hosts.address.key);
  const hsd3key = base32.encode(hsd3.node.pool.hosts.address.key);
  const hsd4key = base32.encode(hsd4.node.pool.hosts.address.key);

  // hsd 1 connects to hsd 3 fine
  await new Promise(r => setTimeout(r, 2000));
  await hsd1.rpc(
    'addnode',
    [`${hsd3key}@127.0.0.1:${hsd3.ports.port}`, 'add']
  );

  // hsd 2 tries to connect to hsd 3 with the wrong key
  const badKey = 'aorsxa4ylaacshipyjkfbvzfkh3jhh4yowtoqdt64nzemqtiw2whk';
  await new Promise(r => setTimeout(r, 2000));
  await hsd2.rpc(
    'addnode',
    [`${badKey}@127.0.0.1:${hsd3.ports.port}`, 'add']
  );

  // hsd 4 connects to hsd 2 -- getting from it the WRONG key for hsd 3
  await new Promise(r => setTimeout(r, 2000));
  await hsd4.rpc(
    'addnode',
    [`${hsd2key}@127.0.0.1:${hsd2.ports.port}`, 'add']
  );

  // hsd 4 connects to hsd 1 -- getting from it the RIGHT key for hsd 3
  await new Promise(r => setTimeout(r, 2000));
  await hsd4.rpc(
    'addnode',
    [`${hsd1key}@127.0.0.1:${hsd1.ports.port}`, 'add']
  );

  // Output
  await new Promise(r => setTimeout(r, 20000));
  const hsd1info = await hsd1.rpc(
    'getpeerinfo',
    []
  );
  const hsd2info = await hsd2.rpc(
    'getpeerinfo',
    []
  );
  const hsd3info = await hsd3.rpc(
    'getpeerinfo',
    []
  );
  const hsd4info = await hsd4.rpc(
    'getpeerinfo',
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
  await hsd3.rpc(
    'stop',
    []
  );
  await hsd4.rpc(
    'stop',
    []
  );
  await new Promise(r => setTimeout(r, 1000));

  console.log('hsd 1: ', hsd1info);
  console.log('hsd 2: ', hsd2info);
  console.log('hsd 3: ', hsd3info);
  console.log('hsd 4: ', hsd4info);
})();
