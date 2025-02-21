// Just put your MotN in this const
const sentences = [
    "Look mom I can code in JavaScript",
    "Wait you actually want us to play music??",
    "Every 60 seconds, a minute passes in Africa",
    "Hi retrodev",
    "Ask me about Earthbound, please I need someone to talk to",
    "Neymar Jr. Add me on Steam, I don't care about Football I just like your csgo inventory",
    "Web Design? I'm not a spider.",
    "'Peter, what are you doing?' 'Crack.' 'What the-'",
    "*epic backflip*",
    "minecraft more like minecrap",
    "IS THAT MEGA-MINERS??",
    "Mason Troy Adams",
    "Californication",
    "We play real rock music, like Imagine Dragons",
    "The billionth digit of π is a 9. The first digit of π² is 9"
];




// Don't touch this
// No seriously, idk how this works I stole it from another site
function setRandomSentence() {
    const randomIndex = Math.floor(Math.random() * sentences.length);
    const randomSentence = sentences[randomIndex];
    document.querySelector('#motn p').textContent = randomSentence;
}

// Call the function to set the random sentence and color when the page loads
window.onload = setRandomSentence;


