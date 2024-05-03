import './App.css';

function App() {
  return (
    <div>
    <h1>Audio Mixer 5000</h1>
    <h2 id="trackName"></h2>
    <div>
        <input type="range" id="volume" name="volume" min="0" max="11" list="values" />
        <label for="volume">Volume</label>
        <datalist id="values">
            <option value="0" label="0"></option>
            <option value="5" label="5"></option>
            <option value="10" label="10"></option>
            <option value="11" label="11" id="eleven"></option>
        </datalist>
      </div>
    </div>
  );
}

export default App;
