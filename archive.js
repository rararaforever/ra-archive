// import {} from "./";

/* -------------------------------------------
__
//,, SHARED DATA AND LOOKUPS
//,,-------------------------------------------*/
window.noImageThumbnail =
  "https://s3.amazonaws.com/arena_images-temp/uploads%2Fdb4c39ea-2fd3-42af-83bb-6ae6b820133a%2Fthumb-none.png" ||
  {};
window.data = window.data || [];
window.assets = window.assets || [];
window.lookup = window.lookup || {};
window.lookupSlug = window.lookupSlug || {};

/* -------------------------------------------
__
//,, SPREADSHEET CONFIGURATION
//,,-------------------------------------------*/
window.SPREADSHEET_ID = "1dqC7mhxzCJ5J8cfv4TS_ihnBU-he_c3Z9z82AGH4y88" || {};
window.SHEET_TITLE = "ALL" || {};
window.SHEET_ASSETS = "Assets" || {};
window.URLD =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${SHEET_TITLE}` ||
  {};
window.URLA =
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?sheet=${SHEET_ASSETS}` ||
  {};

/* -------------------------------------------
__//
//,, INITIAL PAGE MARKUP
//,,-------------------------------------------*/
function initializePageMarkup() {
  const header = document.querySelector(".header");
  const tiger = document.querySelector(".tiger");

  if (!header || !tiger) {
    throw new Error("Archive page requires .header and .tiger containers.");
  }

  const shell = document.createElement("template");
  shell.innerHTML = `
    <div
      class="archive-loading"
      id="archiveLoading"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <video
        class="archive-loading__video"
        autoplay
        muted
        loop
        playsinline
        aria-hidden="true"
        src="https://attachments.are.na/51952544/efbd7a34f9588595b31689a136d83986.mp4?1793105069"
      ></video>
      <span class="archive-loading__message">Loading archive...</span>
    </div>
    <div
      class="archive-render-loading"
      id="archiveRenderLoading"
      role="status"
      aria-live="polite"
      aria-label="Updating archive"
      hidden
    >
      <video
        class="archive-render-loading__video"
        muted
        loop
        playsinline
        preload="none"
        aria-hidden="true"
      ></video>
    </div>
    <dialog
      class="archive-welcome"
      id="archiveWelcome"
      aria-labelledby="archiveWelcomeTitle"
    >
      <div class="archive-welcome__content">
        <h1 id="archiveWelcomeTitle">
          Welcome to the Reel Asian Digital Community Archive!
        </h1>
        <p>
          This is a community archive, please navigate with sensitivity and
          mindfulness. Users must adhere to the unique copyright and sharing
          permissions on each of the entries. Sharing of material against the
          wishes of the copyright holder’s discretion is strictly prohibited.
        </p>
        <p>
          If there is an entry that involves you or your likeness in the archive
          that you want removed or edited, please reach out to
          <a href="mailto:specialprojects@reelasian.com"
            >specialprojects@reelasian.com</a
          >
          to have it addressed.
        </p>
        <p>
          This is not a complete directory of all films and events from Reel
          Asian, but rather pieces of it. We focused on things submitted from
          community members, and material available online and in our own
          archive to release.
        </p>
        <p>
          If you just want to explore: Browse using the filtering options, and
          see what you find!
        </p>
        <p>Or, type in a key word, place or name in the search bar.</p>
        <p>Here you will find:</p>
        <ul>
          <li>
            Memorabilia and keepsakes of community members at Reel Asian over
            the years
          </li>
          <li>
            Several commissioned and programmed films available online,
            searchable via tags, names and key words
          </li>
          <li>Archived panels and talks hosted through our industry series</li>
          <li>
            Archived Internal, Operational and Marketing Reel Asian documents
            and items
          </li>
          <li>
            Critical writing on programmed films/panels: Youth Critics
            Initiative Pieces (TACLA)
          </li>
          <li>Wee Asian arts activities over the last 5 years</li>
          <li>And more!</li>
        </ul>
        <p>Wander around, and have fun!</p>
        <form method="dialog">
          <button class="archive-welcome__continue" type="submit">
            Continue to archive →
          </button>
        </form>
      </div>
    </dialog>
    <dialog class="archive-howto" id="howToDialog" aria-labelledby="howToTitle">
      <button
        class="archive-howto__close"
        id="howToClose"
        type="button"
        aria-label="Close How To"
      >
        ×
      </button>
      <div class="archive-howto__content">
        <h1 id="howToTitle">How to use the archive</h1>
        <section>
          <h2>THE SEARCH BAR</h2>
          <p>
            The search bar searches the title of an item as well as its
            description. This is a good place to look up names of people,
            programs, places, and countries. It searches live as you type, so
            sometimes there may not be anything tagged exactly for what you are
            looking for (ie. “Thailand”) but there are entries for something
            similar (ie. “Thai”). Consider different terms and keywords to use
            to find what you are looking for.
          </p>
        </section>
        <section>
          <h2>FILTERS</h2>
          <p>
            These filters are a great place to start exploring. These filters
            are divided into 6 sections:
          </p>
          <ul>
            <li>
              Medium (What type of format is the entry about? Short film,
              feature film, Event)
            </li>
            <li>
              Programme (Explore Reel Asian’s different programming subsections
              like: Community Archive Submission, RA:X, Reel Ideas)
            </li>
            <li>
              Tags (There are over 100 tags in this database, they range from
              topic, genre, description of event and more)
            </li>
            <li>Year (Filter by a specific festival year)</li>
            <li>Language (Language of video or text based piece)</li>
            <li>Country (Country of film production)</li>
          </ul>
        </section>
        <section>
          <h2>HOT KEYS</h2>
          <p>
            <kbd>ENTER</kbd> will automatically search what you have typed in
            the search bar
          </p>
          <p>
            <kbd>ESC</kbd> will automatically minimize the full screen search
            page
          </p>
        </section>
      </div>
    </dialog>
    <div class="pagination--container">
      <div class="pagination"></div>
      <div class="viewmenu--container">
        <div class="view__title">view toggles</div>
        <div class="viewbtn--container">
          <div class="viewoptions--container" data-view-control="grid">
            <label for="gridSlider">
              Grid Columns: <span id="gridValue">3</span>
            </label>
            <input
              id="gridSlider"
              type="range"
              min="1"
              max="4"
              value="3"
              step="1"
            />
          </div>
          <div class="viewoptions--container" data-view-control="list" hidden>
            <label for="rowSlider">
              Row size: <span id="rowValue">180</span>px
            </label>
            <input
              id="rowSlider"
              type="range"
              min="100"
              max="400"
              value="180"
              step="20"
            />
          </div>
          <button
            class="view__btn active"
            type="button"
            data-view="grid"
            aria-label="Grid view"
            aria-pressed="true"
          >
            Grid View
          </button>
          <button
            class="view__btn"
            type="button"
            data-view="list"
            aria-label="List view"
            aria-pressed="false"
          >
            List View
          </button>
          <button
            class="view__btn"
            type="button"
            data-view="random"
            aria-label="Random project picker"
            aria-pressed="false"
          >
            Randomizer
          </button>
        </div>
      </div>
    </div>
  `;

  header.innerHTML = `
    <div class="header--container">
      <div class="header__bar--container">
        <button class="filter__clps"><span>⤡</span>Open Search Bar</button>
      </div>
      <div class="header__title--container">
        <div class="header__title">Reel Asian Archive</div>
      </div>
      <div class="header__links--container">
        <a href="" class="header__link" id="howToLink">How to</a>
        <a href="" class="header__link" id="aboutLink">About</a>
      </div>
    </div>
    <div class="filter--parent">
      <div class="filter--container" id="filter__container"></div>
    </div>
    <div class="filter__backdrop"></div>
  `;

  document.body.prepend(shell.content);
}

initializePageMarkup();

/* -------------------------------------------
__
//,, DOM REFERENCES
//,,-------------------------------------------*/
window.popups = document.querySelectorAll(".popup") || {};
window.ele_tiger = document.querySelector(".tiger") || {};

/* -------------------------------------------
__
//,, FILTER AND CARD CONFIGURATION
//,,-------------------------------------------*/
window.filterItems = window.filterItems || [];
window.filterM = window.filterM || {};
window.filterP = window.filterP || {};
window.filterT = window.filterT || {};
window.selectedCategories = window.selectedCategories || {
  filterM: [],
  filterP: [],
  filterT: [],
};
window.cardsHolder = window.cardsHolder || [];
window.cardsContainer = window.cardsContainer || [];
window.filterCols = window.filterCols || [
  { col: "i", name: "medium" },
  { col: "j", name: "programme" },
  { col: "p", name: "tags" },
  { col: "n", name: "festival year" },
  { col: "l", name: "language" },
  { col: "k", name: "country" },
];
window.searchCols = window.searchCols || [
  { col: "a", name: "title" },
  { col: "b", name: "credits" },
  { col: "e", name: "desc" },
  { col: "o", name: "names relevant" },
  { col: "i", name: "medium" },
  { col: "j", name: "programme" },
  { col: "k", name: "country" },
  { col: "l", name: "language" },
  { col: "n", name: "year" },
  { col: "p", name: "tags" },
];
window.cardCols = window.cardCols || [
  { col: "a", name: "title" },
  { col: "b", name: "Credits" },
  { col: "e", name: "desc" },
  { col: "o", name: "names relevant" },
  { col: "i", name: "medium" },
  { col: "j", name: "programme" },
  { col: "k", name: "country" },
  { col: "l", name: "language" },
  { col: "n", name: "year" },
  { col: "p", name: "tags" },
];
window.activeFilters = window.activeFilters || [];

/* -------------------------------------------
__
//,, ARCHIVE SETTINGS/
//,,-------------------------------------------*/
let idRow = "u";
let slugRow = "v";
let activeFilterCountToggle = 0;
let expandSign = "⤡";
let closeSign = "x";
const archiveLoadingStartedAt = performance.now();
const archiveLoadingMinimumDuration = 2000;
const archiveLoadingFadeDuration = 250;
const archiveRenderMinimumDuration = 500;
const archiveWelcomeStorageKey = "reelAsianArchiveWelcomeSeen";
// Set this to the URL of the video played whenever the randomizer is spun.
const archiveSpinAnimationSource = "";
let archiveRenderRequestId = 0;

/* -------------------------------------------
__
//,, FILTER STATE
//,,-------------------------------------------*/
const createDefaultFilterState = () =>
  Object.fromEntries(filterCols.map(({ name }) => [name, []]));

const selectedFilters = createDefaultFilterState();
let facetedFilters = createDefaultFilterState();
let activeFilters = [];
let searchQuery = "";
let projectPerPage = 50;

/* -------------------------------------------
__
//,, ARCHIVE STATE
//,,-------------------------------------------*/
const archive = {
  projects: [],
  currentPage: 1,
  perPage: 50,
  viewMode: "grid",
  search: "",
  filters: createDefaultFilterState(),
  filteredProjects: [],
  randomizedProjects: [],
  randomizerTimer: null,
  container: document.querySelector(".tiger"),
  pagination: document.querySelector(".pagination"),
  loading: document.querySelector("#archiveLoading"),
  renderLoading: document.querySelector("#archiveRenderLoading"),
  searchInput: null,
};

function resetFacetedFilters() {
  facetedFilters = createDefaultFilterState();
}

/* -------------------------------------------
__
//,, DATA LOADING AND INITIALIZATION
//,,-------------------------------------------*/
if (data.length) {
  initArchive().catch((error) => {
    console.error("❌ Failed to render archive:", error);
    showArchiveLoadingError();
  });
} else {
  logSheetData();
}

async function logSheetData() {
  try {
    const [sheetData, sheetAssets] = await Promise.all([
      fetchSheet(URLD),
      fetchSheet(URLA),
    ]);

    data = sheetData;
    assets = sheetAssets;
    lookup = createLookup(assets);
    lookupSlug = createSlugLookup(data);

    await initArchive();
  } catch (error) {
    console.error("❌ Failed to load or render archive:", error);
    showArchiveLoadingError();
  }
}

async function initArchive() {
  initFilters();
  archive.searchInput = document.querySelector("#searchInput");
  archive.projects = prepProjects();
  console.log(archive);
  setupEvents();
  updateViewControls();
  updateFilterVisibility();
  await renderArchive();
  updateTigerPadding();
  await hideArchiveLoading();
  showWelcomeDialog();
}

async function hideArchiveLoading() {
  if (!archive.loading) {
    return;
  }

  const elapsed = performance.now() - archiveLoadingStartedAt;
  const remaining = archiveLoadingMinimumDuration - elapsed;

  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }

  archive.loading.setAttribute("aria-busy", "false");
  archive.loading.classList.add("is-fading");
  await new Promise((resolve) =>
    setTimeout(resolve, archiveLoadingFadeDuration),
  );
  archive.loading.hidden = true;
  archive.loading.querySelector("video")?.pause();
}

function showWelcomeDialog() {
  const welcomeDialog = document.querySelector("#archiveWelcome");

  if (!welcomeDialog) {
    return;
  }

  try {
    if (window.localStorage.getItem(archiveWelcomeStorageKey)) {
      return;
    }
  } catch (error) {
    console.error(
      "Failed to check whether the welcome dialog was seen:",
      error,
    );
  }

  welcomeDialog.addEventListener(
    "close",
    () => {
      try {
        window.localStorage.setItem(archiveWelcomeStorageKey, "true");
      } catch (error) {
        console.error("Failed to save the welcome dialog state:", error);
      }
    },
    { once: true },
  );
  welcomeDialog.showModal();
}

function showArchiveLoadingError() {
  if (!archive.loading) {
    return;
  }

  const message = archive.loading.querySelector(".archive-loading__message");

  archive.loading.hidden = false;
  archive.loading.querySelector("video")?.pause();
  archive.renderLoading?.querySelector("video")?.pause();
  if (archive.renderLoading) {
    archive.renderLoading.hidden = true;
  }
  archive.container?.removeAttribute("aria-busy");
  archive.loading.classList.remove("is-fading");
  archive.loading.classList.add("archive-loading--error");
  archive.loading.setAttribute("aria-busy", "false");

  if (message) {
    message.textContent =
      "Unable to load the archive. Please refresh to try again.";
  }
}

/* -------------------------------------------
__
//,, PROJECT PREPARATION AND ARCHIVE RENDERING
//,,-------------------------------------------*/
function prepProjects() {
  return data.map((row) => {
    const project = {
      filters: {},
      searchs: {},
      cardEls: {},
      visible: false,
    };

    filterCols.forEach((column) => {
      project.filters[column.name] = row[column.col]
        ? String(row[column.col])
        : "null";
    });

    searchCols.forEach((column) => {
      project.searchs[column.name] = row[column.col]
        ? String(row[column.col])
        : "null";
    });

    cardCols.forEach((column) => {
      project.cardEls[column.name] = row[column.col]
        ? String(row[column.col])
        : "null";
    });

    project.thumbnail = getThumbnail(row).src;
    project.year = row.n;
    project.desc = row.e;
    project.slug = row.v;
    project.title = row.a;

    return project;
  });
}

async function renderArchive() {
  if (!archive.container) {
    return;
  }

  const requestId = ++archiveRenderRequestId;
  if (archive.renderLoading) {
    archive.renderLoading.hidden = false;
    const video = archive.renderLoading.querySelector("video");
    if (video && (video.hasAttribute("src") || video.querySelector("source"))) {
      video.play().catch((error) => {
        console.error("Unable to play the archive render animation:", error);
      });
    }
  }
  archive.container.setAttribute("aria-busy", "true");

  resetFacetedFilters();

  const filteredProjects = getFilteredProjects();
  archive.filteredProjects = filteredProjects;
  updateCounter(filteredProjects.length);
  updateFilterActive(archive.filters);

  const totalPages = Math.ceil(filteredProjects.length / archive.perPage);
  archive.currentPage = Math.max(
    1,
    Math.min(archive.currentPage, totalPages || 1),
  );
  archive.container.setAttribute("data-view", archive.viewMode);

  await new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(resolve)),
  );

  if (requestId !== archiveRenderRequestId) {
    return;
  }

  const renderStartedAt = performance.now();
  const pageProjects = getCurrentPage(filteredProjects);
  renderCards(pageProjects);
  renderPagination(archive.viewMode === "random" ? 0 : totalPages);
  updateFilterVisibility();

  const remainingDuration =
    archiveRenderMinimumDuration - (performance.now() - renderStartedAt);
  if (remainingDuration > 0) {
    await new Promise((resolve) => setTimeout(resolve, remainingDuration));
  }

  if (requestId === archiveRenderRequestId) {
    if (archive.renderLoading) {
      archive.renderLoading.hidden = true;
      archive.renderLoading.querySelector("video")?.pause();
    }
    archive.container.removeAttribute("aria-busy");
  }
}

function requestArchiveRender() {
  renderArchive().catch((error) => {
    console.error("❌ Failed to render archive:", error);
    showArchiveLoadingError();
  });
}

function updateViewControls() {
  document.querySelectorAll("[data-view-control]").forEach((control) => {
    control.hidden = control.dataset.viewControl !== archive.viewMode;
  });

  const gridSlider = document.querySelector("#gridSlider");
  const rowSlider = document.querySelector("#rowSlider");
  if (gridSlider && archive.container) {
    archive.container.style.setProperty("--grid-columns", gridSlider.value);
  }

  if (rowSlider && archive.container) {
    updateListRowSize(rowSlider.value);
  }
}

function updateListRowSize(size) {
  if (!archive.container) {
    return;
  }

  archive.container.style.setProperty("--list-row-size", `${size}px`);
  archive.container.classList.toggle("is-compact-rows", Number(size) <= 100);
  archive.container.dataset.rowSize = size;
}

function updateFilterVisibility() {
  const filterParent = document.querySelector(".filter--parent");
  const shouldHide = archive.viewMode === "random";

  filterParent?.classList.toggle("is-view-hidden", shouldHide);
}

function setupViewSliders() {
  const gridSlider = document.querySelector("#gridSlider");
  const gridValue = document.querySelector("#gridValue");
  /* -------------------- */
  gridSlider?.addEventListener("input", () => {
    archive.container?.style.setProperty("--grid-columns", gridSlider.value);
    if (gridValue) {
      gridValue.textContent = gridSlider.value;
    }
  });

  const rowSlider = document.querySelector("#rowSlider");
  const rowValue = document.querySelector("#rowValue");
  /* -------------------- */
  rowSlider?.addEventListener("input", () => {
    updateListRowSize(rowSlider.value);
    if (rowValue) {
      rowValue.textContent = rowSlider.value;
    }
  });
}

/* -------------------------------------------
__
//,, SEARCH AND FILTER MATCHING
//,,-------------------------------------------*/
function getFilteredProjects() {
  return archive.projects.filter((project) => {
    const matches = matchesFilters(project) && matchesSearch(project);

    if (matches) {
      updateFaceted(project);
    }

    return matches;
  });
}

function matchesFilters(project) {
  return Object.entries(archive.filters).every(([group, values]) => {
    if (!values || values.length === 0) return true;
    return values.every((value) => project.filters[group].includes(value));
  });
}

function matchesSearch(project) {
  if (!archive.search) {
    return true;
  }

  return searchCols.some((column) =>
    project.searchs[column.name]
      ?.toLowerCase()
      .includes(archive.search.toLowerCase()),
  );
}

/* -------------------------------------------
__
//,, FILTER DISPLAY AND CONTROLS
//,,-------------------------------------------*/
function updateFilterActive(filters) {
  const activeContainer = document.querySelector(".filter__actives");

  if (!activeContainer) {
    return;
  }

  activeContainer.innerHTML = "";

  const markup = Object.entries(filters)
    .map(([group, values]) =>
      values
        .map(
          (filterValue) => `
            <button class="filter__actives__item" data-group="${group}" data-filter="${filterValue}">
              <span>×</span>${filterValue}
            </button>
          `,
        )
        .join(""),
    )
    .join("");

  activeContainer.append(createHTMLfragment(markup));
}

function toggleFilterSearch() {
  toggleSearchBar("toggle");
}

function toggleSearchBar(state) {
  const filterParent = document.querySelector(".filter--parent");
  const collapseButton = document.querySelector(".filter__clps");
  // const hideButton = document.querySelector(".filter__hide");
  const backDrop = document.querySelector(".filter__backdrop");
  if (!filterParent || !collapseButton || !backDrop) {
    return;
  }
  filterParent.classList[state]("active");
  collapseButton.classList[state]("active");
  // hideButton.classList.toggle("active");
  backDrop.classList[state]("active");

  const isOpen = collapseButton.classList.contains("active");
  collapseButton.innerHTML = `<span class="${isOpen ? "active" : ""}">${isOpen ? closeSign : expandSign}</span>${isOpen ? "Close Search" : "Open Search Bar"}`;
}
function activeFilterSearch() {
  toggleSearchBar("add");
}

function removeFilterActive(group, value) {
  const activeButton = document.querySelector(
    `.filtermenu__item[data-group="${group}"][data-value="${value}"]`,
  );

  if (activeButton) {
    activeButton.classList.remove("active");
  }
}

function updateCounter(count) {
  const counter = document.querySelector("#filterCount");

  if (counter) {
    counter.textContent = String(count);
  }
}

function updateFaceted(card) {
  Object.entries(card.filters).forEach(([group, values]) => {
    facetedFilters[group] ??= [];

    const items = String(values)
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value && value !== "null");

    items.forEach((value) => {
      if (!facetedFilters[group].includes(value)) {
        facetedFilters[group].push(value);
      }
    });
  });
}

function updateTigerPadding() {
  const tiger = document.querySelector(".tiger");
  const header = document.querySelector(".header");

  if (!tiger || !header) {
    return;
  }

  tiger.style.paddingTop = `${header.offsetHeight}px`;
}

/* -------------------------------------------
__
//,, FILTER STATE ACTIONS
//,,-------------------------------------------*/
function setFilter(group, value, active) {
  if (!archive.filters[group]) {
    archive.filters[group] = [];
  }

  if (active) {
    if (!archive.filters[group].includes(value)) {
      archive.filters[group].push(value);
    }
  } else {
    archive.filters[group] = archive.filters[group].filter(
      (item) => item !== value,
    );
  }

  if (archive.filters[group].length === 0) {
    delete archive.filters[group];
  }

  archive.currentPage = 1;
  requestArchiveRender();
}

function clearFilters() {
  const searchInput = document.querySelector("#searchInput");

  if (searchInput) {
    searchInput.value = "";
  }

  archive.search = "";
  archive.currentPage = 1;
  restoreFilters();
  restoreF();
  requestArchiveRender();
  updateFilterZero();
}

function setPerPage(amount) {
  archive.perPage = amount;
  archive.currentPage = 1;
  requestArchiveRender();
}

function updateFilterZero() {
  const filterItems = document.querySelectorAll(".filtermenu__item");

  filterItems.forEach((filter) => {
    const group = filter.dataset.group;
    const value = filter.dataset.value;
    const isAvailable = facetedFilters[group]?.includes(value);

    filter.classList.toggle("zero", !isAvailable);
  });
}

/* -------------------------------------------
__
//,, EVENT HANDLERS
//,,-------------------------------------------*/
function setupEvents() {
  const howToLink = document.querySelector("#howToLink");
  const howToDialog = document.querySelector("#howToDialog");
  const howToClose = document.querySelector("#howToClose");

  howToLink?.addEventListener("click", (event) => {
    event.preventDefault();
    howToDialog?.showModal();
  });

  howToClose?.addEventListener("click", () => {
    howToDialog?.close();
  });

  howToDialog?.addEventListener("click", (event) => {
    if (event.target === howToDialog) {
      howToDialog.close();
    }
  });

  if (archive.container) {
    /* -------------------- */
    archive.container.addEventListener("click", (event) => {
      /* -------------------- */
      const spinButton = event.target.closest("[data-action='spin']");
      if (spinButton) {
        spinRandomizer();
        return;
      }

      /* -------------------- */
      const card = event.target.closest(".archivecard__container");

      if (!card) {
        return;
      }

      const slug = card.dataset.slug;

      if (!slug) {
        return;
      }

      window.location.href = `/orbit-archivepage#${slug}`;
    });
  }

  const viewButtons = document.querySelector(".viewbtn--container");
  if (viewButtons) {
    /* -------------------- */
    viewButtons.addEventListener("click", (event) => {
      /* -------------------- */
      const viewButton = event.target.closest(".view__btn[data-view]");
      if (!viewButton) {
        return;
      }

      archive.viewMode = viewButton.dataset.view;
      archive.randomizedProjects = [];
      cancelRandomizerSpin();

      viewButtons
        .querySelectorAll(".view__btn[data-view]")
        .forEach((button) => {
          const isActive = button === viewButton;
          button.classList.toggle("active", isActive);
          button.setAttribute("aria-pressed", String(isActive));
        });

      updateViewControls();
      updateFilterVisibility();
      updateTigerPadding();
      requestArchiveRender();
    });
  }

  const filterContainer = document.querySelector(".header");

  if (filterContainer) {
    /* -------------------- */
    filterContainer.addEventListener("click", (event) => {
      /* -------------------- */
      const filterBtn = event.target.closest(".filtermenu__item");

      if (filterBtn) {
        event.preventDefault();
        restoreF();

        const filterCat = filterBtn.dataset.value;
        const filterGroup = filterBtn.dataset.group;
        const isActive = filterBtn.classList.contains("active");

        if (isActive) {
          archive.filters[filterGroup] = (
            archive.filters[filterGroup] || []
          ).filter((item) => item !== filterCat);
          activeFilters = activeFilters.filter((item) => item !== filterCat);
        } else {
          archive.filters[filterGroup] = [
            ...(archive.filters[filterGroup] || []),
            filterCat,
          ];
          activeFilters.push(filterCat);
        }

        filterBtn.classList.toggle("active", !isActive);
        requestArchiveRender();
        updateFilterZero();
        return;
      }

      /* -------------------- */
      const filterToggleBtn = event.target.closest(".filter__toggles--btn");
      if (filterToggleBtn) {
        const group = filterToggleBtn.dataset.group;
        const menu = document.querySelector(
          `.filtermenu[data-group="${group}"]`,
        );

        if (menu) {
          const isSelected = filterToggleBtn.classList.contains("selected");
          menu.classList.toggle("active", !isSelected);
          filterToggleBtn.classList.toggle("active", !isSelected);

          if (menu.classList.contains("active")) {
            activeFilterCountToggle += 1;
          } else {
            activeFilterCountToggle = Math.max(0, activeFilterCountToggle - 1);
          }

          setColumns(activeFilterCountToggle);
        }
        return;
      }

      /* -------------------- */
      const filterGroupButton = event.target.closest(".filtermenu__group--btn");
      if (filterGroupButton) {
        const group = filterGroupButton.dataset.group;
        const tri = filterGroupButton.querySelector(".tri");
        const filterMenu = document.querySelector(
          `.filtermenu__items[data-group="${group}"]`,
        );

        if (filterMenu) {
          const isOpen = filterMenu.classList.toggle("active");
          filterGroupButton.classList.toggle("active", isOpen);

          if (tri) {
            tri.textContent = isOpen ? "▲" : "▼";
          }
        }

        return;
      }

      /* -------------------- */
      const filterCollapseButton = event.target.closest(".filter__clps");
      if (filterCollapseButton) {
        toggleFilterSearch();
        return;
      }

      /* -------------------- */
      const filterClearButton = event.target.closest(".filter__clear");
      if (filterClearButton) {
        clearFilters();
        return;
      }

      const filterParent = event.target.closest(".filter__grid");
      if (filterParent) {
        const activeFilterButton = event.target.closest(
          ".filter__actives__item",
        );
        if (!activeFilterButton) activeFilterSearch();
      }
      /* -------------------- */
      const activeFilterButton = event.target.closest(".filter__actives__item");
      if (activeFilterButton) {
        const filterGroup = activeFilterButton.dataset.group;
        const filterCat = activeFilterButton.dataset.filter;

        archive.filters[filterGroup] = (
          archive.filters[filterGroup] || []
        ).filter((item) => item !== filterCat);
        removeFilterActive(filterGroup, filterCat);
        requestArchiveRender();
        updateFilterZero();
        return;
      }

      /* -------------------- */
      const hideFilterButton = event.target.closest(".filter__hide");
      if (hideFilterButton) {
        const tempGrid = document.querySelector(".filter__grid");
        if (tempGrid) {
          tempGrid.classList.toggle("collapse");
          const isCollapsed = tempGrid.classList.contains("collapse");
          hideFilterButton.innerHTML = isCollapsed
            ? "<span>🫣</span>Show Search Bar"
            : "<span>🫣</span>Hide Search Bar";
        }
      }

      const filterBackDrop = event.target.closest(".filter__backdrop");
      if (filterBackDrop) toggleFilterSearch();
    });

    /* -------------------- */
    filterContainer.addEventListener("focusin", (event) => {
      /* -------------------- */
      const searchInput = event.target.closest("#searchInput");

      if (searchInput) {
        activeFilterSearch();
      }
    });

    /* -------------------- */
    filterContainer.addEventListener("keydown", (event) => {
      /* -------------------- */
      const searchInput = event.target.closest("#searchInput");

      if (!searchInput) {
        return;
      }

      if (event.key === "Enter" || event.key === "Escape") {
        event.preventDefault();
        toggleFilterSearch();
        searchInput.blur();
      }
    });
  }

  /* -------------------- */
  setupViewSliders();

  if (archive.pagination) {
    /* -------------------- */
    archive.pagination.addEventListener("click", (event) => {
      /* -------------------- */
      const pageButton = event.target.closest("[data-page]");

      if (pageButton) {
        archive.currentPage = Number(pageButton.dataset.page);
        requestArchiveRender();
        return;
      }

      /* -------------------- */
      const actionButton = event.target.closest("[data-page-action]");

      if (!actionButton) {
        return;
      }

      const action = actionButton.dataset.pageAction;

      if (action === "previous") {
        archive.currentPage -= 1;
      } else if (action === "next") {
        archive.currentPage += 1;
      }

      requestArchiveRender();
    });
  }

  if (archive.searchInput) {
    /* -------------------- */
    archive.searchInput.addEventListener("input", (event) => {
      archive.search = event.target.value;
      archive.currentPage = 1;
      requestArchiveRender();
    });
  }
}

/* -------------------------------------------
__
//,, FILTER MENU GENERATION
//,,-------------------------------------------*/
function initFilters() {
  filterItems = [];

  filterCols.forEach((column) => {
    filterItems.push({
      group: column.name,
      id: `f-${column.col}`,
      data: getAllFilters(column.col),
    });
  });

  generateFilters();
}

function getAllFilters(columnKey) {
  return [
    ...new Set(
      data.flatMap((item) => {
        const value = item[columnKey];

        if (!value) {
          return [];
        }

        return String(value)
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag && tag !== "null");
      }),
    ),
  ].sort();
}

function generateFilters() {
  const filterContainer = document.querySelector(".filter--container");

  if (!filterContainer) {
    return;
  }

  const allFilters = filterItems
    .map((filterDef, index) => {
      const itemsHTML = filterDef.data
        .map(
          (item) => `
            <div class="filtermenu__item ${filterDef.id}" data-group="${filterDef.group}" data-value="${item.trim()}">
              ${item}
            </div>
          `,
        )
        .join("");

      return `
        <div class="filtermenu" data-group="${filterDef.group}">
          <div class="filtermenu--container">
            <div>
              <button class="filtermenu__group--btn" data-group="${filterDef.group}">
                ${filterCols[index].name}<span class="tri">▼</span>
              </button>
            </div>
            <div class="filtermenu__items" data-group="${filterDef.group}">
              ${itemsHTML}
            </div>
          </div>
        </div>
      `;
    })
    .join("");

  const filterToggles = filterItems
    .map(
      (filterDef) => `
        <button class="filter__toggles--btn" data-group="${filterDef.group}">
          ${filterDef.group}
        </button>
      `,
    )
    .join("");

  const tempuseltaer = `<button class="filter__hide button-default active">
          <span>🫣</span>Hide Search Bar
        </button>
    `;

  const filterMarkup = /* HTML */ `
    <div class="filter__grid">
      <div class="filter__search">
        <div class="filter__search--container">
          <input
            id="searchInput"
            type="text"
            placeholder="Search..."
            autocomplete="off"
          />
          <span class="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="10.5" cy="10.5" r="6.5"></circle>
              <path d="M15.5 15.5L21 21"></path>
            </svg>
          </span>
        </div>
        <div class="filter__search--info">
          <p>Try searching up a name, genre or keyword</br>Here are some examples to start:</p>

          <ul>
            <li>Comedy</li>
            <li>Spotlight Artist</li>
            <li>Operational Material</li>
            <li>Review</li>
          </ul>
        </div>
      </div>
      <div class="filters--parent active">
        <div class="filter__actives--container">
          <div class="filter__actives"></div>
        </div>
        <div class="filters--container active">${allFilters}</div>
      </div>
      <div class="filter__count">
        <span id="filterCount" class="font-terminal">0</span>
      </div>
    </div>
  `;

  filterContainer.append(createHTMLfragment(filterMarkup));
}

/* -------------------------------------------
__
//,, CARD AND PAGINATION RENDERING
//,,-------------------------------------------*/
function getCurrentPage(projects) {
  const start = (archive.currentPage - 1) * archive.perPage;
  return projects.slice(start, start + archive.perPage);
}

function renderCards(projects) {
  if (!archive.container) {
    return;
  }

  archive.container.replaceChildren();

  if (archive.viewMode === "random") {
    renderRandomizer(archive.filteredProjects);
    return;
  }

  const fragment = document.createDocumentFragment();

  projects.forEach((project) => {
    fragment.append(createCard(project, archive.viewMode));
  });

  archive.container.append(fragment);
}

function renderRandomizer(projects) {
  if (
    archive.randomizedProjects.some((project) => !projects.includes(project))
  ) {
    archive.randomizedProjects = [];
  }

  const machine = document.createElement("section");
  machine.className = "archive-slot-machine";
  machine.setAttribute("aria-label", "Random project picker");

  const animation = document.createElement("video");
  animation.className = "archive-slot-machine__animation";
  animation.setAttribute("aria-hidden", "true");
  animation.muted = true;
  animation.playsInline = true;
  animation.preload = "none";
  animation.hidden = true;
  machine.append(animation);

  const spinButton = document.createElement("button");
  const isSpinning = Boolean(archive.randomizerTimer);
  spinButton.type = "button";
  spinButton.className = "archive-slot-machine__spin";
  spinButton.dataset.action = "spin";
  spinButton.textContent = isSpinning
    ? "Spinning..."
    : projects.length
      ? "Spin for a project"
      : "No projects to spin";
  spinButton.disabled = isSpinning || projects.length === 0;
  machine.classList.toggle("is-spinning", isSpinning);
  animation.hidden = !isSpinning || !archiveSpinAnimationSource;
  machine.append(spinButton);

  const reels = document.createElement("div");
  reels.className = "archive-slot-machine__reels";
  reels.setAttribute("aria-live", "polite");

  if (archive.randomizedProjects.length > 0) {
    archive.randomizedProjects.forEach((project, index) => {
      const reel = document.createElement("div");
      reel.className = "archive-slot-machine__reel";
      reel.setAttribute("aria-label", `Random pick ${index + 1}`);
      reel.append(createCard(project, archive.viewMode));
      reels.append(reel);
    });
  } else if (projects.length > 0) {
    for (let index = 0; index < Math.min(3, projects.length); index += 1) {
      const reel = document.createElement("div");
      reel.className =
        "archive-slot-machine__reel archive-slot-machine__symbol";
      reel.setAttribute("aria-hidden", "true");
      reel.textContent = "✦";
      reels.append(reel);
    }
  } else {
    const prompt = document.createElement("p");
    prompt.className = "archive-slot-machine__prompt";
    prompt.textContent = "No projects match the current search and filters.";
    reels.append(prompt);
  }

  machine.append(reels);
  archive.container.append(machine);
}

function spinRandomizer() {
  if (!archive.filteredProjects.length || archive.randomizerTimer) {
    return;
  }

  const machine = archive.container?.querySelector(".archive-slot-machine");
  const spinButton = machine?.querySelector("[data-action='spin']");
  if (!machine || !spinButton) {
    return;
  }

  machine.classList.add("is-spinning");
  spinButton.disabled = true;
  spinButton.textContent = "Spinning...";

  const animation = machine.querySelector(".archive-slot-machine__animation");
  if (archiveSpinAnimationSource && animation) {
    animation.hidden = false;
    animation.src = archiveSpinAnimationSource;
    animation.currentTime = 0;
    animation.load();
    animation.onended = finishRandomizerSpin;
    animation.onerror = () => {
      console.error("Unable to load the randomizer video animation.");
      finishRandomizerSpin();
    };
    animation.play().catch((error) => {
      console.error("Unable to play the randomizer video animation:", error);
      finishRandomizerSpin();
    });
  }

  archive.randomizerTimer = window.setTimeout(
    () => {
      finishRandomizerSpin();
    },
    archiveSpinAnimationSource ? 15000 : 1200,
  );
}

function finishRandomizerSpin() {
  if (!archive.randomizerTimer || archive.viewMode !== "random") {
    return;
  }

  window.clearTimeout(archive.randomizerTimer);
  archive.randomizerTimer = null;
  archive.randomizedProjects = pickRandomProjects(archive.filteredProjects, 3);
  requestArchiveRender();
}

function cancelRandomizerSpin() {
  window.clearTimeout(archive.randomizerTimer);
  archive.randomizerTimer = null;

  const animation = archive.container?.querySelector(
    ".archive-slot-machine__animation",
  );
  if (animation) {
    animation.pause();
    animation.removeAttribute("src");
    animation.load();
  }
}

function pickRandomProjects(projects, count) {
  const remaining = [...projects];
  const picks = [];

  while (remaining.length > 0 && picks.length < count) {
    const index = Math.floor(Math.random() * remaining.length);
    picks.push(remaining.splice(index, 1)[0]);
  }

  return picks;
}

function createCard(project, view) {
  const card = document.createElement("article");
  card.className = `archivecard__container archivecard--${view}`;
  card.dataset.slug = project.slug;
  card.dataset.title = project.title;

  if (view == "grid" || view == "random") {
    card.innerHTML = /* HTML */ `
      <div class="infocard__title">${project.title}</div>
      <div class="infocard">
        <div class="infocard__tags">
          <div class="infocard__tags--header">festival year</div>
          <div>${project.year ? project.year : ""}</div>
        </div>
        <div class="infocard__tags">
          <div class="infocard__tags--header">credits</div>
          <div>
            ${project.cardEls.Credits != "null" ? project.cardEls.Credits : ""}
          </div>
        </div>
      </div>

      <div class="infocard__des">${project.desc ? project.desc : ""}</div>
      <div class="thumbnail__container">
        ${project.thumbnail
          ? `<img class="thumbnail__img" src="${project.thumbnail}" alt="" decoding="async">`
          : ""}
      </div>
    `;
  } else if (view == "list") {
    let mediums = project.filters.medium;
    if (mediums == "null") mediums = null;
    if (mediums) {
      mediums = mediums.split(",").map((value) => value.trim());
      mediums = mediums
        .map(
          (value) => `
          <div class="infocard__medium">${value}</div>        
        `,
        )
        .join("");
    }
    card.innerHTML = /* HTML */ `
      <div class="thumbnail__container">
        ${project.thumbnail
          ? `<img class="thumbnail__img" src="${project.thumbnail}" alt="" decoding="async">`
          : ""}
      </div>
      <div class="archivecard__list-main">
        <div class="infocard__title">${project.title}</div>
        <div class="infocard__des">${project.desc ? project.desc : ""}</div>
      </div>
      <div class="archivecard__list--container">
        <div class="infocard__tags--header">Medium</div>
        <div
          class="archivecard__list-medium"
          style="display: ${mediums ? "flex" : "none"}"
        >
          ${mediums ? mediums : ""}
        </div>
      </div>

      <div class="archivecard__list-meta">
        <div class="infocard__tags">
          <div class="infocard__tags--header">Festival year</div>
          <div>${project.year ? project.year : ""}</div>
        </div>
        <div class="infocard__tags">
          <div class="infocard__tags--header">Credits</div>
          <div class="archivecard__list-credits">
            ${project.cardEls.Credits != "null" ? project.cardEls.Credits : ""}
          </div>
        </div>
      </div>
    `;
  } else if (view == "random") {
  }
  return card;
}

function renderPagination(totalPages) {
  if (!archive.pagination) {
    return;
  }

  archive.pagination.replaceChildren();

  if (totalPages <= 1) {
    return;
  }

  const fragment = document.createDocumentFragment();

  const previous = document.createElement("button");
  previous.type = "button";
  previous.className = "pagination__previous";
  previous.dataset.pageAction = "previous";
  previous.textContent = "Previous Page";
  previous.disabled = archive.currentPage === 1;
  fragment.append(previous);

  for (let page = 1; page <= totalPages; page += 1) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pagination__page";
    button.dataset.page = page;
    button.textContent = page;

    if (page === archive.currentPage) {
      button.classList.add("active");
      button.setAttribute("aria-current", "page");
    }

    fragment.append(button);
  }

  const next = document.createElement("button");
  next.type = "button";
  next.className = "pagination__next";
  next.dataset.pageAction = "next";
  next.textContent = "Next Page";
  next.disabled = archive.currentPage === totalPages;
  fragment.append(next);

  archive.pagination.append(fragment);
}

/* -------------------------------------------
__
//,, FILTER RESET AND LAYOUT HELPERS
//,,-------------------------------------------*/
function restoreFilters() {
  archive.filters = createDefaultFilterState();
  activeFilters = [];
  const allFilterButtons = document.querySelectorAll(".filtermenu__item");

  allFilterButtons.forEach((button) => {
    button.classList.remove("active");
  });
}

function restoreF() {
  facetedFilters = createDefaultFilterState();
}

function updateWindowWidth() {
  /* -------------------- */
  window.addEventListener("resize", () => {
    window.windowWidth = window.innerWidth;
  });
}

function setColumns(count) {
  const grid = document.querySelector(".filtermenu--container.active");

  if (!grid) {
    return;
  }

  grid.style.setProperty("--active-columns", String(count));
  grid.style.justifyItems = count === 1 ? "start" : "center";
}

/* -------------------------------------------
__
//,, SPREADSHEET DATA HELPERS
//,,-------------------------------------------*/
async function fetchSheet(url) {
  const response = await fetch(url);
  const text = await response.text();
  const jsonString = text.substring(
    text.indexOf("{") || view == "random",
    text.lastIndexOf("}") + 1,
  );
  const json = JSON.parse(jsonString);
  return json.table.rows.map((row) => {
    const obj = {};
    for (let i = 0; i < row.c.length; i++) {
      obj[String.fromCharCode(97 + i)] = row.c[i] ? row.c[i].v : null;
    }
    return obj;
  });
}
//look up for finding the assets
function createLookup(sheet2Data) {
  return Object.fromEntries(sheet2Data.map((row) => [row.a, row]));
}
//create slug lookup
function createSlugLookup(sheetData) {
  return Object.fromEntries(sheetData.map((row) => [row.v, row]));
}
//html helpers
function createFromHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}
function createHTMLfragment(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content;
}
function getThumbnail(row) {
  if (row[idRow] == null)
    return {
      src: noImageThumbnail,
      alt_text: null,
    };
  let t = parseToObjects(row[idRow]);
  let link = lookup[t[0].value];
  if (link == null) {
    console.log("No asset found for id: " + t[0].value);
    return {
      src: noImageThumbnail,
      alt_text: null,
    };
  } else {
    return { src: link.d ? link.d : null, alt_text: link.f };
  }
}
function parseToObjects(text) {
  const lines = text.split("\n"); // works even if no \n
  return lines
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      if (line.includes(":")) {
        const [key, ...rest] = line.split(":");
        return { [key.trim()]: rest.join(":").trim() };
      }
      return { value: line };
    });
}
function restoreFilters() {
  archive.filters = createDefaultFilterState();
  activeFilters = [];
  tempC = document.querySelectorAll(".filtermenu__item");
  tempC.forEach((c) => c.classList.remove("active"));
}
function restoreF() {
  facetedFilters = createDefaultFilterState();
}
// event for updating the window width?
function updateWindowWidth() {
  /* -------------------- */
  window.addEventListener("resize", () => {
    windowWidth = window.innerWidth;
  });
}

function setColumns(count) {
  const grid = document.querySelector(".filtermenu--container.active");
  // grid.style.setProperty("--active-columns", count);
  // grid.style.justifyItems = count === 1 ? "start" : "center";
}
