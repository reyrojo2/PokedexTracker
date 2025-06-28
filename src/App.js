import { useState, useEffect } from 'react';
import { getGenerationData, getRegionalForms } from './services/pokeapi';
import AllBoxes from './components/allBoxes';

const BACK_URL = process.env.REACT_APP_SHEETS_URL;



function App() {
  const [capturados, setCapturados] = useState(new Set());
  const [etiquetasGO, setEtiquetasGO] = useState({});
  const [allPokemon, setAllPokemon] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      const all = [];
      for (let gen = 1; gen <= 9; gen++) {
        const genData = await getGenerationData(gen);
        all.push(...genData);
      }
      const regionals = await getRegionalForms();
      all.push(...regionals);
      setAllPokemon(all);
    };

    fetchAll();
  }, []);

  const manejarCaptura = (id, nuevoEstado) => {
    setCapturados((prev) => {
      const nuevoSet = new Set(prev);
      if (nuevoEstado === 'caught') {
        nuevoSet.add(id);
      } else {
        nuevoSet.delete(id);
      }
      return nuevoSet;
    });
  };

  useEffect(() => {
    fetch(BACK_URL)
      .then((res) => res.json())
      .then((data) => {
        const capturadosSet = new Set();
        const etiquetas = {};

        data.forEach((poke) => {
          const realId = Number(poke.id);
          if (poke.estado === 'caught') capturadosSet.add(realId);
          if (poke.etiquetaGO === true || poke.etiquetaGO === 'true' || poke.etiquetaGO === 'TRUE') {
            etiquetas[realId] = true;
          }
        });

        setCapturados(capturadosSet);
        setEtiquetasGO(etiquetas);
      })
      .catch((err) => console.error("Error al cargar datos desde Sheets:", err));
  }, []);

  return (
    <div className="App">
      <div className="headerpoke">
        <img id="imgPoke" src="/PokemonHOME.png" alt="pokeball" />
        <p id="Progreso">Progreso actual: {capturados.size} / 1025 Pokémon</p>
        <div className="user-info">
          <span className="username">Víctor Duarte</span>
          <div className="avatar">👤</div>
        </div>
      </div>
      <br />

      <AllBoxes
        allPokemon={allPokemon}
        onCaptureChange={manejarCaptura}
        capturados={capturados}
        etiquetasGO={etiquetasGO}
        setEtiquetasGO={setEtiquetasGO}
      />
    </div>
  );
}

export default App;
