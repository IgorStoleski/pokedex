let currentPokemon = [];
let currentSearchPokemon = null;
let offset = 0;
const limit = 15;
let colorData = {};
let currentIndex = -1;

async function loadPokemon() {
  let url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;
  let response = await fetch(url);
  let data = await response.json();
  let pokemonList = data.results;
  for (let i = 0; i < pokemonList.length; i++) {
    let pokemonUrl = pokemonList[i].url;
    let pokemonResponse = await fetch(pokemonUrl);
    let pokemonData = await pokemonResponse.json();
    currentPokemon.push(pokemonData);
    renderSmallPokemonInfo(pokemonData, i + offset);
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
    endOfLoadingAnimation();
    loadPokemon();
  });
});

function endOfLoadingAnimation() {
  document.getElementById("loader").classList.add("dis-none");
  document.getElementById("loadMoreBtn").classList.remove("d-none");
}

function renderPokemonInfo(pokemon, i) {
  const pokemonCard = document.getElementById("pokemonCard");
  const pokemonInfo = document.createElement("div");
  pokemonInfo.classList.add("pokemonContainer");
  pokemonCard.innerHTML = "";
  pokemonCard.appendChild(pokemonInfo);
  const idType1 = pokemon.types[0].type.name;
  const idType2 = pokemon.types.length > 1 ? pokemon.types[1].type.name : '';
  pokemonInfo.innerHTML = renderPokemonInfoContent(
    pokemon,
    idType1,
    idType2,
    i
  );
  pokemonInfo.classList.add(getBackgroundColor(pokemon));
}

function renderPokemonInfoContent(pokemon, idType1, idType2, i) {
  const capitalizedPokemonName = capitalize(pokemon.name);
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
    aboutStatsPokemon(i);
  }
  if (i == 0) {
    document.getElementById('left').classList.add('d-none');
  } else{
    document.getElementById('left').classList.remove('d-none');
  }
}

function forward(i) {
  if (i < currentPokemon.length - 1) {
    i++;
    renderPokemonInfo(currentPokemon[i], i);
    aboutStatsPokemon(i);
  }
  if (i == currentPokemon.length - 1) {
    document.getElementById('right').classList.add('d-none');
  } else{
    document.getElementById('right').classList.remove('d-none');
  }
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

document
  .getElementById("searchPokemonValue")
  .addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      searchPokemon();
    }
  });

async function searchPokemon() {
  let searchPokemon = document.getElementById("searchPokemonValue");
  let searchPokemonValue = searchPokemon.value;
  searchPokemonValue = searchPokemonValue.charAt(0).toLowerCase() + searchPokemonValue.slice(1);
  let url = `https://pokeapi.co/api/v2/pokemon/${searchPokemonValue}`;
  let response = await fetch(url);
  let searchPokemonData = await response.json();  
  
  if (searchPokemon.length < 1) {
    alert("Please enter a name to search the Pokemon!");
  } else {   
    searchPokemon.value = '';         
    currentSearchPokemon = searchPokemonData;
    displayPokemonInfo(searchPokemonData);
    
  }
}

function getPokemonData(pokemon){
  const pokemonName = pokemon.name.charAt(0).toLowerCase() + pokemon.name.slice(1);
  const type1 = pokemon.types[0].type.name;
  const type2 = pokemon.types.length > 1 ? pokemon.types[1].type.name : '';
  const pokePic = pokemon.sprites.other['official-artwork'].front_default;
  return {
    pokemonName: pokemonName,
    type1: type1,
    type2: type2,
    pokePic: pokePic
  };  
}

function displayPokemonInfo(pokemon) {  
  const { pokemonName, type1, type2, pokePic } = getPokemonData(pokemon);
  const pokemonCard = document.getElementById('pokemonCardSearch');
  const pokemonInfo = document.createElement('div');
  pokemonInfo.classList.add('pokemonContainer');
  pokemonInfo.classList.add(getBackgroundColorForSearch(pokemonName));
  pokemonInfo.innerHTML = renderPokemonContent(pokemonName, type1, type2, pokePic);
  pokemonCard.innerHTML = '';
  pokemonCard.appendChild(pokemonInfo);
  aboutStatsPokemonSearch(pokemon);
  document.getElementById("pokemonCardSearch").classList.remove("d-none");
}

function renderPokemonContent(pokemonName, type1, type2, pokePic) {
  const capitalizedPokemonName = capitalize(pokemonName);
  return /*html*/`
    <div class="pokedexCard">
      <div class="close">
        <img onclick="closeSearchPokemonCard(event)" class="cross" src="./img/x.svg" alt="">
      </div>
      <div class="type" id="pokedexSearch">
        <h1 id="searchPokemonName">${capitalizedPokemonName}</h1>
        <span id="searchType1">${type1}</span>
        <span id="searchType2">${type2}</span>
        <div><img id="pokemonImgSearch" src="${pokePic}" /></div>
      </div>
      <div class="infoContainer">
        <div class="image"></div>
        <div class="statsNav mt-24">
          <a id="tableContainerSearch" href="#" onclick="aboutStatsPokemonSearch()">About</a>
          <a href="#" onclick="baseStatsPokemonSearch()">Base Stats</a>
          <a href="#" onclick="moveStatsPokemonSearch()">Moves</a>
        </div>
        <div id="statsNavContentSearch"></div>
      </div>
    </div>
  `;
}

function renderSmallPokemonInfo(pokemon, i) {
  const smallPokemonInfo = document.createElement("div");
  smallPokemonInfo.classList.add("pokemonContainer");
  smallPokemonInfo.onclick = function () {
    openPokemonCard(i, pokemon.id);
    aboutStatsPokemon(i);
  };
  smallPokemonInfo.classList.add(getBackgroundColor(pokemon));
  const smallIdType1 = pokemon.types[0].type.name;
  const smallIdType2 = pokemon.types.length > 1 ? pokemon.types[1].type.name : '';
  smallPokemonInfo.innerHTML = renderSmallPokemonInfoContent(
    pokemon,
    smallIdType1,
    smallIdType2
  );
  document.getElementById("smallPokemonList").appendChild(smallPokemonInfo);
}

function renderSmallPokemonInfoContent(pokemon, smallIdType1, smallIdType2) {
  const capitalizedPokemonName = capitalize(pokemon.name);
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

function closeSearchPokemonCard(event) {
  event.stopPropagation(); // Verhindert, dass das Ereignis weitergeleitet wird
  document.getElementById("pokemonCardSearch").classList.add("d-none");
  currentSearchPokemon = null;
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

function getBackgroundColorForSearch(pokemon) {
  for (let color in colorData) {
    if (colorData[color].includes(pokemon)) {
      return color;
    }
  }
  return "gray"; // Standardfarbe, wenn keine Übereinstimmung gefunden wurde
}

function aboutStatsPokemon(i) {
  const aboutPokemon = document.getElementById("statsNavContent");
  const capitalizedPokemonName = capitalize(currentPokemon[i].name)
  aboutPokemon.innerHTML = '';
  const currentPokemonData = currentPokemon[i];
  if (currentPokemonData) {
    aboutPokemon.innerHTML = renderAboutStatsPokemon(
      currentPokemonData,
      capitalizedPokemonName
    );
  }
}

function aboutStatsPokemonSearch() {
  const statsPokemon = currentSearchPokemon;
  const aboutPokemon = document.getElementById("statsNavContentSearch");
  const capitalizedPokemonName = capitalize(statsPokemon.name);
  aboutPokemon.innerHTML = '';
  const currentPokemonData = statsPokemon;
  if (currentPokemonData) {
    aboutPokemon.innerHTML = renderAboutStatsPokemon(
      currentPokemonData,
      capitalizedPokemonName
    );
  }
}

function renderAboutStatsPokemon(currentPokemonData, capitalizedPokemonName) {
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

function baseStatsPokemon(i) {
  const baseStatsPokemon = document.getElementById("statsNavContent");
  baseStatsPokemon.innerHTML = '';
  const currentPokemonData = currentPokemon[i].stats;
  if (currentPokemonData) {
    baseStatsPokemon.innerHTML = renderBaseStatsPokemon(currentPokemonData);
  }
}

function baseStatsPokemonSearch() {
  const baseStatsPokemon = currentSearchPokemon;
  const baseStatsPokemonSearch = document.getElementById("statsNavContentSearch");
  baseStatsPokemonSearch.innerHTML = '';
  const currentPokemonData = baseStatsPokemon.stats;
  if (currentPokemonData) {
    baseStatsPokemonSearch.innerHTML = renderBaseStatsPokemon(currentPokemonData);
  }
}

function renderBaseStatsPokemon(currentPokemonData) {
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
    aboutPokemon.innerHTML = renderMoveStatsPokemon(currentPokemonData);
  }
}

function moveStatsPokemonSearch() {
  const moveStatsPokemon = currentSearchPokemon;
  const aboutPokemon = document.getElementById("statsNavContentSearch");
  aboutPokemon.innerHTML = '';
  const currentPokemonData = moveStatsPokemon;
  if (currentPokemonData) {
    aboutPokemon.innerHTML = renderMoveStatsPokemon(currentPokemonData);
  }
}

function renderMoveStatsPokemon(currentPokemonData) {
  return /*html*/ `
  <div class="infoMoves">
    <h3>Moves:</h3>
    <span>${currentPokemonData.moves
      .slice(0, 15)
      .map((move) => move.move.name)
      .join(", ")}</span>          
  </div>
`;
}
