// FridgeMate AI - Application Logic
const app = (() => {
  // --- STATE MANAGEMENT ---
  let state = {
    inventory: [],
    history: [],
    shoppingList: [],
    scannerPreset: 'dairy',
    selectedRecipe: null,
    selectAllIngredientsToggle: false,
    userName: 'Aya Kvishy'
  };

  // --- CONFIG / DATABASES ---
  const RECIPES_DB = [
    {
      id: 'rec-omelet',
      name: 'Classic Cheese Omelet',
      time: '10 mins',
      difficulty: 'Easy',
      category: 'Breakfast',
      ingredients: ['Eggs', 'Cheddar Cheese'],
      instructions: [
        'Whisk 2-3 eggs in a bowl with a pinch of salt and pepper.',
        'Melt half a tablespoon of butter in a non-stick skillet over medium-low heat.',
        'Pour in the eggs, swirling slightly to cover the surface. Let the edges set.',
        'Sprinkle grated cheddar cheese over one half of the omelet.',
        'Fold the omelet in half, slide onto a plate, and serve warm.'
      ]
    },
    {
      id: 'rec-shakshuka',
      name: 'Spicy Shakshuka',
      time: '25 mins',
      difficulty: 'Medium',
      category: 'Dinner',
      ingredients: ['Eggs', 'Tomatoes', 'Bell Peppers'],
      instructions: [
        'Heat olive oil in a pan and sauté diced bell peppers and onions until soft.',
        'Add minced garlic, cumin, paprika, and a pinch of cayenne pepper, then pour in crushed tomatoes.',
        'Simmer the tomato sauce for 10-15 minutes until it thickens.',
        'Make small wells in the sauce and crack eggs directly into them.',
        'Cover the pan and cook for 5-8 minutes until egg whites are set but yolks are runny.'
      ]
    },
    {
      id: 'rec-toast',
      name: 'Cheese & Tomato Toast',
      time: '5 mins',
      difficulty: 'Easy',
      category: 'Snacks',
      ingredients: ['Loaf Bread', 'Cheddar Cheese', 'Tomatoes'],
      instructions: [
        'Toast slices of bread until golden brown.',
        'Slice fresh tomatoes and arrange them evenly on top of the toast.',
        'Layer thick slices of cheddar cheese (or grated cheese) over the tomatoes.',
        'Place under the oven broiler for 2-3 minutes until the cheese is melted and bubbling.',
        'Garnish with black pepper or fresh herbs and serve hot.'
      ]
    },
    {
      id: 'rec-salad',
      name: 'Fresh Chicken Salad',
      time: '15 mins',
      difficulty: 'Easy',
      category: 'Lunch',
      ingredients: ['Chicken Breast', 'Lettuce', 'Tomatoes'],
      instructions: [
        'Grill or pan-fry chicken breast until fully cooked, then slice into thin strips.',
        'Wash and chop lettuce into bite-size pieces and dice the tomatoes.',
        'Toss lettuce and tomatoes in a large bowl with olive oil and a splash of lemon juice.',
        'Top the salad with warm chicken breast strips. Season with salt and pepper to serve.'
      ]
    },
    {
      id: 'rec-stirfry',
      name: 'Garlic Mushroom & Pepper Stir Fry',
      time: '15 mins',
      difficulty: 'Easy',
      category: 'Lunch',
      ingredients: ['Mushrooms', 'Bell Peppers'],
      instructions: [
        'Slice mushrooms and cut bell peppers into thin strips.',
        'Heat sesame oil or vegetable oil in a large skillet or wok over high heat.',
        'Toss in peppers and mushrooms, stir-frying rapidly for 5-7 minutes until tender-crisp.',
        'Add minced garlic and soy sauce. Toss for 1 more minute and serve over rice.'
      ]
    },
    {
      id: 'rec-yogurt',
      name: 'Yogurt Apple Parfait',
      time: '5 mins',
      difficulty: 'Easy',
      category: 'Breakfast',
      ingredients: ['Greek Yogurt', 'Red Apples'],
      instructions: [
        'Spoon Greek yogurt into a bowl or tall glass.',
        'Wash and dice red apples into small cubes.',
        'Add a layer of diced apples over the yogurt.',
        'Drizzle with honey, maple syrup, or sprinkle cinnamon on top for extra flavor.'
      ]
    }
  ];

  const SCANNER_PRESETS = {
    dairy: [
      { name: 'Egg Carton', qty: '12 pcs', category: 'Dairy', daysToExpiry: 10, bbox: [50, 40, 160, 90] },
      { name: 'Milk', qty: '1 Gallon', category: 'Dairy', daysToExpiry: 6, bbox: [250, 20, 100, 220] },
      { name: 'Cheddar Cheese', qty: '400g', category: 'Dairy', daysToExpiry: 14, bbox: [40, 180, 180, 100] },
      { name: 'Greek Yogurt', qty: '500g', category: 'Dairy', daysToExpiry: 5, bbox: [260, 260, 90, 80] }
    ],
    veggies: [
      { name: 'Tomatoes', qty: '5 pack', category: 'Vegetables', daysToExpiry: 4, bbox: [30, 50, 150, 100] },
      { name: 'Lettuce', qty: '1 head', category: 'Vegetables', daysToExpiry: 3, bbox: [220, 40, 140, 120] },
      { name: 'Bell Peppers', qty: '3 pcs', category: 'Vegetables', daysToExpiry: 7, bbox: [40, 200, 130, 90] },
      { name: 'Mushrooms', qty: '250g', category: 'Vegetables', daysToExpiry: 5, bbox: [240, 210, 100, 90] }
    ],
    mixed: [
      { name: 'Chicken Breast', qty: '600g', category: 'Meats', daysToExpiry: 2, bbox: [80, 60, 150, 90] },
      { name: 'Loaf Bread', qty: '500g', category: 'Grains', daysToExpiry: 5, bbox: [70, 190, 140, 100] },
      { name: 'Red Apples', qty: '4 pcs', category: 'Fruits', daysToExpiry: 12, bbox: [260, 120, 110, 110] }
    ]
  };

  // COCO-SSD Class mapping to Refrigerator Stocks
  const FOOD_CLASS_MAP = {
    'apple': { name: 'Fresh Apple', qty: '1 pc', category: 'Fruits', daysToExpiry: 12 },
    'banana': { name: 'Banana', qty: '1 bunch', category: 'Fruits', daysToExpiry: 5 },
    'orange': { name: 'Orange', qty: '3 pcs', category: 'Fruits', daysToExpiry: 10 },
    'broccoli': { name: 'Broccoli', qty: '1 head', category: 'Vegetables', daysToExpiry: 6 },
    'carrot': { name: 'Carrots', qty: '1 pack', category: 'Vegetables', daysToExpiry: 14 },
    'sandwich': { name: 'Sandwich', qty: '1 pc', category: 'Others', daysToExpiry: 2 },
    'cake': { name: 'Cake Slice', qty: '1 piece', category: 'Others', daysToExpiry: 3 },
    'donut': { name: 'Donut', qty: '2 pcs', category: 'Others', daysToExpiry: 2 },
    'pizza': { name: 'Pizza Slice', qty: '2 slices', category: 'Others', daysToExpiry: 2 },
    'hot dog': { name: 'Hot Dog', qty: '1 pc', category: 'Others', daysToExpiry: 3 },
    'bottle': { name: 'Milk Bottle', qty: '1 bottle', category: 'Dairy', daysToExpiry: 7 },
    'cup': { name: 'Yogurt Cup', qty: '1 cup', category: 'Dairy', daysToExpiry: 5 },
    'bowl': { name: 'Salad Bowl', qty: '1 bowl', category: 'Vegetables', daysToExpiry: 2 }
  };

  // --- WEBCAM & AI VARIABLES ---
  let webcamStream = null;
  let detectorModel = null;
  let isModelLoading = false;
  let detectionInterval = null;
  let latestDetections = [];
  let mockScannerItems = [];

  // --- INITIALIZE APP ---
  const init = () => {
    loadFromLocalStorage();
    setupNavigation();
    initDateInputs();
    renderAll();
  };

  // --- LOCALSTORAGE STORAGE SYNC ---
  const loadFromLocalStorage = () => {
    const localInv = localStorage.getItem('fridgemate_inventory');
    const localHist = localStorage.getItem('fridgemate_history');
    const localShop = localStorage.getItem('fridgemate_shopping');

    if (localInv) {
      state.inventory = JSON.parse(localInv);
    } else {
      // Seed default inventory items
      const today = new Date();
      state.inventory = [
        {
          id: 'seed-1',
          name: 'Milk',
          qty: '1 Carton',
          category: 'Dairy',
          addedDate: formatDate(offsetDate(today, -3)),
          expiryDate: formatDate(offsetDate(today, 1)) // Expiring soon
        },
        {
          id: 'seed-2',
          name: 'Egg Carton',
          qty: '12 pcs',
          category: 'Dairy',
          addedDate: formatDate(offsetDate(today, -2)),
          expiryDate: formatDate(offsetDate(today, 8)) // Fresh
        },
        {
          id: 'seed-3',
          name: 'Spinach',
          qty: '1 bag',
          category: 'Vegetables',
          addedDate: formatDate(offsetDate(today, -5)),
          expiryDate: formatDate(offsetDate(today, -1)) // Expired
        },
        {
          id: 'seed-4',
          name: 'Cheddar Cheese',
          qty: '400g',
          category: 'Dairy',
          addedDate: formatDate(offsetDate(today, -1)),
          expiryDate: formatDate(offsetDate(today, 12)) // Fresh
        }
      ];
      saveToLocalStorage('inventory');
    }

    if (localHist) {
      state.history = JSON.parse(localHist);
    } else {
      // Seed default statistics history
      const today = new Date();
      state.history = [];
      // 15 consumed, 4 wasted
      for (let i = 0; i < 15; i++) {
        state.history.push({ id: `seed-hc-${i}`, name: 'Mock Food', category: 'Dairy', action: 'consumed', date: formatDate(offsetDate(today, -i)) });
      }
      for (let i = 0; i < 4; i++) {
        state.history.push({ id: `seed-hw-${i}`, name: 'Spotted Veggies', category: 'Vegetables', action: 'wasted', date: formatDate(offsetDate(today, -i)) });
      }
      saveToLocalStorage('history');
    }

    if (localShop) {
      state.shoppingList = JSON.parse(localShop);
    } else {
      // Seed shopping items
      state.shoppingList = [
        { id: 'seed-s1', name: 'Spinach', qty: '1 bag', category: 'Vegetables', checked: false, autoAdded: true },
        { id: 'seed-s2', name: 'Bananas', qty: '1 bunch', category: 'Fruits', checked: false, autoAdded: false }
      ];
      saveToLocalStorage('shopping');
    }
  };

  const saveToLocalStorage = (key) => {
    if (key === 'inventory' || !key) localStorage.setItem('fridgemate_inventory', JSON.stringify(state.inventory));
    if (key === 'history' || !key) localStorage.setItem('fridgemate_history', JSON.stringify(state.history));
    if (key === 'shopping' || !key) localStorage.setItem('fridgemate_shopping', JSON.stringify(state.shoppingList));
  };

  // --- NAVIGATION MANAGER ---
  const setupNavigation = () => {
    document.querySelectorAll('.nav-tab').forEach(item => {
      item.addEventListener('click', () => {
        const viewId = item.getAttribute('data-view');
        switchView(viewId);
      });
    });
  };

  const switchView = (viewId) => {
    // If leaving camera view, stop webcam
    if (webcamStream) {
      stopLiveWebcam();
    }

    // Update active nav link
    document.querySelectorAll('.nav-tab').forEach(nav => nav.classList.remove('active'));
    const navItem = document.querySelector(`.nav-tab[data-view="${viewId}"]`);
    if (navItem) navItem.classList.add('active');

    // Update active view container
    document.querySelectorAll('.view-container').forEach(view => view.classList.remove('active'));
    const viewContainer = document.getElementById(`${viewId}-view`);
    if (viewContainer) viewContainer.classList.add('active');

    // Perform specific view setups
    if (viewId === 'recipes') {
      renderRecipeChecklist();
      generateRecipes();
    } else if (viewId === 'analytics') {
      renderAnalytics();
    } else if (viewId === 'dashboard') {
      renderDashboard();
    } else if (viewId === 'inventory') {
      renderInventory();
    } else if (viewId === 'shopping-list') {
      renderShoppingList();
    }
  };

  // --- HELPER DATES ---
  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const offsetDate = (date, days) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  const calculateDaysRemaining = (expiryStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationStatus = (daysRemaining) => {
    if (daysRemaining < 0) return { label: 'Expired', class: 'danger' };
    if (daysRemaining <= 2) return { label: 'Expiring Soon', class: 'warning' };
    return { label: 'Fresh', class: 'success' };
  };

  const initDateInputs = () => {
    const todayStr = formatDate(new Date());
    const expiryInput = document.getElementById('qa-expiry');
    if (expiryInput) {
      expiryInput.value = formatDate(offsetDate(new Date(), 7)); // default 1 week
      expiryInput.min = todayStr;
    }
  };

  // --- TOAST NOTIFICATIONS ---
  const showToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';
    if (type === 'danger') icon = 'fa-circle-exclamation';
    if (type === 'info') icon = 'fa-circle-info';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span style="font-weight:600; margin-left:0.25rem;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      setTimeout(() => toast.remove(), 200);
    }, 3500);
  };

  // --- INVENTORY LOGIC (CRUD) ---
  const addInventoryItem = (name, qty, category, expiryDate) => {
    const newItem = {
      id: 'inv-' + Date.now() + Math.random().toString(36).substr(2, 5),
      name,
      qty,
      category,
      addedDate: formatDate(new Date()),
      expiryDate
    };

    state.inventory.push(newItem);
    saveToLocalStorage('inventory');
    checkLowStockAutoAdd(newItem.name, newItem.category);
    showToast(`Added ${newItem.name} to fridge storage.`);
    renderAll();
  };

  const deleteInventoryItem = (id) => {
    const idx = state.inventory.findIndex(item => item.id === id);
    if (idx !== -1) {
      const name = state.inventory[idx].name;
      state.inventory.splice(idx, 1);
      saveToLocalStorage('inventory');
      showToast(`Removed ${name} from stock.`);
      renderAll();
    }
  };

  const markAsConsumed = (id) => {
    const item = state.inventory.find(i => i.id === id);
    if (item) {
      state.history.push({
        id: 'hist-' + Date.now(),
        name: item.name,
        category: item.category,
        action: 'consumed',
        date: formatDate(new Date())
      });
      saveToLocalStorage('history');
      deleteInventoryItem(id);
      showToast(`Logged: Consumed ${item.name}!`);
    }
  };

  const markAsWasted = (id) => {
    const item = state.inventory.find(i => i.id === id);
    if (item) {
      state.history.push({
        id: 'hist-' + Date.now(),
        name: item.name,
        category: item.category,
        action: 'wasted',
        date: formatDate(new Date())
      });
      saveToLocalStorage('history');

      // Auto add replenishment grocery
      triggerAutoShoppingReplenish(item.name, item.category);
      deleteInventoryItem(id);
      showToast(`Logged: Wasted ${item.name}. Added refilling alert.`, 'warning');
    }
  };

  // Forms
  const handleQuickAdd = (event) => {
    event.preventDefault();
    const name = document.getElementById('qa-name').value;
    const qty = document.getElementById('qa-qty').value;
    const category = document.getElementById('qa-category').value;
    const expiry = document.getElementById('qa-expiry').value;

    addInventoryItem(name, qty, category, expiry);
    
    document.getElementById('qa-name').value = '';
    document.getElementById('qa-qty').value = '';
    initDateInputs();
  };

  let currentInventoryFilter = 'all';
  let currentSearchQuery = '';

  const filterInventory = (filter, buttonEl) => {
    currentInventoryFilter = filter;
    if (buttonEl) {
      buttonEl.parentNode.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      buttonEl.classList.add('active');
    }
    renderInventory();
  };

  const handleSearch = (query) => {
    currentSearchQuery = query.toLowerCase();
    renderInventory();
  };

  // --- AUTO SHOPPING LIST TRIGGERS ---
  const triggerAutoShoppingReplenish = (name, category) => {
    const exists = state.shoppingList.some(item => item.name.toLowerCase() === name.toLowerCase() && !item.checked);
    if (!exists) {
      state.shoppingList.push({
        id: 'shop-auto-' + Date.now(),
        name,
        qty: '1 pack',
        category,
        checked: false,
        autoAdded: true
      });
      saveToLocalStorage('shopping');
      showToast(`Auto-added ${name} to grocery list.`, 'info');
    }
  };

  const checkLowStockAutoAdd = (name, category) => {
    const index = state.shoppingList.findIndex(item => item.name.toLowerCase() === name.toLowerCase() && !item.checked);
    if (index !== -1) {
      state.shoppingList[index].checked = true;
      saveToLocalStorage('shopping');
    }
  };

  // --- REAL AI CAMERA SCANNER LOGIC ---
  const startLiveWebcam = async () => {
    const placeholder = document.getElementById('camera-placeholder');
    const statusText = document.getElementById('camera-status-text');
    const subtext = document.getElementById('camera-subtext');
    const video = document.getElementById('webcam');
    const container = document.getElementById('camera-container');

    placeholder.style.display = 'flex';
    statusText.textContent = 'Loading Camera...';
    subtext.textContent = 'Requesting hardware video permissions';

    try {
      // 1. Get user media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: 640, height: 480 }
      });
      
      webcamStream = stream;
      video.srcObject = stream;
      
      // Load AI Model
      statusText.textContent = 'Initializing AI Brain...';
      subtext.textContent = 'Loading TensorFlow.js neural network (COCO-SSD)';

      if (!detectorModel) {
        isModelLoading = true;
        detectorModel = await cocoSsd.load();
        isModelLoading = false;
      }

      // Hide placeholder and reveal video stream
      placeholder.style.display = 'none';
      video.style.display = 'block';
      container.classList.add('scanning');

      // Show Capture button, hide Start button
      document.getElementById('btn-start-camera').style.display = 'none';
      document.getElementById('btn-capture-camera').style.display = 'inline-flex';
      document.getElementById('btn-stop-camera').style.display = 'inline-flex';

      // Start continuous detection frame loop
      runDetectionLoop();
      showToast('AI Camera scanner is live!', 'info');

    } catch (err) {
      console.error(err);
      placeholder.style.display = 'flex';
      statusText.textContent = 'Camera Blocked or Failed';
      subtext.textContent = 'Please check camera permissions, or use simulated presets below.';
      showToast('Could not load camera. Try using presets.', 'danger');
    }
  };

  const runDetectionLoop = () => {
    const video = document.getElementById('webcam');
    
    if (!webcamStream || !detectorModel) return;

    // Detection interval
    const detectFrame = async () => {
      if (!webcamStream) return;
      
      try {
        if (video.readyState === 4) { // HAVE_ENOUGH_DATA
          const predictions = await detectorModel.detect(video);
          
          // Filter classes that we want to track (food & utensils)
          latestDetections = predictions.filter(pred => 
            pred.score > 0.45 && 
            (FOOD_CLASS_MAP[pred.class] || pred.class === 'apple' || pred.class === 'banana' || pred.class === 'orange' || pred.class === 'broccoli' || pred.class === 'carrot' || pred.class === 'sandwich' || pred.class === 'bottle' || pred.class === 'cup' || pred.class === 'bowl')
          );

          drawBoundingBoxes(latestDetections);
        }
      } catch (e) {
        console.error('Detection frame error:', e);
      }

      if (webcamStream) {
        detectionInterval = requestAnimationFrame(detectFrame);
      }
    };

    detectionInterval = requestAnimationFrame(detectFrame);
  };

  const drawBoundingBoxes = (predictions) => {
    const canvas = document.getElementById('detection-canvas');
    const video = document.getElementById('webcam');
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    
    // Resize canvas mapping to video element display coordinates
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;
    
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (video.videoWidth === 0) return;

    // Bounding Box Scale multiplier
    const scaleX = displayWidth / video.videoWidth;
    const scaleY = displayHeight / video.videoHeight;

    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      
      const rx = x * scaleX;
      const ry = y * scaleY;
      const rw = width * scaleX;
      const rh = height * scaleY;

      // Draw border
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.strokeRect(rx, ry, rw, rh);

      // Draw tag container
      ctx.fillStyle = '#2563eb';
      ctx.font = 'bold 12px Inter, sans-serif';
      const label = `${prediction.class} (${Math.round(prediction.score * 100)}%)`;
      const textWidth = ctx.measureText(label).width;
      
      ctx.fillRect(rx - 1.5, ry - 20, textWidth + 10, 20);

      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(label, rx + 4, ry - 5);
    });
  };

  const stopLiveWebcam = () => {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('detection-canvas');
    const placeholder = document.getElementById('camera-placeholder');
    const container = document.getElementById('camera-container');

    // Stop streams
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      webcamStream = null;
    }

    if (detectionInterval) {
      cancelAnimationFrame(detectionInterval);
      detectionInterval = null;
    }

    // Clear Canvas
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Reset Elements
    video.srcObject = null;
    video.style.display = 'none';
    container.classList.remove('scanning');
    
    placeholder.style.display = 'flex';
    document.getElementById('camera-status-text').textContent = 'Webcam Not Active';
    document.getElementById('camera-subtext').textContent = 'Click "Start Live Camera" below to scan items for real.';

    document.getElementById('btn-start-camera').style.display = 'inline-flex';
    document.getElementById('btn-capture-camera').style.display = 'none';
    document.getElementById('btn-stop-camera').style.display = 'none';
  };

  const captureLiveDetections = () => {
    if (latestDetections.length === 0) {
      showToast('No items recognized in camera screen yet.', 'warning');
      return;
    }

    // Freeze webcam detections stream
    if (detectionInterval) {
      cancelAnimationFrame(detectionInterval);
      detectionInterval = null;
    }

    document.getElementById('btn-capture-camera').disabled = true;

    // Convert detections to Review database list
    mockScannerItems = latestDetections.map((pred, idx) => {
      const mapped = FOOD_CLASS_MAP[pred.class] || { 
        name: pred.class.charAt(0).toUpperCase() + pred.class.slice(1), 
        qty: '1 pc', 
        category: 'Others', 
        daysToExpiry: 5 
      };

      return {
        id: `scanned-${idx}-${Date.now()}`,
        name: mapped.name,
        qty: mapped.qty,
        category: mapped.category,
        daysToExpiry: mapped.daysToExpiry,
        expiryDate: formatDate(offsetDate(new Date(), mapped.daysToExpiry)),
        approved: true
      };
    });

    // Reveal Review Panel
    document.getElementById('scanner-status').style.display = 'none';
    document.getElementById('scanner-results-container').style.display = 'flex';
    
    renderScannerReview();
    showToast(`Captured ${mockScannerItems.length} items! Verify them below.`);
  };

  // Presets Fallback
  const triggerSimulatedPreset = (presetKey) => {
    stopLiveWebcam();
    const container = document.getElementById('camera-container');
    const canvas = document.getElementById('detection-canvas');

    container.classList.add('scanning');

    // Simulate scanning laser for 1 second
    const statusBox = document.getElementById('scanner-status');
    statusBox.innerHTML = `
      <i class="fa-solid fa-spinner fa-spin" style="font-size:2rem; color:var(--accent); margin-bottom:0.75rem;"></i>
      <p style="font-size:0.85rem; font-weight:600;">Running simulated AI scan...</p>
    `;

    setTimeout(() => {
      container.classList.remove('scanning');
      const items = SCANNER_PRESETS[presetKey];
      
      mockScannerItems = items.map((item, idx) => ({
        id: `preset-${idx}-${Date.now()}`,
        name: item.name,
        qty: item.qty,
        category: item.category,
        daysToExpiry: item.daysToExpiry,
        expiryDate: formatDate(offsetDate(new Date(), item.daysToExpiry)),
        approved: true
      }));

      // Draw bounding boxes on canvas for the preset
      const ctx = canvas.getContext('2d');
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      items.forEach(item => {
        const [x, y, w, h] = item.bbox;
        // scale box coordinates
        const scaleX = canvas.width / 400;
        const scaleY = canvas.height / 380;
        
        ctx.strokeStyle = '#10b981'; // Green for preset
        ctx.lineWidth = 3;
        ctx.strokeRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);
        
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillRect(x * scaleX - 1.5, y * scaleY - 18, 100, 18);
        
        ctx.fillStyle = '#fff';
        ctx.fillText(item.name, x * scaleX + 4, y * scaleY - 5);
      });

      // Show results sheet
      statusBox.style.display = 'none';
      document.getElementById('scanner-results-container').style.display = 'flex';
      
      renderScannerReview();
      showToast(`Preset loaded: detected ${mockScannerItems.length} products.`, 'info');
    }, 1200);
  };

  const toggleScannedItemApproval = (idx) => {
    if (mockScannerItems[idx]) {
      mockScannerItems[idx].approved = !mockScannerItems[idx].approved;
      renderScannerReview();
    }
  };

  const renderScannerReview = () => {
    const list = document.getElementById('detected-items-list');
    const countEl = document.getElementById('detected-count');
    
    const approvedCount = mockScannerItems.filter(i => i.approved).length;
    countEl.textContent = `${approvedCount} / ${mockScannerItems.length} Approved`;

    list.innerHTML = mockScannerItems.map((item, idx) => `
      <div class="detected-item-row" style="opacity: ${item.approved ? '1' : '0.55'};">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <input type="checkbox" ${item.approved ? 'checked' : ''} 
            class="shopping-item-checkbox" 
            onclick="app.toggleScannedItemApproval(${idx})">
          <div>
            <span style="font-weight:700; font-size:0.85rem; color:var(--primary);">${item.name}</span>
            <span class="badge badge-info" style="margin-left:0.35rem; font-size:0.6rem; padding:0.1rem 0.35rem;">
              ${item.qty}
            </span>
          </div>
        </div>
        <span class="exp-status ${item.daysToExpiry <= 3 ? 'warning' : 'safe'}" style="font-size:0.75rem;">
          ${item.daysToExpiry}d shelf-life
        </span>
      </div>
    `).join('');
  };

  const approveScannedItems = () => {
    const approved = mockScannerItems.filter(item => item.approved);
    if (approved.length === 0) {
      showToast('Please check at least one approved item.', 'warning');
      return;
    }

    approved.forEach(item => {
      const newItem = {
        id: 'inv-' + Date.now() + Math.random().toString(36).substr(2, 5),
        name: item.name,
        qty: item.qty,
        category: item.category,
        addedDate: formatDate(new Date()),
        expiryDate: item.expiryDate
      };
      state.inventory.push(newItem);
      checkLowStockAutoAdd(newItem.name, newItem.category);
    });

    saveToLocalStorage('inventory');
    showToast(`Stocked ${approved.length} items into the fridge!`);
    cancelScannerReview();
    switchView('inventory');
  };

  const cancelScannerReview = () => {
    mockScannerItems = [];
    latestDetections = [];
    document.getElementById('btn-capture-camera').disabled = false;

    // Clear Canvas
    const canvas = document.getElementById('detection-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    document.getElementById('scanner-status').style.display = 'flex';
    document.getElementById('scanner-status').innerHTML = `
      <i class="fa-solid fa-qrcode" style="font-size:2.5rem; margin-bottom:0.75rem; opacity:0.4;"></i>
      <p style="font-size:0.85rem;">Run the Live Camera scan or choose a simulated preset to detect items.</p>
    `;
    document.getElementById('scanner-results-container').style.display = 'none';

    // If stream is active, restart detection loop
    if (webcamStream && !detectionInterval) {
      runDetectionLoop();
    } else if (!webcamStream) {
      stopLiveWebcam();
    }
  };

  // --- AI RECIPE GENERATION ---
  const toggleSelectAllIngredients = () => {
    state.selectAllIngredientsToggle = !state.selectAllIngredientsToggle;
    
    const checklist = document.getElementById('recipe-ingredients-checklist');
    const checkboxes = checklist.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = state.selectAllIngredientsToggle;
      const card = cb.closest('.ingredient-label-item');
      if (card) {
        if (state.selectAllIngredientsToggle) card.classList.add('checked');
        else card.classList.remove('checked');
      }
    });

    generateRecipes();
  };

  const handleIngredientCheck = (checkboxEl) => {
    const card = checkboxEl.closest('.ingredient-label-item');
    if (card) {
      if (checkboxEl.checked) card.classList.add('checked');
      else card.classList.remove('checked');
    }
    generateRecipes();
  };

  const getSelectedIngredientsList = () => {
    const selected = [];
    const checklist = document.getElementById('recipe-ingredients-checklist');
    if (checklist) {
      checklist.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
        selected.push(cb.value.toLowerCase());
      });
    }
    return selected;
  };

  const generateRecipes = () => {
    const selected = getSelectedIngredientsList();
    const recipesGrid = document.getElementById('recipes-grid');
    const emptyState = document.getElementById('recipes-empty');
    const summaryText = document.getElementById('recipe-match-summary');

    if (!recipesGrid) return;

    if (state.inventory.length === 0) {
      recipesGrid.innerHTML = '';
      emptyState.style.display = 'flex';
      emptyState.querySelector('p').textContent = 'Stock your fridge to discover matching recipes.';
      summaryText.textContent = '0 matches';
      return;
    }

    const scoredRecipes = RECIPES_DB.map(recipe => {
      const matchingFromSelected = recipe.ingredients.filter(ing => 
        selected.includes(ing.toLowerCase())
      );
      
      const fridgeNames = state.inventory.map(i => i.name.toLowerCase());
      const matchingInFridge = recipe.ingredients.filter(ing => 
        fridgeNames.some(name => name.includes(ing.toLowerCase()) || ing.toLowerCase().includes(name))
      );

      const matchPercent = Math.round((matchingInFridge.length / recipe.ingredients.length) * 100);

      return {
        ...recipe,
        matchingFromSelected,
        matchingInFridge,
        matchPercent
      };
    }).sort((a, b) => b.matchPercent - a.matchPercent);

    // Filter recipes
    const filtered = scoredRecipes.filter(r => {
      if (selected.length > 0) return r.matchingFromSelected.length > 0;
      return r.matchPercent > 0;
    });

    if (filtered.length === 0) {
      recipesGrid.innerHTML = '';
      emptyState.style.display = 'flex';
      emptyState.querySelector('p').textContent = selected.length > 0 
        ? 'No recipes match selected foods. Select others!'
        : 'No matching recipes found. Add Eggs, Milk, Bread, Cheese or Tomatoes to Fridge.';
      summaryText.textContent = '0 matches';
      return;
    }

    emptyState.style.display = 'none';
    summaryText.textContent = `Found ${filtered.length} recipe suggestions`;

    recipesGrid.innerHTML = filtered.map(recipe => {
      let icon = 'fa-egg';
      if (recipe.category === 'Breakfast') icon = 'fa-egg';
      if (recipe.category === 'Lunch') icon = 'fa-burger';
      if (recipe.category === 'Dinner') icon = 'fa-plate-wheat';
      if (recipe.category === 'Snacks') icon = 'fa-cookie-bite';

      return `
        <div class="recipe-card" onclick="app.openRecipeModal('${recipe.id}')">
          <div class="recipe-card-header">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div class="recipe-card-body">
            <span class="badge badge-success recipe-match">${recipe.matchPercent}% Owned</span>
            <h4 style="margin-top:0.25rem; font-size:0.95rem; line-height:1.3;">${recipe.name}</h4>
            
            <div class="recipe-meta-row">
              <span><i class="fa-solid fa-clock"></i> ${recipe.time}</span>
              <span><i class="fa-solid fa-gauge"></i> ${recipe.difficulty}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  };

  const openRecipeModal = (recipeId) => {
    const recipe = RECIPES_DB.find(r => r.id === recipeId);
    if (!recipe) return;

    state.selectedRecipe = recipe;

    document.getElementById('modal-recipe-name').textContent = recipe.name;
    document.getElementById('modal-recipe-time').textContent = recipe.time;
    document.getElementById('modal-recipe-difficulty').textContent = recipe.difficulty;
    document.getElementById('modal-recipe-category').textContent = recipe.category;

    const fridgeNames = state.inventory.map(i => i.name.toLowerCase());
    const matching = recipe.ingredients.filter(ing => 
      fridgeNames.some(name => name.includes(ing.toLowerCase()) || ing.toLowerCase().includes(name))
    );
    const matchPercent = Math.round((matching.length / recipe.ingredients.length) * 100);
    const badge = document.getElementById('modal-recipe-match');
    badge.textContent = `${matchPercent}% Owned`;
    badge.className = `badge ${matchPercent === 100 ? 'badge-success' : matchPercent >= 50 ? 'badge-warning' : 'badge-danger'}`;

    // Ingredients
    const ingList = document.getElementById('modal-recipe-ingredients');
    ingList.innerHTML = recipe.ingredients.map(ing => {
      const hasIng = state.inventory.some(i => i.name.toLowerCase().includes(ing.toLowerCase()) || ing.toLowerCase().includes(i.name.toLowerCase()));
      return `
        <li style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem; font-size:0.85rem; color: ${hasIng ? 'var(--primary)' : 'var(--secondary)'};">
          <span><i class="fa-solid ${hasIng ? 'fa-circle-check' : 'fa-circle-question'}" style="color: ${hasIng ? 'var(--success)' : 'var(--muted)'}; margin-right:0.4rem;"></i> ${ing}</span>
          <span style="font-weight:600; font-size:0.75rem; color: ${hasIng ? 'var(--success)' : 'var(--danger)'};">
            ${hasIng ? 'In Fridge' : 'Missing'}
          </span>
        </li>
      `;
    }).join('');

    // Instructions
    const instList = document.getElementById('modal-recipe-instructions');
    instList.innerHTML = recipe.instructions.map(inst => `<li>${inst}</li>`).join('');

    // Cook button
    const cookBtn = document.getElementById('modal-btn-cook');
    if (matchPercent < 100) {
      cookBtn.classList.remove('btn-primary');
      cookBtn.classList.add('btn-secondary');
      cookBtn.disabled = true;
      cookBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Missing Ingredients`;
    } else {
      cookBtn.classList.remove('btn-secondary');
      cookBtn.classList.add('btn-primary');
      cookBtn.disabled = false;
      cookBtn.innerHTML = `<i class="fa-solid fa-fire-burner"></i> Cook Recipe`;
    }

    document.getElementById('recipe-modal').style.display = 'flex';
  };

  const closeRecipeModal = () => {
    document.getElementById('recipe-modal').style.display = 'none';
    state.selectedRecipe = null;
  };

  const cookRecipe = () => {
    if (!state.selectedRecipe) return;

    const recipe = state.selectedRecipe;
    
    recipe.ingredients.forEach(ingName => {
      const idx = state.inventory.findIndex(item => 
        item.name.toLowerCase().includes(ingName.toLowerCase()) || ingName.toLowerCase().includes(item.name.toLowerCase())
      );
      if (idx !== -1) {
        const item = state.inventory[idx];
        state.history.push({
          id: 'hist-' + Date.now() + Math.random().toString(36).substr(2, 5),
          name: item.name,
          category: item.category,
          action: 'consumed',
          date: formatDate(new Date())
        });
        state.inventory.splice(idx, 1);
      }
    });

    saveToLocalStorage('inventory');
    saveToLocalStorage('history');

    showToast(`Cooked "${recipe.name}". Deducted ingredients.`);
    closeRecipeModal();
    renderAll();
    switchView('dashboard');
  };

  // --- SMART SHOPPING LIST LOGIC ---
  const addShoppingItem = (name, qty, category) => {
    const newItem = {
      id: 'shop-' + Date.now(),
      name,
      qty,
      category,
      checked: false,
      autoAdded: false
    };
    state.shoppingList.push(newItem);
    saveToLocalStorage('shopping');
    showToast(`Added ${name} to shopping list.`);
    renderShoppingList();
  };

  const toggleShoppingChecked = (id) => {
    const item = state.shoppingList.find(i => i.id === id);
    if (item) {
      item.checked = !item.checked;
      saveToLocalStorage('shopping');
      renderShoppingList();
    }
  };

  const deleteShoppingItem = (id) => {
    const idx = state.shoppingList.findIndex(item => item.id === id);
    if (idx !== -1) {
      state.shoppingList.splice(idx, 1);
      saveToLocalStorage('shopping');
      renderShoppingList();
    }
  };

  const clearBoughtShoppingItems = () => {
    state.shoppingList = state.shoppingList.filter(item => !item.checked);
    saveToLocalStorage('shopping');
    showToast('Cleared purchased list.');
    renderShoppingList();
  };

  const buySelectedShoppingItems = () => {
    const checkedItems = state.shoppingList.filter(item => item.checked);
    if (checkedItems.length === 0) {
      showToast('Tick items you want to buy.', 'warning');
      return;
    }

    checkedItems.forEach(item => {
      const newItem = {
        id: 'inv-' + Date.now() + Math.random().toString(36).substr(2, 5),
        name: item.name,
        qty: item.qty,
        category: item.category,
        addedDate: formatDate(new Date()),
        expiryDate: formatDate(offsetDate(new Date(), 7))
      };
      state.inventory.push(newItem);
    });

    state.shoppingList = state.shoppingList.filter(item => !item.checked);

    saveToLocalStorage('inventory');
    saveToLocalStorage('shopping');

    showToast(`Moved ${checkedItems.length} purchased items into your Fridge!`);
    renderAll();
    switchView('inventory');
  };

  const handleShoppingAdd = (event) => {
    event.preventDefault();
    const name = document.getElementById('shop-name').value;
    const qty = document.getElementById('shop-qty').value;
    const category = document.getElementById('shop-category').value;

    addShoppingItem(name, qty, category);
    
    document.getElementById('shop-name').value = '';
    document.getElementById('shop-qty').value = '';
  };

  // --- RENDERING ---
  const renderAll = () => {
    renderDashboard();
    renderInventory();
    renderShoppingList();
  };

  // 1. Dashboard
  const renderDashboard = () => {
    document.getElementById('dash-total-items').textContent = state.inventory.length;

    let expiringCount = 0;
    const alertList = [];
    const today = new Date();

    state.inventory.forEach(item => {
      const days = calculateDaysRemaining(item.expiryDate);
      if (days < 0) {
        expiringCount++;
        alertList.push({ ...item, days, level: 'danger', text: 'Expired' });
      } else if (days <= 2) {
        expiringCount++;
        alertList.push({ ...item, days, level: 'warning', text: `Expires in ${days}d` });
      }
    });

    document.getElementById('dash-expiring-items').textContent = expiringCount;

    const uncheckedShopping = state.shoppingList.filter(i => !i.checked).length;
    document.getElementById('dash-shopping-items').textContent = uncheckedShopping;

    // Warnings banner
    const bannerContainer = document.getElementById('expiration-banner-container');
    if (alertList.length > 0) {
      alertList.sort((a, b) => a.days - b.days);
      const first = alertList[0];
      bannerContainer.innerHTML = `
        <div class="alert-banner" style="background-color: ${first.level === 'danger' ? 'var(--danger-light)' : 'var(--warning-light)'}; border-color: ${first.level === 'danger' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}; color: ${first.level === 'danger' ? '#b91c1c' : '#b45309'}">
          <span class="alert-message">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <strong>${alertList.length} warning alert${alertList.length > 1 ? 's' : ''}:</strong> 
            "${first.name}" is ${first.level === 'danger' ? 'expired' : `spoil-warning (${first.text})`}.
          </span>
          <button class="btn btn-secondary btn-sm" onclick="app.switchView('inventory')">Check Fridge</button>
        </div>
      `;
    } else {
      bannerContainer.innerHTML = '';
    }

    // Recent Additions table
    const recentTable = document.getElementById('dashboard-recent-table');
    const sorted = [...state.inventory].sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate)).slice(0, 3);
    
    if (sorted.length === 0) {
      recentTable.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center; color:var(--secondary); padding:2rem 1rem;">
            No items in fridge. Log food items to view.
          </td>
        </tr>
      `;
    } else {
      recentTable.innerHTML = sorted.map(item => {
        const days = calculateDaysRemaining(item.expiryDate);
        const status = getExpirationStatus(days);
        return `
          <tr>
            <td data-label="Food Item" style="font-weight:600; color:var(--primary);">${item.name}</td>
            <td data-label="Category">${item.category}</td>
            <td data-label="Quantity"><span class="badge badge-info">${item.qty}</span></td>
            <td data-label="Status"><span class="badge badge-${status.class}">${status.label}</span></td>
            <td style="text-align: right;">
              <div style="display:inline-flex; gap:0.4rem;">
                <button class="btn btn-success btn-icon btn-sm" onclick="app.markAsConsumed('${item.id}')" title="Consume">
                  <i class="fa-solid fa-check"></i>
                </button>
                <button class="btn btn-danger btn-icon btn-sm" onclick="app.markAsWasted('${item.id}')" title="Discard">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // Est Savings
    const consumedCount = state.history.filter(i => i.action === 'consumed').length;
    const estSavings = consumedCount * 4.0;
    document.getElementById('dash-money-saved').textContent = `$${estSavings.toFixed(2)}`;

    // Donut Waste Score
    const wastedCount = state.history.filter(i => i.action === 'wasted').length;
    const totalHistory = consumedCount + wastedCount;
    let foodSavedPct = 100;
    if (totalHistory > 0) {
      foodSavedPct = Math.round((consumedCount / totalHistory) * 100);
    }
    
    document.getElementById('dash-waste-score').textContent = `${foodSavedPct}%`;
    const circle = document.getElementById('dash-radial-ring');
    if (circle) {
      const circum = 2 * Math.PI * 65; // 408.4
      const offset = circum - (foodSavedPct / 100) * circum;
      circle.style.strokeDashoffset = offset;
    }

    // Suggestions Refill
    const shopListSummary = document.getElementById('dashboard-shopping-list');
    const uncheckedList = state.shoppingList.filter(i => !i.checked).slice(0, 3);
    if (uncheckedList.length === 0) {
      shopListSummary.innerHTML = `
        <p style="text-align:center; font-size:0.8rem; color:var(--secondary); padding:0.5rem 0;">
          All grocery stocks fully managed!
        </p>
      `;
    } else {
      shopListSummary.innerHTML = uncheckedList.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0.4rem 0.5rem; background:var(--bg-primary); border-radius:4px; border:1px solid var(--border);">
          <span style="font-size:0.8rem; font-weight:600;">${item.name}</span>
          <span class="badge badge-info" style="font-size:0.6rem; padding:0.05rem 0.35rem;">${item.qty}</span>
        </div>
      `).join('');
    }
  };

  // 2. Fridge Storage
  const renderInventory = () => {
    const tableBody = document.getElementById('inventory-table-body');
    const emptyState = document.getElementById('inventory-empty');
    if (!tableBody) return;

    let filtered = [...state.inventory];

    if (currentInventoryFilter === 'fresh') {
      filtered = filtered.filter(item => calculateDaysRemaining(item.expiryDate) > 2);
    } else if (currentInventoryFilter === 'expiring') {
      filtered = filtered.filter(item => {
        const d = calculateDaysRemaining(item.expiryDate);
        return d >= 0 && d <= 2;
      });
    } else if (currentInventoryFilter === 'expired') {
      filtered = filtered.filter(item => calculateDaysRemaining(item.expiryDate) < 0);
    }

    if (currentSearchQuery) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(currentSearchQuery) || 
        item.category.toLowerCase().includes(currentSearchQuery)
      );
    }

    if (filtered.length === 0) {
      tableBody.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }

    emptyState.style.display = 'none';
    filtered.sort((a, b) => calculateDaysRemaining(a.expiryDate) - calculateDaysRemaining(b.expiryDate));

    tableBody.innerHTML = filtered.map(item => {
      const days = calculateDaysRemaining(item.expiryDate);
      const status = getExpirationStatus(days);
      
      let daysText = '';
      if (days < 0) {
        daysText = `<span class="exp-status danger">Expired ${Math.abs(days)}d ago</span>`;
      } else if (days === 0) {
        daysText = `<span class="exp-status danger">Expires today</span>`;
      } else if (days === 1) {
        daysText = `<span class="exp-status warning">Expires tomorrow</span>`;
      } else if (days <= 2) {
        daysText = `<span class="exp-status warning">Expires in ${days} days</span>`;
      } else {
        daysText = `<span class="exp-status safe">${days} days left</span>`;
      }

      return `
        <tr>
          <td data-label="Food Item" style="font-weight:600; color:var(--primary);">${item.name}</td>
          <td data-label="Category">${item.category}</td>
          <td data-label="Quantity"><span class="badge badge-info">${item.qty}</span></td>
          <td data-label="Added Date">${item.addedDate}</td>
          <td data-label="Expiry Date">${item.expiryDate}</td>
          <td data-label="Remaining Life" style="font-weight:500;">${daysText}</td>
          <td style="text-align: right;">
            <div style="display:inline-flex; gap:0.4rem;">
              <button class="btn btn-success btn-icon btn-sm" onclick="app.markAsConsumed('${item.id}')" title="Consume">
                <i class="fa-solid fa-check"></i>
              </button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="app.markAsWasted('${item.id}')" title="Discard/Waste">
                <i class="fa-solid fa-trash-can"></i>
              </button>
              <button class="btn btn-secondary btn-icon btn-sm" onclick="app.deleteInventoryItem('${item.id}')" title="Delete">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  // 3. Recipes Checklist
  const renderRecipeChecklist = () => {
    const checklist = document.getElementById('recipe-ingredients-checklist');
    if (!checklist) return;

    if (state.inventory.length === 0) {
      checklist.innerHTML = `<p style="font-size:0.8rem; color:var(--secondary); text-align:center; padding:1rem 0;">No items in fridge storage.</p>`;
      return;
    }

    const items = state.inventory.map(item => ({ name: item.name, category: item.category }));
    
    // Deduplicate
    const uniqueItems = [];
    const map = new Map();
    for (const item of items) {
      if(!map.has(item.name.toLowerCase())){
        map.set(item.name.toLowerCase(), true);
        uniqueItems.push(item);
      }
    }

    checklist.innerHTML = uniqueItems.map((item, idx) => `
      <label class="ingredient-label-item" for="rec-ing-${idx}">
        <input type="checkbox" id="rec-ing-${idx}" value="${item.name}" 
          onchange="app.handleIngredientCheck(this)">
        <div style="display:flex; flex-direction:column;">
          <span style="font-size:0.85rem; font-weight:600;">${item.name}</span>
          <span style="font-size:0.7rem; color:var(--secondary); font-weight:400;">${item.category}</span>
        </div>
      </label>
    `).join('');
  };

  // 4. Shopping list
  const renderShoppingList = () => {
    const list = document.getElementById('shopping-items-list');
    const emptyState = document.getElementById('shopping-empty');
    const buyBtn = document.getElementById('btn-buy-all');

    if (!list) return;

    if (state.shoppingList.length === 0) {
      list.innerHTML = '';
      emptyState.style.display = 'flex';
      buyBtn.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    buyBtn.style.display = 'inline-flex';

    const sorted = [...state.shoppingList].sort((a, b) => a.checked - b.checked);

    list.innerHTML = sorted.map(item => `
      <div class="shopping-list-item ${item.checked ? 'checked' : ''}">
        <input type="checkbox" class="shopping-item-checkbox" 
          ${item.checked ? 'checked' : ''} 
          onclick="app.toggleShoppingChecked('${item.id}')">
        
        <div class="shopping-item-details">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="shopping-item-name">${item.name}</span>
            ${item.autoAdded ? '<span class="badge badge-warning" style="font-size:0.55rem; padding:0.05rem 0.3rem;">Replenish</span>' : ''}
          </div>
          <p>${item.category}</p>
        </div>
        
        <span class="badge badge-info" style="margin-right:0.5rem;">${item.qty}</span>
        
        <button class="btn btn-secondary btn-icon btn-sm" onclick="app.deleteShoppingItem('${item.id}')">
          <i class="fa-solid fa-trash-can" style="font-size:0.75rem;"></i>
        </button>
      </div>
    `).join('');
  };

  // 5. Analytics
  const renderAnalytics = () => {
    const consumedCount = state.history.filter(i => i.action === 'consumed').length;
    const wastedCount = state.history.filter(i => i.action === 'wasted').length;
    const totalCount = consumedCount + wastedCount;

    document.getElementById('analytics-total-items').textContent = totalCount;
    document.getElementById('analytics-consumed-items').textContent = consumedCount;
    document.getElementById('analytics-wasted-items').textContent = wastedCount;

    let foodSavedPct = 100;
    if (totalCount > 0) {
      foodSavedPct = Math.round((consumedCount / totalCount) * 100);
    }

    document.getElementById('analytics-waste-score').textContent = `${foodSavedPct}%`;
    const circle = document.getElementById('analytics-radial-ring');
    if (circle) {
      const circum = 2 * Math.PI * 65;
      const offset = circum - (foodSavedPct / 100) * circum;
      circle.style.strokeDashoffset = offset;
    }

    const financialSavings = consumedCount * 4.0;
    const carbonSavings = (consumedCount * 1.9).toFixed(1);

    document.getElementById('analytics-financial-savings').textContent = `$${financialSavings.toFixed(2)}`;
    document.getElementById('analytics-carbon-savings').textContent = `${carbonSavings} kg`;
    document.getElementById('analytics-tier-value').textContent = `${foodSavedPct}%`;

    let tierName = 'Fridge Novice';
    if (foodSavedPct >= 95) tierName = 'Zero Waste Guru 👑';
    else if (foodSavedPct >= 85) tierName = 'Sustainability Champion 🌿';
    else if (foodSavedPct >= 70) tierName = 'Smart Kitchen Planner 🍳';
    else if (foodSavedPct >= 50) tierName = 'Waste Reducer 🛡️';
    
    document.getElementById('analytics-tier-name').textContent = tierName;

    const barGroups = document.getElementById('bar-chart-groups');
    if (barGroups) {
      const today = new Date();
      const dayData = [
        { name: 'Mon', c: 4, w: 2 },
        { name: 'Tue', c: 6, w: 1 },
        { name: 'Wed', c: 10, w: 0 },
        { name: 'Thu', c: 5, w: 3 },
        { name: 'Fri', c: 8, w: 1.5 },
        { name: 'Sat', c: 7, w: 0.5 },
      ];

      const todayString = formatDate(today);
      const todayConsumed = state.history.filter(i => i.action === 'consumed' && i.date === todayString).length;
      const todayWasted = state.history.filter(i => i.action === 'wasted' && i.date === todayString).length;

      const dayIndex = today.getDay();
      if (dayIndex > 0 && dayIndex <= 6) {
        dayData[dayIndex - 1].c = 3 + todayConsumed;
        dayData[dayIndex - 1].w = todayWasted;
      }

      const scaleY = (val) => {
        const clamped = Math.min(val, 10);
        return 180 - (clamped / 10) * 160;
      };

      const getBarHeight = (val) => {
        const clamped = Math.min(val, 10);
        return (clamped / 10) * 160;
      };

      barGroups.innerHTML = dayData.map((day, idx) => {
        const startX = 75 + (idx * 55);
        const consHeight = getBarHeight(day.c);
        const consY = scaleY(day.c);
        
        const wastHeight = getBarHeight(day.w);
        const wastY = scaleY(day.w);

        return `
          <rect x="${startX}" y="${consY}" width="16" height="${consHeight}" class="chart-bar-consumed" rx="2" style="fill:var(--success); opacity:0.85;">
            <title>${day.name}: Consumed ${day.c} items</title>
          </rect>
          <rect x="${startX + 18}" y="${wastY}" width="16" height="${wastHeight}" class="chart-bar-wasted" rx="2" style="fill:var(--danger); opacity:0.85;">
            <title>${day.name}: Wasted ${day.w} items</title>
          </rect>
        `;
      }).join('');
    }
  };

  // --- PUBLIC INTERFACE ---
  return {
    init,
    switchView,
    handleQuickAdd,
    filterInventory,
    handleSearch,
    markAsConsumed,
    markAsWasted,
    deleteInventoryItem,
    startLiveWebcam,
    stopLiveWebcam,
    captureLiveDetections,
    triggerSimulatedPreset,
    toggleScannedItemApproval,
    approveScannedItems,
    cancelScannerReview,
    toggleSelectAllIngredients,
    handleIngredientCheck,
    generateRecipes,
    openRecipeModal,
    closeRecipeModal,
    cookRecipe,
    toggleShoppingChecked,
    deleteShoppingItem,
    clearBoughtShoppingItems,
    buySelectedShoppingItems,
    handleShoppingAdd
  };
})();

// Load listener
document.addEventListener('DOMContentLoaded', () => {
  app.init();
});
