const ws = require("ws");
const Koa = require("koa");
const Router = require("koa-router");

const app = new Koa();
const w = new ws("wss://api-pub.bitfinex.com/ws/2");
const router = new Router();

router.get("/data", (ctx, next) => {
  ctx.body = {
    status: "success",
    json: JSON.stringify([...myMap])
  };
});

app.use(router.routes()).use(router.allowedMethods());

let FIRST = true;
let myMap = new Map();

function connect() {
  let msg = JSON.stringify({
    event: "subscribe",
    channel: "book",
    symbol: "tBTCUSD",
    prec: "P2",
    len: "100"
  });

  w.on("open", () => w.send(msg));

  w.on("message", msg => {
    msg = JSON.parse(msg);
    if (msg.event) return; // first 2 msgs
    if (msg[1] === "hb") {
      return; // heartbleed
    } else {
      if (FIRST) {
        //add to book
        for (const order of msg[1]) {
          const [price, _, amount] = order;
          myMap.set(price, { price: price, amount: amount });
        }
        FIRST = false;
        console.log("initiated");
      } else {
        const [price, _, amount] = msg[1];
        myMap.set(price, { price: price, amount: amount });
      }
    }
    // console.log(myMap);
  });
}

connect();
app.listen(4000);
