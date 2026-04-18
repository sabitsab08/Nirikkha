(function () {

  // ── Toast ────────────────────────────────────────────────────
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

  // ── Password Toggle ──────────────────────────────────────────
  window.togglePassword = function (id, btn) {
    const el = document.getElementById(id);
    const ic = btn.querySelector('.material-symbols-outlined');
    if (el.type === 'password') { el.type = 'text'; ic.textContent = 'visibility_off'; }
    else { el.type = 'password'; ic.textContent = 'visibility'; }
  };

  // ── Photo Preview ────────────────────────────────────────────
  const photoInput   = document.getElementById('student-photo');
  const photoNameSpan = document.getElementById('student-photo-name');
  if (photoInput) {
    photoInput.addEventListener('change', function () {
      if (this.files.length > 0) {
        photoNameSpan.textContent = `✓ ${this.files[0].name}`;
        photoNameSpan.className = 'photo-name filled';
      } else {
        photoNameSpan.textContent = '';
        photoNameSpan.className = 'photo-name';
      }
    });
  }

  // ── Form Setup ───────────────────────────────────────────────
  const studentForm  = document.getElementById('add-student-form');
  const submitBtn    = document.getElementById('submit-btn');
  const submitSpinner = document.getElementById('submit-spinner');
  const submitText   = document.getElementById('submit-text');

  const textFields = ['student-name', 'student-id', 'student-roll', 'student-password', 'student-confirm-password'];
  textFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', function () {
      if (this.value.trim()) this.classList.remove('input-invalid');
    });
  });

  const selectFields = ['student-gender', 'student-class', 'student-section'];
  selectFields.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', function () {
      if (this.value) this.classList.remove('select-invalid');
    });
  });

  // ── Form Submit ──────────────────────────────────────────────
  studentForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    let isValid = true;

    const name      = document.getElementById('student-name');
    const id        = document.getElementById('student-id');
    const roll      = document.getElementById('student-roll');
    const pwd       = document.getElementById('student-password');
    const confirm   = document.getElementById('student-confirm-password');
    const email     = document.getElementById('student-email');
    const gender    = document.getElementById('student-gender');
    const classSel  = document.getElementById('student-class');
    const sectionSel = document.getElementById('student-section');

    // Required text inputs
    [
      [name,    'err-student-name'],
      [id,      'err-student-id'],
      [roll,    'err-student-roll'],
      [pwd,     'err-student-password'],
    ].forEach(([el, errId]) => {
      if (!el.value.trim()) {
        el.classList.add('input-invalid');
        document.getElementById(errId).classList.add('show');
        isValid = false;
      } else {
        el.classList.remove('input-invalid');
        document.getElementById(errId).classList.remove('show');
      }
    });

    // Optional email format check
    const emailErr = document.getElementById('err-student-email');
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.classList.add('input-invalid');
      emailErr.classList.add('show');
      isValid = false;
    } else {
      email.classList.remove('input-invalid');
      emailErr.classList.remove('show');
    }

    // Confirm password
    const errConfirm = document.getElementById('err-student-confirm-password');
    if (!confirm.value.trim() || confirm.value !== pwd.value) {
      confirm.classList.add('input-invalid');
      errConfirm.classList.add('show');
      errConfirm.textContent = !confirm.value.trim() ? 'Please confirm your password.' : 'Passwords do not match.';
      isValid = false;
    } else {
      confirm.classList.remove('input-invalid');
      errConfirm.classList.remove('show');
    }

    // Required selects
    [
      [gender,     'err-student-gender'],
      [classSel,   'err-student-class'],
      [sectionSel, 'err-student-section'],
    ].forEach(([el, errId]) => {
      if (!el.value) {
        el.classList.add('select-invalid');
        document.getElementById(errId).classList.add('show');
        isValid = false;
      } else {
        el.classList.remove('select-invalid');
        document.getElementById(errId).classList.remove('show');
      }
    });

    if (!isValid) return;

    const formData = new FormData();
    formData.append('full_name',        name.value);
    formData.append('student_email',    email.value);
    formData.append('student_id',       id.value);
    formData.append('gender',           gender.value);
    formData.append('password',         pwd.value);
    formData.append('confirm_password', confirm.value);
    formData.append('class',            classSel.value);
    formData.append('section',          sectionSel.value);
    formData.append('roll',             roll.value);
    formData.append('phone_number',     document.getElementById('student-phone').value);
    const photoFile = document.getElementById('student-photo').files[0];
    if (photoFile) formData.append('profile_photo', photoFile);

    submitBtn.disabled = true;
    submitSpinner.classList.remove('hidden');
    submitText.textContent = 'Enrolling...';

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockSuccess = true;
      if (mockSuccess) {
        showToast('Student enrolled successfully!', 'success');
        studentForm.reset();
        if (photoNameSpan) { photoNameSpan.textContent = ''; photoNameSpan.className = 'photo-name'; }
        textFields.forEach(f => { const el = document.getElementById(f); if (el) el.classList.remove('input-invalid'); });
        selectFields.forEach(s => { const el = document.getElementById(s); if (el) el.classList.remove('select-invalid'); });
      } else {
        showToast('Enrollment failed. Please try again.', 'error');
      }
    } catch (err) {
      showToast('Network error: ' + err.message, 'error');
    } finally {
      submitBtn.disabled = false;
      submitSpinner.classList.add('hidden');
      submitText.textContent = 'Enroll Student';
    }
  });

  // ── PDF Generation ───────────────────────────────────────────
  window.generateStudentPDF = function () {
    if (!window.jspdf) { showToast('PDF library not loaded', 'error'); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name      = document.getElementById('student-name').value      || '________________';
    const email     = document.getElementById('student-email').value     || '________________';
    const studentId = document.getElementById('student-id').value        || '________________';
    const gender    = document.getElementById('student-gender').value    || '________________';
    const cls       = document.getElementById('student-class').value     || '________________';
    const section   = document.getElementById('student-section').value   || '________________';
    const roll      = document.getElementById('student-roll').value      || '________________';
    const phone     = document.getElementById('student-phone').value     || '________________';
    const password  = document.getElementById('student-password').value  || '________________';
    const today     = new Date().toLocaleDateString('en-BD');

    const pW     = doc.internal.pageSize.getWidth();
    const margin = 14;
    const usable = pW - margin * 2;

    let y = 0;

    // Draw a repeating-char divider across the usable width
    const divider = (char = '=') => {
      doc.setFontSize(9);
      doc.setFont('courier', 'normal');
      const count = Math.floor(usable / doc.getTextWidth(char));
      doc.text(char.repeat(count), margin, y);
      y += 5;
    };

    // Centered text
    const centerText = (txt, size, style = 'normal') => {
      doc.setFontSize(size);
      doc.setFont('courier', style);
      doc.text(txt, (pW - doc.getTextWidth(txt)) / 2, y);
      y += size * 0.45;
    };

    // Section heading
    const sectionTitle = (title) => {
      doc.setFontSize(9);
      doc.setFont('courier', 'bold');
      doc.text(title, margin + 4, y);
      y += 5.5;
      doc.setFont('courier', 'normal');
    };

    // Fixed-column key-value row
    const LABEL_COL = margin + 8;
    const COLON_COL = LABEL_COL + 43;
    const VALUE_COL = COLON_COL + 4;

    const kv = (label, value) => {
      doc.setFontSize(9.5);
      doc.setFont('courier', 'normal');
      doc.text(label, LABEL_COL, y);
      doc.text(':',   COLON_COL, y);
      doc.text(value, VALUE_COL, y);
      y += 6;
    };

    // ── Build PDF ──
    y = 14;
    divider('=');
    y += 3;
    centerText('NIRIKKHA ADMIN SYSTEM', 14, 'bold');
    y += 3;
    centerText('STUDENT ENROLMENT RECEIPT', 10, 'normal');
    y += 5;
    divider('=');
    y += 3;

    kv('Date',       today);
    kv('Student ID', studentId);
    y += 3;

    divider('-');
    sectionTitle('PERSONAL INFORMATION');
    divider('-');
    kv('Full Name',     name);
    kv('Email Address', email);
    kv('Gender',        gender);
    kv('Phone',         phone);
    y += 3;

    divider('-');
    sectionTitle('ACADEMIC DETAILS');
    divider('-');
    kv('Class',       cls);
    kv('Section',     section);
    kv('Roll Number', roll);
    y += 3;

    divider('-');
    sectionTitle('SECURITY');
    divider('-');
    kv('Password', password);
    y += 8;

    divider('-');
    y += 5;
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    doc.text('Authorized Signature', LABEL_COL, y);
    y += 7;
    doc.text('___________________________', LABEL_COL, y);
    y += 12;

    divider('=');
    doc.setFontSize(8);
    doc.setFont('courier', 'normal');
    const ft = 'Nirikkha  |  Developed by Nipatane Siddha Softwares';
    doc.text(ft, (pW - doc.getTextWidth(ft)) / 2, y);
    y += 5;
    divider('=');

    doc.save(`student-${studentId !== '________________' ? studentId : 'receipt'}.pdf`);
  };

  // ── CSV Bulk Upload ──────────────────────────────────────────
  const csvInput           = document.getElementById('csv-upload-input');
  const processBtn         = document.getElementById('process-csv-btn');
  const downloadTemplateLink = document.getElementById('download-csv-template');
  const uploadArea         = document.getElementById('csv-upload-area');

  downloadTemplateLink.addEventListener('click', (e) => {
    e.preventDefault();
    const csvContent = [
      'Full Name,Student Email,Student ID,Gender,Class,Section,Roll,Phone Number,Password',
      'John Doe,john@student.edu,STU001,Male,Class 6,Section A,101,+88012345678,pass123',
      'Jane Smith,jane@student.edu,STU002,Female,Class 7,Section B,102,+88087654321,pass456',
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'student_bulk_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Template downloaded', 'info');
  });

  if (uploadArea) uploadArea.addEventListener('click', () => csvInput.click());

  processBtn.addEventListener('click', async () => {
    if (!csvInput.files || csvInput.files.length === 0) {
      showToast('Please select a CSV file first', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = async function (e) {
      const rows = e.target.result.split(/\r?\n/).filter(r => r.trim().length > 0);
      if (rows.length < 2) {
        showToast('CSV must contain header + at least one data row', 'error');
        return;
      }
      showToast(`Bulk upload: ${rows.length - 1} records processed (demo)`, 'success');
      csvInput.value = '';
    };
    reader.readAsText(csvInput.files[0]);
  });

})();
