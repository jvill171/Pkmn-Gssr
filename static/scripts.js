const input = document.querySelector("#pkmn-guess")
const suggestions = document.querySelector(".suggestions ul")
const mySuggestions = document.getElementsByClassName("has-suggestions")
const button = document.querySelector("#guess-btn")
const nonPoke = document.querySelector("#non-poke-warn")


// Get a list of all pokemon to use with scripts
let allPokemon = [];

function getAllPokemon(){

    $("#all-pkmn ul li").each(function() {
        allPokemon
            .push($(this)
            .text())
    });
}

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

// ===================================
getAllPokemon();
