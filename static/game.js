const guessbtn = document.querySelector("#guess-btn")
const newGameBtn = document.querySelector("#new-game-btn")

const pkmnGuessAdded = new Event("pkmn-guess-made");
let maxGuess = document.querySelector(".score-limit")
const gameMode = $(".game_timer").length == 0 ? 1 : 2;

const orderData = ["Name",  "Image",  "Gen",  "Egg1",  "Egg2",  "Color",  "Shape",  "Type1",  "Type2", ]

const BASE_API_URL = "https://pokeapi.co/api/v2"
let guessList = []

guessbtn.addEventListener('click', (e)=>{
    e.preventDefault()
    const $noPokeWarn = $("#non-poke-warn")
    
    $noPokeWarn.addClass("hidden-item")
    if(guessList.includes(input.value.toLowerCase().trim())){
        $noPokeWarn
            .removeClass("hidden-item")
            .text(`You've already guessed ${input.value.toLowerCase().trim()}!`)
            input.value = ''
    }
    else if (allPokemon.includes(makeCapitalized(input.value.toLowerCase().trim()))){
        // Valid guess
        $noPokeWarn.addClass("hidden-item")
        makeGuess(input.value);
        $("#pkmn-guess").prop("disabled", true).css("color", "white")
        input.value = `Guessing ${input.value}...` 

        if($(".all-guesses").children().length == 0){
            if($(".game_timer").length){
                startTimer()
            }
        }
    }
    else{
        $noPokeWarn
            .removeClass("hidden-item")
            .text("Thats not a real pokemon!")
    }
})

document.addEventListener("pkmn-guess-made",()=>{
    $("#pkmn-guess").prop("disabled", false).css("color", "black").focus()
    input.value = ''
    if(gameMode == 2){
        resumeTimer()
    }
})

newGameBtn.addEventListener('click',(e)=>{
    e.preventDefault()
    makeNewGame();
})

// Clear board and select a new pokemon
function makeNewGame(){
    $("#new-game-btn").prop("disabled", true)
    setTimeout(() => {
        $("#new-game-btn").prop("disabled", false)
    }, 5000);
    generateRandPkmn();
    hideShowGame();
    resetGame();

}

function hideShowGame(){
    $("#load-msg").toggleClass("hidden-item")
    $("#game").toggleClass("hidden-item")
}

function resetGame(){
    guessList = []
    $(".all-guesses").empty()
    $(".good-item").addClass("neutral-item").removeClass("good-item")
    $(".bad-item").addClass("neutral-item").removeClass("bad-item")
    $(".score").text(0)
    $("#pkmn-guess").prop("disabled", false)
    $("#guess-btn").prop("disabled", false)
    $("#non-poke-warn").addClass("hidden-item")
    input.value = ''
    $("#pkmn-guess").removeClass("text-bg-success text-bg-danger")
    
    $(".end-status").addClass("hidden-item")
                    .removeClass(["text-danger", "text-success"])
    if(gameMode == 2){
        resetTimer()
    }

}

// FUNCTIONS FOR STYLING
// ********************************************************
function makeCapitalized(word){
    let words = word.split(" ");

    words.forEach((cVal, idx)=>{
        words[idx] = cVal.charAt(0).toUpperCase() + cVal.slice(1)
    })
    return words.join(' ')
}

// FUNCTIONS GENERATING POKEMON & RETRIEVEING POKEMON FROM GUESSES
// ***************************************************************
// Generate pokemon
function generateRandPkmn(){
    // Generate pokemon server-side
    axios.post("/random-pokemon")
    .then((response) => {
        if(response.status == 200){
            hideShowGame()
            $("#pkmn-guess").focus()
        }
    })
}
// Make a guess
function makeGuess(pkmnName){
    if(gameMode == 2){
        pauseTimer()
    }

    clearSuggestion();
    myName =  makeCapitalized(pkmnName.toLowerCase())
    if (allPokemon.includes(myName)){
        dexNum = allPokemon.indexOf(myName)+1
        
        axios.post(`/compare-pokemon/${dexNum}`)
        .then(async (response) => {
            if(response.status == 200){
                let guessResp = await response.data
                addGuessData(guessResp)
                checkGuessData(guessResp)
            }
        })
    }
}
// Add guess to guesses table
function addGuessData(gData){
    let newTR = document.createElement('tr')
    guessList.push(gData["Name"][0].toLowerCase())

    for (let k of orderData){
        let newTD = document.createElement('td')
        let newIMG = document.createElement('img')
        newTD.style.backgroundColor = "rgba(0, 0, 0, 0.3)"
        if(["Shape", "Image"].includes(k)){
            if(k == "Image"){
                newIMG.style.backgroundColor = "transparent"
                newIMG.style.border = "none"
                newIMG.src = gData[k][0]
            }
            else{
                newIMG.src = `/static/images/shapes/${gData[k][0]}.png`
            }
            newTD.append(newIMG)
        }
        else{
            if(["Type1", "Type2", "Color"].includes(k)){
                if(k == "Color"){
                    switch(gData[k][0]){
                        case "Brown":
                            newTD.style.backgroundColor = typeColor_dict['Rock']
                            break;
                        case "Green":
                            newTD.style.backgroundColor = typeColor_dict['Grass']
                            break;
                        case "White":
                            newTD.style.backgroundColor = "#F5F5F5"
                            break;
                        default:
                            newTD.style.backgroundColor = gData[k][0]
                            break;
                    }
                }
                else{
                    let typeColor = makeCapitalized(gData[k][0])
                    newTD.style.backgroundColor = (typeColor == "None" ? "Black" : typeColor_dict[typeColor])
                }
            }
            newTD.append(makeCapitalized(gData[k][0]))
            newTR.append(newTD)
        }
        newTR.append(newTD)
    }
    $(".all-guesses").append(newTR)
}
// // Validate guess data
function checkGuessData(gData){
    for (let k of orderData){
        let $elem;
        if (!(k == "Name" || k == "Image")){
            if(k == "Egg1" || k == "Egg2"){
                $elem = $(`.Egg-${gData[k][0]}`)
            }
            else if(k == "Type1" || k == "Type2"){
                $elem = $(`.Type-${gData[k][0]}`)
            }
            else{
                $elem = $(`.${k}-${gData[k][0]}`)
            }
            if(gData[k][1] == "OK"){
                $elem.addClass("good-item")
            }
            else{
                $elem.addClass("bad-item")
            }
            $elem.removeClass("neutral-item")
        }
    }

    addGuessCount(gData)
    if(gData["Name"][1] == "OK"){
        endAnswer(gData["Name"][0])
    }

    document.dispatchEvent(pkmnGuessAdded)
}

// Add guess server-side; If limit reached, gameEnd()
async function addGuessCount(gData){
    axios.get("/guess-counter")
    .then(async (response)=>{
        await response.data
        $(".score").text(response.data['counter'])
        $(".score-limit").text(`${response.data['limit']}`)
    })
    .then(()=>{
        if(Number($(".score").text()) == Number($(".score-limit").text())){
            endAnswer(gData["Name"][0])
        }
    })
}

function endAnswer(gName){
    if(gameMode == 2){
        stopTimer()
    }
    axios.get('/get-answer')
    .then(async (response) => {
        if(response.status == 200){
            let guessResp = await response.data
            gameEnd(guessResp, gName)
        }
    })

}

function gameEnd(answerName="Answer", gName="Guess"){
    $("#pkmn-guess").prop("disabled", true).css("color", "white")
    $("#guess-btn").prop("disabled", true)

    input.value = `Its... ${answerName}!`
    
    if(gName == answerName){
        $(".end-status").addClass("text-success")
                        .text("Victory!"
                        ).removeClass("hidden-item")
        $("#pkmn-guess").addClass("text-bg-success")
    }
    else{
        $(".end-status").addClass("text-danger")
                        .text("Failure")
                        .removeClass("hidden-item")
        $("#pkmn-guess").addClass("text-bg-danger")
    }

    axios.post(`/submit-game/${gameMode}`)
    .then(async response =>{
        await response.data
        $("#non-poke-warn").text(response.data).removeClass("hidden-item")
    })
}

// Start building page components
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    genReferenceData();
    makeNewGame();
  })
