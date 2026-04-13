/* ═══════════════════════════════════════
   NIRIKKHA ADMIN DASHBOARD — SCRIPTS
   ═══════════════════════════════════════ */

(function () {

  /* ── Toast Notification ── */
  function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
    toast.innerHTML = `<span class="material-symbols-outlined">${icon}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
  window.showToast = showToast;

  /* ── Sidebar Toggle ── */
  window.toggleSidebar = function () {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('open');
  };

  window.closeSidebar = function () {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.remove('open');
  };

  /* ── Section Navigation ── */
  function showSection(id) {
    document.querySelectorAll('.dashboard-section').forEach(s => {
      s.classList.add('hidden');
      s.classList.remove('active');
    });
    const target = document.getElementById('section-' + id);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
    }
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-section') === id);
    });
  }
  window.showSection = showSection;
  window.onload = () => showSection('add-student');

  /* ── Password Visibility Toggle ── */
  window.togglePassword = function (inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('.material-symbols-outlined');
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.textContent = input.type === 'password' ? 'visibility' : 'visibility_off';
  };

  /* ── Toggle Buttons (Shift / Working Days) ── */
  const TOGGLE_STYLES = {
    Morning: 'act-morning',
    Day: 'act-day',
    Weekday: 'act-weekday',
    Weekend: 'act-weekend',
    Both: 'act-both'
  };

  window.selectToggle = function (groupId, val, hiddenId) {
    const group = document.getElementById(groupId);
    group.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.className = 'toggle-btn';
      if (btn.dataset.val === val) {
        btn.classList.add(TOGGLE_STYLES[val]);
      }
    });
    document.getElementById(hiddenId).value = val;

    const errMap = {
      shift: 'err-teacher-shift',
      daytype: 'err-teacher-daytype'
    };
    const errKey = hiddenId.replace('teacher-', '');
    const errEl = document.getElementById(errMap[errKey] || 'err-teacher-shift');
    if (errEl) errEl.classList.remove('show');
  };

  /* ── Multi-Select Components ── */
  function initMultiSelect(wrapperId, placeholder) {
    const wrapper = document.getElementById(wrapperId);
    if (!wrapper) return;

    const trigger = wrapper.querySelector('.multi-select-trigger');
    const dropdown = wrapper.querySelector('.multi-select-dropdown');
    const tagsContainer = wrapper.querySelector('.selected-tags');
    const countLabel = wrapper.querySelector('.selection-count');
    const clearBtn = wrapper.querySelector('.clear-all');
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
    const chevron = wrapper.querySelector('.chevron-icon');

    function updateUI() {
      const selected = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

      tagsContainer.innerHTML = selected.length === 0
        ? `<span style="font-size:0.875rem;color:#94a3b8">${placeholder}</span>`
        : selected.map(v =>
            `<span class="tag-chip">${v}<button type="button" data-val="${v}" class="remove-tag"><span class="material-symbols-outlined">close</span></button></span>`
          ).join('');

      countLabel.innerText = `${selected.length} Selected`;

      if (selected.length > 0) {
        trigger.classList.remove('multi-select-trigger-invalid');
      }

      tagsContainer.querySelectorAll('.remove-tag').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const cb = Array.from(checkboxes).find(x => x.value === btn.dataset.val);
          if (cb) { cb.checked = false; updateUI(); }
        };
      });
    }

    trigger.onclick = (e) => {
      e.stopPropagation();
      document.querySelectorAll('.multi-select-dropdown').forEach(d => {
        if (d !== dropdown) {
          d.classList.add('hidden');
          const w = d.closest('.multi-select-wrapper');
          if (w) {
            const ch = w.querySelector('.chevron-icon');
            if (ch) ch.classList.remove('rotate-180');
          }
        }
      });
      dropdown.classList.toggle('hidden');
      chevron.classList.toggle('rotate-180');
    };

    checkboxes.forEach(cb => { cb.onchange = updateUI; });

    clearBtn.onclick = (e) => {
      e.stopPropagation();
      checkboxes.forEach(cb => { cb.checked = false; });
      updateUI();
    };

    dropdown.onclick = (e) => { e.stopPropagation(); };
  }

  initMultiSelect('ms-classes', 'Select classes...');
  initMultiSelect('ms-sections', 'Select sections...');
  initMultiSelect('ms-department', 'Select department...');

  /* Close all dropdowns on outside click */
  document.addEventListener('click', () => {
    document.querySelectorAll('.multi-select-dropdown').forEach(d => d.classList.add('hidden'));
    document.querySelectorAll('.chevron-icon').forEach(c => c.classList.remove('rotate-180'));
    document.getElementById('subject-dropdown').classList.remove('show');
  });

  /* Helper: get selected values from a multi-select wrapper */
  function getMultiSelectValues(wrapperId) {
    return Array.from(
      document.querySelectorAll(`#${wrapperId} input[type="checkbox"]:checked`)
    ).map(cb => cb.value);
  }

  /* ═══════════════════════════════════════
     SUBJECT AUTOCOMPLETE
     ═══════════════════════════════════════ */
  let selectedSubjects = [];
  let subjectDebounce = null;

  const subjectInput = document.getElementById('subject-search-input');
  const subjectDropdown = document.getElementById('subject-dropdown');
  const subjectTagsEl = document.getElementById('subject-tags');
  const subjectHidden = document.getElementById('assigned-subjects-hidden');

  /* Fallback local subject list */
  const FALLBACK_SUBJECTS = [
    { id: 1,  subject_name: 'Bangla',               subject_code: 'BAN' },
    { id: 2,  subject_name: 'English',              subject_code: 'ENG' },
    { id: 3,  subject_name: 'Mathematics',          subject_code: 'MAT' },
    { id: 4,  subject_name: 'Physics',              subject_code: 'PHY' },
    { id: 5,  subject_name: 'Chemistry',            subject_code: 'CHE' },
    { id: 6,  subject_name: 'Biology',              subject_code: 'BIO' },
    { id: 7,  subject_name: 'ICT',                  subject_code: 'ICT' },
    { id: 8,  subject_name: 'General Science',      subject_code: 'GSC' },
    { id: 9,  subject_name: 'Accounting',           subject_code: 'ACC' },
    { id: 10, subject_name: 'Economics',            subject_code: 'ECO' },
    { id: 11, subject_name: 'History',              subject_code: 'HIS' },
    { id: 12, subject_name: 'Geography',            subject_code: 'GEO' },
    { id: 13, subject_name: 'Higher Mathematics',   subject_code: 'HMA' },
    { id: 14, subject_name: 'Business Studies',     subject_code: 'BST' },
    { id: 15, subject_name: 'Social Science',       subject_code: 'SSC' },
    { id: 16, subject_name: 'Agriculture',          subject_code: 'AGR' },
    { id: 17, subject_name: 'Physical Education',   subject_code: 'PHE' },
    { id: 18, subject_name: 'Arts & Crafts',        subject_code: 'ART' },
    { id: 19, subject_name: 'Religion (Islam)',     subject_code: 'ISL' },
    { id: 20, subject_name: 'Religion (Hindu)',     subject_code: 'HIN' },
    { id: 21, subject_name: 'Music',                subject_code: 'MUS' },
    { id: 22, subject_name: 'Home Science',         subject_code: 'HOS' },
    { id: 23, subject_name: 'Civics',               subject_code: 'CIV' }
  ];

  function renderSubjectTags() {
    subjectTagsEl.innerHTML = selectedSubjects.length === 0 ? '' :
      selectedSubjects.map((s, i) => `
        <span class="subject-tag">
          <span class="material-symbols-outlined" style="font-size:13px">menu_book</span>
          ${s.subject_name}
          <span style="opacity:0.55;font-weight:400;font-size:10px">${s.subject_code}</span>
          <button type="button" onclick="removeSubject(${i})">
            <span class="material-symbols-outlined">close</span>
          </button>
        </span>`
      ).join('');
    subjectHidden.value = JSON.stringify(selectedSubjects.map(s => s.subject_name));
    if (selectedSubjects.length > 0) {
      document.getElementById('err-teacher-subjects').classList.remove('show');
    }
  }

  window.removeSubject = function (index) {
    selectedSubjects.splice(index, 1);
    renderSubjectTags();
  };

  function highlightMatch(text, query) {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<span class="subj-hl">$1</span>');
  }

  function renderSubjectDropdown(subjects, query) {
    if (subjects.length === 0) {
      subjectDropdown.innerHTML = `<div class="no-subj-msg">No subjects found for "${query}"</div>`;
    } else {
      subjectDropdown.innerHTML = subjects.map(s => `
        <div class="subject-option" onclick="addSubject(${s.id},'${s.subject_name.replace(/'/g, "\\'")}','${s.subject_code}')">
          <span>${highlightMatch(s.subject_name, query)}</span>
          <span class="subj-code">${s.subject_code}</span>
        </div>`
      ).join('');
    }
    subjectDropdown.classList.add('show');
  }

  window.addSubject = function (id, name, code) {
    if (selectedSubjects.some(s => s.id === id)) {
      showToast('Subject already added', 'info');
      return;
    }
    selectedSubjects.push({ id, subject_name: name, subject_code: code });
    renderSubjectTags();
    subjectInput.value = '';
    subjectDropdown.classList.remove('show');
  };

  async function fetchSubjects(query) {
    try {
      const res = await fetch(`subjects_api.php?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      if (data.success) {
        renderSubjectDropdown(data.subjects, query);
      } else {
        throw new Error('No data');
      }
    } catch (err) {
      const filtered = FALLBACK_SUBJECTS.filter(s =>
        !query ||
        s.subject_name.toLowerCase().includes(query.toLowerCase()) ||
        s.subject_code.toLowerCase().includes(query.toLowerCase())
      );
      renderSubjectDropdown(filtered, query);
    }
  }

  subjectInput.addEventListener('input', function () {
    clearTimeout(subjectDebounce);
    const query = this.value.trim();
    if (query.length === 0) { subjectDropdown.classList.remove('show'); return; }
    subjectDebounce = setTimeout(() => fetchSubjects(query), 200);
  });

  subjectInput.addEventListener('focus', function () {
    fetchSubjects(this.value.trim());
  });

  subjectInput.addEventListener('click', (e) => { e.stopPropagation(); });
  subjectDropdown.addEventListener('click', (e) => { e.stopPropagation(); });

  /* ═══════════════════════════════════════
     TEACHER FORM — Validation & Submit
     ═══════════════════════════════════════ */
  const teacherForm = document.getElementById('add-teacher-form');

  if (teacherForm) {
    /* Real-time clear errors on input */
    ['teacher-name', 'teacher-staffid', 'teacher-password', 'teacher-confirm-password'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () {
          if (this.value.trim()) this.classList.remove('input-invalid');
        });
      }
    });

    document.getElementById('teacher-gender').addEventListener('change', function () {
      if (this.value) this.classList.remove('select-invalid');
    });

    teacherForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      let isValid = true;

      /* Required text fields */
      [
        ['teacher-name', 'err-teacher-name'],
        ['teacher-staffid', 'err-teacher-staffid'],
        ['teacher-password', 'err-teacher-password']
      ].forEach(([inputId, errorId]) => {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (!input.value.trim()) {
          input.classList.add('input-invalid');
          error.classList.add('show');
          isValid = false;
        } else {
          input.classList.remove('input-invalid');
          error.classList.remove('show');
        }
      });

      /* Email (optional, but validate if provided) */
      const tEmail = document.getElementById('teacher-email');
      const tEmailErr = document.getElementById('err-teacher-email');
      if (tEmail.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tEmail.value.trim())) {
        tEmail.classList.add('input-invalid');
        tEmailErr.classList.add('show');
        isValid = false;
      } else {
        tEmail.classList.remove('input-invalid');
        tEmailErr.classList.remove('show');
      }

      /* Gender select */
      const tGender = document.getElementById('teacher-gender');
      const tGenderErr = document.getElementById('err-teacher-gender');
      if (!tGender.value) {
        tGender.classList.add('select-invalid');
        tGenderErr.classList.add('show');
        isValid = false;
      } else {
        tGender.classList.remove('select-invalid');
        tGenderErr.classList.remove('show');
      }

      /* Shift toggle */
      if (!document.getElementById('teacher-shift').value) {
        document.getElementById('err-teacher-shift').classList.add('show');
        isValid = false;
      }

      /* Working Days toggle */
      if (!document.getElementById('teacher-daytype').value) {
        document.getElementById('err-teacher-daytype').classList.add('show');
        isValid = false;
      }

      /* Confirm password */
      const tPw = document.getElementById('teacher-password');
      const tCpw = document.getElementById('teacher-confirm-password');
      const tCpwErr = document.getElementById('err-teacher-confirm-password');
      if (!tCpw.value.trim() || tCpw.value !== tPw.value) {
        tCpw.classList.add('input-invalid');
        tCpwErr.classList.add('show');
        isValid = false;
        tCpwErr.textContent = !tCpw.value.trim()
          ? 'Please confirm your password.'
          : 'Passwords do not match.';
      } else {
        tCpw.classList.remove('input-invalid');
        tCpwErr.classList.remove('show');
      }

      /* Multi-selects */
      [
        ['ms-classes', 'err-teacher-classes'],
        ['ms-sections', 'err-teacher-sections'],
        ['ms-department', 'err-teacher-department']
      ].forEach(([msId, errorId]) => {
        const trigger = document.querySelector(`#${msId} .multi-select-trigger`);
        const error = document.getElementById(errorId);
        if (getMultiSelectValues(msId).length === 0) {
          trigger.classList.add('multi-select-trigger-invalid');
          error.classList.add('show');
          isValid = false;
        } else {
          trigger.classList.remove('multi-select-trigger-invalid');
          error.classList.remove('show');
        }
      });

      /* Subjects */
      if (selectedSubjects.length === 0) {
        document.getElementById('err-teacher-subjects').classList.add('show');
        isValid = false;
      }

      if (!isValid) return;

      /* Build FormData */
      const formData = new FormData();
      formData.append('full_name', document.getElementById('teacher-name').value);
      formData.append('teacher_email', document.getElementById('teacher-email').value);
      formData.append('staff_id', document.getElementById('teacher-staffid').value);
      formData.append('gender', document.getElementById('teacher-gender').value);
      formData.append('phone_number', document.getElementById('teacher-phone').value);
      formData.append('shift', document.getElementById('teacher-shift').value);
      formData.append('day_type', document.getElementById('teacher-daytype').value);
      formData.append('password', document.getElementById('teacher-password').value);
      formData.append('confirm_password', document.getElementById('teacher-confirm-password').value);
      formData.append('assigned_classes', JSON.stringify(getMultiSelectValues('ms-classes')));
      formData.append('assigned_sections', JSON.stringify(getMultiSelectValues('ms-sections')));
      formData.append('department', JSON.stringify(getMultiSelectValues('ms-department')));
      formData.append('assigned_subjects', JSON.stringify(selectedSubjects.map(s => s.subject_name)));

      const photoFile = document.getElementById('teacher-photo').files[0];
      if (photoFile) formData.append('profile_photo', photoFile);

      /* Submit with loading state */
      const btn = document.getElementById('teacher-submit-btn');
      const spinner = document.getElementById('teacher-submit-spinner');
      const btnText = document.getElementById('teacher-submit-text');
      btn.disabled = true;
      spinner.classList.remove('hidden');
      btnText.textContent = 'Registering...';

      try {
        const res = await fetch('register_teacher.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
          showToast('Teacher registered successfully!', 'success');
          teacherForm.reset();
          selectedSubjects = [];
          renderSubjectTags();

          ['ms-classes', 'ms-sections', 'ms-department'].forEach(msId => {
            document.querySelectorAll(`#${msId} input[type="checkbox"]`).forEach(cb => { cb.checked = false; });
            document.querySelector(`#${msId} .selected-tags`).innerHTML =
              '<span style="font-size:0.875rem;color:#94a3b8">Select...</span>';
            document.querySelector(`#${msId} .selection-count`).innerText = '0 Selected';
          });

          ['shift-group', 'daytype-group'].forEach(gId => {
            document.getElementById(gId).querySelectorAll('.toggle-btn').forEach(b => { b.className = 'toggle-btn'; });
          });

          document.getElementById('teacher-shift').value = '';
          document.getElementById('teacher-daytype').value = '';
          document.getElementById('teacher-photo-name').textContent = '';
          document.getElementById('teacher-photo-name').className = 'photo-name';
        } else {
          showToast(data.message || 'Registration failed', 'error');
        }
      } catch (err) {
        showToast('Network error: ' + err.message, 'error');
      } finally {
        btn.disabled = false;
        spinner.classList.add('hidden');
        btnText.textContent = 'Register Teacher';
      }
    });
  }

  /* ═══════════════════════════════════════
     STUDENT FORM — Validation & Submit
     ═══════════════════════════════════════ */
  const studentForm = document.getElementById('add-student-form');

  if (studentForm) {
    ['student-name', 'student-id', 'student-roll', 'student-password', 'student-confirm-password'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function () {
          if (this.value.trim()) this.classList.remove('input-invalid');
        });
      }
    });

    ['student-gender', 'student-class', 'student-section'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', function () {
          if (this.value) this.classList.remove('select-invalid');
        });
      }
    });

    studentForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      let isValid = true;

      /* Required text fields */
      [
        ['student-name', 'err-student-name'],
        ['student-id', 'err-student-id'],
        ['student-roll', 'err-student-roll'],
        ['student-password', 'err-student-password']
      ].forEach(([inputId, errorId]) => {
        const input = document.getElementById(inputId);
        const error = document.getElementById(errorId);
        if (!input.value.trim()) {
          input.classList.add('input-invalid');
          error.classList.add('show');
          isValid = false;
        } else {
          input.classList.remove('input-invalid');
          error.classList.remove('show');
        }
      });

      /* Confirm password */
      const sPw = document.getElementById('student-password');
      const sCpw = document.getElementById('student-confirm-password');
      const sCpwErr = document.getElementById('err-student-confirm-password');
      if (!sCpw.value.trim() || sCpw.value !== sPw.value) {
        sCpw.classList.add('input-invalid');
        sCpwErr.classList.add('show');
        isValid = false;
        sCpwErr.textContent = !sCpw.value.trim()
          ? 'Please confirm your password.'
          : 'Passwords do not match.';
      } else {
        sCpw.classList.remove('input-invalid');
        sCpwErr.classList.remove('show');
      }

      /* Required selects */
      [
        ['student-gender', 'err-student-gender'],
        ['student-class', 'err-student-class'],
        ['student-section', 'err-student-section']
      ].forEach(([selectId, errorId]) => {
        const select = document.getElementById(selectId);
        const error = document.getElementById(errorId);
        if (!select.value) {
          select.classList.add('select-invalid');
          error.classList.add('show');
          isValid = false;
        } else {
          select.classList.remove('select-invalid');
          error.classList.remove('show');
        }
      });

      if (!isValid) return;

      /* Build FormData */
      const formData = new FormData();
      formData.append('full_name', document.getElementById('student-name').value);
      formData.append('student_email', document.getElementById('student-email').value);
      formData.append('student_id', document.getElementById('student-id').value);
      formData.append('gender', document.getElementById('student-gender').value);
      formData.append('password', document.getElementById('student-password').value);
      formData.append('confirm_password', document.getElementById('student-confirm-password').value);
      formData.append('class', document.getElementById('student-class').value);
      formData.append('section', document.getElementById('student-section').value);
      formData.append('roll', document.getElementById('student-roll').value);
      formData.append('phone_number', document.getElementById('student-phone').value);

      const photoFile = document.getElementById('student-photo').files[0];
      if (photoFile) formData.append('profile_photo', photoFile);

      /* Submit with loading state */
      const btn = document.getElementById('submit-btn');
      const spinner = document.getElementById('submit-spinner');
      const btnText = document.getElementById('submit-text');
      btn.disabled = true;
      spinner.classList.remove('hidden');
      btnText.textContent = 'Enrolling...';

      try {
        const res = await fetch('register_student.php', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.success) {
          showToast('Student enrolled successfully!', 'success');
          studentForm.reset();
          document.getElementById('student-photo-name').textContent = '';
          document.getElementById('student-photo-name').className = 'photo-name';
        } else {
          showToast(data.message || 'Enrollment failed', 'error');
        }
      } catch (err) {
        showToast('Network error: ' + err.message, 'error');
      } finally {
        btn.disabled = false;
        spinner.classList.add('hidden');
        btnText.textContent = 'Enroll Student';
      }
    });
  }

  /* ═══════════════════════════════════════
     TEACHER PDF GENERATION
     ═══════════════════════════════════════ */
  window.generateTeacherPDF = function () {
    if (!window.jspdf) {
      showToast('PDF library not loaded', 'error');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name      = document.getElementById('teacher-name').value           || '________________';
    const email     = document.getElementById('teacher-email').value          || '________________';
    const staffId   = document.getElementById('teacher-staffid').value        || '________________';
    const gender    = document.getElementById('teacher-gender').value         || '________________';
    const phone     = document.getElementById('teacher-phone').value          || '________________';
    const shift     = document.getElementById('teacher-shift').value          || '________________';
    const dayType   = document.getElementById('teacher-daytype').value        || '________________';
    const password  = document.getElementById('teacher-password').value       || '________________';
    const classes   = getMultiSelectValues('ms-classes').join(', ')          || '________________';
    const sections  = getMultiSelectValues('ms-sections').join(', ')         || '________________';
    const depts     = getMultiSelectValues('ms-department').join(', ')       || '________________';
    const subjects  = selectedSubjects.length > 0
      ? selectedSubjects.map(s => s.subject_name).join(', ')
      : '________________';
    const today     = new Date().toLocaleDateString('en-BD');
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFont('courier', 'normal');
    doc.setFontSize(11);
    let y = 12;

    function line(text) {
      doc.text(text, 10, y);
      y += 6;
    }

    line('========================================================');
    doc.setFontSize(13);
    doc.setFont('courier', 'bold');
    const title1 = 'NIRIKKHA ADMIN SYSTEM';
    doc.text(title1, (pageWidth - doc.getTextWidth(title1)) / 2, y);
    y += 7;
    doc.setFontSize(11);
    doc.setFont('courier', 'normal');
    const title2 = 'TEACHER REGISTRATION RECEIPT';
    doc.text(title2, (pageWidth - doc.getTextWidth(title2)) / 2, y);
    y += 6;
    line('========================================================');
    y += 2;
    line(`Date      : ${today}`);
    line(`Staff ID  : ${staffId}`);
    y += 2;
    line('--------------------------------------------------------');
    line('  PERSONAL INFORMATION');
    line('--------------------------------------------------------');
    line(`  Name    : ${name}`);
    line(`  Email   : ${email}`);
    line(`  Gender  : ${gender}`);
    line(`  Phone   : ${phone}`);
    y += 2;
    line('--------------------------------------------------------');
    line('  SCHEDULE');
    line('--------------------------------------------------------');
    line(`  Shift       : ${shift}`);
    line(`  Working Days: ${dayType}`);
    y += 2;
    line('--------------------------------------------------------');
    line('  ASSIGNMENT');
    line('--------------------------------------------------------');
    line(`  Classes  : ${classes}`);
    line(`  Sections : ${sections}`);
    line(`  Dept     : ${depts}`);
    y += 2;
    line('  Subjects :');
    doc.splitTextToSize(subjects, 170).forEach(textLine => {
      doc.text('             ' + textLine, 10, y);
      y += 6;
    });
    y += 2;
    line('--------------------------------------------------------');
    line('  SECURITY');
    line('--------------------------------------------------------');
    line(`  Password : ${password}`);
    y += 4;
    line('--------------------------------------------------------');
    line('');
    line('       Authorized Signature');
    line('       ___________________________');
    line('');
    line('========================================================');
    doc.setFontSize(9);
    const footer = 'Nirikkha | Developed by Nipatane Siddha Softwares';
    doc.text(footer, (pageWidth - doc.getTextWidth(footer)) / 2, y);
    y += 5;
    line('========================================================');

    doc.save(`teacher-${staffId || 'receipt'}.pdf`);
  };

  /* ═══════════════════════════════════════
     STUDENT PDF GENERATION
     ═══════════════════════════════════════ */
  window.generateStudentPDF = function () {
    if (!window.jspdf) {
      showToast('PDF library not loaded', 'error');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name       = document.getElementById('student-name').value           || '________________';
    const email      = document.getElementById('student-email').value          || '________________';
    const studentId  = document.getElementById('student-id').value            || '________________';
    const gender     = document.getElementById('student-gender').value         || '________________';
    const cls        = document.getElementById('student-class').value          || '_______';
    const section    = document.getElementById('student-section').value        || '_______';
    const roll       = document.getElementById('student-roll').value           || '_______';
    const phone      = document.getElementById('student-phone').value          || '________________';
    const password   = document.getElementById('student-password').value       || '________________';
    const today      = new Date().toLocaleDateString('en-BD');
    const pageWidth  = doc.internal.pageSize.getWidth();

    doc.setFont('courier', 'normal');
    doc.setFontSize(11);
    let y = 12;

    function line(text) {
      doc.text(text, 10, y);
      y += 6;
    }

    line('========================================================');
    doc.setFontSize(13);
    doc.setFont('courier', 'bold');
    const title1 = 'NIRIKKHA ADMIN SYSTEM';
    doc.text(title1, (pageWidth - doc.getTextWidth(title1)) / 2, y);
    y += 7;
    doc.setFontSize(11);
    doc.setFont('courier', 'normal');
    const title2 = 'STUDENT ENROLMENT RECEIPT';
    doc.text(title2, (pageWidth - doc.getTextWidth(title2)) / 2, y);
    y += 6;
    line('========================================================');
    y += 2;
    line(`Date       : ${today}`);
    line(`Student ID : ${studentId}`);
    y += 2;
    line('--------------------------------------------------------');
    line('  PERSONAL INFORMATION');
    line('--------------------------------------------------------');
    line(`  Name    : ${name}`);
    line(`  Email   : ${email}`);
    line(`  Gender  : ${gender}`);
    line(`  Phone   : ${phone}`);
    y += 2;
    line('--------------------------------------------------------');
    line('  ACADEMIC DETAILS');
    line('--------------------------------------------------------');
    line(`  Class   : ${cls}`);
    line(`  Section : ${section}`);
    line(`  Roll    : ${roll}`);
    y += 2;
    line('--------------------------------------------------------');
    line('  SECURITY');
    line('--------------------------------------------------------');
    line(`  Password : ${password}`);
    y += 4;
    line('--------------------------------------------------------');
    line('');
    line('       Authorized Signature');
    line('       ___________________________');
    line('');
    line('========================================================');
    doc.setFontSize(9);
    const footer = 'Nirikkha | Developed by Nipatane Siddha Softwares';
    doc.text(footer, (pageWidth - doc.getTextWidth(footer)) / 2, y);
    y += 5;
    line('========================================================');

    doc.save(`student-${studentId || 'receipt'}.pdf`);
  };

  /* Alias for backward compatibility */
  window.generatePDF = window.generateStudentPDF;

  /* ═══════════════════════════════════════
     PHOTO FILE NAME DISPLAY
     ═══════════════════════════════════════ */
  [
    { inputId: 'teacher-photo', nameId: 'teacher-photo-name' },
    { inputId: 'student-photo', nameId: 'student-photo-name' }
  ].forEach(({ inputId, nameId }) => {
    const input = document.getElementById(inputId);
    const nameEl = document.getElementById(nameId);
    if (!input || !nameEl) return;

    input.addEventListener('change', function () {
      const fileName = this.files.length > 0 ? this.files[0].name : '';
      if (fileName) {
        nameEl.textContent = `✓ ${fileName}`;
        nameEl.className = 'photo-name filled';
      } else {
        nameEl.textContent = '';
        nameEl.className = 'photo-name';
      }
    });
  });

})();