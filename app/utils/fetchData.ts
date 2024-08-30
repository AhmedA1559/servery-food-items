import axios from "axios";
import cheerio from "cheerio";
import { format, subDays, addDays } from "date-fns";

// Define the URLs for each servery
const urls: { [key: string]: string } = {
  "Seibel Servery": "https://dining.rice.edu/seibel-servery",
  "Baker Servery": "https://dining.rice.edu/baker-college-kitchen",
  "South Servery": "https://dining.rice.edu/south-servery",
  "North Servery": "https://dining.rice.edu/north-servery",
  "West Servery": "https://dining.rice.edu/west-servery",
};

export interface FoodItem {
  servery: string;
  date: string;
  mealType: string;
  food: string;
  dietaryRestrictions: string[];
  category?: string;
}

export interface Menu {
  [day: string]: {
    [mealType: string]: {
      [servery: string]: FoodItem[];
    };
  };
}

const parseTodayMenu = (
  html: string,
  serveryName: string,
  date: Date
): FoodItem[] => {
  const $ = cheerio.load(html);
  const blockTodayMenu = $("#block-weeklymenubystations");

  if (!blockTodayMenu.length) {
    return [];
  }

  const foodItems: FoodItem[] = [];

  const dayOfWeek = (date.getDay() + 6) % 7;
  const mealTypes = [
    {
      type: "LUNCH",
      blockId: `block-views-block-weekly-menu-by-stations-block-${
        dayOfWeek + 2
      }`,
    },
    {
      type: "DINNER",
      blockId: `block-views-block-weekly-menu-by-stations-block-${
        dayOfWeek + 10
      }`,
    },
  ];

  mealTypes.forEach(({ type, blockId }) => {
    const block = blockTodayMenu.find(`#${blockId}`);
    if (!block.length) {
      return;
    }

    // select either .menu-items or an h3 tag
    const sections = block.find(".menu-items, h3");
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
            date: format(date, "EEEE, MMMM dd, yyyy"),
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

const parseWeeklyMenu = async (
  serveryName: string,
  url: string
): Promise<Menu> => {
  const weeklyMenu: Menu = {};
  const currentDate = new Date();

  const config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: url,
    headers: { }
  };
  const response = await axios.request(config)
  const html = response.data;
  // get the date of this week's Monday
  const monday = subDays(currentDate, (currentDate.getDay() + 6) % 7);
  for (let i = 0; i < 7; i++) {
    const date = addDays(monday, i);

    const foodItems = parseTodayMenu(html, serveryName, date);
    const seenItems: {
      [mealType: string]: Set<string>;
    } = {};

    foodItems.forEach((item) => {
      const { date, mealType, servery, food, dietaryRestrictions, category } =
        item;
      if (!weeklyMenu[date]) {
        weeklyMenu[date] = {};
      }
      if (!weeklyMenu[date][mealType]) {
        weeklyMenu[date][mealType] = {};
        seenItems[mealType] = new Set();
      }
      if (!weeklyMenu[date][mealType][servery]) {
        weeklyMenu[date][mealType][servery] = [];
      }
      if (seenItems[mealType].has(food)) {
        return;
      }
      weeklyMenu[date][mealType][servery].push({
        servery,
        date,
        mealType,
        food,
        dietaryRestrictions,
        category,
      });
      seenItems[mealType].add(food);
    });
  }

  return weeklyMenu;
};

export const fetchMenuData = async (): Promise<Menu> => {
  const weeklyMenu: Menu = {};

  const promises = Object.entries(urls).map(async ([serveryName, url]) => {
    try {
      const serveryWeeklyMenu = await parseWeeklyMenu(serveryName, url);

      // combine together the weekly menu for all serveries
      Object.entries(serveryWeeklyMenu).forEach(([date, dailyMenu]) => {
        if (!weeklyMenu[date]) {
          weeklyMenu[date] = {};
        }
        Object.entries(dailyMenu).forEach(([mealType, serveryMenu]) => {
          if (!weeklyMenu[date][mealType]) {
            weeklyMenu[date][mealType] = {};
          }
          Object.entries(serveryMenu).forEach(([servery, foodItems]) => {
            if (!weeklyMenu[date][mealType][servery]) {
              weeklyMenu[date][mealType][servery] = [];
            }
            weeklyMenu[date][mealType][servery].push(...foodItems);
          });
        });
      });
    } catch (error) {
      console.error(`Failed to retrieve content from ${url}`, error);
    }
  });
  await Promise.all(promises);
  // Convert keys into dates and sort them
  const sortedDates = Object.keys(weeklyMenu).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateA.getTime() - dateB.getTime();
  });

  // Create a new sorted menu object
  const sortedMenu: Menu = {};

  // Populate the sorted menu object with sorted dates
  sortedDates.forEach((date) => {
    sortedMenu[date] = weeklyMenu[date];
  });

  return sortedMenu;
};
