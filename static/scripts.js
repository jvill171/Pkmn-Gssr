const input = document.querySelector("#pkmn-guess")
const suggestions = document.querySelector(".suggestions ul")
const mySuggestions = document.getElementsByClassName("has-suggestions")
const guessbtn = document.querySelector("#guess-btn")
const newGameBtn = document.querySelector("#new-game-btn")

const genList = document.querySelector(".pkmn-gens")
const typeList = document.querySelector(".pkmn-types")
const shapeList = document.querySelector(".pkmn-shapes")
const colorlist = document.querySelector(".pkmn-colors")
const egglist = document.querySelector(".pkmn-eggs")

const pkmnGenerated = new Event("pokemon-generated");
const pkmnGuessAdded = new Event("pkmn-guess-made");

const BASE_API_URL = "https://pokeapi.co/api/v2"
let tgp;
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

// Display 5 suggestions
function showSuggestions(results, inputVal){
    results.every((val, idx) => {
        const newSTRONG = document.createElement("strong");
        const newLI = document.createElement("li");
        newLI.classList.add("has-suggestions")

        const stylized_suggestion = makeStrong(val, inputVal);

        newLI.append(stylized_suggestion[0])
        newSTRONG.innerText = stylized_suggestion[1]
        newLI.append(newSTRONG)
        newLI.append(stylized_suggestion[2])

        suggestions.append(newLI);
        return idx < 4;
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
    const startSlice = pkmnSuggestion.toLowerCase().indexOf(input.value);
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
    let $noPokeWarn = $("#non-poke-warn")
    $noPokeWarn.addClass("hidden-item")
    
    if(guessList.includes(input.value.toLowerCase())){
        $noPokeWarn
            .removeClass("hidden-item")
            .text("You've already guessed that pokemon!")
    }
    else if (allPokemon.includes(makeCapitalized(input.value.toLowerCase()))){
        // Valid guess
        makeGuess(input.value)
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
    $("#pkmn-guess").prop("disabled", false).css("color", "black")
    input.value = ''
})

newGameBtn.addEventListener('click',()=>{makeNewGame()})

// Clear board and select a new pokemon
function makeNewGame(){
    $("#new-game-btn").prop("disabled", true)
    setTimeout(() => {
        $("#new-game-btn").prop("disabled", false)
    }, 5000);
    // Hide game & show loading message
    $("#load-msg").toggleClass("hidden-item")
    $("#game").toggleClass("hidden-item")

    generateRandPkmn()
    resetGame();

}

function resetGame(){
    guessList = []
    $(".all-guesses").empty()
    $(".good-item").addClass("neutral-item").removeClass("good-item")
    $(".bad-item").addClass("neutral-item").removeClass("bad-item")

}

// FUNCTIONS FOR STYLING
// ********************************************************
function makeCapitalized(word){
    return word.charAt(0).toUpperCase() + word.slice(1)
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

// FUNCTIONS FETCHING POKEMON DATA
// ********************************************************
// Pokemon types retrieved here
async function getPokemon(dexNum){
    let resp = await axios.get(`${BASE_API_URL}/pokemon/${dexNum}`)
    let r = resp.data
    return {
        "img_url" : r['sprites']['other']['official-artwork']['front_default'],
        "type1"   : makeCapitalized(r.types[0].type.name),
        "type2"   : makeCapitalized(r.types.length == 1 ? "None" : r.types[1].type.name),
    }
    return resp.data
}
// All other needed pokemon retrieved here
async function getSpecies(dexNum){
    let resp = await axios.get(`${BASE_API_URL}/pokemon-species/${dexNum}`)
    let r = resp.data
    
    return {
        "gen"   : (r.generation.name).slice(11).toUpperCase(),
        "shape" : r.shape.name.toLowerCase(),
        "egg1"  : makeCapitalized(r.egg_groups[0].name),
        "egg2"  : makeCapitalized(r.egg_groups.length == 1 ? "None" : r.egg_groups[1].name),
        "color" : makeCapitalized(r.color.name),
    }
}
// Make a dictionary with pokemon data
async function buildPokemon(dexNum){
    console.log(`Building pokemon ${dexNum} -- ${allPokemon[dexNum - 1]}`)
    
    let respPkmn = await getPokemon(dexNum);
    let respSpec = await getSpecies(dexNum);

    const pkmnData = {
        "Name"  : allPokemon[dexNum - 1],
        "Image" : respPkmn["img_url"],
        "Gen"   : respSpec["gen"],
        "Egg1"  : respSpec["egg1"],
        "Egg2"  : respSpec["egg2"],
        "Color" : respSpec["color"],
        "Shape" : respSpec["shape"],
        "Type1" : respPkmn["type1"],
        "Type2" : respPkmn["type2"],
    }
    return pkmnData
}
// FUNCTIONS GENERATING POKEMON & RETRIEVEING POKEMON FROM GUESSES
// ***************************************************************
// Generate pokemon
function generateRandPkmn(){
    buildPokemon(dexNum = (
                    Math.floor(
                        Math.random() * allPokemon.length)))

                .then(guessPKMN =>{
                    tgp = guessPKMN
                    document.dispatchEvent(pkmnGenerated)
                    
                    $("#load-msg").toggleClass("hidden-item")
                    $("#game").toggleClass("hidden-item")
                })
}
// Make a guess
function makeGuess(pkmnName){
    clearSuggestion();
    myName =  makeCapitalized(pkmnName.toLowerCase())
    if (allPokemon.includes(myName)){
        dexNum = allPokemon.indexOf(myName)+1

        buildPokemon(dexNum)
            .then(myGuess => {
                addGuessData(myGuess)
                checkGuessData(myGuess)
                document.dispatchEvent(pkmnGuessAdded)
            })
    }
}
// Add guess to guesses table
function addGuessData(gData){
    let newTR = document.createElement('tr')
    guessList.push(gData["Name"].toLowerCase())
    for (let k in gData){
        let newTD = document.createElement('td')
        let newIMG = document.createElement('img')
        
        if(["Shape", "Image"].includes(k)){
            if(k == "Image"){
                newIMG.style.backgroundColor = "transparent"
                newIMG.style.border = "none"
                newIMG.src = gData[k]
            }
            else{
                newIMG.src = `/static/images/shapes/${gData[k]}.png`
            }
            newTD.append(newIMG)
        }
        else{
            if(["Type1", "Type2", "Color"].includes(k)){
                if(k == "Color"){
                    if(["Brown", "Green"].includes(gData[k])){
                        newTD.style.backgroundColor = gData[k] != "Brown" ? typeColor_dict['Grass'] : typeColor_dict['Rock']
                    }
                    else{
                        newTD.style.backgroundColor = gData[k]
                    }
                }
                else{
                    let typeColor = makeCapitalized(gData[k])
                    newTD.style.backgroundColor = (typeColor == "None" ? "Black" : typeColor_dict[typeColor])
                }
            }
            newTD.append(makeCapitalized(gData[k]))
            newTR.append(newTD)
        }
        newTR.append(newTD)
    }
    $(".all-guesses").append(newTR)
}
// Validate guess data
function checkGuessData(gData){
    
    for (let k in gData){
        if(!["Image", "Name"].includes(k)){
            let $elem;
            
            if (["Type1", "Type2"].includes(k)){
                $elem = $(`.Type-${gData[k]}`)

                if([tgp["Type1"], tgp["Type2"] ].includes(gData[k])){
                    $elem.addClass("good-item")
                }
                else{
                    $elem.addClass("bad-item")
                }
            }
            else if (["Egg1", "Egg2"].includes(k)){
                $elem = $(`.Egg-${gData[k]}`)
                if([tgp["Egg1"], tgp["Egg2"]].includes(gData[k])){
                    $elem.addClass("good-item")
                }
                else{
                    $elem.addClass("bad-item")
                }
            }
            else if(["Color", "Shape", "Gen"].includes(k)){
                
                $elem = $(`.${k}-${gData[k]}`)
                if(tgp[k] == gData[k]){
                    $elem.addClass("good-item")
                }
                else{
                    $elem.addClass("bad-item")
                }
            }
            else{
                // Do nothing: Name, Image
            }
            $elem.removeClass("neutral-item")
        }
    }
    if(gData["Name"] == tgp["Name"]){
        // Add victory script here
    }
}
// function gameWin(){
    
// }

// Start building page components
// ===================================
getAllPokemon();
genReferenceData();
document.addEventListener('DOMContentLoaded', function(event) {
    generateRandPkmn();
  })

// Make guess once a pokemon to guess have been generated
// FOR TESTING PURPOSES
// document.addEventListener("pokemon-generated", (e)=>{
//     makeGuess("Gardevoir")
// })