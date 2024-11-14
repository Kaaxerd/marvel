import './ComicList.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import md5 from 'crypto-js/md5';
import Footer from './Footer';

const ComicList = () => {
    const [comics, setComics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // Formato DD/MM/YYYY
    };

    const isFavorite = (comicId) => { // Añade el comic a la lista de favoritos
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        return favorites.includes(comicId);
    };

    // Función para alternar el estado de favorito de un cómic
    const toggleFavorite = (comicId) => {
        const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (favorites.includes(comicId)) {
            // Eliminar cómic de favoritos si ya está en la lista
            const newFavorites = favorites.filter((id) => id !== comicId);
            localStorage.setItem('favorites', JSON.stringify(newFavorites));
        } else {
            // Añadir cómic a favoritos si no está en la lista
            favorites.push(comicId);
            localStorage.setItem('favorites', JSON.stringify(favorites));
        }
        setComics([...comics]); // Actualizar el estado de los cómics para reflejar los cambios
    };

    const handleComicClick = (comicId) => { // Navega a la página de detalles del cómic al hacer click
        navigate(`/comics/${comicId}`);
    };

    useEffect(() => {
        const fetchComics = async () => { // Fetch de los cómics de la API de Marvel
            const ts = 1; // Timestamp
            const publicKey = '218d5c93920e11065d5a971b44d275d3'; // Clave pública
            const privateKey = '3185788dbd144839b265700fad3af3485c07d766'; // Clave privada
            const hash = md5(ts + privateKey + publicKey).toString(); // Hash MD5

            try {
                const response = await axios.get('https://gateway.marvel.com/v1/public/characters', { // Petición GET a la API de Marvel
                    params: {
                        ts,
                        apikey: publicKey,
                        hash,
                        limit: 30
                    }
                });

                //console.log(`https://gateway.marvel.com/v1/public/characters?ts=${ts}&apikey=${publicKey}&hash=${hash}`);

                const characterData = response.data.data.results; // Datos de los personajes

                // Obtener detalles de los cómics para cada personaje
                const comicDetailsPromises = characterData.map(async (character) => { 
                    const comicItems = character.comics.items;

                    // Realizar solicitudes para obtener detalles de cada cómic
                    const comicResponses = await Promise.all(
                        comicItems.map(async (comic) => {
                            await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos entre solicitudes
                            const comicResponse = await axios.get(comic.resourceURI, {
                                params: { ts, apikey: publicKey, hash }
                            });
                            const comicData = comicResponse.data.data.results[0];
                            return {
                                id: comicData.id,
                                title: comicData.title,
                                date: formatDate(comicData.dates.find(date => date.type === 'onsaleDate')?.date),
                                image: `${comicData.thumbnail.path}.${comicData.thumbnail.extension}`
                            };
                        })
                    );

                    return { characterName: character.name, comics: comicResponses };
                });

                const detailedComics = await Promise.all(comicDetailsPromises);
                setComics(detailedComics);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching comics:', err);
                setError(err);

                // Comics por defecto en caso de error
                const defaultComics = [
                    {
                        characterName: 'Default Character 1',
                        comics: [
                            { id: 'default-1', title: 'Default Comic 1', date: '01/01/2020', image: 'default1.jpg' },
                            { id: 'default-2', title: 'Default Comic 2', date: '01/02/2020', image: 'default2.jpg' },
                            { id: 'default-3', title: 'Default Comic 3', date: '01/03/2020', image: 'default3.jpg' }
                        ]
                    }
                ];
                setComics(defaultComics);
                setLoading(false);
            }
        };

        fetchComics();
    }, []);

    if (loading) return <p>Loading...</p>;

    // Organiza comics en favoritos y no favoritos
    const favoriteComics = comics.map(character => ({
        characterName: character.characterName,
        comics: character.comics.filter(comic => isFavorite(comic.id))
    })).filter(character => character.comics.length > 0);

    const nonFavoriteComics = comics.map(character => ({
        characterName: character.characterName,
        comics: character.comics.filter(comic => !isFavorite(comic.id))
    })).filter(character => character.comics.length > 0);

    return (
        <div>
            <h1>Marvel Comics</h1>

            {error && <p>Error: {error.message}</p>}

            {/* Sección comics favoritos */}
            {favoriteComics.length > 0 && (
                <div>
                    <h2>Favorites</h2>
                    {favoriteComics.map((comicData, index) => (
                        <div key={index}>
                            <h3>{comicData.characterName}</h3>
                            <ul>
                                {comicData.comics.map((comic, idx) => (
                                    <li key={idx} onClick={() => handleComicClick(comic.id)} style={{ cursor: 'pointer' }}>
                                        <h4>{comic.title}</h4>
                                        <p>Publishing Date: {comic.date || 'N/A'}</p>
                                        <img src={comic.image} alt={comic.title} style={{ width: '150px' }} />
                                        <span onClick={(e) => { e.stopPropagation(); toggleFavorite(comic.id); }}>
                                            {isFavorite(comic.id) ? '💔' : '⭐'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Sección "todos los comics" */}
            <div>
                <h2>All Comics</h2>
                {nonFavoriteComics.map((comicData, index) => (
                    <div key={index}>
                        <h3>{comicData.characterName}</h3>
                        <ul>
                            {comicData.comics.map((comic, idx) => (
                                <li key={idx} onClick={() => handleComicClick(comic.id)} style={{ cursor: 'pointer' }}>
                                    <h4>{comic.title}</h4>
                                    <p>Publishing Date: {comic.date || 'N/A'}</p>
                                    <img src={comic.image} alt={comic.title} style={{ width: '150px' }} />
                                    <span onClick={(e) => { e.stopPropagation(); toggleFavorite(comic.id); }}>
                                        {isFavorite(comic.id) ? '💔' : '⭐'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ComicList;
