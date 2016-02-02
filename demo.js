var audioCtx = new AudioContext();

var bpmTimeline = new BPMTimeline(110);
// bpmTimeline.add_tempo_marker({type:'linear', endTempo: 140, endBeat: 10});

var tb = new TracksBoard(bpmTimeline);

tb.add_track();
tb.add_track();

var paths = [
	{
		beats : "../../OLA-TS.js/14.%20Too%20Long.json", 
		audio : "../../OLA-TS.js/14.%20Too%20Long.mp3"
	}, 
	{
		beats : "../../OLA-TS.js/07.%20Around%20The%20World.json", 
		audio : "../../OLA-TS.js/07.%20Around%20The%20World.mp3"
	}, 
	{
		beats : "../../OLA-TS.js/10.%20Voyager.json", 
		audio : "../../OLA-TS.js/10.%20Voyager.mp3"
	}, 
	{
		beats : "../../OLA-TS.js/07.%20Superheroes.json", 
		audio : "../../OLA-TS.js/07.%20Superheroes.mp3"
	}, 
];


// load_audio_data(audioCtx, paths[0].audio, paths[0].beats, (audioBuffer, beatsData) => {
// 	beatsData.forEach((e,i) => {
// 		beatsData[i] = beatsData[i][0];
// 	});
// 	var s = new BeatGridSegment({
// 		id: 'meu', 
// 		beatGrid: new BeatGrid(beatsData), 
// 		startGrid: 128, 
// 		start: 0, end: 32, 
// 		audioBuffer: audioBuffer
// 	});
// 	tb.tracks[0].sequencer.add_segment_2(s);
// 	console.log("loaded 1");

// 	var reverb = T("reverb", {room:0.9, damp:0.2, mix:0.0});
// 	tb.tracks[0].add_device(reverb);
// 	tb.tracks[0].set_automated_parameter(reverb, [{id: 'mix', defaultValue: 0, min: 0, max: 1}]);
// 	reverb.mix.linearRampToValueAtTime(1, 20);
// });

var bitcrusher;
load_audio_data(audioCtx, paths[1].audio, paths[1].beats, (audioBuffer, beatsData) => {
	beatsData.forEach((e,i) => {
		beatsData[i] = beatsData[i][0];
	});
	var s = new BeatGridSegment({
		id: 'meu', 
		beatGrid: new BeatGrid(beatsData), 
		startGrid: 128, 
		start: 0, end: 32, 
		audioBuffer: audioBuffer
	});
	tb.tracks[1].sequencer.add_segment_2(s);
	console.log("loaded 2");

	bitCrusher = T("bitcrusher", {bits:16, frequencyReduction:0.14})
	tb.tracks[1].add_device(bitCrusher);
});