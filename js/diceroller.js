/**
 * @file 
 * NPC object and helper functions
 * 
 * @author
 * Robert Thayer
 * http://www.gamergadgets.net
 * GitHub: Chaithi
 * 
 * @version
 * 1.0
 * Feb 2, 2017
 */

/**
 * Determines a random number between 1 and 6
 * @return {Number} 
 *  random integer between 1 and 6
 */
function getRandomNum() {
    var randomNum = Math.floor(Math.random() * 6) + 1;
    return randomNum;
}

/**
 * Generates a Shadowrun Anarchy roll
 * @param {number} numOfDice
 *  Number of dice to roll
 * @param {number} reroll
 *  Number of misses to reroll
 * @param {bool} glitchDie
 *  Whether a glitch die has been added
 * @param {bool} preEdge
 *  Whether the roll is being pre-edged
 * @return {Array}
 *  Returns numOfHits, numOfMisses, numOfDice, glitch, rollResults
 */
function roll(numOfDice, reroll, glitchDie, preEdge) {
    var glitch = "",
        numOfHits = 0,
        numOfMisses = 0,
        rollResults = [];
        
    // If glitch die is added, roll 1 die seperately.
    if (glitchDie) {
        var result = getRandomNum();
        switch(result) {
            case 1:
                glitch = "Glitch";
                break;
            case 5:
            case 6:
                glitch = "Exploit";
                break;
            default:
                glitch = "No effect";
        }
    }
    
    // Roll dice
    for (var i = 0; i < numOfDice; i++) {
        var result = getRandomNum();
        rollResults.push(result);
        // On Pre-Edge, hits on a 4 or higher
        if (preEdge) {
            if (result >= 4)
                numOfHits++;
            else
                numOfMisses++;
        } else {
            if (result >= 5)
                numOfHits++;
            else
                numOfMisses++;
        }
    }
    
    // Check for reroll misses traits. Reroll lesser of number of misses or reroll number
    if (reroll > 0 && numOfMisses > 0) {
        var check = Math.min(reroll, numOfMisses);
        for (var x = 0; x < check; x++) {
            var result = getRandomNum();
            rollResults.push(result);
            if (preEdge) {
                if (result >= 4) {
                    numOfHits++;
                    numOfMisses--;
                }
            } else {
                if (result >= 5) {
                    numOfHits++;
                    numOfMisses--;
                }
            }
        }
    }
    
    return [numOfHits, numOfMisses, numOfDice, glitch, rollResults];
}

/**
 * Using post-roll Edge, reroll all misses
 * @param {number} numOfDice
 *  Number of dice to reroll
 */
function postEdgeRoll(numOfDice) {
    var numOfHits = 0,
        postEdge = document.getElementById("postEdge");
    for (var i = 0; i < numOfDice; i++) {
        if (getRandomNum() >= 5)
            numOfHits++;
    }
    postEdge.innerHTML = "Post-Edge new hits: " + numOfHits;
}

/**
 * Displays roll results on page
 * @param {Array} returnArray
 *  The array from roll()
 */
function parseRoll(returnArray) {
    var numOfHits = returnArray[0],
        numOfMisses = returnArray[1],
        numOfDice = returnArray[2],
        glitch = returnArray[3],
        results = returnArray[4],
        rollArea = document.getElementById("lastRoll"),
        postEdge = document.getElementById("postEdge");
    results.sort();
    rollArea.innerHTML = "";
    for (var i = 0; i < results.length; i++) {
        rollArea.innerHTML += results[i] + " ";
    }
    rollArea.innerHTML += "<br>" + numOfDice + " rolled. Hits: " + numOfHits + ". Misses: " + numOfMisses + ".<br>";
    if (glitch !== "") {
        rollArea.innerHTML += "Glitch Die result: " + glitch + "<br>";
    }
    postEdge.innerHTML = "";
    postEdge.innerHTML += "<input type='button' onclick='postEdgeRoll(" + numOfMisses + ")' value='Post-Edge'><br>";
}

/**
 * Obtain roll information from diceroller form and generate the roll.
 */
function submitRoll() {
    var form = document.getElementById("diceroller"),
        dice = 0,
        reroll = 0,
        glitch = false,
        preedge = false;
    for (var i = 0; i < form.length; i++) {
        var element = form.elements[i];
        switch (element.name) {
            case "dice":
                dice = element.value;
                break;
            case "reroll":
                reroll = element.value;
                break;
            case "glitch":
                glitch = element.checked;
                break;
            case "preedge":
                preedge = element.checked;
                break;
            case "submit":
                break;
            default:
                alert("What are you trying to pull!?")
        }
    }
    parseRoll(roll(dice, reroll, glitch, preedge));
}