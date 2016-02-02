function TracksBoard(bpmTimeline) {

	var _bpmTimeline = bpmTimeline || new BPMTimeline(120);
	var _tracks = new Set();
	var _controller = T("script", {numberOfInputs: 2, numberOfOutputs: 2, bufferSize: 4096});
	var _currentTime = 0;
	var _newTime = undefined;
	var _units = undefined;

	_controller.onaudioprocess = function(e) {
		var outputL = e.outputBuffer.getChannelData(0);
		var outputR = e.outputBuffer.getChannelData(1);
		var inputL = e.inputBuffer.getChannelData(0);
		var inputR = e.inputBuffer.getChannelData(1);
		for (var i = 0; i < 4096; i++) {
			outputL[i] = inputL[i];
			outputR[i] = inputR[i];
		}
		_currentTime += 4096 / e.outputBuffer.samplerate;
		if (_newTime !== undefined) {
			// if (_units == "seconds") {
			// 	T.fn.sys.tickID = Math.floor(_newTime / T.fn.currentTimeIncr);
			// } else if (_units == "beats") {
			// 	T.fn.sys.tickID = Math.floor(_bpmTimeline.time() 
			// } else {
			// 	throws new Error("Invalid time units.");
			// }
			// _newTime = T.fn.sys.tickID * T.fn.currentTimeIncr
			
			_tracks.forEach((track) => track.sequencer.set_current_time(_newTime, _units));
			_newTime = _units = undefined;
		}
	}
	


	Object.defineProperties(this, {
		"bpmTimeline" : {
			get : function() {
				return _bpmTimeline;
			}
		},
		"tracks" : {
			get : function() {
				var t = [];
				_tracks.forEach((track) => t.push(track));
				return t;
			}
		}, 
		"output" : {
			get : function() {
				return _controller;
			}
		}
	});

	this.play = function() {
		_controller.play();
	}

	this.pause = function() {
		_controller.pause();
	}
	
	this.add_track = function() {
		var track = new Track(_bpmTimeline);
		_tracks.add(track);
		track.output.appendTo(_controller);
	}

	this.remove_track = function(track) {
		if (_tracks.has(track)) {
			_tracks.delete(track);
			track.destroy();
			_controller.remove(track.output);
		}
	}

	this.set_current_time = function(newTime, units) {
		_newTime = newTime;
		_units = units;
	}

	this.get_current_time = function(units) {
		switch(units) {
			case "seconds": return _currentTime;
			case "beats": 
			default: return _bpmTimeline.beat(_currentTime);
		}
	}
}