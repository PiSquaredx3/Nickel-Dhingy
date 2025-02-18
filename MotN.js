// Just put your MotN in this const
const sentences = [
    "Look Mom I CAN CODE IN JS",
    "Wait you actually want us to play music??",
    "Every 60 seconds, a minute passes in Africa",
    "Hi retrodev",
    "Ask me about Earthbound, please I need someone to talk to",
    "Neymar Jr. Add me on Steam, I don't care about Football I just like your csgo inventory"
];




// Don't touch this
// Function to set a random sentence
function setRandomSentence() {
    const randomIndex = Math.floor(Math.random() * sentences.length); // Get a random index
    const randomSentence = sentences[randomIndex]; // Select a random sentence
    document.querySelector('#motn p').textContent = randomSentence; // Set the sentence in the <p> tag
}

// Call the function to set the random sentence when the page loads
window.onload = setRandomSentence;
