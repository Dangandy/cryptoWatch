const axios = require("axios");

async function getBook() {
  try {
    // variables
    let lPoints = [];
    let sPoints = [];

    const { data } = await axios.get(
      `https://api-pub.bitfinex.com/v2/book/tBTCUSD/P2?len=100`
    );

    const lBook = data.slice(0, 100);
    const sBook = data.slice(100);

    for await (const order of lBook) {
      const [price, _, amount] = await order;
      const pAmount = (await lPoints[lPoints.length - 1])
        ? lPoints[lPoints.length - 1].y
        : 0; // previous amount
      lPoints.push({
        x: price,
        y: amount + pAmount
      });
    }

    for await (const order of sBook) {
      const [price, _, amount] = await order;
      const pAmount = (await sPoints[sPoints.length - 1])
        ? sPoints[sPoints.length - 1].y
        : 0;
      sPoints.push({
        x: price,
        y: amount * -1 + pAmount
      });
    }

    console.log(
      await `lBook: ${JSON.stringify(lPoints)} \n\n sBook: ${JSON.stringify(
        sPoints
      )}`
    );
  } catch (error) {
    console.error(error);
  }
}

getBook();
