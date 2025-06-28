import { useState, useRef, useEffect } from 'react';
import './TarjetaPoke.css';

const BACK_URL = process.env.REACT_APP_SHEETS_URL;

const idVisiblePorRegional = {
    1026: 19,
    1027: 20,
    1028: 26,
    1029: 27,
    1030: 28,
    1031: 37,
    1032: 38,
    1033: 50,
    1034: 51,
    1035: 52,
    1036: 53,
    1037: 74,
    1038: 75,
    1039: 76,
    1040: 88,
    1041: 89,
    1042: 103,
    1043: 105,
    1044: 52,
    1045: 77,
    1046: 78,
    1047: 79,
    1048: 80,
    1050: 83,
    1051: 110,
    1052: 122,
    1053: 144,
    1054: 145,
    1055: 146,
    1049: 199,
    1056: 222,
    1057: 263,
    1058: 264,
    1059: 554,
    1060: 555,
    1061: 562,
    1062: 618,
    1063: 58,
    1064: 59,
    1065: 100,
    1066: 101,
    1067: 157,
    1068: 211,
    1069: 215,
    1070: 503,
    1071: 549,
    1072: 570,
    1073: 571,
    1074: 628,
    1075: 705,
    1076: 706,
    1077: 713,
    1078: 724,
    1079: 128,
    1080: 194
};

const TarjetaPoke = ({
    name,
    id,
    onCaptureChange,
    capturado = false,
    shadowed = false,
    placeholder = false,
    mostrarEtiquetaGO = false,
    onAgregarEtiquetaGO,
    onActualizarEstado,
    onActualizarEtiquetaGO
}) => {
    const [estado, setEstado] = useState(
        shadowed ? 'shadowed' : capturado ? 'caught' : ''
    );

    const imageUrl = `/sprites/home/${id}.png`;

    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const menuRef = useRef();
    const cardRef = useRef();

    const handleClick = () => manejarInteraccion('caught');
    const handleRightClick = (e) => {
        e.preventDefault();
        manejarInteraccion('shadowed');
    };

    const handleAgregarEtiqueta = (e) => {
        e.stopPropagation();
        console.log('CLICK en botón etiqueta GO', id);

        if (onAgregarEtiquetaGO) onAgregarEtiquetaGO(Number(id));
        const estadoActual = shadowed ? 'shadowed' : capturado ? 'caught' : '';
        // 🔒 Esperar un poco para que el estado de la etiqueta se actualice (opcional)
        setTimeout(() => {
            if (!id || !name) {
                console.error("Faltan datos para guardar en Sheets:", { id, name });
                return;
            }
            console.log("BACK_URL:", BACK_URL);
            fetch(BACK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id,
                    name,
                    estado: estadoActual,
                    etiquetaGO: !mostrarEtiquetaGO
                })
            })
                .then(res => {
                    if (!res.ok) throw new Error("Fetch fallido");
                    return res.json();
                })
                .then(() => {
                    const realId = Number(id);
                    if (onActualizarEtiquetaGO) onActualizarEtiquetaGO(realId, !mostrarEtiquetaGO);
                })
        }, 200); // pequeño delay para sincronizar el cambio visual

        setMenuVisible(false);
    };
    const manejarInteraccion = (nuevoEstado) => {
        let estadoFinal = '';

        if (estado === nuevoEstado) {
            setEstado('');
            estadoFinal = '';
        } else {
            setEstado(nuevoEstado);
            estadoFinal = nuevoEstado;
        }

        if (onCaptureChange) onCaptureChange(id, estadoFinal);

        // Guardar cambio en Sheets
        fetch(BACK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id,
                name,
                estado: estadoFinal,
                etiquetaGO: mostrarEtiquetaGO
            })
        })
            .then(res => res.json())
            .then(() => {
                const realId = Number(id);

                if (onActualizarEstado) onActualizarEstado(Number(id), estadoFinal);

            });
    }


    useEffect(() => {
        const cardElement = cardRef.current;

        const handleMiddleMouse = (e) => {
            if (e.button === 1) {
                e.preventDefault();
                setMenuPosition({ x: e.clientX, y: e.clientY });
                setMenuVisible(true);
            }
        };

        const handleAnyMouseClick = () => {
            setMenuVisible(false);
        };

        if (cardElement) {
            cardElement.addEventListener('mousedown', handleMiddleMouse);
        }

        document.addEventListener('mousedown', handleAnyMouseClick);

        return () => {
            if (cardElement) {
                cardElement.removeEventListener('mousedown', handleMiddleMouse);
            }
            document.removeEventListener('mousedown', handleAnyMouseClick);
        };
    }, []);


    if (placeholder) {
        return (
            <div className="pokemon-card placeholder">
                <div className="blur-circle" />
            </div>
        );
    }
    return (
        <div
            ref={cardRef}
            className={`pokemon-card ${estado}`}
            onClick={handleClick}
            onContextMenu={handleRightClick}
            tabIndex={0}
        >
            {mostrarEtiquetaGO && (
                <img
                    src="/go.png"
                    alt="GO"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '32px',
                        height: '32px',
                        zIndex: 10,
                    }}
                />
            )}

            <div onMouseDown={(e) => e.stopPropagation()}>
                {estado !== 'shadowed' && <div className="blur-circle" />}
                <div>
                    <img
                        src={imageUrl}
                        alt={name}
                        loading="lazy"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/96x96?text=???';
                        }}
                    />
                </div>
                <p className="pokemon-id">
                    N.° {String(idVisiblePorRegional[id] || id).padStart(4, '0')}
                </p>
                <p className="pokemon-name">{name || 'Nombre desconocido'}</p>
            </div>
            {menuVisible && (
                <div
                    ref={menuRef}
                    className="context-menu-wrapper"
                    style={{
                        top: menuPosition.y,
                        left: menuPosition.x,
                    }}
                >
                    <div
                        className="context-menu-item"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={handleAgregarEtiqueta}
                    >
                        {mostrarEtiquetaGO ? 'Quitar etiqueta GO' : 'Agregar etiqueta GO'}
                    </div>
                </div>
            )
            }
        </div >
    );
};


export default TarjetaPoke;
