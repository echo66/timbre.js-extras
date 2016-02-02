(function(T) {
	"use strict";

	// {defaultValue: Number, bpmTimeline: BPMTimeline}
	function AudioParamNode(_args) {
		T.Object.call(this, 2, _args);

		var _ = this._;

		_.units = 'beats';

		_.plotFlush = true;
		_.ar = false;
	}
	timbre.fn.extend(AudioParamNode);

	var $ = AudioParamNode.prototype;

	Object.defineProperties($, {
		bpmTimeline : {
			get : function() {
				return this._.bpmTimeline;
			}, 
			set : function(value) {
				this._.bpmTimeline = value;
			}
		}, 
		automation : {
			get : function() {
				return this._.automation;
			}, 
			set : function(value) {
				this._.automation = value;
			}
		}, 
		units : {
			get : function() {
				return this._.units;
			}
		}, 
		defaultValue : {
			get : function() {
				return this._.automation.value();
			}, 
			set : function(value) {
				if (this._automation)
					this._.automation.setValue(value);
				else {
					this._.automation = new Timeline(value);
					this._.automation.setValueAtTime(value, 0);
				}
			}
		}
	});

	$.setValueAtTime = function(value, startTime) {
		this._.automation.setValueAtTime(value, startTime);
		this._.plotFlush = true;
	};

	$.linearRampToValueAtTime = function(value, endTime) {
		this._.automation.linearRampToValueAtTime(value, endTime);
		this._.plotFlush = true;
	};

	$.exponentialRampToValueAtTime = function(value, endTime) {
		this._.automation.exponentialRampToValueAtTime(value, endTime);
		this._.plotFlush = true;
	};

	$.setTargetAtTime = function(value, startTime, timeConstant) {
		this._.automation.setTargetAtTime(value, startTime, timeConstant);
		this._.plotFlush = true;
	};

	$.setValueCurveAtTime = function(value, startTime, duration) {
		this._.automation.setValueCurveAtTime(value, startTime, duration);
		this._.plotFlush = true;
	};

	$.cancelScheduledValues = function(time) {
		this._.automation.cancelScheduledValues(time);
		if (this._.automation.events.length == 0) 
			this._.automation.setValueAtTime(this._.automation.value(), 0);
		this._.plotFlush = true;
	};

	$.cancelAllEvents = function() {
		this._.automation.cancelAllEvents();
		this._.automation.setValueAtTime(this._.automation.value(), 0);
		this._.plotFlush = true;
	};

	$.process = function(tickID) {
		var _ = this._;
		if (this.tickID !== tickID) {
			this.tickID = tickID;

			var cellL = this.cells[1];
			var cellR = this.cells[2];
			var i, imax = _.cellsize;

			var currentTime = tickID * _.cellsize / _.samplerate;

			if (this.nodes.length) {
				timbre.fn.inputSignalAR(this);
			} else {
				for (i = 0; i < imax; ++i) {
					cellL[i] = cellR[i] = 1;
				}
			}

			if (_.ar) {
				for (i = 0; i < imax; ++i) {
					currentTime += imax / _.samplerate;
					var beat = this.bpmTimeline.beat(currentTime);
					var value = _.automation.getValueAtTime(beat);
					cellL[i] *= value;
					cellR[i] *= value;
				}
			} else {
				var beat = this.bpmTimeline.beat(currentTime);
				var value = _.automation.getValueAtTime(beat);
				for (i = 0; i < imax; ++i) {
					cellL[i] *= value;
					cellR[i] *= value;
				}
			}

			timbre.fn.outputSignalAR(this);
		}

		return this;
	}

	$.plot = function(opts) {
		var _ = this;
		if (_.plotFlush) {
			var data = new Float32Array(128);
			// TODO
			_.plotData  = data;
			_.plotRange = [0, 1];
			_.plotFlush = null;
		}
		return super_plot.call(this, opts);
		// TODO
	}

	timbre.fn.register("audio-param", AudioParamNode);
})(timbre);