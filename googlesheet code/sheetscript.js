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

  const service = getArenaService();
  const data = sheet.getDataRange().getValues();
  const usedIds = new Set();

  for (let i = 1; i < data.length; i++) {
    const cell = data[i][2];
    const title = data[i][0];
    const thumbCell = data[i][3];
    const existingId = data[i][slugIdNum - 1];
    const uniqueId =
      isGeneratedId(existingId) && !usedIds.has(existingId)
        ? existingId
        : generateUniqueId(usedIds);
    usedIds.add(uniqueId);
    sheet.getRange(index, slugIdNum).setValue(uniqueId);
    extractBlocks(cell, title, thumbCell ? getThumbCell(thumbCell) : null);
    index++;
  }
}
function handleArenaThumb(ids, url, thumbCell) {
  let id = ids[0];
  let row,
    asset = {};
  let assetId = "asset_thumb_" + id;
  if (thumbCell) {
    asset.thumb = thumbCell.image?.src || "";
    asset.thumbSmall = thumbCell.image?.small.src || "";
    asset.thumbMid = thumbCell.image?.medium.src || "";
  } else {
    const block = fetchArenaBlock(id, service);
    let fallback = "";
    if (block.type == "Attachment") {
      if ((block.attachment.content_type = "audio/mpeg")) fallback = audiothumb;
      else if ((block.attachment.content_type = "application/pdf"))
        fallback = pdfthumb;
    }
    asset.thumb = block.image?.src || fallback;
    asset.thumbSmall = block.image?.small.src || fallback;
    asset.thumbMid = block.image?.medium.src || fallback;
  }
  row = [
    assetId,
    `thumbnail ${id}` || "",
    asset.thumb,
    asset.thumb,
    asset.thumbSmall,
    asset.thumbMid,
    "",
    "",
  ];
  Logger.log("upserting asset: " + assetId);
  upsertAsset(assetSheet, row);
  insertToMainSheet(thumbInsertNum, assetId);
}
function handleArena(blockIds, updatedCell) {
  let ids = "";
  blockIds.forEach((id, index) => {
    const block = fetchArenaBlock(id, service);
    const assetId = "asset_arena_" + id;
    let urlStuff = {};
    //its image
    if (block.type == "Image") {
      urlStuff.image = block.image?.src || "";
      urlStuff.src = urlStuff.image;
    } else if (block.type == "Attachment") {
      urlStuff.image = block.image?.src || "";
      urlStuff.src = block.attachment.url;
    }
    const row = [
      assetId,
      block.title || "",
      urlStuff.image,
      urlStuff.url,
      "",
      "",
      block.description ? block.description.plain : "",
      extractAltText(block),
    ];

    if (index == 0) checkArenaType(block);
    Logger.log("upserting asset: " + assetId);
    upsertAsset(assetSheet, row);
    ids += assetId + "\n";
  });
  insertToMainSheet(assetIdNum, ids);
}
function handleElse() {
  //its a link
}
function handleRowInsertion(row, assetId, type) {
  Logger.log("upserting asset: " + assetId);
  upsertAsset(assetSheet, row);
  insertToMainSheet(assetIdNum, assetId);
  insertToMainSheet(typeIdNum, type);
  insertToMainSheet(thumbInsertNum, assetId);
}
function insertToMainSheet(place, value) {
  sheet.getRange(index, place).setValue(value);
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

function getThumbCell(thumb) {
  const arenaRegex = /https?:\/\/(?:www\.)?are\.na\/block\/(\d+)(?=[/?#\s]|$)/;
  thumb = thumb.trim();
  const match = thumb.match(arenaRegex);
  Logger.log("arena " + thumb);
  Logger.log("arena id " + match[1]);
  const block = fetchArenaBlock(match[1], service);
  return block;
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

function extractBlocks(url, title, thumbCell) {
  if (!url) return [];
  // for are.na
  const arenaRegex = /https?:\/\/(?:www\.)?are\.na\/block\/(\d+)(?=[/?#\s]|$)/;
  const firstUrl = url.trim().split(/\s+/)[0];
  const ytMatch = firstUrl.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([^&?/]+)/,
  );
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)(\d+)/,
  );
  const arenaMatch = url.match(arenaRegex);
  const flickrMatch = firstUrl.match(
    /(?:flic\.kr\/s\/|flickr\.com\/(?:photos\/[^/]+\/)?)([a-zA-Z0-9]+)/,
  );
  const reelAsianMatch = firstUrl.match(
    /https?:\/\/(?:www\.)?reelasian\.com(?:\/([^?#\s]*))?/,
  );
  /* -------------------------------------------
__ its are.na
//,,-------------------------------------------*/
  let vidThumb;
  if (arenaMatch) {
    //handle typelater;
    let ids = seperateArenaIds(url);
    handleArena(ids, url);
    handleArenaThumb(ids, url, thumbCell);
    return;
  } else if (ytMatch || vimeoMatch) {
    if (ytMatch)
      vidThumb = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    if (vimeoMatch) vidThumb = getVimeoThumbnail(url);
    const assetId =
      "asset_" +
      `${ytMatch ? "yt" : "vim"}_` +
      `${ytMatch ? ytMatch[1] : vimeoMatch[1]}`;
    let row = [
      assetId,
      title ? title : null,
      url ? url : null,
      thumbCell ? thumbCell.image.src : vidThumb,
      thumbCell ? thumbCell.image.small.src : null,
      thumbCell ? thumbCell.image.medium.src : null,
      "",
      "",
    ];
    handleRowInsertion(row, assetId, "video");
  } else {
    if (flickrMatch) vidThumb = flickrthumb;
    else if (reelAsianMatch) vidThumb = RAthumb;
    const assetId =
      "asset_" +
      `${flickrMatch ? "flickr" : reelAsianMatch ? "RA" : "link"}_` +
      `${flickrMatch ? flickrMatch[1] : reelAsianMatch ? reelAsianMatch[1] : `link_${index}`}`;
    let row = [
      assetId,
      title ? title : null,
      url ? url : null,
      thumbCell?.image?.src || vidThumb || null,
      thumbCell?.image?.small.src || null,
      thumbCell?.image?.medium.src || null,
      "",
      "",
    ];
    handleRowInsertion(row, assetId, "link");
  }
}
function fetchArenaBlock(blockId, service) {
  const url = `https://api.are.na/v3/blocks/${blockId}`;
  const response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: "Bearer " + service.getAccessToken(),
    },
  });
  return JSON.parse(response.getContentText());
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

function getVimeoThumbnail(url) {
  try {
    const response = UrlFetchApp.fetch(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`,
      { muteHttpExceptions: true },
    );
    const code = response.getResponseCode();

    if (code !== 200) {
      return vimeothumb;
    }

    const data = JSON.parse(response.getContentText());
    Logger.log("Vimeo API response: " + data);
    return data.thumbnail_url ? data.thumbnail_url : vimeothumb; // Return the thumbnail URL or a default thumbnail if not available
  } catch (error) {
    return vimeothumb;
  }
}
/* -------------------------------------------
__ helpers
//,,-------------------------------------------*/

function seperateArenaIds(url) {
  const arenaRegex = /https?:\/\/(?:www\.)?are\.na\/block\/(\d+)(?=[/?#\s]|$)/;
  const lines = url.split(/\r?\n/);
  let ids = [];
  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;
    Logger.log("cleanLine: " + cleanLine);
    const match = cleanLine.match(arenaRegex);
    if (match) {
      ids.push(match[1]);
    }
  }
  return ids;
}
function checkArenaType(block) {
  if (block.type == "Image") insertToMainSheet(typeIdNum, "gallery");
  else if (block.type == "Attachment") {
    if (block.attachment.content_type == "audio/mpeg")
      insertToMainSheet(typeIdNum, "audio");
    else if (block.attachment.content_type == "application/pdf")
      insertToMainSheet(typeIdNum, "pdf");
  }
}
