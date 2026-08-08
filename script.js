// --- 1. DATEN-SPEICHER & ANFANGSDATEN ---
const defaultRecipes = [
    {
        id: "default-pancakes", // ID hinzugefügt für Eindeutigkeit
        title: "Fluffy Pancakes",
        category: "Frühstück",
        time: "20",
image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=600",
        ingredients: ["200g Mehl", "200ml Milch", "2 Eier", "1 EL Zucker"],
        steps: [
            "Trockene Zutaten (Mehl, Zucker, Backpulver) in einer großen Schüssel miteinander vermengen.",
            "Milch und Eier verquirlen, dann langsam unter die trockenen Zutaten rühren, bis ein glatter Teig entsteht.",
            "Etwas Butter in einer Pfanne erhitzen und den Teig portionsweise bei mittlerer Hitze von beiden Seiten goldgelb backen.",
            "Die fertigen Pancakes auf einem Teller stapeln und warm mit reichlich Ahornsirup oder frischen Beeren servieren."
        ]
    }
];

let recipes = JSON.parse(localStorage.getItem('journalRecipes')) || defaultRecipes;

// Sicherstellen, dass alle alten Rezepte im Speicher eine ID besitzen
recipes.forEach(r => { if (!r.id) r.id = "recipe-" + Math.random().toString(36).substr(2, 9); });

// --- 2. ELEMENTE REFERENZIEREN ---
const homeScreen = document.getElementById('homeScreen');
const listScreen = document.getElementById('listScreen');
const recipeScreen = document.getElementById('recipeScreen');
const formScreen = document.getElementById('formScreen');

const btnOpenForm = document.getElementById('btnOpenForm');
const btnCloseForm = document.getElementById('btnCloseForm');
const btnBackToHome = document.getElementById('btnBackToHome');
const btnBackToList = document.getElementById('btnBackToList');
const btnEditRecipe = document.getElementById('btnEditRecipe'); // Neu
const btnSaveRecipe = document.getElementById('btnSaveRecipe'); // Neu
const formScreenTitle = document.getElementById('formScreenTitle'); // Neu

const recipeForm = document.getElementById('recipeForm');
const categoryRecipeList = document.getElementById('categoryRecipeList');
const currentCategoryTitle = document.getElementById('currentCategoryTitle');

const detailTitle = document.getElementById('detailTitle');
const detailTime = document.getElementById('detailTime');
const detailImage = document.getElementById('detailImage');
const detailIngredients = document.getElementById('detailIngredients');
const detailStepsList = document.getElementById('detailStepsList');

const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnDeleteRecipe = document.getElementById('btnDeleteRecipe');

let currentCategory = "";
let currentIdx = 0;
let activeStepsElements = [];
let currentOpenRecipe = null; // Neu: Merkt sich das aktuell geöffnete Rezept-Objekt
let editTargetRecipe = null; // Neu: Merkt sich, welches Rezept editiert wird (null = Neues Rezept)

// --- 3. FUNKTIONEN ---

function updateCategoryCounters() {
    const counts = { "Frühstück": 0, "Mittagessen": 0, "Dessert": 0, "Getränke": 0, "Snacks": 0, "Sonstiges": 0,};
    recipes.forEach(r => { if(counts[r.category] !== undefined) counts[r.category]++; });
    
    document.getElementById('countBreakfast').textContent = `${counts["Frühstück"]} ${counts["Frühstück"] === 1 ? 'Rezept' : 'Rezepte'} verfügbar`;
    document.getElementById('countLunch').textContent = `${counts["Mittagessen"]} ${counts["Mittagessen"] === 1 ? 'Rezept' : 'Rezepte'} verfügbar`;
    document.getElementById('countDessert').textContent = `${counts["Dessert"]} ${counts["Dessert"] === 1 ? 'Rezept' : 'Rezepte'} verfügbar`;
	document.getElementById('countGetränke').textContent = `${counts["Getränke"]} ${counts["Getränke"] === 1 ? 'Rezept' : 'Rezepte'} verfügbar`;
    document.getElementById('countSnacks').textContent = `${counts["Snacks"]} ${counts["Snacks"] === 1 ? 'Rezept' : 'Rezepte'} verfügbar`;
    document.getElementById('countSonstiges').textContent = `${counts["Sonstiges"]} ${counts["Sonstiges"] === 1 ? 'Rezept' : 'Rezepte'} verfügbar`;
}

function openCategory(categoryName) {
    currentCategory = categoryName;
    currentCategoryTitle.textContent = categoryName;
    
    const filtered = recipes.filter(r => r.category === categoryName);
    categoryRecipeList.innerHTML = "";
    
    if(filtered.length === 0) {
        categoryRecipeList.innerHTML = `<p style="text-align:center; color:#8e8e93; margin-top:20px;">Noch kein Rezept eingetragen.</p>`;
    } else {
        filtered.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <img src="${recipe.image}" alt="${recipe.title}">
                <div class="category-info">
                    <h3>${recipe.title}</h3>
                    <p>⏱️ ${recipe.time} Min.</p>
                </div>
            `;
            card.addEventListener('click', () => openRecipeDetail(recipe));
            categoryRecipeList.appendChild(card);
        });
    }
    
    homeScreen.classList.add('hidden');
    listScreen.classList.remove('hidden');
}

function openRecipeDetail(recipe) {
    currentOpenRecipe = recipe; // Aktuelles Rezept zwischenspeichern
    detailTitle.textContent = recipe.title;
    detailTime.textContent = `⏱️ ${recipe.time} Min.`;
    detailImage.src = recipe.image;
    
    detailIngredients.innerHTML = "";
    recipe.ingredients.forEach(ing => {
        const li = document.createElement('li');
        li.textContent = ing;
        detailIngredients.appendChild(li);
    });
    
    detailStepsList.innerHTML = "";
    recipe.steps.forEach((stepText, index) => {
        const stepCard = document.createElement('div');
        stepCard.className = 'step-card';
        stepCard.innerHTML = `
            <span class="step-number">Schritt ${index + 1}</span>
            <p>${stepText}</p>
        `;
        detailStepsList.appendChild(stepCard);
    });
    
    activeStepsElements = detailStepsList.querySelectorAll('.step-card');
    currentIdx = 0;
    updateSteps();
    
    listScreen.classList.add('hidden');
    recipeScreen.classList.remove('hidden');
}

function updateSteps() {
    activeStepsElements.forEach((step, index) => {
        step.classList.remove('active', 'prev', 'next');
        if (index === currentIdx) {
            step.classList.add('active');
        } else if (index === currentIdx - 1) {
            step.classList.add('prev');
        } else if (index === currentIdx + 1) {
            step.classList.add('next');
        }
    });
}

function textareaToArray(text) {
    return text.split('\n').map(line => line.trim()).filter(line => line !== "");
}

// --- 4. EVENT LISTENERS ---

document.getElementById('catBreakfast').addEventListener('click', () => openCategory('Frühstück'));
document.getElementById('catLunch').addEventListener('click', () => openCategory('Mittagessen'));
document.getElementById('catDessert').addEventListener('click', () => openCategory('Dessert'));
document.getElementById('catGetränke').addEventListener('click', () => openCategory('Getränke'));
document.getElementById('catSnacks').addEventListener('click', () => openCategory('Snacks'));
document.getElementById('catSonstiges').addEventListener('click', () => openCategory('Sonstiges'));


btnBackToHome.addEventListener('click', () => {
    listScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
    updateCategoryCounters();
});

btnBackToList.addEventListener('click', () => {
    recipeScreen.classList.add('hidden');
    listScreen.classList.remove('hidden');
    if (currentCategory) openCategory(currentCategory); // Liste erneuern
});

btnOpenForm.addEventListener('click', () => {
    editTargetRecipe = null; // Modus: Neu
    formScreenTitle.textContent = "Neues Rezept";
    btnSaveRecipe.textContent = "Rezept speichern 💾";
	btnDeleteRecipe.classList.add('hidden');
    recipeForm.reset();
    homeScreen.classList.add('hidden');
    formScreen.classList.remove('hidden');
});

btnCloseForm.addEventListener('click', () => {
    formScreen.classList.add('hidden');
    if (editTargetRecipe) {
        recipeScreen.classList.remove('hidden'); // Aus dem Editieren zurück zu Details
    } else {
        homeScreen.classList.remove('hidden'); // Sonst zurück zu Home
    }
    recipeForm.reset();
});

// Neu: Event Listener für den Bearbeiten-Modus
btnEditRecipe.addEventListener('click', () => {
    if (!currentOpenRecipe) return;
    editTargetRecipe = currentOpenRecipe;
    
    formScreenTitle.textContent = "Rezept bearbeiten";
    btnSaveRecipe.textContent = "Änderungen sichern 📝";
	btnDeleteRecipe.classList.remove('hidden');
    
    // Formular mit aktuellen Werten befüllen
    document.getElementById('formTitle').value = editTargetRecipe.title;
    document.getElementById('formCategory').value = editTargetRecipe.category;
    document.getElementById('formTime').value = editTargetRecipe.time;
    document.getElementById('formIngredients').value = editTargetRecipe.ingredients.join('\n');
    document.getElementById('formSteps').value = editTargetRecipe.steps.join('\n');
    
    recipeScreen.classList.add('hidden');
    formScreen.classList.remove('hidden');
});

btnNext.addEventListener('click', () => {
    if (currentIdx < activeStepsElements.length - 1) {
        currentIdx++;
        updateSteps();
    }
});

btnPrev.addEventListener('click', () => {
    if (currentIdx > 0) {
        currentIdx--;
        updateSteps();
    }
});

recipeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fileInput = document.getElementById('formImage');
    const file = fileInput.files[0];
    
    // Interne Speicherfunktion
    function processSave(imageSrc) {
        if (editTargetRecipe) {
            // BESTEHENDES REZEPT EDITIEREN
            const foundIndex = recipes.findIndex(r => r.id === editTargetRecipe.id);
            if (foundIndex !== -1) {
                recipes[foundIndex].title = document.getElementById('formTitle').value.trim();
                recipes[foundIndex].category = document.getElementById('formCategory').value;
                recipes[foundIndex].time = document.getElementById('formTime').value;
                recipes[foundIndex].ingredients = textareaToArray(document.getElementById('formIngredients').value);
                recipes[foundIndex].steps = textareaToArray(document.getElementById('formSteps').value);
                
                // Bild nur updaten, falls ein neues gewählt wurde
                if (imageSrc) recipes[foundIndex].image = imageSrc;
                
                // Details direkt aktualisiert anzeigen
                openRecipeDetail(recipes[foundIndex]);
            }
        } else {
            // NEUES REZEPT ANLEGEN
            const randomFoodImages = [
"https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=400",
"https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=400",
"https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=400"
            ];
            const chosenImage = imageSrc || randomFoodImages[Math.floor(Math.random() * randomFoodImages.length)];

            const newRecipe = {
                id: "recipe-" + Date.now(),
                title: document.getElementById('formTitle').value.trim(),
                category: document.getElementById('formCategory').value,
                time: document.getElementById('formTime').value,
                image: chosenImage,
                ingredients: textareaToArray(document.getElementById('formIngredients').value),
                steps: textareaToArray(document.getElementById('formSteps').value)
            };
            recipes.push(newRecipe);
            homeScreen.classList.remove('hidden');
        }
        
        localStorage.setItem('journalRecipes', JSON.stringify(recipes));
        recipeForm.reset();
        formScreen.classList.add('hidden');
        updateCategoryCounters();
        editTargetRecipe = null;
    }

    // Falls ein Bild hochgeladen wurde, lesen wir es aus
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            processSave(event.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        // Kein Bild gewählt -> Beim Editieren altes Bild behalten, bei Neuem random nutzen
        processSave(editTargetRecipe ? editTargetRecipe.image : null);
    }
});

btnDeleteRecipe.addEventListener('click', () => {
	if (!editTargetRecipe) return;
		const confirmDelete = confirm(`Möchtest du "${editTargetRecipe.title}"wirklich löschen?`);
		if (confirmDelete) {
			recipes = recipes.filter(r => r.id !== editTargetRecipe.id);
			localStorage.setItem('journalRecipes', JSON.stringify(recipes));
			recipeForm.reset();
			formScreen.classList.add('hidden');
			homeScreen.classList.remove('hidden');
			updateCategoryCounters();
			editTargetRecipe = null;
		}
	});

// --- 5. APP-START ---
updateCategoryCounters();

if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('./sw.js')
			.then(() => console.log('Service Worker erfolgreich registriert!'))
			.catch(() => console.log('Service Worker Fehler:', err));
	});
}