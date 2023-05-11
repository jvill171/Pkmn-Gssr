const input = document.querySelector("#pkmn-guess")
const suggestions = document.querySelector(".suggestions ul")
const mySuggestions = document.getElementsByClassName("has-suggestions")
const guessbtn = document.querySelector("#guess-btn")
const nonPoke = document.querySelector("#non-poke-warn")

const genList = document.querySelector(".pkmn-gens")
const typeList = document.querySelector(".pkmn-types")
const shapeList = document.querySelector(".pkmn-shapes")
const colorlist = document.querySelector(".pkmn-colors")
const egglist = document.querySelector(".pkmn-eggs")

const pkmnGenerated = new Event("pokemon-generated");

const BASE_API_URL = "https://pokeapi.co/api/v2"
let tgp;


const typeColor_dict ={
    "Normal": "#A8A77A",     "Fire": "#EE8130",   "Water": "#6390F0",      "Electric": "#F7D02C",
    "Grass": "#7AC74C",      "Ice": "#96D9D6",    "Fighting": "#C22E28",   "Poison": "#A33EA1",
    "Ground": "#E2BF65",     "Flying": "#A98FF3", "Psychic": "#F95587",    "Bug": "#A6B91A",
    "Rock": "#B6A136",       "Ghost": "#735797",  "Dragon": "#6F35FC",     "Dark": "#705746",
    "Steel": "#B7B7CE",      "Fairy": "#D685AD"}

const eggColor_dict ={
    "Monster": "#F54269",     "Water1": "#0000FF",   "Bug": "#89C499",      "Flying": "#60C9E0",
    "Ground": "#B89858",      "Fairy": "#B889C4",    "Plant": "#009423",   "Humanshape": "#C7A28F",
    "Water3": "#8080FF",     "Mineral": "#FF2B2B", "Indeterminate": "#5A728F",    "Water2": "#5454FF",
    "Ditto": "#B561FF",       "Dragon": "#735797",  "No-eggs": "#454545"}

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
    nonPoke.style.display = "None"

    if (allPokemon.includes(input.value)){
        // Attempt to compare guess to stored pokemon
        makeGuess(input.value)
        input.value = ''
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
// Element is true for the pokemon to guess
function makeGood(elem){
    elem.css({"border":"4px solid green", "font-weight":"bold"})
    // ADD A DROPSHADOW TO MAKE IT GLOW GREEN
}
// Element is NOT true for the pokemon to guess
function makeBad(elem){
    elem.css({"border":"2px solid red", "opacity" : ".5"})
}

// FUNCTIONS FOR GENERATING GAME'S ICON LIST
// ********************************************************
// Pokemon Types
async function getGens(){
    for(idx in allGens){
        let newLI = document.createElement('li')
        newLI.innerText = allGens[idx]
        newLI.classList.add(`data-${allGens[idx]}`)
        genList.append(newLI)
    }
}

async function getTypes(){
    let nonTypes = ['unknown', 'shadow']

    let resp = await axios.get(`${BASE_API_URL}/type`)

    for(type of resp.data.results){
        // Exclude non-standard pokemon types
        if(!(nonTypes.includes(type.name))){

            capType = makeCapitalized(type.name)

            let newLI = document.createElement('li')
            newLI.innerText = `${capType}`
            newLI.classList.add(`data-${capType}`)
            
            typeColor = typeColor_dict[`${capType}`]
            newLI.style.backgroundColor = typeColor

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
        
        newLI.style.backgroundColor = capColor != "Brown" ? `${capColor}`: typeColor_dict['Rock']
        colorlist.append(newLI)
    }
}
// Pokemon Egg Groups
async function getEggs(){
    let resp = await axios.get(`${BASE_API_URL}/egg-group`)
    for(egg of resp.data.results){
        const capEgg = makeCapitalized(egg.name)

        let newLI = document.createElement('li')
        newLI.innerText = `${capEgg}`
        newLI.classList.add(`data-${capEgg}`)
        
        newLI.style.backgroundColor = eggColor_dict[capEgg]
        egglist.append(newLI)
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
                    // HIDE GAME UNTIL RANDOM POKEMON IS SELECTED
                    // *********************************************************
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
                    newTD.style.backgroundColor = gData[k] != "brown" ? `${gData[k]}`: typeColor_dict['Rock']
                    newTD.style.textShadow = "black 0 0 5px"
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
        if(k != "Image"){
            let $elem = $(`.data-${gData[k]}`)

            if (gData[k] == tgp[k]){
                $(`.data-${gData[k]}`)
                console.log(`SAME ${k} - ${gData[k]}`)

                // Game won
                if(k == "Name"){
                    // Victory script goes here
                    break;
                }
                else{
                    makeGood($elem)
                    // makeGood()
                }
                
            }
            else{
                // console.log(`${gData[k]} ${tgp[k]}`)
                makeBad($elem)
                console.log("DIFF")
            }
        }
    }
}

// Start building page components
// ===================================
getAllPokemon();
genReferenceData();
document.addEventListener('DOMContentLoaded', function(event) {
    generateRandPkmn();
  })

// Make guess once a pokemon to guess have been generated
// FOR TESTING PURPOSES
document.addEventListener("pokemon-generated", (e)=>{
    makeGuess("Gardevoir")
})