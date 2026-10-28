import { supabaseAnonKey, supabaseUrl } from "../supabase-config.js";

const boardList = document.querySelector("#board-list");
const forumMessage = document.querySelector("#forum-message");
const boardView = document.querySelector("#board-view");
const topicView = document.querySelector("#topic-view");
const composerView = document.querySelector("#composer-view");
const membersView = document.querySelector("#members-view");
const notificationsView = document.querySelector("#notifications-view");
const navLinks = document.querySelectorAll("[data-page-nav]");
const indexPanel = document.querySelector(".forum-table-wrap");
const authDialog = document.querySelector("#auth-dialog");
const profileDialog = document.querySelector("#profile-dialog");
const profileForm = document.querySelector("#profile-form");
const profileMessage = document.querySelector("#profile-message");
const authForm = document.querySelector("#auth-form");
const authMessage = document.querySelector("#auth-message");
const usernameField = document.querySelector("#username-field");
const emailField = authForm.elements.email.closest(".form-field");
const passwordField = authForm.elements.password.closest(".form-field");
const authPassword = authForm.elements.password;
const authForgot = document.querySelector("#auth-forgot");
const authSwitch = document.querySelector("#auth-switch");
const siteTitle = document.querySelector(".site-title");
const forumNewsHeadline = document.querySelector("#forum-news-headline");
const forumNewsBody = document.querySelector("#forum-news-body");
const forumNewsMessage = document.querySelector("#forum-news-message");
const forumNewsEditButton = document.querySelector("#forum-news-edit");
const forumNewsEditor = document.querySelector("#forum-news-editor");
const forumNewsForm = forumNewsEditor;
const authMode = { value: "signup" };
const legacyBoardSlugs = {
  "dos-windows": "general",
  "adventure-games": "clips-images",
  simulations: "art",
  shareware: "games-recommendations",
  "nintendo-classics": "games-recommendations",
  "playstation-classics": "games-recommendations",
  "xbox-classics": "games-recommendations",
  "sega-other-classics": "games-recommendations",
  nintendo: "games-recommendations",
  playstation: "games-recommendations",
  xbox: "games-recommendations",
  "sega-other-consoles": "games-recommendations",
  "off-topic": "general",
  "general-2": "general",
  music: "music-discussion"
};
let supabase;
let currentUser;
let boards = [];
let moderatorIds = new Set();
let boardModeratorBoardIds = new Map();
let membersRequest = 0;
let boardTopicsRequest = 0;
let notificationsRequest = 0;
let notificationCountRequest = 0;
const membersPerPage = 25;
const dailyQuestionBoardSlug = "question-of-the-day";
const dailyQuestionDurationMs = 24 * 60 * 60 * 1000;
const themeStorageKey = "nickel-dhingy-site-theme";
const holidayThemes = {
  "christmas": "Christmas",
  "new-year": "New Year",
  "valentine": "Valentine's Day",
  "st-patrick": "St. Patrick's Day",
  "easter": "Easter",
  "fourth-of-july": "Fourth of July",
  "thanksgiving": "Thanksgiving",
  "halloween": "Halloween"
};

const siteTitles = [
  "Another Retro Gaming Larping Forum",
  "Larp Larp Larp Shaur",
  "Hi RetroDev",
  "I, I don't know what to add to this forum ngl",
  "We're just like BitView. except like we don't host videos, actually we're more like SomethingAwful",
  "☟︎✌︎❄︎☜︎📬︎ ☹︎☜︎❄︎ 💣︎☜︎ ❄︎☜︎☹︎☹︎ ✡︎⚐︎🕆︎ ☟︎⚐︎🕈︎ 💣︎🕆︎👍︎☟︎ ✋︎🕯︎✞︎☜︎ 👍︎⚐︎💣︎☜︎ ❄︎⚐︎ ☟︎✌︎❄︎☜︎ ✡︎⚐︎🕆︎ 💧︎✋︎☠︎👍︎☜︎ ✋︎ 👌︎☜︎☝︎✌︎☠︎ ❄︎⚐︎ ☹︎✋︎✞︎☜︎📬︎ ❄︎☟︎☜︎☼︎☜︎ ✌︎☼︎☜︎ 🗏︎🖰︎🖮︎📬︎🗐︎🗐︎ 💣︎✋︎☹︎☹︎✋︎⚐︎☠︎ 💣︎✋︎☹︎☜︎💧︎ ⚐︎☞︎ 🏱︎☼︎✋︎☠︎❄︎☜︎👎︎ 👍︎✋︎☼︎👍︎🕆︎✋︎❄︎💧︎ ✋︎☠︎ 🕈︎✌︎☞︎☜︎☼︎ ❄︎☟︎✋︎☠︎ ☹︎✌︎✡︎☜︎☼︎💧︎ ❄︎☟︎✌︎❄︎ ☞︎✋︎☹︎☹︎ 💣︎✡︎ 👍︎⚐︎💣︎🏱︎☹︎☜︎✠︎📬︎ ✋︎☞︎ ❄︎☟︎☜︎ 🕈︎⚐︎☼︎👎︎ ☟︎✌︎❄︎☜︎ 🕈︎✌︎💧︎ ☜︎☠︎☝︎☼︎✌︎✞︎☜︎👎︎ ⚐︎☠︎ ☜︎✌︎👍︎☟︎ ☠︎✌︎☠︎⚐︎✌︎☠︎☝︎💧︎❄︎☼︎⚐︎💣︎ ⚐︎☞︎ ❄︎☟︎⚐︎💧︎☜︎ ☟︎🕆︎☠︎👎︎☼︎☜︎👎︎💧︎ ⚐︎☞︎ 💣︎✋︎☹︎☹︎✋︎⚐︎☠︎💧︎ ⚐︎☞︎ 💣︎✋︎☹︎☜︎💧︎ ✋︎❄︎ 🕈︎⚐︎🕆︎☹︎👎︎ ☠︎⚐︎❄︎ ☜︎✈︎🕆︎✌︎☹︎ ⚐︎☠︎☜︎ ⚐︎☠︎☜︎📫︎👌︎✋︎☹︎☹︎✋︎⚐︎☠︎❄︎☟︎ ⚐︎☞︎ ❄︎☟︎☜︎ ☟︎✌︎❄︎☜︎ ✋︎ ☞︎☜︎☜︎☹︎ ☞︎⚐︎☼︎ ☟︎🕆︎💣︎✌︎☠︎💧︎ ✌︎❄︎ ❄︎☟︎✋︎💧︎ 💣︎✋︎👍︎☼︎⚐︎📫︎✋︎☠︎💧︎❄︎✌︎☠︎❄︎ ☞︎⚐︎☼︎ ✡︎⚐︎🕆︎📬︎ ☟︎✌︎❄︎☜︎📬︎ ☟︎✌︎❄︎☜︎📬︎"
];

const allowedImageTypes = ["image/jpeg", "image/gif", "image/webp", "image/png"];
const maxImageSize = 2 * 1024 * 1024;
const defaultAvatarUrl = "assets/default.png";
const emojiNames = [
  "acute", "aggressive", "air_kiss", "angel", "bad", "bb", "beach", "beee", "big_boss", "biggrin",
  "blum3", "blush", "boast", "bomb", "boredom", "buba", "buba_phone", "bye", "clapping", "cray",
  "cray2", "crazy", "curtsey", "dance", "dance2", "dance3", "dance4", "dash1", "dash2", "dash3",
  "declare", "dirol", "don-t_mention", "download", "drinks", "english_en", "facepalm", "feminist",
  "feminist_en", "first_move", "flirt", "focus", "fool", "friends", "gamer1", "gamer2", "gamer3",
  "gamer4", "girl_blum", "girl_cray", "girl_cray2", "girl_cray3", "girl_crazy", "girl_dance",
  "girl_drink1", "girl_drink3", "girl_drink4", "girl_haha", "girl_hide", "girl_hospital",
  "girl_impossible", "girl_in_love", "girl_mad", "girl_prepare_fish", "girl_sad", "girl_sigh",
  "girl_smile", "girl_to_take_umbrage", "girl_to_take_umbrage2", "girl_wacko", "girl_wink",
  "girl_witch", "give_heart", "give_heart2", "give_rose", "good", "good2", "good3", "heat", "help",
  "hi", "hunter", "hysteric", "i-m_so_happy", "ireful1", "ireful2", "ireful3", "king", "kiss",
  "kiss2", "kiss3", "laugh1", "laugh2", "laugh3", "laugh4", "lazy", "lol", "lol2", "mail1", "mamba",
  "man_in_love", "mda", "mega_shok", "moil", "mosking", "music", "music2", "nea", "negative",
  "new_russian", "ok", "on_the_quiet", "on_the_quiet2", "paint2", "paint3", "paratrooper",
  "paratrooper_girl", "pardon", "parting", "party", "party2", "pilot", "pioneer", "pioneer_smoke",
  "pleasantry", "popcorm1", "popcorm2", "prankster2", "preved", "punish", "read", "rofl",
  "sad", "sarcasm", "sarcastic", "sarcastic_blum", "sarcastic_hand", "scare",
  "scaut_en", "scratch_one-s_head", "search", "secret", "sensored", "shok", "shout", "slow", "smile",
  "smoke", "soldier", "soldier_girl", "sorry", "sorry2", "spruce_up", "stinker", "sun_bespectacled",
  "superman", "superstition", "swoon", "tease", "tender", "thank_you2", "this", "to_babruysk",
  "to_become_senile", "to_pick_ones_nose", "to_pick_ones_nose2", "to_take_umbrage", "training1",
  "umnik2", "unknw", "vampire", "vava", "victory", "wacko", "wacko2", "whistle3", "wild", "wink",
  "wink2", "wink3", "wizard", "yahoo", "yes3", "yess", "yu"
];

if (siteTitle) {
  siteTitle.textContent = siteTitles[Math.floor(Math.random() * siteTitles.length)];
}
applySiteTheme("auto");

function setForumMessage(message, isError = false) {
  forumMessage.textContent = message;
  forumMessage.classList.toggle("error-message", isError);
}

function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function makeButton(text, action, className = "small-button") {
  const button = makeElement("button", className, text);
  button.type = "button";
  button.dataset.action = action;
  return button;
}

function addSilkIcon(element, filename) {
  const icon = document.createElement("img");
  icon.className = "silk-icon";
  icon.src = `assets/silk-icons/${filename}.png`;
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  element.prepend(icon);
  return element;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatDateOnly(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}

function isReservedUsername(username) {
  const normalized = username.trim().toLowerCase();
  return /admin|moderator|(^|[_0-9])(mod|mods|staff|support|owner|owners)([_0-9]|$)/.test(normalized)
    || /(^|[_0-9])pi([_0-9]|$)/.test(normalized)
    || ["pisquaredx3", "nickel", "nickeldhingy", "nickel_dhingy"].includes(normalized);
}

async function loadModerators() {
  const [globalResult, boardResult] = await Promise.all([
    supabase.from("moderators").select("user_id"),
    supabase.from("board_moderators").select("user_id,board_id")
  ]);
  if (globalResult.error) throw globalResult.error;
  if (boardResult.error) throw boardResult.error;
  moderatorIds = new Set(globalResult.data.map(moderator => moderator.user_id));
  boardModeratorBoardIds = new Map();
  for (const assignment of boardResult.data) {
    const boardIds = boardModeratorBoardIds.get(assignment.user_id) || new Set();
    boardIds.add(assignment.board_id);
    boardModeratorBoardIds.set(assignment.user_id, boardIds);
  }
}

function canModerateBoard(userId, boardId) {
  return moderatorIds.has(userId) || boardModeratorBoardIds.get(userId)?.has(boardId) === true;
}

function renderForumNews(news) {
  forumNewsHeadline.textContent = news.headline;
  forumNewsBody.textContent = news.body;
}

async function loadForumNews() {
  const { data, error } = await supabase.from("forum_news")
    .select("headline,body")
    .eq("singleton", true)
    .single();
  if (error) throw error;
  renderForumNews(data);
}

async function loadPostAwards(postType, postIds) {
  if (!postIds.length) return new Map();
  const { data, error } = await supabase.from("post_awards")
    .select("post_type,post_id,vote_count,positive_vote_count,post_rating,user_vote,voted_by_user")
    .eq("post_type", postType)
    .in("post_id", postIds);
  if (error) throw error;
  return new Map(data.map(award => [`${award.post_type}:${award.post_id}`, award]));
}

function formatPostRating(award) {
  const ratingCount = award?.vote_count || 0;
  if (!ratingCount) return "No ratings";
  return `${Number(award.post_rating).toFixed(2)} / 1.00 · ${ratingCount} ${ratingCount === 1 ? "rating" : "ratings"}`;
}

function appendMemberLabels(container, userId, activity, boardId = null) {
  const labels = makeElement("span", "member-labels");
  let hasLabels = false;
  if (moderatorIds.has(userId) || (boardId !== null && canModerateBoard(userId, boardId))) {
    labels.append(makeModeratorBadge());
    hasLabels = true;
  }

  if (hasLabels) container.append(labels);
}
function makeModeratorBadge() {
  const badge = makeElement("span", "moderator-badge");
  badge.setAttribute("role", "img");
  badge.setAttribute("aria-label", "Moderator");
  badge.title = "Moderator";
  badge.append(makeElement("span", "moderator-badge-text", "MOD"));
  return badge;
}

function setStat(name, value) {
  document.querySelectorAll(`[data-stat="${name}"]`).forEach(element => {
    element.textContent = value.toLocaleString();
  });
}

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function thanksgivingDate(year) {
  const novemberFirst = new Date(year, 10, 1);
  const firstThursdayOffset = (4 - novemberFirst.getDay() + 7) % 7;
  return new Date(year, 10, 1 + firstThursdayOffset + 21);
}

function dateIsWithin(date, startMonth, startDay, endMonth, endDay) {
  const year = date.getFullYear();
  const start = new Date(year, startMonth - 1, startDay);
  const end = new Date(year, endMonth - 1, endDay);
  if (end < start) {
    if (date < start && date.getFullYear() === year) end.setFullYear(year + 1);
  }
  const value = new Date(year, date.getMonth(), date.getDate()).getTime();
  return value >= start.getTime() && value <= end.getTime();
}

function getAutomaticHolidayTheme(date = new Date()) {
  const easter = easterSunday(date.getFullYear());
  const easterEnd = new Date(easter);
  easterEnd.setDate(easter.getDate() + 6);
  const thanksgiving = thanksgivingDate(date.getFullYear());
  const thanksgivingEnd = new Date(thanksgiving);
  thanksgivingEnd.setDate(thanksgiving.getDate() + 3);
  const thanksgivingStart = new Date(thanksgiving);
  thanksgivingStart.setDate(thanksgiving.getDate() - 3);

  const value = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  if (value >= easter.getTime() && value <= easterEnd.getTime()) return "easter";
  if (value >= thanksgivingStart.getTime() && value <= thanksgivingEnd.getTime()) return "thanksgiving";
  if ((date.getMonth() === 11 && date.getDate() === 31) || (date.getMonth() === 0 && date.getDate() <= 7)) return "new-year";
  if (dateIsWithin(date, 12, 18, 12, 24)) return "christmas";
  if (dateIsWithin(date, 12, 25, 12, 31)) return "christmas";
  if (dateIsWithin(date, 2, 7, 2, 14)) return "valentine";
  if (dateIsWithin(date, 3, 14, 3, 17)) return "st-patrick";
  if (dateIsWithin(date, 6, 29, 7, 5)) return "fourth-of-july";
  if (dateIsWithin(date, 10, 24, 10, 31)) return "halloween";
  return "default";
}

function updateSiteLogo() {
  const logo = document.querySelector("#site-logo");
  if (!logo) return;

  let logoName = "nickel-dhingy-logo.png";
  if (document.body.classList.contains("rathner-board-theme")) {
    logoName = "nickel-dhingy-logo-rathner.png";
  } else if (document.body.classList.contains("holiday-christmas")) {
    logoName = "nickel-dhingy-logo-christmas.png";
  } else if (document.body.classList.contains("holiday-halloween")) {
    logoName = "nickel-dhingy-logo-halloween.gif";
  }

  const logoUrl = `assets/logos/${logoName}`;
  if (!logo.src.endsWith(logoUrl)) logo.src = logoUrl;
}

function applySiteTheme(theme) {
  const selected = theme === "auto" ? getAutomaticHolidayTheme() : theme;
  document.body.classList.remove(...Object.keys(holidayThemes).map(name => `holiday-${name}`));
  document.body.classList.remove("holiday-default");
  if (selected && selected !== "default") document.body.classList.add(`holiday-${selected}`);

  const themeColors = {
    "christmas": "#71899b", "new-year": "#171d43", "valentine": "#a3294d",
    "st-patrick": "#174f2b", "easter": "#7b72a8", "fourth-of-july": "#243d73",
    "thanksgiving": "#70421f", "halloween": "#8a3c00", "default": "#111b2d"
  };
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.content = themeColors[selected] || themeColors.default;
  updateSiteLogo();
}

function setupAdminThemeControl(user) {
  const links = document.querySelector("#account-links");
  if (!moderatorIds.has(user?.id)) return;

  let savedTheme = "default";
  try { savedTheme = localStorage.getItem(themeStorageKey) || "auto"; } catch (error) {}
  applySiteTheme(savedTheme);

  const control = makeElement("label", "theme-control");
  control.title = "Admin theme preview";
  control.setAttribute("aria-label", "Site theme preview");
  const select = document.createElement("select");
  select.id = "admin-theme-select";
  select.setAttribute("aria-label", "Site theme preview");
  select.append(new Option("Auto (date)", "auto"));
  select.append(new Option("Standard", "default"));
  Object.entries(holidayThemes).forEach(([value, label]) => select.append(new Option(label, value)));
  select.value = savedTheme;
  select.addEventListener("change", () => {
    try { localStorage.setItem(themeStorageKey, select.value); } catch (error) {}
    applySiteTheme(select.value);
  });
  control.append(makeElement("span", "theme-control-label", "Theme"), select);
  links.append(control);
}

function updateAccount(user) {
  const previousUserId = currentUser?.id;
  currentUser = user;
  forumNewsEditButton.hidden = !user || !moderatorIds.has(user.id);
  if (forumNewsEditButton.hidden) forumNewsEditor.hidden = true;
  if (previousUserId !== user?.id) notificationsRequest++;
  const links = document.querySelector("#account-links");
  links.replaceChildren();

  if (user) {
    const username = user.user_metadata?.username || "member";
    const profileButton = makeButton("", "profile-edit", "text-button account-name");
    profileButton.setAttribute("aria-label", `Edit profile for ${username}`);
    const avatar = makeElement("span", "account-avatar", username.slice(0, 1).toUpperCase());
    const avatarImage = document.createElement("img");
    avatarImage.alt = "";
    avatarImage.loading = "lazy";
    setAvatarImage(avatarImage);
    avatar.append(avatarImage);
    profileButton.append(avatar, makeElement("span", "", username));
    if (moderatorIds.has(user.id)) {
      const moderatorBadge = makeModeratorBadge();
      moderatorBadge.classList.add("account-moderator-badge");
      profileButton.append(moderatorBadge);
    }
    links.append(profileButton);
    setupAdminThemeControl(user);
    const notificationControl = makeElement("span", "notification-control");
    const notificationsButton = makeButton("", "notifications", "notification-button");
    notificationsButton.setAttribute("aria-label", "Notifications");
    notificationsButton.append(addSilkIcon(makeElement("span", "notification-icon"), "comment"));
    const notificationCount = makeElement("span", "notification-count", "0");
    notificationCount.dataset.notificationCount = "";
    notificationCount.hidden = true;
    notificationControl.append(notificationsButton, notificationCount);
    links.append(notificationControl);
    links.append(makeButton("Log out", "logout", "text-button"));
    void loadAccountAvatar(user.id, avatarImage);
    void refreshNotificationCount(user.id);
  } else {
    links.append(makeButton("Sign up", "auth-signup", "text-button"));
    links.append(makeElement("span", "", "|"));
    links.append(makeButton("Log in", "auth-login", "text-button"));
  }
}

async function refreshNotificationCount(userId) {
  const request = ++notificationCountRequest;
  if (!userId) return;
  try {
    const { count, error } = await supabase.from("reply_notifications")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", userId)
      .is("read_at", null);
    if (error) throw error;
    if (request !== notificationCountRequest || currentUser?.id !== userId) return;
    const badge = document.querySelector("[data-notification-count]");
    if (!badge) return;
    badge.textContent = (count || 0) > 99 ? "99+" : String(count || 0);
    badge.hidden = !count;
    const button = badge.parentElement.querySelector("button");
    button.setAttribute("aria-label", `Notifications${count ? `, ${count} unread` : ""}`);
  } catch (error) {
    if (request !== notificationCountRequest || currentUser?.id !== userId) return;
    console.error("Could not load notification count:", error);
    setForumMessage(`Could not load notifications: ${error.message}`, true);
  }
}

function setAvatarImage(image, avatarUrl = null) {
  const fallbackUrl = new URL(defaultAvatarUrl, document.baseURI).href;
  image.src = avatarUrl || fallbackUrl;
  if (avatarUrl) {
    image.addEventListener("error", () => {
      image.src = fallbackUrl;
    }, { once: true });
  }
}

async function loadAccountAvatar(userId, avatarImage) {
  try {
    const { data, error } = await supabase.from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();
    if (error) throw error;
    if (currentUser?.id !== userId || !avatarImage.isConnected) return;
    const avatarUrl = safeHttpsUrl(data.avatar_url);
    if (avatarUrl) {
      avatarImage.referrerPolicy = "no-referrer";
      setAvatarImage(avatarImage, avatarUrl);
    }
  } catch (error) {
    console.error("Could not load account profile picture:", error);
    setForumMessage(`Could not load account profile picture: ${error.message}`, true);
  }
}

function renderBoards() {
  boardList.replaceChildren();
  let category = "";

  for (const board of boards) {
    if (board.category !== category) {
      category = board.category;
      const headingRow = document.createElement("tr");
      headingRow.className = "category-row";
      const heading = document.createElement("th");
      heading.scope = "colgroup";
      heading.colSpan = 4;
      heading.textContent = category;
      headingRow.append(heading);
      boardList.append(headingRow);
    }

    const row = document.createElement("tr");
    const nameCell = makeElement("td", "forum-name-cell");
    const link = makeElement("a", "forum-name", board.title);
    link.href = `#board/${encodeURIComponent(board.slug)}`;
    nameCell.append(link);
    if (board.description) {
      nameCell.append(makeElement("p", "forum-description", board.description));
    }

    const topicCount = makeElement("td", "count-column", (board.topicCount || 0).toLocaleString());
    const replyCount = makeElement("td", "count-column", (board.replyCount || 0).toLocaleString());
    const latestCell = makeElement("td", "last-post-column");
    if (board.latestTopic) {
      const latestLink = makeElement("a", "", board.latestTopic.title);
      latestLink.href = `#topic/${board.latestTopic.id}`;
      const metadata = makeElement("span", "");
      metadata.append(
        document.createTextNode(`by ${board.latestTopic.author || "member"} · `),
        document.createElement("br"),
        document.createTextNode(formatDate(board.latestTopic.updated_at))
      );
      latestCell.append(latestLink, metadata);
    } else {
      latestCell.append(makeElement("span", "no-activity", "No topics yet"));
    }
    row.append(nameCell, topicCount, replyCount, latestCell);
    boardList.append(row);
  }
}

async function loadBoards() {
  const { data, error } = await supabase.from("boards")
    .select("id,slug,title,description,category,position")
    .order("position");
  if (error) throw error;

  boards = data;
  await Promise.all(boards.map(async board => {
    const [topicResult, replyResult, latestResult] = await Promise.all([
      supabase.from("topics").select("id", { count: "exact", head: true }).eq("board_id", board.id),
      supabase.from("replies")
        .select("id,topics!inner(board_id)", { count: "exact", head: true })
        .eq("topics.board_id", board.id),
      supabase.from("topics")
        .select("id,title,updated_at,profiles!topics_author_id_fkey(username),replies(count)")
        .eq("board_id", board.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);
    if (topicResult.error) throw topicResult.error;
    if (replyResult.error) throw replyResult.error;
    if (latestResult.error) throw latestResult.error;
    board.topicCount = topicResult.count || 0;
    board.replyCount = replyResult.count || 0;
    board.latestTopic = latestResult.data ? {
      ...latestResult.data,
      author: latestResult.data.profiles?.username
    } : null;
  }));
  renderBoards();
}

async function loadStats() {
  const [members, topics, replies, newest] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("topics").select("id", { count: "exact", head: true }),
    supabase.from("replies").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("username,created_at").order("created_at", { ascending: false }).limit(1).maybeSingle()
  ]);
  for (const result of [members, topics, replies, newest]) {
    if (result.error) throw result.error;
  }
  setStat("members", members.count || 0);
  setStat("topics", topics.count || 0);
  setStat("replies", replies.count || 0);
  const newestMemberText = newest.data
    ? `Newest member: ${newest.data.username} · ${formatDate(newest.data.created_at)}`
    : "No members have joined yet.";
  document.querySelector("#newest-member").textContent = newestMemberText;
}

async function loadLatestDiscussions() {
  const { data, error } = await supabase.from("topics")
    .select("id,title,is_featured,updated_at,profiles!topics_author_id_fkey(id,username),boards!topics_board_id_fkey(title)")
    .order("is_featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(5);
  if (error) throw error;

  const list = document.querySelector("#latest-discussions");
  const [awardsByTopic, latestReplies] = await Promise.all([
    loadPostAwards("topic", data.map(topic => topic.id)),
    Promise.all(data.map(async topic => {
      const { data: reply, error: replyError } = await supabase.from("replies")
        .select("body,created_at,profiles!replies_author_id_fkey(username)")
        .eq("topic_id", topic.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (replyError) throw replyError;
      return [topic.id, reply];
    }))
  ]);
  const latestReplyByTopic = new Map(latestReplies);
  list.replaceChildren();
  if (!data.length) {
    list.append(makeElement("li", "latest-empty", "No discussions yet. Start the first one!"));
    return;
  }

  for (const topic of data) {
    const item = document.createElement("li");
    if (topic.is_featured) item.classList.add("latest-featured-topic");
    if (topic.is_featured) item.append(makeElement("span", "featured-topic-badge", "Featured"));
    const link = makeElement("a", "latest-topic-title", topic.title);
    link.href = `#topic/${topic.id}`;
    item.append(
      link,
      makeElement(
        "span",
        "latest-topic-meta",
        `${topic.boards?.title || "Forum"} · ${topic.profiles?.username || "member"} · ${formatPostRating(awardsByTopic.get(`topic:${topic.id}`))}`
      )
    );
    const latestReply = latestReplyByTopic.get(topic.id);
    if (latestReply) {
      const preview = makeElement(
        "p",
        "latest-reply-preview",
        `↳ ${latestReply.profiles?.username || "member"}: ${latestReply.body}`
      );
      preview.title = latestReply.body;
      item.append(preview);
    }
    appendMemberLabels(item, topic.profiles?.id, null);
    list.append(item);
  }
}

async function loadDailyQuestion() {
  const container = document.querySelector("#daily-question");
  const { data: topic, error } = await supabase.from("topics")
    .select("id,title,created_at,boards!inner(slug)")
    .eq("boards.slug", dailyQuestionBoardSlug)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;

  container.replaceChildren();
  if (!topic) {
    container.append(makeElement("p", "latest-empty", "No question has been posted yet."));
    return;
  }

  const link = makeElement("a", "daily-question-title", topic.title);
  link.href = `#topic/${topic.id}`;
  const closesAt = new Date(new Date(topic.created_at).getTime() + dailyQuestionDurationMs);
  const isOpen = closesAt.getTime() > Date.now();
  const status = makeElement("span", "daily-question-meta", isOpen
    ? `Open for replies until ${formatDate(closesAt)}`
    : "Replies are closed");
  container.append(link, status);
  if (isOpen) {
    window.setTimeout(() => {
      if (link.isConnected) status.textContent = "Replies are closed";
    }, Math.max(0, closesAt.getTime() - Date.now()));
  }
}

async function refreshForum() {
  setForumMessage("Loading the boards…");
  try {
    await Promise.all([loadBoards(), loadStats(), loadLatestDiscussions(), loadDailyQuestion()]);
    setForumMessage("Board activity and counts are live from the forum database.");
  } catch (error) {
    console.error("Could not load forum data:", error);
    const latestDiscussions = document.querySelector("#latest-discussions");
    latestDiscussions.replaceChildren(makeElement("li", "latest-empty", "Recent discussions could not be loaded."));
    setForumMessage(`Could not load forum data: ${error.message}`, true);
  }
}

function appendBackLink(container, label = "← Forum index") {
  const back = makeElement("a", "back-link", label);
  back.href = "#forums";
  container.append(back);
}

async function showMembers(pageNumber = 1) {
  const request = ++membersRequest;
  const page = Math.max(1, Number.parseInt(pageNumber, 10) || 1);
  indexPanel.hidden = true;
  boardView.hidden = true;
  topicView.hidden = true;
  composerView.hidden = true;
  notificationsView.hidden = true;
  membersView.hidden = false;
  membersView.replaceChildren(
    makeElement("h2", "view-title", "Members"),
    makeElement("p", "empty-state", "Loading members…")
  );

  try {
    const start = (page - 1) * membersPerPage;
    const { data, count, error } = await supabase.from("profiles")
      .select("id,username,avatar_url,created_at", { count: "exact" })
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(start, start + membersPerPage - 1);
    if (error) throw error;
    if (request !== membersRequest) return;

    const totalPages = Math.max(1, Math.ceil((count || 0) / membersPerPage));
    if (page > totalPages) {
      window.location.hash = `members/${totalPages}`;
      return;
    }

    const list = makeElement("ol", "member-list");
    list.start = start + 1;
    if (!data.length) {
      list.append(makeElement("li", "empty-state", "No members have joined yet."));
    }
    for (const [index, member] of data.entries()) {
      const item = makeElement("li", "member-list-item");
      const memberNumber = makeElement("span", "member-number", `#${start + index + 1}`);
      const memberIdentity = makeElement("div", "member-list-identity");
      const memberAvatar = makeElement("span", "member-list-avatar", member.username.slice(0, 1).toUpperCase());
      const avatarImage = document.createElement("img");
      const avatarUrl = safeHttpsUrl(member.avatar_url);
      avatarImage.alt = `${member.username}'s profile picture`;
      avatarImage.loading = "lazy";
      setAvatarImage(avatarImage, avatarUrl);
      if (avatarUrl) {
        avatarImage.referrerPolicy = "no-referrer";
      }
      memberAvatar.append(avatarImage);
      const memberName = makeElement("strong", "member-list-name", member.username);
      const joinedDate = makeElement("time", "member-list-date", `Joined ${formatDateOnly(member.created_at)}`);
      joinedDate.dateTime = member.created_at;
      memberIdentity.append(memberAvatar, memberName);
      appendMemberLabels(memberIdentity, member.id, null);
      item.append(memberNumber, memberIdentity, joinedDate);
      list.append(item);
    }

    const pagination = makeElement("nav", "member-pagination");
    pagination.setAttribute("aria-label", "Member list pages");
    if (page > 1) {
      const previous = makeElement("a", "small-button", "← Previous");
      previous.href = `#members/${page - 1}`;
      pagination.append(previous);
    }
    pagination.append(makeElement("span", "member-page-count", `Page ${page} of ${totalPages}`));
    if (page < totalPages) {
      const next = makeElement("a", "small-button", "Next →");
      next.href = `#members/${page + 1}`;
      pagination.append(next);
    }

    membersView.replaceChildren(
      makeElement("h2", "view-title", "Members"),
      makeElement("p", "member-list-summary", `${(count || 0).toLocaleString()} members · numbered by join date`),
      list,
      pagination
    );
  } catch (error) {
    if (request !== membersRequest) return;
    console.error("Could not load members:", error);
    membersView.replaceChildren(
      makeElement("h2", "view-title", "Members"),
      makeElement("p", "form-message error-message", `Could not load members: ${error.message}`)
    );
  }
}

async function showNotifications() {
  const request = ++notificationsRequest;
  const userId = currentUser?.id;
  indexPanel.hidden = true;
  boardView.hidden = true;
  topicView.hidden = true;
  composerView.hidden = true;
  membersView.hidden = true;
  notificationsView.hidden = false;
  notificationsView.replaceChildren(
    makeElement("h2", "view-title", "Notifications"),
    makeElement("p", "empty-state", "Loading notifications…")
  );

  if (!currentUser) {
    const prompt = makeElement("p", "empty-state", "Sign in to view replies to your posts.");
    prompt.append(" ", makeButton("Log in", "auth-login"));
    notificationsView.replaceChildren(makeElement("h2", "view-title", "Notifications"), prompt);
    return;
  }

  try {
    const { data, error } = await supabase.from("reply_notifications")
      .select("id,notification_type,created_at,read_at,replies!reply_notifications_reply_id_fkey(id,body,created_at,parent_reply_id,profiles!replies_author_id_fkey(username),topics!replies_topic_id_fkey(id,title))")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false })
      .range(0, 49);
    if (error) throw error;
    if (request !== notificationsRequest || currentUser?.id !== userId || !notificationsView.isConnected) return;

    const list = makeElement("ul", "notification-list");
    for (const notification of data) {
      const reply = notification.replies;
      if (!reply?.topics) continue;
      const item = makeElement("li", `notification-item${notification.read_at ? "" : " notification-unread"}`);
      const actor = reply.profiles?.username || "A member";
      const action = notification.notification_type === "reply"
        ? "replied to your reply in"
        : "replied to your topic";
      const topicLink = makeElement("a", "notification-topic-link", reply.topics.title);
      topicLink.href = `#topic/${reply.topics.id}`;
      const summary = makeElement("p", "notification-summary");
      summary.append(
        document.createTextNode(`${actor} ${action} `),
        topicLink,
        document.createTextNode(` · ${formatDate(notification.created_at)}`)
      );
      const body = makeElement("p", "notification-reply-body", reply.body);
      item.append(summary, body);
      if (!notification.read_at) {
        item.append(makeButton("Mark as read", `mark-notification:${notification.id}`, "small-button notification-read-button"));
      }
      list.append(item);
    }
    if (!list.childElementCount) {
      list.append(makeElement("li", "empty-state", "No replies to your posts yet."));
    }
    notificationsView.replaceChildren(
      makeElement("h2", "view-title", "Notifications"),
      makeElement("p", "member-list-summary", "Replies to topics you started and direct replies to your replies."),
      list
    );
    await refreshNotificationCount(userId);
  } catch (error) {
    if (request !== notificationsRequest || currentUser?.id !== userId) return;
    console.error("Could not load notifications:", error);
    notificationsView.replaceChildren(
      makeElement("h2", "view-title", "Notifications"),
      makeElement("p", "form-message error-message", `Could not load notifications: ${error.message}`)
    );
  }
}

async function showBoard(slug) {
  membersView.hidden = true;
  notificationsView.hidden = true;
  boardTopicsRequest++;
  const board = boards.find(item => item.slug === slug);
  if (!board) {
    setForumMessage("That board could not be found.", true);
    return;
  }
  boardView.hidden = false;
  topicView.hidden = true;
  composerView.hidden = true;
  indexPanel.hidden = true;
  boardView.replaceChildren();
  appendBackLink(boardView);
  boardView.append(makeElement("h2", "view-title", board.title));
  if (board.description) {
    boardView.append(makeElement("p", "board-description", board.description));
  }
  if (board.slug === dailyQuestionBoardSlug) {
    boardView.append(makeElement(
      "p",
      "empty-state",
      "A new question is posted by a moderator each day. Replies close 24 hours after the question is posted."
    ));
  }
  if (board.slug !== dailyQuestionBoardSlug || moderatorIds.has(currentUser?.id)) {
    boardView.append(addSilkIcon(
      makeButton("Start a topic", `compose:${board.slug}`, "primary-button"),
      "comment-add"
    ));
  }
  const sortControl = makeElement("label", "topic-sort-control");
  sortControl.append(document.createTextNode("Sort posts "));
  const sortSelect = makeElement("select", "topic-sort-select");
  sortSelect.setAttribute("aria-label", "Sort posts");
  for (const [value, label] of [
    ["recent", "Recent activity"],
    ["day", "Active in the last 24 hours"],
    ["week", "Active in the last 7 days"]
  ]) {
    const option = makeElement("option", "", label);
    option.value = value;
    sortSelect.append(option);
  }
  sortControl.append(sortSelect);
  boardView.append(sortControl);
  const list = makeElement("div", "topic-list");
  list.append(makeElement("p", "empty-state", "Loading topics…"));
  boardView.append(list);

  sortSelect.addEventListener("change", () => {
    loadBoardTopics(board, list, sortSelect.value);
  });
  await loadBoardTopics(board, list, sortSelect.value);
}

async function loadBoardTopics(board, list, sort) {
  const request = ++boardTopicsRequest;
  list.replaceChildren(makeElement("p", "empty-state", "Loading topics…"));
  try {
    let query = supabase.from("topics")
      .select("id,title,body,image_url,is_pinned,is_featured,created_at,updated_at,profiles!topics_author_id_fkey(id,username),replies(count)")
      .eq("board_id", board.id);
    if (sort === "day" || sort === "week") {
      const days = sort === "day" ? 1 : 7;
      query = query.gte("updated_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
    }
    const { data, error } = await query
      .order("is_featured", { ascending: false })
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .range(0, 49);
    if (error) throw error;
    if (request !== boardTopicsRequest) return;
    let topics = data;
    if (sort === "day" || sort === "week") {
      const { data: featuredTopic, error: featuredError } = await supabase.from("topics")
        .select("id,title,body,image_url,is_pinned,is_featured,created_at,updated_at,profiles!topics_author_id_fkey(id,username),replies(count)")
        .eq("board_id", board.id)
        .eq("is_featured", true)
        .maybeSingle();
      if (featuredError) throw featuredError;
      if (featuredTopic && !topics.some(topic => topic.id === featuredTopic.id)) {
        topics = [featuredTopic, ...topics].slice(0, 50);
      }
    }
    const awardsByPost = await loadPostAwards("topic", topics.map(topic => topic.id));
    if (request !== boardTopicsRequest) return;
    list.replaceChildren();
    if (!topics.length) {
      list.append(makeElement(
        "p",
        "empty-state",
        sort === "day" || sort === "week"
          ? "No topics were active during this period."
          : "No topics here yet. Start the first conversation."
      ));
      return;
    }
    for (const topic of topics) {
      const item = makeElement("article", "topic-list-item");
      const imageUrl = safeHttpsUrl(topic.image_url);
      if (imageUrl) {
        const imageLink = makeElement("a", "topic-list-image-link");
        imageLink.href = `#topic/${topic.id}`;
        const image = document.createElement("img");
        image.className = "topic-list-image";
        image.src = imageUrl;
        image.alt = "";
        image.loading = "lazy";
        image.referrerPolicy = "no-referrer";
        image.addEventListener("error", () => imageLink.remove(), { once: true });
        imageLink.append(image);
        item.append(imageLink);
      }
      const details = makeElement("div", "topic-list-details");
      const title = makeElement("a", "topic-list-title", topic.title);
      title.href = `#topic/${topic.id}`;
      if (topic.is_featured) {
        const featuredLabel = makeElement("span", "featured-topic-badge", "Featured");
        featuredLabel.setAttribute("aria-label", "Featured topic");
        details.append(featuredLabel);
      }
      if (topic.is_pinned) {
        const pinnedLabel = makeElement("span", "topic-pinned-badge", "Pinned");
        pinnedLabel.setAttribute("aria-label", "Pinned topic");
        details.append(pinnedLabel);
      }
      details.append(title);
      const postAwards = awardsByPost.get(`topic:${topic.id}`);
      const rating = makeElement("span", "topic-vote-rating", formatPostRating(postAwards));
      rating.setAttribute("aria-label", `Post rating: ${formatPostRating(postAwards)}`);
      const voteSummary = makeElement("span", "topic-vote-summary");
      voteSummary.append(rating);
      details.append(voteSummary);
      const replyCount = topic.replies?.[0]?.count || 0;
      const metadata = makeElement("p", "topic-meta");
      metadata.append(document.createTextNode(`${topic.profiles?.username || "member"} · ${formatDate(topic.updated_at)} · ${replyCount} replies`));
      if (canModerateBoard(topic.profiles?.id, board.id)) {
        metadata.append(document.createTextNode(" "), makeModeratorBadge());
      }
      details.append(metadata, makeElement("p", "topic-preview", topic.body));
      if (canModerateBoard(currentUser?.id, board.id)) {
        const pinButton = makeButton(
          topic.is_pinned ? "Unpin" : "Pin",
          `moderate-pin-topic:${topic.id}:${topic.is_pinned ? "false" : "true"}`,
          "small-button moderation-pin"
        );
        pinButton.title = topic.is_pinned ? "Unpin this topic" : "Pin this topic to the top of the board";
        details.append(pinButton);
        if (moderatorIds.has(currentUser?.id)) {
          const featureButton = makeButton(
            topic.is_featured ? "Unfeature" : "Feature",
            `moderate-feature-topic:${topic.id}:${topic.is_featured ? "false" : "true"}`,
            "small-button moderation-feature"
          );
          featureButton.title = topic.is_featured
            ? "Remove this topic from featured"
            : "Feature this topic across the forum; it will replace the current featured topic";
          details.append(featureButton);
        }
      }
      item.append(details);
      list.append(item);
    }
  } catch (error) {
    if (request !== boardTopicsRequest) return;
    console.error("Could not load board topics:", error);
    list.replaceChildren(makeElement("p", "form-message error-message", `Could not load topics: ${error.message}`));
  }
}

function appendPostBody(container, body) {
  const tokenPattern = /\[emoji:([A-Za-z0-9_-]+)\]/g;
  let lastIndex = 0;
  let match;
  while ((match = tokenPattern.exec(body)) !== null) {
    container.append(document.createTextNode(body.slice(lastIndex, match.index)));
    if (emojiNames.includes(match[1])) {
      const image = document.createElement("img");
      image.className = "post-emoji";
      image.src = `assets/emojis/${match[1]}.gif`;
      image.alt = `:${match[1]}:`;
      image.title = `:${match[1]}:`;
      image.loading = "lazy";
      container.append(image);
    } else {
      container.append(document.createTextNode(match[0]));
    }
    lastIndex = tokenPattern.lastIndex;
  }
  container.append(document.createTextNode(body.slice(lastIndex)));
}

function safeHttpsUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function renderPost(profile, date, body, className, imageUrl = null, activity = null, moderationAction = null, memberRating = null, award = null, postType = null, postId = null, isFeatured = false, boardId = null) {
  const post = makeElement("article", `forum-post ${className}`);
  const author = profile?.username || "member";
  const authorPanel = makeElement("aside", "post-author");
  if (activity?.joined_at) {
    const joinedDate = makeElement("time", "post-join-date", `Joined ${formatDateOnly(activity.joined_at)}`);
    joinedDate.dateTime = activity.joined_at;
    authorPanel.append(joinedDate);
  }
  const avatar = makeElement("div", "post-avatar", author.slice(0, 1).toUpperCase());
  const avatarUrl = safeHttpsUrl(profile?.avatar_url);
  const avatarImage = document.createElement("img");
  avatarImage.alt = `${author}'s profile picture`;
  avatarImage.loading = "lazy";
  setAvatarImage(avatarImage, avatarUrl);
  if (avatarUrl) {
    avatarImage.referrerPolicy = "no-referrer";
  }
  avatar.append(avatarImage);
  authorPanel.append(avatar, makeElement("strong", "post-author-name", author));
  appendMemberLabels(authorPanel, profile?.id, activity, boardId);

  const profileLink = safeHttpsUrl(profile?.profile_link);
  if (profileLink) {
    const link = makeElement("a", "post-profile-link", "Personal Page");
    link.href = profileLink;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    authorPanel.append(link);
  }
  if (profile?.signature) {
    authorPanel.append(makeElement("p", "post-signature", profile.signature));
  }

  const content = makeElement("div", "post-content");
  const header = makeElement("div", "post-header");
  header.append(makeElement("time", "", formatDate(date)));
  if (award && postType === "topic" && postId) {
    const voteGroup = makeElement("span", "post-vote-group");
    const rating = makeElement("span", "post-score", formatPostRating(award));
    rating.setAttribute("aria-label", `Post rating: ${formatPostRating(award)}`);
    voteGroup.append(rating);
    const isOwnPost = profile?.id === currentUser?.id;
    const cannotRate = award.voted_by_user || isOwnPost;
    voteGroup.append(makeElement("span", "post-rating-label", "Rate"));
    for (const isPositive of [false, true]) {
      const ratingValue = isPositive ? "1" : "0";
      const label = isPositive ? "↑" : "↓";
      const button = makeButton(
        label,
        `rate:${postType}:${postId}:${ratingValue}`,
        `small-button post-rating-choice${award.user_vote === isPositive ? " selected" : ""}`
      );
      button.setAttribute("aria-label", isPositive ? "Rate this post positively" : "Rate this post negatively");
      button.setAttribute("aria-pressed", String(award.user_vote === isPositive));
      button.title = isPositive ? "Upvote this post" : "Downvote this post";
      if (cannotRate) {
        button.disabled = true;
        if (isOwnPost) button.title = "You cannot rate your own post.";
        else button.title = `You already ${award.user_vote ? "upvoted" : "downvoted"} this post.`;
      }
      voteGroup.append(button);
    }
    header.append(voteGroup);
  }
  if (moderationAction && boardId !== null && canModerateBoard(currentUser?.id, boardId)) {
    const deleteButton = makeButton("Delete", moderationAction, "small-button moderation-delete");
    deleteButton.title = "Remove this post";
    header.append(deleteButton);
  }
  if (postType === "topic" && postId && moderatorIds.has(currentUser?.id)) {
    const featureButton = makeButton(
      isFeatured ? "Unfeature" : "Feature",
      `moderate-feature-topic:${postId}:${isFeatured ? "false" : "true"}`,
      "small-button moderation-feature"
    );
    featureButton.title = isFeatured
      ? "Remove this topic from featured"
      : "Feature this topic across the forum; it will replace the current featured topic";
    header.append(featureButton);
  }
  const postBody = makeElement("p", "post-body");
  appendPostBody(postBody, body);
  content.append(header, postBody);
  const safeImageUrl = safeHttpsUrl(imageUrl);
  if (safeImageUrl) {
    const image = document.createElement("img");
    image.className = "post-image";
    image.src = safeImageUrl;
    image.alt = "Image attached to post";
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => image.remove(), { once: true });
    content.append(image);
  }
  post.append(authorPanel, content);
  return post;
}

async function showTopic(id) {
  membersView.hidden = true;
  notificationsView.hidden = true;
  topicView.hidden = false;
  boardView.hidden = true;
  composerView.hidden = true;
  indexPanel.hidden = true;
  topicView.replaceChildren(makeElement("p", "empty-state", "Loading conversation…"));

  try {
    const [{ data: topic, error: topicError }, { data: replies, error: replyError }] = await Promise.all([
      supabase.from("topics")
        .select("id,board_id,title,body,image_url,is_featured,created_at,profiles!topics_author_id_fkey(id,username,avatar_url,signature,profile_link)")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("replies")
        .select("id,body,image_url,parent_reply_id,created_at,profiles!replies_author_id_fkey(id,username,avatar_url,signature,profile_link)")
        .eq("topic_id", id)
        .order("created_at")
    ]);
    if (topicError) throw topicError;
    if (replyError) throw replyError;
    if (!topic) throw new Error("This topic no longer exists.");

    const topicAwards = await loadPostAwards("topic", [topic.id]);
    const board = boards.find(item => item.id === topic.board_id);
    if (window.location.hash === `#topic/${id}`) {
      document.body.classList.toggle("rathner-board-theme", board?.slug === "rathner");
      updateSiteLogo();
    }
    const isDailyQuestion = board?.slug === dailyQuestionBoardSlug;
    const closesAt = isDailyQuestion
      ? new Date(new Date(topic.created_at).getTime() + dailyQuestionDurationMs)
      : null;
    const isClosed = closesAt !== null && closesAt.getTime() <= Date.now();
    topicView.replaceChildren();
    appendBackLink(topicView, `← ${board?.title || "Forum index"}`);
    topicView.append(makeElement("h2", "view-title", topic.title));
    if (isDailyQuestion) {
      topicView.append(makeElement(
        "p",
        isClosed ? "daily-question-closed" : "daily-question-open",
        isClosed
          ? "This daily question is now read-only. Replies closed 24 hours after it was posted."
          : `Replies are open until ${formatDate(closesAt)}.`
      ));
    }
    topicView.append(renderPost(
      topic.profiles,
      topic.created_at,
      topic.body,
      "topic-first-post",
      topic.image_url,
      null,
      `moderate-delete-topic:${topic.id}`,
      null,
      topicAwards.get(`topic:${topic.id}`),
      "topic",
      topic.id,
      topic.is_featured,
      topic.board_id
    ));
    const repliesById = new Map(replies.map(reply => [reply.id, reply]));
    let replyTarget = null;
    const replyTargetNotice = makeElement("div", "reply-target-notice");
    let replyTextarea;
    for (const reply of replies) {
      const replyPost = renderPost(
        reply.profiles,
        reply.created_at,
        reply.body,
        "topic-reply",
        reply.image_url,
        null,
        `moderate-delete-reply:${reply.id}`,
        null,
        null,
        "reply",
        reply.id,
        false,
        topic.board_id
      );
      const parentReply = repliesById.get(reply.parent_reply_id);
      if (parentReply) {
        const parentAuthor = parentReply.profiles?.username || "member";
        const excerpt = parentReply.body.length > 140
          ? `${parentReply.body.slice(0, 137)}…`
          : parentReply.body;
        const context = makeElement("p", "reply-parent-context", `Replying to ${parentAuthor}: ${excerpt}`);
        replyPost.querySelector(".post-content").prepend(context);
      }
      if (currentUser && !isClosed) {
        const replyButton = makeButton("Reply", "reply-to-reply", "small-button reply-to-button");
        replyButton.addEventListener("click", () => {
          replyTarget = reply;
          replyTargetNotice.replaceChildren(
            makeElement("span", "", `Replying to ${reply.profiles?.username || "member"}`),
            makeButton("Cancel", "cancel-reply-target", "text-button")
          );
          replyTargetNotice.hidden = false;
          replyTextarea.focus();
        });
        replyPost.querySelector(".post-header").append(replyButton);
      }
      topicView.append(replyPost);
    }

    if (isClosed) {
      topicView.append(makeElement("p", "empty-state", "This conversation is read-only."));
    } else if (currentUser) {
      const replyForm = makePostForm("Write a reply", "Post reply", async (body, imageFile) => {
        let imagePath = null;
        let imageUrl = null;
        if (imageFile) {
          imagePath = `${currentUser.id}/${crypto.randomUUID()}`;
          const { error: uploadError } = await supabase.storage
            .from("topic-images")
            .upload(imagePath, imageFile, {
              cacheControl: "3600",
              contentType: imageFile.type,
              upsert: false
            });
          if (uploadError) throw uploadError;
          imageUrl = supabase.storage.from("topic-images").getPublicUrl(imagePath).data.publicUrl;
        }

        const { error } = await supabase.from("replies").insert({
          topic_id: topic.id,
          author_id: currentUser.id,
          parent_reply_id: replyTarget?.id || null,
          body,
          image_url: imageUrl
        });
        if (error) {
          if (imagePath) {
            const { error: cleanupError } = await supabase.storage.from("topic-images").remove([imagePath]);
            if (cleanupError) {
              throw new Error(`Could not post reply: ${error.message}. The uploaded image could not be removed: ${cleanupError.message}`);
            }
          }
          throw error;
        }
        replyTarget = null;
        await refreshForum();
        await refreshNotificationCount(currentUser.id);
        await showTopic(topic.id);
      }, [replyTargetNotice], true);
      replyTargetNotice.hidden = true;
      replyTargetNotice.addEventListener("click", event => {
        if (event.target.closest('[data-action="cancel-reply-target"]')) {
          replyTarget = null;
          replyTargetNotice.hidden = true;
        }
      });
      replyTextarea = replyForm.querySelector('textarea[name="body"]');
      topicView.append(replyForm);
    } else {
      const prompt = makeElement("p", "empty-state", "Sign in to reply to this conversation.");
      prompt.append(" ", makeButton("Log in", "auth-login"));
      topicView.append(prompt);
    }
    if (isDailyQuestion && !isClosed) {
      window.setTimeout(() => {
        if (window.location.hash === `#topic/${topic.id}`) void showTopic(topic.id);
      }, Math.max(0, closesAt.getTime() - Date.now()));
    }
  } catch (error) {
    console.error("Could not load topic:", error);
    topicView.replaceChildren(makeElement("p", "form-message error-message", `Could not load topic: ${error.message}`));
  }
}

function makePostForm(heading, submitLabel, onSubmit, leadingFields = [], includeImage = false) {
  const form = document.createElement("form");
  form.className = "post-form";
  form.append(makeElement("h3", "form-heading", heading));
  form.append(...leadingFields);
  const label = makeElement("label", "form-field", "Message");
  const textarea = document.createElement("textarea");
  textarea.name = "body";
  textarea.required = true;
  textarea.maxLength = 10000;
  textarea.rows = 6;
  textarea.autocomplete = "off";
  label.append(textarea);
  form.append(label);
  const emojiPicker = document.createElement("details");
  emojiPicker.className = "emoji-picker";
  const emojiToggle = makeElement("summary", "emoji-picker-toggle");
  const emojiToggleIcon = document.createElement("img");
  emojiToggleIcon.src = "assets/emojis/smile.gif";
  emojiToggleIcon.alt = "";
  emojiToggleIcon.setAttribute("aria-hidden", "true");
  emojiToggle.append(emojiToggleIcon, makeElement("span", "", "Choose an emoji"));
  emojiPicker.append(emojiToggle);
  const emojiGrid = makeElement("div", "emoji-grid");
  for (const name of emojiNames) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "emoji-choice";
    button.setAttribute("aria-label", `Insert ${name.replaceAll("_", " ")}`);
    button.title = `:${name}:`;
    const image = document.createElement("img");
    image.src = `assets/emojis/${name}.gif`;
    image.alt = "";
    image.loading = "lazy";
    button.append(image);
    button.addEventListener("click", () => {
      textarea.setCustomValidity("");
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const token = `[emoji:${name}]`;
      if (textarea.value.length + token.length - (end - start) > textarea.maxLength) {
        textarea.setCustomValidity("There isn't enough room in this message for that emoji.");
        textarea.reportValidity();
        return;
      }
      textarea.setRangeText(token, start, end, "end");
      textarea.focus();
    });
    emojiGrid.append(button);
  }
  emojiPicker.append(emojiGrid);
  textarea.addEventListener("input", () => textarea.setCustomValidity(""));
  form.append(emojiPicker);
  let imageInput;
  if (includeImage) {
    const imageLabel = makeElement("label", "form-field", "Attach an image (optional)");
    imageInput = document.createElement("input");
    imageInput.name = "image";
    imageInput.type = "file";
    imageInput.accept = ".jpg,.jpeg,.gif,.webp,.png,image/jpeg,image/gif,image/webp,image/png";
    const hint = makeElement("small", "", "JPG, GIF, WebP, or PNG; up to 2 MB.");
    imageLabel.append(imageInput, hint);
    form.append(imageLabel);
  }
  const feedback = makeElement("p", "form-message");
  feedback.setAttribute("role", "status");
  form.append(feedback);
  const submit = makeElement("button", "primary-button", submitLabel);
  submit.type = "submit";
  form.append(submit);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    submit.disabled = true;
    feedback.textContent = "Posting…";
    try {
      const body = textarea.value.trim();
      if (!body) throw new Error("Write a message before posting.");
      const imageFile = imageInput?.files[0] || null;
      if (imageFile) {
        if (!allowedImageTypes.includes(imageFile.type)) {
          throw new Error("Choose a JPG, GIF, WebP, or PNG image file.");
        }
        if (imageFile.size > maxImageSize) {
          throw new Error("Attached images must be 2 MB or smaller.");
        }
      }
      await onSubmit(body, imageFile);
    } catch (error) {
      console.error("Could not submit forum post:", error);
      feedback.textContent = error.message;
      feedback.classList.add("error-message");
      submit.disabled = false;
    }
  });
  return form;
}

function showComposer(slug) {
  membersView.hidden = true;
  notificationsView.hidden = true;
  const board = boards.find(item => item.slug === slug);
  if (!board) {
    setForumMessage("That board could not be found.", true);
    return;
  }
  if (!currentUser) {
    openAuth("signup");
    return;
  }
  if (board.slug === dailyQuestionBoardSlug && !moderatorIds.has(currentUser.id)) {
    setForumMessage("Only moderators can post the daily question.", true);
    window.location.hash = `board/${encodeURIComponent(board.slug)}`;
    return;
  }

  boardView.hidden = true;
  topicView.hidden = true;
  composerView.hidden = false;
  indexPanel.hidden = true;
  composerView.replaceChildren();
  appendBackLink(composerView, `← ${board.title}`);
  composerView.append(makeElement("h2", "view-title", `Start a topic in ${board.title}`));

  const titleLabel = makeElement("label", "form-field", "Topic title");
  const titleInput = document.createElement("input");
  titleInput.name = "title";
  titleInput.required = true;
  titleInput.minLength = 1;
  titleInput.maxLength = 120;
  titleInput.autocomplete = "off";
  titleLabel.append(titleInput);
  const form = makePostForm("Start a new topic", "Post topic", async (body, imageFile) => {
    const title = titleInput.value.trim();
    if (!title) throw new Error("Add a title before posting.");
    let imagePath = null;
    let imageUrl = null;
    if (imageFile) {
      imagePath = `${currentUser.id}/${crypto.randomUUID()}`;
      const { error: uploadError } = await supabase.storage
        .from("topic-images")
        .upload(imagePath, imageFile, {
          cacheControl: "3600",
          contentType: imageFile.type,
          upsert: false
        });
      if (uploadError) throw uploadError;
      imageUrl = supabase.storage.from("topic-images").getPublicUrl(imagePath).data.publicUrl;
    }

    const { data, error } = await supabase.from("topics")
      .insert({ board_id: board.id, author_id: currentUser.id, title, body, image_url: imageUrl })
      .select("id")
      .single();
    if (error) {
      if (imagePath) {
        const { error: cleanupError } = await supabase.storage.from("topic-images").remove([imagePath]);
        if (cleanupError) {
          throw new Error(`Could not create topic: ${error.message}. The uploaded image could not be removed: ${cleanupError.message}`);
        }
      }
      throw error;
    }
    await refreshForum();
    window.location.hash = `topic/${data.id}`;
  }, [titleLabel], true);
  form.addEventListener("submit", event => {
    if (!titleInput.value.trim()) {
      event.preventDefault();
      titleInput.setCustomValidity("Add a title before posting.");
      titleInput.reportValidity();
      titleInput.setCustomValidity("");
    }
  }, true);
  composerView.append(form);
}

function handleRoute() {
  const route = decodeURIComponent(window.location.hash.slice(1));
  document.body.classList.toggle("rathner-board-theme", route === "board/rathner");
  updateSiteLogo();
  const isMembersPage = route === "members" || route.startsWith("members/");
  navLinks.forEach(link => {
    const active = link.dataset.pageNav === (isMembersPage ? "members" : "forums");
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  if (route.startsWith("board/")) {
    const slug = route.slice("board/".length);
    const canonicalSlug = legacyBoardSlugs[slug];
    if (canonicalSlug) {
      window.location.hash = `board/${encodeURIComponent(canonicalSlug)}`;
      return;
    }
    showBoard(slug);
  } else if (route.startsWith("topic/")) {
    showTopic(route.slice("topic/".length));
  } else if (route.startsWith("compose/")) {
    const slug = route.slice("compose/".length);
    const canonicalSlug = legacyBoardSlugs[slug];
    if (canonicalSlug) {
      window.location.hash = `compose/${encodeURIComponent(canonicalSlug)}`;
      return;
    }
    showComposer(slug);
  } else if (isMembersPage) {
    showMembers(route.startsWith("members/") ? route.slice("members/".length) : 1);
  } else if (route === "notifications") {
    showNotifications();
  } else {
    indexPanel.hidden = false;
    boardView.hidden = true;
    topicView.hidden = true;
    composerView.hidden = true;
    membersView.hidden = true;
    notificationsView.hidden = true;
  }
}

function openAuth(mode) {
  authMode.value = mode;
  const signingUp = mode === "signup";
  const requestingReset = mode === "reset-request";
  const updatingPassword = mode === "reset-update";
  document.querySelector("#auth-title").textContent = signingUp
    ? "Join the forum"
    : requestingReset
      ? "Reset your password"
      : updatingPassword
        ? "Choose a new password"
        : "Welcome back";
  document.querySelector("#auth-description").textContent = signingUp
    ? "Create an account to start posting."
    : requestingReset
      ? "Enter your account email and we’ll send a password reset link."
      : updatingPassword
        ? "Choose a new password for your account."
        : "Log in to continue the conversation.";
  document.querySelector("#auth-submit").textContent = signingUp
    ? "Create account"
    : requestingReset
      ? "Send reset link"
      : updatingPassword
        ? "Save new password"
        : "Log in";
  usernameField.hidden = !signingUp;
  emailField.hidden = updatingPassword;
  authForm.elements.email.required = !updatingPassword;
  passwordField.hidden = requestingReset;
  authPassword.required = !requestingReset;
  authForm.elements.username.required = signingUp;
  authPassword.autocomplete = signingUp || updatingPassword ? "new-password" : "current-password";
  authForgot.hidden = signingUp || requestingReset || updatingPassword;
  authSwitch.hidden = updatingPassword;
  authSwitch.textContent = requestingReset
    ? "Back to log in"
    : signingUp
      ? "Already a member? Log in"
      : "Need an account? Sign up";
  authMessage.textContent = "";
  authMessage.classList.remove("error-message");
  if (!authDialog.open) authDialog.showModal();
}

async function openProfile() {
  if (!currentUser) return;
  profileForm.reset();
  profileMessage.textContent = "Loading your profile…";
  profileMessage.classList.remove("error-message");
  const saveButton = document.querySelector("#profile-save");
  saveButton.disabled = true;
  profileDialog.showModal();
  try {
    const { data, error } = await supabase.from("profiles")
      .select("avatar_url,signature,profile_link")
      .eq("id", currentUser.id)
      .single();
    if (error) throw error;
    profileForm.elements.avatar_url.value = data.avatar_url || "";
    profileForm.elements.signature.value = data.signature || "";
    profileForm.elements.profile_link.value = data.profile_link || "";
    profileMessage.textContent = "";
  } catch (error) {
    console.error("Could not load profile:", error);
    profileMessage.textContent = `Could not load profile: ${error.message}`;
    profileMessage.classList.add("error-message");
  } finally {
    saveButton.disabled = false;
  }
}

profileForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!currentUser) return;
  profileMessage.textContent = "";
  profileMessage.classList.remove("error-message");
  const saveButton = document.querySelector("#profile-save");
  saveButton.disabled = true;
  try {
    const avatarFile = profileForm.elements.avatar_file.files[0];
    const avatarInput = profileForm.elements.avatar_url.value.trim();
    const linkInput = profileForm.elements.profile_link.value.trim();
    const profileLink = safeHttpsUrl(linkInput);
    if (linkInput && !profileLink) throw new Error("Profile link must be a valid https:// link.");

    let avatarUrl = null;
    if (avatarFile) {
      if (!allowedImageTypes.includes(avatarFile.type)) {
        throw new Error("Choose a JPG, GIF, WebP, or PNG image file.");
      }
      if (avatarFile.size > maxImageSize) {
        throw new Error("Profile picture files must be 2 MB or smaller.");
      }

      profileMessage.textContent = "Uploading profile picture…";
      const { error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(`${currentUser.id}/avatar`, avatarFile, {
          cacheControl: "0",
          contentType: avatarFile.type,
          upsert: true
        });
      if (uploadError) throw uploadError;
      avatarUrl = supabase.storage.from("profile-avatars")
        .getPublicUrl(`${currentUser.id}/avatar`).data.publicUrl;
    } else {
      avatarUrl = safeHttpsUrl(avatarInput);
      if (avatarInput && !avatarUrl) {
        throw new Error("Profile picture URL must be a valid https:// link.");
      }
    }

    profileMessage.textContent = "Saving profile…";
    const { error } = await supabase.from("profiles").update({
      avatar_url: avatarUrl,
      signature: profileForm.elements.signature.value.trim() || null,
      profile_link: profileLink
    }).eq("id", currentUser.id);
    if (error) throw error;
    updateAccount(currentUser);
    profileDialog.close();
    handleRoute();
  } catch (error) {
    console.error("Could not save profile:", error);
    profileMessage.textContent = error.message;
    profileMessage.classList.add("error-message");
  } finally {
    saveButton.disabled = false;
  }
});

function getTopicImagePath(imageUrl) {
  const safeUrl = safeHttpsUrl(imageUrl);
  if (!safeUrl) return null;
  const parsedUrl = new URL(safeUrl);
  const projectOrigin = new URL(supabaseUrl).origin;
  const publicBucketPrefix = "/storage/v1/object/public/topic-images/";
  if (parsedUrl.origin !== projectOrigin || !parsedUrl.pathname.startsWith(publicBucketPrefix)) return null;
  try {
    return decodeURIComponent(parsedUrl.pathname.slice(publicBucketPrefix.length));
  } catch {
    return null;
  }
}

async function moderateDeleteTopic(topicId) {
  if (!window.confirm("Delete this topic and all of its replies? This cannot be undone.")) return;

  const { data: topic, error: topicError } = await supabase.from("topics")
    .select("id,board_id,image_url")
    .eq("id", topicId)
    .maybeSingle();
  if (topicError) throw topicError;
  if (!topic) throw new Error("This topic no longer exists.");
  if (!canModerateBoard(currentUser?.id, topic.board_id)) {
    throw new Error("Moderator access is required for this board.");
  }

  const { data: replies, error: repliesError } = await supabase.from("replies")
    .select("image_url")
    .eq("topic_id", topicId);
  if (repliesError) throw repliesError;

  const imagePaths = [topic.image_url, ...replies.map(reply => reply.image_url)]
    .map(getTopicImagePath)
    .filter(Boolean);
  let cleanupError = null;
  const isGlobalModerator = moderatorIds.has(currentUser?.id);
  if (imagePaths.length && !isGlobalModerator) {
    const result = await supabase.storage.from("topic-images").remove(imagePaths);
    cleanupError = result.error;
  }

  const { data: deleted, error } = await supabase.from("topics")
    .delete()
    .eq("id", topicId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!deleted) throw new Error("The topic could not be deleted. Check moderator access.");

  if (imagePaths.length && isGlobalModerator) {
    const result = await supabase.storage.from("topic-images").remove(imagePaths);
    cleanupError = result.error;
  }

  await refreshForum();
  const board = boards.find(item => item.id === topic.board_id);
  window.location.hash = board ? `board/${encodeURIComponent(board.slug)}` : "forums";
  if (cleanupError) {
    setForumMessage(`The topic was deleted, but one or more attached images could not be removed: ${cleanupError.message}`, true);
  }
}

async function moderateDeleteReply(replyId) {
  if (!window.confirm("Delete this reply? This cannot be undone.")) return;

  const { data: reply, error: replyError } = await supabase.from("replies")
    .select("topic_id,image_url")
    .eq("id", replyId)
    .maybeSingle();
  if (replyError) throw replyError;
  if (!reply) throw new Error("This reply no longer exists.");

  const { data: topic, error: topicError } = await supabase.from("topics")
    .select("board_id")
    .eq("id", reply.topic_id)
    .maybeSingle();
  if (topicError) throw topicError;
  if (!topic || !canModerateBoard(currentUser?.id, topic.board_id)) {
    throw new Error("Moderator access is required for this board.");
  }

  const imagePath = getTopicImagePath(reply.image_url);
  let cleanupError = null;
  const isGlobalModerator = moderatorIds.has(currentUser?.id);
  if (imagePath && !isGlobalModerator) {
    const result = await supabase.storage.from("topic-images").remove([imagePath]);
    cleanupError = result.error;
  }

  const { data: deleted, error } = await supabase.from("replies")
    .delete()
    .eq("id", replyId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!deleted) throw new Error("The reply could not be deleted. Check moderator access.");
  if (imagePath && isGlobalModerator) {
    const result = await supabase.storage.from("topic-images").remove([imagePath]);
    cleanupError = result.error;
  }
  await refreshForum();
  await showTopic(reply.topic_id);
  if (cleanupError) {
    setForumMessage(`The reply was deleted, but its image could not be removed: ${cleanupError.message}`, true);
  }
}

async function markNotificationRead(notificationId) {
  try {
    const { error } = await supabase.rpc("mark_reply_notification_read", {
      p_notification_id: notificationId
    });
    if (error) throw error;
    await showNotifications();
  } catch (error) {
    console.error("Could not mark notification as read:", error);
    setForumMessage(`Could not mark notification as read: ${error.message}`, true);
  }
}

async function runModerationAction(action) {
  try {
    if (action.startsWith("moderate-delete-topic:")) {
      await moderateDeleteTopic(action.slice("moderate-delete-topic:".length));
    } else if (action.startsWith("moderate-delete-reply:")) {
      await moderateDeleteReply(action.slice("moderate-delete-reply:".length));
    } else if (action.startsWith("moderate-pin-topic:")) {
      const [, topicId, pinnedValue] = action.split(":");
      const { data: topic, error: topicError } = await supabase.from("topics")
        .select("board_id")
        .eq("id", topicId)
        .maybeSingle();
      if (topicError) throw topicError;
      if (!topic || !canModerateBoard(currentUser?.id, topic.board_id)) {
        throw new Error("Moderator access is required for this board.");
      }
      const { error } = await supabase.rpc("set_topic_pinned", {
        p_topic_id: topicId,
        p_is_pinned: pinnedValue === "true"
      });
      if (error) throw error;
      const route = decodeURIComponent(window.location.hash.slice(1));
      if (route.startsWith("board/")) await showBoard(route.slice("board/".length));
    } else if (action.startsWith("moderate-feature-topic:")) {
      if (!moderatorIds.has(currentUser?.id)) throw new Error("Moderator access is required.");
      const [, topicId, featuredValue] = action.split(":");
      const { error } = await supabase.rpc("set_topic_featured", {
        p_topic_id: topicId,
        p_is_featured: featuredValue === "true"
      });
      if (error) throw error;
      await refreshForum();
      const route = decodeURIComponent(window.location.hash.slice(1));
      if (route.startsWith("board/")) await showBoard(route.slice("board/".length));
      else if (route.startsWith("topic/")) await showTopic(route.slice("topic/".length));
    }
  } catch (error) {
    console.error("Could not complete moderation action:", error);
    setForumMessage(`Could not complete moderation action: ${error.message}`, true);
  }
}

async function runRatingAction(action) {
  if (!currentUser) {
    openAuth("login");
    return;
  }

  const [, postType, postId, positiveValue] = action.split(":");
  const parameters = {
    p_topic_id: postType === "topic" ? postId : null,
    p_reply_id: postType === "reply" ? postId : null,
    p_is_positive: positiveValue === "1"
  };
  try {
    const { error } = await supabase.rpc("cast_post_vote", parameters);
    if (error) throw error;
    const route = decodeURIComponent(window.location.hash.slice(1));
    if (route.startsWith("topic/")) await showTopic(route.slice("topic/".length));
  } catch (error) {
    console.error("Could not submit post rating:", error);
    setForumMessage(`Could not submit rating: ${error.message}`, true);
  }
}

document.addEventListener("click", event => {
  const authButton = event.target.closest("[data-auth]");
  if (authButton) {
    if (!supabase) {
      setForumMessage("Forum setup is not finished. Add the Supabase project details first.", true);
      return;
    }
    openAuth(authButton.dataset.auth);
    return;
  }
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const action = actionButton.dataset.action;
  if (action === "edit-forum-news") {
    if (!currentUser || !moderatorIds.has(currentUser.id)) return;
    forumNewsForm.elements.headline.value = forumNewsHeadline.textContent;
    forumNewsForm.elements.body.value = forumNewsBody.textContent;
    forumNewsMessage.textContent = "";
    forumNewsEditor.hidden = false;
    forumNewsForm.elements.headline.focus();
  } else if (action === "cancel-forum-news") {
    forumNewsEditor.hidden = true;
  } else if (action === "notifications") {
    window.location.hash = "notifications";
  } else if (action.startsWith("mark-notification:")) {
    void markNotificationRead(action.slice("mark-notification:".length));
  } else if (action === "make-post") {
    if (!supabase) {
      setForumMessage("Forum setup is not finished. Add the Supabase project details first.", true);
      return;
    }
    if (currentUser) {
      window.location.hash = "compose/off-topic";
    } else {
      openAuth("signup");
    }
  } else if (action.startsWith("moderate-delete-") || action.startsWith("moderate-pin-topic:") || action.startsWith("moderate-feature-topic:")) {
    void runModerationAction(action);
  } else if (action.startsWith("rate:")) {
    void runRatingAction(action);
  } else if (action === "auth-signup" || action === "auth-login") {
    if (!supabase) {
      setForumMessage("Forum setup is not finished. Add the Supabase project details first.", true);
      return;
    }
    openAuth(action === "auth-signup" ? "signup" : "login");
  } else if (action === "profile-edit") {
    if (!supabase) return;
    openProfile();
  } else if (action === "logout") {
    if (!supabase) return;
    supabase.auth.signOut().then(({ error }) => {
      if (error) setForumMessage(`Could not log out: ${error.message}`, true);
    });
  } else if (action.startsWith("compose:")) {
    window.location.hash = `compose/${encodeURIComponent(action.slice("compose:".length))}`;
  }
});

document.querySelectorAll("[data-close-dialog]").forEach(button => {
  button.addEventListener("click", () => authDialog.close());
});

document.querySelector("[data-close-profile]").addEventListener("click", () => profileDialog.close());

forumNewsForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!currentUser || !moderatorIds.has(currentUser.id)) {
    forumNewsEditor.hidden = true;
    return;
  }

  const saveButton = forumNewsForm.querySelector('button[type="submit"]');
  saveButton.disabled = true;
  forumNewsMessage.classList.remove("error-message");
  forumNewsMessage.textContent = "Saving news…";
  try {
    const headline = forumNewsForm.elements.headline.value.trim();
    const body = forumNewsForm.elements.body.value.trim();
    const { data, error } = await supabase.from("forum_news")
      .update({ headline, body })
      .eq("singleton", true)
      .select("headline,body")
      .single();
    if (error) throw error;
    renderForumNews(data);
    forumNewsEditor.hidden = true;
    forumNewsMessage.textContent = "News updated.";
  } catch (error) {
    console.error("Could not update forum news:", error);
    forumNewsMessage.textContent = `Could not update forum news: ${error.message}`;
    forumNewsMessage.classList.add("error-message");
  } finally {
    saveButton.disabled = false;
  }
});

authForgot.addEventListener("click", () => {
  openAuth("reset-request");
});

authSwitch.addEventListener("click", () => {
  if (authMode.value === "reset-request") {
    openAuth("login");
    return;
  }
  openAuth(authMode.value === "signup" ? "login" : "signup");
});

authForm.addEventListener("submit", async event => {
  event.preventDefault();
  authMessage.textContent = "";
  const submit = document.querySelector("#auth-submit");
  submit.disabled = true;
  try {
    const email = authForm.elements.email.value.trim();
    const password = authPassword.value;
    if (authMode.value === "reset-request") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${window.location.pathname}`
      });
      if (error) throw error;
      authMessage.textContent = "If an account exists for that email, a password reset link has been sent.";
    } else if (authMode.value === "reset-update") {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      authDialog.close();
      setForumMessage("Your password has been reset. You are now logged in.");
    } else if (authMode.value === "signup") {
      const username = authForm.elements.username.value.trim().toLowerCase();
      if (isReservedUsername(username)) {
        throw new Error("That forum name is reserved for staff or the site owner. Please choose another.");
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) throw error;
      if (data.session) {
        authDialog.close();
        await refreshForum();
      } else {
        authMessage.textContent = "Check your email for a confirmation link, then come back to log in.";
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      authDialog.close();
      handleRoute();
    }
  } catch (error) {
    console.error("Authentication request failed:", error);
    authMessage.textContent = error.message;
    authMessage.classList.add("error-message");
  } finally {
    submit.disabled = false;
  }
});

window.addEventListener("hashchange", handleRoute);
window.setInterval(() => {
  if (currentUser) void refreshNotificationCount(currentUser.id);
}, 60 * 1000);

if (!supabaseUrl || !supabaseAnonKey) {
  boardList.replaceChildren();
  const row = document.createElement("tr");
  const cell = makeElement("td", "empty-state", "Forum setup is not finished yet. Add your Supabase project details and run the database setup in SUPABASE_SETUP.md.");
  cell.colSpan = 4;
  row.append(cell);
  boardList.append(row);
  document.querySelector("#latest-discussions")
    .replaceChildren(makeElement("li", "latest-empty", "Recent discussions will appear after forum setup."));
  document.querySelector("#daily-question")
    .replaceChildren(makeElement("p", "latest-empty", "Today’s question will appear after forum setup."));
  setForumMessage("No sample posts or statistics are shown. This forum will display live activity after setup.");
  handleRoute();
} else {
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    supabase.auth.onAuthStateChange(event => {
      if (event === "PASSWORD_RECOVERY") {
        openAuth("reset-update");
      }
    });
    await loadModerators();
    try {
      await loadForumNews();
    } catch (error) {
      console.error("Could not load forum news:", error);
      forumNewsMessage.textContent = `Could not load forum news: ${error.message}`;
      forumNewsMessage.classList.add("error-message");
    }
    const { data: { session } } = await supabase.auth.getSession();
    updateAccount(session?.user || null);
    supabase.auth.onAuthStateChange((event, nextSession) => {
      updateAccount(nextSession?.user || null);
    });
    const initialRoute = decodeURIComponent(window.location.hash.slice(1));
    const initialMembersRoute = initialRoute === "members" || initialRoute.startsWith("members/");
    if (initialMembersRoute) handleRoute();
    await refreshForum();
    const currentRoute = decodeURIComponent(window.location.hash.slice(1));
    if (currentRoute !== "members" && !currentRoute.startsWith("members/")) handleRoute();
  } catch (error) {
    console.error("Could not initialize the forum:", error);
    setForumMessage(`Could not connect to the forum: ${error.message}`, true);
  }
}
