const input = document.querySelector("#pkmn-guess")
const suggestions = document.querySelector(".suggestions ul")
const mySuggestions = document.getElementsByClassName("has-suggestions")
const guessbtn = document.querySelector("#guess-btn")
const newGameBtn = document.querySelector("#new-game-btn")

const genList = document.querySelector(".pkmn-gens")
const shapeList = document.querySelector(".pkmn-shapes")

const pkmnGuessAdded = new Event("pkmn-guess-made");
let maxGuess = document.querySelector(".score-limit")
let lastGuess

const orderData = ["Name",  "Image",  "Gen",  "Egg1",  "Egg2",  "Color",  "Shape",  "Type1",  "Type2", ]

const BASE_API_URL = "https://pokeapi.co/api/v2"
let guessList = []


const typeColor_dict ={
    "Normal": "#A8A77A",     "Fire": "#EE8130",   "Water": "#6390F0",      "Electric": "#F7D02C",
    "Grass": "#7AC74C",      "Ice": "#96D9D6",    "Fighting": "#C22E28",   "Poison": "#A33EA1",
    "Ground": "#E2BF65",     "Flying": "#A98FF3", "Psychic": "#F95587",    "Bug": "#A6B91A",
    "Rock": "#B6A136",       "Ghost": "#735797",  "Dragon": "#6F35FC",     "Dark": "#705746",
    "Steel": "#B7B7CE",      "Fairy": "#D685AD", "None": "#FFFFFF"}

const eggColor_dict ={
    "Monster": "#F54269",     "Water1": "#0000FF",   "Bug": "#89C499",      "Flying": "#60C9E0",
    "Ground": "#B89858",      "Fairy": "#B889C4",    "Plant": "#009423",   "Humanshape": "#C7A28F",
    "Water3": "#8080FF",     "Mineral": "#FF2B2B", "Indeterminate": "#5A728F",    "Water2": "#5454FF",
    "Ditto": "#B561FF",       "Dragon": "#735797",  "No-eggs": "#454545",}

const allGens = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII",]

// Get a list of all pokemon to use with scripts
const allPokemon = [];

function getAllPokemon(){
    $("#all-pkmn ul li").each(function() {
        allPokemon
            .push($(this)
            .text())
    });
}


// FUNCTIONS FOR GAME SEARCH BOX
// ********************************************************
// Results is populated with allPokemon, as long as not blank & a valid pokemon is found
function search(str){
    let results = [];
    results = allPokemon.filter(val => {
        if(str !== ''){
            return val.toLowerCase().includes(str)
        }
    });
    return results;
}

// Updates suggestions each key press
function searchHandler(e){
    clearSuggestion();
    showSuggestions(search(input.value.toLowerCase()), input.value)
}

// Display suggestions
function showSuggestions(results, inputVal){
    results.every((val) => {
        const newSTRONG = document.createElement("strong");
        const newLI = document.createElement("li");
        newLI.classList.add("has-suggestions")

        const stylized_suggestion = makeStrong(val, inputVal);

        newLI.append(stylized_suggestion[0])
        newSTRONG.innerText = stylized_suggestion[1]
        newLI.append(newSTRONG)
        newLI.append(stylized_suggestion[2])

        suggestions.append(newLI);
        return val;
    })
}

// Makes input = clicked sugestion & clears the suggestion list upon a suggestion being selected
function useSuggestion(e){
    input.value = e.target.closest('li').innerText;
    clearSuggestion();
}

// Clears the list of suggestions
function clearSuggestion(){
    Array.from(mySuggestions).forEach(val => val.remove())
}

// Returns an array of a sliced suggestion. Slices occur at point where input matches suggestion
function makeStrong(pkmnSuggestion, userInput){
    const startSlice = pkmnSuggestion.toLowerCase().indexOf(input.value.toLowerCase());
    const endSlice = startSlice + userInput.length;

    return [pkmnSuggestion.slice(0,startSlice),
            pkmnSuggestion.slice(startSlice, endSlice),
            pkmnSuggestion.slice(endSlice, pkmnSuggestion.length)]
}

input.addEventListener('keyup', searchHandler);
suggestions.addEventListener('mouseup', useSuggestion)

// Submit a pokemon
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

// FUNCTIONS FOR GENERATING GAME'S ICON LIST
// ********************************************************
// Pokemon Generations
async function getGens(){
    for(idx in allGens){
        let newLI = document.createElement('li')
        newLI.innerText = allGens[idx]
        newLI.classList.add(`Gen-${allGens[idx]}`)
        newLI.classList.add("neutral-item")
        genList.append(newLI)
    }
}

// Pokemon Types
async function getTypes(){
    let nonTypes = ['unknown', 'shadow']

    let resp = await axios.get(`${BASE_API_URL}/type`)

    for(type of resp.data.results){
        // Exclude non-standard pokemon types
        if(!(nonTypes.includes(type.name))){

            capType = makeCapitalized(type.name)
            $(".pkmn-types").append(
                `<li class=" Type-${capType} neutral-item" style="background-color: ${typeColor_dict[`${capType}`]};">${capType}</li>`)
        }
    }
    $(".pkmn-types").append(
        `<li class="neutral-item Type-None" style="background-color: #000000;">Single</li>`
    )
    
}

// Pokemon Shapes
async function getShapes(){
    let resp = await axios.get(`${BASE_API_URL}/pokemon-shape`)
    for(shape of resp.data.results){
        let newIMG = document.createElement('img')
        newIMG.src = `/static/images/shapes/${shape.name}.png`
        newIMG.classList.add("neutral-item")
        newIMG.classList.add(`Shape-${shape.name}`)
        shapeList.append(newIMG)
    }
}

// Pokemon Colors
async function getColors(){
    let resp = await axios.get(`${BASE_API_URL}/pokemon-color`)
    for(color of resp.data.results){
        const capColor = makeCapitalized(color.name)
        let pkmnBgColor;
        
        if(["Brown", "Green"].includes(capColor)){
            pkmnBgColor = capColor != "Brown" ? typeColor_dict['Grass'] : typeColor_dict['Rock']
        }
        else{
            pkmnBgColor = capColor
        }
        $('.pkmn-colors').append(
            `<li class="neutral-item Color-${capColor}" style="background-color: ${pkmnBgColor};">${capColor}</li>`)
    }
}
// Pokemon Egg Groups
async function getEggs(){
    let resp = await axios.get(`${BASE_API_URL}/egg-group`)
    for(egg of resp.data.results){
        const capEgg = makeCapitalized(egg.name)

        $(".pkmn-eggs").append(
            `<li class="neutral-item Egg-${capEgg}" style="background-color: ${eggColor_dict[capEgg]}">${capEgg}</li>`)
    }
}

// Call all functions to generate reference data
function genReferenceData(){
    getGens()
    getTypes();
    getShapes();
    getColors();
    getEggs();
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
                    if(["Brown", "Green"].includes(gData[k][0])){
                        newTD.style.backgroundColor = gData[k][0] != "Brown" ? typeColor_dict['Grass'] : typeColor_dict['Rock']
                    }
                    else{
                        newTD.style.backgroundColor = gData[k][0]
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
    document.dispatchEvent(pkmnGuessAdded)

    addGuessCount(gData)
    if(gData["Name"][1] == "OK"){
        axios.get('/get-answer')
        .then(async (response) => {
            if(response.status == 200){
                let guessResp = await response.data
                gameEnd(guessResp, gData["Name"][0])
            }
        })
    }
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
            
            axios.get('/get-answer')
            .then(async (response) => {
                if(response.status == 200){
                    let guessResp = await response.data
                    gameEnd(guessResp, gData["Name"][0])
                }
            })
        }
    })
}

function gameEnd(answerName="Answer", gName="Guess"){

    let score = $(".score").text()

    $("#pkmn-guess").prop("disabled", true).css("color", "white")
    $("#guess-btn").prop("disabled", true)

    input.value = `Its ${answerName}!`
    
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
    
    axios.post("/submit-game")
    .then(async response =>{
        await response.data
        $("#non-poke-warn").text(response.data).removeClass("hidden-item")
    })
    
}

// Start building page components
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    getAllPokemon();
    genReferenceData();
    makeNewGame();
  })
