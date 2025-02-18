// Just put your MotN in this const
const sentences = [
    "Look Mom I CAN CODE IN JS",
    "Wait you actually want us to play music??",
    "Every 60 seconds, a minute passes in Africa",
    "Hi retrodev",
    "Ask me about Earthbound, please I need someone to talk to",
    "Neymar Jr. Add me on Steam, I don't care about Football I just like your csgo inventory",
    "Bad Web Design? I'm not a spider.",
    "'Peter, what are you doing?' 'Crack.' 'What the-'",
    "*epic backflip*",
    "minecraft more like minecrap",
    "IS THAT MEGA-MINERS??",
    "Mason Troy Adams"
    
];




// Don't touch this
// Function to set a random sentence and text color
function setRandomSentence() {
    const randomIndex = Math.floor(Math.random() * sentences.length); // Get a random index for sentences
    const randomSentence = sentences[randomIndex]; // Select a random sentence
    document.querySelector('#motn p').textContent = randomSentence; // Set the sentence in the <p> tag
}

// Call the function to set the random sentence and color when the page loads
window.onload = setRandomSentence;
