import { useState, useEffect } from "react";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [phones, setPhones] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch the JSON data
    fetch("/epey_phone_details.json")
      .then((response) => response.json())
      .then((data) => setPhones(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Filter phones based on the search term
  const filteredPhones = phones.filter((phone) =>
    phone["Çıkış Yılı"].toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Smartphone Comparison</h1>
        <input
          type="text"
          placeholder="Search by year..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchBar}
        />
      </header>
      <main className={styles.main}>
        <div className={styles.phoneList}>
          {filteredPhones.map((phone, index) => (
            <div key={index} className={styles.phoneCard}>
              <h3>Release Year: {phone["Çıkış Yılı"]}</h3>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
