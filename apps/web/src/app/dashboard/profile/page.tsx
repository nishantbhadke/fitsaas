"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";

interface Meal {
  title: string;
  time: string;
  items: string[];
  portion: string;
}

interface ClinicalSubtypeConfig {
  name: string;
  description: string;
  avoid?: string[];
  superfoods?: string[];
  guidelines?: string[];
}

interface DiseaseDietConfig {
  name: string;
  icon: string;
  description: string;
  avoid: string[];
  superfoods: string[];
  guidelines: string[];
  subtypes?: Record<string, ClinicalSubtypeConfig>;
  meals: {
    [pref: string]: {
      [goal: string]: Meal[];
    };
  };
}

const NUTRITION_DATABASE: Record<string, DiseaseDietConfig> = {
  diabetes: {
    name: "Diabetes (Type 2) / Insulin Resistance",
    icon: "🩸",
    description: "Low-glycemic index meals designed to stabilize blood glucose levels, optimize insulin sensitivity, and prevent post-prandial spikes.",
    subtypes: {
      type2: {
        name: "Type 2 Diabetes & Insulin Resistance",
        description: "Focuses on reversing insulin resistance, metabolic flexibility, weight management, and low carbohydrate spacing.",
        avoid: [
          "White bread, refined white flour (maida), white rice, and refined pasta",
          "Sugary beverages, packaged juices, sodas, and energy drinks",
          "Processed snacks, sweets, candies, and deep-fried foods",
          "Excessive dried fruits (raisins, dates) and ultra-ripe bananas"
        ],
        superfoods: [
          "Cinnamon (helps improve insulin sensitivity)",
          "Chia seeds & Flaxseeds (packed with soluble fiber)",
          "Fenugreek seeds (methi) soaked in water",
          "Apple Cider Vinegar (ACV) before complex meals"
        ]
      },
      type1: {
        name: "Type 1 Diabetes (Autoimmune Control)",
        description: "Focuses on precise carbohydrate counting, matching insulin-to-carbohydrate ratios, and stable complex carb release to prevent hypoglycemia.",
        avoid: [
          "Fast-acting processed sugars without matching insulin dose",
          "Skipping complex meals while active background insulin is running"
        ],
        superfoods: [
          "Consistent complex carbohydrate portions",
          "Healthy fats (avocado, nuts) to slow stomach emptying",
          "Psyllium husk (soluble fiber) for digestion stability"
        ]
      },
      gestational: {
        name: "Gestational Diabetes (Pregnancy-Induced)",
        description: "Calibrated for both healthy fetal development and maternal glucose stability. Focuses on moderate-sized high-fiber complex carb meals.",
        avoid: [
          "Sugary breakfast cereals, sweetened milks, and fruit juices",
          "Extreme ketogenic/low-carb fasting diets (not safe during pregnancy)"
        ],
        superfoods: [
          "Organic Greek yogurt (rich in protein and calcium)",
          "Moong sprouts (clean protein and high fiber)",
          "Whole organic lentils (rich in folate and iron)"
        ]
      }
    },
    avoid: [
      "White bread, refined white flour (maida), white rice, and refined pasta",
      "Sugary beverages, packaged juices, sodas, and energy drinks",
      "Processed snacks, sweets, candies, and deep-fried foods",
      "Excessive dried fruits (raisins, dates) and ultra-ripe bananas"
    ],
    superfoods: [
      "Cinnamon (helps improve insulin sensitivity)",
      "Chia seeds & Flaxseeds (packed with soluble fiber)",
      "Fenugreek seeds (methi) soaked in water",
      "Apple Cider Vinegar (ACV) before complex meals"
    ],
    guidelines: [
      "Follow the 'Plate Method': 50% non-starchy vegetables, 25% lean protein, 25% complex carbs.",
      "Never eat carbohydrates alone; always pair them with a quality fat, fiber, or protein source.",
      "Aim for a 10-15 minute light walk immediately after your largest meals."
    ],
    meals: {
      veg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["Spiced Methi Oats Chilla with grated zucchini & spinach", "1 cup unsweetened Almond Milk"], portion: "Medium plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Handful of soaked Almonds & Walnuts", "1 cup organic Green Tea"], portion: "1 small handful" },
          { title: "Lunch", time: "1:30 PM", items: ["Sprout Salad with cucumbers, tomatoes, and lemon juice", "1 cup Dal", "1 small Bajra (pearl millet) Roti"], portion: "Large bowl salad, 1 roti" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Roasted Bengal Gram (Chana)", "Hot Lemon Water"], portion: "1 small bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled Tofu steaks with steamed broccoli, asparagus, and bell peppers", "Stir-fried mushrooms in olive oil"], portion: "Medium bowl" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["Double Paneer-stuffed Multigrain Rotis", "Greek Yogurt with a pinch of roasted cumin", "1 tablespoon pumpkin seeds"], portion: "Large plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Avocado & Spinach green smoothie with scoop of Pea Protein", "Soaked Walnuts"], portion: "1 large glass" },
          { title: "Lunch", time: "1:30 PM", items: ["Tofu stir-fry in olive oil", "Brown Rice", "1 cup thick black Dal", "Stir-fried green beans"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Roasted Paneer cubes with bell peppers & chaat masala", "Mixed seeds mix"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Quinoa Khichdi loaded with paneer, edamame, and broccoli", "1 cup mixed bean soup"], portion: "Large bowl" }
        ]
      },
      nonveg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 Egg White Omelet with spinach, mushrooms, and onions", "1 slice of sprouted grain sourdough toast"], portion: "1 plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup Cucumber & Celery sticks with 2 tablespoons Hummus"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Grilled Lemon Herb Chicken Breast", "Huge mixed green salad (baby spinach, arugula, radish) in lemon-olive oil dressing"], portion: "150g chicken, large salad" },
          { title: "Evening Snack", time: "5:00 PM", items: ["1 hard-boiled egg with black pepper", "Hibiscus tea"], portion: "1 egg" },
          { title: "Dinner", time: "8:00 PM", items: ["Pan-seared Salmon or Seabass", "Steamed asparagus and garlic cauliflower mash"], portion: "150g fish, 1/2 cup veggies" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 Whole Eggs scrambled in grass-fed butter", "2 slices of toasted whole wheat sourdough", "Avocado mash"], portion: "Large plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Canned Sardines or Tuna salad with olive oil and greens", "Walnuts"], portion: "1 bowl" },
          { title: "Lunch", time: "1:30 PM", items: ["Baked Herb Chicken Thighs", "Cooked Quinoa", "Stir-fried broccoli and zucchini in sesame oil", "Dal soup"], portion: "200g chicken, 1 cup quinoa" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Egg bhurji (2 eggs) with bell peppers", "1 cup roasted almonds"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Lean Grilled Beef or Lamb chops", "Sweet potato mash (portion-controlled)", "Steamed spinach and asparagus"], portion: "180g steak, 1 cup mash" }
        ]
      }
    }
  },
  hypertension: {
    name: "Hypertension (High Blood Pressure) / DASH Diet",
    icon: "❤️",
    description: "Highly aligned with the DASH (Dietary Approaches to Stop Hypertension) diet, prioritizing magnesium, potassium, and calcium while restricting sodium.",
    subtypes: {
      primary: {
        name: "Primary (Essential) Hypertension",
        description: "Driven by genetics, lifestyle, aging, and diet. Prioritizes natural sodium reduction, potassium retention, and blood vessel elasticity.",
        avoid: [
          "Table salt, pickles, papads, soy sauce, and packaged ketchups",
          "Processed canned meats, hot dogs, and cured deli meats"
        ],
        superfoods: [
          "Beetroot juice (contains nitrates that naturally expand blood vessels)",
          "Bananas & Avocados (rich in potassium to balance sodium)"
        ]
      },
      secondary: {
        name: "Secondary (Organ-Driven) Hypertension",
        description: "Driven by an underlying medical issue (such as kidney disease or hormonal disorders). Focuses on kidney-friendly low-sodium support.",
        avoid: [
          "Excess potassium if kidney function is compromised (consult physician)",
          "Table salt, salted nuts, canned soups, and pre-packaged seasoning mixes"
        ],
        superfoods: [
          "Garlic (contains allicin, known to naturally reduce blood pressure)",
          "Pomegranate seeds (loaded with cardiovascular protective antioxidants)"
        ]
      }
    },
    avoid: [
      "Table salt, pickles, papads, soy sauce, and packaged ketchups",
      "Processed canned meats, hot dogs, and cured deli meats",
      "Packaged potato chips, salted biscuits, and frozen pre-made dinners",
      "Excessive caffeine and carbonated sodas"
    ],
    superfoods: [
      "Beetroot juice (contains nitrates that naturally expand blood vessels)",
      "Bananas & Avocados (rich in potassium to balance sodium)",
      "Garlic (contains allicin, known to reduce BP)",
      "Pomegranate seeds & Dark Chocolate (>75% cocoa)"
    ],
    guidelines: [
      "Limit sodium intake strictly to less than 1,500 mg per day.",
      "Season foods using herbs, garlic, lemon juice, cumin, and black pepper instead of extra salt.",
      "Consume at least 2 servings of potassium-rich foods daily."
    ],
    meals: {
      veg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["Ragi (finger millet) Porridge with skimmed milk", "1 chopped Banana", "Flaxseed topping"], portion: "Medium bowl" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup fresh Pomegranate arils", "Unsalted pumpkin seeds"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["1 cup boiled Chickpeas mixed with cucumbers, tomatoes, bell peppers", "1 cup low-salt vegetable soup"], portion: "Large bowl" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Roasted Makhana (lotus seeds) seasoned with turmeric & garlic powder (no salt)"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Steamed Tofu stir-fry with mushrooms, green beans, and carrots", "1 small cup boiled Brown Rice"], portion: "Medium bowl" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["Oatmeal with whole milk, almond butter, sliced banana, and chia seeds", "Unsalted mixed nuts"], portion: "Large bowl" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Sweet Lassi made with home-set low-fat curd", "1 Apple with unsalted peanut butter"], portion: "1 large glass" },
          { title: "Lunch", time: "1:30 PM", items: ["Paneer Tikka cooked in olive oil", "Double Bajra Rotis", "1 cup Masoor Dal", "Steamed spinach salad"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Banana milkshake with walnut halves", "Soaked chia seeds"], portion: "1 glass" },
          { title: "Dinner", time: "8:00 PM", items: ["Quinoa & Black bean loaded burrito bowl with homemade low-salt guacamole and fresh coriander"], portion: "Large bowl" }
        ]
      },
      nonveg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["Egg white scramble (3 eggs) with fresh spinach & tomatoes cooked in olive oil", "1 cup Beetroot juice"], portion: "1 plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup fresh Berries (strawberries/blueberries)"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Baked low-sodium Lemon Garlic Salmon", "Steamed broccoli", "Mixed green salad with a splash of apple cider vinegar"], portion: "150g salmon, 1 plate greens" },
          { title: "Evening Snack", time: "5:00 PM", items: ["1 cup low-fat Greek yogurt with walnuts"], portion: "1 cup" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled Chicken Breast seasoned with oregano & paprika", "Roasted sweet potato slices", "Steamed asparagus"], portion: "150g chicken, 1/2 cup sweet potato" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 Whole Eggs poached", "2 slices of avocado sourdough toast", "1 glass low-salt Beetroot smoothie"], portion: "1 plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Steamed Mackerel or Sardines", "Unsalted almonds"], portion: "1 bowl" },
          { title: "Lunch", time: "1:30 PM", items: ["Lean Sirloin Steak cooked in olive oil", "Steamed Sweet Potatoes", "Stir-fried spinach and mushrooms with garlic"], portion: "180g beef, 1 cup sweet potatoes" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Hard-boiled eggs (2 eggs)", "1 cup fresh orange juice (no added sugar)"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Oven-roasted Chicken Thighs", "Brown Rice", "Lentil soup with low sodium broth", "Steamed broccoli"], portion: "Large plate" }
        ]
      }
    }
  },
  pcos: {
    name: "PCOS / PCOD / Endocrine Harmony",
    icon: "🌸",
    description: "Anti-inflammatory, hormone-balancing meals focused on low-GI complex carbs, healthy fats, and high fiber to curb androgen production and cycle fluctuations.",
    subtypes: {
      insulin: {
        name: "Insulin-Resistant PCOS",
        description: "The most common phenotype (affecting ~70%), driven by high insulin levels which impair ovulation and trigger excess ovarian testosterone.",
        avoid: [
          "Refined white sugars, high-fructose corn syrup, white flours",
          "Cow's dairy (may contain insulin-like growth factors)"
        ],
        superfoods: [
          "Myo-inositol rich foods (citrus fruits, organic beans)",
          "Cinnamon (helps sensitize insulin receptors)"
        ]
      },
      inflammatory: {
        name: "Inflammatory PCOS",
        description: "Driven by chronic low-grade systemic inflammation, causing cycle irregularities, fatigue, gut distress, and elevated androgens.",
        avoid: [
          "Processed seed oils (canola, corn oil), gluten, and chemical food additives",
          "Deep-fried foods, high-mercury seafood, and hydrogenated fats"
        ],
        superfoods: [
          "Turmeric & Ginger (powerful anti-inflammatory agents)",
          "Wild salmon (rich in anti-inflammatory Omega-3 fatty acids)",
          "Green tea & Spearmint tea (contains powerful antioxidants)"
        ]
      },
      adrenal: {
        name: "Adrenal PCOS (Stress-Driven)",
        description: "Driven by an abnormal response to chronic stress, characterized by elevated DHEA-S (an adrenal androgen) rather than ovarian testosterone.",
        avoid: [
          "Excess caffeine, skipping meals, extreme high-intensity interval training (HIIT)",
          "Refined sugars and late-night digital screen usage"
        ],
        superfoods: [
          "Magnesium-rich foods (pumpkin seeds, almonds, dark chocolate)",
          "Soothing herbal teas (chamomile, spearmint to lower stress androgens)"
        ]
      },
      postpill: {
        name: "Post-Pill PCOS (Contraceptive Rebound)",
        description: "A temporary metabolic/androgen rebound surge that occurs after stopping oral contraceptive pills, which masked underlying conditions.",
        avoid: [
          "Hormone-disrupting plastics, excess soy protein isolates",
          "Processed processed snacks and seed oils"
        ],
        superfoods: [
          "Zinc-rich foods (pumpkin seeds, spinach, organic red lentils)",
          "Cruciferous vegetables (steamed/cooked) to aid hormone clearance"
        ]
      }
    },
    avoid: [
      "Refined sugar, corn syrup, white sugar, and commercial pastries",
      "Gluten-heavy processed items and standard dairy (if dairy-sensitive)",
      "Soy protein isolates and highly processed soy meats",
      "Trans fats and hydrogenated cooking oils (canola, corn oil)"
    ],
    superfoods: [
      "Spearmint Tea (helps lower free testosterone levels)",
      "Turmeric & Ginger (powerful anti-inflammatory agents)",
      "Pumpkin seeds (rich in zinc for cycle regulation)",
      "Inositol-rich foods like citrus fruits and beans"
    ],
    guidelines: [
      "Eat regular, balanced meals to prevent blood sugar drops that trigger cortisol spikes.",
      "Drink 2 cups of Spearmint Tea daily to reduce hirsutism symptoms.",
      "Focus on healthy fats (extra virgin olive oil, nuts, seeds, avocados) to support progesterone production."
    ],
    meals: {
      veg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["Chia Seed Pudding made with coconut milk and topped with blueberries and raw pumpkin seeds"], portion: "Medium jar" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup Spearmint Tea", "Handful of dry-roasted walnuts"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Chickpea and Quinoa salad with grated carrots, bell peppers, extra virgin olive oil, and lemon juice"], portion: "Large bowl" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Edamame (steamed green soybeans) with a pinch of sea salt"], portion: "1 cup" },
          { title: "Dinner", time: "8:00 PM", items: ["Tempeh stir-fry with broccoli, bok choy, and mushrooms in ginger-garlic sauce"], portion: "Medium bowl" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["Spelt or Oat pancakes topped with coconut yogurt, almond butter, flaxseeds, and raspberries"], portion: "3 small pancakes" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Hormone-balancing smoothie: almond milk, hemp seeds, spinach, avocado, berries, and Maca powder"], portion: "1 large glass" },
          { title: "Lunch", time: "1:30 PM", items: ["Paneer and vegetable skewers", "Quinoa pilaf", "Mixed dal cooked with turmeric and ghee", "Steamed greens"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Handful of pumpkin seeds & sunflower seeds", "1 cup Spearmint Tea"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Coconut Curry with chickpeas, sweet potatoes, and organic tofu", "Steamed cauliflower rice"], portion: "Large bowl" }
        ]
      },
      nonveg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 scrambled Egg whites + 1 whole egg", "Sautéed spinach with garlic", "Half an avocado"], portion: "1 plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup Spearmint Tea", "Celery sticks with almond butter"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Baked Cod or Halibut", "Massaged kale salad with cherry tomatoes, cucumbers, and hemp seeds in olive oil"], portion: "150g fish, large salad" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Turkey breast slices wrapped in romaine lettuce leaves with mustard"], portion: "3 wraps" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled wild Salmon", "Roasted Brussels sprouts and steamed broccoli drizzled with olive oil"], portion: "150g salmon, 1 bowl veggies" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 Whole Eggs fried in extra virgin olive oil", "Smoked salmon slices", "Avocado", "1 cup Spearmint Tea"], portion: "Large plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Tuna and avocado salad with pumpkin seeds"], portion: "1 bowl" },
          { title: "Lunch", time: "1:30 PM", items: ["Roasted Chicken Thighs", "Sweet potato mash with coconut oil", "Sautéed collard greens and mushrooms"], portion: "200g chicken, 1 cup sweet potato" },
          { title: "Evening Snack", time: "5:00 PM", items: ["2 hard-boiled eggs", "Walnuts"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Pan-seared Salmon", "Wild Rice", "Steamed asparagus and zucchini with garlic"], portion: "180g salmon, 1 cup wild rice" }
        ]
      }
    }
  },
  thyroid: {
    name: "Thyroid (Hypothyroidism) / Metabolic Support",
    icon: "🦋",
    description: "Nutritious support focusing on selenium, zinc, and tyrosine while monitoring goitrogens to optimize metabolic rate and endocrine production.",
    subtypes: {
      hypo: {
        name: "Hypothyroidism (Slow metabolism / Hashimoto's)",
        description: "Underactive thyroid function. Focuses on selenium, zinc, and tyrosine to optimize metabolic rate and endocrine production while limiting raw goitrogens.",
        avoid: [
          "Raw goitrogenic foods in large quantities (raw kale, cabbage, broccoli - cook them!)",
          "Gluten (highly linked to Hashimoto's autoimmune flare-ups)"
        ],
        superfoods: [
          "Brazil Nuts (richest source of Selenium - eat exactly 2 a day!)",
          "Seaweed / Kelp (moderate Iodine)"
        ]
      },
      hyper: {
        name: "Hyperthyroidism (Overactive / Graves')",
        description: "Overactive thyroid function. Focuses on anti-inflammatory nutrients, heart protection, and moderate calorie/protein support to maintain muscle mass.",
        avoid: [
          "High-iodine foods (iodized salt, kelp, seaweed, commercial cough syrups)",
          "Excess caffeine and pre-workout stims (worsens rapid heart rate)"
        ],
        superfoods: [
          "Cruciferous vegetables like broccoli, cabbage (help naturally reduce thyroid hormones)",
          "Turmeric & Ginger (anti-inflammatory support)"
        ]
      }
    },
    avoid: [
      "Raw goitrogenic foods in large quantities (raw kale, raw cabbage, raw broccoli, raw brussels sprouts - cook them instead!)",
      "Gluten (highly linked to Hashimotos flare-ups)",
      "Processed soy items (which can inhibit thyroid hormone absorption)",
      "Sugary energy drinks and extreme fasting routines"
    ],
    superfoods: [
      "Brazil Nuts (richest natural source of Selenium - eat exactly 2 a day!)",
      "Pumpkin seeds (high in Zinc)",
      "Seaweed / Kelp (moderate Iodine - consult doctor if autoimmune)",
      "Virgin Coconut Oil (contains medium-chain triglycerides for energy)"
    ],
    guidelines: [
      "Eat exactly 2 Brazil nuts per day to meet your total daily selenium requirement.",
      "Ensure all cruciferous vegetables (broccoli, cabbage, cauliflower) are thoroughly cooked or steamed, as heat inactivates goitrogens.",
      "Take your thyroid medication on an empty stomach at least 30-60 minutes before breakfast."
    ],
    meals: {
      veg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["Gluten-free Rolled Oats cooked with unsweetened almond milk", "Raw pumpkin seeds", "1/2 chopped apple", "1 Brazil Nut"], portion: "Medium bowl" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup unsalted Roasted Chickpeas", "1 cup warm Ginger-turmeric water"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Lentil soup (cooked yellow Dal) with a side of steamed (thoroughly cooked) carrots and French beans", "1 small gluten-free Amaranth Roti"], portion: "Large bowl" },
          { title: "Evening Snack", time: "5:00 PM", items: ["1 Apple", "Coconut water"], portion: "1 apple, 1 cup water" },
          { title: "Dinner", time: "8:00 PM", items: ["Stir-fried organic Tempeh with fully-cooked mushrooms, bell peppers, and zucchini", "1 Brazil Nut"], portion: "Medium bowl" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["Quinoa breakfast porridge made with coconut milk, almond butter, dates, flaxseeds", "2 Brazil Nuts"], portion: "Large bowl" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Coconut yogurt with mixed pumpkin and sunflower seeds", "1 Banana"], portion: "1 bowl" },
          { title: "Lunch", time: "1:30 PM", items: ["Thick paneer curry cooked in coconut oil", "Red rice (gluten-free)", "Cooked spinach and yellow lentils"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Avocado smoothie with pea protein, coconut cream", "Walnuts"], portion: "1 large glass" },
          { title: "Dinner", time: "8:00 PM", items: ["Khichdi made from brown rice and split mung dal (fully cooked)", "Roasted pumpkin cubes", "Sautéed mushrooms"], portion: "Large bowl" }
        ]
      },
      nonveg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 scrambled Egg whites cooked in coconut oil", "Sautéed mushrooms", "2 Brazil Nuts"], portion: "1 plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup fresh Pineapple chunks (contains bromelain for digestion)"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Pan-seared Salmon or Tuna", "Roasted beetroot and thoroughly cooked asparagus salad in olive oil"], portion: "150g fish, 1/2 cup veggies" },
          { title: "Evening Snack", time: "5:00 PM", items: ["1 hard-boiled egg with pepper", "Steamed carrots with hummus"], portion: "1 egg" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled Chicken breast", "Fully-steamed cauliflower mash with garlic and coconut oil"], portion: "150g chicken, 1 bowl mash" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 Whole Eggs cooked in ghee", "Sautéed chicken sausage slices", "2 Brazil Nuts", "1 cup thyroid support tea"], portion: "Large plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Baked Cod fillet with olive oil and pumpkin seeds"], portion: "1 plate" },
          { title: "Lunch", time: "1:30 PM", items: ["Pan-fried Salmon", "Cooked Wild Rice", "Steamed carrots, zucchini, and fully cooked green beans in coconut oil"], portion: "180g salmon, 1 cup wild rice" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Canned Tuna mixed with avocado", "Walnuts"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Oven-baked Chicken Drumsticks", "Sweet potato mash", "Sautéed mushrooms and thoroughly cooked spinach"], portion: "Large plate" }
        ]
      }
    }
  },
  ibs: {
    name: "IBS / Sensitive Gut / Low-FODMAP Diet",
    icon: "🥦",
    description: "Highly digestible, soothing meals designed to avoid fermentation in the gut, prevent bloating, and promote smooth colon transit.",
    subtypes: {
      ibsc: {
        name: "IBS-C (Constipation Predominant)",
        description: "Focuses on high soluble fiber, maximum hydration, and mild prokinetics to naturally stimulate bowel motility without bloating.",
        avoid: [
          "Excessive coarse insoluble fiber (raw wheat bran) which can irritate the gut",
          "Astringent foods like underripe bananas, heavy cheese, and highly processed flour"
        ],
        superfoods: [
          "Psyllium husk (soaked in a large glass of water)",
          "Stewed prunes and warm water first thing in the morning",
          "Chia seeds (rich in soluble fiber to form soft gel)"
        ]
      },
      ibsd: {
        name: "IBS-D (Diarrhea Predominant)",
        description: "Focuses on low-residue, soothing, binding foods to reduce bowel speed and calm an overactive colon.",
        avoid: [
          "Caffeine, alcohol, spicy chilis, and high-fat greasy meals",
          "High-magnesium laxative foods and artificial sweeteners (sorbitol, xylitol)"
        ],
        superfoods: [
          "Unripe bananas (highly binding, rich in resistant starch)",
          "Jasmine/white rice (highly digestible low-residue starch)",
          "Oatmeal cooked in water (soothing soluble fiber)"
        ]
      },
      ibsm: {
        name: "IBS-M (Mixed / Alternating)",
        description: "Focuses on adaptogenic gut nutrition, balancing dietary fiber and gut motility depending on current symptomatic phases.",
        avoid: [
          "Strict raw vegetables, large portion sizes, carbonated sodas",
          "Spicy, greasy foods and beans during flare-up phases"
        ],
        superfoods: [
          "Peppermint tea (natural smooth muscle relaxant)",
          "Ginger tea (regulates motility)",
          "Steamed carrots and soft zucchini"
        ]
      }
    },
    avoid: [
      "High-FODMAP veggies: onions, garlic, cauliflower, cabbage, brussels sprouts",
      "High-FODMAP fruits: apples, pears, mangoes, watermelons, cherries",
      "Legumes & lentils: kidney beans, black beans, lentils (unless sprouted/canned and washed thoroughly)",
      "Dairy milk, wheat, rye, barley, and artificial sweeteners (sorbitol, xylitol)"
    ],
    superfoods: [
      "Ginger (soothes gut muscles and prevents cramps)",
      "Peppermint Tea (natural antispasmodic)",
      "Stewed Papaya (contains papain enzyme, highly gut-friendly)",
      "Bone Broth (or warm miso broth for vegetarians - heals gut lining)"
    ],
    guidelines: [
      "Avoid eating large meals; consume smaller, frequent portions to reduce gut stretch.",
      "Sip warm Peppermint or Ginger tea after lunch and dinner to alleviate bloating.",
      "Keep a food diary to note any individual trigger foods that may cause sudden distress."
    ],
    meals: {
      veg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["Oats porridge made with lactose-free milk or water", "Topped with a few unripe banana slices & pumpkin seeds"], portion: "Medium bowl" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup fresh stewed Papaya", "1 cup Peppermint Tea"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Stir-fried Tofu with carrots and zucchini (cooked in garlic-infused olive oil - FODMAP safe!)", "1 cup boiled Quinoa"], portion: "Medium bowl" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Roasted pumpkin seeds", "1 cup warm Ginger water"], portion: "1 small bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Miso broth soup with soft tofu cubes, bok choy, and ginger slices", "1 small cup cooked jasmine rice"], portion: "Large bowl" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["Gluten-free pancakes with maple syrup (low FODMAP), almond butter, and strawberries", "Lactose-free yogurt"], portion: "Large plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Lactose-free banana shake with peanut butter", "1 cup Peppermint Tea"], portion: "1 large glass" },
          { title: "Lunch", time: "1:30 PM", items: ["Pan-seared Tempeh", "White Jasmine Rice", "Grated zucchini sautéed in herb olive oil", "Light vegetable broth"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Roasted macadamia nuts (highly gut safe)", "Sip of fresh coconut water"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Polenta (cornmeal porridge) topped with stir-fried bell peppers, carrots, and firm tofu cubes"], portion: "Large bowl" }
        ]
      },
      nonveg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 scrambled Egg whites cooked in olive oil", "Diced zucchini sautéed in herbs", "Peppermint Tea"], portion: "1 plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup stewed Papaya or fresh Cantaloupe segments"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Grilled Chicken Breast (seasoned with salt, rosemary, and olive oil - no garlic or onion!)", "Steamed carrots and baby spinach"], portion: "150g chicken, 1 plate veggies" },
          { title: "Evening Snack", time: "5:00 PM", items: ["1 cup warm chicken bone broth (onion-free)", "Ginger tea"], portion: "1 cup" },
          { title: "Dinner", time: "8:00 PM", items: ["Oven-baked Cod or Seabass", "Steamed zucchini cubes and roasted sweet potato (limit to 1/2 cup)"], portion: "150g fish, 1 bowl veggies" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 Whole Eggs scrambled", "2 slices of gluten-free sourdough toast", "Avocado (limit to 1/4 of a whole avocado)"], portion: "1 plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Grilled Salmon skewers", "Unsalted macadamia nuts"], portion: "1 plate" },
          { title: "Lunch", time: "1:30 PM", items: ["Roast Chicken legs (onion-free, garlic-free seasoning)", "White Jasmine Rice", "Steamed carrots and baby bok choy", "Warm chicken bone broth"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["2 hard-boiled eggs", "1 cup lactose-free yogurt with strawberries"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Pan-seared Lamb chops", "Boiled Quinoa", "Sautéed zucchini and yellow squash in olive oil"], portion: "Large plate" }
        ]
      }
    }
  },
  celiac: {
    name: "Celiac Disease / Gluten Intolerance",
    icon: "🌾",
    description: "100% strict gluten-free diet focusing on high-nutrient whole foods, targeting gut mucosal repair and optimizing digestion.",
    avoid: [
      "Wheat, maida, sooji (semolina), atta, rye, barley, and triticale",
      "Standard soy sauce, commercial salad dressings, and malt vinegar (often contain hidden gluten)",
      "Standard oats (unless explicitly certified Gluten-Free to avoid cross-contamination)",
      "Beer, lager, and processed malt beverages"
    ],
    superfoods: [
      "Quinoa & Amaranth (nutritious gluten-free pseudo-grains)",
      "Aloe Vera juice (promotes gut mucosal healing)",
      "Bone Broth / L-Glutamine rich foods",
      "Kefir / Probiotics (to reseed the damaged gut flora)"
    ],
    guidelines: [
      "Check every food label for 'Certified Gluten-Free' logo.",
      "Be highly mindful of cross-contamination in home kitchens, shared toasters, and restaurants.",
      "Focus on naturally gluten-free carbohydrates like potatoes, sweet potatoes, rice, amaranth, ragi, and quinoa."
    ],
    meals: {
      veg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["Ragi (finger millet) chilla with fresh coriander & tomatoes", "1 cup organic Mint tea"], portion: "2 chillas" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Soaked Almonds & Walnuts", "1 cup fresh Aloe Vera juice"], portion: "1 small handful" },
          { title: "Lunch", time: "1:30 PM", items: ["Cooked Quinoa bowl", "1 cup Moong Dal", "Sautéed spinach with cumin and garlic"], portion: "Large bowl" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Unsalted roasted pumpkin seeds", "Coconut water"], portion: "1 small bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Paneer and bell pepper stir-fry cooked in olive oil", "A side of mashed sweet potatoes"], portion: "Medium bowl" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["Buckwheat (Kuttu) pancakes served with maple syrup and sliced bananas", "Gluten-free Greek yogurt"], portion: "Large plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Peanut butter and banana smoothie with pea protein, chia seeds", "Walnuts"], portion: "1 large glass" },
          { title: "Lunch", time: "1:30 PM", items: ["Thick chickpea curry (Chole)", "Basmati Rice", "Roasted potatoes and cauliflower in turmeric"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Roasted Paneer cubes with bell peppers & chaat masala", "Mixed seeds"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Quinoa Khichdi loaded with edamame, paneer, and carrots", "1 cup lentil soup"], portion: "Large bowl" }
        ]
      },
      nonveg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 egg Omelet with tomatoes, onions, spinach", "1 roasted gluten-free potato hash hashbrown"], portion: "1 plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup Aloe Vera juice", "Carrot sticks with hummus"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Grilled Lemon Chicken", "Gluten-free Brown Rice", "Steamed asparagus and cucumber salad"], portion: "150g chicken, 1/2 cup rice" },
          { title: "Evening Snack", time: "5:00 PM", items: ["1 cup chicken bone broth", "1 hard-boiled egg"], portion: "1 egg, 1 cup broth" },
          { title: "Dinner", time: "8:00 PM", items: ["Pan-seared Salmon in garlic butter", "Roasted zucchini, squash, and sweet potato slices"], portion: "150g salmon, 1 cup veggies" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 eggs cooked in butter", "Smoked salmon slices", "Roasted sweet potato cubes", "Aloe Vera juice"], portion: "Large plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Tuna salad with gluten-free mayonnaise and celery", "Almonds"], portion: "1 bowl" },
          { title: "Lunch", time: "1:30 PM", items: ["Baked Chicken Legs", "Basmati Rice", "Thick Masoor Dal", "Sautéed cabbage and carrots"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Hard-boiled eggs (2 eggs)", "Roasted pumpkin seeds"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled Ribeye Steak", "Roasted sweet potatoes", "Steamed broccoli drizzled in olive oil"], portion: "180g beef, 1 large sweet potato" }
        ]
      }
    }
  },
  cholesterol: {
    name: "High Cholesterol / Cardiovascular Wellness",
    icon: "🥑",
    description: "Heart-healthy meals limiting saturated fats while focusing on soluble fiber, omega-3 fatty acids, and phytosterols to optimize lipid profiles.",
    avoid: [
      "Butter, lard, palm oil, and ghee in high quantities",
      "Red meats (fatty cuts of beef, pork, lamb) and processed cold cuts",
      "Ultra-processed bakery items containing hydrogenated trans fats",
      "Deep-fried fast foods and commercial mayonnaise"
    ],
    superfoods: [
      "Oats & Barley (contains beta-glucan soluble fiber that binds cholesterol)",
      "Extra Virgin Olive Oil (rich in monounsaturated heart-healthy fats)",
      "Garlic & Green Tea (helps improve HDL/LDL ratios)",
      "Walnuts & Chia seeds (rich in plant omega-3s)"
    ],
    guidelines: [
      "Switch from butter or refined cooking oils to high-quality Extra Virgin Olive Oil.",
      "Consume at least 30g of dietary fiber daily, focusing heavily on soluble fiber from beans, oats, and lentils.",
      "Increase physical activity; moderate steady-state cardio raises HDL (good) cholesterol."
    ],
    meals: {
      veg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["1 cup steel-cut Oatmeal made with water & splash of almond milk", "Topped with walnuts, chia seeds, and fresh berries"], portion: "Medium bowl" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup fresh Grapefruit segments", "1 cup Green Tea"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Steamed Lentil soup (Dal)", "1 small cup Brown Rice", "Huge salad with cucumbers, carrots, and raw spinach drizzled with olive oil"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Unsalted roasted almonds (limit to 10-12 pieces)", "Lemon water"], portion: "1 small handful" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled Tofu steaks marinated in garlic and olive oil", "Sautéed broccoli, zucchini, and mushrooms"], portion: "Medium bowl" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["Large bowl of oats porridge with soy milk, walnuts, pumpkin seeds, ground flaxseeds, and a banana"], portion: "Large bowl" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Avocado toast on multigrain bread", "1 glass almond milk", "Greek yogurt"], portion: "Large plate" },
          { title: "Lunch", time: "1:30 PM", items: ["Stir-fried Tofu & Edamame", "Boiled Quinoa", "Large bowl of mixed dal cooked in olive oil", "Sautéed spinach"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Hummus with celery and carrots", "A handful of mixed unsalted nuts"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Bean & Lentil stew with sweet potatoes, carrots, and spinach", "Stir-fried brown rice"], portion: "Large bowl" }
        ]
      },
      nonveg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 scrambled Egg whites cooked in olive oil", "1 slice of whole-wheat toast", "Avocado slices"], portion: "1 plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 cup fresh berries", "Green Tea"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Grilled Mackerel or Salmon (rich in Omega-3)", "Massaged Kale salad with lemon and olive oil", "Boiled Quinoa"], portion: "150g fish, 1/2 cup quinoa" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Edamame (steamed green soybeans) with a pinch of sea salt"], portion: "1 cup" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled Chicken Breast", "Steamed broccoli", "Roasted sweet potato slices (no butter)"], portion: "150g chicken, 1/2 cup veggies" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 Whole Eggs scrambled in olive oil (limit yolk to 1, rest egg whites if needed)", "Smoked salmon slices", "Avocado", "Whole wheat toast"], portion: "Large plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Tuna and white bean salad with olive oil and chopped parsley"], portion: "1 bowl" },
          { title: "Lunch", time: "1:30 PM", items: ["Baked Trout or Salmon", "Cooked Quinoa", "Stir-fried carrots, zucchini, and spinach in olive oil", "Lentil soup"], portion: "180g fish, 1 cup quinoa" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Walnuts & Almonds mix", "Green Tea"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled Skinless Chicken Thighs", "Sweet potato mash in olive oil", "Sautéed Brussels sprouts and mushrooms"], portion: "Large plate" }
        ]
      }
    }
  },
  obesity: {
    name: "Obesity / Fat Loss / Metabolic Optimization",
    icon: "🏋️",
    description: "Calorie-controlled, high-satiety volume meals focusing on dense lean proteins, high fiber, and thermal food effects to promote a healthy energy deficit.",
    avoid: [
      "Refined cooking oils, butter, margarine, and deep-fried dishes",
      "Packed snacks, bakery products, pastries, and processed sweets",
      "Liquid calories: canned fruit juices, sugar-laden coffees, sodas, and sweet tea",
      "High saturated fat dressings, fatty cuts of pork/lamb, and white rice in high quantities"
    ],
    superfoods: [
      "Apple Cider Vinegar (ACV) before complex meals to curb appetite",
      "Green Tea (boosts metabolic rate slightly through catechins)",
      "Konjac / Shirataki or low-calorie volume veggies (cucumber, celery)",
      "High protein foods (egg whites, paneer, tofu) which burn calories during digestion"
    ],
    guidelines: [
      "Drink a large glass of water 15 minutes before your main meals to increase fullness.",
      "Focus on the 'thermal effect of food' by ensuring every single meal has a solid, lean protein source.",
      "Fill half your lunch and dinner plates with low-calorie vegetables (lettuce, cucumber, bell peppers, broccoli)."
    ],
    meals: {
      veg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["Spiced Oats Omelet made with Oats powder, chickpea flour, spinach, tomatoes", "1 cup black coffee"], portion: "2 medium chillas" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 bowl sliced Cucumbers & Carrots with fresh lemon juice and black pepper"], portion: "1 large bowl" },
          { title: "Lunch", time: "1:30 PM", items: ["Sprout & Tofu salad with diced cucumbers, tomatoes, coriander", "1 cup vegetable broth", "1 small Multigrain Roti"], portion: "Large bowl" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Roasted Bengal Gram (Chana)", "1 cup Green Tea"], portion: "1 small cup" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled organic Tofu steaks", "Sautéed broccoli, green beans, and bell peppers (minimal oil spray)"], portion: "Medium bowl" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["Double Paneer-stuffed Rotis", "Greek Yogurt", "Almond butter and banana toast"], portion: "Large plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Spinach and avocado smoothie with plant protein, chia seeds"], portion: "1 large glass" },
          { title: "Lunch", time: "1:30 PM", items: ["Tofu stir-fry in olive oil", "Brown Rice", "1 cup thick black Dal", "Stir-fried green beans"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Roasted Paneer with bell peppers", "Mixed seeds"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Quinoa Khichdi with paneer, edamame, and broccoli", "Bean soup"], portion: "Large bowl" }
        ]
      },
      nonveg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 scrambled Egg whites cooked in olive oil spray", "Sautéed spinach with garlic", "1 slice sprouted wheat bread"], portion: "1 plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Celery sticks with 1 tablespoon peanut butter", "Green Tea"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Grilled Chicken breast", "Large garden salad (spinach, cucumber, bell peppers, lemon juice)"], portion: "180g chicken, large salad" },
          { title: "Evening Snack", time: "5:00 PM", items: ["1 hard-boiled egg with pepper", "Hot Lemon Water"], portion: "1 egg" },
          { title: "Dinner", time: "8:00 PM", items: ["Pan-seared white fish (Cod or Tilapia)", "Steamed asparagus and zucchini with garlic"], portion: "180g fish, 1 bowl veggies" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 Whole Eggs scrambled", "Smoked salmon slices", "Roasted sweet potato cubes"], portion: "Large plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Tuna and avocado salad with pumpkin seeds"], portion: "1 bowl" },
          { title: "Lunch", time: "1:30 PM", items: ["Roasted Chicken thighs", "Cooked Quinoa", "Stir-fried zucchini and broccoli"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["2 hard-boiled eggs", "Walnuts"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled lean Sirloin steak", "Roasted potatoes", "Steamed green beans and mushrooms"], portion: "Large plate" }
        ]
      }
    }
  },
  none: {
    name: "General Clean Health / Athletic Balance",
    icon: "⚡",
    description: "Balanced macronutrient distribution utilizing whole clean foods, optimized to promote metabolic flexibility, lean mass retention, and athletic endurance.",
    avoid: [
      "Ultra-processed packaged snacks and energy bars with high corn syrup",
      "Refined flours, table sugar, sodas, and excess alcohol",
      "Hydrogenated vegetable oils and trans fats",
      "Extreme nutritional imbalances (unless in custom coaching)"
    ],
    superfoods: [
      "Quinoa & Oats (optimal slow-burning carbohydrates)",
      "Eggs, paneer, chicken, tofu (essential muscle-building proteins)",
      "Mixed berries & Green vegetables (packed with antioxidants)",
      "Nuts & seeds (for clean hormone balance)"
    ],
    guidelines: [
      "Aim for a balance: 40% complex carbs, 30% lean protein, and 30% healthy fats.",
      "Stay hydrated: Drink at least 3-4 liters of pure water daily.",
      "Eat within a 10-12 hour window to allow your digestive tract a proper nightly resting period."
    ],
    meals: {
      veg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["Oats chilla with paneer crumbs & spinach", "1 cup almond milk"], portion: "2 chillas" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["1 Apple", "Handful of dry-roasted almonds"], portion: "1 apple, 10 almonds" },
          { title: "Lunch", time: "1:30 PM", items: ["Brown Lentils (Dal)", "1 small cup Brown Rice or 1 Roti", "Mixed cucumber-tomato salad"], portion: "Medium plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Roasted Makhana", "Green Tea"], portion: "1 cup" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled Tofu with broccoli, carrots, and sweet potatoes stir-fried in olive oil"], portion: "1 bowl" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["Oatmeal with whole milk, honey, sliced banana, and mixed pumpkin/sunflower seeds", "2 slices peanut butter toast"], portion: "Large bowl" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Protein shake (1 scoop) with almond milk and banana", "Walnuts"], portion: "1 large glass" },
          { title: "Lunch", time: "1:30 PM", items: ["Thick Paneer Tikka curry", "Double multigrain rotis", "Masoor Dal", "Sautéed greens"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Roasted Chickpeas", "Banana with peanut butter"], portion: "1 bowl" },
          { title: "Dinner", time: "8:00 PM", items: ["Quinoa pilaf with chickpeas, paneer, edamame, and broccoli", "Mixed bean soup"], portion: "Large bowl" }
        ]
      },
      nonveg: {
        loss: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 scrambled Egg whites + 1 whole egg", "Sautéed spinach", "1 slice whole wheat toast"], portion: "1 plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Greek yogurt with fresh berries"], portion: "1 cup" },
          { title: "Lunch", time: "1:30 PM", items: ["Grilled Chicken Breast", "Quinoa", "Steamed asparagus and cucumber salad"], portion: "150g chicken, 1/2 cup quinoa" },
          { title: "Evening Snack", time: "5:00 PM", items: ["1 hard-boiled egg", "Lemon water"], portion: "1 egg" },
          { title: "Dinner", time: "8:00 PM", items: ["Pan-seared Salmon or Seabass", "Steamed broccoli and sweet potato slices"], portion: "150g fish, 1/2 cup veggies" }
        ],
        gain: [
          { title: "Breakfast", time: "8:00 AM", items: ["3 Whole Eggs scrambled in grass-fed butter", "Smoked salmon slices", "Avocado", "Multigrain sourdough toast"], portion: "Large plate" },
          { title: "Mid-Morning", time: "11:00 AM", items: ["Whey protein shake with banana & oats blended", "Almonds"], portion: "1 large glass" },
          { title: "Lunch", time: "1:30 PM", items: ["Roasted Chicken breast", "Basmati Rice", "Moong Dal", "Sautéed zucchini and mushrooms"], portion: "Large plate" },
          { title: "Evening Snack", time: "5:00 PM", items: ["Hard-boiled eggs (2 eggs)", "Peanut butter banana toast"], portion: "1 plate" },
          { title: "Dinner", time: "8:00 PM", items: ["Grilled lean Beef or Salmon fillet", "Roasted potatoes", "Steamed asparagus and broccoli"], portion: "Large plate" }
        ]
      }
    }
  }
};

function ProfileContent() {
  const { data: session, update: updateSession, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const searchParams = useSearchParams();
  const isOnboarding = searchParams?.get("onboarding") === "true";

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [gender, setGender] = useState("");
  const [cycleLength, setCycleLength] = useState<number | string>(28);
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [activityLevel, setActivityLevel] = useState("MODERATELY_ACTIVE");
  const [dailyWaterGoal, setDailyWaterGoal] = useState<number | string>(2000);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState<number | string>(2000);

  // Diet customizer state
  const [dietPlanEnabled, setDietPlanEnabled] = useState(false);
  const [dietType, setDietType] = useState("NON_VEGETARIAN");
  const [isLactoseIntolerant, setIsLactoseIntolerant] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);

  // Medical Nutrition States
  const [hasMedicalHistory, setHasMedicalHistory] = useState(false);
  const [medicalCondition, setMedicalCondition] = useState("none");
  const [medicalSubtype, setMedicalSubtype] = useState("");
  const [dietGoal, setDietGoal] = useState("loss");
  const [copied, setCopied] = useState(false);

  // Unified Diet Planner States
  const [customDietNotes, setCustomDietNotes] = useState("");
  const [activeDietTab, setActiveDietTab] = useState<"clinical" | "indian" | "custom" | string>("indian");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchProfile = useCallback(async () => {
    if (!session?.appToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/me`, {
        headers: { Authorization: `Bearer ${(session as any).appToken}` },
      });
      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setName(u.name || "");
        setImage(u.image || "");
        setGender(u.gender || "");
        setCycleLength(u.cycleLength || 28);
        
        if (u.lastPeriodStart) {
          const d = new Date(u.lastPeriodStart);
          if (!isNaN(d.getTime())) {
            setLastPeriodStart(d.toISOString().split("T")[0]);
          }
        }
        
        setWeight(u.weight ? u.weight.toString() : "");
        setHeight(u.height ? u.height.toString() : "");
        setTargetWeight(u.targetWeight ? u.targetWeight.toString() : "");
        
        if (u.birthDate) {
          const d = new Date(u.birthDate);
          if (!isNaN(d.getTime())) {
            setBirthDate(d.toISOString().split("T")[0]);
          }
        }
        
        setActivityLevel(u.activityLevel || "MODERATELY_ACTIVE");
        setDailyWaterGoal(u.dailyWaterGoal || 2000);
        setDailyCalorieGoal(u.dailyCalorieGoal || 2000);
        setDietPlanEnabled(u.dietPlanEnabled || false);
        setDietType(u.dietType || "NON_VEGETARIAN");
        setIsLactoseIntolerant(u.isLactoseIntolerant || false);
        setIsGlutenFree(u.isGlutenFree || false);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile();
      // Load medical history from localStorage
      if (session?.user?.email) {
        const email = session.user.email;
        const savedHasMedical = localStorage.getItem(`has_medical_${email}`);
        const savedDisease = localStorage.getItem(`diet_disease_${email}`);
        const savedSubtype = localStorage.getItem(`diet_subtype_${email}`);
        const savedGoal = localStorage.getItem(`diet_goal_${email}`);
        const savedCustomNotes = localStorage.getItem(`custom_diet_notes_${email}`);

        if (savedHasMedical) setHasMedicalHistory(savedHasMedical === "true");
        if (savedDisease) {
          setMedicalCondition(savedDisease);
          if (savedSubtype) {
            setMedicalSubtype(savedSubtype);
          } else {
            const matchingConfig = NUTRITION_DATABASE[savedDisease];
            if (matchingConfig?.subtypes) {
              setMedicalSubtype(Object.keys(matchingConfig.subtypes)[0]);
            } else {
              setMedicalSubtype("");
            }
          }
        }
        if (savedGoal) setDietGoal(savedGoal);
        if (savedCustomNotes) setCustomDietNotes(savedCustomNotes);
      }
    }
  }, [status, fetchProfile, session]);

  // Set tab on initial load or toggle
  useEffect(() => {
    if (hasMedicalHistory) {
      setActiveDietTab("clinical");
    } else if (dietPlanEnabled) {
      setActiveDietTab("indian");
    } else {
      setActiveDietTab("custom");
    }
  }, [hasMedicalHistory, dietPlanEnabled]);

  const handleHasMedicalChange = (checked: boolean) => {
    setHasMedicalHistory(checked);
    if (session?.user?.email) {
      localStorage.setItem(`has_medical_${session.user.email}`, checked ? "true" : "false");
    }
  };

  const handleCustomDietNotesChange = (val: string) => {
    setCustomDietNotes(val);
    if (session?.user?.email) {
      localStorage.setItem(`custom_diet_notes_${session.user.email}`, val);
    }
  };

  const handleMedicalConditionChange = (disease: string) => {
    setMedicalCondition(disease);
    if (session?.user?.email) {
      localStorage.setItem(`diet_disease_${session.user.email}`, disease);
    }
    
    // Auto-default subtype if subtypes exist
    const matchingConfig = NUTRITION_DATABASE[disease];
    if (matchingConfig?.subtypes) {
      const defaultSubtype = Object.keys(matchingConfig.subtypes)[0];
      setMedicalSubtype(defaultSubtype);
      if (session?.user?.email) {
        localStorage.setItem(`diet_subtype_${session.user.email}`, defaultSubtype);
      }
    } else {
      setMedicalSubtype("");
      if (session?.user?.email) {
        localStorage.removeItem(`diet_subtype_${session.user.email}`);
      }
    }
  };

  const handleMedicalSubtypeChange = (subtype: string) => {
    setMedicalSubtype(subtype);
    if (session?.user?.email) {
      localStorage.setItem(`diet_subtype_${session.user.email}`, subtype);
    }
  };

  const handleDietGoalChange = (goal: string) => {
    setDietGoal(goal);
    if (session?.user?.email) {
      localStorage.setItem(`diet_goal_${session.user.email}`, goal);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.appToken) return;
    
    // Strict validations on fields and dates
    const parsedWeight = weight ? parseFloat(weight) : null;
    const parsedHeight = height ? parseFloat(height) : null;
    const parsedTargetWeight = targetWeight ? parseFloat(targetWeight) : null;
    const parsedCalorie = dailyCalorieGoal !== "" && dailyCalorieGoal !== null && dailyCalorieGoal !== undefined ? parseInt(dailyCalorieGoal.toString()) : null;
    const parsedWater = dailyWaterGoal !== "" && dailyWaterGoal !== null && dailyWaterGoal !== undefined ? parseInt(dailyWaterGoal.toString()) : null;
    const parsedCycle = cycleLength !== "" && cycleLength !== null && cycleLength !== undefined ? parseInt(cycleLength.toString()) : null;

    // Field presence and name checks
    if (!name || name.trim().length === 0) {
      return alert("❌ Display name is required and cannot be blank.");
    }

    // Comprehensive birthDate (DOB) validations (no future date)
    if (!birthDate) {
      return alert("❌ Birth date (DOB) is required.");
    }
    const parsedBirth = new Date(birthDate);
    if (isNaN(parsedBirth.getTime())) {
      return alert("❌ Please enter a valid birth date.");
    }
    if (parsedBirth > new Date()) {
      return alert("❌ Birth date cannot be in the future.");
    }
    if (parsedBirth < new Date("1900-01-01")) {
      return alert("❌ Birth date must be after January 1st, 1900.");
    }

    // Gender specific period date validation
    if (gender === "FEMALE" && lastPeriodStart) {
      const parsedPeriod = new Date(lastPeriodStart);
      if (isNaN(parsedPeriod.getTime())) {
        return alert("❌ Please enter a valid last period start date.");
      }
      if (parsedPeriod > new Date()) {
        return alert("❌ Last period start date cannot be in the future.");
      }
      const diffTime = Math.abs(new Date().getTime() - parsedPeriod.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 365) {
        return alert("❌ Last period start date cannot be more than 1 year ago.");
      }
    }

    // Strict numerical bounds validation
    if (parsedWeight !== null && (isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 500)) {
      return alert("❌ Please enter a valid weight between 20 kg and 500 kg.");
    }
    if (parsedHeight !== null && (isNaN(parsedHeight) || parsedHeight < 50 || parsedHeight > 300)) {
      return alert("❌ Please enter a valid height between 50 cm and 300 cm.");
    }
    if (parsedTargetWeight !== null && (isNaN(parsedTargetWeight) || parsedTargetWeight < 20 || parsedTargetWeight > 500)) {
      return alert("❌ Please enter a valid target weight between 20 kg and 500 kg.");
    }
    if (parsedCalorie !== null && (isNaN(parsedCalorie) || parsedCalorie < 500 || parsedCalorie > 10000)) {
      return alert("❌ Please enter a valid daily calorie goal between 500 kcal and 10,000 kcal.");
    }
    if (parsedWater !== null && (isNaN(parsedWater) || parsedWater < 500 || parsedWater > 10000)) {
      return alert("❌ Please enter a valid daily water goal between 500 ml and 10,000 ml.");
    }
    if (gender === "FEMALE" && parsedCycle !== null && (isNaN(parsedCycle) || parsedCycle < 10 || parsedCycle > 100)) {
      return alert("❌ Please enter a valid cycle length between 10 and 100 days.");
    }

    setSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).appToken}`,
        },
        body: JSON.stringify({
          name,
          gender: gender || null,
          cycleLength: gender === "FEMALE" ? parsedCycle : null,
          lastPeriodStart: gender === "FEMALE" ? (lastPeriodStart || null) : null,
          weight: parsedWeight,
          height: parsedHeight,
          targetWeight: parsedTargetWeight,
          birthDate: birthDate ? new Date(birthDate) : null,
          activityLevel,
          dailyWaterGoal: parsedWater,
          dailyCalorieGoal: parsedCalorie,
          dietPlanEnabled,
          dietType,
          isLactoseIntolerant,
          isGlutenFree,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }

      if (res.ok) {
        try {
          await updateSession();
        } catch (sessErr) {
          console.error("Session update error:", sessErr);
        }
        setToast("✨ Profile successfully synced!");
        
        // If they completed onboarding, take them straight to dashboard now!
        if (isOnboarding) {
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1500);
        } else {
          setTimeout(() => setToast(null), 3000);
        }
      } else {
        const errorData = await res.json();
        setToast(`❌ Failed: ${errorData.error || "Update rejected."}`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setToast("❌ Error saving profile details.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  // Target Weight Forecast logic
  const getWeightForecast = () => {
    const curW = parseFloat(weight);
    const tarW = parseFloat(targetWeight);
    if (!isNaN(curW) && !isNaN(tarW) && curW > 0 && tarW > 0) {
      const diff = Math.abs(curW - tarW);
      if (diff === 0) return null;
      const weeks = diff / 0.5; // safe 0.5 kg per week pace
      const days = Math.round(weeks * 7);
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      const dateString = targetDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return { weeks: weeks.toFixed(1), dateString, days, targetWeight: tarW };
    }
    return null;
  };

  const forecast = getWeightForecast();

  const handleDownloadReminder = () => {
    if (!forecast) return;
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + forecast.days);
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${yyyy}${mm}${dd}T090000`,
      `DTEND:${yyyy}${mm}${dd}T100000`,
      "SUMMARY:FitSaaS: Reach Weight Goal target!",
      `DESCRIPTION:Friendly reminder to reach your target weight of ${forecast.targetWeight} kg. Safe healthy pacing target completed!`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "fitsaas-weight-target.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Indian Protein meal generator
  const getIndianDietMeals = (type: string, lactose: boolean, gluten: boolean, calories: number) => {
    let breakfast = "";
    let lunch = "";
    let snack = "";
    let dinner = "";
    let proteinSource = "";

    if (type === "VEGAN") {
      proteinSource = "Tofu, Roasted Chana, Soya, Moong Sprouts";
      breakfast = `Moong Dal Chilla stuffed with high-protein crumbled Tofu ${gluten ? "(Gluten-Free)" : ""}, mixed salad & roasted almonds.`;
      lunch = `High-protein Chickpea (Chole) salad bowl with brown rice, sautéed spinach, and warm spiced Dal.`;
      snack = `Roasted Peanut Chaat with cucumber, tomatoes, lemon juice, organic soy milk or raw pumpkin seeds.`;
      dinner = `Vegan Tofu & Broccoli curry cooked in cold-pressed mustard oil, thick lentil soup (Masoor dal).`;
    } else if (type === "VEGETARIAN") {
      proteinSource = lactose ? "Tofu, Tempeh, Soya, Split Lentils" : "Paneer, Curd, Greek Yogurt, Whey Protein";
      breakfast = lactose 
        ? `High-protein Tofu Scramble with green chutney, almonds, and raw Moong sprouts.`
        : `Spiced Paneer Bhurji (120g) made in pure ghee, sautéed spinach, and 1 multigrain chila ${gluten ? "(Gluten-Free)" : "or toast"}.`;
      lunch = lactose
        ? `Soya chunks masala curry, yellow split dal tadka, brown rice, cucumber salad.`
        : `Dal Makhani with Paneer Tikka (150g), carrot cucumber raita, raw salad ${gluten ? "(Gluten-Free millet roti)" : "with 2 phulkas"}.`;
      snack = lactose
        ? `Roasted foxnuts (Makhana) with walnuts, water or almond milk.`
        : `Greek Yogurt (150g) or Whey protein shake, walnuts, blueberries & pumpkin seeds.`;
      dinner = lactose
        ? `Tempeh & vegetable stir-fry, high-protein horsegram dal, spinach salad.`
        : `Grilled Paneer Tikka skewers with bell peppers & onions, hot split red lentil soup, roasted broccoli.`;
    } else {
      // Non-Vegetarian
      proteinSource = lactose ? "Egg whites, Grilled Chicken, Fish, Yellow Dal" : "Egg whites, Chicken breast, Salmon, Curd";
      breakfast = `Egg white Bhurji (4 egg whites, 1 whole egg) with onion, tomato & coriander, toasted bread ${gluten ? "(Gluten-Free bread)" : ""}.`;
      lunch = `Tandoori Chicken Breast (150g), yellow tadka dal, organic brown rice, mixed green salad.`;
      snack = lactose
        ? `Roasted chana (chickpeas) with 1 boiled egg white and almonds.`
        : `Whey protein shake, handful of roasted foxnuts (Makhana), 1 whole boiled egg.`;
      dinner = `Baked Salmon or Indian Chicken Breast curry (180g), hot red lentil soup, raw cucumber strips.`;
    }

    const ratio = calories / 2000;
    const bKcal = Math.round(450 * ratio);
    const lKcal = Math.round(650 * ratio);
    const sKcal = Math.round(250 * ratio);
    const dKcal = Math.round(650 * ratio);

    return [
      { name: "🌅 Breakfast", desc: breakfast, kcal: bKcal },
      { name: "🍛 Lunch", desc: lunch, kcal: lKcal },
      { name: "🥜 High-Protein Snack", desc: snack, kcal: sKcal },
      { name: "🌌 Dinner", desc: dinner, kcal: dKcal },
      { name: "💪 Major Protein Sources", desc: proteinSource, kcal: null }
    ];
  };

  const parsedCalorieNum = typeof dailyCalorieGoal === "number" ? dailyCalorieGoal : (parseInt(dailyCalorieGoal) || 2000);
  const dietPlan = getIndianDietMeals(dietType, isLactoseIntolerant, isGlutenFree, parsedCalorieNum);

  // Medical Nutrition specific plan selectors
  const activeDiet = NUTRITION_DATABASE[medicalCondition] || NUTRITION_DATABASE.none;
  const activeSubtypeInfo = activeDiet.subtypes && medicalSubtype ? activeDiet.subtypes[medicalSubtype] : null;
  const displayDescription = activeSubtypeInfo?.description || activeDiet.description;
  const displayAvoid = activeSubtypeInfo?.avoid || activeDiet.avoid;
  const displaySuperfoods = activeSubtypeInfo?.superfoods || activeDiet.superfoods;
  const displayGuidelines = activeSubtypeInfo?.guidelines || activeDiet.guidelines;

  const mappedDietPref = dietType === "VEGETARIAN" || dietType === "VEGAN" ? "veg" : "nonveg";
  const medicalMeals = activeDiet.meals[mappedDietPref]?.[dietGoal] || activeDiet.meals.veg.loss;

  const handleCopyPlan = () => {
    const mealText = medicalMeals
      .map((m) => `[${m.time}] ${m.title} - ${m.items.join(", ")} (${m.portion})`)
      .join("\n");
    const fullText = `DIET PLAN: ${activeDiet.name}${activeSubtypeInfo ? ` (${activeSubtypeInfo.name})` : ""} (${mappedDietPref.toUpperCase()} - ${dietGoal.toUpperCase()})\n\nDescription:\n${displayDescription}\n\nDaily Schedule:\n${mealText}\n\nSuperfoods to Include:\n${displaySuperfoods.map((s) => `• ${s}`).join("\n")}\n\nFoods to Strictly Avoid:\n${displayAvoid.map((a) => `• ${a}`).join("\n")}\n\nDisclaimers: Consult your registered dietitian/physician before adopting any custom program.`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-card border border-brand-500/30 shadow-xl rounded-xl px-5 py-3 text-sm font-medium text-foreground animate-in fade-in slide-in-from-top-2 duration-300">
          {toast}
        </div>
      )}

      {/* Onboarding Welcome Panel */}
      {isOnboarding && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 text-emerald-500 dark:text-emerald-400 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <span className="text-xl">👋</span>
            <div className="space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wider">Welcome to FitSaaS! Let's calibrate your dashboard</h3>
              <p className="text-xs leading-relaxed text-emerald-600 dark:text-emerald-400/80">
                Please complete your personal characteristics below. We use these metrics to dynamically calibrate your daily calorie/water targets, target weight milestone forecasts, tailored Indian high-protein diets, and phase-specific cycle workouts. You can always update these details later!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="w-16 h-16 rounded-2xl border-2 border-emerald-400/20 object-cover shadow-md"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border-2 border-brand-500/20 flex items-center justify-center font-black text-2xl text-emerald-400">
              {name.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{name || "User Profile"}</h1>
            <p className="text-foreground/60 text-sm mt-1">{session?.user?.email}</p>
          </div>
        </div>
        {image && image.includes("googleusercontent.com") && (
          <div className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border px-3 text-xs font-semibold text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Google Connected
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Personal Characteristics */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-emerald-500 uppercase tracking-wider border-b border-border pb-3">Personal Metrics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Birth Date</label>
                <input
                  type="date"
                  value={birthDate}
                  max={todayStr}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) setHeight(val);
                  }}
                  placeholder="175"
                  min="0"
                  max="250"
                  step="1"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) setWeight(val);
                  }}
                  placeholder="72.5"
                  min="0"
                  max="300"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Gender Identification</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                required
              >
                <option value="" disabled className="bg-card">Select gender...</option>
                <option value="MALE" className="bg-card">Male</option>
                <option value="FEMALE" className="bg-card">Female</option>
                <option value="OTHER" className="bg-card">Other</option>
                <option value="PREFER_NOT_TO_SAY" className="bg-card">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Card 2: Fitness Goals & Guidelines */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-emerald-500 uppercase tracking-wider border-b border-border pb-3">Fitness & Lifestyle</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseFloat(val) >= 0) setTargetWeight(val);
                  }}
                  placeholder="68.0"
                  min="0"
                  max="300"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                >
                  <option value="SEDENTARY" className="bg-card">Sedentary (Little/no exercise)</option>
                  <option value="LIGHTLY_ACTIVE" className="bg-card">Light (1-3 days/wk)</option>
                  <option value="MODERATELY_ACTIVE" className="bg-card">Moderate (3-5 days/wk)</option>
                  <option value="VERY_ACTIVE" className="bg-card">Active (6-7 days/wk)</option>
                </select>
              </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Daily Calorie Target (kcal)</label>
                <input
                  type="number"
                  value={dailyCalorieGoal}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setDailyCalorieGoal("");
                    } else {
                      const parsed = parseInt(val);
                      if (!isNaN(parsed) && parsed >= 0) {
                        setDailyCalorieGoal(parsed);
                      }
                    }
                  }}
                  placeholder="2200"
                  min="0"
                  max="10000"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Daily Water Target (ml)</label>
                <input
                  type="number"
                  value={dailyWaterGoal}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setDailyWaterGoal("");
                    } else {
                      const parsed = parseInt(val);
                      if (!isNaN(parsed) && parsed >= 0) {
                        setDailyWaterGoal(parsed);
                      }
                    }
                  }}
                  placeholder="2500"
                  min="0"
                  max="20000"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>
            </div>

            {/* Diet customizer checkbox */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dietPlanEnabled"
                  checked={dietPlanEnabled}
                  onChange={(e) => setDietPlanEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-emerald-500 focus:ring-brand-500 bg-background"
                />
                <label htmlFor="dietPlanEnabled" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 cursor-pointer">
                  Enable Diet Customizer
                </label>
              </div>
              {dietPlanEnabled && (
                <select
                  value={dietType}
                  onChange={(e) => setDietType(e.target.value)}
                  className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              )}
            </div>

            {/* Medical history checkbox */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasMedicalHistory"
                  checked={hasMedicalHistory}
                  onChange={(e) => handleHasMedicalChange(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-emerald-500 focus:ring-brand-500 bg-background"
                />
                <label htmlFor="hasMedicalHistory" className="text-xs font-semibold uppercase tracking-wider text-foreground/80 cursor-pointer">
                  Medical History & Past Diseases
                </label>
              </div>
              {hasMedicalHistory && (
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 items-end sm:items-center max-w-[320px]">
                  <select
                    value={medicalCondition}
                    onChange={(e) => handleMedicalConditionChange(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer max-w-[180px] truncate"
                  >
                    {Object.entries(NUTRITION_DATABASE).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value.icon} {value.name}
                      </option>
                    ))}
                  </select>
                  {NUTRITION_DATABASE[medicalCondition]?.subtypes && (
                    <select
                      value={medicalSubtype}
                      onChange={(e) => handleMedicalSubtypeChange(e.target.value)}
                      className="h-9 px-3 rounded-lg border border-brand-500/20 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer max-w-[180px] truncate animate-in slide-in-from-top-1 duration-200"
                    >
                      {Object.entries(NUTRITION_DATABASE[medicalCondition].subtypes || {}).map(([key, value]) => (
                        <option key={key} value={key}>
                          📌 {value.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Weight Forecast Reminder Box */}
        {forecast && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <h3 className="text-base font-bold text-emerald-500 uppercase tracking-wider">Weight Target Forecast</h3>
              </div>
              <span className="text-xs font-bold bg-brand-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Safe 0.5 kg/week pace
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground leading-relaxed">
                  You are estimated to reach your target weight of <strong className="text-emerald-500">{forecast.targetWeight} kg</strong> in{" "}
                  <strong className="text-emerald-500">{forecast.weeks} weeks</strong>!
                </p>
                <p className="text-xs text-foreground/60">
                  Target milestone date: <strong className="text-foreground">{forecast.dateString}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadReminder}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] border border-border px-4 text-xs font-bold text-emerald-500 transition-colors"
              >
                📅 Add Calendar Reminder
              </button>
            </div>
          </div>
        )}

        {/* Unified Personalized Diet & Nutrition Planner Section */}
        {(dietPlanEnabled || hasMedicalHistory) && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6 animate-in slide-in-from-top-4 duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🍛</span>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-500">Unified Nutrition Dashboard</span>
                  <h2 className="text-xl font-bold text-foreground">Your Personalized Diet & Nutrition Plan</h2>
                </div>
              </div>
              
              {/* Tab Switchers */}
              <div className="flex bg-background/50 border border-border rounded-xl p-0.5 self-start sm:self-center">
                {hasMedicalHistory && (
                  <button
                    type="button"
                    onClick={() => setActiveDietTab("clinical")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeDietTab === "clinical"
                        ? "bg-brand-500 text-white shadow-sm font-extrabold"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    <span>🩺</span> Clinical Diet
                  </button>
                )}
                {dietPlanEnabled && (
                  <button
                    type="button"
                    onClick={() => setActiveDietTab("indian")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeDietTab === "indian"
                        ? "bg-brand-500 text-white shadow-sm font-extrabold"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    <span>🥗</span> Indian Protein Diet
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveDietTab("custom")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeDietTab === "custom"
                      ? "bg-brand-500 text-white shadow-sm font-extrabold"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <span>📝</span> Custom Diet
                </button>
              </div>
            </div>

            {/* TAB 1: Clinical Diet Plan */}
            {activeDietTab === "clinical" && hasMedicalHistory && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex shrink-0 items-center justify-center text-3xl shadow-sm text-emerald-500">
                    {activeDiet.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <span>Therapeutic Target:</span> {activeDiet.name}{activeSubtypeInfo ? ` (${activeSubtypeInfo.name})` : ""}
                    </h3>
                    <p className="text-xs text-foreground/60 mt-1 leading-relaxed">{displayDescription}</p>
                  </div>
                </div>

                {/* Daily Schedule Card */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:items-center">
                    <div>
                      <h3 className="text-sm font-bold">Daily Clinical Timetable</h3>
                      <p className="text-[11px] text-foreground/45">Custom calibrated for your target condition and calorie budget.</p>
                    </div>
                    
                    {/* Micro selectors: Goal & Copy Plan */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <div className="flex rounded-lg overflow-hidden border border-border p-0.5 bg-background">
                        {[
                          { id: "loss", label: "Loss 📉" },
                          { id: "gain", label: "Gain 📈" }
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => handleDietGoalChange(g.id)}
                            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors ${
                              dietGoal === g.id
                                ? "bg-brand-500 text-white"
                                : "text-foreground/60 hover:text-foreground"
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyPlan}
                        className="h-7 px-3 rounded-lg bg-foreground text-background text-[10px] font-bold flex items-center gap-1 hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0"
                      >
                        {copied ? "✅ COPIED!" : "📋 COPY PLAN"}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {medicalMeals.map((meal, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:items-center p-3.5 rounded-xl border border-border bg-background/30 hover:border-brand-500/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-semibold text-foreground/40 shrink-0 bg-foreground/5 h-7 px-2 rounded-lg flex items-center justify-center">
                            {meal.time}
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-foreground">{meal.title}</h4>
                            <p className="text-xs text-foreground/75 leading-relaxed mt-0.5">
                              {meal.items.join(" + ")}
                            </p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest bg-brand-500/10 text-brand-500 border border-brand-500/20 px-2 py-0.5 rounded-md">
                          {meal.portion}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Avoid & Include Foods Split Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Foods to strictly avoid */}
                  <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4 flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                      ❌ Foods to Strictly Avoid
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {displayAvoid.map((item, index) => (
                        <li key={index} className="text-xs text-foreground/75 pl-3.5 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-red-500/60 leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Superfoods to actively include */}
                  <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-4 flex flex-col gap-3">
                    <h3 className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                      🌿 Nutritional Superfoods
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {displaySuperfoods.map((item, index) => (
                        <li key={index} className="text-xs text-foreground/75 pl-3.5 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-500/60 leading-relaxed">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Condition Specific Guidelines Card */}
                <div className="border border-border rounded-xl p-4 flex flex-col gap-3 bg-background/25">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground/75">Key Lifestyle & Diet Guidelines</h3>
                  <ul className="flex flex-col gap-2.5">
                    {displayGuidelines.map((guide, index) => (
                      <li key={index} className="flex gap-2 items-start text-xs text-foreground/80 leading-relaxed">
                        <span className="w-4.5 h-4.5 shrink-0 bg-brand-500/10 text-brand-500 text-[9px] font-black rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <p>{guide}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 2: Indian High-Protein Diet Plan */}
            {activeDietTab === "indian" && dietPlanEnabled && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-emerald-500">Dietary Preferences & Sensitivity Filters</h4>
                    <p className="text-[10px] text-foreground/60 leading-relaxed">Customize your split plan for dynamic lactose or gluten requirements.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        id="lactoseToggle"
                        checked={isLactoseIntolerant}
                        onChange={(e) => setIsLactoseIntolerant(e.target.checked)}
                        className="h-3.5 w-3.5 rounded text-emerald-500 focus:ring-brand-500 bg-background"
                      />
                      <label htmlFor="lactoseToggle" className="text-[10px] font-black uppercase tracking-wider text-foreground/60 cursor-pointer">
                        Lactose-Free 🥛
                      </label>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        id="glutenToggle"
                        checked={isGlutenFree}
                        onChange={(e) => setIsGlutenFree(e.target.checked)}
                        className="h-3.5 w-3.5 rounded text-emerald-500 focus:ring-brand-500 bg-background"
                      />
                      <label htmlFor="glutenToggle" className="text-[10px] font-black uppercase tracking-wider text-foreground/60 cursor-pointer">
                        Gluten-Free 🌾
                      </label>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-foreground/60 leading-relaxed">
                  Based on your custom daily calorie budget of <strong className="text-foreground">{dailyCalorieGoal} kcal</strong>, 
                  here is your tailored High-Protein Indian Meal Plan recommendations:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  {dietPlan.map((d, i) => (
                    <div key={i} className="bg-background border border-border rounded-xl p-4 flex flex-col justify-between gap-2 hover:border-brand-500/20 transition-all">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-emerald-500 uppercase tracking-wider">{d.name}</span>
                          {d.kcal && (
                            <span className="text-[10px] font-bold bg-brand-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                              {d.kcal} kcal
                            </span>
                          )}
                        </div>
                        <p className="text-xs mt-2 leading-relaxed text-foreground/80">{d.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: My Custom Diet Plan */}
            {activeDietTab === "custom" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground">📝 Custom Meal Planner</h3>
                  <p className="text-xs text-foreground/60 leading-relaxed">
                    Have absolute freedom to create your custom daily meal routine, supplement schedule, or combine suggested recipes. Quick-tap emojis to insert them easily!
                  </p>
                </div>

                {/* Emojis list */}
                <div className="flex flex-wrap gap-1.5 border border-border rounded-xl p-3 bg-background/30">
                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/50 self-center mr-2">Quick Emojis:</span>
                  {[
                    { char: "🍳", label: "Eggs" },
                    { char: "🥗", label: "Salad" },
                    { char: "🥑", label: "Fats" },
                    { char: "🍗", label: "Chicken" },
                    { char: "🐟", label: "Fish" },
                    { char: "🥛", label: "Whey" },
                    { char: "🍵", label: "Green Tea" },
                    { char: "🌾", label: "Carbs" },
                    { char: "🍎", label: "Apple" },
                    { char: "🍌", label: "Banana" },
                    { char: "🥜", label: "Nuts" },
                    { char: "💧", label: "Water" },
                    { char: "💪", label: "Fitness" },
                    { char: "🩺", label: "Clinical" },
                    { char: "💊", label: "Vitamins" }
                  ].map((emoji) => (
                    <button
                      key={emoji.char}
                      type="button"
                      onClick={() => {
                        handleCustomDietNotesChange(customDietNotes + " " + emoji.char);
                      }}
                      className="h-8 px-2.5 rounded-lg bg-background hover:bg-foreground/5 border border-border text-xs flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                      title={emoji.label}
                    >
                      <span className="text-sm">{emoji.char}</span>
                      <span className="text-[9px] font-semibold opacity-60 uppercase">{emoji.label}</span>
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    value={customDietNotes}
                    onChange={(e) => handleCustomDietNotesChange(e.target.value)}
                    placeholder={`e.g. 🍳 Breakfast: 4 Egg Whites scrambled + 1 whole wheat toast\n🥛 10:00 AM: 1 scoop of Whey protein + soaked walnuts\n🥗 Lunch: Soya chunks curry (100g) + 1 brown rice bowl\n🍵 5:00 PM: Green tea with high-fiber digestive biscuits\n💪 Dinner: Grilled paneer steaks with sautéed broccoli...`}
                    rows={8}
                    className="w-full bg-background/30 border border-border rounded-xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all text-foreground placeholder:text-foreground/30 font-medium leading-relaxed"
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] font-semibold text-emerald-500 flex items-center gap-1 opacity-70">
                    <span>✨</span> Auto-saved to local storage
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Card 3: Women's Health (Conditional) */}
        {gender === "FEMALE" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="text-xl">🌸</span>
              <h2 className="text-base font-bold text-emerald-500 uppercase tracking-wider">Women's Health Integration</h2>
            </div>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Dynamically maps hormonal cycle changes to optimize workout suggestions on your primary command dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Average Cycle Length (Days)</label>
                <input
                  type="number"
                  value={cycleLength}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setCycleLength("");
                    } else {
                      const parsed = parseInt(val);
                      if (!isNaN(parsed) && parsed >= 0) {
                        setCycleLength(parsed);
                      }
                    }
                  }}
                  placeholder="28"
                  min="0"
                  max="45"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/60 mb-2">Last Period Start Date</label>
                <input
                  type="date"
                  value={lastPeriodStart}
                  max={todayStr}
                  onChange={(e) => setLastPeriodStart(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all placeholder:text-foreground/30"
                  required
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 flex items-center justify-center rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Syncing details..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}
