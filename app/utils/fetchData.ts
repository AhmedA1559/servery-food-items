import axios from "axios";
import cheerio from "cheerio";
import { randomInt } from "crypto";
import { format, subDays } from "date-fns";

// Define the URLs for each servery
const urls: { [key: string]: string } = {
  "Seibel Servery": "https://dining.rice.edu/seibel-servery",
  "Baker Servery": "https://dining.rice.edu/baker-college-kitchen",
  "South Servery": "https://dining.rice.edu/south-servery",
  "North Servery": "https://dining.rice.edu/north-servery",
  "West Servery": "https://dining.rice.edu/west-servery",
};

const currentDate = new Date();

const weekDays: string[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const weekDayMap: { [key: string]: Date } = weekDays.reduce(
  (acc, day, index) => {
    // Since Sunday is 0, we need to add 6 to get the previous day
    acc[day.toUpperCase()] = subDays(
      currentDate,
      ((currentDate.getDay() + 6) % 7) - index
    );
    return acc;
  },
  {} as { [key: string]: Date }
);

export interface FoodItem {
  servery: string;
  date: string;
  mealType: string;
  food: string;
  dietaryRestrictions: string[];
  category?: string;
}

export interface WeeklyMenu {
  [day: string]: {
    [mealType: string]: {
      [servery: string]: FoodItem[];
    };
  };
}

interface DailyMenu {
  [mealType: string]: {
    [servery: string]: {
      [category: string]: FoodItem[];
    };
  };
}

const parseHtml = (html: string, serveryName: string): FoodItem[] => {
  const $ = cheerio.load(html);
  const blockWeeklyLunch = $("#block-weeklylunch");

  if (!blockWeeklyLunch.length) {
    return [];
  }

  const mealSections = blockWeeklyLunch.find(".views-element-container");
  const foodItems: FoodItem[] = [];
  let previousDateStr: string | null = null;
  const seenItems = new Set<string>();

  mealSections.each((_, mealSection) => {
    const header = $(mealSection).find("header");
    const weekDayTag = header.find("h4.static-date");
    const weekDay = weekDayTag.text().trim().toUpperCase();
    const mealTypeTag = header.find("h2");
    const mealType = mealTypeTag.text().trim();

    const date = weekDayMap[weekDay];
    let dateStr = date ? format(date, "EEEE, MMMM dd, yyyy") : null;

    if (mealType === "DINNER" && previousDateStr) {
      dateStr = previousDateStr;
    }

    const sections = $(mealSection).find(".menu-items");

    sections.each((_, section) => {
      $(section)
        .find("a.mitem")
        .each((_, item) => {
          const foodName = $(item).find("div.mname").text().trim();
          const dietaryIcons = $(item).find("span.tooltip");
          const dietaryRestrictions = dietaryIcons
            .map((_, icon) => $(icon).attr("data-content") || "")
            .get();

          const foodItemStr = `${serveryName}-${dateStr}-${mealType}-${foodName}`;

          if (!seenItems.has(foodItemStr)) {
            foodItems.push({
              servery: serveryName,
              date: dateStr!,
              mealType,
              food: foodName,
              dietaryRestrictions,
            });
            seenItems.add(foodItemStr);
          }
        });
    });

    previousDateStr = dateStr;
  });

  return foodItems;
};

const parseTodayMenu = (html: string, serveryName: string): FoodItem[] => {
  const $ = cheerio.load(html);
  const blockTodayMenu = $("#block-weeklymenubystations");

  if (!blockTodayMenu.length) {
    return [];
  }

  const foodItems: FoodItem[] = [];

  const mealTypes = [
    {
      type: "LUNCH",
      blockId: "block-views-block-weekly-menu-by-stations-block-4",
    },
    {
      type: "DINNER",
      blockId: "block-views-block-weekly-menu-by-stations-block-12",
    },
  ];

  mealTypes.forEach(({ type, blockId }) => {
    const mealBlock = blockTodayMenu.find(`#${blockId}`);
    if (!mealBlock.length) {
      return;
    }

    // select either .menu-items or an h3 tag
    const sections = mealBlock.find(".menu-items, h3");
    let currentCategory = "";
    sections.each((_, section) => {
      // if section is an h3 tag, it is a category, so set it to currentCategory
      if ($(section).is("h3")) {
        currentCategory = $(section).text().trim();
        return;
      }
      const category = currentCategory || "Uncategorized";

      $(section)
        .find("a.mitem")
        .each((_, item) => {
          const foodName = $(item).find("div.mname").text().trim();
          const dietaryIcons = $(item).find("span.tooltip");
          const dietaryRestrictions = dietaryIcons
            .map((_, icon) => $(icon).attr("data-content") || "")
            .get();

          foodItems.push({
            servery: serveryName,
            date: format(currentDate, "EEEE, MMMM dd, yyyy"),
            mealType: type,
            food: foodName,
            dietaryRestrictions,
            category,
          });
        });
    });
  });

  return foodItems;
};

export const fetchMenuData = async (): Promise<{
  weeklyMenu: WeeklyMenu;
  dailyMenu: DailyMenu;
}> => {
  const weeklyMenu: WeeklyMenu = {};
  const dailyMenu: DailyMenu = {};

  const promises = Object.entries(urls).map(async ([serveryName, url]) => {
    try {
      // Use no caching to get the latest menu and also a fake parameter to prevent caching
      const response = await axios.get(url, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      const html = response.data;

      const foodItems = parseHtml(html, serveryName);
      foodItems.forEach((item) => {
        const { date, mealType, servery, food, dietaryRestrictions } = item;
        if (!weeklyMenu[date]) {
          weeklyMenu[date] = {};
        }
        if (!weeklyMenu[date][mealType]) {
          weeklyMenu[date][mealType] = {};
        }
        if (!weeklyMenu[date][mealType][servery]) {
          weeklyMenu[date][mealType][servery] = [];
        }
        weeklyMenu[date][mealType][servery].push({
          servery,
          date,
          mealType,
          food,
          dietaryRestrictions,
        });
      });

      const todayFoodItems = parseTodayMenu(html, serveryName);
      const seenItems: {
        [mealType: string]: {
          [servery: string]: Set<string>;
        };
      } = {};
      todayFoodItems.forEach((item) => {
        const { mealType, servery, food, dietaryRestrictions, category } = item;
        if (!dailyMenu[mealType]) {
          dailyMenu[mealType] = {};
          seenItems[mealType] = {};
        }
        if (!dailyMenu[mealType][servery]) {
          dailyMenu[mealType][servery] = {};
          if (!seenItems[mealType]) {
            seenItems[mealType] = {};
          }
          seenItems[mealType][servery] = new Set<string>();
        }
        if (category && !dailyMenu[mealType][servery][category]) {
          dailyMenu[mealType][servery][category] = [];
        }
        if (category && !seenItems[mealType][servery].has(food)) {
          dailyMenu[mealType][servery][category].push({
            servery,
            date: item.date,
            mealType,
            food,
            dietaryRestrictions,
            category,
          });
          seenItems[mealType][servery].add(food);
        }
      });
    } catch (error) {
      console.error(`Failed to retrieve content from ${url}`, error);
    }
  });

  await Promise.all(promises);

  return { weeklyMenu, dailyMenu };
};
