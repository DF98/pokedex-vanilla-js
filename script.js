pokemonContainer = document.querySelector('#pokemon-container');

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
            <div class="pokemon-card">
                <h2>${pokemon.name}</h2>
                <img src="${pokemon.sprites.other['official-artwork']['front_default']}"/>
            </div>
            `
        }).join("")
    }
    catch (error) {
        console.log(error)
    }
}

fetchGenIPokemon();
