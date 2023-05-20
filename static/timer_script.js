const $timer = $(".game_timer")
let timerCountdown
let paused = true

function startTimer(){
    resumeTimer()
    timerCountdown = setInterval(()=>{
        if(!paused){
            console.log("Paused = ", paused)
            $timer.text(Number($timer.text())-1)
            
            if($timer.text() <= 0){
                $("#guess-btn").text("Time's Up!")
                $timer.text(0)
                clearInterval(timerCountdown)

                let finalGuess = $(".all-guesses").children().last().children().first().text()
                endAnswer(finalGuess)
            }
        }
    }, 1000)
}

function stopTimer(){
    clearInterval(timerCountdown)
}
function pauseTimer(){
    paused = true
}
function resumeTimer(){
    paused = false
}

function resetTimer(){
    clearInterval(timerCountdown)
    $("#guess-btn").prop("disabled",false).text("Submit")
    $timer.text(180)
}