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
const updateParentElement = (parentElement, newChildElement, oldChildElementSel) => {
    if (parentElement.contains(document.querySelector(`${oldChildElementSel}`))) {
        parentElement.replaceChild(newChildElement, document.querySelector(`${oldChildElementSel}`))
    } else {
        parentElement.appendChild(newChildElement);
    }
}

// HTML GENERATION FUNCTIONS

const generatePokemonPreview = (pokemon) => {
    let [id, name, sprite, types] = [pokemon.id,pokemon.name,pokemon.sprites.other["official-artwork"]["front_default"],pokemon.types]
    const previewContainer = document.createElement('div');
    const title = document.createElement('h2');
    const img = document.createElement('img');
    const typesList = document.createElement('div');
    typesList.id = "type-badge-container"

    previewContainer.id = "pokemon-preview";
    title.innerText = `#${id} ${name}`
    img.src = `${sprite}`

    const typeBadges = types.map(type => {
        const typeBadge = document.createElement("span");
        const typeIcon = document.createElement("img");
        typeBadge.classList.add("type-badge");
        typeBadge.innerText = type.type.name;
        typeIcon.src = `./images/icons/${type.type.name}.svg`
        typeBadge.append(typeIcon);
        return typeBadge
    })
    
    typesList.append(...typeBadges)
    // typesList.innerText = `Types: ${types.map(type => type.type.name).join(" ")}`

    previewContainer.append(title);
    previewContainer.append(img);
    previewContainer.append(typesList);

    updateParentElement(pokemonDetails, previewContainer, "#pokemon-preview")
}

const generatePokemonInfo = (moves) => {
    const pokemonInfoContainer = document.createElement('div');
    pokemonInfoContainer.id = "pokemon-info"
    const movesTable = generateMovesTable(moves)
    pokemonInfoContainer.append(movesTable);

    updateParentElement(pokemonDetails, pokemonInfoContainer, "#pokemon-info")

}

const generatePokemonCard = (id, name, sprite) => {

    try {
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

        return divElement;
    } catch (error) {
        console.error(error)
    }


}

const generateMovesTable = (moves, game = "scarlet-violet") => {
    try {
        moves.forEach(move => move.lvl = move.lvl.filter(lvl => lvl.game === game))
        moves = moves.filter(move => move.lvl.length !== 0)
        moves = moves.sort((a, b) => a.lvl[0]["learn_at"] - b.lvl[0]["learn_at"])

        const fragment = new DocumentFragment();
        const tableElements = ['table', 'thead', 'tbody'];
        const [table, tableHead, tableBody] = tableElements.map(element => document.createElement(element));
        const headerRow = document.createElement('tr');
        table.id = "moves-table"
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
    } catch (error) {
        console.error(error)
    }
}


// fetchPokemonFromGen returns array of promises
const fetchPokemonFromGen = async (id = 1) => {
    try {
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
    } catch (error) {
        console.error(error)
    }
}

const createPokemonGenList = async (gen = 1) => {

    try {
        const pokemonList = await fetchPokemonFromGen(gen);
        const pokemonCardsContainer = document.createElement('div');
        pokemonCardsContainer.id = "cards-container";
        const fragment = new DocumentFragment();

        const pokemonCards = pokemonList.map(pokemon => {
            const id = pokemon.id;
            const name = pokemon.name;
            const sprite = pokemon.sprites.other['official-artwork']['front_default'];
            fragment.append(generatePokemonCard(id, name, sprite))
        })

        pokemonCardsContainer.appendChild(fragment)
        updateParentElement(pokemonContainer, pokemonCardsContainer, "#cards-container");
    } catch (error) {
        console.error(error)
    }

}

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

genBtns.forEach(btn => btn.addEventListener('click', async () => await createPokemonGenList(btn.dataset.id)))
createPokemonGenList(1);
// generateMovesTable(fetchPokemonMoves(2)).then(table => pokemonDetails.appendChild(table))
// pokemonDetails.appendChild()


document.getElementById("pokemon-container").addEventListener('click', async event => {
    if (document.contains(document.querySelector("#pokemon-details-placeholder"))) {
        pokemonDetails.removeChild(document.querySelector("#pokemon-details-placeholder"))
    }
    //added the wildcard * to selector because the image and h2 were covering the pokemon card element
    if (event.target.matches('.pokemon-card *')) {
        const pokemonID = event.target.parentElement.dataset.id;
        moves = await fetchPokemonMoves(pokemonID)
        moves = await Promise.all(moves)
        generatePokemonInfo(moves)
        const response = await fetchPokeAPI("pokemon",event.target.parentElement.dataset.id);
        const pokemon = await response.json();
        generatePokemonPreview(pokemon)
    }
})

const pokemonSearch = document.getElementById("pokemon-search")

pokemonSearch.addEventListener("change", () => {
    const pokemonCards = document.querySelectorAll(".pokemon-card");
    console.log(pokemonSearch.value)

    // if(pokemonSearch.value === ""){
    //     pokemonCards.forEach(card => card.classList.remove("hidden"))
    // }

    pokemonCards.forEach(card => {
        if (!card.innerText.toLowerCase().includes(pokemonSearch.value.toLowerCase())) {
            card.classList.add("hidden")
        }
        else{
            card.classList.remove("hidden")
        }
    })
})

const filterOptionsContainer = document.querySelector("#filter-toolbar");
filterOptionsContainer.addEventListener("click", event => {
    const filterPanels = document.querySelectorAll(".filter-panel")
    const btnInnerText = event.target.innerText;
    const [genPanelIndex, typePanelIndex, searchPanelIndex] = ["gen-btn-container","type-btn-container","pokemon-search-container"].map(id => [...filterPanels].findIndex(panel => panel.id === id))

    if(btnInnerText === "Search"){
        [...filterPanels][searchPanelIndex].classList.remove("hidden");
        [...filterPanels][genPanelIndex].classList.add("hidden");
        [...filterPanels][typePanelIndex].classList.add("hidden");
    }
    else if(btnInnerText === "Generation"){
        [...filterPanels][searchPanelIndex].classList.add("hidden");
        [...filterPanels][genPanelIndex].classList.remove("hidden");
        [...filterPanels][typePanelIndex].classList.add("hidden");
    }
    else if(btnInnerText === "Type"){
        [...filterPanels][searchPanelIndex].classList.add("hidden");
        [...filterPanels][genPanelIndex].classList.add("hidden");
        [...filterPanels][typePanelIndex].classList.remove("hidden");
    }
})

