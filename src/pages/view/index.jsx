import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../../config/config_fb';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import "./view.css";

export const View = () => {
    const { groupId } = useParams();
    const [films, setFilms] = useState([]);
    const [titleFilter, setTitleFilter] = useState('');
    const [newFilmTitle, setNewFilmTitle] = useState('');
    const [newFilmDescription, setNewFilmDescription] = useState('');
    const [newFilmPlatform, setNewFilmPlatform] = useState('');
    const [newFilmScore, setNewFilmScore] = useState('');
    const [newFilmImage, setNewFilmImage] = useState(null);
    const [newFilmGenres, setNewFilmGenres] = useState({
        movie: false,
        series: false,
        action: false,
        comedy: false,
        horror: false,
        romance: false,
        drama: false,
    });

    useEffect(() => {
        fetchFilms();
    }, [groupId]);

    const fetchFilms = async () => {
        try {
            const filmsRef = collection(db, 'Films');
            const filmsQuery = query(filmsRef, where('groupId', '==', groupId));
            const filmsSnapshot = await getDocs(filmsQuery);
            const filmsList = [];
            filmsSnapshot.forEach((doc) => {
                filmsList.push({ id: doc.id, ...doc.data() });
            });
            setFilms(filmsList);
        } catch (error) {
            console.error('Error fetching films:', error);
        }
    };

    const handleTitleFilterChange = (e) => {
        setTitleFilter(e.target.value);
    };

    const handleAddFilm = async () => {
        try {
            const currentUser = auth.currentUser; // Assuming you have access to the current user here
            if (!currentUser) {
                throw new Error('No user is currently signed in.');
            }
            const { uid, displayName } = currentUser;

            const score = parseInt(newFilmScore);
            if (score < 1 || score > 10) {
                throw new Error('Score must be between 1 and 10.');
            }

            // Debugging: Log newFilmImage to ensure it contains the file
            console.log("New Film Image:", newFilmImage);

            let imageURL = '';
            if (newFilmImage) {
                const storage = getStorage();
                const storageRef = ref(storage, `film_images/${newFilmImage.name}`);
                await uploadBytes(storageRef, newFilmImage);
                imageURL = await getDownloadURL(storageRef);
            }

            // Debugging: Log imageURL to ensure it contains the correct URL
            console.log("Image URL:", imageURL);

            const newFilmData = {
                groupId,
                name: displayName,
                title: newFilmTitle,
                description: newFilmDescription,
                platform: newFilmPlatform,
                score,
                counter: 1,
                image: imageURL,
                ...newFilmGenres,
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'Films'), newFilmData);
            clearNewFilmForm();
            fetchFilms(); // Refresh films list after adding new film
        } catch (error) {
            console.error('Error adding film:', error);
        }
    };

    const clearNewFilmForm = () => {
        setNewFilmTitle('');
        setNewFilmDescription('');
        setNewFilmPlatform('');
        setNewFilmScore('');
        setNewFilmImage(null);
        setNewFilmGenres({
            movie: false,
            series: false,
            action: false,
            comedy: false,
            horror: false,
            romance: false,
            drama: false,
        });
    };

    return (
        <div>
            <h1>Group Activities</h1>
            <div>
                <input
                    type="text"
                    placeholder="Search by title"
                    value={titleFilter}
                    onChange={handleTitleFilterChange}
                />
            </div>
            {films.length > 0 ? (
                <ul>
                    {films.map((film) => (
                        <li key={film.id}>
                            <h3>{film.title}</h3>
                            <p>Description: {film.description}</p>
                            <p>Platform: {film.platform}</p>
                            <p>Score: {(film.score / film.counter).toFixed(2)}</p>
                            <p>Genres: {Object.keys(film).filter((key) => film[key] === true && key !== 'title' && key !== 'description' && key !== 'platform' && key !== 'score' && key !== 'counter' && key !== 'image' && key !== 'groupId' && key !== 'name').join(', ')}</p>
                            {film.image && <img src={film.image} alt="Film Image" />}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No activities found for this group.</p>
            )}

            <div className="add-film-form">
                <h2>Add Film</h2>
                <input type="text" placeholder="Title" value={newFilmTitle} onChange={(e) => setNewFilmTitle(e.target.value)} />
                <textarea placeholder="Description" value={newFilmDescription} onChange={(e) => setNewFilmDescription(e.target.value)} />
                <input type="text" placeholder="Platform" value={newFilmPlatform} onChange={(e) => setNewFilmPlatform(e.target.value)} />
                <input type="number" placeholder="Score" value={newFilmScore} onChange={(e) => setNewFilmScore(e.target.value)} min="1" max="10" />
                <input type="file" onChange={(e) => setNewFilmImage(e.target.files[0])} accept="image/*" />
                <div>
                    <label>Genres:</label>
                    {Object.entries(newFilmGenres).map(([key, value]) => (
                        <label key={key}>
                            <input type="checkbox" checked={value} onChange={(e) => setNewFilmGenres({ ...newFilmGenres, [key]: e.target.checked })} />
                            {key}
                        </label>
                    ))}
                </div>
                <button onClick={handleAddFilm}>Add Film</button>
            </div>
        </div>
    );
};
