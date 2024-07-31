// utils/fetchData.js
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

export async function fetchData() {
  const filePath = path.join(process.cwd(), 'public', 'servery_food_items.csv');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const parsed = Papa.parse(fileContent, { header: true });
  return parsed.data;
}
