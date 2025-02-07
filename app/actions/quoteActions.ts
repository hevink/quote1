"use server";

import { Quote } from "@/types/quote";
import { promises as fs } from "fs";
import path from "path";

const dataFilePath = path.join(process.cwd(), "data", "quotes.json");

export async function getQuotes(): Promise<Quote[]> {
  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir);
    }

    // Ensure quotes.json exists and is valid
    try {
      const jsonData = await fs.readFile(dataFilePath, "utf8");
      return JSON.parse(jsonData);
    } catch (error) {
      // If file doesn't exist or is invalid, create new file with empty array
      await fs.writeFile(dataFilePath, JSON.stringify([]));
      return [];
    }
  } catch (error) {
    console.error("Error reading quotes:", error);
    return [];
  }
}

export async function saveQuotes(quotes: Quote[]): Promise<boolean> {
  try {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), "data");
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir);
    }

    // Save quotes to file
    await fs.writeFile(dataFilePath, JSON.stringify(quotes, null, 2));
    return true;
  } catch (error) {
    console.error("Error saving quotes:", error);
    return false;
  }
}
