import React, { useEffect, useState, useRef, useCallback } from "react";
import "../Building/Building.css";
import Elevator from "../Elevator/Elevator";
import FloorButton from "../FloorButton/FloorButton";
import { manager } from "../../LoadManager";
import audio from "../../resources/elevator-ding.mp3";

const Abuild = (props) => {
  const { elevNum, floorNum } = props;
  const [floors, setFloors] = useState(
    Array.from({ length: floorNum }, (_, i) => ({
      Fid: i + 1,
      wait: false,
      arrive: false,
      hasEle: null,
    }))
  );
  const [elevators, setElev] = useState(
    Array.from({ length: elevNum }, (_, i) => ({
      Eid: i + 1,
      curFloor: floorNum - 1,
      busy: false,
      arrived: null,
      time: null,
    }))
  );

  const ERefs = useRef(
    Array.from({ length: elevNum }, (_, i) => ({
      Eid: i + 1,
      curFloor: floorNum - 1,
      busy: false,
      arrived: null,
      sentTo: floorNum - 1,
      time: null,
    }))
  );
  /* 
      params: floor index, floor ref
      return: return object if found elevatore, else push call to manger & return null
      calculate the closest distance to floor for all availabels elevators 
  */
  const getClosestEl = useCallback(
    (fInx, fRef) => {
      const availabels = ERefs.current.filter((el) => !el.busy && !el.arrived);

      if (availabels.length > 0) {
        let distances = availabels.map((elevator) => {
          return {
            Einx: elevator.Eid - 1,
            dist: Math.abs(elevator.curFloor - fInx),
          };
        });
        return distances.reduce((obj1, obj2) =>
          obj1.dist > obj2.dist ? obj2 : obj1
        );
      } else {
        manager.enqueue({ fInx: fInx, fRef: fRef });
        return null;
      }
    },
    [floors]
  );
  /* 
      params: elevator index, floor index
      return: nothing
      handles connection between el and floor
  */
  const asignElToFloor = useCallback((eInx, fInx) => {
    [ERefs.current[eInx].busy, ERefs.current[eInx].sentTo] = [true, fInx];
    floors[ERefs.current[eInx].Eid - 1].hasEle = false;

    setElev([...elevators]);
    setFloors([...floors]);
    manager.dequeue();
  });

  /* 
      params: elevator index
      return: nothing
      called when el reached floor. change relevant vars for elevators & floors
  */
  const reachedElToFloor = useCallback((eInx) => {
    let [curF, curE] = [ERefs.current[eInx].curFloor, ERefs.current[eInx]];
    [floors[curF].hasEle, floors[curF].wait, floors[curF].arrive] = [
      true,
      true,
      true,
    ];
    [curE.busy, curE.arrived] = [false, true];

    setFloors([...floors]);
    setElev([...elevators]);
    new Audio(audio).play();
  });

  /* 
      params: elevator index
      return: nothing
      set time out for elevator after reached floor + add sound.
      if there are more elevators in Queue call handleCall func with next floor.
    */
  const freeElevator = useCallback((eInx) => {
    reachedElToFloor(eInx, ERefs.current[eInx].curFloor);

    setTimeout(() => {
      let curF = ERefs.current[eInx].curFloor;
      [floors[curF].wait, floors[curF].arrive] = [false, false];
      [ERefs.current[eInx].busy, ERefs.current[eInx].arrived] = [false, false];

      setFloors([...floors]);
      setElev([...elevators]);
      if (!manager.isEmpty()) {
        handleCall(manager.peek().fInx, manager.peek().fRef);
      }
    }, 2000);
  });
  /* 
      params: elevator index, floor ref, time interval
      return: nothing
      * moving elevator to floor by changing dom attributes.
      * calculating the time left.
      * clearing interval and free elevatore to be called again if needed.
    */
  const moveElevator = useCallback((eInx, fRef, interval) => {
    let [eBox, fBox] = [
      ERefs.current[eInx].current.getBoundingClientRect().top,
      fRef.current.getBoundingClientRect().top,
    ];
    ERefs.current[eInx].time = handleTime(Math.abs(eBox - fBox));
    setElev([...elevators]);
    if (Math.abs(eBox - fBox) >= 3) {
      if (eBox > fBox) {
        ERefs.current[eInx].current.style.transform += `translateY(${-1}px)`;
      } else {
        ERefs.current[eInx].current.style.transform += `translateY(${1}px)`;
      }
    } else {
      ERefs.current[eInx].time = null;

      ERefs.current[eInx].curFloor = ERefs.current[eInx].sentTo;

      clearInterval(interval);

      freeElevator(eInx);
    }
  });

  const handleTime = useCallback((time) => {
    let min = Math.floor(time / 50);
    let sec = Math.floor(time % 60);
    return { min: min, sec: (sec < 10 ? "0" : "") + sec };
  });

  /* 
      params: floor index
      return: true- if floor is waiting or asked for el, false if floor has elevator already
      set time out for elevator after reached floor + add sound.
      if there are more elevators in Queue call handleCall func with next floor.
    */
  const floorRequest = useCallback((fInx) => {
    const elsInFloors = ERefs.current.filter(
      (el) => !el.busy && !el.arrived && el.curFloor === fInx
    );
    if (elsInFloors.length > 0) {
      return false;
    }
    if (!floors[fInx].wait) {
      floors[fInx].wait = true;
      setFloors([...floors]);
    }
    return true;
  });

  /* 
      params: floor index, floor ref
      return: nothing
      main functionalty, activated when btn pressed
    */
  const handleCall = useCallback((fInx, fRef) => {
    if (floorRequest(fInx)) {
      const available = getClosestEl(fInx, fRef);
      if (available) {
        asignElToFloor(available.Einx, fInx);
        let interval = setInterval(() => {
          moveElevator(available.Einx, fRef, interval);
        }, 10);
      }
    }
  }, []);

  const handleFloors = (floor) => {
    let f_end = floor % 10;
    return f_end === 1 ? "st" : f_end === 2 ? "nd" : f_end === 3 ? "rd" : "th";
  };
  return (
    <>
      <table className="building_container">
        <tbody className="table">
          {floors.map((floor, inx) => (
            <tr key={floor.Fid}>
              {floor.Fid == floorNum ? (
                <td className="btn-td">Ground Floor</td>
              ) : (
                <td className="btn-td">
                  {floorNum - floor.Fid}

                  {Math.abs(floor.Fid - floorNum) > 10
                    ? "th"
                    : handleFloors(Math.abs(floor.Fid - floorNum))}
                </td>
              )}

              {ERefs.current.map((el, i) => (
                <>
                  {el.curFloor === inx ? (
                    <td key={el.Eid}>
                      <div ref={el} key={el.Eid}>
                        <Elevator
                          id={i}
                          busy={el.busy}
                          arrived={el.arrived}
                          inFloor={el.curFloor === inx}
                        />
                      </div>
                    </td>
                  ) : (
                    <>
                      {el.time !== null && inx === el.sentTo ? (
                        <td>
                          {el.time.min} Min. {el.time.sec} Sec.
                        </td>
                      ) : (
                        <td></td>
                      )}
                    </>
                  )}
                </>
              ))}
              <td className="btn-td">
                <div className="call-Btn">
                  <FloorButton
                    id={floor.Fid}
                    wait={floor.wait}
                    arrive={floor.arrive}
                    Fid={floor.Fid}
                    handleCall={handleCall} //handleCall
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};
export default Abuild;
