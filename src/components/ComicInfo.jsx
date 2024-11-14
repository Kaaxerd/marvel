import './ComicInfo.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import md5 from 'crypto-js/md5';
import { useParams } from 'react-router-dom';
import Footer from './Footer';

const ComicInfo = () => {
    const { id: comicId } = useParams(); // Almacena el id del comic
    const [comic, setComic] = useState(null); // Almacena la información del comic
    const [loading, setLoading] = useState(true); // Almacena el estado de carga
    const [error, setError] = useState(null); // Almacena si hay un error
    const [characterDetails, setCharacterDetails] = useState([]); // Almacena los detalles de los personajes

    useEffect(() => {
        const fetchComic = async () => { // Fetchea la info. del comic
            const ts = 1; // Timestamp
            const publicKey = '218d5c93920e11065d5a971b44d275d3'; // Clave pública
            const privateKey = '3185788dbd144839b265700fad3af3485c07d766'; // Clave privada
            const hash = md5(ts + privateKey + publicKey).toString(); // Hash

            try {
                const response = await axios.get(`https://gateway.marvel.com/v1/public/comics/${comicId}`, { // Accede a la API de Marvel con los parámetros
                    params: {
                        ts,
                        apikey: publicKey,
                        hash
                    }
                });
                const comicData = response.data.data.results[0];
                setComic(comicData);
                setLoading(false);

                const characterPromises = comicData.characters.items.map(async (character) => { // Fetchea los personajes del comic
                    const characterResponse = await axios.get(character.resourceURI, { // Accede al resourceURI del personaje con los parámetros
                        params: { ts, apikey: publicKey, hash }
                    });
                    const characterData = characterResponse.data.data.results[0];
                    return { // Devuelve solo el nombre y su imagen
                        name: characterData.name,
                        thumbnail: characterData.thumbnail
                    };
                });

                const characterDataList = await Promise.all(characterPromises);
                setCharacterDetails(characterDataList);
                
            } catch (err) {
                console.error('Error fetching comic:', err);
                setError(err);
                setLoading(false);
            }
        };

        fetchComic();
    }, [comicId]);

    if (loading) return <p>Loading...</p>;
    if (error) {
        return (
            <div>
                <h2>Comic information unavailable</h2>
                <p>There was an error fetching the comic data.</p>
            </div>
        );
    }

    
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // Formato DD/MM/YYYY
    };

    return (
        <div>
            {comic && (
                <div>
                    <div
                        className="comic-intro"
                        style={{
                            backgroundImage: `url(${comic.thumbnail.path}.${comic.thumbnail.extension})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="comic-intro-content">
                            <img src={`${comic.thumbnail.path}.${comic.thumbnail.extension}`} alt={comic.title} />
                            <h2>{comic.title}</h2>
                            {comic.description && <p>{comic.description}</p>}
                        </div>
                    </div>

                    <h3>Comic Details</h3>
                    <p><strong>Page Count:</strong> {comic.pageCount || "N/A"}</p>
                    <p><strong>Format:</strong> {comic.format}</p>
                    <p><strong>On Sale Date:</strong> {comic.dates.find(date => date.type === 'onsaleDate') ? formatDate(comic.dates.find(date => date.type === 'onsaleDate').date) : "N/A"}</p>

                    <h3>Prices</h3>
                    {comic.prices.map((price, index) => (
                        <p key={index}><strong>{price.type === 'printPrice' ? 'Price' : 'Price (digital)'}:</strong> ${price.price}</p>
                    ))}

                    <h3>Characters</h3>
                    {characterDetails.length > 0 ? (
                        <ul>
                            {characterDetails.map((character, index) => (
                                <li key={index} style={{ textAlign: 'center' }}>
                                    {character.thumbnail && (
                                        <img 
                                            src={`${character.thumbnail.path}.${character.thumbnail.extension}`} 
                                            alt={character.name} 
                                            style={{ width: '100px', borderRadius: '50%' }}
                                        />
                                    )}
                                    <p>{character.name}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No characters listed</p>
                    )}

                    <h3>Creators</h3>
                    {comic.creators.items.length > 0 ? (
                        <ul>
                            {comic.creators.items.map((creator, index) => (
                                <li key={index}>{creator.name} - {creator.role}</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No creators listed</p>
                    )}

                    <h3>Related Links</h3>
                    {comic.urls.map((url, index) => (
                        <p key={index}>
                            <a href={url.url} target="_blank" rel="noopener noreferrer">
                                {url.type.charAt(0).toUpperCase() + url.type.slice(1)}
                            </a>
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ComicInfo;
