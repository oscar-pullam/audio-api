import './App.css';
import React from 'react';

let didInit = false;

class App extends React.Component{

  public state={
    gainNode: undefined,
    distortNode: undefined,
    convolverNode: undefined
  }

  //On mount, load once
  public componentDidMount(): void {
    const audioElement = document.querySelector("audio");
    var audioCtx = new AudioContext();

    if(audioElement && !didInit){
      var track = audioCtx.createMediaElementSource(audioElement);
      didInit = true;
  
      // Create the node that controls the volume.
      const gainNode = new GainNode(audioCtx);
      //And some other fun options
      const distortNode = audioCtx.createWaveShaper();
      const reverbNode = audioCtx.createConvolver();
      //Connect all the nodes together
      track.connect(gainNode).connect(distortNode).connect(reverbNode).connect(audioCtx.destination);
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
      <audio src="outfoxing.mp3" crossOrigin="anonymous"></audio>
      <button
        data-playing="false"
        role="switch"
        aria-checked="false"
      >
        <span>Play/Pause</span>
      </button>
      </div>
    );
  }
}

export default App;
