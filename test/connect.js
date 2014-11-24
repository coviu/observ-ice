var freeice = require('freeice');
var ObservIce = require('..');
var test = require('tape');
var RTCPeerConnection = require('rtc-core/detect')('RTCPeerConnection');
var waitConnected = require('rtc-core/wait-connected');
var connections = [];
var observables = [];

test('create connections', function(t) {
  t.plan(1);
  connections[0] = new RTCPeerConnection({ iceServers: freeice() });
  connections[1] = new RTCPeerConnection({ iceServers: freeice() });
  t.equal(connections.length, 2);
});

test('create observable structures', function(t) {
  t.plan(2);
  observables = connections.map(ObservIce);
  t.equal(typeof observables[0], 'function');
  t.equal(typeof observables[1], 'function');
});

test('create offer', function(t) {
  t.plan(2);

  function monitorIce() {
    var stop;

    t.pass('local description set, monitoring ice');
    if (observables[0].gathered()) {
      return t.pass('gathered');
    }

    stop = observables[0].gathered(function(gathered) {
      stop();
      t.ok(gathered);
    });
  }

  connections[0].createDataChannel('test');
  connections[0].createOffer(function(desc) {
    connections[0].setLocalDescription(desc, monitorIce, t.fail);
  }, t.fail);
});

test('create answer', function(t) {
  t.plan(3);

  function createAnswer() {
    t.pass('remote description set');
    connections[1].createAnswer(function(desc) {
      connections[1].setLocalDescription(desc, monitorIce, t.fail);
    }, t.fail);
  }

  function monitorIce() {
    var stop;

    t.pass('local description set, monitoring ice');
    if (observables[1].gathered()) {
      return t.pass('gathered');
    }

    stop = observables[1].gathered(function(gathered) {
      stop();
      t.ok(gathered);
    });
  }

  connections[1].setRemoteDescription(connections[0].localDescription, createAnswer, t.fail);
});

test('validate connection', function(t) {
  t.plan(2);
  waitConnected(connections[0], t.pass.bind(t, 'connection:0 connected'));
  waitConnected(connections[1], t.pass.bind(t, 'connection:1 connected'));

  connections[0].setRemoteDescription(connections[1].localDescription);
});
