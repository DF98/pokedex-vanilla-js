const pokemonContainer = document.querySelector('#pokemon-container');
const pokemonDetails = document.querySelector('#pokemon-details');
const generatePkmnPreviewHTML = () =>{

}

const fetchGenIPokemon = async () => {
    try {
        const promises = [];
        for (let i = 1; i <= 151; i++) {
            promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${i}/`))
        }
        const responses = await Promise.all(promises);
        const data = await Promise.all(responses.map(response => response.json()));
        console.log(data)
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
            console.log(pokemonData)
            pokemonDetails.innerHTML = `
            <div id="pokemon-preview">
                <h2>#${pokemonData.id}${pokemonData.name}</h2>
                <img src="${pokemonData.sprites.other['official-artwork']['front_default']}"/>
            </div>
            `
        }))
    }
    catch (error) {
        console.log(error)
    }
}

fetchGenIPokemon();
