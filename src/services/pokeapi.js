/*
Esta es API que jala el archivo JSON desde el cual se alimenta toda la información de los pokemones, incluida la
numeración de cada bicho para poder luego mapear la imagen. Así que, de incluir más pokemones a futuro, debes 
añadir al archivo principal abajo, añadiendo también un archivo individual por cada pokemon.
*/
export const getGenerationData = async (genId) => {
    const res = await fetch("/data/pokemon_full_dataset.json");
    const allPokemon = await res.json();

    const generationRanges = {
        1: [1, 151],
        2: [152, 251],
        3: [252, 386],
        4: [387, 493],
        5: [494, 649],
        6: [650, 721],
        7: [722, 809],
        8: [810, 905],
        9: [906, 1025]
    };

    const [minId, maxId] = generationRanges[genId];

    return allPokemon
        .filter(p =>
            (p.id >= minId && p.id <= maxId) ||
            (p.id >= 1089 && p.id <= 1116) // ← Incluye todos los Unown
        )
        .map(p => {
            const isUnown = p.id >= 1089 && p.id <= 1116;
            return {
                id: p.id,
                name: isUnown ? "Unown" : (p.translations?.es || p.name_en),
                image: `/sprites/home/${p.id}.png`,
                generation: genId,
                region: null
            };
        });
};

export const getRegionalForms = async () => {
    const res = await fetch("/data/pokemon_full_dataset.json");
    const allPokemon = await res.json();

    return allPokemon
        .filter(p => p.region)
        .map(p => ({
            id: p.id,
            name: `${p.translations?.es || p.name_en}`,
            image: `/sprites/home/${p.id}.png`,
            generation: null,
            region: p.region
        }));
};

const load = async () => {
    const base = await getGenerationData(1);
    const regionals = await getRegionalForms();

    console.log("➡️ Base:", base.length);
    console.log("➡️ Regionales:", regionals.length);
    console.log("👀 Ejemplo de regional:", regionals[0]);

    const fullList = [...base, ...regionals];
    console.log("✅ Total:", fullList.length);
};
load();