import './App.css';
import React from 'react';

let didInit = false;
const WIDTH = 600;
const HEIGHT = 900;

class App extends React.Component{

  public state={
    gainNode: undefined as unknown as GainNode,
    distortNode: undefined as unknown as WaveShaperNode,
    reverbNode: undefined as unknown as ConvolverNode,
    originNode: undefined as unknown as MediaElementAudioSourceNode,
    visualNode: undefined as unknown as AnalyserNode,
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
      distortNode.oversample = "4x";
      //Make sure the distortion doesn't get too loud
      const distortGainNode = new GainNode(this.state.audioCtx, {gain: 0.5})
      const reverbNode = this.state.audioCtx.createConvolver();
      //Node for retrieving visualization data
      const visualNode = this.state.audioCtx.createAnalyser();
      visualNode.fftSize = 1024;
      this.setState({gainNode, distortNode, reverbNode, visualNode, originNode: track});
      //Connect all the nodes together
      track.connect(distortNode).connect(distortGainNode).connect(gainNode).connect(visualNode).connect(this.state.audioCtx.destination);
      this.visualize();
    }
  }

  public async setReverb(fileName: string){
    if(fileName === ""){
      //Remove from node chain
      this.state.reverbNode.disconnect();
    }else{
      //Get the audio file
      await fetch(fileName)
        .then(async (response)=> {
          var file = await response.arrayBuffer();
          this.state.reverbNode.buffer = await this.state.audioCtx.decodeAudioData(file);
          //Add to node chain
          this.state.distortNode.connect(this.state.reverbNode).connect(this.state.audioCtx.destination);
        }
      ).catch(()=> alert("File Not Found"));
    }
    this.setState({reverbNode: this.state.reverbNode});
    this.visualize();
  }

  public setDistortion(k: number){
    var n_samples = 44100;
    var curve = new Float32Array(n_samples);

    for ( var i = 0; i < n_samples; ++i ) {
      var x = i * 2 / n_samples - 1;
      //Do some math to get the sigmoid curve
      curve[i] = (3 + k)*Math.atan(Math.sinh(x*0.25)*5) / (Math.PI + k * Math.abs(x));
    }

    this.state.distortNode.curve = curve;
    this.setState({distortNode: this.state.distortNode});
    this.visualize();
  }

  public draw(dataArray: Uint8Array, canvasCtx: CanvasRenderingContext2D){
    //Clear the canvas
    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
  
    //Loop
    requestAnimationFrame(() => this.draw(dataArray, canvasCtx));

    //Get the data
    this.state.visualNode.getByteTimeDomainData(dataArray);

    //Set the background color
    canvasCtx.fillStyle = "rgb(208, 248, 144)";
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    //Line settings
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = "rgb(255, 255, 255)";

    canvasCtx.beginPath();

    const sliceWidth = (WIDTH * 1.0) / 1024;
    let x = 0;

    //Do the drawing
    for (let i = 0; i < 1024; i++) {
      const y = (dataArray[i] * HEIGHT / 128.0) / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(WIDTH, HEIGHT / 2);
    canvasCtx.stroke();
  }

  public visualize() {

    const dataArray = new Uint8Array(1024);
    var canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const canvasCtx = canvas?.getContext("2d");

    if(canvasCtx && this.state.visualNode){
      this.draw(dataArray, canvasCtx);
    }

  }

  public render(){
    return (
      <>
      <div className="wrapper">
      <div className='container'>
      <h1>Audio Mixer 5000</h1>
      <div className='input-container'>
        <label htmlFor="volume">Volume</label>
        <input type="range" id="volume" name="volume" min="0" max="11" step="0.1" defaultValue="1" list="values" onChange={(e)=> { this.state.gainNode.gain.value = +e.currentTarget.value; this.setState({gainNode: this.state.gainNode}); this.visualize();}}/>
        <datalist id="values">
            <option value="0" label="0" style={{paddingRight: "68px"}}></option>
            <option value="5" label="5" style={{paddingRight: "60px"}}></option>
            <option value="10" label="10"></option>
            <option value="11" label="11" id="eleven"></option>
        </datalist>
      </div>
      <div className='input-container'>
        <label htmlFor="distortion">Distortion</label>
        <input type="range" id="distortion" defaultValue="0" name="distortion" min="0" max="200" onChange={(e)=> { this.setDistortion(+e.currentTarget.value)}}/>
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
      <canvas id="canvas" width={WIDTH} height={HEIGHT}></canvas>
      </div>
      <div className='container'>
        <figure>
        <img src="sigmoid.png" alt="Sigmoid curve" width="320px"/>
        <figcaption>Sigmoid curve used to generate distortion</figcaption>
        </figure>
      </div>
      </div>
      </>
    );
  }
}

export default App;
