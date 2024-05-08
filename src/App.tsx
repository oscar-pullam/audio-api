import './App.css';
import React from 'react';

let didInit = false;

class App extends React.Component{

  public state={
    gainNode: undefined as unknown as GainNode,
    distortNode: undefined as unknown as WaveShaperNode,
    reverbNode: undefined as unknown as ConvolverNode,
    originNode: undefined as unknown as MediaElementAudioSourceNode,
    audioCtx: new AudioContext(),
    playing: false
  }

  //On mount, load once
  public componentDidMount(): void {
    const audioElement = document.querySelector("audio");

    if(audioElement && !didInit){
      var track = this.state.audioCtx.createMediaElementSource(audioElement);
      didInit = true;
  
      // Create the node that controls the volume.
      const gainNode = new GainNode(this.state.audioCtx);
      const distortGainNode = new GainNode(this.state.audioCtx, {gain: 1})
      //And some other fun options
      const distortNode = this.state.audioCtx.createWaveShaper();
      distortNode.oversample = "4x";
      const reverbNode = this.state.audioCtx.createConvolver();
      this.setState({gainNode, distortNode, reverbNode, originNode: track});
      //Connect all the nodes together
      track.connect(distortNode).connect(distortGainNode).connect(gainNode).connect(this.state.audioCtx.destination);
    }
  }

  public async setReverb(fileName: string){
    if(fileName === ""){
      //Remove from node chain
      this.state.reverbNode.disconnect();
    }else{
      //Add to node chain
      await fetch(fileName)
        .then(async (response)=> {var file = await response.arrayBuffer();
          this.state.reverbNode.buffer = await this.state.audioCtx.decodeAudioData(file);
          this.state.distortNode.connect(this.state.reverbNode).connect(this.state.audioCtx.destination);
        }
      ).catch(()=> alert("File Not Found"));
    }
    this.setState({reverbNode: this.state.reverbNode});
  }

  public setDistortion(k: number){
    var n_samples = 44100;
    var curve = new Float32Array(n_samples);

    for ( var i = 0; i < n_samples; ++i ) {
        var x = i * 2 / n_samples - 1;
        curve[i] = (3 + k)*Math.atan(Math.sinh(x*0.25)*5) / (Math.PI + k * Math.abs(x));
    }

    this.state.distortNode.curve = curve;
    this.setState({distortNode: this.state.distortNode})
  }

  public render(){
    return (
      <div className='container'>
      <h1>Audio Mixer 5000</h1>
      <h2 id="trackName"></h2>
      <div className='input-container'>
        <label htmlFor="volume">Volume</label>
        <input type="range" id="volume" name="volume" min="0" max="11" step="0.1" list="values" onChange={(e)=> { this.state.gainNode.gain.value = +e.currentTarget.value; this.setState({gainNode: this.state.gainNode})}}/>
        <datalist id="values">
            <option value="0" label="0"></option>
            <option value="5" label="5"></option>
            <option value="10" label="10"></option>
            <option value="11" label="11" id="eleven"></option>
        </datalist>
      </div>
      <div className='input-container'>
        <label htmlFor="distortion">Distortion</label>
        <input type="range" id="distortion" name="distortion" min="0" max="200" onChange={(e)=> { this.setDistortion(+e.currentTarget.value)}}/>
      </div>
      <div className='input-container'>
        <label htmlFor="reverb">Reverb</label>
        <select id="reverb" name="reverb" onChange={(e)=> { this.setReverb(e.target.value)}}>
          <option value="">None</option>
          <option value="park.mp3">Park</option>
          <option value="bus.mp3">Bus</option>
        </select>
      </div>
      <audio loop>
        <source src="nutcracker.mp3" type="audio/mp3"></source>
      </audio>
      <button
        role="switch"
        aria-checked={this.state.playing}
        onClick={async ()=>{
          if (this.state.audioCtx.state === "suspended") {
            this.state.audioCtx.resume();
          }

          const audioElement = document.querySelector("audio");
          if (!this.state.playing) {
            await audioElement?.play();
            var e = document.getElementById("reverb") as HTMLSelectElement;
            this.setReverb(e.selectedOptions[0].value);
          } else{
            audioElement?.pause();
            this.setReverb("");
          }
          this.setState({playing: !this.state.playing});

        }}
      >
        {this.state.playing ? "Pause" : "Play"}
      </button>
      <div>{this.state.playing && "Now Playing Nutcracker March"}</div>
      </div>
    );
  }
}

export default App;
