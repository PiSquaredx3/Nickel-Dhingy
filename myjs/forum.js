import { supabaseAnonKey, supabaseUrl } from "../supabase-config.js";

const boardList = document.querySelector("#board-list");
const forumMessage = document.querySelector("#forum-message");
const boardView = document.querySelector("#board-view");
const topicView = document.querySelector("#topic-view");
const composerView = document.querySelector("#composer-view");
const membersView = document.querySelector("#members-view");
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
const medalCaseStatus = document.querySelector("#medal-case-status");
const medalShelves = document.querySelector("#medal-shelves");
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
  "off-topic": "general-2",
  music: "music-discussion"
};
let supabase;
let currentUser;
let boards = [];
let moderatorIds = new Set();
let medalCaseRequest = 0;
let membersRequest = 0;
let boardTopicsRequest = 0;
const membersPerPage = 25;

const siteTitles = [
  "Another Retro Gaming Larping Forum",
  "Larp Larp Larp Shaur",
  "Hi RetroDev",
  "I, I don't know what to add to this forum ngl",
  "We're just like BitView. except like we don't host videos, actually we're more like SomethingAwful"
];

const allowedImageTypes = ["image/jpeg", "image/gif", "image/webp", "image/png"];
const maxImageSize = 2 * 1024 * 1024;
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
  "russian_ru", "sad", "sarcasm", "sarcastic", "sarcastic_blum", "sarcastic_hand", "scare", "scaut",
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
  const { data, error } = await supabase.from("moderators").select("user_id");
  if (error) throw error;
  moderatorIds = new Set(data.map(moderator => moderator.user_id));
}

async function loadMemberActivity(userIds) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return new Map();
  const { data, error } = await supabase.from("member_activity")
    .select("user_id,joined_at")
    .in("user_id", ids);
  if (error) throw error;
  return new Map(data.map(activity => [activity.user_id, activity]));
}

async function loadMemberMedals(userIds) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return new Map();
  const { data, error } = await supabase.from("member_medals")
    .select("user_id,bronze_count,silver_count,gold_count")
    .in("user_id", ids);
  if (error) throw error;
  return new Map(data.map(medals => [medals.user_id, medals]));
}

async function updateMedalCase(user) {
  const request = ++medalCaseRequest;
  if (!user) {
    medalShelves.hidden = true;
    medalCaseStatus.hidden = false;
    medalCaseStatus.textContent = "Sign in to see your medals.";
    return;
  }

  medalCaseStatus.hidden = false;
  medalCaseStatus.textContent = "Loading your medals…";
  medalShelves.hidden = true;

  try {
    const medalsByUser = await loadMemberMedals([user.id]);
    if (request !== medalCaseRequest || currentUser?.id !== user.id) return;
    const medals = medalsByUser.get(user.id) || {};
    const tiers = [
      { name: "Gold", key: "gold_count", className: "medal-icon-gold", target: "#gold-medal-tokens" },
      { name: "Silver", key: "silver_count", className: "medal-icon-silver", target: "#silver-medal-tokens" },
      { name: "Bronze", key: "bronze_count", className: "medal-icon-bronze", target: "#bronze-medal-tokens" }
    ];
    let medalCount = 0;

    for (const tier of tiers) {
      const count = medals[tier.key] || 0;
      medalCount += count;
      const tokens = document.querySelector(tier.target);
      tokens.replaceChildren();
      for (let index = 0; index < count; index += 1) {
        const token = document.createElement("img");
        token.className = `medal-token ${tier.className}`;
        token.src = "assets/silk-icons/star.png";
        token.alt = `${tier.name} medal`;
        token.title = `${tier.name} medal`;
        tokens.append(token);
      }
    }

    if (!medalCount) {
      medalCaseStatus.textContent = "Your Medal Case is empty.... Post to earn some!";
      medalCaseStatus.hidden = false;
      medalShelves.hidden = true;
      return;
    }
    medalCaseStatus.textContent = "";
    medalCaseStatus.hidden = true;
    medalShelves.hidden = false;
  } catch (error) {
    if (request !== medalCaseRequest || currentUser?.id !== user.id) return;
    console.error("Could not load your medal case:", error);
    medalCaseStatus.textContent = `Could not load your medals: ${error.message}`;
  }
}

async function loadPostAwards(postType, postIds) {
  if (!postIds.length) return new Map();
  const { data, error } = await supabase.from("post_awards")
    .select("post_type,post_id,author_id,vote_count,voted_by_user,bronze_awarded,bronze_count,silver_awarded,gold_awarded")
    .eq("post_type", postType)
    .in("post_id", postIds);
  if (error) throw error;
  return new Map(data.map(award => [`${award.post_type}:${award.post_id}`, award]));
}

function appendMemberLabels(container, userId, medals) {
  const labels = makeElement("span", "member-labels");
  let hasLabels = false;
  if (moderatorIds.has(userId)) {
    labels.append(makeModeratorBadge());
    hasLabels = true;
  }

  for (const [name, className, count] of [
    ["Bronze", "medal-bronze", medals?.bronze_count],
    ["Silver", "medal-silver", medals?.silver_count],
    ["Gold", "medal-gold", medals?.gold_count]
  ]) {
    if (!count) continue;
    const badge = makeMedalBadge(name, className);
    badge.title = `${count} ${name} medal${count === 1 ? "" : "s"} earned`;
    labels.append(badge);
    hasLabels = true;
  }

  if (hasLabels) container.append(labels);
}

function makeMedalBadge(name, className) {
  const badge = makeElement("span", `medal-badge ${className}`);
  badge.setAttribute("role", "img");
  badge.setAttribute("aria-label", `${name} medal`);
  badge.title = `${name} medal`;
  const icon = document.createElement("img");
  icon.className = `medal-inline-icon ${className.replace("medal-", "medal-icon-")}`;
  icon.src = "assets/silk-icons/star.png";
  icon.alt = "";
  icon.setAttribute("aria-hidden", "true");
  badge.append(icon);
  return badge;
}

function makeModeratorBadge() {
  const badge = makeElement("span", "moderator-badge");
  badge.setAttribute("role", "img");
  badge.setAttribute("aria-label", "Moderator");
  badge.title = "Moderator";
  badge.append(makeElement("span", "moderator-badge-text", "MOD"));
  return badge;
}

function appendMemberMedalStars(container, medals) {
  const tiers = [
    ["Bronze", "medal-bronze", medals?.bronze_count || 0],
    ["Silver", "medal-silver", medals?.silver_count || 0],
    ["Gold", "medal-gold", medals?.gold_count || 0]
  ];
  const totalCount = tiers.reduce((total, [, , count]) => total + count, 0);
  if (!totalCount) return;

  const stars = makeElement("span", "post-author-medals");
  const description = [];
  for (const [name, className, count] of tiers) {
    if (!count) continue;
    description.push(`${count} ${name}`);
    for (let index = 0; index < count; index += 1) {
      stars.append(makeMedalBadge(name, className));
    }
  }
  const label = `Member medals: ${description.join(", ")}`;
  stars.setAttribute("role", "img");
  stars.setAttribute("aria-label", label);
  stars.title = label;
  container.append(stars);
}

function appendPostAwardBadges(container, award) {
  if (!award) return;
  const tiers = [
    ["Bronze", "medal-bronze", award.bronze_count || 0],
    ["Silver", "medal-silver", award.silver_awarded ? 1 : 0],
    ["Gold", "medal-gold", award.gold_awarded ? 1 : 0]
  ];
  const earned = tiers.filter(([, , count]) => count > 0);
  if (!earned.length) return;

  const badges = makeElement("span", "post-award-badges");
  const description = `Post medals: ${earned.map(([name, , count]) =>
    `${count} ${name} medal${count === 1 ? "" : "s"}`
  ).join(", ")}`;
  badges.setAttribute("role", "img");
  badges.setAttribute("aria-label", description);
  badges.title = description;
  for (const [name, className, count] of earned) {
    for (let index = 0; index < count; index += 1) {
      badges.append(makeMedalBadge(name, className));
    }
  }
  container.append(badges);
}

function setStat(name, value) {
  document.querySelectorAll(`[data-stat="${name}"]`).forEach(element => {
    element.textContent = value.toLocaleString();
  });
}

function updateAccount(user) {
  currentUser = user;
  void updateMedalCase(user);
  const links = document.querySelector("#account-links");
  links.replaceChildren();

  if (user) {
    const username = user.user_metadata?.username || "member";
    const profileButton = makeButton("", "profile-edit", "text-button account-name");
    profileButton.setAttribute("aria-label", `Edit profile for ${username}`);
    const avatar = makeElement("span", "account-avatar", username.slice(0, 1).toUpperCase());
    profileButton.append(avatar, makeElement("span", "", username));
    if (moderatorIds.has(user.id)) {
      const moderatorBadge = makeModeratorBadge();
      moderatorBadge.classList.add("account-moderator-badge");
      profileButton.append(moderatorBadge);
    }
    links.append(profileButton);
    links.append(makeButton("Log out", "logout", "text-button"));
    void loadAccountAvatar(user.id, avatar);
  } else {
    links.append(makeButton("Sign up", "auth-signup", "text-button"));
    links.append(makeElement("span", "", "|"));
    links.append(makeButton("Log in", "auth-login", "text-button"));
  }
}

async function loadAccountAvatar(userId, avatar) {
  try {
    const { data, error } = await supabase.from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();
    if (error) throw error;
    if (currentUser?.id !== userId || !avatar.isConnected) return;
    const avatarUrl = safeHttpsUrl(data.avatar_url);
    if (!avatarUrl) return;

    const image = document.createElement("img");
    image.src = avatarUrl;
    image.alt = "";
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => image.remove(), { once: true });
    avatar.append(image);
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
    .select("id,slug,title,category,position")
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
    .select("id,title,updated_at,profiles!topics_author_id_fkey(id,username),boards!topics_board_id_fkey(title)")
    .order("updated_at", { ascending: false })
    .limit(5);
  if (error) throw error;

  const list = document.querySelector("#latest-discussions");
  list.replaceChildren();
  if (!data.length) {
    list.append(makeElement("li", "latest-empty", "No discussions yet. Start the first one!"));
    return;
  }

  for (const topic of data) {
    const item = document.createElement("li");
    const link = makeElement("a", "latest-topic-title", topic.title);
    link.href = `#topic/${topic.id}`;
    item.append(
      link,
      makeElement("span", "latest-topic-meta", `${topic.boards?.title || "Forum"} · ${topic.profiles?.username || "member"}`)
    );
    appendMemberLabels(item, topic.profiles?.id, null);
    list.append(item);
  }
}

async function refreshForum() {
  setForumMessage("Loading the boards…");
  try {
    await Promise.all([loadBoards(), loadStats(), loadLatestDiscussions()]);
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
  membersView.hidden = false;
  membersView.replaceChildren(
    makeElement("h2", "view-title", "Members"),
    makeElement("p", "empty-state", "Loading members…")
  );

  try {
    const start = (page - 1) * membersPerPage;
    const { data, count, error } = await supabase.from("profiles")
      .select("id,username,created_at", { count: "exact" })
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

    const medalsByUser = await loadMemberMedals(data.map(member => member.id));
    if (request !== membersRequest) return;
    const list = makeElement("ol", "member-list");
    list.start = start + 1;
    if (!data.length) {
      list.append(makeElement("li", "empty-state", "No members have joined yet."));
    }
    for (const [index, member] of data.entries()) {
      const item = makeElement("li", "member-list-item");
      const memberNumber = makeElement("span", "member-number", `#${start + index + 1}`);
      const memberName = makeElement("strong", "member-list-name", member.username);
      const joinedDate = makeElement("time", "member-list-date", `Joined ${formatDateOnly(member.created_at)}`);
      joinedDate.dateTime = member.created_at;
      item.append(memberNumber, memberName, joinedDate);
      appendMemberLabels(item, member.id, medalsByUser.get(member.id));
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

async function showBoard(slug) {
  membersView.hidden = true;
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
  boardView.append(addSilkIcon(
    makeButton("Start a topic", `compose:${board.slug}`, "primary-button"),
    "comment-add"
  ));
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
      .select("id,title,body,image_url,is_pinned,created_at,updated_at,profiles!topics_author_id_fkey(id,username),replies(count)")
      .eq("board_id", board.id);
    if (sort === "day" || sort === "week") {
      const days = sort === "day" ? 1 : 7;
      query = query.gte("updated_at", new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());
    }
    const { data, error } = await query
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false })
      .range(0, 49);
    if (error) throw error;
    if (request !== boardTopicsRequest) return;
    const awardsByPost = await loadPostAwards("topic", data.map(topic => topic.id));
    if (request !== boardTopicsRequest) return;
    list.replaceChildren();
    if (!data.length) {
      list.append(makeElement(
        "p",
        "empty-state",
        sort === "day" || sort === "week"
          ? "No topics were active during this period."
          : "No topics here yet. Start the first conversation."
      ));
      return;
    }
    for (const topic of data) {
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
      if (topic.is_pinned) {
        const pinnedLabel = makeElement("span", "topic-pinned-badge", "Pinned");
        pinnedLabel.setAttribute("aria-label", "Pinned topic");
        details.append(pinnedLabel);
      }
      details.append(title);
      const voteCount = awardsByPost.get(`topic:${topic.id}`)?.vote_count || 0;
      const rating = makeElement("span", "topic-vote-rating", `${voteCount} ${voteCount === 1 ? "vote" : "votes"}`);
      rating.setAttribute("aria-label", `Rating: ${voteCount} ${voteCount === 1 ? "vote" : "votes"}`);
      const postAwards = awardsByPost.get(`topic:${topic.id}`);
      const goldAwards = postAwards?.gold_awarded
        ? { gold_awarded: true }
        : null;
      const voteSummary = makeElement("span", "topic-vote-summary");
      voteSummary.append(rating);
      appendPostAwardBadges(voteSummary, goldAwards);
      details.append(voteSummary);
      const replyCount = topic.replies?.[0]?.count || 0;
      const metadata = makeElement("p", "topic-meta");
      metadata.append(document.createTextNode(`${topic.profiles?.username || "member"} · ${formatDate(topic.updated_at)} · ${replyCount} replies`));
      if (moderatorIds.has(topic.profiles?.id)) {
        metadata.append(document.createTextNode(" "), makeModeratorBadge());
      }
      details.append(metadata, makeElement("p", "topic-preview", topic.body));
      if (moderatorIds.has(currentUser?.id)) {
        const pinButton = makeButton(
          topic.is_pinned ? "Unpin" : "Pin",
          `moderate-pin-topic:${topic.id}:${topic.is_pinned ? "false" : "true"}`,
          "small-button moderation-pin"
        );
        pinButton.title = topic.is_pinned ? "Unpin this topic" : "Pin this topic to the top of the board";
        details.append(pinButton);
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

function renderPost(profile, date, body, className, imageUrl = null, activity = null, moderationAction = null, medals = null, award = null, postType = null, postId = null) {
  const post = makeElement("article", `forum-post ${className}`);
  const author = profile?.username || "member";
  const authorPanel = makeElement("aside", "post-author");
  if (activity?.joined_at) {
    const joinedDate = makeElement("time", "post-join-date", `Joined ${formatDateOnly(activity.joined_at)}`);
    joinedDate.dateTime = activity.joined_at;
    authorPanel.append(joinedDate);
  }
  appendMemberMedalStars(authorPanel, medals);
  const avatar = makeElement("div", "post-avatar", author.slice(0, 1).toUpperCase());
  const avatarUrl = safeHttpsUrl(profile?.avatar_url);
  if (avatarUrl) {
    const image = document.createElement("img");
    image.src = avatarUrl;
    image.alt = `${author}'s profile picture`;
    image.loading = "lazy";
    image.referrerPolicy = "no-referrer";
    image.addEventListener("error", () => image.remove(), { once: true });
    avatar.append(image);
  }
  authorPanel.append(avatar, makeElement("strong", "post-author-name", author));
  appendMemberLabels(authorPanel, profile?.id, null);

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
  if (award && postType && postId) {
    const voteGroup = makeElement("span", "post-vote-group");
    if (postType === "topic") {
      appendPostAwardBadges(voteGroup, award);
    }
    const voteButton = makeButton(
      award.voted_by_user ? `Voted · ${award.vote_count}` : `Vote · ${award.vote_count}`,
      `vote:${postType}:${postId}`,
      "small-button post-vote"
    );
    if (award.voted_by_user || profile?.id === currentUser?.id) {
      voteButton.disabled = true;
      if (profile?.id === currentUser?.id) voteButton.title = "You cannot vote on your own post.";
    }
    voteGroup.append(voteButton);
    header.append(voteGroup);
  }
  if (moderationAction && moderatorIds.has(currentUser?.id)) {
    const deleteButton = makeButton("Delete", moderationAction, "small-button moderation-delete");
    deleteButton.title = "Remove this post";
    header.append(deleteButton);
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
  topicView.hidden = false;
  boardView.hidden = true;
  composerView.hidden = true;
  indexPanel.hidden = true;
  topicView.replaceChildren(makeElement("p", "empty-state", "Loading conversation…"));

  try {
    const [{ data: topic, error: topicError }, { data: replies, error: replyError }] = await Promise.all([
      supabase.from("topics")
        .select("id,board_id,title,body,image_url,created_at,profiles!topics_author_id_fkey(id,username,avatar_url,signature,profile_link)")
        .eq("id", id)
        .maybeSingle(),
      supabase.from("replies")
        .select("id,body,created_at,profiles!replies_author_id_fkey(id,username,avatar_url,signature,profile_link)")
        .eq("topic_id", id)
        .order("created_at")
    ]);
    if (topicError) throw topicError;
    if (replyError) throw replyError;
    if (!topic) throw new Error("This topic no longer exists.");

    const profiles = [topic.profiles, ...replies.map(reply => reply.profiles)];
    const profileIds = profiles.map(profile => profile?.id);
    const replyIds = replies.map(reply => reply.id);
    const [activityByUser, medalsByUser, topicAwards, replyAwards] = await Promise.all([
      loadMemberActivity(profileIds),
      loadMemberMedals(profileIds),
      loadPostAwards("topic", [topic.id]),
      loadPostAwards("reply", replyIds)
    ]);
    const board = boards.find(item => item.id === topic.board_id);
    topicView.replaceChildren();
    appendBackLink(topicView, `← ${board?.title || "Forum index"}`);
    topicView.append(makeElement("h2", "view-title", topic.title));
    topicView.append(renderPost(
      topic.profiles,
      topic.created_at,
      topic.body,
      "topic-first-post",
      topic.image_url,
      activityByUser.get(topic.profiles?.id),
      `moderate-delete-topic:${topic.id}`,
      medalsByUser.get(topic.profiles?.id),
      topicAwards.get(`topic:${topic.id}`),
      "topic",
      topic.id
    ));
    for (const reply of replies) {
      topicView.append(renderPost(
        reply.profiles,
        reply.created_at,
        reply.body,
        "topic-reply",
        null,
        activityByUser.get(reply.profiles?.id),
        `moderate-delete-reply:${reply.id}`,
        medalsByUser.get(reply.profiles?.id),
        replyAwards.get(`reply:${reply.id}`),
        "reply",
        reply.id
      ));
    }

    if (currentUser) {
      const replyForm = makePostForm("Write a reply", "Post reply", async body => {
        const { error } = await supabase.from("replies").insert({
          topic_id: topic.id,
          author_id: currentUser.id,
          body
        });
        if (error) throw error;
        await refreshForum();
        await showTopic(topic.id);
      });
      topicView.append(replyForm);
    } else {
      const prompt = makeElement("p", "empty-state", "Sign in to reply to this conversation.");
      prompt.append(" ", makeButton("Log in", "auth-login"));
      topicView.append(prompt);
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
  const board = boards.find(item => item.slug === slug);
  if (!board) {
    setForumMessage("That board could not be found.", true);
    return;
  }
  if (!currentUser) {
    openAuth("signup");
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
  } else {
    indexPanel.hidden = false;
    boardView.hidden = true;
    topicView.hidden = true;
    composerView.hidden = true;
    membersView.hidden = true;
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
  if (!moderatorIds.has(currentUser?.id)) throw new Error("Moderator access is required.");
  if (!window.confirm("Delete this topic and all of its replies? This cannot be undone.")) return;

  const { data: topic, error: topicError } = await supabase.from("topics")
    .select("board_id,image_url")
    .eq("id", topicId)
    .maybeSingle();
  if (topicError) throw topicError;
  if (!topic) throw new Error("This topic no longer exists.");

  const { data: deleted, error } = await supabase.from("topics")
    .delete()
    .eq("id", topicId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!deleted) throw new Error("The topic could not be deleted. Check moderator access.");

  let cleanupError;
  const imagePath = getTopicImagePath(topic.image_url);
  if (imagePath) {
    const result = await supabase.storage.from("topic-images").remove([imagePath]);
    cleanupError = result.error;
  }

  await refreshForum();
  const board = boards.find(item => item.id === topic.board_id);
  window.location.hash = board ? `board/${encodeURIComponent(board.slug)}` : "forums";
  if (cleanupError) {
    setForumMessage(`The topic was deleted, but its image could not be removed: ${cleanupError.message}`, true);
  }
}

async function moderateDeleteReply(replyId) {
  if (!moderatorIds.has(currentUser?.id)) throw new Error("Moderator access is required.");
  if (!window.confirm("Delete this reply? This cannot be undone.")) return;

  const { data: reply, error: replyError } = await supabase.from("replies")
    .select("topic_id")
    .eq("id", replyId)
    .maybeSingle();
  if (replyError) throw replyError;
  if (!reply) throw new Error("This reply no longer exists.");

  const { data: deleted, error } = await supabase.from("replies")
    .delete()
    .eq("id", replyId)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  if (!deleted) throw new Error("The reply could not be deleted. Check moderator access.");
  await refreshForum();
  await showTopic(reply.topic_id);
}

async function runModerationAction(action) {
  try {
    if (action.startsWith("moderate-delete-topic:")) {
      await moderateDeleteTopic(action.slice("moderate-delete-topic:".length));
    } else if (action.startsWith("moderate-delete-reply:")) {
      await moderateDeleteReply(action.slice("moderate-delete-reply:".length));
    } else if (action.startsWith("moderate-pin-topic:")) {
      if (!moderatorIds.has(currentUser?.id)) throw new Error("Moderator access is required.");
      const [, topicId, pinnedValue] = action.split(":");
      const { error } = await supabase.rpc("set_topic_pinned", {
        p_topic_id: topicId,
        p_is_pinned: pinnedValue === "true"
      });
      if (error) throw error;
      const route = decodeURIComponent(window.location.hash.slice(1));
      if (route.startsWith("board/")) await showBoard(route.slice("board/".length));
    }
  } catch (error) {
    console.error("Could not complete moderation action:", error);
    setForumMessage(`Could not complete moderation action: ${error.message}`, true);
  }
}

async function runVoteAction(action) {
  if (!currentUser) {
    openAuth("login");
    return;
  }

  const [, postType, postId] = action.split(":");
  const parameters = {
    p_topic_id: postType === "topic" ? postId : null,
    p_reply_id: postType === "reply" ? postId : null
  };
  try {
    const { error } = await supabase.rpc("cast_post_vote", parameters);
    if (error) throw error;
    const route = decodeURIComponent(window.location.hash.slice(1));
    if (route.startsWith("topic/")) await showTopic(route.slice("topic/".length));
  } catch (error) {
    console.error("Could not cast post vote:", error);
    setForumMessage(`Could not cast vote: ${error.message}`, true);
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
  if (action === "make-post") {
    if (!supabase) {
      setForumMessage("Forum setup is not finished. Add the Supabase project details first.", true);
      return;
    }
    if (currentUser) {
      window.location.hash = "compose/off-topic";
    } else {
      openAuth("signup");
    }
  } else if (action.startsWith("moderate-delete-") || action.startsWith("moderate-pin-topic:")) {
    void runModerationAction(action);
  } else if (action.startsWith("vote:")) {
    void runVoteAction(action);
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

if (!supabaseUrl || !supabaseAnonKey) {
  boardList.replaceChildren();
  const row = document.createElement("tr");
  const cell = makeElement("td", "empty-state", "Forum setup is not finished yet. Add your Supabase project details and run the database setup in SUPABASE_SETUP.md.");
  cell.colSpan = 4;
  row.append(cell);
  boardList.append(row);
  document.querySelector("#latest-discussions")
    .replaceChildren(makeElement("li", "latest-empty", "Recent discussions will appear after forum setup."));
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
