"use client";

import { useState, useEffect } from "react";
import styles from "../styles/compare.module.css";

export default function Compare() {
  const [phones, setPhones] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [closestPhones, setClosestPhones] = useState([]);

  useEffect(() => {
    fetch("/epey_phone_details.json")
      .then((response) => response.json())
      .then((data) => setPhones(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

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

  const handlePhoneSelect = (phone) => {
    setSelectedPhone(phone);
    calculateClosestPhones(phone);
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
        if (!phone[key]) {
          res[key] = 0;
        } else if (key === "Ekran Çözünürlüğü") {
          const resMatch = phone[key].match(/(\d+)[xX×](\d+)/);
          res[key] = resMatch
            ? parseInt(resMatch[1]) * parseInt(resMatch[2])
            : 0;
        } else {
          res[key] = parseValue(phone[key]);
        }
      });
      return res;
    };

    const matrix = phones.map((p) => extractFeatures(p));
    const normDivisors = {};
    featureKeys.forEach((key) => {
      const sumSquares = matrix.reduce(
        (sum, row) => sum + Math.pow(row[key], 2),
        0
      );
      normDivisors[key] = Math.sqrt(sumSquares);
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
      weights[key] = weights[key] / (totalWeight || 1);
    });

    const weightedNormalizedPhones = phones.map((phone, index) => {
      const weighted = {};
      featureKeys.forEach((key) => {
        weighted[key] = normalizedMatrix[index][key] * weights[key];
      });
      return {
        ...phone,
        features: matrix[index],
        weighted,
      };
    });

    const ideal = {},
      antiIdeal = {};
    featureKeys.forEach((key) => {
      const vals = weightedNormalizedPhones.map((p) => p.weighted[key]);
      ideal[key] = Math.max(...vals);
      antiIdeal[key] = Math.min(...vals);
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

    const scored = weightedNormalizedPhones.map((p) => {
      const distance = Math.sqrt(
        featureKeys.reduce(
          (sum, key) =>
            sum + Math.pow(p.weighted[key] - selectedWeighted[key], 2),
          0
        )
      );
      return {
        ...p,
        closeness: distance,
      };
    });

    const selectedName = selected?.Ad;
    const sorted = scored
      .filter((p) => p.Ad !== selectedName)
      .sort((a, b) => a.closeness - b.closeness);

    setClosestPhones(sorted.slice(0, 10));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Compare Smartphones</h1>
      </header>
      <main className={styles.main}>
        {!selectedPhone ? (
          <div className={styles.phoneList}>
            <h2>Select a Phone</h2>
            {phones.map((phone, index) => (
              <div
                key={index}
                className={styles.phoneCard}
                onClick={() => handlePhoneSelect(phone)}
              >
                <img
                  src={phone["Resim"]}
                  alt={phone["Ad"]}
                  className={styles.phoneImage}
                />
                <h3>{phone["Ad"]}</h3>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button
              onClick={() => {
                setSelectedPhone(null);
                setClosestPhones([]);
              }}
              className={styles.backButton}
            >
              ⬅ Back to Search
            </button>
            <h2>Selected: {selectedPhone["Ad"]}</h2>
            <div className={styles.phoneCard}>
              <img
                src={selectedPhone["Resim"]}
                alt={selectedPhone["Ad"]}
                className={styles.phoneImage}
              />
              <h3>{selectedPhone["Ad"]}</h3>
              <p>
                <strong>Release Year:</strong> {selectedPhone["Çıkış Yılı"]}
              </p>
              <p>
                <strong>Screen Size:</strong> {selectedPhone["Ekran Boyutu"]}
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
            </div>
            <h2>Closest Phones</h2>
            <div className={styles.phoneList}>
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
                  <a
                    href={
                      phone["URL"] ||
                      `https://www.epey.com/akilli-telefonlar/${phone["Ad"]
                        ?.toLowerCase()
                        .replace(/ /g, "-")}.html`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Details
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
