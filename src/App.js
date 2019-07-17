import React, { useState, useEffect, useRef } from "react";
import Chart from "chart.js";
import axios from "axios";

// async function parseBook() {
//   try {

//

//   } catch (error) {
//     console.error(error);
//   }
// }

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(
    () => {
      savedCallback.current = callback;
    },
    [callback]
  );

  // Set up the interval.
  useEffect(
    () => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    },
    [delay]
  );
}

function App() {
  const [lBook, setLBook] = useState();
  const [sBook, setSBook] = useState();

  useEffect(
    () => {
      var ctx = document.getElementById("myChart").getContext("2d");
      var myChart = new Chart(ctx, {
        type: "line",
        data: {
          datasets: [
            {
              steppedLine: true,
              label: "Longs",
              data: lBook,
              backgroundColor: "#a9dd9d",
              pointBackgroundColor: "#54734d"
            },
            {
              steppedLine: true,
              label: "Shorts",
              data: sBook,
              backgroundColor: "#fd8489",
              pointBackgroundColor: "#6e383a"
            }
          ]
        },
        options: {
          scales: {
            yAxes: [
              {
                type: "linear",
                scaleLabel: {
                  display: true,
                  labelString: "Volume"
                }
              }
            ],
            xAxes: [
              {
                type: "linear",
                scaleLabel: {
                  display: true,
                  labelString: "Price"
                }
              }
            ]
          }
        }
      });
    },
    [lBook]
  );

  useEffect(
    () => {
      async function updateState() {
        try {
          // variables
          let lPoints = [];
          let sPoints = [];

          const { data } = await axios.get("/data");
          const book = JSON.parse(data.json);

          const lBook = await Promise.all(
            book.filter(item => item[1].amount > 0)
          );
          const sLBook = await lBook.sort().reverse();

          const sBook = await Promise.all(
            book.filter(item => item[1].amount < 0)
          );
          const sSBook = await sBook.sort(function(a, b) {
            return a[1][0] - b[1][0];
          });

          for await (const order of sLBook) {
            const { price, amount } = await order[1];
            const pAmount = (await lPoints[lPoints.length - 1])
              ? lPoints[lPoints.length - 1].y
              : 0; // previous amount
            lPoints.push({
              x: price,
              y: amount + pAmount
            });
          }

          for await (const order of sSBook) {
            const { price, amount } = await order[1];
            const pAmount = (await sPoints[sPoints.length - 1])
              ? sPoints[sPoints.length - 1].y
              : 0; // previous amount
            // significant digit rounding skews chart
            if (pAmount < lPoints[lPoints.length - 1].y) {
              sPoints.push({
                x: price,
                y: amount * -1 + pAmount
              });
            }
          }

          setSBook(sPoints);
          setLBook(lPoints);
        } catch (error) {
          console.log(error);
        }
      }
      updateState();
    },
    [1]
  );

  return (
    <>
      <canvas id="myChart" width="50%" height="50%" />
    </>
  );
}

export default App;
