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

const dietaryFilters: { [key: string]: string } = {
  Milk: "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_dairy.svg",
  Gluten:
    "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_gluten_0.svg",
  "Tree nuts":
    "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_treenut.svg",
  Peanuts:
    "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_peanut.svg",
  Halal:
    "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_halal--diet.svg",
  Vegan:
    "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_vegan--diet.svg",
  Vegetarian:
    "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_vegetarian--diet.svg",
  Fish: "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_fish.svg",
  Shellfish:
    "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_shellfish.svg",
  Eggs: "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_egg.svg",
  Soy: "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_soybean.svg",
  Sesame:
    "https://dining.rice.edu/sites/g/files/bxs4236/files/2023-06/icon_sesame.svg",
};

const dayToTypeTimes: {
  [key: string]: { [key: string]: { start: Date; end: Date } };
} = {
  Monday: {
    LUNCH: {
      start: new Date(0, 0, 0, 11, 30),
      end: new Date(0, 0, 0, 13, 30),
    },
    DINNER: {
      start: new Date(0, 0, 0, 17, 30),
      end: new Date(0, 0, 0, 20, 0),
    },
  },
  Tuesday: {
    LUNCH: {
      start: new Date(0, 0, 0, 11, 30),
      end: new Date(0, 0, 0, 13, 30),
    },
    DINNER: {
      start: new Date(0, 0, 0, 17, 30),
      end: new Date(0, 0, 0, 20, 0),
    },
  },
  Wednesday: {
    LUNCH: {
      start: new Date(0, 0, 0, 11, 30),
      end: new Date(0, 0, 0, 13, 30),
    },
    DINNER: {
      start: new Date(0, 0, 0, 17, 30),
      end: new Date(0, 0, 0, 20, 0),
    },
  },
  Thursday: {
    LUNCH: {
      start: new Date(0, 0, 0, 11, 30),
      end: new Date(0, 0, 0, 13, 30),
    },
    DINNER: {
      start: new Date(0, 0, 0, 17, 30),
      end: new Date(0, 0, 0, 20, 0),
    },
  },
  Friday: {
    LUNCH: {
      start: new Date(0, 0, 0, 11, 30),
      end: new Date(0, 0, 0, 13, 30),
    },
    DINNER: {
      start: new Date(0, 0, 0, 17, 30),
      end: new Date(0, 0, 0, 20, 0),
    },
  },
  Saturday: {
    LUNCH: {
      start: new Date(0, 0, 0, 11, 30),
      end: new Date(0, 0, 0, 14, 0),
    },
    DINNER: {
      start: new Date(0, 0, 0, 17, 0),
      end: new Date(0, 0, 0, 20, 0),
    },
  },
  Sunday: {
    LUNCH: {
      start: new Date(0, 0, 0, 11, 30),
      end: new Date(0, 0, 0, 14, 0),
    },
    DINNER: {
      start: new Date(0, 0, 0, 17, 0),
      end: new Date(0, 0, 0, 20, 0),
    },
  },
};

const Table: React.FC<FoodTableProps> = ({ data }) => {
  const currentDate = new Date();

  const filterData: { [key: string]: { [key: string]: any } } = Object.keys(
    data
  ).reduce((filteredData: { [key: string]: { [key: string]: any } }, day) => {
    const filteredMeals: { [key: string]: any } = Object.keys(data[day]).reduce(
      (filteredMeals, mealType) => {
        const endTime = dayToTypeTimes[day.split(",")[0]]?.[mealType]?.end;
        // parse through day to get original date
        const originalDate = new Date(Date.parse(day));
        endTime.setFullYear(originalDate.getFullYear());
        endTime.setMonth(originalDate.getMonth());
        endTime.setDate(originalDate.getDate());
        if (endTime && endTime > currentDate) {
          filteredMeals[mealType] = data[day][mealType];
        }
        return filteredMeals;
      },
      {} as { [key: string]: any }
    );

    if (Object.keys(filteredMeals).length > 0) {
      filteredData[day] = filteredMeals;
    }

    return filteredData;
  }, {});

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
    <div>
      <div className="flex flex-wrap">
        {Object.keys(dietaryFilters).map((filter) => (
          <>
            <div
              className={`h-10 md:h-12 flex my-2 whitespace-nowrap rounded justify-between filter border 
                items-stretch mr-4
                ${filter.replace(/\s+/g, "").toLowerCase()} ${
                activeFilters.includes(filter) ? "selected" : ""
              }`}
              onClick={() => toggleFilter(filter)}
              key={filter}
            >
              <img src={dietaryFilters[filter]} className="h-full p-2" />
              <div
                className={`
                    flex items-center px-2 text-sm font-semibold transition duration-300 ease-in-out
                    ${activeFilters.includes(filter) ? "selected" : ""}`}
              >
                {filter}
              </div>
            </div>
          </>
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
            {Object.keys(filterData).map((day) =>
              Object.keys(filterData[day]).map((mealType) => (
                <tr
                  key={`${day}-${mealType}`}
                  className="border border-gray-200"
                >
                  <td className="p-2 bg-gray-100">
                    <div className="font-semibold">
                      {mealType === "LUNCH" ? "Lunch" : "Dinner"}
                    </div>
                    <div className="text-sm text-gray-600">{day}</div>
                    <div className="text-sm text-gray-600">
                      {dayToTypeTimes[day.split(",")[0]]?.[
                        mealType
                      ]?.start?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {dayToTypeTimes[day.split(",")[0]]?.[
                        mealType
                      ]?.end?.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
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
