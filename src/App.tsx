import './App.css';
import React from 'react';

let didInit = false;

class App extends React.Component{

  public state={
    gainNode: undefined,
    distortNode: undefined,
    convolverNode: undefined,
    audioCtx: new AudioContext(),
    playing: true
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
      //Connect all the nodes together
      track.connect(gainNode).connect(distortNode).connect(reverbNode).connect(this.state.audioCtx.destination);
    }
  }

  public render(){
    return (
      <div>
      <h1>Audio Mixer 5000</h1>
      <h2 id="trackName"></h2>
      <div>
        <input type="range" id="volume" name="volume" min="0" max="11" list="values" />
        <label htmlFor="volume">Volume</label>
        <datalist id="values">
            <option value="0" label="0"></option>
            <option value="5" label="5"></option>
            <option value="10" label="10"></option>
            <option value="11" label="11" id="eleven"></option>
        </datalist>
      </div>
      <div>
        <input type="range" id="distortion" name="distortion" min="0" max="100" />
        <label htmlFor="distortion">Distortion</label>
      </div>
      <div>
        <input type="range" id="reverb" name="reverb" min="0" max="100" />
        <label htmlFor="reverb">Reverb</label>
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

          const audioElement = document.querySelector("audio");
          if (!this.state.playing) {
            await audioElement?.play();
          } else{
            audioElement?.pause();
          }
          this.setState({playing: !this.state.playing});
        }}
      >
        Play/Pause
      </button>
      </div>
    );
  }
}

export default App;
