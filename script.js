// =====================================
// Art SF – script.js
// (the list of artworks is in data.js)
// =====================================


// ----- Get the parts of the page we need -----
let exploreScreen = document.getElementById("exploreScreen");
let detailScreen = document.getElementById("detailScreen");
let savedScreen = document.getElementById("savedScreen");
let aboutScreen = document.getElementById("aboutScreen");
let bottomNav = document.getElementById("bottomNav");

let searchInput = document.getElementById("searchInput");
let mediumFilter = document.getElementById("mediumFilter");
let neighborhoodFilter = document.getElementById("neighborhoodFilter");
let districtFilter = document.getElementById("districtFilter");

let artworkList = document.getElementById("artworkList");
let resultCount = document.getElementById("resultCount");
let detailContent = document.getElementById("detailContent");
let savedList = document.getElementById("savedList");


// ----- Things the app remembers -----
let lastScreen = "explore"; // where the back arrow on the detail page goes

// Saved artworks are stored in the browser so they stay after a refresh
let savedIds = JSON.parse(localStorage.getItem("savedArtworks")) || [];

// A color for each type of artwork
let typeColors = {
  "Metal Sculpture": "#2348b8",        // cobalt blue
  "Stone & Concrete": "#b04a0a",       // burnt orange
  "Tile, Mosaic & Ceramic": "#00796b", // teal
  "Painting & Mural": "#6d28d9",       // violet
  "Glass": "#0369a1",                  // sky blue
  "Photography & Print": "#3f7d1e",    // green
  "Other": "#57534e"                   // warm grey
};


// =====================================
// 1. FILL THE DROPDOWNS
// =====================================
function fillDropdowns() {
  let mediums = [];
  let neighborhoods = [];

  // Make a list of each medium and neighborhood, with no repeats
  for (let i = 0; i < artworks.length; i++) {
    if (!mediums.includes(artworks[i].category)) {
      mediums.push(artworks[i].category);
    }
    if (!neighborhoods.includes(artworks[i].neighborhood)) {
      neighborhoods.push(artworks[i].neighborhood);
    }
  }

  mediums.sort();
  neighborhoods.sort();

  // Add each one to its dropdown as an <option>
  for (let i = 0; i < mediums.length; i++) {
    mediumFilter.innerHTML += "<option>" + mediums[i] + "</option>";
  }
  for (let i = 0; i < neighborhoods.length; i++) {
    neighborhoodFilter.innerHTML += "<option>" + neighborhoods[i] + "</option>";
  }

  // San Francisco has 11 supervisor districts
  for (let i = 1; i <= 11; i++) {
    districtFilter.innerHTML += "<option>District " + i + "</option>";
  }
}


// =====================================
// 2. EXPLORE SCREEN (search + filters)
// =====================================
function showExplore() {
  let search = searchInput.value.toLowerCase();
  let results = [];

  for (let i = 0; i < artworks.length; i++) {
    let art = artworks[i];

    // All the text we want search to look through
    let text = (art.title + " " + art.artist + " " + art.medium + " " +
                art.location + " " + art.address + " " + art.neighborhood).toLowerCase();

    // Keep the artwork only if it passes the search AND all 3 filters
    // ("all" means that filter is turned off)
    if (text.includes(search) &&
        (mediumFilter.value === "all" || art.category === mediumFilter.value) &&
        (neighborhoodFilter.value === "all" || art.neighborhood === neighborhoodFilter.value) &&
        (districtFilter.value === "all" || art.district === districtFilter.value)) {
      results.push(art);
    }
  }

  resultCount.textContent = results.length + " artworks";

  if (results.length === 0) {
    artworkList.innerHTML = `
      <div class="message">
        <p>No artworks match your search.</p>
        <button type="button" class="outline-button" onclick="clearFilters()">Clear search and filters</button>
      </div>`;
  } else {
    showCards(results, artworkList);
  }
}

function clearFilters() {
  searchInput.value = "";
  mediumFilter.value = "all";
  neighborhoodFilter.value = "all";
  districtFilter.value = "all";
  showExplore();
}


// =====================================
// 3. CARDS (used on Explore and Saved)
// =====================================
function showCards(list, container) {
  container.innerHTML = "";

  for (let i = 0; i < list.length; i++) {
    let art = list[i];
    let isSaved = savedIds.includes(art.id); // true or false

    container.innerHTML += `
      <article class="card">
        <button type="button" class="card-open" onclick="showDetail(${art.id})">
          <span class="thumb" style="background:${typeColors[art.category]}">${art.category}</span>
          <span class="card-text">
            <span class="card-title">${art.title}</span>
            <span class="card-artist">${art.artist}</span>
            <span class="card-meta">${art.medium} – ${art.neighborhood}</span>
          </span>
        </button>
        <button type="button" class="bookmark" onclick="cardBookmark(${art.id})"
          aria-pressed="${isSaved}" aria-label="Save ${art.title}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>
        </button>
      </article>`;
  }
}

// When someone taps the bookmark on a card
function cardBookmark(id) {
  toggleSaved(id);
  // Redraw the list so the bookmark fills in (or empties)
  if (lastScreen === "saved") {
    showSaved();
  } else {
    showExplore();
  }
}


// =====================================
// 4. DETAIL SCREEN
// =====================================
function showDetail(id) {
  // Find the artwork with this id
  let art;
  for (let i = 0; i < artworks.length; i++) {
    if (artworks[i].id === id) {
      art = artworks[i];
    }
  }

  // Google Maps link using the artwork's location
  let mapLink = "https://www.google.com/maps/dir/?api=1&destination=" + art.latitude + "," + art.longitude;

  detailContent.innerHTML = `
    <span class="type-tag" style="background:${typeColors[art.category]}">${art.category}</span>
    <h1 class="detail-title">${art.title}</h1>
    <p class="detail-artist">${art.artist}</p>

    <dl class="detail-list">
      <div><dt>Created</dt><dd>${art.creationDate}</dd></div>
      <div><dt>Medium</dt><dd>${art.medium}</dd></div>
      <div><dt>Location</dt><dd>${art.location}</dd></div>
      <div><dt>Address</dt><dd>${art.address}</dd></div>
      <div><dt>Neighborhood</dt><dd>${art.neighborhood}</dd></div>
      <div><dt>Supervisor District</dt><dd>${art.district}</dd></div>
    </dl>

    <a class="main-button" href="${mapLink}" target="_blank">Get Directions</a>
    <button type="button" id="saveButton" class="outline-button" onclick="detailSave(${art.id})">${saveButtonText(art.id)}</button>
  `;

  showScreen("detail");
}

// The save button says something different if the artwork is already saved
function saveButtonText(id) {
  if (savedIds.includes(id)) {
    return "Saved ✓ (tap to remove)";
  }
  return "Save Artwork";
}

function goBack() {
  showScreen(lastScreen);
}


// =====================================
// 5. SAVED ARTWORKS
// =====================================
function toggleSaved(id) {
  if (savedIds.includes(id)) {
    // Already saved, so remove it
    savedIds.splice(savedIds.indexOf(id), 1);
  } else {
    // Not saved yet, so add it
    savedIds.push(id);
  }
  localStorage.setItem("savedArtworks", JSON.stringify(savedIds));
}

// When someone taps Save Artwork on the detail page
function detailSave(id) {
  toggleSaved(id);
  document.getElementById("saveButton").textContent = saveButtonText(id);
}

function showSaved() {
  let saved = [];
  for (let i = 0; i < artworks.length; i++) {
    if (savedIds.includes(artworks[i].id)) {
      saved.push(artworks[i]);
    }
  }

  if (saved.length === 0) {
    savedList.innerHTML = `
      <div class="message">
        <p>No saved artworks yet. Tap the bookmark on any artwork to save it here.</p>
      </div>`;
  } else {
    showCards(saved, savedList);
  }
}


// =====================================
// 6. SWITCHING SCREENS
// =====================================
function showScreen(name) {
  // Hide everything first
  exploreScreen.hidden = true;
  detailScreen.hidden = true;
  savedScreen.hidden = true;
  aboutScreen.hidden = true;
  bottomNav.hidden = false;
  document.getElementById("exploreTab").classList.remove("active");
  document.getElementById("savedTab").classList.remove("active");
  document.getElementById("aboutTab").classList.remove("active");

  // Then show the screen we want
  if (name === "explore") {
    exploreScreen.hidden = false;
    document.getElementById("exploreTab").classList.add("active");
    lastScreen = "explore";
    showExplore();
  }
  if (name === "saved") {
    savedScreen.hidden = false;
    document.getElementById("savedTab").classList.add("active");
    lastScreen = "saved";
    showSaved();
  }
  if (name === "about") {
    aboutScreen.hidden = false;
    document.getElementById("aboutTab").classList.add("active");
  }
  if (name === "detail") {
    detailScreen.hidden = false;
    bottomNav.hidden = true; // no bottom nav on the detail page
  }

  window.scrollTo(0, 0);
}


// =====================================
// 7. START THE APP
// =====================================
searchInput.oninput = showExplore;
mediumFilter.onchange = showExplore;
neighborhoodFilter.onchange = showExplore;
districtFilter.onchange = showExplore;

fillDropdowns();
showScreen("explore");
