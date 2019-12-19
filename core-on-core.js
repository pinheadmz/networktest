'use strict';

const NodeFactory = require('./nodefactory');

const nodeFactory = new NodeFactory();

(async () => {
  const server = nodeFactory.createCore();
  // const client = nodeFactory.createCore();
  const client = await nodeFactory.createBcoin();

  // Core 1 connects to Core 2 and syncs
  await new Promise(r => setTimeout(r, 5000));
  await client.rpc(
    'addnode',
    [`127.0.0.1:${server.ports.port}`, 'add']
  );

  // Close
  await new Promise(r => setTimeout(r, 5000));
  await server.rpc(
    'stop',
    []
  );
  await client.rpc(
    'stop',
    []
  );
  await new Promise(r => setTimeout(r, 5000));
})();
