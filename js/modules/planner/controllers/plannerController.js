/* ============================================
   TRAVVANA — Planner Controller v6.0
   Multi-step wizard, all inputs passed to AI,
   rich itinerary rendering, sessionStorage persistence
   ============================================ */

import { setState } from '../../../state/appState.js';
import { qs, qsa, escapeHTML } from '../../../utils/dom.js';
import { itineraryEngine } from '../services/itineraryEngine.js';

export async function initPlannerController() {
  setState({ currentPage: 'planner' });

  // ── State ──
  let currentStep = 1;
  const totalSteps = 10;
  const selections = {
    destination: '',
    days: 5,
    budget: 'mid-range',
    travelers: 'friends',
    interests: ['nature', 'adventure', 'food'],
    transport: 'car',
    stay: 'hotel',
    food: 'no-pref',
    accessibility: [],
    extras: ''
  };

  // ── Restore from sessionStorage ──
  try {
    const saved = sessionStorage.getItem('tvn_planner_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(selections, parsed);
    }
  } catch (e) { /* ignore */ }

  function saveState() {
    try { sessionStorage.setItem('tvn_planner_state', JSON.stringify(selections)); }
    catch (e) { /* ignore */ }
  }

  // ── DOM refs ──
  const wizard = qs('#pl-wizard');
  const stepNav = qs('#pl-step-nav');
  const btnBack = qs('#pl-btn-back');
  const btnNext = qs('#pl-btn-next');
  const btnGenerate = qs('#pl-btn-generate');
  const progressFill = qs('#pl-progress-fill');
  const stepCounter = qs('#pl-step-counter');
  const generatingOverlay = qs('#pl-generating');
  const resultsPanel = qs('#pl-results');
  const shell = qs('.pl-shell');

  // ── Navigation ──
  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;
    currentStep = step;

    qsa('.pl-step').forEach(s => {
      s.classList.remove('pl-step--active');
      s.style.animation = 'none';
      s.offsetHeight;
      s.style.animation = '';
    });
    const activeStep = qs(`.pl-step[data-step="${step}"]`);
    if (activeStep) activeStep.classList.add('pl-step--active');

    qsa('.pl-step-link').forEach(link => {
      const linkStep = parseInt(link.dataset.step, 10);
      link.classList.remove('pl-step-link--active', 'pl-step-link--completed');
      if (linkStep === step) link.classList.add('pl-step-link--active');
      else if (linkStep < step) link.classList.add('pl-step-link--completed');
    });

    if (progressFill) progressFill.style.width = `${(step / totalSteps) * 100}%`;
    const progressBar = qs('#pl-progress-bar');
    if (progressBar) progressBar.setAttribute('aria-valuenow', step);
    if (stepCounter) stepCounter.textContent = `Step ${step} of ${totalSteps}`;
    
    // Update mobile step indicator
    const mobStepCur = qs('#pl-mob-step-cur');
    const mobProgressFill = qs('#pl-mob-progress-fill');
    if (mobStepCur) mobStepCur.textContent = step;
    if (mobProgressFill) mobProgressFill.style.width = `${(step / totalSteps) * 100}%`;

    if (btnBack) btnBack.style.display = step === 1 ? 'none' : 'inline-flex';
    if (btnNext) btnNext.style.display = step === totalSteps ? 'none' : 'inline-flex';
    if (btnGenerate) btnGenerate.style.display = step === totalSteps ? 'inline-flex' : 'none';

    updatePreview();
    if (wizard) wizard.scrollTop = 0;
  }

  // ── Step Validation ──
  function validateStep(step) {
    if (step === 1) {
      if (!selections.destination) {
        if (destInput) {
          destInput.focus();
          destInput.classList.add('pl-input--error');
          setTimeout(() => destInput.classList.remove('pl-input--error'), 2000);
        }
        showToast('Please select or type a destination first.', 'warning');
        return false;
      }
      
      // Warn if it's a city (not a known state) in case the user is running offline
      const destStr = selections.destination.toLowerCase().replace(/[^a-z]/g, '');
      const knownStates = ['kerala', 'rajasthan', 'tamilnadu', 'goa', 'himachalpradesh', 'uttarakhand', 'karnataka', 'maharashtra', 'gujarat', 'uttarpradesh', 'madhyapradesh', 'andhrapradesh', 'westbengal', 'sikkim', 'meghalaya', 'assam', 'jammuandkashmir', 'jammukashmir'];
      if (!knownStates.includes(destStr)) {
        showToast('Note: If the Live AI is offline, city searches may fail. Use a State name for offline mode.', 'info');
      }
    }
    if (step === 2 && (selections.days === 'custom' || isNaN(selections.days) || selections.days < 1)) {
      showToast('Please select a valid trip duration.', 'warning');
      return false;
    }
    if (step === 5 && (!selections.interests || selections.interests.length === 0)) {
      showToast('Please select at least one interest.', 'warning');
      return false;
    }
    return true;
  }

  // ── Back / Next ──
  if (btnBack) btnBack.addEventListener('click', () => goToStep(currentStep - 1));
  if (btnNext) btnNext.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    goToStep(currentStep + 1);
  });

  // ── Sidebar step clicks (allow jumping to any completed or current step) ──
  qsa('.pl-step-link').forEach(link => {
    link.addEventListener('click', () => {
      const step = parseInt(link.dataset.step, 10);
      if (step <= currentStep) goToStep(step);
    });
  });

  // ── Keyboard navigation ──
  document.addEventListener('keydown', (e) => {
    if (generatingOverlay?.classList.contains('active')) return;
    if (resultsPanel?.classList.contains('active')) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'ArrowRight' || e.key === 'Enter') {
      e.preventDefault();
      if (currentStep === totalSteps) return;
      if (!validateStep(currentStep)) return;
      goToStep(currentStep + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToStep(currentStep - 1);
    }
  });

  // ════════════════════════════════════════
  // STEP 1: Destination
  // ════════════════════════════════════════
  const destInput = qs('#pl-dest-input');
  const destGrid = qs('#pl-dest-grid');

  if (destInput) {
    // Restore saved value
    if (selections.destination) destInput.value = selections.destination;
    destInput.addEventListener('input', () => {
      selections.destination = destInput.value.trim();
      updatePreview();
      saveState();
    });
  }

  if (destGrid) {
    destGrid.querySelectorAll('.pl-dest-card').forEach(card => {
      // Restore selected state
      if (card.dataset.dest === selections.destination) {
        card.classList.add('pl-dest-card--selected');
      }
      card.addEventListener('click', () => {
        destGrid.querySelectorAll('.pl-dest-card').forEach(c => c.classList.remove('pl-dest-card--selected'));
        card.classList.add('pl-dest-card--selected');
        selections.destination = card.dataset.dest;
        if (destInput) destInput.value = card.dataset.dest;
        updatePreview();
        saveState();
      });
    });
  }

  // ════════════════════════════════════════
  // STEPS 2-9: Option Card Selection
  // ════════════════════════════════════════
  const gridConfigs = [
    { id: 'pl-duration-grid', key: 'days', multi: false, transform: v => parseInt(v, 10) || v },
    { id: 'pl-budget-grid', key: 'budget', multi: false },
    { id: 'pl-travelers-grid', key: 'travelers', multi: false },
    { id: 'pl-transport-grid', key: 'transport', multi: false },
    { id: 'pl-stay-grid', key: 'stay', multi: false },
    { id: 'pl-food-grid', key: 'food', multi: false },
    { id: 'pl-access-grid', key: 'accessibility', multi: true },
  ];

  gridConfigs.forEach(({ id, key, multi, transform }) => {
    const grid = qs(`#${id}`);
    if (!grid) return;

    // Restore selected state
    grid.querySelectorAll('.pl-option-card').forEach(card => {
      // Set initial aria roles
      card.setAttribute('role', multi ? 'checkbox' : 'radio');
      
      if (multi) {
        if (Array.isArray(selections[key]) && selections[key].includes(card.dataset.val)) {
          card.classList.add('pl-option-card--selected');
        } else {
          card.classList.remove('pl-option-card--selected');
        }
      } else {
        const currentVal = transform ? String(selections[key]) : selections[key];
        if (card.dataset.val === currentVal) {
          card.classList.add('pl-option-card--selected');
        } else {
          card.classList.remove('pl-option-card--selected');
        }
      }
      
      // Set initial aria-checked
      card.setAttribute('aria-checked', card.classList.contains('pl-option-card--selected') ? 'true' : 'false');

      // Click listener
      card.addEventListener('click', () => {
        if (multi) {
          card.classList.toggle('pl-option-card--selected');
          card.setAttribute('aria-checked', card.classList.contains('pl-option-card--selected') ? 'true' : 'false');
          
          const selected = [];
          grid.querySelectorAll('.pl-option-card--selected').forEach(c => selected.push(c.dataset.val));
          selections[key] = selected;
        } else {
          grid.querySelectorAll('.pl-option-card').forEach(c => {
            c.classList.remove('pl-option-card--selected');
            c.setAttribute('aria-checked', 'false');
          });
          card.classList.add('pl-option-card--selected');
          card.setAttribute('aria-checked', 'true');
          
          const val = card.dataset.val;
          selections[key] = transform ? transform(val) : val;
        }
        updatePreview();
        saveState();
      });
    });
  });

  // ── Custom Duration Handler ──
  const customDurationWrap = qs('#pl-custom-duration');
  const customDaysInput = qs('#pl-custom-days');
  const durationGrid = qs('#pl-duration-grid');

  if (durationGrid && customDurationWrap && customDaysInput) {
    // Show/hide custom input based on current selection
    if (selections.days === 'custom' || (typeof selections.days === 'number' && ![2,3,4,5,7,10,14].includes(selections.days))) {
      customDurationWrap.style.display = 'block';
      if (typeof selections.days === 'number') customDaysInput.value = selections.days;
    }

    // Observe when "Custom" card is clicked
    const observer = new MutationObserver(() => {
      const customCard = durationGrid.querySelector('[data-val="custom"]');
      if (customCard?.classList.contains('pl-option-card--selected')) {
        customDurationWrap.style.display = 'block';
        customDaysInput.focus();
        const daysVal = parseInt(customDaysInput.value, 10);
        if (daysVal >= 1 && daysVal <= 30) {
          selections.days = daysVal;
        }
      } else {
        customDurationWrap.style.display = 'none';
      }
    });
    observer.observe(durationGrid, { subtree: true, attributes: true, attributeFilter: ['class'] });

    customDaysInput.addEventListener('input', () => {
      const val = parseInt(customDaysInput.value, 10);
      if (val >= 1 && val <= 30) {
        selections.days = val;
        updatePreview();
        saveState();
      }
    });
  }

  // ════════════════════════════════════════
  // STEP 5: Interest Chips
  // ════════════════════════════════════════
  const chipsWrap = qs('#pl-interests-chips');
  if (chipsWrap) {
    // Restore selected state
    chipsWrap.querySelectorAll('.pl-chip').forEach(chip => {
      chip.setAttribute('role', 'checkbox');
      if (selections.interests.includes(chip.dataset.val)) {
        chip.classList.add('pl-chip--selected');
        chip.setAttribute('aria-checked', 'true');
      } else {
        chip.classList.remove('pl-chip--selected');
        chip.setAttribute('aria-checked', 'false');
      }
    });

    chipsWrap.querySelectorAll('.pl-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('pl-chip--selected');
        chip.setAttribute('aria-checked', chip.classList.contains('pl-chip--selected') ? 'true' : 'false');
        const selected = [];
        chipsWrap.querySelectorAll('.pl-chip--selected').forEach(c => selected.push(c.dataset.val));
        selections.interests = selected;
        updatePreview();
        saveState();
      });
    });
  }

  // ════════════════════════════════════════
  // STEP 10: Extras
  // ════════════════════════════════════════
  const extrasInput = qs('#pl-extras-input');
  if (extrasInput) {
    if (selections.extras) extrasInput.value = selections.extras;
    extrasInput.addEventListener('input', () => {
      selections.extras = extrasInput.value;
      saveState();
    });
  }

  qsa('.pl-extras-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const text = tag.dataset.text;
      if (extrasInput) {
        extrasInput.value = extrasInput.value
          ? extrasInput.value + '. ' + text
          : text;
        selections.extras = extrasInput.value;
        saveState();
      }
    });
  });

  // ════════════════════════════════════════
  // LIVE PREVIEW
  // ════════════════════════════════════════
  const previewImages = {
    'Himachal Pradesh': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80',
    'Rajasthan': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80',
    'Kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80',
    'Goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80',
    'Uttarakhand': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    'Karnataka': 'assets/images/states/karnataka/banner.webp',
  };

  const labelMap = {
    'backpacker': 'Backpacker', 'budget': 'Budget', 'mid-range': 'Mid-range',
    'premium': 'Premium', 'luxury': 'Luxury',
    'solo': 'Solo', 'couple': 'Couple', 'friends': 'Friends',
    'family': 'Family', 'senior': 'Senior', 'group': 'Group',
    'flight': 'Flight', 'train': 'Train', 'bus': 'Bus',
    'car': 'Private Car', 'bike': 'Bike', 'mixed': 'Mixed',
    'hostel': 'Hostel', 'hotel': 'Hotel', 'resort': 'Resort',
    'villa': 'Villa', 'homestay': 'Homestay', 'camping': 'Camping',
    'veg': 'Vegetarian', 'nonveg': 'Non-Veg', 'vegan': 'Vegan',
    'jain': 'Jain', 'local': 'Local Cuisine', 'no-pref': 'No Preference',
  };

  function updatePreview() {
    const setEl = (id, val) => { const el = qs(id); if (el) el.textContent = val; };

    setEl('#pl-preview-title', selections.destination || 'Select a destination');

    const img = qs('#pl-preview-img');
    if (img && previewImages[selections.destination]) {
      img.src = previewImages[selections.destination];
    }

    const chipsEl = qs('#pl-preview-chips');
    if (chipsEl) {
      chipsEl.innerHTML = selections.interests.slice(0, 4)
        .map(i => `<span class="pl-preview-chip">${escapeHTML(i.charAt(0).toUpperCase() + i.slice(1))}</span>`).join('');
    }

    const days = typeof selections.days === 'number' ? `${selections.days} Days` : selections.days;
    setEl('#pv-duration', days);
    setEl('#pv-budget', labelMap[selections.budget] || selections.budget);
    setEl('#pv-travelers', labelMap[selections.travelers] || selections.travelers);
    setEl('#pv-transport', labelMap[selections.transport] || selections.transport);
    setEl('#pv-stay', labelMap[selections.stay] || selections.stay);
    setEl('#pv-food', labelMap[selections.food] || selections.food);

    // Contextual AI note based on actual selections
    const dest = selections.destination;
    const notes = [];
    if (dest) notes.push(`I'll craft the perfect ${dest} itinerary for you.`);
    if (selections.interests.length > 3) notes.push(`${selections.interests.length} interests selected — I'll balance them across your trip.`);
    if (selections.accessibility.length > 0 && !selections.accessibility.includes('none')) notes.push(`I'll ensure all places are accessible for your needs.`);
    if (selections.extras) notes.push(`Got your special requests — I'll factor them in.`);
    if (!notes.length) notes.push("I'll optimize your route for the best experience.");
    setEl('#pl-ai-note', notes[Math.min(notes.length - 1, Math.floor(Math.random() * notes.length))]);
  }

  // ════════════════════════════════════════
  // GENERATE — passes ALL inputs
  // ════════════════════════════════════════
  let isGenerating = false;

  if (btnGenerate) {
    btnGenerate.addEventListener('click', async () => {
      if (isGenerating) return;
      if (!selections.destination) {
        goToStep(1);
        if (destInput) destInput.focus();
        showToast('Please select a destination first.', 'warning');
        return;
      }

      isGenerating = true;

      // Hide wizard, show generating
      if (shell) shell.style.display = 'none';
      if (generatingOverlay) {
        generatingOverlay.classList.add('active');
        // Focus trap: move focus into overlay
        const genTitle = generatingOverlay.querySelector('.pl-gen-title');
        if (genTitle) { genTitle.setAttribute('tabindex', '-1'); genTitle.focus(); }
      }

      // Animate gen steps
      const genSteps = qsa('#pl-gen-steps .pl-gen-step');
      for (let i = 0; i < genSteps.length; i++) {
        genSteps[i].classList.add('active');
        await sleep(350);
        genSteps[i].classList.remove('active');
        genSteps[i].classList.add('done');
        await sleep(150);
      }

      try {
        const budgetTier = getBudgetTier(selections.budget);
        const numTravelers = getTravelerCount(selections.travelers);

        // ── Pass ALL wizard inputs to engine ──
        const data = await itineraryEngine.generateItinerary({
          destination: selections.destination,
          days: typeof selections.days === 'number' ? selections.days : 5,
          travelers: String(numTravelers),
          budget: budgetTier,
          tripType: selections.travelers,
          interests: selections.interests,
          transport: selections.transport,
          stay: selections.stay,
          food: selections.food,
          accessibility: selections.accessibility,
          extras: selections.extras
        });

        await sleep(400);

        if (generatingOverlay) generatingOverlay.classList.remove('active');
        renderResults(data);
        if (resultsPanel) resultsPanel.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'instant' });

      } catch (err) {
        if (generatingOverlay) generatingOverlay.classList.remove('active');
        if (shell) shell.style.display = 'grid';
        showToast(err.message || 'Failed to generate itinerary. Try another destination.', 'error');
      }

      isGenerating = false;
      genSteps.forEach(s => { s.classList.remove('active', 'done'); });
    });
  }

  // ════════════════════════════════════════
  // TOAST NOTIFICATION (replaces alert)
  // ════════════════════════════════════════
  function showToast(message, type = 'info') {
    const existing = qs('.pl-toast');
    if (existing) existing.remove();

    const icons = {
      error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
      success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    };

    const toast = document.createElement('div');
    toast.className = `pl-toast pl-toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.innerHTML = `${icons[type] || icons.info}<span>${escapeHTML(message)}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('pl-toast--visible'));
    setTimeout(() => {
      toast.classList.remove('pl-toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }

  // ════════════════════════════════════════
  // RENDER RESULTS — Full Rich Data
  // ════════════════════════════════════════
  let currentItinerary = null;

  function renderResults(data) {
    currentItinerary = data;

    const setEl = (id, val) => { const el = qs(id); if (el) el.textContent = val; };
    setEl('#pl-res-title', `Your ${escapeHTML(data.destination)} Itinerary`);

    const numTravelers = getTravelerCount(selections.travelers);
    setEl('#pl-res-sub', `${data.days} Days \u00b7 ${labelMap[selections.travelers] || selections.travelers} \u00b7 ${labelMap[selections.budget] || selections.budget} \u00b7 ${labelMap[selections.transport] || selections.transport}`);

    // Budget
    if (data.estimatedBudget) {
      setEl('#pl-res-budget', new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(data.estimatedBudget));
    }
    const budgetHint = qs('.pl-res-budget-hint');
    if (budgetHint) budgetHint.textContent = `for ${numTravelers} ${numTravelers === 1 ? 'person' : 'people'}`;

    // Info
    setEl('#pl-res-dest', data.destination);
    setEl('#pl-res-dur', `${data.days} Days / ${data.days - 1} Nights`);
    setEl('#pl-res-time', data.bestTime || 'October to March');
    setEl('#pl-res-trans', labelMap[selections.transport] || 'Private Car');
    setEl('#pl-res-accom', labelMap[selections.stay] || 'Hotel');

    // Travel tip
    const tipEl = qs('#pl-res-tip');
    if (tipEl && data.travelTip) {
      tipEl.textContent = data.travelTip;
      tipEl.closest('.pl-res-info-card')?.classList.remove('hidden');
    }

    // Highlights
    const highlightsEl = qs('#pl-res-highlights');
    if (highlightsEl && data.highlights) {
      highlightsEl.innerHTML = data.highlights
        .map(h => `<span class="pl-res-highlight-chip">${escapeHTML(h)}</span>`).join('');
    }

    // Day tabs + timeline
    renderDayTabs(data);
    renderTimeline(0, data);
  }

  function renderDayTabs(data) {
    const container = qs('#pl-res-day-tabs');
    if (!container) return;

    container.innerHTML = data.schedule.map((d, i) =>
      `<button class="pl-res-day-tab ${i === 0 ? 'pl-res-day-tab--active' : ''}" data-day="${i}">
        <span class="pl-res-day-tab-num">Day ${d.day}</span>
        <span class="pl-res-day-tab-theme">${escapeHTML(d.theme || '')}</span>
      </button>`
    ).join('');

    container.querySelectorAll('.pl-res-day-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        container.querySelectorAll('.pl-res-day-tab').forEach(t => t.classList.remove('pl-res-day-tab--active'));
        tab.classList.add('pl-res-day-tab--active');
        renderTimeline(parseInt(tab.dataset.day, 10), currentItinerary);
      });
    });
  }

  // ── Type icon mapping ──
  const typeIcons = {
    attraction: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>',
    temple: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4h6v4"/></svg>',
    nature: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L21 3"/></svg>',
    beach: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="6" r="4"/><path d="M2 22c2-4 4-6 10-6s8 2 10 6"/></svg>',
    fort: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16"/><path d="M9 21v-4h6v4"/></svg>',
    lake: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c2-3 6-4 10-4s8 1 10 4"/><path d="M2 16c2-3 6-4 10-4s8 1 10 4"/></svg>',
    waterfall: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v6m0 4v6m-4-8v4m8-6v6"/></svg>',
    trek: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3l4 8 5-5 5 15H2z"/></svg>',
    museum: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
    market: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>',
    viewpoint: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>',
    experience: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z"/></svg>',
    'food-walk': '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>',
    travel: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 16 16 16"/></svg>',
    break: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
  };

  function renderTimeline(dayIdx, data) {
    const container = qs('#pl-res-timeline');
    if (!container || !data.schedule[dayIdx]) return;

    const dayData = data.schedule[dayIdx];
    const items = dayData.items;

    // ── Daily Stats Bar ──
    let statsHTML = '';
    if (dayData.dailyStats) {
      const s = dayData.dailyStats;
      statsHTML = `
        <div class="pl-res-daily-stats">
          ${s.travelDistanceKm ? `<div class="pl-res-stat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>${escapeHTML(s.travelDistanceKm)}</span></div>` : ''}
          ${s.drivingTime ? `<div class="pl-res-stat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 16H9m10 0h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg><span>${escapeHTML(s.drivingTime)}</span></div>` : ''}
          ${s.walkingDistance ? `<div class="pl-res-stat"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 4v16M7 4v16M3 8h4M13 8h4M3 16h4M13 16h4"/></svg><span>${escapeHTML(s.walkingDistance)} walk</span></div>` : ''}
          ${s.dailyExperienceScore ? `<div class="pl-res-stat pl-res-stat--score"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg><span>${s.dailyExperienceScore}/100</span></div>` : ''}
        </div>
        ${s.optimalReason ? `<div class="pl-res-route-reason"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>${escapeHTML(s.optimalReason)}</div>` : ''}
      `;
    }

    // ── Timeline Items ──
    const itemsHTML = items.map(item => {
      const icon = typeIcons[item.type] || typeIcons.attraction;
      const typeBadge = item.type ? `<span class="pl-res-tl-type pl-res-tl-type--${escapeHTML(item.type)}">${icon}${escapeHTML(item.type.replace('-', ' '))}</span>` : '';

      // Meta badges (visit duration, entry fee, timings)
      let metaHTML = '';
      const metaItems = [];
      if (item.visitDuration) metaItems.push(`<span class="pl-res-tl-meta-item">⏱ ${escapeHTML(item.visitDuration)}</span>`);
      if (item.entryFee && item.entryFee !== 'N/A') metaItems.push(`<span class="pl-res-tl-meta-item">🎟 ${escapeHTML(item.entryFee)}</span>`);
      if (item.timings) metaItems.push(`<span class="pl-res-tl-meta-item">🕐 ${escapeHTML(item.timings)}</span>`);
      if (metaItems.length) metaHTML = `<div class="pl-res-tl-meta">${metaItems.join('')}</div>`;

      // Pro tip
      const proTipHTML = item.proTip
        ? `<div class="pl-res-tl-protip"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.5 8.5L23 11l-8.5 2.5L12 22l-2.5-8.5L1 11l8.5-2.5z"/></svg><span>${escapeHTML(item.proTip)}</span></div>`
        : '';

      // Photo spot
      const photoHTML = item.photoSpot
        ? `<div class="pl-res-tl-photo"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg><span>${escapeHTML(item.photoSpot)}</span></div>`
        : '';

      // Accessibility info
      const accessHTML = item.accessibility
        ? `<div class="pl-res-tl-access"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h4l3 5"/><circle cx="12" cy="7" r="2"/></svg><span>${escapeHTML(item.accessibility)}</span></div>`
        : '';

      return `
        <div class="pl-res-tl-item pl-res-tl-item--${escapeHTML(item.type || 'attraction')}">
          <div class="pl-res-tl-dot"></div>
          <div class="pl-res-tl-time">${escapeHTML(item.time)}</div>
          <div class="pl-res-tl-card">
            <div class="pl-res-tl-card-header">
              <div class="pl-res-tl-name">${escapeHTML(item.title)}</div>
              ${typeBadge}
            </div>
            <div class="pl-res-tl-desc">${escapeHTML(item.desc)}</div>
            ${metaHTML}
            ${proTipHTML}
            ${photoHTML}
            ${accessHTML}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = statsHTML + itemsHTML;
  }

  // ── Edit Plan → back to wizard ──
  qs('#pl-btn-edit')?.addEventListener('click', () => {
    if (resultsPanel) resultsPanel.classList.remove('active');
    if (shell) shell.style.display = 'grid';
    goToStep(1);
  });

  // ── New Plan ──
  qs('#pl-btn-new-plan')?.addEventListener('click', () => {
    if (resultsPanel) resultsPanel.classList.remove('active');
    if (shell) shell.style.display = 'grid';
    selections.destination = '';
    if (destInput) destInput.value = '';
    qsa('.pl-dest-card--selected').forEach(c => c.classList.remove('pl-dest-card--selected'));
    sessionStorage.removeItem('tvn_planner_state');
    goToStep(1);
  });

  // ── Share ──
  qs('#pl-btn-share')?.addEventListener('click', async () => {
    if (!currentItinerary) return;
    const text = `Check out my ${currentItinerary.destination} trip plan on Travvana! ${currentItinerary.days} days of adventure.`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${currentItinerary.destination} Itinerary — Travvana`, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        showToast('Trip link copied to clipboard!', 'success');
      }
    } catch (e) {
      showToast('Could not share. Try copying the URL manually.', 'warning');
    }
  });

  // ── Download as text ──
  qs('#pl-btn-download')?.addEventListener('click', () => {
    if (!currentItinerary) return;
    const data = currentItinerary;
    let text = `${data.destination} Itinerary — ${data.days} Days\n`;
    text += `Generated by Travvana AI Trip Planner\n`;
    text += `${'═'.repeat(50)}\n\n`;
    text += `Budget: ${data.estimatedBudget ? '₹' + data.estimatedBudget.toLocaleString('en-IN') : 'N/A'}\n`;
    text += `Best Time: ${data.bestTime || 'N/A'}\n`;
    text += `Highlights: ${(data.highlights || []).join(', ')}\n`;
    if (data.travelTip) text += `Tip: ${data.travelTip}\n`;
    text += `\n${'═'.repeat(50)}\n\n`;

    data.schedule.forEach(day => {
      text += `── DAY ${day.day}: ${day.theme || ''} ──\n`;
      if (day.dailyStats) {
        const s = day.dailyStats;
        if (s.travelDistanceKm) text += `  Distance: ${s.travelDistanceKm}`;
        if (s.drivingTime) text += ` | Drive: ${s.drivingTime}`;
        if (s.walkingDistance) text += ` | Walk: ${s.walkingDistance}`;
        text += '\n';
      }
      text += '\n';
      day.items.forEach(item => {
        text += `  ${item.time}  ${item.title}\n`;
        if (item.desc) text += `          ${item.desc}\n`;
        if (item.visitDuration) text += `          Duration: ${item.visitDuration}\n`;
        if (item.entryFee && item.entryFee !== 'N/A') text += `          Entry: ${item.entryFee}\n`;
        if (item.proTip) text += `          💡 ${item.proTip}\n`;
        text += '\n';
      });
      text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.destination.replace(/\s+/g, '-')}-itinerary.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Itinerary downloaded!', 'success');
  });

  // ── Init ──
  goToStep(1);
  updatePreview();
  console.log('[Planner] v6.0 initialized — all inputs passed to AI');
}

// ── Helpers ──
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getBudgetTier(val) {
  const map = { 'backpacker': 'budget', 'budget': 'budget', 'mid-range': 'moderate', 'premium': 'premium', 'luxury': 'luxury' };
  return map[val] || 'moderate';
}

function getTravelerCount(val) {
  const map = { 'solo': 1, 'couple': 2, 'friends': 4, 'family': 4, 'senior': 2, 'group': 6 };
  return map[val] || 2;
}
