document.addEventListener("DOMContentLoaded", ()=>{
    // Connect to the WebSocket
    const socket = new WebSocket("wss://stream.data.alpaca.markets/v1beta1/news"); // Replace with your WebSocket URL
    // Handle incoming messages from the WebSocket
    socket.addEventListener("message", (event)=>{
        const newsData = JSON.parse(event.data);
        // Call a function to update the UI with the news data
        updateNewsUI(newsData);
    });
    // Handle WebSocket errors
    socket.addEventListener("error", (event)=>{
        console.error("WebSocket Error:", event);
    });
    // Handle WebSocket close event
    socket.addEventListener("close", (event)=>{
        console.log("WebSocket Closed:", event);
    });
});
// Function to update the UI with news data
function updateNewsUI(newsData) {
    const newsContainer = document.getElementById("news-container");
    // Clear previous content
    newsContainer.innerHTML = "";
    // Iterate through the news items and create HTML elements
    newsData.forEach((newsItem)=>{
        const newsElement = document.createElement("div");
        newsElement.innerHTML = `<h3>${newsItem.headline}</h3><p>${newsItem.summary}</p>`;
        newsContainer.appendChild(newsElement);
    });
}

//# sourceMappingURL=index.7c0ccee6.js.map
