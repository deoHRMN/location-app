import React, { useState } from 'react';
import MapComponent from './MapComponent';
import './App.css';

const App = () => {
  const [distance, setDistance] = useState(null);  // State to hold distance to KPU Surrey Library
  const [loading, setLoading] = useState(true);   // State to track loading state

  return (
    <div className="App">
      <h1>
        {loading ? "Loading..." : `Distance to KPU Surrey Library: ${distance.toFixed(2)} km`}  {/* Display loading or distance */}
      </h1>
      <MapComponent setDistance={setDistance} setLoading={setLoading} />  {/* Pass state setters as props to MapComponent */}
    </div>
  );
};

export default App;
