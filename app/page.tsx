// app/page.js
"use client";
import { useState, useEffect } from "react";
import { useTable, useFilters } from "react-table";
import { fetchData } from "../utils/fetchData";

export default function Home({ data }) {
  const [filter, setFilter] = useState("");
  const [groupedData, setGroupedData] = useState({});

  useEffect(() => {
    if (filter) {
      const filteredData = data.filter((item) =>
        item.dietary_restrictions.includes(filter)
      );
      groupByDate(filteredData);
    } else {
      groupByDate(data);
    }
  }, [filter, data]);

  const groupByDate = (data) => {
    const grouped = data.reduce((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = {};
      }
      if (!acc[date][item.servery]) {
        acc[date][item.servery] = [];
      }
      acc[date][item.servery].push(item);
      return acc;
    }, {});
    setGroupedData(grouped);
  };

  const uniqueDietaryRestrictions = Array.from(
    new Set(data.flatMap((item) => item.dietary_restrictions))
  );

  return (
    <div>
      <h1>Servery Food Items</h1>
      <div>
        <label>Filter by Dietary Restriction:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          {uniqueDietaryRestrictions.map((restriction, index) => (
            <option key={index} value={restriction}>
              {restriction}
            </option>
          ))}
        </select>
      </div>
      {Object.keys(groupedData).map((date, index) => (
        <div key={index}>
          <h2>{date}</h2>
          <table>
            <thead>
              <tr>
                <th>Servery</th>
                <th>Meal Type</th>
                <th>Food</th>
                <th>Dietary Restrictions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(groupedData[date]).map((servery, sIndex) =>
                groupedData[date][servery].map((item, fIndex) => (
                  <tr key={`${sIndex}-${fIndex}`}>
                    <td>{servery}</td>
                    <td>{item.meal_type}</td>
                    <td>{item.food}</td>
                    <td>{item.dietary_restrictions.join(", ")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export async function getStaticProps() {
  const data = await fetchData();
  return {
    props: {
      data,
    },
  };
}
