"use client";

import { useState, useEffect } from "react";
import styles from "../styles/compare.module.css";
import ExportCleanedData from "../ExportCleanedData";
import ExportEnglishData from "../ExportEnglishData";

export default function Compare() {
  return (
    <div>
      <h1>Phone Data Export</h1>
      <div
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          margin: "1rem",
        }}
      >
        <ExportCleanedData />
        <ExportEnglishData />
      </div>
    </div>
  );
}
