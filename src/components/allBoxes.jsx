import { useEffect } from 'react';
import TarjetaPoke from './tarjetapokemon';


const BACK_URL = process.env.REACT_APP_SHEETS_URL;

const AllBoxes = ({
    allPokemon,
    onCaptureChange,
    capturados,
    setCapturados,
    etiquetasGO,
    setEtiquetasGO,
    shadowed,
    setShadowed
}) => {

    // Separar Pokémon base y regionales

    const basePokemon = allPokemon.filter(p => !p.region && (p.id < 1089 || p.id > 1116));
    const regionales = allPokemon.filter(p => p.region);
    const unownPokemon = Array.from(
        new Map(
            allPokemon
                .filter(p => p.id >= 1089 && p.id <= 1116)
                .map(p => [p.id, p])
        ).values()
    );

    const actualizarEstado = (id, estado) => {
        setCapturados(prev => {
            const nuevo = new Set(prev);
            if (estado === 'caught') nuevo.add(id);
            else nuevo.delete(id);
            return nuevo;
        });

        setShadowed(prev => {
            const nuevo = new Set(prev);
            if (estado === 'shadowed') nuevo.add(id);
            else nuevo.delete(id);
            return nuevo;
        });
    };

    const actualizarEtiquetaGO = (id, activo) => {
        setEtiquetasGO(prev => ({
            ...prev,
            [id]: activo
        }));
    };

    const guardarEnSheets = async ({ id, name, estado, etiquetaGO }) => {
        console.log("BACK_URL:", BACK_URL);
        await fetch(BACK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id,
                name,
                estado,
                etiquetaGO
            })
        });
    };
    const manejarAgregarEtiquetaGO = (id, name) => {
        const realId = Number(id);
        const yaTeniaEtiqueta = etiquetasGO[realId] === true;
        const nuevoValor = !yaTeniaEtiqueta;

        setEtiquetasGO(prev => ({
            ...prev,
            [realId]: nuevoValor
        }));

        const estadoActual = shadowed.has(realId)
            ? 'shadowed'
            : capturados.has(realId)
                ? 'caught'
                : '';

        guardarEnSheets({
            id: realId,
            name,
            estado: estadoActual,
            etiquetaGO: nuevoValor // true para mostrar, false para ocultar
        });
    };

    // Agrupar los base en bloques de 30
    const groupedBase = [];
    for (let i = 0; i < basePokemon.length; i += 30) {
        groupedBase.push(basePokemon.slice(i, i + 30));
    }


    // Agrupar regionales por región
    const regionalesPorRegion = {};
    for (const poke of regionales) {
        if (!regionalesPorRegion[poke.region]) {
            regionalesPorRegion[poke.region] = [];
        }
        regionalesPorRegion[poke.region].push(poke);
    }
    // Validar duplicados visuales de Unown
    useEffect(() => {
        const vistos = new Set();
        allPokemon.forEach(p => {
            const visualId = (p.id === 201 || (p.id >= 1089 && p.id <= 1116)) ? "0201" : p.id;
            const clave = `${visualId}-${p.name}`;
            if (vistos.has(clave)) {
                console.warn("⚠️ Duplicado visual:", clave, "ID real:", p.id);
            }
            vistos.add(clave);
        });
    }, [allPokemon]);
    return (
        <div className="box-pairs-container">
            {/* Mostrar cajas para Pokémon base */}
            {groupedBase.map((box, idx) => {
                const todosCapturados = box.every(poke => capturados.has(poke.id));

                const relleno = Array.from({ length: 30 - box.length }, (_, i) => ({
                    id: `empty-base-${idx}-${i}`,
                    name: null,
                    isPlaceholder: true
                }));

                const boxConRelleno = [...box, ...relleno];

                return (
                    <div key={`base-${idx}`} className="box-wrapper">
                        <h3 className="box-header">
                            <span className="box-title">Caja {idx + 1}</span>
                            {todosCapturados && (
                                <img src="/check.png" alt="check" className="check-verde" />
                            )}
                        </h3>
                        <div className="pokemon-grid">
                            {boxConRelleno.map((poke) => {
                                const isPlaceholder = poke.isPlaceholder;

                                return (
                                    <TarjetaPoke
                                        key={`tarjeta-${poke.id}-base`}
                                        id={poke.id}
                                        name={poke.name}
                                        onCaptureChange={onCaptureChange}
                                        capturado={isPlaceholder ? false : capturados.has(poke.id)}
                                        shadowed={isPlaceholder ? false : shadowed.has(poke.id)}
                                        placeholder={isPlaceholder}
                                        mostrarEtiquetaGO={!isPlaceholder && etiquetasGO[Number(poke.id)] === true}
                                        onAgregarEtiquetaGO={(id) => manejarAgregarEtiquetaGO(id, poke.name)}
                                        onActualizarEstado={actualizarEstado}
                                        onActualizarEtiquetaGO={actualizarEtiquetaGO}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            })}


            {Object.entries(regionalesPorRegion).map(([region, pokes]) => {
                const todosCapturados = pokes.every(poke => capturados.has(poke.id));

                // Rellenar hasta 30 con "tarjetas vacías"
                const relleno = Array.from({ length: 30 - pokes.length }, (_, i) => ({
                    id: `empty-${region}-${i}`, // ID como string
                    name: null,
                    isPlaceholder: true
                }));

                const pokesConRelleno = [...pokes, ...relleno];

                return (
                    <div key={`region-${region}`} className="box-wrapper">
                        <h3 className="box-header">
                            <span className="box-title">Caja Regional - {region}</span>
                            {todosCapturados && <img src="/check.png" alt="check" className="check-verde" />}
                        </h3>
                        <div className="pokemon-grid">
                            {pokesConRelleno.map((poke) => {
                                const isPlaceholder = poke.isPlaceholder;

                                return (
                                    <TarjetaPoke
                                        key={`tarjeta-${poke.id}-regional`}
                                        id={poke.id}
                                        name={poke.name}
                                        onCaptureChange={onCaptureChange}
                                        capturado={isPlaceholder ? false : capturados.has(poke.id)}
                                        shadowed={isPlaceholder ? false : shadowed.has(poke.id)}
                                        placeholder={isPlaceholder}
                                        mostrarEtiquetaGO={!isPlaceholder && etiquetasGO[Number(poke.id)] === true}
                                        onAgregarEtiquetaGO={(id) => manejarAgregarEtiquetaGO(id, poke.name)}
                                        onActualizarEstado={actualizarEstado}
                                        onActualizarEtiquetaGO={actualizarEtiquetaGO}
                                    />
                                );
                            })}
                        </div>
                    </div>
                );
            })}
            {unownPokemon.length > 0 && (
                <div key="box-unown" className="box-wrapper">
                    <h3 className="box-header">
                        <span className="box-title">Caja Unown</span>
                        {unownPokemon.every(p => capturados.has(p.id)) && (
                            <img src="/check.png" alt="check" className="check-verde" />
                        )}
                    </h3>
                    <div className="pokemon-grid">
                        {unownPokemon.map((poke) => (
                            <TarjetaPoke
                                key={`tarjeta-${poke.id}-unownbox-${poke.image}`}
                                id={poke.id} // imagen individual
                                name={poke.name} // debe ser "Unown"
                                onCaptureChange={onCaptureChange}
                                capturado={capturados.has(poke.id)}
                                shadowed={shadowed.has(poke.id)}
                                placeholder={false}
                                mostrarEtiquetaGO={etiquetasGO[Number(poke.id)] === true}
                                onAgregarEtiquetaGO={(id) => manejarAgregarEtiquetaGO(id, poke.name)}
                                onActualizarEstado={actualizarEstado}
                                onActualizarEtiquetaGO={actualizarEtiquetaGO}
                            />
                        ))}
                    </div>
                </div>
            )}


        </div>
    );
};

export default AllBoxes;
