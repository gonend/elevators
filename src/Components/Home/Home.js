import React, { useState } from "react";
import Building from "../Building/Building";

import "./Home.css";

function HomePage() {
  const [floorNum, setFloorNum] = useState("10");
  const [elevNum, setElevNum] = useState("5");
  const [showBuilding, setBuilding] = useState(false);

  const handleFloorsChange = (e) => {
    if (e.target.value > 0) {
      setFloorNum(e.target.value);
    }
  };

  const handleElevChange = (e) => {
    if (e.target.value > 0) {
      setElevNum(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(`#floors: ${floorNum}, #elevators: ${elevNum}`);
    setBuilding(true);
  };

  return (
    <div className="container">
      {showBuilding === false ? (
        <>
          <div className="box">
            <h1>Welcome!</h1>
            <h2>Please enter # elevators and floors</h2>
            <form onSubmit={handleSubmit}>
              <label className="input">floors:</label>
              <input
                type="text"
                id="floors"
                name="floors"
                value={floorNum}
                onChange={handleFloorsChange}
              />
              <br />
              <label className="input">elevators:</label>
              <input
                type="text"
                id="elev"
                name="elev"
                value={elevNum}
                onChange={handleElevChange}
              />
              <br />
              <button type="submit">Submit</button>
            </form>
          </div>
        </>
      ) : (
        // <Building elevNum={elevNum} floorNum={floorNum} />
        <Building elevNum={elevNum} floorNum={floorNum} />
      )}
    </div>
  );
}

export default HomePage;
