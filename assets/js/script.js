let currentPokemon = [];
let offset = 0;
const limit = 15;
let colorData = {};
let currentIndex = -1;

async function loadAllPokemon() {
  let url = `https://pokeapi.co/api/v2/pokemon?offset=0&limit=10000`; // Ändere das Limit auf eine hohe Zahl, um alle Pokémon auf einmal zu laden
  let response = await fetch(url);
  let data = await response.json();
  let pokemonList = data.results;

  for (let i = 0; i < pokemonList.length; i++) {
    let pokemonUrl = pokemonList[i].url;
    let pokemonResponse = await fetch(pokemonUrl);
    let pokemonData = await pokemonResponse.json();
    console.log("Loaded Pokemon", pokemonData);
    currentPokemon.push(pokemonData);
  }
}

async function loadPokemon() {
  let startIndex = offset;
  let endIndex = offset + limit;

  for (let i = startIndex; i < endIndex; i++) {
    let pokemonData = currentPokemon[i];
    renderSmallPokemonInfo(pokemonData, i);
  }

  offset += limit;
}

async function fetchColorData() {
  for (let i = 1; i <= 10; i++) {
    let url = `https://pokeapi.co/api/v2/pokemon-color/${i}`;
    let response = await fetch(url);
    let data = await response.json();

    let colorName = data.name;
    let species = data.pokemon_species.map((pokemon) => pokemon.name);

    colorData[colorName] = species;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetchColorData().then(() => {
    loadAllPokemon().then(() => {
      endOfLoadingAnimation();
      loadPokemon();
    });
  });
});

function endOfLoadingAnimation(){
  document.getElementById('loader').classList.add('dis-none');
  document.getElementById('loadMoreBtn').classList.remove('d-none');
}

function renderPokemonInfo(pokemon, i) {
  let pokemonCard = document.getElementById("pokemonCard");
  let pokemonInfo = document.createElement("div");
  pokemonInfo.classList.add("pokemonContainer");
  pokemonCard.innerHTML = '';
  pokemonCard.appendChild(pokemonInfo);
  const idType1 = pokemon.types[0].type.name;
  const idType2 = pokemon.types.length > 1 ? pokemon.types[1].type.name : "";
  pokemonInfo.innerHTML = renderPokemonInfoContent(
    pokemon,
    idType1,
    idType2,
    i
  );
  pokemonInfo.classList.add(getBackgroundColor(pokemon));
}

function renderPokemonInfoContent(pokemon, idType1, idType2, i) {
  let capitalizedPokemonName =
    pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  return /*html*/ `
  <div class="pokedexCard">
    <div class="close"><img onclick="closePokemonCard(event)" class="cross" src="./img/x.svg" alt=""></div>
    <div class="type" id="pokedex">
      <h1 id="pokemonName">${capitalizedPokemonName}</h1>
      <span id="type1">${idType1}</span>
      <span id="type2">${idType2}</span>
      <div><img id="pokemonImg" src="${pokemon.sprites.other["official-artwork"].front_default}" /></div>
      <div class="leftRight">
        <img id="left" onclick="back(${i})" src="./img/chevron-left.svg" alt="">
        <img id="right" onclick="forward(${i})" src="./img/chevron-right.svg" alt="">
      </div>
    </div>
    <div class="infoContainer">
      <div class="image"></div>
      <div class="statsNav mt-24">
        <a id="tableContainer" href="#" onclick="aboutStatsPokemon(${i})">About</a>
        <a href="#" onclick="baseStatsPokemon(${i})">Base Stats</a>
        <a href="#" onclick="moveStatsPokemon(${i})">Moves</a>
      </div>
      <div id="statsNavContent"></div>
    </div>
  </div>
`;
}

function back(i) {
  if (i > 0) {
    i--;
    renderPokemonInfo(currentPokemon[i], i);
  }
}

function forward(i) {
  if (i < currentPokemon.length - 1) {
    i++;
    renderPokemonInfo(currentPokemon[i], i);
  }
}

document.getElementById('searchPokemonValue').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    searchPokemon();
  }
});

function searchPokemon() {
  const searchPokemon = document.getElementById('searchPokemonValue');
  if (searchPokemon.value.length < 1) {
    alert('Please enter a name to search the Pokemon!');
  }else{
    for (let i = 0; i < currentPokemon.length; i++) {
      const pokemon = currentPokemon[i];
      if (pokemon.name === searchPokemon.value) {
        searchPokemon.value = ''; 
        openPokemonCard(i);
      }
    }
    searchPokemon.value = '';
    alert('Pokemon not found.');
  }
  
}

function renderSmallPokemonInfo(pokemon, i) {
  let smallPokemonInfo = document.createElement("div");
  smallPokemonInfo.classList.add("pokemonContainer");
  smallPokemonInfo.onclick = function () {
    openPokemonCard(i, pokemon.id);
  };
  smallPokemonInfo.classList.add(getBackgroundColor(pokemon));
  let smallIdType1 = pokemon.types[0].type.name;
  let smallIdType2 = pokemon.types.length > 1 ? pokemon.types[1].type.name : '';
  smallPokemonInfo.innerHTML = renderSmallPokemonInfoContent(pokemon,smallIdType1,smallIdType2);
  document.getElementById("smallPokemonList").appendChild(smallPokemonInfo);
}

function renderSmallPokemonInfoContent(pokemon, smallIdType1, smallIdType2) {
  let capitalizedPokemonName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  return /*html*/ `
  <div class="smallPokemonInfo">
      <div>
          <h3 id="smallPokemonName">${capitalizedPokemonName}</h3>
          <div class="type">
            <span id="smallIdType1">${smallIdType1}</span>
            <span id="smallIdType2">${smallIdType2}</span>
          </div>
      </div>
      <div class="center"><img id="smallPokemonImg" src="${pokemon.sprites.other["official-artwork"].front_default}" alt="${pokemon.name}"></div>
  </div>
`;
}

function openPokemonCard(i) {
  document.getElementById("pokemonCard").classList.remove("d-none");
  renderPokemonInfo(currentPokemon[i], i);
}

function closePokemonCard(event) {
  event.stopPropagation(); // Verhindert, dass das Ereignis weitergeleitet wird
  document.getElementById("pokemonCard").classList.add("d-none");
}

function loadMorePokemon() {
  loadPokemon();
}

function createOnClickHandler(index) {
  return function () {
    openPokemonCard(index);
  };
}

function getBackgroundColor(pokemon) {
  for (let color in colorData) {
    if (colorData[color].includes(pokemon.name)) {
      return color;
    }
  }
  return "gray"; // Standardfarbe, wenn keine Übereinstimmung gefunden wurde
}

function aboutStatsPokemon(i) {
  const aboutPokemon = document.getElementById("statsNavContent");
  let capitalizedPokemonName = currentPokemon[i].name.charAt(0).toUpperCase() + currentPokemon[i].name.slice(1);
  aboutPokemon.innerHTML = '';
  const currentPokemonData = currentPokemon[i];
  if (currentPokemonData) {
    aboutPokemon.innerHTML = renderAboutStatsPokemon(currentPokemonData ,capitalizedPokemonName)
  }
}

function renderAboutStatsPokemon(currentPokemonData ,capitalizedPokemonName){
  return /*html*/ `
  <table class="infoTable">
    <tr>
      <th>Name:</th>
      <td>${capitalizedPokemonName}</td>
    </tr>
    <tr>
      <th>Height:</th>
      <td>${currentPokemonData.height}</td>
    </tr>
    <tr>
      <th>Weight:</th>
      <td>${currentPokemonData.weight}</td>
    </tr>
    <tr>
      <th>Abilities:</th>
      <td>${currentPokemonData.abilities
        .map((ability) => ability.ability.name)
        .join(", ")}</td>
    </tr>
  </table>
`;
}

function baseStatsPokemon (i) {
  const baseStatsPokemon = document.getElementById("statsNavContent");
  baseStatsPokemon.innerHTML = '';
  const currentPokemonData = currentPokemon[i].stats;
  if (currentPokemonData) {
    baseStatsPokemon.innerHTML = renderBaseStatsPokemon(currentPokemonData)
  }
}

function renderBaseStatsPokemon (currentPokemonData){
  return /*html*/ `
  <table class="infoTable">
    <tr>
      <th>HP:</th>
      <td>${currentPokemonData[0].base_stat}</td>
    </tr>
    <tr>
      <th>Attack:</th>
      <td>${currentPokemonData[1].base_stat}</td>
    </tr>
    <tr>
      <th>Defense:</th>
      <td>${currentPokemonData[2].base_stat}</td>
    </tr>
    <tr>
      <th>Special-Attack:</th>
      <td>${currentPokemonData[3].base_stat}</td>
    </tr>
    <tr>
      <th>Special-Defense:</th>
      <td>${currentPokemonData[4].base_stat}</td>
    </tr>
    <tr>
      <th>Speed:</th>
      <td>${currentPokemonData[5].base_stat}</td>
    </tr>
  </table>
`;
}

function moveStatsPokemon(i) {
  const aboutPokemon = document.getElementById("statsNavContent");
  aboutPokemon.innerHTML = '';
  const currentPokemonData = currentPokemon[i];
  if (currentPokemonData) {
    aboutPokemon.innerHTML = renderMoveStatsPokemon(currentPokemonData)
  }
}

function renderMoveStatsPokemon(currentPokemonData){
  return /*html*/ `
  <div class="infoMoves">
    <h3>Moves:</h3>
    <span>${currentPokemonData.moves.slice(0, 15)
    .map((move) => move.move.name)
    .join(", ")}</span>          
  </div>
`;
}