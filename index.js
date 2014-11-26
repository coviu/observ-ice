var ObservStruct = require('observ-struct');
var ObservArray = require('observ-array');
var Observ = require('observ');

/**
  # observ-ice

  An observable [structure](https://github.com/Raynos/observ-struct) for the
  ice candidates and gathering state of an `RTCPeerConnection`.

  ## Example Usage

  To be completed.

**/
module.exports = function(pc) {
  var gathered = Observ(false);
  var candidates = ObservArray([]);

  function handleCandidate(evt) {
    if (! evt) {
      return;
    }

    if (evt.candidate) {
      // if we believe we have finished gathering candidates, we were
      // obsviously mistaken.
      if (gathered()) {
        gathered.set(false);
      }

      return candidates.push(ObservStruct(evt.candidate));
    }

    gathered.set(true);
  }

  if (typeof pc.addEventListener == 'function') {
    pc.addEventListener('icecandidate', handleCandidate);
  }
  else {
    pc.onicecandidate = handleCandidate;
  }

  return ObservStruct({
    candidates: candidates,
    gathered: gathered
  });
};
