import { supabaseAnonKey, supabaseUrl } from "../supabase-config.js";

const boardList = document.querySelector("#board-list");
const forumMessage = document.querySelector("#forum-message");
const boardView = document.querySelector("#board-view");
const topicView = document.querySelector("#topic-view");
const composerView = document.querySelector("#composer-view");
const indexPanel = document.querySelector(".forum-table-wrap");
const authDialog = document.querySelector("#auth-dialog");
const profileDialog = document.querySelector("#profile-dialog");
const profileForm = document.querySelector("#profile-form");
const profileMessage = document.querySelector("#profile-message");
const authForm = document.querySelector("#auth-form");
const authMessage = document.querySelector("#auth-message");
const usernameField = document.querySelector("#username-field");
const authPassword = authForm.elements.password;
const siteTitle = document.querySelector(".site-title");
const authMode = { value: "signup" };
let supabase;
let currentUser;
let boards = [];
let moderatorIds = new Set();

const siteTitles = [
  "Another Retro Gaming Larping Forum",
  "Larp Larp Larp Shaur",
  "Hi RetroDev",
  "I, I don't know what to add to this forum ngl",
  "We're just like BitView. except like we don't host videos, actually we're more like SomethingAwful"
];

const allowedImageTypes = ["image/jpeg", "image/gif", "image/webp", "image/png"];
const maxImageSize = 2 * 1024 * 1024;

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
  icon.src = `_layouts/assets/silk-icons/${filename}.png`;
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

async function loadModerators() {
  const { data, error } = await supabase.from("moderators").select("user_id");
  if (error) throw error;
  moderatorIds = new Set(data.map(moderator => moderator.user_id));
}

async function loadMemberActivity(userIds) {
  const ids = [...new Set(userIds.filter(Boolean))];
  if (!ids.length) return new Map();
  const { data, error } = await supabase.from("member_activity")
    .select("user_id,joined_at,post_count,active_days")
    .in("user_id", ids);
  if (error) throw error;
  return new Map(data.map(activity => [activity.user_id, activity]));
}

function appendMemberLabels(container, userId, activity) {
  const labels = makeElement("span", "member-labels");
  let hasLabels = false;
  if (moderatorIds.has(userId)) {
    labels.append(makeElement("span", "moderator-badge", "Moderator"));
    hasLabels = true;
  }

  if (activity) {
    const ageDays = (Date.now() - new Date(activity.joined_at).getTime()) / 86400000;
    const medals = [
      {
        name: "Bronze",
        className: "medal-bronze",
        earned: activity.post_count >= 5 && activity.active_days >= 3 && ageDays >= 7,
        description: "5 posts across 3 active days; account is at least 7 days old"
      },
      {
        name: "Silver",
        className: "medal-silver",
        earned: activity.post_count >= 20 && activity.active_days >= 10 && ageDays >= 30,
        description: "20 posts across 10 active days; account is at least 30 days old"
      },
      {
        name: "Gold",
        className: "medal-gold",
        earned: activity.post_count >= 50 && activity.active_days >= 30 && ageDays >= 90,
        description: "50 posts across 30 active days; account is at least 90 days old"
      }
    ];
    for (const medal of medals) {
      if (!medal.earned) continue;
      const badge = makeElement("span", `medal-badge ${medal.className}`, medal.name);
      badge.title = medal.description;
      labels.append(badge);
      hasLabels = true;
    }
  }

  if (hasLabels) container.append(labels);
}

function setStat(name, value) {
  document.querySelectorAll(`[data-stat="${name}"]`).forEach(element => {
    element.textContent = value.toLocaleString();
  });
}

function updateAccount(user) {
  currentUser = user;
  const links = document.querySelector("#account-links");
  links.replaceChildren();

  if (user) {
    const username = user.user_metadata?.username || "member";
    const profileButton = makeButton("", "profile-edit", "text-button account-name");
    profileButton.setAttribute("aria-label", `Edit profile for ${username}`);
    const avatar = makeElement("span", "account-avatar", username.slice(0, 1).toUpperCase());
    profileButton.append(avatar, makeElement("span", "", username));
    if (moderatorIds.has(user.id)) {
      profileButton.append(makeElement("span", "moderator-badge account-moderator-badge", "Moderator"));
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
  const activityByUser = await loadMemberActivity(data.map(topic => topic.profiles?.id));

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
    appendMemberLabels(item, topic.profiles?.id, activityByUser.get(topic.profiles?.id));
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

async function showBoard(slug) {
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
  const list = makeElement("div", "topic-list");
  list.append(makeElement("p", "empty-state", "Loading topics…"));
  boardView.append(list);

  try {
    const { data, error } = await supabase.from("topics")
      .select("id,title,body,image_url,created_at,updated_at,profiles!topics_author_id_fkey(id,username),replies(count)")
      .eq("board_id", board.id)
      .order("updated_at", { ascending: false })
      .range(0, 49);
    if (error) throw error;
    const activityByUser = await loadMemberActivity(data.map(topic => topic.profiles?.id));
    list.replaceChildren();
    if (!data.length) {
      list.append(makeElement("p", "empty-state", "No topics here yet. Start the first conversation."));
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
      const replyCount = topic.replies?.[0]?.count || 0;
      details.append(
        title,
        makeElement("p", "topic-meta", `${topic.profiles?.username || "member"} · ${formatDate(topic.updated_at)} · ${replyCount} replies`),
        makeElement("p", "topic-preview", topic.body)
      );
      appendMemberLabels(details, topic.profiles?.id, activityByUser.get(topic.profiles?.id));
      item.append(details);
      list.append(item);
    }
  } catch (error) {
    console.error("Could not load board topics:", error);
    list.replaceChildren(makeElement("p", "form-message error-message", `Could not load topics: ${error.message}`));
  }
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

function renderPost(profile, date, body, className, imageUrl = null, activity = null, moderationAction = null) {
  const post = makeElement("article", `forum-post ${className}`);
  const author = profile?.username || "member";
  const authorPanel = makeElement("aside", "post-author");
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
  appendMemberLabels(authorPanel, profile?.id, activity);

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
  if (moderationAction && moderatorIds.has(currentUser?.id)) {
    const deleteButton = makeButton("Delete", moderationAction, "small-button moderation-delete");
    deleteButton.title = "Remove this post";
    header.append(deleteButton);
  }
  content.append(header, makeElement("p", "post-body", body));
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
    const activityByUser = await loadMemberActivity(profiles.map(profile => profile?.id));
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
      `moderate-delete-topic:${topic.id}`
    ));
    for (const reply of replies) {
      topicView.append(renderPost(
        reply.profiles,
        reply.created_at,
        reply.body,
        "topic-reply",
        null,
        activityByUser.get(reply.profiles?.id),
        `moderate-delete-reply:${reply.id}`
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
  if (route.startsWith("board/")) {
    showBoard(route.slice("board/".length));
  } else if (route.startsWith("topic/")) {
    showTopic(route.slice("topic/".length));
  } else if (route.startsWith("compose/")) {
    showComposer(route.slice("compose/".length));
  } else {
    indexPanel.hidden = false;
    boardView.hidden = true;
    topicView.hidden = true;
    composerView.hidden = true;
  }
}

function openAuth(mode) {
  authMode.value = mode;
  const signingUp = mode === "signup";
  document.querySelector("#auth-title").textContent = signingUp ? "Join the forum" : "Welcome back";
  document.querySelector("#auth-description").textContent = signingUp
    ? "Create an account to start posting."
    : "Log in to continue the conversation.";
  document.querySelector("#auth-submit").textContent = signingUp ? "Create account" : "Log in";
  document.querySelector("#auth-switch").textContent = signingUp ? "Already a member? Log in" : "Need an account? Sign up";
  usernameField.hidden = !signingUp;
  authForm.elements.username.required = signingUp;
  authPassword.autocomplete = signingUp ? "new-password" : "current-password";
  authMessage.textContent = "";
  authMessage.classList.remove("error-message");
  authDialog.showModal();
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
    }
  } catch (error) {
    console.error("Could not complete moderation action:", error);
    setForumMessage(`Could not complete moderation action: ${error.message}`, true);
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
  } else if (action.startsWith("moderate-delete-")) {
    void runModerationAction(action);
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

document.querySelector("#auth-switch").addEventListener("click", () => {
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
    if (authMode.value === "signup") {
      const username = authForm.elements.username.value.trim().toLowerCase();
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
    console.error("Authentication failed:", error);
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
    await loadModerators();
    const { data: { session } } = await supabase.auth.getSession();
    updateAccount(session?.user || null);
    supabase.auth.onAuthStateChange((_event, nextSession) => {
      updateAccount(nextSession?.user || null);
    });
    await refreshForum();
    handleRoute();
  } catch (error) {
    console.error("Could not initialize the forum:", error);
    setForumMessage(`Could not connect to the forum: ${error.message}`, true);
  }
}
