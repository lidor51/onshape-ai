import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';
import { syncBuiltinESMExports } from 'node:module';

const deny = () => { throw new Error('OFFLINE_NETWORK_DENIED'); };
globalThis.fetch = deny;
http.request = http.get = deny;
https.request = https.get = deny;
net.Socket.prototype.connect = deny;
tls.connect = deny;
syncBuiltinESMExports();