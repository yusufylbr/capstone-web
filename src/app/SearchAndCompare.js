"use client";

import { useState, useEffect } from "react";
import styles from "./styles/compare.module.css";

export default function SearchAndCompare() {
  const [phones, setPhones] = useState([]);
  const [filteredPhones, setFilteredPhones] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [closestPhones, setClosestPhones] = useState([]);
  const [topsisData, setTopsisData] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    year: "",
    screenSize: "",
    resolution: "",
    antutu: "",
    ram: "",
    storage: "",
    battery: "",
    mainCamera: "",
    frontCamera: "",
    has4G: "",
    has5G: "",
  });

  // Fetch phone details
  useEffect(() => {
    fetch("/epey_phone_details.json")
      .then((response) => response.json())
      .then((data) => setPhones(data))
      .catch((error) => console.error("Error fetching phone details:", error));
  }, []);

  // Fetch TOPSIS scores
  useEffect(() => {
    fetch("/topsis-ranked.json")
      .then((response) => response.json())
      .then((data) => setTopsisData(data))
      .catch((error) => console.error("Error fetching TOPSIS data:", error));
  }, []);

  // Filter phones based on user input
  useEffect(() => {
    const filtered = phones.filter((phone) => {
      return (
        (!filters.name ||
          phone["Ad"]?.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.year ||
          phone["Çıkış Yılı"]
            ?.toLowerCase()
            .includes(filters.year.toLowerCase())) &&
        (!filters.screenSize ||
          phone["Ekran Boyutu"]
            ?.toLowerCase()
            .includes(filters.screenSize.toLowerCase())) &&
        (!filters.resolution ||
          phone["Ekran Çözünürlüğü"]
            ?.toLowerCase()
            .includes(filters.resolution.toLowerCase())) &&
        (!filters.antutu ||
          phone["AnTuTu Puanı (v10)"]
            ?.toLowerCase()
            .includes(filters.antutu.toLowerCase())) &&
        (!filters.ram ||
          phone["Bellek (RAM)"]
            ?.toLowerCase()
            .includes(filters.ram.toLowerCase())) &&
        (!filters.storage ||
          phone["Dahili Depolama"]
            ?.toLowerCase()
            .includes(filters.storage.toLowerCase())) &&
        (!filters.battery ||
          phone["Batarya Kapasitesi (Tipik)"]
            ?.toLowerCase()
            .includes(filters.battery.toLowerCase())) &&
        (!filters.mainCamera ||
          phone["Kamera Çözünürlüğü"]
            ?.toLowerCase()
            .includes(filters.mainCamera.toLowerCase())) &&
        (!filters.frontCamera ||
          phone["Ön Kamera Çözünürlüğü"]
            ?.toLowerCase()
            .includes(filters.frontCamera.toLowerCase())) &&
        (!filters.has4G ||
          phone["4G"]?.toLowerCase().includes(filters.has4G.toLowerCase())) &&
        (!filters.has5G ||
          phone["5G"]?.toLowerCase().includes(filters.has5G.toLowerCase()))
      );
    });
    setFilteredPhones(filtered);
  }, [filters, phones]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const findClosestPhones = (selected) => {
    const selectedTopsis = topsisData.find(
      (entry) => entry["Phone Model"] === selected["Ad"]
    );

    if (!selectedTopsis) {
      console.error("Selected phone not found in TOPSIS data.");
      return;
    }

    const selectedScore = parseFloat(
      selectedTopsis["TOPSIS Score"].replace(",", ".")
    );

    const scoredPhones = topsisData.map((entry) => {
      const phoneScore = parseFloat(entry["TOPSIS Score"].replace(",", "."));
      return {
        model: entry["Phone Model"],
        score: phoneScore,
        difference: Math.abs(phoneScore - selectedScore),
      };
    });

    const sortedPhones = scoredPhones
      .filter((entry) => entry.model !== selected["Ad"])
      .sort((a, b) => a.difference - b.difference);

    // Merge with full data from `phones`
    const mergedPhones = sortedPhones
      .slice(0, 10)
      .map((entry) => {
        const fullPhoneData = phones.find((p) => p["Ad"] === entry.model);
        if (!fullPhoneData) return null; // skip if not found

        return {
          ...fullPhoneData,
          "TOPSIS Score": entry.score.toFixed(8),
          difference: entry.difference,
        };
      })
      .filter(Boolean); // remove any nulls

    setClosestPhones(mergedPhones);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Smartphone Search & Comparison</h1>
      {!selectedPhone ? (
        <>
          <div className={styles.phoneSearchSection}>
            {Object.keys(filters).map((key) => (
              <input
                key={key}
                type="text"
                name={key}
                placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                value={filters[key]}
                onChange={handleFilterChange}
                className={styles.searchBar}
              />
            ))}
          </div>
          <p className={styles.matchCount}>
            {filteredPhones.length} phone
            {filteredPhones.length !== 1 ? "s" : ""} match your search.
          </p>
        </>
      ) : (
        <h2 className={styles.matchCount}>
          Closest 10 phones to {selectedPhone["Ad"]} are shown:
        </h2>
      )}
      {!selectedPhone && (
        <div className={styles.phoneList}>
          {filteredPhones.map((phone, index) => (
            <div
              key={index}
              className={styles.phoneCard}
              onClick={() => {
                setSelectedPhone(phone);
                findClosestPhones(phone);
              }}
            >
              <img
                src={phone["Resim"]}
                alt={phone["Ad"]}
                className={styles.phoneImage}
              />
              <h3>{phone["Ad"]}</h3>
              <p>
                <strong>Release Year:</strong> {phone["Çıkış Yılı"]}
              </p>
              <p>
                <strong>Screen Size:</strong> {phone["Ekran Boyutu"]}
              </p>
              <p>
                <strong>Resolution:</strong> {phone["Ekran Çözünürlüğü"]}
              </p>
              <p>
                <strong>AnTuTu Score:</strong> {phone["AnTuTu Puanı (v10)"]}
              </p>
              <p>
                <strong>RAM:</strong> {phone["Bellek (RAM)"]}
              </p>
              <p>
                <strong>Storage:</strong> {phone["Dahili Depolama"]}
              </p>
              <p>
                <strong>Battery:</strong> {phone["Batarya Kapasitesi (Tipik)"]}
              </p>
              <p>
                <strong>Main Camera:</strong> {phone["Kamera Çözünürlüğü"]}
              </p>
              <p>
                <strong>Front Camera:</strong> {phone["Ön Kamera Çözünürlüğü"]}
              </p>
              <p>
                <strong>4G:</strong> {phone["4G"]}
              </p>
              <p>
                <strong>5G:</strong> {phone["5G"]}
              </p>
            </div>
          ))}
        </div>
      )}
      {selectedPhone && (
        <>
          <div className={styles.comparisonSection}>
            <div className={styles.selectedPhoneSection}>
              <button
                onClick={() => {
                  setSelectedPhone(null);
                  setClosestPhones([]);
                }}
                className={styles.backButton}
              >
                ⬅ Look for another phone
              </button>
              <div className={styles.selectedPhoneCard}>
                <div className={styles.selectedPhoneImageSection}>
                  <h3>{selectedPhone["Ad"]}</h3>
                  <img
                    src={selectedPhone["Resim"]}
                    alt={selectedPhone["Ad"]}
                    className={styles.selectedPhoneImage}
                  />
                </div>
                <div className={styles.selectedPhoneDetails}>
                  <p>
                    <strong>Release Year:</strong> {selectedPhone["Çıkış Yılı"]}
                  </p>
                  <p>
                    <strong>Screen Size:</strong>{" "}
                    {selectedPhone["Ekran Boyutu"]}
                  </p>
                  <p>
                    <strong>Resolution:</strong>{" "}
                    {selectedPhone["Ekran Çözünürlüğü"]}
                  </p>
                  <p>
                    <strong>RAM:</strong> {selectedPhone["Bellek (RAM)"]}
                  </p>
                  <p>
                    <strong>Storage:</strong> {selectedPhone["Dahili Depolama"]}
                  </p>
                  <p>
                    <strong>Battery:</strong>{" "}
                    {selectedPhone["Batarya Kapasitesi (Tipik)"]}
                  </p>
                  <p>
                    <strong>Main Camera:</strong>{" "}
                    {selectedPhone["Kamera Çözünürlüğü"]}
                  </p>
                  <p>
                    <strong>Front Camera:</strong>{" "}
                    {selectedPhone["Ön Kamera Çözünürlüğü"]}
                  </p>
                  <p>
                    <strong>4G:</strong> {selectedPhone["4G"]}
                  </p>
                  <p>
                    <strong>5G:</strong> {selectedPhone["5G"]}
                  </p>
                </div>
              </div>
            </div>
            <div className={styles.alternativesSection}>
              {closestPhones.map((phone, index) => (
                <div key={index} className={styles.phoneCard}>
                  <img
                    src={phone["Resim"]}
                    alt={phone["Ad"]}
                    className={styles.phoneImage}
                  />
                  <h3>{phone["Ad"]}</h3>
                  <p>
                    <strong>Release Year:</strong> {phone["Çıkış Yılı"]}
                  </p>
                  <p>
                    <strong>Screen Size:</strong> {phone["Ekran Boyutu"]}
                  </p>
                  <p>
                    <strong>Resolution:</strong> {phone["Ekran Çözünürlüğü"]}
                  </p>
                  <p>
                    <strong>AnTuTu Score:</strong> {phone["AnTuTu Puanı (v10)"]}
                  </p>
                  <p>
                    <strong>RAM:</strong> {phone["Bellek (RAM)"]}
                  </p>
                  <p>
                    <strong>Storage:</strong> {phone["Dahili Depolama"]}
                  </p>
                  <p>
                    <strong>Battery:</strong>{" "}
                    {phone["Batarya Kapasitesi (Tipik)"]}
                  </p>
                  <p>
                    <strong>Main Camera:</strong> {phone["Kamera Çözünürlüğü"]}
                  </p>
                  <p>
                    <strong>Front Camera:</strong>{" "}
                    {phone["Ön Kamera Çözünürlüğü"]}
                  </p>
                  <p>
                    <strong>4G:</strong> {phone["4G"]}
                  </p>
                  <p>
                    <strong>5G:</strong> {phone["5G"]}
                  </p>
                  <p>
                    <strong>TOPSIS Score:</strong> {phone["TOPSIS Score"]}
                  </p>
                  <p>
                    <strong>Difference:</strong> {phone.difference.toFixed(8)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
