var ObservStruct = require('observ-struct');
var ObservArray = require('observ-array');
var Observ = require('observ');

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

  pc.addEventListener('icecandidate', handleCandidate);

  return ObservStruct({
    candidates: candidates,
    gathered: gathered
  });
};
