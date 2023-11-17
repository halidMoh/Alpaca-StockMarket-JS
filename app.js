const Alpaca = require("@alpacahq/alpaca-trade-api");
const WebSocket = require("ws");
const http = require("http");

const alpaca = new Alpaca();

// Create a simple HTTP server to serve the client-side HTML and JS
const server = http.createServer((req, res) => {
  // Serve your HTML file or any other static files here if needed
  // For simplicity, let's just respond with a basic message
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("WebSocket server running");
});

// WebSocket server setup
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.on("message", (message) => {
    console.log("Received message from client:", message);

    // Parse the JSON message
    let order;
    try {
      order = JSON.parse(message);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return;
    }

    // Place the order in Alpaca
    alpaca
      .createOrder(order)
      .then((response) => {
        console.log("Order placed:", response);
        ws.send(JSON.stringify(response));
      })
      .catch((error) => {
        console.error("Error placing order:", error);
        ws.send(JSON.stringify({ error: error.message }));
      });
  });
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

wss.on("listening", () => {
  console.log("WebSocket server listening on port 3000");
});

// WebSocket connection to Alpaca
const alpacaWebSocket = new WebSocket(
  "wss://stream.data.alpaca.markets/v1beta1/news"
);

alpacaWebSocket.on("open", function () {
  console.log("Connected to Alpaca WebSocket");

  // Authenticate with Alpaca
  const authMsg = {
    action: "auth",
    key: process.env.APCA_API_KEY_ID,
    secret: process.env.APCA_API_SECRET_KEY,
  };

  alpacaWebSocket.send(JSON.stringify(authMsg));

  // Subscribe to news
  const subscribeMsg = {
    action: "subscribe",
    news: ["*"],
  };

  alpacaWebSocket.send(JSON.stringify(subscribeMsg));
});

alpacaWebSocket.on("message", async function (message) {
  console.log("Received message from Alpaca:", message);

  let currentEvent;
  try {
    currentEvent = JSON.parse(message)[0];
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return;
  }

  if (currentEvent.T === "n") {
    console.log("The Headline is", currentEvent.headline);
    console.log("The Summary is", currentEvent.summary);
    console.log();

    // Send news data to connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(currentEvent));
      }
    });
  }
});

// Start the HTTP server on port 3000
server.listen(3000, () => {
  console.log("HTTP server listening on port 3000");
});
