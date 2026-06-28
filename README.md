FridgeMate AI

A smart kitchen assistant that helps household managers organize refrigerator stocks, track food shelf-life, and suggest recipes to reduce food waste.

What it does

Webcam AI Food Scanner: Uses client-side computer vision (TensorFlow.js COCO-SSD) to scan and detect groceries using your device webcam, with simulated fallback presets.
Storage Inventory Tracking: Categorizes and logs foods with custom status badges ("Expired", "Expiring Soon", "Fresh") based on real-time date differences.
Intelligent Recipe Engine: Suggests custom meal recommendations matching the specific ingredients currently available in your fridge.
Smart Grocery Checklist: Automatically compiles shopping replenish lists for spoiled (wasted) or out-of-stock items, allowing one-click restock imports.
Food Waste Analytics: Computes household stats, financial savings, landfill CO2 equivalent reductions, and weekly bar charts.

Live link

[https://ayakovishy.github.io/fridgemate-ai/](https://ayakvishy98.github.io/fridgemate-AI/)

How to use it

1. Scan or Add Foods: Open the app and log items using either the AI Scanner (pointing your webcam at an item like an apple, banana, or cup) or type them manually in the **Quick Add** dashboard form.
2. Select & Match Recipes: Go to the AI Recipes tab, tick the ingredients you want to use up, and select one of the suggested dishes to view step-by-step instructions. Click “Cook Recipe” to prepare it and automatically deduct the ingredients from your fridge inventory.
3. Analyze & Shop: Check the “Waste Analytics” tab to review your environmental score, and check the “Shopping List” to restock any automatically replenished spoiled foods.

Known limitations

Object Catalog Coverage: The client-side AI scanner relies on the pre-trained COCO-SSD model, which primarily detects common items (apples, bananas, carrots, broccoli, bottles, cups) and might misclassify or miss complex processed ingredients.
Local Persistence: Data is stored using browser `localStorage`, meaning database inventories do not sync across different browsers or separate devices.

