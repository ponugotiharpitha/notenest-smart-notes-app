// NoteNest: notes are saved in your browser using localStorage.
const form = document.getElementById("noteForm");
const titleInput = document.getElementById("title");
const categoryInput = document.getElementById("category");
const tagsInput = document.getElementById("tags");
const contentInput = document.getElementById("content");
const searchInput = document.getElementById("search");
const filterInput = document.getElementById("filter");
const notesGrid = document.getElementById("notesGrid");

const colors = {
  "Personal": ["#ffdf8b", "#f3ce66"],
  "Study": ["#d9bda8", "#e8cdb7"],
  "Work": ["#ffd5d1", "#f3cf66"],
  "Daily Tasks": ["#cfe8dd", "#e88bad"],
  "Ideas": ["#ffdc80", "#f3c96a"]
};

let notes = JSON.parse(localStorage.getItem("notenestNotes")) || [];
let editingId = null;

function saveNotes() {
  localStorage.setItem("notenestNotes", JSON.stringify(notes));
}

function renderNotes() {
  const searchText = searchInput.value.toLowerCase().trim();
  const selectedCategory = filterInput.value;

  const visibleNotes = notes
    .filter(note => selectedCategory === "All Categories" || note.category === selectedCategory)
    .filter(note => (note.title + " " + note.content + " " + note.tags + " " + note.category)
      .toLowerCase().includes(searchText))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);

  notesGrid.innerHTML = "";

  if (visibleNotes.length === 0) {
    notesGrid.innerHTML = '<div class="empty">🌷 No notes found. Create your first note above!</div>';
    return;
  }

  visibleNotes.forEach(note => {
    const colorPair = colors[note.category] || colors.Personal;
    const card = document.createElement("article");
    card.className = "note" + (note.pinned ? " pinned" : "");
    card.style.setProperty("--note-color", colorPair[0]);
    card.style.setProperty("--tape", colorPair[1]);
    card.style.setProperty("--tilt", (Math.random() * 2 - 1).toFixed(1) + "deg");

    const heading = document.createElement("h3");
    heading.textContent = note.title;
    const paragraph = document.createElement("p");
    paragraph.textContent = note.content;
    const category = document.createElement("span");
    category.className = "category-pill";
    category.textContent = "📁 " + note.category;
    const tags = document.createElement("div");
    tags.className = "tags";
    tags.textContent = note.tags ? "♢  " + note.tags.split(",").map(tag => "#" + tag.trim()).join("   ") : "";

    const actions = document.createElement("div");
    actions.className = "note-actions";
    actions.innerHTML = `
      <button type="button" title="Edit note" aria-label="Edit note">✎</button>
      <button type="button" title="Delete note" aria-label="Delete note">▤</button>
      <button type="button" title="${note.pinned ? "Unpin note" : "Pin note"}" aria-label="Pin note">${note.pinned ? "📌" : "📍"}</button>
    `;
    actions.children[0].addEventListener("click", () => editNote(note.id));
    actions.children[1].addEventListener("click", () => deleteNote(note.id));
    actions.children[2].addEventListener("click", () => togglePin(note.id));

    card.append(heading, paragraph, category, tags, actions);
    notesGrid.appendChild(card);
  });
}

form.addEventListener("submit", function(event) {
  event.preventDefault();
  const noteData = {
    title: titleInput.value.trim(),
    category: categoryInput.value,
    tags: tagsInput.value.trim(),
    content: contentInput.value.trim()
  };

  if (!noteData.title || !noteData.category || !noteData.content) {
    alert("Please enter a title, category and note.");
    return;
  }

  if (editingId !== null) {
    notes = notes.map(note => note.id === editingId ? { ...note, ...noteData } : note);
    editingId = null;
    form.querySelector(".add-btn").textContent = "＋ Add Note";
  } else {
    notes.unshift({ id: Date.now(), ...noteData, pinned: false, createdAt: Date.now() });
  }

  saveNotes();
  form.reset();
  renderNotes();
});

function editNote(id) {
  const note = notes.find(item => item.id === id);
  if (!note) return;
  titleInput.value = note.title;
  categoryInput.value = note.category;
  tagsInput.value = note.tags;
  contentInput.value = note.content;
  editingId = id;
  form.querySelector(".add-btn").textContent = "✓ Save Changes";
  window.scrollTo({ top: 0, behavior: "smooth" });
  titleInput.focus();
}

function deleteNote(id) {
  if (!confirm("Delete this note?")) return;
  notes = notes.filter(note => note.id !== id);
  if (editingId === id) {
    editingId = null;
    form.reset();
    form.querySelector(".add-btn").textContent = "＋ Add Note";
  }
  saveNotes();
  renderNotes();
}

function togglePin(id) {
  notes = notes.map(note => note.id === id ? { ...note, pinned: !note.pinned } : note);
  saveNotes();
  renderNotes();
}

searchInput.addEventListener("input", renderNotes);
filterInput.addEventListener("change", renderNotes);

// Add a few sample notes on the first visit so the page looks like the reference image.
if (notes.length === 0) {
  notes = [
    { id: 1, title: "Good Morning", content: "Start your day with a smile and positive thoughts.\\nYou can do it!", category: "Personal", tags: "motivation, morning", pinned: true, createdAt: 12 },
    { id: 2, title: "Study Time", content: "Revise JavaScript today. Focus on ES6 features and practice examples.", category: "Study", tags: "college, javascript", pinned: false, createdAt: 11 },
    { id: 3, title: "Daily Tasks", content: "• Complete project report\\n• Attend college\\n• Read a book", category: "Daily Tasks", tags: "todo, work", pinned: false, createdAt: 10 },
    { id: 4, title: "My Ideas", content: "Build a simple app that helps students manage notes easily.", category: "Ideas", tags: "ideas, app", pinned: false, createdAt: 9 },
    { id: 5, title: "Homework", content: "Finish the pending assignments before Sunday.", category: "Study", tags: "homework, college", pinned: false, createdAt: 8 },
    { id: 6, title: "Work Plan", content: "Prepare the project report and submit it by Friday.", category: "Work", tags: "project, report", pinned: false, createdAt: 7 },
    { id: 7, title: "Remember", content: "Stay positive and keep learning. Small steps make big progress!", category: "Personal", tags: "motivation, life", pinned: true, createdAt: 6 },
    { id: 8, title: "Practice", content: "Practice HTML, CSS and JS. Build some mini projects.", category: "Study", tags: "coding, practice", pinned: false, createdAt: 5 },
    { id: 9, title: "Shopping", content: "Buy notebooks, pens and other stationery items.", category: "Daily Tasks", tags: "shopping, todo", pinned: false, createdAt: 4 },
    { id: 10, title: "Project", content: "Complete the NoteNest app with all required features.", category: "Work", tags: "app, project", pinned: false, createdAt: 3 },
    { id: 11, title: "Goals", content: "Learn something new every day and become a better version of myself.", category: "Personal", tags: "goals, growth", pinned: false, createdAt: 2 },
    { id: 12, title: "Revision", content: "Review today’s class notes and solve previous year questions.", category: "Study", tags: "revision, exam", pinned: true, createdAt: 1 }
  ];
  saveNotes();
}
renderNotes();
