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

fetchGenIPokemon();
