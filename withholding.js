'use strict';

const NodeFactory = require('./nodefactory');

const nodeFactory = new NodeFactory();

(async () => {
  const server = await nodeFactory.createBcoin();
  const core = nodeFactory.createCore();
  const bcoin = await nodeFactory.createBcoin();

  // Server generates blocks
  await new Promise(r => setTimeout(r, 5000));
  await server.rpc(
    'generatetoaddress',
    [10, 'mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8']
  );

  // Bcoin and Core connects to Server and syncs
  await new Promise(r => setTimeout(r, 5000));
  await core.rpc(
    'addnode',
    [`127.0.0.1:${server.ports.port}`, 'add']
  );
  await bcoin.rpc(
    'addnode',
    [`127.0.0.1:${server.ports.port}`, 'add']
  );

  // Bcoin and Core disconnects from Server
  await new Promise(r => setTimeout(r, 5000));
  await server.rpc(
    'addnode',
    [`127.0.0.1:${bcoin.ports.port}`, 'remove']
  );
  await core.rpc(
    'addnode',
    [`127.0.0.1:${server.ports.port}`, 'remove']
  );
  await bcoin.rpc(
    'addnode',
    [`127.0.0.1:${server.ports.port}`,'remove']
  );
  await server.rpc(
    'setban',
    [`127.0.0.1:${bcoin.ports.port}`, 'add']
  );
  await core.rpc(
    'setban',
    ['127.0.0.1', 'add']
  );
  await bcoin.rpc(
    'setban',
    [`127.0.0.1:${server.ports.port}`, 'add']
  );

  // Server will delay sending block form now on
  server.node.pool.DELAY = server.node.pool.handleGetData;
  server.node.pool.handleGetData = (peer, packet) => {
    console.log('Delaying handleGetData...');
    setTimeout(
      (peer, packet) => {
        console.log('Handling getData now!');
        server.node.pool.DELAY(peer, packet);
      },
      15000,
      peer,
      packet
    );
  };

  // Server genereates more blocks.
  await new Promise(r => setTimeout(r, 5000));
  await server.rpc(
    'generatetoaddress',
    [4, 'mfWxJ45yp2SFn7UciZyNpvDKrzbhyfKrY8']
  );

  // Core generates more blocks.
  await core.rpc(
    'generatetoaddress',
    [2, 'mrkZVNDhZufJfCSw4nbXAgSUPqroNRPYto']
  );

  // bcoin connects to Server
  await new Promise(r => setTimeout(r, 2000));
  await server.rpc(
    'setban',
    [`127.0.0.1:${bcoin.ports.port}`, 'remove']
  );
  await bcoin.rpc(
    'setban',
    [`127.0.0.1:${server.ports.port}`, 'remove']
  );
  await new Promise(r => setTimeout(r, 1000));
  await bcoin.rpc(
    'addnode',
    [`127.0.0.1:${server.ports.port}`, 'add']
  );

  // After a pause bcoin conencts to Core
  await new Promise(r => setTimeout(r, 5000));
  await core.rpc(
    'setban',
    ['127.0.0.1', 'remove']
  );
  await new Promise(r => setTimeout(r, 1000));
  await bcoin.rpc(
    'addnode',
    [`127.0.0.1:${core.ports.port}`, 'add']
  );

  // Output
  await new Promise(r => setTimeout(r, 15000));
  let serverinfo = await server.rpc(
    'getblockchaininfo',
    []
  );
  let coreinfo = await core.rpc(
    'getblockchaininfo',
    []
  );
  let bcoininfo = await bcoin.rpc(
    'getblockchaininfo',
    []
  );
  console.log('Server: ', serverinfo);
  console.log('Core: ', coreinfo);
  console.log('bcoin: ', bcoininfo);

  // Close
  await new Promise(r => setTimeout(r, 5000));
  await server.rpc(
    'stop',
    []
  );
  await core.rpc(
    'stop',
    []
  );
  await bcoin.rpc(
    'stop',
    []
  );
})();
