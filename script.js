// Current number of pokemon generations that exist. Value can be updated when new generation is released.
const POKEMON_GEN_COUNT = 9;


const pokemonContainer = document.querySelector('#pokemon-container');
const pokemonDetails = document.querySelector('#pokemon-details');
const generatePkmnPreviewHTML = () => {



}

const generatePokemonPreview = (id, name, sprite, types) => {
    const previewContainer = document.createElement('div');
    const title = document.createElement('h2');
    const img = document.createElement('img');
    const typesList = document.createElement('p');

    previewContainer.id = "pokemon-preview";
    title.innerText = `#${id} ${name}`
    img.src = `${sprite}`
    typesList.innerText = `Types: ${types.map(type => type.type.name).join(" ")}`

    previewContainer.append(title);
    previewContainer.append(img);
    previewContainer.append(typesList);

    return previewContainer;
}

const generatePokemonInfo = (moves) => {
    const pokemonInfoContainer = document.createElement('div');
    const movesList = document.createElement('ul');
    pokemonInfoContainer.id = "pokemon-info";
    moves.forEach(move => {
        const moveLiItem = document.createElement('li');
        moveLiItem.innerText = move.move.name
        movesList.appendChild(moveLiItem);
    })

    pokemonInfoContainer.appendChild(movesList);
    return pokemonInfoContainer;
}

const fetchGenIPokemon = async () => {
    try {
        const promises = [];
        for (let i = 1; i <= 151; i++) {
            promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}/`))
        }
        const responses = await Promise.all(promises);
        const data = await Promise.all(responses.map(response => response.json()));
        pokemonContainer.innerHTML = data.map(pokemon => {
            return `
            <div data-id="${pokemon.id}"class="pokemon-card">
                <h2>${pokemon.name}</h2>
                <img src="${pokemon.sprites.other['official-artwork']['front_default']}"/>
            </div>
            `
        }).join("")

        const pokemonCards = document.querySelectorAll('.pokemon-card')

        pokemonCards.forEach(card => card.addEventListener('click', () => {
            const pokemonData = data[card.dataset.id - 1];

            const pokemon = {
                id: pokemonData.id,
                name: pokemonData.name,
                sprite: pokemonData.sprites.other['official-artwork']['front_default'],
                types: pokemonData.types,
                moves: pokemonData.moves
            }

            const pokemonPreviewHTML = generatePokemonPreview(
                pokemon.id,
                pokemon.name,
                pokemon.sprite,
                pokemon.types
            )

            const pokemonInfoHTML = generatePokemonInfo(pokemon.moves)

            console.log(pokemonData)
            const placeholder = document.querySelector("#pokemon-details-placeholder");
            const oldPokemonPreview = document.querySelector("#pokemon-preview")
            const oldPokemonInfo = document.querySelector("#pokemon-info")
            if (placeholder) {
                pokemonDetails.removeChild(placeholder)
            }
            if (oldPokemonPreview) {
                pokemonDetails.replaceChild(pokemonPreviewHTML, oldPokemonPreview)
            }
            pokemonDetails.appendChild(pokemonPreviewHTML)

            if (oldPokemonInfo) {
                pokemonDetails.replaceChild(pokemonInfoHTML, oldPokemonInfo)
            }
            pokemonDetails.appendChild(pokemonInfoHTML)

        }))
    }
    catch (error) {
        console.log(error)
    }
}


// NEW FUNCTIONS

// const fetchPokeAPI = async (endpoint, id) => {
//     try {
//         const url = `https://pokeapi.co/api/v2/${endpoint}/${id}/`;
//         const response = await fetch(url);
//         if (!response.ok) {
//             console.log("something went wrong")
//         }
//         result = await response.json();
//         return result

//     } catch (error) {
//         console.error(error)
//     }
// }

const fetchPokeAPI = async (endpoint, id) => {
    return fetch(`https://pokeapi.co/api/v2/${endpoint}/${id}/`)
}

const getGenLength = async (id) => {
    if (id <= 0 || id > POKEMON_GEN_COUNT) {
        console.error('Generation does not exist please enter value between 1 and 9')
    }
    const response = await fetchPokeAPI("generation", id);
    const gen = await response.json()
    return gen['pokemon_species'].length
}

const fetchPokemonGen = async () => {
    const promises = [];
    for (let i = 1; i <= 151; i++) {
        promises.push(await fetchPokeAPI("pokemon", i))
    }
    const responses = await Promise.all(promises);
    const result = await Promise.all(responses.map(response => response.json()));
    return result;
}

const pokemonGenerations = async () => {
    const genLengthPromises = [];

    for (let i = 1; i <= POKEMON_GEN_COUNT; i++) {
        genLengthPromises.push(getGenLength(i));
    }

    const genLengthArray = await Promise.all(genLengthPromises);
    const genArray = genLengthArray.map((genLength, index) => `"gen${index + 1}":${genLength}`)
    // casting array to a string, manipulating the string then casting string to object
    let genJSON = genArray.toString()
    genJSON = genJSON.padEnd(genJSON.length + 1, "}").padStart(genJSON.length + 2, '{');

    return JSON.parse(genJSON);
}

const createPokemonList = async (gen = 1) => {
    return getGenLength(gen);
}

pokemonGenerations().then(result => console.log(result))

// fetchGenIPokemon();


