const input = document.querySelector("#pkmn-guess")
const suggestions = document.querySelector(".suggestions ul")
const mySuggestions = document.getElementsByClassName("has-suggestions")
const button = document.querySelector("#guess-btn")
const nonPoke = document.querySelector("#non-poke-warn")

const typeList = document.querySelector(".pkmn-types")
const shapeList = document.querySelector(".pkmn-shapes")
const colorlist = document.querySelector(".pkmn-colors")

const BASE_API_URL = "https://pokeapi.co/api/v2"
let tgp;


const typeColor_dict ={
    "Normal": "A8A77A",     "Fire": "EE8130",   "Water": "6390F0",      "Electric": "F7D02C",
    "Grass": "7AC74C",      "Ice": "96D9D6",    "Fighting": "C22E28",   "Poison": "A33EA1",
    "Ground": "E2BF65",     "Flying": "A98FF3", "Psychic": "F95587",    "Bug": "A6B91A",
    "Rock": "B6A136",       "Ghost": "735797",  "Dragon": "6F35FC",     "Dark": "705746",
    "Steel": "B7B7CE",      "Fairy": "D685AD"}

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

// 5 suggestions
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
    input.value = e.target.innerText;
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
suggestions.addEventListener('click', useSuggestion)

button.addEventListener('click', ()=>{
    if (allPokemon.includes(input.value)){
        // Attempt to compare guess to stored pokemon
        console.log("In")
    }
    else{
        nonPoke.style.display = "block"
    }
    
})

// FUNCTIONS FOR STYLING
// ********************************************************
function makeCapitalized(word){
    return word.charAt(0).toUpperCase() + word.slice(1)
}
// Fade an element if incorrect/used
function makeDim(elem){
    elem.style.opacity = '.5'
}
// Element is true for the pokemon to guess
function makeGood(elem){
    elem.style.border = '2px solid green'
    // ADD A DROPSHADOW TO MAKE IT GLOW GREEN
}
// Element is NOT true for the pokemon to guess
function makeBad(elem){
    elem.style.border = '2px solid red'
    makeDim(elem)
}

// FUNCTIONS FOR GENERATING GAME ICON LIST
// ********************************************************
// Pokemon Types
async function getTypes(){
    let nonTypes = ['unknown', 'shadow']

    let resp = await axios.get(`${BASE_API_URL}/type`)

    for(type of resp.data.results){
        // Exclude non-standard pokemon types
        if(!(nonTypes.includes(type.name))){

            capType = makeCapitalized(type.name)

            let newLI = document.createElement('li')
            newLI.innerText = `${capType}`
            newLI.classList.add(`data-`)
            
            typeColor = typeColor_dict[`${capType}`]
            newLI.style.backgroundColor = `#${typeColor}`

            typeList.append(newLI)
        }
    }
}

// Pokemon Shapes
async function getShapes(){
    let resp = await axios.get(`${BASE_API_URL}/pokemon-shape`)
    for(shape of resp.data.results){
        let newIMG = document.createElement('img')
        newIMG.src = `/static/images/shapes/${shape.name}.png`
        newIMG.classList.add(`data-${shape.name}`)
        shapeList.append(newIMG)
    }
}

// Pokemon Colors
async function getColors(){
    let resp = await axios.get(`${BASE_API_URL}/pokemon-color`)
    for(color of resp.data.results){
        const capColor = makeCapitalized(color.name)

        let newLI = document.createElement('li')
        newLI.innerText = `${capColor}`
        newLI.classList.add(`data-${capColor}`)
        
        newLI.style.backgroundColor = capColor != "Brown" ? `${capColor}`: `#${typeColor_dict['Rock']}`
        colorlist.append(newLI)
    }
}

// FUNCTIONS FETCHING POKEMON DATA
// ********************************************************
// Pokemon types retrieved here
async function getPokemon(dexNum){
    let resp = await axios.get(`${BASE_API_URL}/pokemon/${dexNum}`)
    return resp.data
}
// All other needed pokemon retrieved here
async function getSpecies(dexNum){
    let resp = await axios.get(`${BASE_API_URL}/pokemon-species/${dexNum}`)
    return resp.data
}
// Make a dictionary with pokemon data
async function buildPokemon(dexNum){
    console.log(`Building pokemon ${dexNum} -- ${allPokemon[dexNum - 1]}`)
    
    let respPkmn = await getPokemon(dexNum);
    let respSpec = await getSpecies(dexNum)
    
    let gen = (respSpec.generation.name).slice(11);
    
    let egg1 = respSpec.egg_groups[0].name
    let egg2 = respSpec.egg_groups.length == 1 ? "None" : respSpec.egg_groups[1].name
    
    let shape = respSpec.shape.name
    let color = respSpec.color.name
    
    let type1 = respPkmn.types[0].type.name
    let type2 = respPkmn.types.length == 1 ? "None" : respPkmn.types[1].type.name

    const pkmnData = {
        "Name"  : `${allPokemon[dexNum - 1]}`,
        "Gen"   : `${gen.toUpperCase()}`,
        "Egg1"  : `${egg1}`,
        "Egg2"  : `${egg2}`,
        "Shape" : `${shape.toLowerCase()}`,
        "Color" : `${color}`,
        "Type1" : `${type1}`,
        "Type2" : `${type2}`,
    }
    return pkmnData
}
// FUNCTIONS GENERATING POKEMON & RETRIEVEING POKEMON FROM GUESSES
// ***************************************************************
// Generate pokemon
function generateRandPkmn(){
    buildPokemon(dexNum = (Math.floor(Math.random() * allPokemon.length)))
                .then(guessPKMN =>{
                    tgp = guessPKMN
                    console.log(tgp)
                    // HIDE GAME UNTIL RANDOM POKEMON IS SELECTED
                })
}
// Make a guess
function makeGuess(pkmnName){
    myName =  makeCapitalized(pkmnName.toLowerCase())
    if (allPokemon.includes(myName)){
        dexNum = allPokemon.indexOf(myName)+1

        buildPokemon(dexNum)
            .then(myGuess => {
                addGuessData(myGuess)
                checkGuessData(myGuess)
            })
    }
}
// Add guess to guesses table
function addGuessData(gData){
    let newTR = document.createElement('tr')
    for (let k in gData){
        let newTD = document.createElement('td')
        newTD.append(makeCapitalized(gData[k]))
        newTR.append(newTD)
    }
    $(".all-guesses").append(newTR)
}
// Validate guess data
function checkGuessData(gData){
    
    for (let k in gData){
        if (gData[k] == tgp[k] && k != "Name"){
            $(`.data-${gData[k]}`)
            console.log(`SAME ${k} - ${gData[k]}`)
        }
        else{
            console.log(`${gData[k]} ${tgp[k]}`)
        }
    }
    
}



// Start building page components
// ===================================
getAllPokemon();
getTypes();
getShapes();
getColors();
document.addEventListener('DOMContentLoaded', function(event) {
    generateRandPkmn();
  })
