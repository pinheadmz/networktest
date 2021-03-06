'use strict';

const bcoin = require('bcoin');
const hsd = require('hsd');

const format = require('blgr/lib/format');

const path = require('path');
const bcurl = require('bcurl');
const cp = require('child_process');

class NodeFactory {
  constructor() {
    this.count = 0;
  }

  createDir(index) {
    const dataDir = path.join(__dirname, `data/datadir_${index}`);

    cp.spawnSync('rm', ['-rf', dataDir]);
    cp.spawnSync('mkdir', [dataDir]);

    return dataDir;
  }

  getPorts(index) {
    return {
      port: 10000 + index,
      rpcport: 20000 + index,
      nsport: 30000 + index,
      rsport: 40000 + index,
      walletport: 50000 + index
    };
  }

  initNode() {
    this.count += 1;
    const index = this.count;
    const dataDir = this.createDir(index);
    const ports = this.getPorts(index);
    const client = bcurl.client({
      password: 'x',
      port: ports.rpcport
    });

    const rpc = function (cmd, args) {
      return client.execute('', cmd, args);
    };

    return {
      index,
      dataDir,
      ports,
      rpc
    };
  }

  async createBcoin() {
    const {index, dataDir, ports, rpc} = this.initNode();

    // Prevent automatic outbound connection attempts
    bcoin.networks.regtest.seeds = [];
    bcoin.networks.regtest.selfConnect = false;

    const node = new bcoin.FullNode({
      network: 'regtest',
      workers: true,
      logLevel: 'spam',
      listen: true,
      prefix: `${dataDir}`,
      memory: false,
      port: ports.port,
      httpPort: ports.rpcport,
      // maxOutbound: 1,
      prune: false,
      bip37: true
    });

    const plugin = bcoin.wallet.plugin;
    node.use(plugin);
    node.plugins.walletdb.http.config.port = ports.walletport;

    const printStdout = this.printStdout;
    node.logger.logger.writeConsole = function(level, module, args) {
      printStdout(index, '[' + module + '] ' + format(args, false));
    };

    await node.ensure();
    await node.open();
    await node.connect();
    node.startSync();

    return {index, dataDir, ports, rpc, node};
  }

  async createHSD() {
    const {index, dataDir, ports, rpc} = this.initNode();

    // Prevent automatic outbound connection attempts
    hsd.networks.regtest.seeds = [];
    hsd.networks.regtest.selfConnect = false;

    const node = new hsd.FullNode({
      network: 'regtest',
      workers: true,
      logLevel: 'spam',
      listen: true,
      prefix: `${dataDir}`,
      memory: false,
      port: ports.port,
      httpPort: ports.rpcport,
      nsPort: ports.nsport,
      rsPort: ports.rsport,
      // maxOutbound: 1,
      prune: false,
      bip37: true,
      identityKey: hsd.HDPrivateKey.generate().toRaw().slice(-32)
    });

    const printStdout = this.printStdout;
    node.logger.logger.writeConsole = function(level, module, args) {
      printStdout(index, '[' + module + '] ' + format(args, false));
    };

    await node.ensure();
    await node.open();
    await node.connect();
    node.startSync();

    return {index, dataDir, ports, rpc, node};
  }

  async createBcoinSPV() {
    const {index, dataDir, ports, rpc} = this.initNode();

    const node = new bcoin.SPVNode({
      network: 'regtest',
      workers: true,
      logLevel: 'spam',
      listen: true,
      prefix: `${dataDir}`,
      memory: false,
      port: ports.port,
      httpPort: ports.rpcport,
      maxOutbound: 1
    });

    const plugin = bcoin.wallet.plugin;
    node.use(plugin);

    const printStdout = this.printStdout;
    node.logger.logger.writeConsole = function(level, module, args) {
      printStdout(index, '[' + module + '] ' + format(args, false));
    };

    await node.ensure();
    await node.open();
    await node.connect();
    node.startSync();

    return {index, dataDir, ports, rpc, node};
  }

  createCore() {
    const {index, dataDir, ports, rpc} = this.initNode();

    this.spawnSyncPrint(
      index,
      'bitcoind',
      [
        `-datadir=${dataDir}`,
        '-regtest',
        '-rpcpassword=x',
        `-rpcport=${ports.rpcport}`,
        `-port=${ports.port}`,
        '-debug=net'
      ],
      {stdio: 'pipe'}
    );

    return {index, dataDir, ports, rpc};
  }

  spawnSyncPrint(id, cmd, arg, opt) {
    const proc = cp.spawn(cmd, arg, opt);

    proc.stdout.on('data', (data) => {
      this.printStdout(id, data);
    });

    proc.stderr.on('data', (data) => {
      this.printStdout(id, data);
    });

    proc.on('close', (code) => {
      return(code);
    });

    proc.on('error', (data) => {
      this.printStdout(id, data);
    });
  }

  printStdout(index, data) {
    const header = `${index}:  `;
    let str = data.toString();
    str = str.replace(/\n/g, `\n${header}`);
    str = header + str;
    console.log(`\x1b[${31 + index}m%s\x1b[0m`, str);
  }
}

module.exports = NodeFactory;
