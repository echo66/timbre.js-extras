function Track(bpmTimeline) {

	var _bpmTimeline = bpmTimeline;

	var _devicesPipeline = [];
	var _automatedParameters = new Map();
	var _segmentsSequencer = new SegmentsSequencer({ frameSize: 4096, bufferSize: 4096, bpmTimeline: _bpmTimeline });

	var _player = T("script", {numberOfOutputs: 2, bufferSize: 4096});
	_player.onaudioprocess = function(e) {
		_segmentsSequencer.generate_block(e.outputBuffer);
	}
	var _masterGain = T("*", _player);



	Object.defineProperties(this, {
		"bpmTimeline" : {
			get : function() { return _bpmTimeline; }
		},
		"output" : {
			get : function() { return _masterGain; }
		}, 
		"sequencer" : {
			get : function() { return _segmentsSequencer; }
		}, 
		"pipeline" : {
			get : function() { return [_player].concat(_devicesPipeline).concat([_masterGain]); }
		}
	});



	this.play = function() {
		_masterGain.play();
	}

	this.pause = function() {
		_masterGain.pause();
	}

	function connectPipeline() {
		_player.removeAll();
		_masterGain.removeAll();
		if (_devicesPipeline.length > 0) {
			_devicesPipeline[0].removeAll();
			_player.appendTo(_devicesPipeline[0]);
			for (var i=1; i < _devicesPipeline.length; i++) {
				_devicesPipeline[i].removeAll();
				_devicesPipeline[i-1].appendTo(_devicesPipeline[i])
			}
			_masterGain.append(_devicesPipeline[_devicesPipeline.length-1]);
		} else {
			_player.appendTo(_masterGain);
		}
	}

	function disconnectPipeline() {
		_player.removeAll();
		_masterGain.removeAll();
		for (var i=0; i < _devicesPipeline.length-1; i++) 
			_devicesPipeline[i].removeAll();
	}

	this.destroy = function() {
		disconnectPipeline();
		_bpmTimeline = undefined;
		_devicesPipeline = undefined;
		_automatedParameters.clear();
		_segmentsSequencer = undefined;
		_player = undefined;
		_masterGain = undefined;
	}

	this.get_automated_params = function(device) {
		return _automatedParameters;
	}

	this.set_automated_parameter = function(device, paramsDefs) {
		var idx = _devicesPipeline.indexOf(device);
		if (idx !== -1) {
			paramsDefs.forEach((paramDef) => {
				var param;
				if (!_automatedParameters.get(device).get(paramDef.id)) {
					_automatedParameters.get(device)
				}
				var obj = {
					id: paramDef.id, 
					defaultValue: paramDef.defaultValue, 
					min: paramDef.min, 
					max: paramDef.max, 
					param: T("audio-param", { defaultValue: paramDef.defaultValue, bpmTimeline: _bpmTimeline })
				};
				_automatedParameters.get(device).set(obj.id, obj);
				device[obj.id] = obj.param;
			});
		}
	}

	this.add_device = function(device, index) {
		var idx = _devicesPipeline.indexOf(device);
		if (idx !== -1) {
			device = _devicesPipeline.splice(idx, 1);
		} else {
			_automatedParameters.set(device, new Map());
		}
		if (index !== undefined)
			_devicesPipeline.splice(index, 0, device);
		else 
			_devicesPipeline[_devicesPipeline.length] = device;
		connectPipeline();
	}

	this.remove_device = function(device) {
		var idx = _devicesPipeline.indexOf(device);
		if (idx !== -1) {
			_automatedParameters.delete(device);
			device = _devicesPipeline.splice(idx, 1);
			connectPipeline();
		}
	}

	this.get_devices = function() {
		return new Set(_devicesPipeline);
	}
}