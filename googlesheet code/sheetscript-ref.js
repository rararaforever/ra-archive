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
  "https://d2w9rnfcy7mm78.cloudfront.net/52089758/original_37cc9cbebffdaa151fc4fc65afa05c65.png?1793307583?bc=0";
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
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
// begin
// ————————————————————————————————————————————————————————————
// ————————————————————————————————————————————————————————————
function myFunction() {
  authorize();
  init();
  processSheet();
}

function init() {
  spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  sheet = spreadsheet.getSheetByName("ALL");

  assetSheet = getOrCreateAssetSheet();
  service = getArenaService();
  index = 2;
  if (!sheet) {
    throw new Error('Sheet "ALL" not found.');
  }
  clearAndMove();
}
function clearAndMove() {
  sheet.getRange(`${assetIdClmn}:${assetIdClmn}`).clearContent();
  const gg = SpreadsheetApp.getActiveSpreadsheet();
  gg.setActiveSheet(assetSheet);
  gg.moveActiveSheet(gg.getSheets().length);
  gg.setActiveSheet(sheet);
  const range = assetSheet.getDataRange();
  range.setWrap(false);
  range.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  sheet.getRange("U1").setValue("Asset Ids");
  sheet.getRange("V1").setValue("Slug Ids");
  sheet.getRange("W1").setValue("Type");
  sheet.getRange("X1").setValue("Thumbnail Ids");
}
//done with helpers
// process shet
function processSheet() {
  // const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  // const sheet = spreadsheet.getSheetByName("ALL");
  if (!sheet) {
    throw new Error('Sheet "Projects" not found.');
  } else {
    Logger.log('Sheet "Projects" found.');
  }
  const data = sheet.getDataRange().getValues();
  const usedIds = new Set();

  for (let i = 1; i < data.length; i++) {
    const cell = data[i][2],
      title = data[i][0],
      thumbCell = data[i][3];
    const existingId = data[i][slugIdNum - 1];
    const uniqueId = getOrCreateRowId(existingId, usedIds);
    sheet.getRange(index, slugIdNum).setValue(uniqueId);
    try {
      extractBlocks(
        cell,
        title,
        thumbCell ? getArenaThumb(thumbCell) : null,
        uniqueId,
      );
    } catch (error) {
      Logger.log(`Row ${index} failed: ${error.message || error}`);
    }
    index++;
  }
}
function extractBlocks(url, title, thumbCell, slug) {
  const match = checkMatches(url);

  if (!match) {
    Logger.log(`No matching asset found at row ${index}: ${url}`);
    if (!thumbCell) {
      Logger.log(`No thumbnail found at row ${index}: ${url}`);
      return;
    }
  }

  // Logger.log(`matches ${index}: ${match.type}`);

  handleDataInsertion(match, url, slug, title);
  handleTypeInsertion(match.type);
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
    Logger.log(
      `Could not find an Are.na block ID in thumbnail value: ${thumb}`,
    );
    return null;
  }

  Logger.log("arena id " + blockId);
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
  let thumbId = `thumb_${match.class}_${slug}`;
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
    if (match.thumb) {
      if (match.thumb.link) thumbSrc = match.thumb.link;
      else thumbSrc = match.thumb;
    } else if (match.type == "video") {
      if (match.class == "youtube")
        thumbSrc = `https://img.youtube.com/vi/${match.match[1]}/hqdefault.jpg`;
      if (match.class == "vimeo") thumbSrc = getVimeoThumbnail(url);
    } else if (match.class == "flickr") thumbSrc = flickrthumb;
    else if (match.class == "reelasian") thumbSrc = RAthumb;
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
      Logger.log(`Are.na block ${blockId} fetch failed with status ${status}.`);
      return null;
    }

    return JSON.parse(response.getContentText());
  } catch (error) {
    Logger.log(
      `Are.na block ${blockId} fetch failed: ${error.message || error}`,
    );
    return null;
  }
}
function getOrCreateAssetSheet() {
  const gg = SpreadsheetApp.getActiveSpreadsheet();
  let assetSheet = gg.getSheetByName("Assets");
  assetSheet ? gg.deleteSheet(assetSheet) : null;
  assetSheet = gg.insertSheet("Assets");
  assetSheet.appendRow([
    "id",
    "title",
    "src",
    "thumbnailURL",
    "thumbnailURL-small",
    "thumbnailURL-medium",
    "description",
    "alt_text",
  ]);
  const range = assetSheet.getDataRange();
  range.setWrap(false);
  range.setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  return assetSheet;
}

function upsertAsset(sheet, row) {
  const data = sheet.getDataRange().getValues();
  const id = row[0];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return;
    }
  }
  sheet.appendRow(row);
}

function extractAltText(block) {
  if (!block) return "";
  if (block.attachment) return block.description ? block.description.plain : "";

  if (block.image && block.image.alt_text) return block.image.alt_text;
  return "";
}

function isGeneratedId(value) {
  return typeof value === "string" && /^[0-9a-f]{8}$/i.test(value);
}

function generateUniqueId(usedIds) {
  let id;
  do {
    id = Utilities.getUuid().replace(/-/g, "").slice(0, 8);
  } while (usedIds.has(id));
  return id;
}

function getOrCreateRowId(existingId, usedIds) {
  const id =
    isGeneratedId(existingId) && !usedIds.has(existingId)
      ? existingId
      : generateUniqueId(usedIds);
  usedIds.add(id);
  return id;
}

function getVimeoThumbnail(url) {
  try {
    const response = UrlFetchApp.fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      { muteHttpExceptions: true },
    );
    const code = response.getResponseCode();

    if (code !== 200) {
      Logger.log(`Vimeo thumbnail fetch failed with status ${code}: ${url}`);
      return vimeothumb;
    }

    const data = JSON.parse(response.getContentText());
    return data.thumbnail_url ? data.thumbnail_url : vimeothumb; // Return the thumbnail URL or a default thumbnail if not available
  } catch (error) {
    Logger.log(`Vimeo thumbnail fetch failed: ${error.message || error}`);
    return vimeothumb;
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
