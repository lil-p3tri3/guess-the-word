var express = require('express');
var router = express.Router();

// Makes it easier to change the message throughout our game's logic
const MessagingResponse = require('twilio').twiml.MessagingResponse;

// Creates a route at /play-game that Twilio will POST to
router.post('/play-game', (req, res) => {
  // creates a new instance of the MessagingResponse object
  const twiml = new MessagingResponse();

  // 💡 How can we clean this data?
  const incomingMsg = req.body.Body.toLowerCase().trim();
  console.log(incomingMsg);

/*   BEGIN OF INTRO SECTION
  👋 Hi! Read me first! 👋 */

  // Prints out the text sent to the Twilio SMS number
  // console.log(incomingMsg);

  // Sends back a message
  // twiml.message("Wow, I sure do love Major League Hacking. Excited for today's INIT challenge!");

  // Using the instructions in the README.md, run the app and send your Twilio SMS number a text
  // Check out the link on your ngrok tab in terminal, most likely http://localhost:4040
  // Peruse the debug logs and then when comfortable, delete this section

  /* 👋 See you later, alligator! 🐊
  (Send in chat "in a while, crocodile" if you're cool)
  END OF INTRO SECTION*/

  // 💡 Add a secret word to test this game with!
  const word = 'dsc';

  // ✨ Helper functions ✨
    
  const handleNewGame = () => {
    // 💡 Set up a new game
    req.session.wordState = new Array(word.length).fill('_');
    req.session.lives = 5;
    req.session.playing = true;
    twiml.message(`\n\nText back one letter at a time to try and figure out the word. If you know the word, text the entire word!\n\nYou have ${req.session.lives} lives left. \n\n ${req.session.wordState.join(' ')}`);
  }

  const handleInvalidSMS = () => {
    // 💡 Send an error message (ex. typing something other than "start")
    twiml.message('\n\nSorry, please type "start" to play.');
  }

  const checkForSuccess = () => {
    // 💡 Check to see if player guessed the full word or a letter in it
    if (incomingMsg == word) { 
      return 'win'; 
    }
    if (word.includes(incomingMsg)) {
      return 'match'; 
    }
    return false;
  }

  const handleGameOver = msg => {
    // 💡 Notify the player that the game is over
    twiml.message(msg);
    // destroy session
    req.session.destroy();
  }

  const handleBadGuess = () => {
    // 💡 Let the player know if their guess was incorrect
    req.session.lives--;
    if (req.session.lives ==0) {
      handleGameOver("\n\nSorry mate, \nyou ran out of lives \nstart again!");
    } else {
      twiml.message(`\n\nNot quite 💜\n\nYou have ${req.session.lives} lives left. \n\n ${req.session.wordState.join(' ')}`);
    }
  }

  const handleMatch = () => {
    // 💡 Update hint with correct guesses
    for (let [i, char] of [...word].entries()) {
      if (char == incomingMsg){
        req.session.wordState[i] = incomingMsg;
      }
    }

    if (req.session.wordState.join('') == word){
      handleGameOver(`\n\n🎊Awesome job! You win!🎊\n\n ${req.session.wordState.join(' ')}`);
    } else {
      twiml.message(`\n\nYou got a letter! \n\nYou have ${req.session.lives} lives left. \n\n ${req.session.wordState.join(' ')}`);
    }
  }

  // 🎮 Game Play Logic 🎮

  if (!req.session.playing) {
    // 💡 Set up game logic with the helper functions
    if (incomingMsg == 'start') {
      // ❓ If you're not playing and someone texts you start, what helper function do you call?
        handleNewGame();
    } else {
        handleInvalidSMS();
    }
  } else {
    // 💡 Logic once you've started playing the game!
      const success = checkForSuccess(); //results will be "false", "win", or "match"
      if (success == "match") {
        handleMatch();
      } else if (success == "win") {
        handleGameOver(`\n\n🎊Awesome job! You win!🎊\n\n ${req.session.wordState.join(' ')}`);
      } else {
        handleBadGuess();
      }
  }

  // sends the response back to the user
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

module.exports = router;