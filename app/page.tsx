"use client";

import { useMemo, useState } from "react";

type Movie = { title: string; genre: string; runtime: string; rating: string; color: string; label: string; times: string[]; areas: string[] };

const movies: Movie[] = [
  { title: "After the Monsoon", genre: "Drama · Romance", runtime: "1h 48m", rating: "PG", color: "monsoon", label: "Now showing", times: ["1:10 PM", "4:20 PM", "7:30 PM"], areas: ["Makati", "BGC", "Quezon City"] },
  { title: "Last Train to Lucena", genre: "Thriller · Filipino", runtime: "2h 04m", rating: "R-13", color: "train", label: "New this week", times: ["12:40 PM", "3:50 PM", "8:10 PM"], areas: ["Makati", "Quezon City", "Pasig"] },
  { title: "Orbit House", genre: "Sci-fi · Adventure", runtime: "2h 16m", rating: "PG", color: "orbit", label: "Big screen pick", times: ["2:15 PM", "5:25 PM", "9:00 PM"], areas: ["BGC", "Quezon City", "Alabang"] },
  { title: "The Second Plate", genre: "Comedy · Family", runtime: "1h 38m", rating: "G", color: "plate", label: "Easy watch", times: ["11:50 AM", "2:30 PM", "6:15 PM"], areas: ["Pasig", "Alabang", "Makati"] },
];

const cinemas = [
  ["Greenbelt", "Makati", "Premium screens · 5 movies"], ["Uptown", "BGC", "Dolby Atmos · 4 movies"], ["Gateway", "Quezon City", "IMAX · 6 movies"], ["Estancia", "Pasig", "Recliner seats · 3 movies"],
];

export default function Home() {
  const [area, setArea] = useState("All Metro Manila");
  const [activeMovie, setActiveMovie] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const filtered = useMemo(() => area === "All Metro Manila" ? movies : movies.filter((movie) => movie.areas.includes(area)), [area]);
  const movie = movies[activeMovie];
  const toggleSave = (title: string) => setSaved((items) => items.includes(title) ? items.filter((x) => x !== title) : [...items, title]);

  return <main>
    <nav><a className="logo" href="#top"><span>MM</span>movie metro</a><div className="navlinks"><a href="#showing">Now showing</a><a href="#cinemas">Cinemas</a><a href="#guide">Movie guide</a></div><button className="location">⌖ {area === "All Metro Manila" ? "Metro Manila" : area}</button><button className="save-count">♡ <b>{saved.length}</b></button></nav>
    <section className="hero" id="top"><div className="hero-glow one" /><div className="hero-glow two" /><div className="hero-copy"><p className="kicker">YOUR NIGHT, SORTED</p><h1>Find the movie<br /><em>worth leaving home for.</em></h1><p className="hero-text">One calm place to see what’s playing around Metro Manila—then pick a cinema and go.</p><div className="finder"><label>Where are you?</label><div className="finder-row"><select aria-label="Choose an area" value={area} onChange={(e) => setArea(e.target.value)}><option>All Metro Manila</option><option>Makati</option><option>BGC</option><option>Quezon City</option><option>Pasig</option><option>Alabang</option></select><button onClick={() => document.getElementById("showing")?.scrollIntoView({ behavior: "smooth" })}>See what’s on →</button></div></div></div><div className="hero-poster"><div className="poster-stamp">FILM<br />FESTIVAL<br /><b>2026</b></div><div className="poster-title">AFTER<br />THE<br /><i>MONSOON</i></div><small>“The city feels different after rain.”</small><div className="grain" /></div></section>
    <section className="strip"><span>CURATED FOR METRO MANILA</span><span>•</span><span>SHOWTIMES, CINEMAS, AND NOISE-FREE PICKS</span><span>•</span><span>UPDATED WHEN YOU NEED IT</span></section>
    <section className="section" id="showing"><div className="section-head"><div><p className="kicker">PLAYING TODAY</p><h2>What’s good right now.</h2></div><button className="outline">Browse all movies <span>→</span></button></div><div className="movie-grid">{filtered.map((item) => { const index = movies.indexOf(item); return <article className="movie-card" key={item.title}><button className="art" onClick={() => setActiveMovie(index)}><div className={`movie-art ${item.color}`}><span>{item.label}</span><strong>{item.title}</strong><i>{item.genre}</i></div></button><div className="movie-info"><div><h3>{item.title}</h3><p>{item.genre} <b>·</b> {item.runtime}</p></div><button className={saved.includes(item.title) ? "heart saved" : "heart"} onClick={() => toggleSave(item.title)} aria-label={`Save ${item.title}`}>{saved.includes(item.title) ? "♥" : "♡"}</button></div><div className="time-row">{item.times.slice(0, 2).map((time) => <button key={time} onClick={() => setActiveMovie(index)}>{time}</button>)}<button onClick={() => setActiveMovie(index)}>+ more</button></div></article>})}</div>{filtered.length === 0 && <p className="empty">No sample showtimes for this area yet. Choose Metro Manila to explore all picks.</p>}</section>
    <section className="feature" id="guide"><div className={`feature-art ${movie.color}`}><span>TONIGHT’S PICK</span><strong>{movie.title.toUpperCase()}</strong><i>{movie.genre}</i></div><div className="feature-copy"><p className="kicker">YOUR SHORTLIST</p><h2>{movie.title}</h2><p>{movie.genre} · {movie.runtime} · {movie.rating}</p><blockquote>“A beautifully paced city story—best seen after dinner, with someone who likes a little quiet after the credits.”</blockquote><div className="showtimes"><span>Sample times near {area === "All Metro Manila" ? "you" : area}</span><div>{movie.times.map((time) => <button key={time} onClick={() => alert(`Demo: ${movie.title} at ${time} added to your plan.`)}>{time}</button>)}</div></div><button className="dark-button" onClick={() => toggleSave(movie.title)}>{saved.includes(movie.title) ? "Saved to your night list ✓" : "Save for tonight"}</button></div></section>
    <section className="section cinema-section" id="cinemas"><div className="section-head"><div><p className="kicker">PICK YOUR SCREEN</p><h2>Cinemas, by your side of town.</h2></div><button className="outline">View cinema map <span>→</span></button></div><div className="cinema-grid">{cinemas.map(([name, place, detail], index) => <button className="cinema" key={name} onClick={() => setArea(place)}><span className={`cinema-number c${index + 1}`}>0{index + 1}</span><div><strong>{name}</strong><p>{place} · {detail}</p></div><i>→</i></button>)}</div></section>
    <footer><a className="logo" href="#top"><span>MM</span>movie metro</a><p>A more relaxed way to choose a movie in Metro Manila.</p><small>Prototype data only. Showtimes will connect to verified cinema listings in the next phase.</small></footer>
  </main>;
}
