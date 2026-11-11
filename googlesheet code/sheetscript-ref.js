// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// 'vars
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// main sheet thing
// CLIENT_ID = "x91hTbRviyLEV2zyCmwfMoMHqMJYyI6v3Eni35covms";
// CLIENT_SECRET = "F2EayKLHehZRrl7YfxdrjM1dWIkZ_66UsvXfOkwVQUM";

CLIENT_SECRET = "BFfk3o2Pn4mgUV06vnk9sZQRBQ4Q7-aqmma7MJ6lPxw";
CLIENT_ID = "PQP6tEWH8EtgYFIl5EIluYy1L0QQoB_RqPXZ8ItIfJQ";

audiothumb =
  "https://d2w9rnfcy7mm78.cloudfront.net/52089757/original_acbfcb707c960f2c88b35b0567cffb4e.png?1793307583?bc=0";
vimeothumb =
  "https://d2w9rnfcy7mm78.cloudfront.net/52089756/original_07e6c19964874d6d9dc599bc86790dc3.png?1793307583?bc=0";
pdfthumb =
  "https://d2w9rnfcy7mm78.cloudfront.net/52089759/original_c4d6cf278a25f99ac8b5920b37fdebe1.png?1793307584?bc=0";
flickrthumb =
  "https://d2w9rnfcy7mm78.cloudfront.net/52089755/original_3805efbbfa07f7ebb2735583dbca00c9.png?1793307583?bc=0";
RAthumb =
  "https://d2w9rnfcy7mm78.cloudfront.net/52336650/original_d9d87f1cf194f7bf988781b12e141e47.png?1793811586?bc=0";
vimeofailedthumb = Rathumb;
assetIdClmn = "U";
slugIdClmn = "V";
typeIdClmn = "W";
thumbXClmn = "X";
//change the u to number charater it is
slugIdNum = slugIdClmn.charCodeAt(0) - 65 + 1;
assetIdNum = assetIdClmn.charCodeAt(0) - 65 + 1;
typeIdNum = typeIdClmn.charCodeAt(0) - 65 + 1;
thumbInsertNum = thumbXClmn.charCodeAt(0) - 64;
let spreadsheet;
let sheet;
let assetSheet;
let service;
let index = 2;
let assetRowMap = new Map();
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// begin
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
function myFunction() {
  Logger.log("✦ ─────────────────────────────── ✦");
  Logger.log("✦ The Script has started Khanh! ✦");
  Logger.log("✦ ─────────────────────────────── ✦");

  try {
    authorize();
    init();
    processSheet();
  } catch (error) {
    logRowError(error, sheet ? Math.max(index, 2) : 1);
    throw error;
  }
}

function init() {
  arenaBlockCache = {};

  spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  sheet = spreadsheet.getSheetByName("ALL");

  if (!sheet) {
    throw new Error('Sheet "ALL" not found.');
  }

  assetSheet = getOrCreateAssetSheet();

  service = getArenaService();

  initAssetMap();

  index = 2;

  clearAndMove();
}
function clearAndMove() {
  sheet.getRange(`${assetIdClmn}:${assetIdClmn}`).clearContent();

  sheet
    .getRange("U1:X1")
    .setValues([["Asset Ids", "Slug Ids", "Type", "Thumbnail Ids"]]);
}
function initAssetMap() {
  assetRowMap = new Map();

  const lastRow = assetSheet.getLastRow();

  if (lastRow < 2) return;

  const ids = assetSheet.getRange(2, 1, lastRow - 1, 1).getValues();

  ids.forEach((row, i) => {
    if (row[0]) {
      assetRowMap.set(row[0], i + 2);
    }
  });
}
//done with helpers
// process shet
function processSheet() {
  if (!sheet) {
    throw new Error('Sheet "ALL" not found.');
  }

  Logger.log('Sheet "ALL" found.');
  const data = sheet.getDataRange().getValues();
  const usedIds = new Set();
  let endIndex = data.length;

  for (let i = 1; i < data.length; i++) {
    const title = data[i][0];
    if (title == null || String(title).trim() === "") {
      endIndex = i;
      break;
    }

    const existingId = data[i][slugIdNum - 1];
    if (existingId != null && String(existingId).trim() !== "") {
      usedIds.add(String(existingId));
    }
  }

  for (let i = 1; i < endIndex; i++) {
    index = i + 1;
    const cell = data[i][2],
      title = data[i][0],
      thumbCell = data[i][3];
    const existingId = data[i][slugIdNum - 1];
    const uniqueId = getOrCreateRowId(existingId, usedIds);
    if (existingId == null || String(existingId).trim() === "") {
      sheet.getRange(index, slugIdNum).setValue(uniqueId);
    }
    try {
      extractBlocks(
        cell,
        title,
        thumbCell ? getArenaThumb(thumbCell) : null,
        uniqueId,
      );
    } catch (error) {
      logRowError(error);
    }
  }
}

function logRowError(error, rowNumber = index) {
  const message = error && error.message ? error.message : String(error);
  const formattedMessage = `Row ${rowNumber} : ${message}`;

  if (typeof console !== "undefined" && typeof console.error === "function") {
    console.error(formattedMessage);
  } else {
    Logger.log(formattedMessage);
  }
}
function extractBlocks(url, title, thumbCell, slug) {
  const match = checkMatches(url);
  if (!match) {
    logRowError(`No matching asset found: ${url}`);
    if (!thumbCell) {
      logRowError(`No thumbnail found: ${url}`);
      return;
    }
  }
  // Logger.log(`matches ${index}: ${match.type}`);
  if (match) {
    handleDataInsertion(match, url, slug, title);
    handleTypeInsertion(match.type);
  }
  handleThumbnailInsertion(match, url, thumbCell, title, slug);
}
function handleArena(blockIds, match) {
  const assetIds = [];
  let typeSet = false;
  blockIds.forEach((id) => {
    const block = fetchArenaBlock(id, service);
    if (!block) return;
    const assetId = "asset_arena_" + id;
    let source = "";
    //its image
    if (match.type == "gallery") source = block.image.src;
    else if (match.type == "audio" || match.type == "pdf")
      source = block.attachment.url;
    else if (match.type == "link") source = block.source.url;

    const row = [
      assetId,
      block.title ? `source_${block.title}` : null,
      source,
      "",
      "",
      "",
      block.description ? block.description.plain : "",
      extractAltText(block),
    ];
    // Logger.log("upserting asset: " + assetId);
    upsertAsset(assetSheet, row);
    assetIds.push(assetId);
  });
  insertToMainSheet(assetIdNum, assetIds.join("\n"));
}

function handleRowInsertion(row, assetId) {
  // Logger.log("upserting asset: " + assetId);
  upsertAsset(assetSheet, row);
  insertToMainSheet(assetIdNum, assetId);
  // insertToMainSheet(typeIdNum, type);
  // insertToMainSheet(thumbInsertNum, assetId);
}
function handleTypeInsertion(type) {
  insertToMainSheet(typeIdNum, type);
}
function handleThumbinsertion(row, thumbId) {
  upsertAsset(assetSheet, row);
  insertToMainSheet(thumbInsertNum, thumbId);
}

function insertToMainSheet(place, value) {
  sheet.getRange(index, place).setValue(value);
}

function getArenaThumb(thumb) {
  const [blockId] = seperateArenaIds(String(thumb ?? ""));
  if (!blockId) {
    logRowError(`Could not find an Are.na block ID in thumbnail value: ${thumb}`);
    return null;
  }

  // Logger.log("arena id " + blockId);
  return fetchArenaBlock(blockId, service);
}

function checkMatches(url) {
  const sourceUrl = String(url ?? "")
    .replace(/\\/g, "")
    .trim();

  const firstUrl = sourceUrl.split(/\s+/)[0];

  const matches = [
    {
      class: "arena",
      type: "",
      match: sourceUrl.match(
        /https?:\/\/(?:www\.)?are\.na\/block\/(\d+)(?=[/?#\s]|$)/,
      ),
      url: sourceUrl,
    },
    {
      class: "youtube",
      type: "video",
      match: firstUrl.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([^&?/]+)/,
      ),
    },
    {
      class: "vimeo",
      type: "video",
      match: sourceUrl.match(
        /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/,
      ),
    },
    {
      class: "flickr",
      type: "link",
      match: firstUrl.match(
        /(?:flic\.kr\/s\/|flickr\.com\/(?:photos\/[^/]+\/)?)([a-zA-Z0-9]+)/,
      ),
    },
    {
      class: "reelasian",
      type: "link",
      match: firstUrl.match(
        /https?:\/\/(?:www\.)?reelasian\.com(?:\/([^?#\s]*))?/,
      ),
    },
    {
      class: "link",
      type: "link",
      match: firstUrl.match(/^https?:\/\/[^\s]+$/),
      url: firstUrl,
    },
  ];

  const result = matches.find((item) => item.match !== null);
  if (!result) return null;

  if (result.class === "arena") {
    const temp = updateArenaMatch(url);

    result.ids = temp.ids;
    result.type = temp.type;
    result.thumb = temp.thumb;
  }

  return result;
}
function handleDataInsertion(match, url, slug, title) {
  const type = "";
  const sourceUrl = String(url);
  const firstUrl = sourceUrl.trim().split(/\s+/)[0];
  if (match.class == "arena") {
    handleArena(match.ids, match);
  } else {
    const assetId = "asset_" + `${match.class}_${slug}`;
    let row = [
      assetId,
      title ? `source_${title}` : null,
      firstUrl,
      "",
      "",
      "",
      "",
      "",
    ];
    upsertAsset(assetSheet, row);
    //what about the thumbnail inseration?
    handleRowInsertion(row, assetId);
  }
}
function handleThumbnailInsertion(match, url, thumbCell, title, slug) {
  let thumbSrc = null;
  let row;
  let thumbId = `thumb_${match?.class || "custom"}_${slug}`;
  let thumbTitle = `thumb_${title}`;
  if (thumbCell != null) {
    row = [
      thumbId,
      thumbTitle,
      "",
      thumbCell?.image?.src || null,
      thumbCell?.image?.small?.src || null,
      thumbCell?.image?.medium?.src || null,
      "",
      "",
    ];
  } else {
    if (match?.thumb) {
      if (match.thumb.link) thumbSrc = match.thumb.link;
      else thumbSrc = match.thumb;
    } else if (match?.type == "video") {
      if (match.class == "youtube")
        thumbSrc = `https://img.youtube.com/vi/${match.match[1]}/hqdefault.jpg`;
      if (match.class == "vimeo") {
        if (match.class == "vimeo") {
          const result = getVimeoThumbnail(sourceUrl);

          if (result.success) {
            thumbSrc = result.thumbnail;
          } else if (
            result.status === "inaccessible_or_invalid_url" ||
            result.status === "restricted_metadata_or_missing_thumbnail"
          ) {
            thumbSrc = vimeothumb;
          } else {
            thumbSrc = vimeofailedthumb;
          }

          if (result.success) {
            Logger.log(`Row ${index} : Vimeo ${slug}: ${result.status}`);
          } else {
            logRowError(`Vimeo ${slug}: ${result.status}`);
          }
        }
      }
    } else if (match?.class == "flickr") thumbSrc = flickrthumb;
    else if (match?.class == "reelasian") thumbSrc = RAthumb;
    row = [
      thumbId,
      thumbTitle,
      "",
      thumbSrc.src ? thumbSrc.src : thumbSrc,
      thumbSrc.src ? thumbSrc.small.src : thumbSrc,
      thumbSrc.src ? thumbSrc.medium.src : thumbSrc,
      "",
      "",
    ];
  }
  handleThumbinsertion(row, thumbId);
}

function fetchArenaBlock(blockId, service) {
  if (arenaBlockCache[blockId]) {
    return arenaBlockCache[blockId];
  }

  const url = `https://api.are.na/v3/blocks/${blockId}`;

  try {
    const response = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: "Bearer " + service.getAccessToken(),
      },
      muteHttpExceptions: true,
    });

    const status = response.getResponseCode();

    if (status < 200 || status >= 300) {
      logRowError(`Are.na block ${blockId} failed: ${status}`);
      return null;
    }

    const block = JSON.parse(response.getContentText());

    arenaBlockCache[blockId] = block;

    return block;
  } catch (error) {
    logRowError(`Are.na fetch failed: ${error.message || error}`);
    return null;
  }
}
function getOrCreateAssetSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  let assetSheet = ss.getSheetByName("Assets");

  // Only create the sheet if it doesn't exist
  if (!assetSheet) {
    assetSheet = ss.insertSheet("Assets");

    assetSheet
      .getRange(1, 1, 1, 8)
      .setValues([
        [
          "id",
          "title",
          "src",
          "thumbnailURL",
          "thumbnailURL-small",
          "thumbnailURL-medium",
          "description",
          "alt_text",
        ],
      ]);
  }

  assetSheet.setIndex(ss.getSheets().length);
  return assetSheet;
}

function upsertAsset(sheet, row) {
  const id = row[0];
  const existingRow = assetRowMap.get(id);

  if (existingRow) {
    sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);

    const newRow = sheet.getLastRow();
    assetRowMap.set(id, newRow);
  }
}

function extractAltText(block) {
  if (!block) return "";
  if (block.attachment) return block.description ? block.description.plain : "";

  if (block.image && block.image.alt_text) return block.image.alt_text;
  return "";
}

function generateUniqueId(usedIds) {
  let id;
  do {
    id = Utilities.getUuid().replace(/-/g, "").slice(0, 8);
  } while (usedIds.has(id));
  return id;
}

function getOrCreateRowId(existingId, usedIds) {
  if (existingId != null && String(existingId).trim() !== "") {
    usedIds.add(String(existingId));
    return existingId;
  }

  return generateUniqueId(usedIds);
}

function getVimeoThumbnail(url) {
  try {
    const endpoint = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;

    const response = UrlFetchApp.fetch(endpoint, {
      muteHttpExceptions: true,
    });

    const code = response.getResponseCode();
    const body = response.getContentText();

    if (code === 200) {
      Logger.log(`Row ${index} : Vimeo response: ${code} | ${url}`);
    } else {
      logRowError(`Vimeo response: ${code} | ${url}`);
    }

    if (code === 200) {
      const data = JSON.parse(body);

      if (data.thumbnail_url) {
        return {
          success: true,
          status: "success",
          thumbnail: data.thumbnail_url,
        };
      }

      return {
        success: false,
        status: "restricted_metadata_or_missing_thumbnail",
        thumbnail: null,
      };
    }

    if (code === 403) {
      return {
        success: false,
        status: "embedding_disabled",
        thumbnail: null,
      };
    }

    if (code === 404) {
      return {
        success: false,
        status: "inaccessible_or_invalid_url",
        thumbnail: null,
      };
    }

    return {
      success: false,
      status: "request_failed",
      code: code,
      thumbnail: null,
    };
  } catch (error) {
    logRowError(`Vimeo error: ${error.message}`);

    return {
      success: false,
      status: "network_error",
      thumbnail: null,
    };
  }
}
/* -------------------------------------------
__ helpers
//,,-------------------------------------------*/

function seperateArenaIds(url) {
  const arenaRegex = /https?:\/\/(?:www\.)?are\.na\/block\/(\d+)(?=[/?#\s]|$)/;
  const lines = String(url ?? "").split(/\r?\n/);
  const ids = [];
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;
    // Logger.log("cleanLine: " + cleanLine);
    const match = cleanLine.match(arenaRegex);
    if (match) {
      ids.push(match[1]);
    }
  }
  return ids;
}
function updateArenaMatch(url) {
  const arenaIds = seperateArenaIds(url);
  const block = fetchArenaBlock(arenaIds[0], service);
  let type = "";
  let thumb = {};
  if (block.type == "Image") {
    type = "gallery";
    thumb = block.image;
  } else if (block.type == "Link") {
    type = "link";
    thumb = block.image;
  } else if (block.type == "Attachment") {
    if (block.attachment?.content_type == "audio/mpeg") {
      type = "audio";
      thumb.link = audiothumb;
    } else if (block.attachment?.content_type == "application/pdf") {
      if (block.image) thumb = block.image;
      else thumb.link = pdfthumb;
      type = "pdf";
    }
  }
  return { ids: arenaIds, type: type, thumb: thumb };
}
function getArenaService() {
  return OAuth2.createService("Arena")
    .setAuthorizationBaseUrl("www.are.na/oauth/authorize")
    .setTokenUrl("api.are.na/v3/oauth/token")
    .setClientId(CLIENT_ID)
    .setClientSecret(CLIENT_SECRET)
    .setCallbackFunction("authCallback")
    .setPropertyStore(PropertiesService.getUserProperties())
    .setScope("read");
}

function authorize() {
  const service = getArenaService();
  if (!service.hasAccess()) {
    Logger.log(service.getAuthorizationUrl());
  }
}

function authCallback(request) {
  const service = getArenaService();
  const authorized = service.handleCallback(request);
  return HtmlService.createHtmlOutput(
    authorized
      ? "Success! You can close this window."
      : "Authorization denied.",
  );
}
