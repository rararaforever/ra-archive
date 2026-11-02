window.pageMap = window.pageMap || [
  { col: "a", name: "title" },
  { col: "f", name: "accessibility level" },
  { col: "b", name: "Credits" },
  { col: "e", name: "Description of Work" },
  { col: "g", name: "date of creation" },
  { col: "h", name: "submitter" },
  { col: "i", name: "medium" },
  { col: "j", name: "programme" },
  { col: "k", name: "country" },
  { col: "l", name: "Language of Video" },
  { col: "m", name: "File Type" },
  { col: "n", name: "Festival Year" },
  { col: "p", name: "tags" },
  { col: "o", name: "hidden tags" },
  { col: "q", name: "date submitted" },
  { col: "r", name: "Copy Right Credit" },
  { col: "t", name: "Storage Location" },
];

window.slug = window.location.hash.substring(1);
window.ele_tiger = document.querySelector(".tiger");
window.data = window.data || [];
window.assets = window.assets || [];
window.lookup = window.lookup || {};
window.lookupSlug = window.lookupSlug || {};

window.SPREADSHEET_ID =
  window.SPREADSHEET_ID || "1dqC7mhxzCJ5J8cfv4TS_ihnBU-he_c3Z9z82AGH4y88";
window.SHEET_TITLE = window.SHEET_TITLE || "ALL";
window.SHEET_ASSETS = window.SHEET_ASSETS || "Assets";
window.URLD = `https://docs.google.com/spreadsheets/d/${window.SPREADSHEET_ID}/gviz/tq?sheet=${window.SHEET_TITLE}`;
window.URLA = `https://docs.google.com/spreadsheets/d/${window.SPREADSHEET_ID}/gviz/tq?sheet=${window.SHEET_ASSETS}`;

async function fetchSheet(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Sheet request failed (${response.status}): ${url}`);
  }

  const text = await response.text();
  const jsonString = text.substring(
    text.indexOf("{"),
    text.lastIndexOf("}") + 1,
  );
  const json = JSON.parse(jsonString);

  return json.table.rows.map((row) =>
    Object.fromEntries(
      row.c.map((cell, index) => [
        String.fromCharCode(97 + index),
        cell ? cell.v : null,
      ]),
    ),
  );
}

async function logSheetData() {
  try {
    const [data, assets] = await Promise.all([
      fetchSheet(window.URLD),
      fetchSheet(window.URLA),
    ]);

    window.data = data;
    window.assets = assets;
    window.lookup = createLookup(assets);
    window.lookupSlug = createSlugLookup(data);
    generatePage();
  } catch (error) {
    console.error("Failed to load archive page data:", error);
    showPageError(
      "Unable to load this archive entry. Please refresh to try again.",
    );
  }
}

function generatePage() {
  const row = window.lookupSlug[window.slug];
  console.log(`Generating archive page for slug "${window.slug}".`, row);
  if (!row) {
    console.error(`No archive entry found for slug "${window.slug}".`);
    showPageError("This archive entry could not be found.");
    return;
  }

  if (!window.ele_tiger) {
    throw new Error("Archive page requires a .tiger container.");
  }

  const titleField = window.pageMap.find((field) => field.col === "a");
  const accessibilityField = window.pageMap.find((field) => field.col === "f");
  const page = createHTML(`
    <article class="archive-detail archivecard__container" data-slug="">
      <header class="archive-detail__header">
        <h1 class="archive-detail__title"></h1>
      </header>
      <section class="archive-detail__accessibility">
        <h2></h2>
        <p></p>
      </section>
      <dl class="archive-detail__info"></dl>
      <section class="archive-detail__media"></section>
      <nav class="archive-detail__links" aria-label="Original source links" hidden>
        <h2>Original links</h2>
        <ul></ul>
      </nav>
    </article>
  `);

  page.dataset.slug = String(row.v || "");
  page.querySelector(".archive-detail__title").textContent =
    row[titleField?.col || "a"] || "Untitled";

  if (accessibilityField && row[accessibilityField.col]) {
    page.querySelector(".archive-detail__accessibility h2").textContent =
      accessibilityField.name;
    page.querySelector(".archive-detail__accessibility p").textContent =
      row[accessibilityField.col];
  } else {
    page.querySelector(".archive-detail__accessibility").remove();
  }

  const infoList = page.querySelector(".archive-detail__info");
  window.pageMap
    .filter(
      (field) =>
        field.col !== titleField?.col &&
        field.col !== accessibilityField?.col &&
        hasValue(row[field.col]),
    )
    .forEach((field) => {
      const info = createHTML(`
        <div class="archive-detail__field">
          <dt></dt>
          <dd></dd>
        </div>
      `);
      info.querySelector("dt").textContent = field.name;
      info.querySelector("dd").textContent = String(row[field.col]);
      infoList.append(info);
    });

  const type = String(row.w || "")
    .trim()
    .toLowerCase();
  const types = row.w;

  console.log(
    `Generating archive page for slug "${window.slug}" with type "${types}".`,
  );
  const media = page.querySelector(".archive-detail__media");
  const sourceIds = parseAssetIds(row.u);
  const assets = getAssets(sourceIds);

  switch (type) {
    case "gallery":
      media.append(createCarousel(assets, "image", "Gallery"));
      break;
    case "audio":
      media.append(createCarousel(assets, "audio", "Audio"));
      break;
    case "pdf":
      assets.forEach((asset, index) => {
        const source = getAssetSource(asset);
        if (!source) {
          console.warn(`No valid PDF URL found for asset "${asset.a}".`);
          return;
        }

        const frame = createHTML(`
          <iframe class="archive-detail__pdf" loading="lazy"></iframe>
        `);
        frame.src = source;
        frame.title = asset.b || `PDF document ${index + 1}`;
        media.append(frame);
      });
      break;
    case "link": {
      const linkAssets = parseAssetIds(row.x)
        .map((assetId, index) => ({
          id: assetId,
          asset: window.lookup[assetId],
          index,
        }))
        .filter(({ id, asset }) => {
          if (!asset) {
            console.warn(`No asset found for archive link "${id}".`);
            return false;
          }
          return true;
        });

      linkAssets.forEach(({ id, asset, index }) => {
        const thumbnailUrl = safeHttpUrl(asset.e);
        if (thumbnailUrl) {
          const preview = createHTML(`
            <figure class="archive-detail__link-preview">
              <a class="archive-detail__link-image" target="_blank" rel="noopener noreferrer">
                <img class="archive-detail__link-thumbnail" alt="" loading="lazy">
              </a>
              <figcaption class="archive-detail__image-description"></figcaption>
            </figure>
          `);
          const anchor = preview.querySelector("a");
          const image = preview.querySelector("img");
          const linkAsset = window.lookup[sourceIds[index]];
          const source = safeHttpUrl(linkAsset?.c);
          if (source) {
            anchor.href = source;
            anchor.setAttribute("aria-label", `Open Link ${index + 1}`);
          } else {
            anchor.replaceWith(image);
          }
          image.src = thumbnailUrl;
          image.alt = asset.f || asset.b || `Preview for Link ${index + 1}`;
          preview.querySelector(
            ".archive-detail__image-description",
          ).textContent = asset.g || "";
          if (!asset.g) {
            preview
              .querySelector(".archive-detail__image-description")
              .remove();
          }
          media.append(preview);
        } else {
          console.warn(`No thumbnail URL found for archive link "${id}".`);
        }
      });
      break;
    }
    case "video": {
      const videoAsset = assets.find((asset) => getAssetSource(asset));
      const source = videoAsset && getAssetSource(videoAsset);
      const embedUrl = source && getVideoEmbedUrl(source);
      console.log(
        `Generating video embed for slug "${window.slug}" with source "${embedUrl}".`,
      );
      if (embedUrl) {
        const frame = createHTML(`
          <iframe
            class="archive-detail__video"
            title=""
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        `);
        frame.src = embedUrl;
        frame.title = videoAsset?.b || "Archive video";
        media.append(frame);
      } else {
        console.warn("No supported YouTube or Vimeo URL found for this video.");
      }
      break;
    }
    default:
      media.remove();
  }

  if (media.childElementCount === 0) {
    media.remove();
  }

  const links = page.querySelector(".archive-detail__links");
  const linkList = links.querySelector("ul");
  const linkIds =
    type === "link" || type === "pdf" || type === "video" ? sourceIds : [];
  let linkNumber = 0;
  linkIds.forEach((assetId) => {
    const asset = window.lookup[assetId];
    const source = safeHttpUrl(asset?.c);
    if (!asset) {
      console.warn(`No asset found for original link "${assetId}".`);
      return;
    }
    if (!source) {
      console.warn(`No valid original URL found for asset "${assetId}".`);
      return;
    }

    linkNumber += 1;
    const item = createHTML(`
      <li><a target="_blank" rel="noopener noreferrer"></a></li>
    `);
    const anchor = item.querySelector("a");
    anchor.href = source;
    anchor.textContent = `Link ${linkNumber}`;
    linkList.append(item);
  });

  if (linkList.childElementCount === 0) {
    links.remove();
  } else {
    links.hidden = false;
  }

  window.ele_tiger.replaceChildren(page);
}

function createCarousel(assets, mediaType, label) {
  const availableAssets = assets.filter((asset) => getAssetSource(asset));
  if (availableAssets.length === 0) {
    return createHTML(
      `<p class="archive-detail__empty">${label} unavailable.</p>`,
    );
  }

  const carousel = createHTML(`
    <section class="archive-detail__carousel" aria-label="${label}">
      <button class="archive-detail__previous" type="button" aria-label="Previous ${label.toLowerCase()}">Previous</button>
      <div class="archive-detail__carousel-content"></div>
      <button class="archive-detail__next" type="button" aria-label="Next ${label.toLowerCase()}">Next</button>
      <p class="archive-detail__carousel-count" aria-live="polite"></p>
    </section>
  `);
  const content = carousel.querySelector(".archive-detail__carousel-content");
  const previous = carousel.querySelector(".archive-detail__previous");
  const next = carousel.querySelector(".archive-detail__next");
  const count = carousel.querySelector(".archive-detail__carousel-count");
  let currentIndex = 0;

  const showAsset = () => {
    const asset = availableAssets[currentIndex];
    content.replaceChildren();

    if (mediaType === "image") {
      const image = createHTML(`
        <figure class="archive-detail__gallery-figure">
          <button class="archive-detail__gallery-image-button" type="button"></button>
          <figcaption class="archive-detail__image-description"></figcaption>
        </figure>
      `);
      const imageButton = image.querySelector("button");
      const imageElement = createHTML(`
        <img class="archive-detail__gallery-image" alt="" loading="lazy">
      `);
      imageElement.src = getAssetSource(asset);
      imageButton.setAttribute(
        "aria-label",
        `Show next gallery image (${currentIndex + 1} of ${availableAssets.length})`,
      );
      imageButton.append(imageElement);
      imageButton.addEventListener("click", (event) => {
        event.preventDefault();
        advance();
      });
      imageElement.alt =
        asset.h || asset.b || `Gallery image ${currentIndex + 1}`;
      const description = image.querySelector("figcaption");
      description.textContent = asset.g || "";
      if (!asset.g) description.remove();
      content.append(image);
    } else {
      const audio = createHTML(`
        <audio class="archive-detail__audio-player" controls preload="metadata"></audio>
      `);
      audio.src = getAssetSource(asset);
      console.log(audio.src);
      audio.setAttribute("aria-label", asset.b || `Audio ${currentIndex + 1}`);
      content.append(audio);
    }

    count.textContent = `${currentIndex + 1} / ${availableAssets.length}`;
    previous.hidden = availableAssets.length < 2;
    next.hidden = availableAssets.length < 2;
    previous.disabled = currentIndex === 0;
    next.disabled = currentIndex === availableAssets.length - 1;
  };

  previous.addEventListener("click", () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      showAsset();
    }
  });
  next.addEventListener("click", () => {
    advance();
  });

  function advance() {
    if (currentIndex < availableAssets.length - 1) {
      currentIndex += 1;
      showAsset();
    }
  }

  showAsset();
  return carousel;
}

function getVideoEmbedUrl(source) {
  if (typeof source !== "string" || !source.trim()) return null;

  const trimmedSource = source.trim();
  const normalizedSource = trimmedSource.startsWith("//")
    ? `https:${trimmedSource}`
    : /^https?:\/\//i.test(trimmedSource)
      ? trimmedSource
      : `https://${trimmedSource}`;
  const safeSource = safeHttpUrl(normalizedSource);
  if (!safeSource) return null;

  const url = new URL(safeSource);
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
      : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    const id =
      url.searchParams.get("v") ||
      url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
    return id
      ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}`
      : null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean).pop();
    return id && /^\d+$/.test(id)
      ? `https://player.vimeo.com/video/${id}`
      : null;
  }

  return null;
}

function parseAssetIds(value) {
  if (value == null) return [];

  return [
    ...new Set(
      String(value)
        .split(/\r?\n/)
        .map((assetId) => assetId.trim())
        .filter(Boolean),
    ),
  ];
}

function getAssets(assetIds) {
  return assetIds.flatMap((assetId) => {
    const asset = window.lookup[assetId];
    if (!asset) {
      console.warn(`No asset found for archive media "${assetId}".`);
      return [];
    }
    return [asset];
  });
}

function getAssetSource(asset) {
  return safeHttpUrl(asset.c);
}

function safeHttpUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function hasValue(value) {
  return value != null && String(value).trim() !== "";
}

function showPageError(message) {
  if (!window.ele_tiger) return;

  const error = createHTML(`<p class="archive-detail__error"></p>`);
  error.textContent = message;
  window.ele_tiger.replaceChildren(error);
}

function createLookup(assetData) {
  return Object.fromEntries(assetData.map((row) => [row.a, row]));
}

function createSlugLookup(sheetData) {
  return Object.fromEntries(sheetData.map((row) => [row.v, row]));
}

function createHTML(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  const element = template.content.firstElementChild;
  if (!element) {
    throw new Error("createHTML requires a single root element.");
  }
  return element;
}

logSheetData();
