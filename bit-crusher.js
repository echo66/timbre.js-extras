// define
(function() {
  "use strict";

  function BitCrusherNode(_args) {
    timbre.Object.call(this, 2, _args);

    this._.bits = T(8);
    this._.frequencyReduction = T(0.5);
    this._.phasers = [0,0];
    this._.lastDataValues = [0,0];
  }
  timbre.fn.extend(BitCrusherNode);

  Object.defineProperties(BitCrusherNode.prototype, {
    bits: {
        set: function(value) {
            this._.bits = T(value);
        },
        get: function() {
            return this._.bits;
        }
    },
    frequencyReduction: {
        set: function(value) {
            this._.frequencyReduction = T(value);
        },
        get: function() {
            return this._.frequencyReduction;
        }
    },
  });

  BitCrusherNode.prototype.process = function(tickID) {
    if (this.tickID !== tickID) {
      this.tickID = tickID;

      timbre.fn.inputSignalAR(this);

      var cellL = this.cells[1]; // left channel
      var cellR = this.cells[2]; // right channel

      var bufferLength = this._.cellsize;
      var bits = this._.bits.process(tickID).cells[0][0];
      var frequencyReduction = this._.frequencyReduction.process(tickID).cells[0][0];

      for (var i = 0; i < bufferLength; i++) {
        // var bits = this._.bits.process(tickID).cells[0][0];
        // var frequencyReduction = this._.frequencyReduction.process(tickID).cells[0][0];
        var step = Math.pow(1 / 2, bits);

        this._.phasers[0] += frequencyReduction;
        this._.phasers[1] += frequencyReduction;

        if (this._.phasers[0] >= 1.0) {
          this._.phasers[0] -= 1.0;
          this._.phasers[1] -= 1.0;
          this._.lastDataValues[0] = step * Math.floor(cellL[i] / step + 0.5);
          this._.lastDataValues[1] = step * Math.floor(cellR[i] / step + 0.5);
        }

        cellL[i] = this._.lastDataValues[0];
        cellR[i] = this._.lastDataValues[1];
      }

      timbre.fn.outputSignalAR(this);
    }
    return this;
  };

  timbre.fn.register("bitcrusher", BitCrusherNode);
})();