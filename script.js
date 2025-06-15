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

document.getElementById("playerName").disabled = false;
document.getElementById("playerPassword").disabled = false;

// Audio elements
const sndAria = new Audio("ariaMath.mp3");
const sndSweden = new Audio("sweden.mp3");
const sndMeow = new Audio("meow.mp3");
const sndHurt = new Audio("hurt.wav");
const sndSlash = new Audio("slash.wav");
const sndClick = new Audio("click.wav");
const sndBaa = new Audio("baa.wav");
const sndHowl = new Audio("howl.wav");
sndSweden.loop = true;
// Game state variables
let coins = 0;
let power = 1;
let cost = 10;
let petOwned = false;
let petUpgradeCost = 1000;
let petMultiplier = 0;
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
let petSpeedCost = 4000;
let sheepSpeedCost = 15000;
let playerName = "";
let currentScoreSubmitted = false;

// Max stats constants
const MAX_POWER = 70;
const MAX_PET_STRENGTH = 120;
const MAX_SHEEP_STRENGTH = 600;
const MIN_PET_TIME = 100;
const MIN_SHEEP_TIME = 500;
const MAX_WOLF_STRENGTH = 2000;
const MAX_WOLF_SPEED = 1000;

let petSpeedLevel = Math.floor((1000 - petTime) / 100);
let sheepSpeedLevel = Math.floor((6000 - sheepTime) / 1000);
let sheepLevel = Math.floor((sheepMultiplier - 145) / 5);
let petLevel = Math.floor(petMultiplier / 2);

// Add these variables at the top with other pet variables
let wolfLevel = 0;
let wolfMultiplier = 990;
let wolfAutoInterval = null;
let wolfTime = 10000;
let wolfSpeedCost = 100000;
let wolfCost = 150000;
let wolfSpeedLevel = 0;
let wolfOwned = false;
let rebirthCount = 0;
let rebirthCost = 10000000;
let rebirthMultiplier = 1;
let priceMultiplier = 1;

// Add to saveGame() function

function buyWolf() {
    if (wolfLevel >= 100) {
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Max strength reached!"
        );
        return;
    }

    document.getElementById("wolfPetSleeping").style.display = "block";

    const nextCost = calculateUpgradeCost(
        150000,
        200000000,
        wolfLevel + 1,
        100
    );

    if (coins >= nextCost) {
        coins -= nextCost;
        wolfLevel++;
        wolfMultiplier = Math.min(MAX_WOLF_STRENGTH, 1000 + wolfLevel * 10);
        wolfOwned = true;
        // Update cost for next level
        wolfCost =
            wolfLevel < 100
                ? Math.floor(
                      calculateUpgradeCost(
                          150000,
                          200000000,
                          wolfLevel + 1,
                          100
                      )
                  )
                : "Max Strength";

        saveGame();
        updShop();

        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Wolf upgraded!"
        );
        if (!soundMuted) sndHowl.play(); // Add this sound

        // Start auto-generation if not already running
        if (!wolfAutoInterval) {
            wolfAutoInterval = setInterval(() => {
                coins += power * wolfMultiplier * rebirthMultiplier;
                console.log("Wolf collected coins");
                updateStats();
                const sword = document.getElementById("btnClick");
                const rect = sword.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                spawnFloatText(
                    x,
                    y,
                    `+${power * wolfMultiplier * rebirthMultiplier}`
                );
            }, wolfTime);
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

function upgradeWolfSpeed() {
    if (wolfSpeedLevel >= 9) {
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Max speed reached!"
        );
        return;
    }

    const nextCost = calculateUpgradeCost(
        100000,
        10000000,
        wolfSpeedLevel + 1,
        9
    );

    if (coins >= nextCost && wolfLevel > 0) {
        coins -= nextCost;
        wolfSpeedLevel++;
        wolfTime = Math.max(MAX_WOLF_SPEED, wolfTime - 1000);

        // Update cost for next level
        wolfSpeedCost =
            wolfSpeedLevel < 9
                ? Math.floor(
                      calculateUpgradeCost(
                          100000,
                          10000000,
                          wolfSpeedLevel + 1,
                          9
                      )
                  )
                : "Max Speed";

        // Restart interval with new speed
        clearInterval(wolfAutoInterval);
        wolfAutoInterval = setInterval(() => {
            coins += power * wolfMultiplier * rebirthMultiplier;
            updateStats();
            const sword = document.getElementById("btnClick");
            const rect = sword.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            spawnFloatText(
                x,
                y,
                `+${power * wolfMultiplier * rebirthMultiplier}`
            );
        }, wolfTime);

        saveGame();
        updShop();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Wolf Speed Upgraded!"
        );
        if (!soundMuted) sndHowl.play();
    } else {
        if (!soundMuted) sndHurt.play();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "❌ Can't upgrade"
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

    petLevel = Math.floor(petMultiplier / 2);
    const nextCost = calculateUpgradeCost(1000, 1000000000, petLevel + 1, 89);

    if (coins >= nextCost) {
        coins -= nextCost;
        petUpgradeCost = Math.floor(
            calculateUpgradeCost(1000, 1000000000, petLevel + 2, 90)
        );
        petOwned = true;
        petLevel++;
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
                coins += power * petMultiplier * rebirthMultiplier;
                updateStats();
                const sword = document.getElementById("btnClick");
                const rect = sword.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                spawnFloatText(
                    x,
                    y,
                    `+${power * petMultiplier * rebirthMultiplier}`
                );
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

function upgradePetSpeed() {
    if (petTime <= MIN_PET_TIME) {
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Max speed reached!"
        );
        return;
    }

    petSpeedLevel = Math.floor((1000 - petTime) / 100);
    const nextCost = calculateUpgradeCost(4000, 5000000, petSpeedLevel + 1, 9);

    if (coins >= nextCost && petOwned) {
        coins -= nextCost;
        petTime = Math.max(MIN_PET_TIME, petTime - 100);
        petSpeedLevel++;
        petSpeedCost = Math.floor(
            calculateUpgradeCost(4000, 5000000, petSpeedLevel + 1, 9)
        );

        clearInterval(autoInterval);
        autoInterval = setInterval(() => {
            coins += power * petMultiplier * rebirthMultiplier;
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

function buySheep() {
    if (sheepMultiplier >= MAX_SHEEP_STRENGTH) {
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Max strength reached!"
        );
        return;
    }

    sheepLevel = Math.floor((sheepMultiplier - 145) / 5);
    const nextCost = calculateUpgradeCost(
        20000,
        1400000000,
        sheepLevel + 1,
        90
    );

    if (coins >= nextCost) {
        coins -= nextCost;
        sheepCost = Math.floor(
            calculateUpgradeCost(20000, 1400000000, sheepLevel + 2, 90)
        );
        sheepOwned = true;
        sheepLevel++;
        sheepMultiplier = Math.min(MAX_SHEEP_STRENGTH, sheepMultiplier + 5);
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
                coins += power * sheepMultiplier * rebirthMultiplier;
                updateStats();
                const sword = document.getElementById("btnClick");
                const rect = sword.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                spawnFloatText(
                    x,
                    y,
                    `+${power * sheepMultiplier * rebirthMultiplier}`
                );
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

function upgradeSheepSpeed() {
    if (sheepTime <= MIN_SHEEP_TIME) {
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            "Max speed reached!"
        );
        return;
    }

    sheepSpeedLevel = Math.floor((6000 - sheepTime) / 1000);
    const nextCost = calculateUpgradeCost(
        15000,
        5000000,
        sheepSpeedLevel + 1,
        6
    );

    if (coins >= nextCost && sheepOwned) {
        coins -= nextCost;
        sheepTime = Math.max(MIN_SHEEP_TIME, sheepTime - 1000);
        sheepSpeedLevel++;
        sheepSpeedCost = Math.floor(
            calculateUpgradeCost(15000, 5000000, sheepSpeedLevel + 1, 6)
        );

        clearInterval(sheepAutoInterval);
        sheepAutoInterval = setInterval(() => {
            coins += power * sheepMultiplier * rebirthMultiplier;
            updateStats();
            const sword = document.getElementById("btnClick");
            const rect = sword.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;
            spawnFloatText(
                x,
                y,
                `+${power * sheepMultiplier * rebirthMultiplier}`
            );
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

function calculateUpgradeCost(basePrice, finalPrice, level, maxLevel) {
    const exponent = (level - 1) / (maxLevel - 1);
    return Math.floor(
        basePrice * Math.pow(finalPrice / basePrice, exponent) * priceMultiplier
    );
}

function clickIt(event) {
    coins += power * rebirthMultiplier;
    saveGame();
    if (!musicMuted) sndSweden.play();
    spawnFloatText(
        event.clientX,
        event.clientY,
        `+${power * rebirthMultiplier}`
    );
    updateStats();
}

function upgrade(event) {
    if (power >= MAX_POWER) {
        spawnFloatText(event.clientX, event.clientY, "Max power reached!");
        return;
    }

    if (coins >= cost) {
        coins -= cost;

        if (!soundMuted) sndClick.play();
        cost = Math.floor(calculateUpgradeCost(10, 1000000000, power + 1, 69));
        power = Math.min(MAX_POWER, power + 1);
        saveGame();
        spawnFloatText(event.clientX, event.clientY, "Upgraded!");
    } else {
        if (!soundMuted) sndHurt.play();
        spawnFloatText(event.clientX, event.clientY, "❌ Not enough coins");
    }
    updateStats();
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
        wolfOwned,
        wolfLevel,
        wolfMultiplier,
        wolfTime,
        wolfSpeedCost,
        wolfCost,
        wolfSpeedLevel,
        rebirthCount,
        rebirthCost,
        rebirthMultiplier,
        priceMultiplier,
        version: 2
    };

    // ☁️ Save game to cloud (Firebase)
    database.ref("users/" + safeName).set({
        password: playerPassword,
        data: gameState
    });

    // 🏆 Update leaderboard if new score is better
    // 🏆 Update leaderboard if new score is better OR rebirth count changed
    // 🏆 Update leaderboard (replace this part in saveGame())
    const leaderboardRef = database.ref("leaderboard/" + safeName);
    leaderboardRef.once("value").then(snapshot => {
        const existing = snapshot.val();

        // Prepare updated data object
        const updatedData = {};

        // Only update score if it's higher
        if (!existing || coins > (existing.score || 0)) {
            updatedData.score = coins;
        }

        // Only update rebirths if it's higher
        if (!existing || rebirthCount > (existing.rebirths || 0)) {
            updatedData.rebirths = rebirthCount;
        }

        if (Object.keys(updatedData).length > 0) {
            updatedData.name = playerName;
            updatedData.timestamp = firebase.database.ServerValue.TIMESTAMP;

            leaderboardRef.update(updatedData).then(() => {
                console.log("✅ Leaderboard updated with:", updatedData);
            });
        }
    });
    // 💾 Save locally under per-user key
    localStorage.setItem("playerData_" + safeName, JSON.stringify(gameState));
}

// Load game state
async function loadGame() {
    if (!playerName || !playerPassword) return;

    const safeName = playerName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const userRef = database.ref("users/" + safeName);

    try {
        // 1️⃣ FIRST TRY: Load from Firebase (Cloud)
        const snapshot = await userRef.once("value");
        const cloudData = snapshot.val();

        if (cloudData?.password === playerPassword) {
            if (cloudData.data) {
                // ✅ Cloud data exists and password matches
                console.log("✅ Loaded from cloud successfully!");
                applyGameState(cloudData.data);
                return; // Exit early on success
            } else {
                console.warn(
                    "⚠️ No cloud save found, falling back to localStorage..."
                );
            }
        } else {
            console.warn(
                "⚠️ Invalid password or no cloud data, falling back to localStorage..."
            );
        }

        // 2️⃣ SECOND TRY: Fallback to localStorage
        const localData = getLocalStorageData(safeName);

        if (localData) {
            console.log("✅ Loaded from localStorage fallback!");
            applyGameState(localData);

            // Optional: Sync localStorage data back to cloud (if credentials are correct)
            if (cloudData?.password === playerPassword || !cloudData) {
                await userRef.set({
                    password: playerPassword,
                    data: localData
                });
                console.log("🔄 Local data synced to cloud!");
            }
        } else {
            console.warn("❌ No local or cloud save found. Starting fresh.");
        }
    } catch (err) {
        console.error(
            "🌐 Cloud load failed, falling back to localStorage:",
            err
        );

        // 3️⃣ THIRD TRY: If Firebase fails entirely, check localStorage
        const localData = getLocalStorageData(safeName);

        if (localData) {
            console.log("✅ Loaded from localStorage after cloud failure!");
            applyGameState(localData);

            // Try to sync to cloud if possible (but don't block on errors)
            userRef
                .set({
                    password: playerPassword,
                    data: localData
                })
                .catch(e => console.error("Failed to sync to cloud:", e));
        } else {
            console.warn("❌ No local or cloud save found. Starting fresh.");
        }
    }
}

// Helper function to get localStorage data (with legacy support)
function getLocalStorageData(safeName) {
    let localData = JSON.parse(localStorage.getItem("playerData_" + safeName));

    // Fallback to old generic save if per-user doesn't exist
    if (!localData) {
        localData = JSON.parse(localStorage.getItem("playerData"));
        if (localData) {
            // Migrate to new format
            localStorage.setItem(
                "playerData_" + safeName,
                JSON.stringify(localData)
            );
            localStorage.removeItem("playerData");
        }
    }

    return localData;
}

function applyGameState(gameState) {
    coins = gameState.coins || 0;
    power = gameState.power || 1;
    cost = gameState.cost || 10;
    petOwned = gameState.petOwned || false;
    petUpgradeCost = gameState.petUpgradeCost || 1000;
    petMultiplier = gameState.petMultiplier || 0;
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
    wolfOwned = gameState.wolfOwned || false;
    wolfLevel = gameState.wolfLevel || 0;
    wolfMultiplier = gameState.wolfMultiplier || 990;
    wolfTime = gameState.wolfTime || 10000;
    wolfSpeedCost = gameState.wolfSpeedCost || 100000;
    wolfCost = gameState.wolfCost || 150000;
    wolfSpeedLevel = gameState.wolfSpeedLevel || 0;
    rebirthCount = gameState.rebirthCount || 0;
    rebirthMultiplier = gameState.rebirthMultiplier || 1;
    priceMultiplier = gameState.priceMultiplier || 1;
    rebirthCost = gameState.rebirthCost || 10000000;

    applyTheme(currentTheme);
    updateStats();
    updShop();

    if (wolfOwned) {
        document.getElementById("wolfPetSleeping").style.display = "block";

        if (!wolfAutoInterval) {
            wolfAutoInterval = setInterval(() => {
                coins += power * wolfMultiplier * rebirthMultiplier;
                updateStats();
                const sword = document.getElementById("btnClick");
                const rect = sword.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                spawnFloatText(
                    x,
                    y,
                    `+${power * wolfMultiplier * rebirthMultiplier}`
                );
            }, wolfTime);
        }
    }

    // Apply cat state
    if (petOwned) {
        document.getElementById("catOnSword").style.display = "block";
        unlockPinkTheme();

        if (!autoInterval) {
            autoInterval = setInterval(() => {
                coins += power * petMultiplier * rebirthMultiplier;
                updateStats();
                const sword = document.getElementById("btnClick");
                const rect = sword.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                spawnFloatText(
                    x,
                    y,
                    `+${power * petMultiplier * rebirthMultiplier}`
                );
            }, petTime);
        }
    }

    // Apply sheep state
    if (sheepOwned) {
        document.getElementById("sheepPet").style.display = "block";

        if (!sheepAutoInterval) {
            sheepAutoInterval = setInterval(() => {
                coins += power * sheepMultiplier * rebirthMultiplier;
                updateStats();
                const sword = document.getElementById("btnClick");
                const rect = sword.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                spawnFloatText(
                    x,
                    y,
                    `+${power * sheepMultiplier * rebirthMultiplier}`
                );
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

function resetGameProgress() {
    // Reset power and click upgrades
    power = 1;
    cost = Math.floor(10 * priceMultiplier);

    // Reset pets
    wolfLevel = 0;
    wolfMultiplier = 1000;
    wolfOwned = false;
    wolfTime = 10000;
    wolfSpeedLevel = 0;
    clearInterval(wolfAutoInterval);
    wolfAutoInterval = null;

    petMultiplier = 0;
    petOwned = false;
    petTime = 1000;
    petSpeedLevel = 0;
    clearInterval(autoInterval);
    autoInterval = null;

    sheepMultiplier = 145;
    sheepOwned = false;
    sheepTime = 6000;
    sheepSpeedLevel = 0;
    clearInterval(sheepAutoInterval);
    sheepAutoInterval = null;

    // Recalculate initial costs with priceMultiplier
    petUpgradeCost = Math.floor(1000 * priceMultiplier);
    sheepCost = Math.floor(20000 * priceMultiplier);
    wolfCost = Math.floor(150000 * priceMultiplier);
    petSpeedCost = Math.floor(4000 * priceMultiplier);
    sheepSpeedCost = Math.floor(15000 * priceMultiplier);
    wolfSpeedCost = Math.floor(100000 * priceMultiplier);

    // Reset pet displays
    document.getElementById("wolfPetSleeping").style.display = "none";
    document.getElementById("catOnSword").style.display = "none";
    document.getElementById("sheepPet").style.display = "none";

    // Update shop buttons (now using the recalculated costs)
    document.getElementById("btnBuyPet").innerText = `Buy: ${petUpgradeCost}`;
    document.getElementById("btnBuySheep").innerText = `Buy: ${sheepCost}`;
    document.getElementById("btnBuyWolf").innerText = `Buy: ${wolfCost}`;
}

function rebirth() {
    if (coins >= rebirthCost) {
        coins = 0; // Reset coins
        rebirthCount++;

        // Increase multipliers
        rebirthMultiplier += 1; // 50% more coin gains
        priceMultiplier += 0.25; // 25% higher prices

        // Calculate next rebirth cost (5x increase)
        rebirthCost *= 5;

        // Reset all game progress
        resetGameProgress();

        // Save and update
        saveGame();
        updateStats();
        updShop();

        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            `Rebirth ${rebirthCount} complete! +50% gains`
        );

        if (!soundMuted) sndHowl.play(); // Or any other celebratory sound
    } else {
        if (!soundMuted) sndHurt.play();
        spawnFloatText(
            window.innerWidth / 2,
            window.innerHeight / 2,
            `❌ Need ${rebirthCost.toLocaleString()} coins`
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
    document.getElementById("btnRebirth").innerText = `Rebirth: ${rebirthCost}`;

    // --- WOLF SECTION ---
    const wolfBtn = document.getElementById("btnBuyWolf");
    const wolfSpeedBtn = document.getElementById("upgWolfSpeed");
    const wolfText = document.getElementById("shopWolfText");

    if (!wolfOwned) {
        wolfBtn.innerText = `Buy: ${wolfCost}`;
        wolfSpeedBtn.style.display = "none";
        wolfText.innerHTML = `Buy the wolf to help collect coins.<br>More powerful than Sheep or Cat but more expensive too.`;
    } else {
        // Show basic stats
        wolfText.innerHTML = `Strength: ${wolfMultiplier}<br>Speed: ${(
            wolfTime / 1000
        ).toFixed(1)} seconds`;

        // Handle strength upgrade button
        if (wolfMultiplier >= MAX_WOLF_STRENGTH || wolfLevel >= 100) {
            wolfBtn.innerText = `Max Strength`;
        } else {
            wolfBtn.innerText = `Strength: ${wolfCost}`;
        }

        // Handle speed upgrade
        if (wolfTime <= MAX_WOLF_SPEED) {
            wolfSpeedBtn.innerText = `Max Speed`;
        } else {
            wolfSpeedBtn.innerText = `Speed: ${wolfSpeedCost}`;
        }

        wolfSpeedBtn.style.display = "block";
    }

    // ... (rest of your shop code for pets, sheep, etc.)

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
    let statsHTML = `Coins: ${Math.floor(coins)}<br>Power: ${power}`;

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
                <span class="leaderboard-rank">${index + 1}.</span>
                <span class="leaderboard-name">${entry.name}</span>
                <span class="leaderboard-score">${entry.score.toLocaleString()}</span>
                
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

function enableScoreSubmission(name, pass, score, rebirthCount) {
    console.log("function called");
    console.log(`rebirthcount: ${rebirthCount}`);
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    const playerRef = database.ref("leaderboard/" + safeName);

    playerRef
        .set({
            name: name,
            password: pass, // Save password with entry 🔐

            score: score,
            rebirths: rebirthCount,
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

function toggleRebirth() {
    const rebirthElement = document.getElementById("rebirthScreen");

    if (
        rebirthElement.style.display === "none" ||
        rebirthElement.style.display === ""
    ) {
        rebirthElement.style.display = "block";
    } else {
        rebirthElement.style.display = "none";
    }

    if (!soundMuted) sndClick.play();
    document.getElementById(
        "rebirthMultiplier"
    ).innerHTML = `Rebirth Multiplier:${rebirthMultiplier}`;
    document.getElementById(
        "priceMultiplier"
    ).innerHTML = `priceMultiplier:${priceMultiplier}`;
}
