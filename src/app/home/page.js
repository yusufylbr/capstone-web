"use client";

import { useState, useEffect } from "react";
import styles from "../styles/compare.module.css";

export default function SearchAndCompare() {
  const [phones, setPhones] = useState([]);
  const [filteredPhones, setFilteredPhones] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [closestPhones, setClosestPhones] = useState([]);
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

  useEffect(() => {
    fetch("/epey_phone_details.json")
      .then((response) => response.json())
      .then((data) => setPhones(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

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

  const parseStorageValue = (value) => {
    if (!value) return 0;
    value = value.toUpperCase();
    if (value.includes("TB")) return parseFloat(value) * 1000;
    if (value.includes("GB")) return parseFloat(value);
    if (value.includes("MB")) return parseFloat(value) / 1024;
    return parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  };

  const parseValue = (value) => {
    if (!value) return 0;
    value = value.toUpperCase();
    if (value.includes("TB") || value.includes("GB") || value.includes("MB")) {
      return parseStorageValue(value);
    }
    value = value
      .replace(/[^0-9.,]/g, "")
      .replace(/\./g, "")
      .replace(/,/g, ".");
    return parseFloat(value) || 0;
  };

  const calculateClosestPhones = (selected) => {
    const featureKeys = [
      "Çıkış Yılı",
      "Ekran Boyutu",
      "Ekran Çözünürlüğü",
      "Bellek (RAM)",
      "Dahili Depolama",
      "Batarya Kapasitesi (Tipik)",
      "Kamera Çözünürlüğü",
      "Ön Kamera Çözünürlüğü",
    ];

    const extractFeatures = (phone) => {
      const res = {};
      featureKeys.forEach((key) => {
        if (!phone[key]) res[key] = 0;
        else if (key === "Ekran Çözünürlüğü") {
          const resMatch = phone[key].match(/(\d+)[xX×](\d+)/);
          res[key] = resMatch
            ? parseInt(resMatch[1]) * parseInt(resMatch[2])
            : 0;
        } else res[key] = parseValue(phone[key]);
      });
      return res;
    };

    const matrix = phones.map((p) => extractFeatures(p));
    const normDivisors = {};
    featureKeys.forEach((key) => {
      normDivisors[key] = Math.sqrt(
        matrix.reduce((sum, row) => sum + Math.pow(row[key], 2), 0)
      );
    });

    const normalizedMatrix = matrix.map((row) => {
      const normalized = {};
      featureKeys.forEach((key) => {
        normalized[key] = row[key] / (normDivisors[key] || 1);
      });
      return normalized;
    });

    const std = (arr) => {
      const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
      return Math.sqrt(
        arr.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / arr.length
      );
    };

    const weights = {};
    const stdDevs = {};
    const correlations = {};

    featureKeys.forEach((key) => {
      const values = normalizedMatrix.map((r) => r[key]);
      stdDevs[key] = std(values);
      correlations[key] = {};
      featureKeys.forEach((otherKey) => {
        const a = normalizedMatrix.map((r) => r[key]);
        const b = normalizedMatrix.map((r) => r[otherKey]);
        const meanA = a.reduce((x, y) => x + y) / a.length;
        const meanB = b.reduce((x, y) => x + y) / b.length;
        const numerator = a.reduce(
          (sum, ai, i) => sum + (ai - meanA) * (b[i] - meanB),
          0
        );
        const denom = Math.sqrt(
          a.reduce((sum, ai) => sum + Math.pow(ai - meanA, 2), 0) *
            b.reduce((sum, bi) => sum + Math.pow(bi - meanB, 2), 0)
        );
        correlations[key][otherKey] = denom === 0 ? 0 : numerator / denom;
      });
    });

    let totalWeight = 0;
    featureKeys.forEach((key) => {
      const conflict = featureKeys.reduce(
        (sum, otherKey) => sum + (1 - Math.abs(correlations[key][otherKey])),
        0
      );
      weights[key] = stdDevs[key] * conflict;
      totalWeight += weights[key];
    });
    featureKeys.forEach((key) => {
      weights[key] /= totalWeight || 1;
    });

    const selectedFeatures = extractFeatures(selected);
    const selectedNormalized = {};
    featureKeys.forEach((key) => {
      selectedNormalized[key] =
        selectedFeatures[key] / (normDivisors[key] || 1);
    });

    const selectedWeighted = {};
    featureKeys.forEach((key) => {
      selectedWeighted[key] = selectedNormalized[key] * weights[key];
    });

    const scored = phones.map((p, i) => {
      const phoneWeighted = {};
      featureKeys.forEach((key) => {
        phoneWeighted[key] = normalizedMatrix[i][key] * weights[key];
      });
      const distance = Math.sqrt(
        featureKeys.reduce(
          (sum, key) =>
            sum + Math.pow(phoneWeighted[key] - selectedWeighted[key], 2),
          0
        )
      );
      return {
        ...p,
        closeness: distance,
      };
    });

    const sorted = scored
      .filter((p) => p.Ad !== selected.Ad)
      .sort((a, b) => a.closeness - b.closeness);

    setClosestPhones(sorted.slice(0, 10));
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
                calculateClosestPhones(phone);
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
                    <strong>Difference:</strong> {phone.closeness.toFixed(8)}
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
