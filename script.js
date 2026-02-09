// Current number of pokemon generations that exist. Value can be updated when new generation is released.
const POKEMON_GEN_COUNT = 9;

const pokemonContainer = document.querySelector('#pokemon-container');
const pokemonDetails = document.querySelector('#pokemon-details');
const genBtns = document.querySelectorAll('.gen-btn');

// UTILITY FUNCTIONS

const fetchPokeAPI = async (endpoint, id) => {
    return fetch(`https://pokeapi.co/api/v2/${endpoint}/${id}/`)
}

/*
##function updateParent 
    #params
        - parentElement: The parent element that you want to update.
        - oldChildElementId: The ID of the child element you want to check if it already exists in the parent element
    #outcome
        -if child element is already present in the parent replace it with the new element. 
        -else just append the new child element to the parent element.
*/
const updateParentElement = (parentElement, newChildElement, oldChildElementId) => {
    if (parentElement.contains(document.getElementById(`${oldChildElementId}`))) {
        parentElement.replaceChild(newChildElement, document.getElementById(`${oldChildElementId}`))
    } else {
        parentElement.appendChild(newChildElement);
    }
}

// HTML GENERATION FUNCTIONS

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

    // pokemonDetails.appendChild(previewContainer);

    updateParentElement(pokemonDetails, previewContainer, "pokemon-preview")
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

    updateParentElement(pokemonDetails, pokemonInfoContainer, "pokemon-info")

}

const generatePokemonCard = (id, name, sprite, types, moves) => {
    const divElement = document.createElement('div');
    const titleElement = document.createElement('h2');
    const imgElement = document.createElement('img');

    divElement.dataset.id = id;
    divElement.classList.add("pokemon-card");
    titleElement.innerText = name;
    imgElement.src = sprite;
    imgElement.loading = "lazy";

    divElement.appendChild(titleElement);
    divElement.appendChild(imgElement);
    divElement.addEventListener('click', () => {
        if (!!document.getElementById('pokemon-details-placeholder')) {
            pokemonDetails.removeChild(document.getElementById('pokemon-details-placeholder'))
        }
        generatePokemonPreview(id, name, sprite, types)
        generatePokemonInfo(moves)
    })

    return divElement;
}

const generateMovesTable = async (moves, game = "scarlet-violet") => {
    moves = await (moves);
    moves = await Promise.all(moves)
    
    moves.forEach(move => move.lvl = move.lvl.filter(lvl => lvl.game === game))
    moves = moves.filter(move => move.lvl.length !== 0)
    moves = moves.sort((a, b) => a.lvl[0]["learn_at"] - b.lvl[0]["learn_at"])
    console.log(moves)

    const fragment = new DocumentFragment();
    const tableElements = ['table', 'thead', 'tbody'];
    const [table, tableHead, tableBody] = tableElements.map(element => document.createElement(element));
    const headerRow = document.createElement('tr');
    const tableFieldElements = ["Level", "Move", "Type", "Category", "Power", "Accuracy", "PP"].map(field => {
        const fieldElement = document.createElement("th");
        fieldElement.innerText = field;
        return fieldElement;
    })

    moves.forEach(move => {
        const tableRow = document.createElement("tr");
        for (const prop in move) {
            const dataCell = document.createElement("td");
            prop === "lvl" ? dataCell.innerText = move[`${prop}`][0]["learn_at"] : dataCell.innerText = move[`${prop}`]
            tableRow.appendChild(dataCell)
        }
        fragment.append(tableRow);
    })


    tableHead.append(headerRow)
    tableBody.append(fragment);
    headerRow.append(...tableFieldElements)
    table.append(tableHead, tableBody);
    return table;
}


// fetchPokemonFromGen returns array of promises
const fetchPokemonFromGen = async (id = 1) => {
    const response = await fetchPokeAPI("generation", id);
    const data = await response.json();
    const pokemonSpecies = data['pokemon_species'];

    const pokemonPromises = pokemonSpecies.map(pokemon => {
        //Extract the pokemon's ID from the pokemon species url
        const pokemonId = pokemon.url.replace("v2", "").match(/[0-9]/g).join("");
        return fetchPokeAPI("pokemon", pokemonId);
    })

    const responseArray = await Promise.all(pokemonPromises);
    return Promise.all(responseArray.map(response => response.json()))
}

const createPokemonGenList = async (gen = 1) => {
    const pokemon = await fetchPokemonFromGen(gen);
    const pokemonCardsContainer = document.createElement('div');
    pokemonCardsContainer.id = "cards-container";
    const fragment = new DocumentFragment();

    pokemon.forEach(pokemon => {
        const id = pokemon.id;
        const name = pokemon.name;
        const sprite = pokemon.sprites.other['official-artwork']['front_default'];
        const types = pokemon.types
        const moves = pokemon.moves
        fragment.appendChild(generatePokemonCard(id, name, sprite, types, moves))
    })

    pokemonCardsContainer.appendChild(fragment);

    updateParentElement(pokemonContainer, pokemonCardsContainer, "cards-container");

}

genBtns.forEach(btn => btn.addEventListener('click', async () => await createPokemonGenList(btn.dataset.id)))

createPokemonGenList(1);


const fetchPokemonMoves = async (pokemonID = 1) => {
    try {
        const response = await fetchPokeAPI("pokemon", pokemonID);
        if (!response.ok) {
            console.error("Pokemon not found.")
        }
        const pokemon = await response.json();
        fetchedMoves = pokemon.moves;

        let moves = fetchedMoves.map(async move => {
            const response = await fetch(move.move.url);
            const additionalMoveInfo = await response.json();

            return {
                lvl: createLvlLearnArray(move["version_group_details"]),
                name: move.move.name,
                type: additionalMoveInfo["type"]["name"],
                category: additionalMoveInfo["damage_class"]["name"],
                power: additionalMoveInfo["power"],
                accuracy: additionalMoveInfo["accuracy"],
                pp: additionalMoveInfo["pp"],
            }
        })

        return moves
    } catch (error) {
        console.error(error)
    }

}
const createLvlLearnArray = (versionGroupDetails) => {
    return versionGroupDetails.map(vgd => {
        return {
            learn_at: vgd["level_learned_at"],
            learn_method: vgd["move_learn_method"]["name"],
            game: vgd["version_group"]["name"]
        }
    })
}


generateMovesTable(fetchPokemonMoves(2)).then(table => pokemonDetails.appendChild(table))
// pokemonDetails.appendChild()

