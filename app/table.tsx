"use client";
import React, { useState } from "react";
import { WeeklyMenu } from "./utils/fetchData";

interface FoodTableProps {
  data: WeeklyMenu;
}

const serveries = [
  "Seibel Servery",
  "Baker Servery",
  "South Servery",
  "North Servery",
  "West Servery",
];

const dietaryFilters = [
  "Milk",
  "Gluten",
  "Nuts",
  "Tree nuts",
  "Peanuts",
  "Halal",
  "Vegan",
  "Vegetarian",
  "Fish",
  "Shellfish",
  "Eggs",
  "Soy",
  "Sesame",
];

const Table: React.FC<FoodTableProps> = ({ data }) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setActiveFilters((prevFilters) =>
      prevFilters.includes(filter)
        ? prevFilters.filter((f) => f !== filter)
        : [...prevFilters, filter]
    );
  };

  const isHighlighted = (dietaryRestrictions: string[]) => {
    return activeFilters.some((filter) => dietaryRestrictions.includes(filter));
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap mb-4 space-x-2">
        {dietaryFilters.map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 whitespace-nowrap rounded ${
              activeFilters.includes(filter)
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white"
            }`}
            onClick={() => toggleFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="border border-gray-200">
              <th className="p-2"></th>
              {serveries.map((servery) => (
                <th key={servery} className="p-2">
                  {servery.split(" ")[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(data).map((day) =>
              Object.keys(data[day]).map((mealType) => (
                <tr
                  key={`${day}-${mealType}`}
                  className="border border-gray-200"
                >
                  <td className="p-2 bg-gray-100">
                    <div className="font-semibold">
                      {mealType === "LUNCH" ? "Lunch" : "Dinner"}
                    </div>
                    <div className="text-sm text-gray-600">{day}</div>
                  </td>
                  {serveries.map((servery) => (
                    <td key={servery} className="p-2">
                      <ul className="list-disc list-inside">
                        {data[day][mealType][servery]?.map((item) => (
                          <li
                            key={item.food}
                            className={`text-sm ${
                              isHighlighted(item.dietaryRestrictions)
                                ? "bg-yellow-200"
                                : ""
                            }`}
                          >
                            {item.food}
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
