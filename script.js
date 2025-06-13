// Game state variables
let coins = 0;
let power = 1;
let cost = 10;
let petOwned = false;
let petUpgradeCost = 1000;
let petMultiplier = 2;
let autoInterval = null;
let redThemeOwned = false;
let greenThemeOwned = false;
let currentTheme = "default";
let musicMuted = false;
let soundMuted = false;
let sheepOwned = false;
let sheepMultiplier = 145;
let sheepCost = 20000;
let sheepAutoInterval = null;
let sheepTime = 6000;
let petTime = 1000;
let sheepLevel = 0;
let petLevel = 0;
let petSpeedCost = 4000;
let sheepSpeedCost = 15000;
let playerName = "";
let currentScoreSubmitted = false;

document.getElementById("playerName").disabled = false;
document.getElementById("playerPassword").disabled = false;
// Max stats constants
const MAX_POWER = 70;
const MAX_PET_STRENGTH = 100;
const MAX_SHEEP_STRENGTH = 550;
const MIN_PET_TIME = 100; // 0.3 seconds
const MIN_SHEEP_TIME = 500; // 3 seconds

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD2QXS1gLB2WpWEn007kidJH70xMydUPkM",
    authDomain: "clickit-b81eb.firebaseapp.com",
    databaseURL: "https://clickit-b81eb-default-rtdb.firebaseio.com",
    projectId: "clickit-b81eb",
    storageBucket: "clickit-b81eb.firebasestorage.app",
    messagingSenderId: "1006294935902",
    appId: "1:1006294935902:web:1d50d953d793773cea07cf",
    measurementId: "G-4E224Z4BQY"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const musicButton = document.getElementById("toggle-music");
const soundButton = document.getElementById("toggle-sound");

// Audio elements
const sndAria = new Audio("ariaMath.mp3");
const sndSweden = new Audio("sweden.mp3");
const sndMeow = new Audio("meow.mp3");
const sndHurt = new Audio("hurt.wav");
const sndSlash = new Audio("slash.wav");
const sndClick = new Audio("click.wav");
const sndBaa = new Audio("baa.wav");

sndSweden.loop = true;

function buySheep() {
    if (sheepMultiplier >= MAX_SHEEP_STRENGTH) {
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Max strength reached!"
        );
        return;
    }

    if (coins >= sheepCost) {
        coins -= sheepCost;
        sheepCost = Math.floor(sheepCost * 1.2);
        sheepOwned = true;
        sheepMultiplier = Math.min(MAX_SHEEP_STRENGTH, sheepMultiplier + 10);
        saveGame();
        updShop();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Upgrade Successful"
        );
        if (!soundMuted) sndBaa.play();

        document.getElementById("btnBuySheep").innerText =
            sheepMultiplier >= MAX_SHEEP_STRENGTH
                ? "Max Strength"
                : `Strength: ${sheepCost} coins`;

        const sheepImg = document.getElementById("sheepPet");
        sheepImg.style.display = "block";

        if (!sheepAutoInterval) {
            sheepAutoInterval = setInterval(() => {
                coins += power * sheepMultiplier;
                updateStats();
                const sword = document.getElementById("btnClick");
                const rect = sword.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                spawnFloatText(x, y, `+${power * sheepMultiplier}`);
            }, sheepTime);
        }

        updateStats();
    } else {
        if (!soundMuted) sndHurt.play();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "❌ Not enough coins"
        );
    }
}

function buyPet() {
    if (petMultiplier >= MAX_PET_STRENGTH) {
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Max strength reached!"
        );
        return;
    }

    if (coins >= petUpgradeCost) {
        coins -= petUpgradeCost;
        petUpgradeCost = Math.floor(petUpgradeCost * 1.2);
        petOwned = true;
        petMultiplier = Math.min(MAX_PET_STRENGTH, petMultiplier + 2);
        saveGame();
        updShop();
        unlockPinkTheme();

        if (!soundMuted) sndMeow.play();
        document.getElementById("btnBuyPet").innerText =
            petMultiplier >= MAX_PET_STRENGTH
                ? "Max Strength"
                : `Strength: ${petUpgradeCost} coins`;
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Pet upgraded!"
        );
        document.getElementById("btnPinkTheme").innerText = "Apply Pink Theme";

        const catImg = document.getElementById("catOnSword");
        catImg.style.display = "block";

        if (!autoInterval) {
            autoInterval = setInterval(() => {
                coins += power * petMultiplier;
                updateStats();
                const sword = document.getElementById("btnClick");
                const rect = sword.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                spawnFloatText(x, y, `+${power * petMultiplier}`);
            }, petTime);
        }

        updateStats();
    } else {
        if (!soundMuted) sndHurt.play();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "❌ Not enough coins"
        );
    }
}

// Initialize game
function initGame() {
    updateStats();
    // Check if player has submitted score this session
    currentScoreSubmitted = false;
    // Set up cat click events
    const catImg = document.getElementById("catOnSword");
    catImg.addEventListener("click", e => {
        if (!soundMuted) sndMeow.play();
        spawnFloatText(e.clientX, e.clientY, "❤️");
    });

    catImg.addEventListener("touchstart", e => {
        e.preventDefault();
        if (!soundMuted) sndMeow.play();
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        spawnFloatText(x, y, "❤️");
    });

    const SheepImage = document.getElementById("sheepPet");
    SheepImage.addEventListener("click", e => {
        if (!soundMuted) sndBaa.play();
        spawnFloatText(e.clientX, e.clientY, "❤️");
    });

    SheepImage.addEventListener("touchstart", e => {
        e.preventDefault();
        if (!soundMuted) sndBaa.play();
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        spawnFloatText(x, y, "❤️");
    });

    // Set up auto-save
    setInterval(saveGame, 30000);
    updateStats();
    setInterval(function () {
        if ((!petOwned && !sheepOwned) || soundMuted) return;

        if (Math.random() >= 0.5 && petOwned) {
            // For cat
            const catImg = document.getElementById("catOnSword");
            const catRect = catImg.getBoundingClientRect();
            const catX = catRect.left + catRect.width / 2;
            const catY = catRect.top + catRect.height / 2;
            if (!soundMuted) sndMeow.play();
            spawnFloatText(catX, catY, "❤️");
        } else if (sheepOwned) {
            // For sheep
            const sheepImg = document.getElementById("sheepPet");
            const sheepRect = sheepImg.getBoundingClientRect();
            const sheepX = sheepRect.left + sheepRect.width / 2;
            const sheepY = sheepRect.top + sheepRect.height / 2;

            if (!soundMuted) sndBaa.play();
            const sheepEmoji = currentTheme === "green" ? "❤️" : "😊";
            spawnFloatText(sheepX, sheepY, sheepEmoji);
        }
    }, 10000);
}

// Update shop UI
function updShop() {
    // Power upgrade button
    if (power >= MAX_POWER) {
        document.getElementById("btnUpgrade").innerText =
            "Maximum Power Reached";
    } else {
        document.getElementById(
            "btnUpgrade"
        ).innerText = `Upgrade: (${cost} coins)`;
    }

    // Pet section
    const petSection = document.getElementById("shopCatText");
    if (!petOwned) {
        document.getElementById(
            "btnBuyPet"
        ).innerText = `Buy: ${petUpgradeCost}`;
        petSection.innerHTML = "Buy the Cat to help collect Coins.<br>";
    } else {
        document.getElementById("btnBuyPet").innerText =
            petMultiplier >= MAX_PET_STRENGTH
                ? "Max Strength"
                : `Strength: ${petUpgradeCost} coins`;

        petSection.innerHTML = `
            Strength: ${petMultiplier}<br>
            Speed: ${(petTime / 1000).toFixed(1)}s <br>
            ${
                petTime > MIN_PET_TIME
                    ? `<button class="gameButton ${currentTheme}-theme" onclick="upgradePetSpeed()">
                    Speed: ${petSpeedCost} coins
                </button>`
                    : `<button class="gameButton ${currentTheme}-theme" disabled>
                    Max Speed
                </button>`
            }
        `;
    }

    // Sheep section
    const sheepSection = document.getElementById("shopSheepText");
    if (!sheepOwned) {
        document.getElementById("btnBuySheep").innerText = `Buy: ${sheepCost}`;
        sheepSection.innerHTML = "Buy the sheep to help collect coins.";
    } else {
        document.getElementById("btnBuySheep").innerText =
            sheepMultiplier >= MAX_SHEEP_STRENGTH
                ? "Max Strength"
                : `Upgrade: ${sheepCost}`;

        sheepSection.innerHTML = `
            Strength: ${sheepMultiplier}<br>
            Speed: ${(sheepTime / 1000).toFixed(1)}<br>
            ${
                sheepTime > MIN_SHEEP_TIME
                    ? `<button class="gameButton ${currentTheme}-theme" onclick="upgradeSheepSpeed()">
                    Speed: ${sheepSpeedCost} coins
                </button>`
                    : `<button class="gameButton ${currentTheme}-theme" disabled>
                    Max Speed
                </button>`
            }
        `;
        const SHEEP = document.getElementById("btnBuySheep");
        if (MAX_SHEEP_STRENGTH <= sheepMultiplier) {
            SHEEP.innerText = "Max strength";
        } else if (!sheepOwned) {
            SHEEP.innerText = "Buy: 20000";
        } else {
            SHEEP.innerText = `Strength: ${sheepCost}`;
        }
    }

    // Theme buttons
    if (!greenThemeOwned) {
        document.getElementById("btnGreenTheme").innerText =
            "Buy Green Theme: 300";
    } else {
        document.getElementById("btnGreenTheme").innerText =
            "Apply Green Theme";
    }

    if (!redThemeOwned) {
        document.getElementById("btnRedTheme").innerText = "Buy Red Theme: 250";
    } else {
        document.getElementById("btnRedTheme").innerText = "Apply Red Theme";
    }

    if (petOwned) {
        document.getElementById("btnPinkTheme").innerText = "Apply Pink Theme";
    }
}

// Update game stats display
function updateStats() {
    let statsHTML = `Coins: ${coins}<br>Power: ${power}`;

    document.getElementById("stats").innerHTML = statsHTML;

    if (power >= MAX_POWER) {
        document.getElementById("btnUpgrade").innerText =
            "Maximum Power Reached";
    } else {
        document.getElementById(
            "btnUpgrade"
        ).innerText = `Upgrade (${cost} coins)`;
    }
}

// Click handler
function clickIt(event) {
    coins += power;
    saveGame();
    if (!musicMuted) sndSweden.play();
    spawnFloatText(event.clientX, event.clientY, `+${power}`);
    updateStats();
}

// Upgrade handler
function upgrade(event) {
    if (power >= MAX_POWER) {
        spawnFloatText(event.clientX, event.clientY, "Max power reached!");
        return;
    }

    if (coins >= cost) {
        coins -= cost;
        saveGame();
        if (!soundMuted) sndSlash.play();
        cost = Math.floor(cost * 1.3);
        power = Math.min(MAX_POWER, power + 1);
        spawnFloatText(event.clientX, event.clientY, "Upgraded!");
    } else {
        if (!soundMuted) sndHurt.play();
        spawnFloatText(event.clientX, event.clientY, "❌ Not enough coins");
    }
    updateStats();
}

// Toggle shop visibility
function toggleShop() {
    const shop = document.getElementById("shopBox");
    updShop();

    if (!soundMuted) sndSweden.play();
    if (!soundMuted) sndClick.play();
    shop.style.display =
        shop.style.display === "none" || shop.style.display === ""
            ? "block"
            : "none";
}

// Create floating text effect
function spawnFloatText(x, y, text) {
    const float = document.createElement("div");
    float.className = "floatText";
    float.innerText = text;
    float.style.left = x + (Math.random() - 0.5) * 20 + "px";
    float.style.top = y - 30 + (Math.random() - 0.5) * 20 + "px";
    document.getElementById("floatContainer").appendChild(float);
    setTimeout(() => float.remove(), 800);
}

// Apply selected theme
function applyTheme(theme) {
    document.body.className = `${theme}-theme`;
    document.getElementById("shopBox").className = `shopBox ${theme}-theme`;
    document.getElementById(
        "leaderboardBox"
    ).className = `shopBox ${theme}-theme`;
    document.getElementById("loginScreen").className = `shopBox ${theme}-theme`;
    document.getElementById("body").className = `${theme}-theme`;
    document.getElementById(
        "submitScoreForm"
    ).className = `shopBox ${theme}-theme`;
    document.getElementById(
        "leaderboardBox"
    ).className = `shopBox ${theme}-theme`;
    document.querySelectorAll(".gameButton").forEach(btn => {
        btn.classList.remove(
            "default-theme",
            "pink-theme",
            "red-theme",
            "green-theme"
        );
        btn.classList.add(`${theme}-theme`);
    });

    document.getElementById("btnClick").className = `${theme}-theme`;

    if (theme == "green") {
        document.getElementById("grass").style.display = "block";
    } else {
        document.getElementById("grass").style.display = "none";
    }

    currentTheme = theme;
    updShop();
}

// Unlock pink theme
function unlockPinkTheme() {
    const btn = document.getElementById("btnPinkTheme");
    btn.disabled = false;
    btn.classList.remove("default-theme");
    btn.classList.add("pink-theme");
}

// Buy red theme
function buyRedTheme() {
    if (redThemeOwned) {
        applyTheme("red");
        return;
    }

    if (coins >= 250) {
        coins -= 250;
        redThemeOwned = true;
        applyTheme("red");
        document.getElementById("btnRedTheme").innerText = "Apply Red Theme";
        updateStats();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Red theme unlocked!"
        );
    } else {
        if (!soundMuted) sndHurt.play();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "❌ Not enough coins"
        );
    }
}

// Buy green theme
function buyGreenTheme() {
    if (greenThemeOwned) {
        applyTheme("green");
        updShop();
        return;
    }

    if (coins >= 300) {
        coins -= 300;
        greenThemeOwned = true;
        applyTheme("green");
        document.getElementById("btnGreenTheme").innerText =
            "Apply Green Theme";
        updateStats();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Green theme unlocked!"
        );
    } else {
        if (!soundMuted) sndHurt.play();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "❌ Not enough coins"
        );
    }
}

// Save game state
function saveGame() {
    if (!playerName || !playerPassword) return;

    const safeName = playerName.replace(/[^a-zA-Z0-9_-]/g, "_");

    const gameState = {
        coins,
        power,
        cost,
        petOwned,
        petUpgradeCost,
        petMultiplier,
        petTime,
        petSpeedCost,
        redThemeOwned,
        greenThemeOwned,
        currentTheme,
        sheepCost,
        sheepMultiplier,
        sheepOwned,
        sheepTime,
        sheepSpeedCost,
        version: 2 // helpful for future updates/migrations
    };

    // ☁️ Save game to cloud (Firebase)
    database.ref("users/" + safeName).set({
        password: playerPassword,
        data: gameState
    });

    // 🏆 Update leaderboard if new score is better
    const leaderboardRef = database.ref("leaderboard/" + safeName);
    leaderboardRef.once("value").then(snapshot => {
        const existing = snapshot.val();
        if (!existing || coins > existing.score) {
            leaderboardRef.set({
                name: playerName,
                score: coins,
                timestamp: Date.now()
            });
        }
    });

    // 💾 Save locally under per-user key
    localStorage.setItem("playerData_" + safeName, JSON.stringify(gameState));
}
// Load game state
function loadGame() {
    if (!playerName || !playerPassword) return;

    const safeName = playerName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const userRef = database.ref("users/" + safeName);

    userRef
        .once("value")
        .then(snapshot => {
            const data = snapshot.val();

            if (data && data.password === playerPassword) {
                if (data.data) {
                    // ✅ Cloud save found
                    applyGameState(data.data);
                } else {
                    // ⚠️ No cloud save, try localStorage fallback
                    console.warn(
                        "No cloud save found, checking localStorage..."
                    );

                    let localData = JSON.parse(
                        localStorage.getItem("playerData_" + safeName)
                    );

                    // Fallback to old generic save if per-user doesn't exist
                    if (!localData) {
                        localData = JSON.parse(
                            localStorage.getItem("playerData")
                        );
                        if (localData) {
                            // Upgrade old save to new format
                            localStorage.setItem(
                                "playerData_" + safeName,
                                JSON.stringify(localData)
                            );
                            localStorage.removeItem("playerData");
                        }
                    }

                    if (localData) {
                        applyGameState(localData);
                        // Optional: sync to cloud on first load
                        database.ref("users/" + safeName).set({
                            password: playerPassword,
                            data: localData
                        });
                    } else {
                        console.warn("No local save found either.");
                    }
                }
            } else {
                // ⚠️ Invalid password or new user, try local fallback
                console.warn(
                    "Invalid password or no cloud data. Checking localStorage..."
                );

                let localData = JSON.parse(
                    localStorage.getItem("playerData_" + safeName)
                );

                if (!localData) {
                    localData = JSON.parse(localStorage.getItem("playerData"));
                    if (localData) {
                        localStorage.setItem(
                            "playerData_" + safeName,
                            JSON.stringify(localData)
                        );
                        localStorage.removeItem("playerData");
                    }
                }

                if (localData) {
                    applyGameState(localData);
                    database.ref("users/" + safeName).set({
                        password: playerPassword,
                        data: localData
                    });
                } else {
                    console.warn("No local save found either.");
                }
            }
        })
        .catch(err => {
            // 🌐 Cloud failed, fallback to localStorage
            console.error("Cloud load failed, using local:", err);

            let localData = JSON.parse(
                localStorage.getItem("playerData_" + safeName)
            );

            if (!localData) {
                localData = JSON.parse(localStorage.getItem("playerData"));
                if (localData) {
                    localStorage.setItem(
                        "playerData_" + safeName,
                        JSON.stringify(localData)
                    );
                    localStorage.removeItem("playerData");
                }
            }

            if (localData) {
                applyGameState(localData);
                database.ref("users/" + safeName).set({
                    password: playerPassword,
                    data: localData
                });
            } else {
                console.warn("No local save found either.");
            }
        });
}

function applyGameState(gameState) {
    coins = gameState.coins || 0;
    power = gameState.power || 1;
    cost = gameState.cost || 10;
    petOwned = gameState.petOwned || false;
    petUpgradeCost = gameState.petUpgradeCost || 1000;
    petMultiplier = gameState.petMultiplier || 2;
    petTime = gameState.petTime || 1000;
    petSpeedCost = gameState.petSpeedCost || 4000;
    redThemeOwned = gameState.redThemeOwned || false;
    greenThemeOwned = gameState.greenThemeOwned || false;
    currentTheme = gameState.currentTheme || "default";
    sheepCost = gameState.sheepCost || 20000;
    sheepMultiplier = gameState.sheepMultiplier || 145;
    sheepOwned = gameState.sheepOwned || false;
    sheepTime = gameState.sheepTime || 6000;
    sheepSpeedCost = gameState.sheepSpeedCost || 15000;

    applyTheme(currentTheme);
    updateStats();
    updShop();
    // Apply cat state
    if (petOwned) {
        document.getElementById("catOnSword").style.display = "block";
        unlockPinkTheme();

        if (!autoInterval) {
            autoInterval = setInterval(() => {
                coins += power * petMultiplier;
                updateStats();
                const sword = document.getElementById("btnClick");
                const rect = sword.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                spawnFloatText(x, y, `+${power * petMultiplier}`);
            }, petTime);
        }
    }

    // Apply sheep state
    if (sheepOwned) {
        document.getElementById("sheepPet").style.display = "block";

        if (!sheepAutoInterval) {
            sheepAutoInterval = setInterval(() => {
                coins += power * sheepMultiplier;
                updateStats();
                const sword = document.getElementById("btnClick");
                const rect = sword.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                spawnFloatText(x, y, `+${power * sheepMultiplier}`);
            }, sheepTime);
        }
    }

    // Apply themes
    if (redThemeOwned) {
        document.getElementById("btnRedTheme").innerText = "Apply Red Theme";
    }

    if (greenThemeOwned) {
        document.getElementById("btnGreenTheme").innerText =
            "Apply Green Theme";
    }

    if (currentTheme === "green") {
        document.getElementById("grass").style.display = "block";
    } else {
        document.getElementById("grass").style.display = "none";
    }

    applyTheme(currentTheme);
}
// Reset game
function resetGame() {
    if (confirm("Are you sure you want to log Out?")) {
        localStorage.removeItem("swordClickerSave");
        localStorage.removeItem("playerInfo");
        localStorage.removeItem("playerData");

        playerName = null;
        playerPassword = null;

        document.getElementById("playerName").disabled = false;
        document.getElementById("playerPassword").disabled = false;
        document.getElementById("playerName").value = "";
        document.getElementById("playerPassword").value = "";

        location.reload();
    }
}

function petBox() {
    const pet = document.getElementById("petBox");
    if (!musicMuted) sndSweden.play();
    if (pet.style.display === "none") {
        pet.style.display = "block";
    } else {
        pet.style.display = "none";
    }
    pet.className = `shopBox ${currentTheme}-theme`;

    const sheep = document.getElementById("sheepStats");
    const cats = document.getElementById("catStats");

    if (!petOwned) {
        cats.innerHTML = "Locked";
    } else {
        cats.innerHTML = `The cat provides <strong>${
            petMultiplier * power
        } coins every ${
            petTime / 1000
        } seconds</strong>. A comfortable Cat which enjoys every place. Loves attention by the User.`;
    }

    if (!sheepOwned) {
        sheep.innerHTML = "Locked";
    } else {
        sheep.innerHTML = `The sheep provides <strong>${
            sheepMultiplier * power
        } coins every ${
            sheepTime / 1000
        } seconds</strong>. Although enjoys every place its favourite is green theme. It loves to play in the grass.`;
    }
}

musicButton.addEventListener("click", () => {
    if (!musicMuted) {
        sndSweden.pause();
        sndSweden.currentTime = 0;
        musicMuted = true;
        musicButton.innerText = "🔇 Music";
    } else {
        sndSweden.play();
        musicMuted = false;
        musicButton.innerText = "🔊 Music";
    }
});

soundButton.addEventListener("click", () => {
    soundMuted = !soundMuted;
    soundButton.innerText = soundMuted ? "🔇 Sound" : "🔊 Sound";
});

// Initialize on window load
window.addEventListener("load", function () {
    loadGame();
    initGame();
    updShop();
});

function upgradePetSpeed() {
    if (petTime <= MIN_PET_TIME) {
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Max speed reached!"
        );
        return;
    }

    if (coins >= petSpeedCost && petOwned) {
        coins -= petSpeedCost;
        petTime = Math.max(MIN_PET_TIME, petTime - 100);
        petSpeedCost = Math.floor(petSpeedCost * 2.5); // 75% increase

        clearInterval(autoInterval);
        autoInterval = setInterval(() => {
            coins += power * petMultiplier;
            updateStats();
            const sword = document.getElementById("btnClick");
            const rect = sword.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            spawnFloatText(x, y, `+${power * petMultiplier}`);
        }, petTime);

        saveGame();
        updShop();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Speed Upgraded!"
        );
        if (!soundMuted) sndMeow.play();
    } else {
        if (!soundMuted) sndHurt.play();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "❌ Need more coins"
        );
    }
}

function upgradeSheepSpeed() {
    if (sheepTime <= MIN_SHEEP_TIME) {
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Max speed reached!"
        );
        return;
    }

    if (coins >= sheepSpeedCost && sheepOwned) {
        coins -= sheepSpeedCost;
        sheepTime = Math.max(MIN_SHEEP_TIME, sheepTime - 1000);
        sheepSpeedCost = Math.floor(sheepSpeedCost * 3); // 75% increase

        clearInterval(sheepAutoInterval);
        sheepAutoInterval = setInterval(() => {
            coins += power * sheepMultiplier;
            updateStats();
            const sword = document.getElementById("btnClick");
            const rect = sword.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            spawnFloatText(x, y, `+${power * sheepMultiplier}`);
        }, sheepTime);

        saveGame();
        updShop();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Speed Upgraded!"
        );
        if (!soundMuted) sndBaa.play();
    } else {
        if (!soundMuted) sndHurt.play();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "❌ Can't upgrade"
        );
    }
}

function showCredits() {
    const credits = document.getElementById("creditsBox");
    credits.style.display = "block";
    credits.className = `shopBox ${currentTheme}-theme`;
    if (!soundMuted) sndClick.play();
}

function hideCredits() {
    document.getElementById("creditsBox").style.display = "none";
    if (!soundMuted) sndClick.play();
}

// Submit score to leaderboard

// Get top scores
function getLeaderboard(callback) {
    const leaderboardRef = database.ref("leaderboard").orderByChild("score");

    leaderboardRef.once("value", snapshot => {
        const scores = [];
        snapshot.forEach(childSnapshot => {
            scores.push(childSnapshot.val());
        });
        // Sort descending (highest first)
        callback(scores.sort((a, b) => b.score - a.score));
    });
}

// Toggle leaderboard visibility
function toggleLeaderboard() {
    const lb = document.getElementById("leaderboardBox");
    if (lb.style.display === "block") {
        lb.style.display = "none";
    } else {
        lb.style.display = "block";
        loadLeaderboard();
        // Show submit form if player hasn't submitted this session
        document.getElementById("submitScoreForm").style.display =
            currentScoreSubmitted ? "none" : "block";
        document.getElementById("currentScoreDisplay").textContent = coins;
    }
    if (!soundMuted) sndClick.play();
    if (currentScoreSubmitted) {
    }
}

// Load and display leaderboard
function loadLeaderboard() {
    getLeaderboard(scores => {
        const list = document.getElementById("leaderboardList");
        list.innerHTML = "";

        if (scores.length === 0) {
            list.innerHTML = "<p>No scores yet!</p>";
            return;
        }

        scores.forEach((entry, index) => {
            const entryEl = document.createElement("div");
            entryEl.className = "leaderboard-entry";
            entryEl.innerHTML = `
        <span>${index + 1}. ${entry.name}</span>
        <span>${entry.score.toLocaleString()}</span>
      `;
            list.appendChild(entryEl);
        });
    });
}

function getCurrentScore() {
    return coins;
}
// Submit player score
function loginOrRegister() {
    const nameInput = document.getElementById("playerName");
    const passInput = document.getElementById("playerPassword");

    // Just to be safe: ensure inputs are editable
    nameInput.disabled = false;
    passInput.disabled = false;

    const name = nameInput.value.trim();
    const pass = passInput.value.trim();

    if (!name || !pass) {
        alert("Enter name and password");
        return;
    }

    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const userRef = database.ref("users/" + safeName);

    document.getElementById("loadingText").style.display = "block"; // Show loading

    userRef
        .once("value")
        .then(snapshot => {
            const userData = snapshot.val();

            if (userData) {
                if (userData.password === pass) {
                    // ✅ Valid login
                    playerName = name;
                    playerPassword = pass;
                    currentScoreSubmitted = true;
                    localStorage.setItem(
                        "playerInfo",
                        JSON.stringify({ name, password: pass })
                    );
                    loadGame();
                    showGameUI(); // 👈 Make sure game is shown
                } else {
                    alert("Password incorrect");
                }
            } else {
                // 🆕 New user
                userRef
                    .set({
                        password: pass,
                        data: {}
                    })
                    .then(() => {
                        playerName = name;
                        playerPassword = pass;
                        currentScoreSubmitted = true;
                        localStorage.setItem(
                            "playerInfo",
                            JSON.stringify({ name, password: pass })
                        );
                        saveGame();
                        alert("Account created. Starting new game.");
                        showGameUI(); // 👈 Show game UI after new account
                    });
            }
        })
        .finally(() => {
            document.getElementById("loadingText").style.display = "none"; // Hide loading
        });
}

function showGameUI() {
    document.getElementById("gameUI").style.display = "block";
    document.getElementById("loginScreen").style.display = "none";

    document.getElementById("loadingText").style.display = "none";
}

function showLoading(show) {
    document.getElementById("loadingText").style.display = show
        ? "block"
        : "none";
}

function enableScoreSubmission(name, pass, score) {
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const playerRef = database.ref("leaderboard/" + safeName);

    playerRef
        .set({
            name: name,
            password: pass, // Save password with entry 🔐
            score: score,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        })
        .then(() => {
            // Disable name and password inputs after successful submission

            showLeaderboard();
        });
}

// Test Firebase connection
database
    .ref("test")
    .set({ connected: true })
    .then(() => console.log("Firebase connected successfully!"))
    .catch(e => console.error("Firebase error:", e));

window.addEventListener("load", () => {
    const savedInfo = JSON.parse(localStorage.getItem("playerInfo"));
    if (savedInfo && savedInfo.name && savedInfo.password) {
        document.getElementById("playerName").value = savedInfo.name;
        document.getElementById("playerPassword").value = savedInfo.password;

        // ❌ Don't disable inputs anymore
        // If you still want to disable only for valid data, you can enable this:
        // document.getElementById("playerName").disabled = true;
        // document.getElementById("playerPassword").disabled = true;
    } else {
        // 🧹 Just make sure inputs are enabled
        document.getElementById("playerName").disabled = false;
        document.getElementById("playerPassword").disabled = false;
    }
});

setInterval(() => {
    if (playerName && playerPassword) {
        saveGame();
    }
}, 30000); // Every 30 seconds

window.addEventListener("load", () => {
    const savedInfo = JSON.parse(localStorage.getItem("playerInfo"));
    if (savedInfo && savedInfo.name && savedInfo.password) {
        setTimeout(() => {
            document.getElementById("playerName").value = savedInfo.name;
            document.getElementById("playerPassword").value =
                savedInfo.password;
            showLoading(true);
            loginOrRegister();
        }, 200);
    }
});
