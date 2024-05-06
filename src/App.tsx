import './App.css';
import React from 'react';

let didInit = false;

class App extends React.Component{

  public state={
    gainNode: undefined as unknown as GainNode,
    distortNode: undefined as unknown as WaveShaperNode,
    reverbNode: undefined as unknown as ConvolverNode,
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
      //And some other fun options
      const distortNode = this.state.audioCtx.createWaveShaper();
      const reverbNode = this.state.audioCtx.createConvolver();
      this.setState({gainNode, distortNode, reverbNode});
      //Connect all the nodes together
      track.connect(gainNode).connect(distortNode).connect(reverbNode).connect(this.state.audioCtx.destination);
    }
  }

  public async setReverb(fileName: string){
    if(fileName == ""){
      this.state.reverbNode.buffer = null;
    }else{
      await fetch(fileName)
        .then(async (response)=> {var file = await response.arrayBuffer();
          this.state.reverbNode.buffer = await this.state.audioCtx.decodeAudioData(file);
        }
      ).catch(()=> alert("File Not Found"));
    }
    this.setState({reverbNode: this.state.reverbNode});
  }

  public setDistortion(magnitude: number){
    const curve = new Float32Array(44100);
    const deg = Math.PI / 180;

    for (let i = 0; i < 44100; i++) {
      const x = (i * 2) / 44100 - 1;
      curve[i] = ((3 + magnitude) * x * 20 * deg) / (Math.PI + magnitude * Math.abs(x));
    }
    
    this.state.distortNode.curve = curve;
    this.setState({distortNode: this.state.distortNode});
  }

  public render(){
    return (
      <div className='container'>
      <h1>Audio Mixer 5000</h1>
      <h2 id="trackName"></h2>
      <div className='input-container'>
        <label htmlFor="volume">Volume</label>
        <input type="range" id="volume" name="volume" min="0" max="11" list="values" onChange={(e)=> { this.state.gainNode.gain.value = +e.currentTarget.value; this.setState({gainNode: this.state.gainNode})}}/>
        <datalist id="values">
            <option value="0" label="0"></option>
            <option value="5" label="5"></option>
            <option value="10" label="10"></option>
            <option value="11" label="11" id="eleven"></option>
        </datalist>
      </div>
      <div className='input-container'>
        <label htmlFor="distortion">Distortion</label>
        <input type="range" id="distortion" name="distortion" min="0" max="100" onChange={(e)=> { this.setDistortion(+e.currentTarget.value)}}/>
      </div>
      <div className='input-container'>
        <label htmlFor="reverb">Reverb</label>
        <select id="reverb" name="reverb" onChange={(e)=> { this.setReverb(e.target.value)}}>
          <option value="">None</option>
          <option value="park.mp3">Park</option>
          <option value="bus.mp3">Bus</option>
        </select>
      </div>
      <audio>
        <source src="nutcracker.mp3" type="audio/mpeg"/>
      </audio>
      <button
        role="switch"
        aria-checked={this.state.playing}
        onClick={async ()=>{
          if (this.state.audioCtx.state === "suspended") {
            this.state.audioCtx.resume();
          }

          alert(this.state.playing);

          try{
            const audioElement = document.querySelector("audio");
            if (!this.state.playing) {
              console.log("In here", audioElement);
              await audioElement?.play();
              console.log("Finished");
            } else{
              audioElement?.pause();
            }
            console.log("Set", !this.state.playing);
            this.setState({playing: !this.state.playing});
          } catch(err){
            console.log(err);
          }


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
