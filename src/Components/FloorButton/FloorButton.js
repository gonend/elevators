import { useRef } from "react";
import "./FloorButton.css";

const FloorButton = (props) => {
  const { Fid, handleCall, wait, arrive } = props;

  const fRef = useRef(null);

  const style = !wait
    ? { name: "Call", state: "green" }
    : !arrive
    ? { name: "Waiting", state: "red" }
    : { name: "Arrived", state: "arrive" };
  //handleCall(btnRef, id)}

  return (
    <div ref={fRef} className="floor_container">
      {!wait ? (
        <button
          className="float"
          onClick={() => handleCall(Fid - 1, fRef)}
          id={style.state}
        >
          {style.name}
        </button>
      ) : (
        <button className="float" id={style.state}>
          {style.name}
        </button>
      )}
      {/* {nElev >= 0 && (
        <div className="numberOfElevators float">{nElev} elevators left</div>
      )} */}
    </div>
  );
};
export default FloorButton;
