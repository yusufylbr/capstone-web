"use client";

import { useState, useEffect } from "react";
import styles from "./styles/compare.module.css";

// Filter options
const brandOptions = [
  "Samsung",
  "Nubia",
  "Xiaomi",
  "OnePlus",
  "Honor",
  "realme",
  "Apple",
  "Vivo",
  "Tecno",
  "Huawei",
  "Poco",
  "Redmi",
  "Nothing",
  "Infinix",
  "Oppo",
  "Reeder",
  "General Mobile",
  "Omix",
  "Casper",
  "Wiko",
  "itel",
  "Oukitel",
];

const yearOptions = ["2025", "2024", "2023"];

const screenSizeOptions = [
  "Under 6.2 inches",
  "6.2 - 6.5 inches",
  "6.5 - 6.7 inches",
  "6.7 inches and above",
];

const resolutionOptions = ["HD+ (720p)", "FHD+ (1080p)", "QHD+ (1440p)"];

const antutuOptions = [
  "Under 500,000",
  "500,000 - 1,000,000",
  "1,000,000 - 1,500,000",
  "1,500,000 - 2,000,000",
  "2,000,000 and above",
];

const ramOptions = ["4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "24 GB"];

const storageOptions = ["64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"];

const batteryOptions = [
  "Under 4000 mAh",
  "4000 - 4500 mAh",
  "4500 - 5000 mAh",
  "5000 - 5500 mAh",
  "5500 - 6000 mAh",
  "6000 mAh and above",
];

const mainCameraOptions = [
  "12 MP and below",
  "13-48 MP",
  "50-64 MP",
  "65-100 MP",
  "100 MP and above",
];

const frontCameraOptions = [
  "8 MP and below",
  "9-15 MP",
  "16-32 MP",
  "32 MP and above",
];

const networkOptions = ["4G Only", "4G & 5G"];

// Helper functions for range checking
const checkScreenSize = (phoneSize, filterRange) => {
  if (!filterRange) return true;
  const size = parseFloat(phoneSize);

  switch (filterRange) {
    case "Under 6.2 inches":
      return size < 6.2;
    case "6.2 - 6.5 inches":
      return size >= 6.2 && size <= 6.5;
    case "6.5 - 6.7 inches":
      return size > 6.5 && size <= 6.7;
    case "6.7 inches and above":
      return size > 6.7;
    default:
      return true;
  }
};

const checkResolution = (phoneRes, filterRes) => {
  if (!filterRes) return true;

  const res = phoneRes.toLowerCase();
  switch (filterRes) {
    case "HD+ (720p)":
      return (
        (res.includes("720") || res.includes("hd+")) &&
        !res.includes("qhd+") &&
        !res.includes("fhd+")
      );
    case "FHD+ (1080p)":
      return res.includes("1080") || res.includes("fhd+");
    case "QHD+ (1440p)":
      return res.includes("1440") || res.includes("qhd+");
    default:
      return true;
  }
};

const checkAntutu = (phoneScore, filterRange) => {
  if (!filterRange) return true;

  // Handle both string and number inputs
  let score;
  if (typeof phoneScore === "string") {
    score = parseInt(phoneScore.replace(/,/g, ""));
  } else {
    score = phoneScore;
  }

  // Handle NaN cases
  if (isNaN(score)) return true;

  switch (filterRange) {
    case "Under 500,000":
      return score < 500000;
    case "500,000 - 1,000,000":
      return score >= 500000 && score < 1000000;
    case "1,000,000 - 1,500,000":
      return score >= 1000000 && score < 1500000;
    case "1,500,000 - 2,000,000":
      return score >= 1500000 && score < 2000000;
    case "2,000,000 and above":
      return score >= 2000000;
    default:
      return true;
  }
};

const checkRAM = (phoneRAM, filterRAM) => {
  if (!filterRAM) return true;
  const ram = parseInt(phoneRAM);
  const filterRam = parseInt(filterRAM);
  return ram === filterRam;
};

const checkStorage = (phoneStorage, filterStorage) => {
  if (!filterStorage) return true;
  const storage = parseInt(phoneStorage);
  const filterStorageValue = parseInt(filterStorage);
  return storage === filterStorageValue;
};

const checkBattery = (phoneBattery, filterRange) => {
  if (!filterRange) return true;
  const battery = parseInt(phoneBattery);

  switch (filterRange) {
    case "Under 4000 mAh":
      return battery < 4000;
    case "4000 - 4500 mAh":
      return battery >= 4000 && battery < 4500;
    case "4500 - 5000 mAh":
      return battery >= 4500 && battery < 5000;
    case "5000 - 5500 mAh":
      return battery >= 5000 && battery < 5500;
    case "5500 - 6000 mAh":
      return battery >= 5500 && battery < 6000;
    case "6000 mAh and above":
      return battery >= 6000;
    default:
      return true;
  }
};

const checkMainCamera = (phoneCamera, filterRange) => {
  if (!filterRange) return true;
  const camera = parseInt(phoneCamera);

  switch (filterRange) {
    case "12 MP and below":
      return camera <= 12;
    case "13-48 MP":
      return camera > 12 && camera <= 48;
    case "50-64 MP":
      return camera > 48 && camera <= 64;
    case "65-100 MP":
      return camera > 64 && camera <= 100;
    case "100 MP and above":
      return camera > 100;
    default:
      return true;
  }
};

const checkFrontCamera = (phoneCamera, filterRange) => {
  if (!filterRange) return true;
  const camera = parseInt(phoneCamera);

  switch (filterRange) {
    case "8 MP and below":
      return camera <= 8;
    case "9-15 MP":
      return camera > 8 && camera <= 15;
    case "16-32 MP":
      return camera > 15 && camera <= 32;
    case "32 MP and above":
      return camera > 32;
    default:
      return true;
  }
};

const checkNetwork = (has4G, has5G, filterNetwork) => {
  if (!filterNetwork) return true;

  switch (filterNetwork) {
    case "4G Only":
      return has4G === "Yes" && has5G !== "Yes";
    case "4G & 5G":
      return has4G === "Yes" && has5G === "Yes";
    default:
      return true;
  }
};

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
    network: "",
  });

  // Filter options mapping
  const filterOptions = {
    name: brandOptions,
    year: yearOptions,
    screenSize: screenSizeOptions,
    resolution: resolutionOptions,
    antutu: antutuOptions,
    ram: ramOptions,
    storage: storageOptions,
    battery: batteryOptions,
    mainCamera: mainCameraOptions,
    frontCamera: frontCameraOptions,
    network: networkOptions,
  };

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
        (!filters.name || phone["Ad"]?.includes(filters.name)) &&
        (!filters.year || phone["Çıkış Yılı"] === filters.year) &&
        checkScreenSize(phone["Ekran Boyutu"], filters.screenSize) &&
        checkResolution(phone["Ekran Çözünürlüğü"], filters.resolution) &&
        checkAntutu(phone["AnTuTu Puanı (v10)"], filters.antutu) &&
        checkRAM(phone["Bellek (RAM)"], filters.ram) &&
        checkStorage(phone["Dahili Depolama"], filters.storage) &&
        checkBattery(phone["Batarya Kapasitesi (Tipik)"], filters.battery) &&
        checkMainCamera(phone["Kamera Çözünürlüğü"], filters.mainCamera) &&
        checkFrontCamera(phone["Ön Kamera Çözünürlüğü"], filters.frontCamera) &&
        checkNetwork(phone["4G"], phone["5G"], filters.network)
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
              <select
                key={key}
                name={key}
                value={filters[key]}
                onChange={handleFilterChange}
                className={styles.searchBar}
              >
                <option value="">All {key}</option>
                {filterOptions[key]?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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
