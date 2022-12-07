const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.info-bar');
const ANSWER_LENGHT = 5;
const ROUNDS = 6;

async function init() {
    let currentGuess= '';
    let currentRow = 0;
    let isLoading = true;
    
    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split("");
    let done = false;
    setLoading(false);
    isLoading = false; 
    function addLetter (letter){
         if (currentGuess.length < ANSWER_LENGHT) {
            currentGuess  += letter;
            //Add letter to the currentGuess till the end
         }else {
            currentGuess = currentGuess.substring (0,currentGuess.length-1) + letter;
            //Add letter to the end and switch the last letter
         }

         letters[ANSWER_LENGHT*currentRow + currentGuess.length - 1].innerText = letter;
         //it prints in the inner text 
    }

    function backspace(){
        currentGuess = currentGuess.substring (0,currentGuess.length-1);
        letters[ANSWER_LENGHT*currentRow + currentGuess.length].innerText = "";

    }

    async function commit() {
        if (currentGuess.length !== ANSWER_LENGHT){
            //Do nothing
            return;
        }
       
        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({word : currentGuess})
        });

        const resObj = await res.json();
        const validWord = resObj.validWord;

        isLoading = false;
        setLoading(false);

        if (!validWord){
            markInvalidWord();
            return;
        }

        const guessParts = currentGuess.split(""); //It splits the strings to separate characters of Arrays.
        const map = makeMap(wordParts);
        
        
        for (let i=0; i < ANSWER_LENGHT; i++) {
            if (guessParts[i]===wordParts[i]){
                letters[currentRow * ANSWER_LENGHT + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }
        for (let i=0; i < ANSWER_LENGHT; i++) {
            if (guessParts[i]===wordParts[i]){
                //Do nothing, we already done that.
            } else if (wordParts.includes(guessParts[i]) && map[guessParts[i]]>0) {
                letters[currentRow * ANSWER_LENGHT + i].classList.add("close");
                //mark as close
                map[guessParts[i]]--;
            }else{
                letters[currentRow * ANSWER_LENGHT + i].classList.add("wrong");
            }
        }
        currentRow++;
        
        if (currentGuess === word) {
            //win
            alert('you win!');
            document.querySelector('.brand').classList.add("winner");
            done = true;
            return; 
        }else if (currentRow === ROUNDS) {
        alert(`you lose, the word was ${word}`);
        done = true;
       }
       currentGuess= '';
    }
    function markInvalidWord(){
        //alert('not a valid word');
        for (let i=0; i < ANSWER_LENGHT; i++){
        letters[currentRow * ANSWER_LENGHT + i].classList.remove("invalid");  
        
        setTimeout( function(){
        letters[currentRow * ANSWER_LENGHT + i].classList.add("invalid");  
        },10);
        }
    }   


    document.addEventListener('keydown', function handleKeyPress (event){
        if (done || isLoading){
            //Do nothing
            return;
        }
        
        const action = event.key;

        if (action === 'Enter') {
            commit();
        } else if (action === 'Backspace') {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase())
        } else {
            //Do nothing
        } 
    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }
 
  function setLoading(isLoading) {
    loadingDiv.classList.toggle('show', isLoading)
  }

function makeMap (array) {
    const obj = {};
    for (let i=0; i < array.length; i++) {
        const letter = array[i]
        if (obj[letter]) {
            obj[letter]++;

        }else {
            obj[letter] = 1;
        }
    }
    return obj; 
}

init();