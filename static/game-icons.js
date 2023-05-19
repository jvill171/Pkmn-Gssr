const genList = document.querySelector(".pkmn-gens")
const shapeList = document.querySelector(".pkmn-shapes")

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
        
        switch(capColor){
            case "Brown":
                pkmnBgColor = typeColor_dict['Rock']
                break;
            case "Green":
                pkmnBgColor = typeColor_dict['Grass']
                break;
            case "White":
                pkmnBgColor = "#F5F5F5"
                break;
            default:
                pkmnBgColor = capColor
                break;
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
    $(".pkmn-eggs").append(
        `<li class="neutral-item Egg-None" style="background-color: #000000;">Single-Egg</li>`
    )
}

// Call all functions to generate reference data
function genReferenceData(){
    getGens()
    getTypes();
    getShapes();
    getColors();
    getEggs();
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        $(".flash-msgs").addClass("hidden-item")
    }, 2000);
    getAllPokemon();
  })