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
 *
 * @todo
 * - Add server side verification
 */

/**
 * @global
 * list = array holding list of NPCs
 */
var list = [];

/**
 * Constructs an npc object
 *
 * @constructor
 *
 * @param {number} armor
 *  Amount of armor NPC has
 * @param {number} phys
 *  Amount of physical condition monitor NPC has
 * @param {number} mitigation
 *  Amount of damage mitigation NPC has
 * @param {string} name
 *  Name of the NPC. This must be unique
 * @param {string} tolerance
 *  Either High / Low / None for Pain tolerance quality
 */

function npc(armor, phys, stun, mitigation, name, tolerance) {
    this.maxArmor = armor;
    this.maxPhysCM = phys;
    this.maxStunCM = stun;
    this.mitigation = mitigation;
    this.name = name;
    this.tolerance = tolerance;
    
    // currentxxx variables hold the NPC's current damage status
    this.currentPhys = 0;
    this.currentStun = 0;
    this.currentArmor = 0;
    
    // calculates the current wound modifier. Bases off of wound for every 3 damage.
    this.woundModifier = function () {
        var phys = Math.floor(this.currentPhys / 3),
            stun = Math.floor(this.currentStun / 3),
            base = phys + stun;
        if (this.tolerance == "High") {
            if (stun == 1) { stun = 0; }
            if (phys == 1) { phys = 0; }
            base = phys + stun;
        } else if (this.tolerance == "Low") {
            if (base > 0) { base++; }
        }
        return base;
    };
    
    // Holds the checkboxes for damage
    this.armorBoxes = [];
    this.physBoxes = [];
    this.stunBoxes = [];
    
    /**
     * Assigns damage to this NPC
     * @param {number} damage
     *  How much overall damage
     * @param {char} type
     *  Either P for Physical or S for Stun
     * @param {number} aa
     *  Amount of Armor Avoidance included
     */
    this.giveDamage = function (damage, type, aa) { takeDamage.call(this, damage, type, aa); console.log(this.name + " is taking damage."); };
    
    // Create the HTML elements for this NPC
    createDiv.call(this);
    
    // Assign specific HTML elements to this NPC
    this.box = document.getElementById(name);
    this.woundBox = this.box.getElementsByClassName("wound")[0];
}

/**
 * Anonymous function to call to figure out how damage affects the NPC
 * 
 * @param {number} damage
 *  Amount of overall damage to take
 * @param {char} type
 *  Whether damage is Physical or Stun
 * @param {number} aa
 *  How much Armor Avoidance is included
 */
function takeDamage(damage, type, aa) {
    var actualDamage = damage - this.mitigation, // Subtract mitigation from damage coming in
        armorLeft = this.maxArmor - this.currentArmor, // Determine how much armor is left
        physLeft = this.maxPhysCM - this.currentPhys, // Determine how much physical CM is left
        stunLeft = this.maxStunCM - this.currentStun, // Determine how much stun CM is left
        
        // Initialize the amount of stun, physical, and armor damage to 0
        phys = 0,
        stun = 0,
        armor = 0,
        
        // These will be used to determine which checkbox to toggle
        armorid,
        physid,
        stunid;
    
    // If all damage is mitigated, no effect
    if (actualDamage < 0) {
        return;
    }
    
    // If armor avoidance is greater than the left over damage, set the aa to be the actual damage
    if (aa > actualDamage) {
        aa = actualDamage;
    }
    
    // If there is any armor avoidance, assign that damage first
    if (aa > 0) {
        console.log("Taking direct damage past armor.");
        switch (type) {
        case "P":
            // Determine what's less: Armor Avoidance, the mitigated damage, or how much physical CM is left
            phys += Math.min(aa, actualDamage, physLeft);
            actualDamage -= phys;
            physLeft -= phys;
            break;
        case "S":
            // Determine what's less: Armor Avoidance, the mitigated damage, or how much stun CM is left
            stun = Math.min(aa, actualDamage, stunLeft);
            actualDamage -= stun;
            stunLeft -= stun;
            break;
        default:
            alert("Error!");
        }
    }
    // After armor avoidance, assign armor damage
    if (armorLeft > 0) {
        // When the NPC has more armor than the remaining damage, assign all damage to armor.
        // Otherwise, take off rest of the armor and continue.
        if (actualDamage <= armorLeft) {
            armor += actualDamage;
            actualDamage = 0;
        } else {
            armor = armorLeft;
            actualDamage -= armor;
        }
    }
    switch (type) {
        // Assign rest of the damage based on type
        // TO-DO: Research if Anarchy has same physical overflow for stun damage that 5e has
        case "S":
            stun += Math.min(actualDamage, stunLeft);
            break;
        case "P":
            phys += Math.min(actualDamage, physLeft);
            break;
        default:
            alert("Error!");
    }
    
    // Add affected damage to armor, phys, and stun.
    this.currentArmor += armor;
    if (this.currentArmor > 0) {
        armorid = this.name + "armor" + (this.currentArmor - 1);
        document.getElementById(armorid).checked = true;
        toggleCheck(document.getElementById(armorid));
    }
    this.currentPhys += phys;
    if (this.currentPhys > 0) {
        physid = this.name + "phys" + (this.currentPhys - 1);
        document.getElementById(physid).checked = true;
        toggleCheck(document.getElementById(physid));
    }
    this.currentStun += stun;
    if (this.currentStun > 0) {       
        stunid = this.name + "stun" + (this.currentStun - 1);
        document.getElementById(stunid).checked = true;
        toggleCheck(document.getElementById(stunid));    
    }
}

/**
 * Creates HTML elements for the npc object
 */
function createDiv() {
    var mainBox = document.createElement("DIV"),
        armorDiv = document.createElement("DIV"),
        physDiv = document.createElement("DIV"),
        stunDiv = document.createElement("DIV"),
        nameLabel = document.createElement("span"),
        woundLabel = document.createElement("span"),
        armorLabel = document.createElement("span"),
        physLabel = document.createElement("span"),
        stunLabel = document.createElement("span"),
        takeDmgBtn = document.createElement("button"),
        delBtn = document.createElement("button");
    nameLabel.innerHTML = this.name;
    delBtn.onclick = function () { removeNPC(this); };
    delBtn.innerHTML = "Delete";
    takeDmgBtn.onclick = function () { processDamage(this); }
    takeDmgBtn.innerHTML = "Take Damage";
    woundLabel.innerHTML += "Wound Modifier: " + this.woundModifier();
    woundLabel.className = "wound";
    armorLabel.innerHTML = "Armor:<br>";
    physLabel.innerHTML = "Physical:<br>";
    stunLabel.innerHTML = "Stun:<br>";
    mainBox.className = "npc";
    mainBox.id = this.name;
    armorDiv.className = "armor";
    physDiv.className = "phys";
    stunDiv.className = "stun";
    armorDiv.appendChild(armorLabel);
    physDiv.appendChild(physLabel);
    stunDiv.appendChild(stunLabel);
    
    // Create a checkbox for each point of maximum armor, physical, and stun CM
    for (var i = 0; i < this.maxArmor; i++) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox";
        checkbox.id = this.name + "armor" + i;
        checkbox.onclick = function () { toggleCheck(this); update; };
        this.armorBoxes.push(checkbox);
        armorDiv.appendChild(checkbox);
    }
    for (var i = 0; i < this.maxPhysCM; i++) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox";
        checkbox.id = this.name + "phys" + i;
        checkbox.onclick = function () { toggleCheck(this); update; };
        this.physBoxes.push(checkbox);
        physDiv.appendChild(checkbox);
    }
    for (var i = 0; i < this.maxStunCM; i++) {
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox";
        checkbox.id = this.name + "stun" + i;
        checkbox.onclick = function () { toggleCheck(this); update; };
        this.stunBoxes.push(checkbox);
        stunDiv.appendChild(checkbox);
    }
    mainBox.appendChild(nameLabel);
    mainBox.appendChild(delBtn);
    mainBox.appendChild(takeDmgBtn);
    mainBox.appendChild(woundLabel);
    mainBox.appendChild(armorDiv);
    mainBox.appendChild(physDiv);
    mainBox.appendChild(stunDiv);
    document.getElementById("npcArea").appendChild(mainBox);
}

/**
 * Checks all previous checkboxes or unchecks all next checkboxes in that section
 * 
 * @param {HTMLelement} ele
 *  The element that got clicked
 */
function toggleCheck(ele) {
    if (ele == null) {
        return;
    }
    if (ele.checked) {
        ele = ele.previousSibling;
        while(ele !== null) {
            ele.checked = true;
            ele = ele.previousSibling;
        }
    } else {
        ele.nextSibling;
        while(ele !== null) {
            ele.checked = false;
            ele = ele.nextSibling;
        }
    }
    update(); // Updates the NPCs' stats
}

/**
 * Checks the state of all checkboxes and updates the stats of each NPC accordingly
 */
function update() {
    for (var i = 0; i < list.length; i++) {
        var x = 0,
            count = 0;
        for (x = 0; x < list[i].armorBoxes.length; x++) {
            if (list[i].armorBoxes[x].checked) {
                count++;
            }
        }
        list[i].currentArmor = count;
        
        // Begin Physical Track check
        count = 0;
        for (x = 0; x < list[i].physBoxes.length; x++) {
            if (list[i].physBoxes[x].checked) {
                count++;
            }
        }
        list[i].currentPhys = count;
        
        // Begin Stun Track check
        count = 0;
        for (x = 0; x < list[i].stunBoxes.length; x++) {
            if (list[i].stunBoxes[x].checked) {
                count++;
            }
        }
        list[i].currentStun = count;
        if (list[i].woundModifier() > 0) {
            list[i].woundBox.innerHTML = "Wound Modifier: -" + list[i].woundModifier();
        } else {
            list[i].woundBox.innerHTML = "Wound Modifier: 0";
        }
    }
}

/**
 * Reads the npcEntry form and generates an NPC
 * Also verifies that the name is unique. If not, adds a number to the end.
 */

function submitnpc() {
    var form = document.getElementById("npcEntry"),
        armor = 0,
        mitigation = 0,
        phys = 0,
        stun = 0,
        name = "",
        tolerance = "";
    for (var i = 0; i < form.length; i++) {
        var element = form.elements[i];
        switch (element.name) {
            case "name":
                name = element.value;
                while (!isUnique(name)) {
                    if (!isNaN(name.slice(-1))) {
                        var num = name.slice(-1);
                        num++;
                        name = name.substr(0, name.length-1) + num;
                    } else {
                        name += "1";
                    }
                }
                break;
            case "armor":
                armor = element.value;
                break;
            case "phys":
                phys = element.value;
                break;
            case "stun":
                stun = element.value;
                break;
            case "mitigation":
                mitigation = element.value;
                break;
            case "submit":
                break;
            case "tolerance":
                tolerance = document.querySelector('input[name = "tolerance"]:checked').value;
                break;
            default:
                alert("What are you trying to pull!?")
        }
    }
    var newNPC = new npc(armor, phys, stun, mitigation, name, tolerance);
    list.push(newNPC);
}

/**
 * Verifies that a name is unique in the list of NPCs
 * @param {string} name
 *  The NPC name entered
 * @return {bool}
 *  Returns true if name is unique. false if not
 */
function isUnique(name) {
    if (list[0] == 'undefined') { return true; }
    for (var i = 0; i < list.length; i++) {
        if (name === list[i].name) {
            return false;
        }
    }
    return true;
}

/**
 * Deletes an NPC from the page and from the list
 * @param {HTMLelement} ele
 *  Element that was clicked
 */
function removeNPC(ele) {
    var id = ele.parentElement.id,
        parent = document.getElementById(id).parentNode,
        needle;
    // See which member of the list matches the id
    for (var i = 0; i < list.length; i++) {
        if (list[i].name == id) {
            needle = i;
            break;
        }
    }
    if (needle !== null) {
        list.remove(needle);
    }
    parent.removeChild(document.getElementById(id));
}

/**
 * Reads takeDamageEntry form and processes to the correct NPC
 * @param {HTMLelement} ele
 *  Element that was clicked
 */
function processDamage(ele) {
    var form = document.getElementById("takeDamageEntry"),
        damage = 0,
        type = false,
        aa = 0,
        id = ele.parentElement.id,
        needle;
    for (var i = 0; i < form.length; i++) {
        var element = form.elements[i];
        switch (element.name) {
            case "damage":
                damage = element.value;
                break;
            case "aa":
                aa = element.value;
                break;
            case "type":
                if (element.checked) {
                    type = "P";
                } else {
                    type = "S";
                }
                break;
            case "submit":
                break;
            default:
                alert("What are you trying to pull!?")
        }
    }
    // Find which member of the list matches the npc chosen
    for (var i = 0; i < list.length; i++) {
        if (list[i].name == id) {
            needle = i;
            break;
        }
    }
    console.log(list[needle].name + " found. Assigning damage.");
    list[needle].giveDamage(damage, type, aa);
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
