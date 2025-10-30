// Basic client-side form handling + localStorage persistence

const form = document.getElementById('regForm');
const msg = document.getElementById('msg');
const studentsList = document.getElementById('studentsList');
const clearBtn = document.getElementById('clearBtn');

const STORAGE_KEY = 'students_registry_v1';

// load saved students or empty array
function loadStudents(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch(e) {
    console.error('Failed to parse storage', e);
    return [];
  }
}

function saveStudents(list){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderStudents(){
  const list = loadStudents();
  studentsList.innerHTML = '';
  if (list.length === 0) {
    studentsList.innerHTML = '<li class="small">No students registered yet.</li>';
    return;
  }

  list.forEach((s, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <div><strong>${escapeHtml(s.name)}</strong> <span class="small">(${escapeHtml(s.email)})</span></div>
        <div class="small">${escapeHtml(s.gender || 'N/A')} • Age: ${s.age || 'N/A'} • Courses: ${s.courses.join(', ') || '—'}</div>
      </div>
      <div>
        <button class="removeBtn" data-idx="${idx}">Remove</button>
      </div>
    `;
    studentsList.appendChild(li);
  });
}

// simple HTML escape
function escapeHtml(str){
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

// get checked courses
function getSelectedCourses(){
  return Array.from(document.querySelectorAll('input[name="course"]:checked'))
    .map(c => c.value);
}

form.addEventListener('submit', function(e){
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const age = document.getElementById('age').value.trim();
  const gender = document.getElementById('gender').value;
  const courses = getSelectedCourses();

  // basic validation
  if (!name){
    showMessage('Please enter full name.', true);
    return;
  }
  if (!email || !validateEmail(email)){
    showMessage('Please enter a valid email address.', true);
    return;
  }

  const students = loadStudents();
  const student = { name, email, age: age || null, gender: gender || null, courses, createdAt: new Date().toISOString() };
  students.push(student);
  saveStudents(students);

  form.reset();
  showMessage('Student registered successfully ✅', false);
  renderStudents();
});

// Remove button (event delegation)
studentsList.addEventListener('click', function(e){
  if (e.target.matches('.removeBtn')){
    const idx = Number(e.target.dataset.idx);
    const list = loadStudents();
    if (Number.isInteger(idx) && idx >= 0 && idx < list.length){
      list.splice(idx, 1);
      saveStudents(list);
      renderStudents();
      showMessage('Student removed.', false);
    }
  }
});

// Clear all
clearBtn.addEventListener('click', function(){
  if (!confirm('Clear all registered students from this browser?')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderStudents();
  showMessage('All records cleared.', false);
});

function showMessage(text, isError){
  msg.textContent = text;
  msg.style.color = isError ? '#d32f2f' : '';
  setTimeout(() => {
    msg.textContent = '';
  }, 3500);
}

function validateEmail(email){
  // simple regex (client-side only)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// initial render
renderStudents();
