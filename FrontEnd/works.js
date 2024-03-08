// Import des fonctions nécéssaires présentes dans les autres modules JS
import { openModal1 } from './modal.js';
import { closeModal1 } from './modal.js';

// Récupération des travaux eventuellement stockées dans le localStorage
async function loadWorks() {
    const worksToParse = window.localStorage.getItem('works');
    if (!worksToParse){
        // Récupération des travaux depuis l'API
        const worksReponse = await fetch('http://localhost:5678/api/works');
        const works = await worksReponse.json();
        // Transformation des travaux en JSON
        const worksString = JSON.stringify(works);
        // Stockage des informations dans le localStorage
        window.localStorage.setItem("works", worksString);
        return works;
    }else{
        const works = JSON.parse(worksToParse);
        return works;
    }
}

// Récupération des catégories
async function loadCategories() {
    const categoriesToParse = window.localStorage.getItem('categories');
    if (categoriesToParse === null) {
        const categoriesReponse = await fetch('http://localhost:5678/api/categories');
        const categories = await categoriesReponse.json();
        const categoriesString = JSON.stringify(categories);
        window.localStorage.setItem("categories", categoriesString);
        return categories;
    }else{
        const categories = JSON.parse(categoriesToParse);
        return categories;
    }   
}

// Génération des travaux et intégration
function genWorks(works){
    for (let i = 0; i < works.length; i++) {

        const figure = works[i];
        // Récupération de l'élément du DOM qui accueillera les fiches figures
        const sectionGallery = document.querySelector(".gallery");
        // Création d’une balise dédiée à un travail
        const workElement = document.createElement("figure");
        workElement.dataset.id = works[i].id;
        workElement.className = "workContainer";
        // Création des balises 
        const imageElement = document.createElement("img");
        imageElement.src = figure.imageUrl;
        imageElement.alt = figure.title;        
        const titleElement = document.createElement("figcaption");
        titleElement.innerText = figure.title;
        // Liaison de la balise figure a la section Gallery
        sectionGallery.appendChild(workElement);
        workElement.appendChild(imageElement);
        workElement.appendChild(titleElement);
    }
}

//MODAL
// Création de la gallerie dans Modal1
function genModalWorks(works){
    for (let i = 0; i < works.length; i++) {
        const figure = works[i];
        const sectionModalGallery = document.querySelector(".modal-gallery");
        const workElement = document.createElement("figure");
        workElement.dataset.id = works[i].id
        workElement.className = "workContainer";
        const imageElement = document.createElement("img");
        imageElement.src = figure.imageUrl;
        imageElement.alt = figure.title;        
        sectionModalGallery.appendChild(workElement);
        workElement.appendChild(imageElement);
        // création des boutons de suppresion
        const trashBtn = document.createElement("button");
        trashBtn.className = "fa-solid fa-trash-can trashBtn";
        trashBtn.type = "button";
        workElement.appendChild(trashBtn);
    }
}

// Fonction de suppression d'un Work dans la Modal
async function deleteWorks() {
    // Cible tous les icônes de suppression
    const trashBtns = document.querySelectorAll(".trashBtn");
    // Itère sur chaque bouton de suppression et ajoute un écouteur d'événements
    trashBtns.forEach(trashBtn => {
        trashBtn.addEventListener("click", async () => {
            // Demander une confirmation avant la suppression
            const confirmation = confirm("Voulez-vous vraiment supprimer cet élément ?");
            if (!confirmation) return; // Si l'utilisateur annule, sortir de la fonction

            const token = window.sessionStorage.getItem("token");
            const id = trashBtn.parentElement.dataset.id; // Obtenez l'ID du parent de l'icône

            try {
                const response = await fetch(`http://localhost:5678/api/works/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Accept": "*/*",
                        "Authorization": `Bearer ${token}`,
                    }
                });

                if (response.ok) {
                    // Supprimez le parent de l'icône de suppression
                    const parentElement = trashBtn.parentElement;
                    parentElement.remove();
                    // Réception de response en text
                    const responseData = await response.text(); 

                // Check if response data is not empty
                if (responseData.trim() !== "") {
                    console.log("Réponse après suppression :", responseData);
                    }
                    // Mise à jour des affichages après la suppression réussie
                    const updatedWorks = await loadWorks();
                    genWorks(updatedWorks);
                    genModalWorks(updatedWorks);
                } else {
                    console.error("La suppression de l'élément a échoué. Statut de réponse :", response.status);
                }
            } catch (error) {
                console.error("Problème lors de la suppression de l'élément :", error);
            }
        });
    });
}

// Ajout de Works dans la Modal
// Sélection de l'élément input de type file
const addPhotoFormBtnInput = document.querySelector(".addPhotoFormBtnInput");
const imgPreview = document.querySelector(".blueDivAdd");
// Sélection des parties à cacher lorsque le preview apparait
const addPhotoFormBtnAll = document.querySelector(".addPhotoFormBtn");
const imageWaiting = document.querySelector(".imageWaiting");
const imgFormat = document.querySelector(".imgFormat");
// Ajout d'un écouteur d'événements pour le changement de fichier
addPhotoFormBtnInput.addEventListener("change", function() {
    getImgData();
});
function getImgData() {
	const files = addPhotoFormBtnInput.files[0];
	if (files) {
		const fileReader = new FileReader();
        fileReader.readAsDataURL(files);
		fileReader.addEventListener("load", function () {
		imgPreview.style.display = "null";
		imgPreview.innerHTML = '<img src="' + this.result + '" />';

        imageWaiting.setAttribute('aria-hidden', true) ;
        imageWaiting.style.display = "none";
        addPhotoFormBtnAll.setAttribute('aria-hidden', true) ;
        addPhotoFormBtnAll.style.display = "none";
        imgFormat.setAttribute('aria-hidden', true) ;
        imgFormat.style.display = "none";
        });
	}
}

// Création de la fonction de validation du formulaire d'envoi de Works
// On écoute les événements de modification des champs
addPhotoFormBtnInput.addEventListener("change", validateForm);

const addPhotoTitle = document.querySelector("#addPhotoTitle");
addPhotoTitle.addEventListener("input", validateForm);

const addPhotoCategory = document.querySelector("#addPhotoCategory");
addPhotoCategory.addEventListener("change", validateForm);

const submitPhoto = document.querySelector(".submitPhoto");

// Validation du formulaire et activation du bouton Submit d'envoi
function validateForm() {
    // On vérifie si les champs sont remplis
    if (addPhotoFormBtnInput.value !== "" && addPhotoTitle.value !== "" && addPhotoCategory.value !== "0") {
        submitPhoto.disabled = false; // On active le bouton "submit"
        submitPhoto.classList.add("sendForm")
    } else {
        submitPhoto.classList.remove("sendForm")
        submitPhoto.disabled = true; // On désactive le bouton "submit"
    }
}
// On écoute l'envoi du nouveau projet
submitPhoto.addEventListener("click", async (e) => {
    e.preventDefault(); 
    validateForm();
    await postNewWork(addPhotoFormBtnInput, addPhotoTitle, addPhotoCategory);
})
// Function d'envoi du nouveau Work
async function postNewWork(addPhotoFormBtnInput, addPhotoTitle, addPhotoCategory) {
    console.log("Envoi d'un nouveau travail...");

    const formData = new FormData();
    const newWorkImg = addPhotoFormBtnInput.files[0];
    const newWorkTitle = addPhotoTitle.value;
    const newWorkCategory = addPhotoCategory.value;
    const token = window.sessionStorage.getItem("token");

    formData.append("image", newWorkImg);
    formData.append("title", newWorkTitle);
    formData.append("category", newWorkCategory);

    try {
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: formData,
        })
        console.log("Réponse du serveur :", response);

        if (response.ok) {
            const newWorks = await loadWorks();
            genModalWorks(newWorks);
            genWorks(newWorks);
        }
    } catch (error) 
        {   console.error("Erreur lors de l'envoi du travail :", error);
            alert("problème de connexion au serveur") 
        }
}

// EXEC
const works = await loadWorks();
const categories = await loadCategories();
genWorks(works);
genModalWorks(works);

// Création et activation des boutons de filtres
// Bouton affichage de tous projets
const allButton = document.createElement("button");
allButton.className = "filterButtons";
filterBar.appendChild(allButton);
allButton.textContent = "Tous";
allButton.addEventListener("click", function () {
    window.localStorage.removeItem("works");
    document.querySelector(".gallery").innerHTML = "";
    genWorks(works);
});

// Boutons par catégories
for (let category of categories) {
    const filterButtons = document.createElement("button");
    filterButtons.className = "filterButtons";
    filterButtons.dataset.id = category.id;
    filterButtons.textContent = category.name;
    filterBar.appendChild(filterButtons);

    filterButtons.addEventListener("click", function () {
    const worksObjects = works.filter(function (works) {
        return works.category.id === category.id;
    });
    document.querySelector(".gallery").innerHTML = "";
    genWorks(worksObjects);
});
}  

// Récupération des catégories pour intégration dans Select de la Modal
for (let category of categories) {
    let categorySelection = document.createElement("option");
    categorySelection.setAttribute("value", `${category.id}`);
    categorySelection.innerHTML = `${category.name}`;
    document.getElementById("addPhotoCategory").appendChild(categorySelection);
}

// Appel de la fonction pour ajouter les écouteurs d'événements une fois que les éléments sont générés
deleteWorks();
