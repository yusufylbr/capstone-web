"use client";

import { useState, useEffect } from "react";
import styles from "../styles/compare.module.css";
import ExportCleanedData from "../ExportCleanedData";

export default function Compare() {
  return (
    <div>
      <h1>Phone Cleaner</h1>
      <ExportCleanedData />
    </div>
  );
}
