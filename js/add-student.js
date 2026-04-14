(function () {

  // ── Photo preview ──
  window.previewPhoto = function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      var preview = document.getElementById('photo-preview');
      var placeholder = document.getElementById('photo-placeholder');
      preview.src = ev.target.result;
      preview.classList.remove('hidden-el');
      placeholder.classList.add('hidden-el');
    };
    reader.readAsDataURL(file);
  };

  // ── Password visibility toggle ──
  window.togglePass = function (inputId, iconId) {
    var input = document.getElementById(inputId);
    var icon = document.getElementById(iconId);
    if (input.type === 'password') {
      input.type = 'text';
      icon.textContent = 'visibility_off';
    } else {
      input.type = 'password';
      icon.textContent = 'visibility';
    }
  };

  // ── Form submit ──
  window.handleSubmit = function (e) {
    e.preventDefault();

    var password = document.getElementById('password').value;
    var confirm = document.getElementById('confirm-password').value;

    if (password !== confirm) {
      showToast('Passwords do not match.', true);
      return;
    }

    showToast('Student enrolled successfully!', false);
    document.getElementById('enroll-form').reset();

    // Reset photo preview
    var preview = document.getElementById('photo-preview');
    var placeholder = document.getElementById('photo-placeholder');
    preview.classList.add('hidden-el');
    placeholder.classList.remove('hidden-el');
    preview.src = '';
  };

  // ── Download PDF placeholder ──
  window.downloadPDF = function () {
    showToast('PDF download will be available soon.', false);
  };

  // ── Toast helper ──
  function showToast(message, isError) {
    var existing = document.getElementById('toast-el');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'toast-el';
    toast.className = 'toast';
    toast.style.background = isError ? '#991b1b' : '#166534';

    var icon = document.createElement('span');
    icon.className = 'ms';
    icon.textContent = isError ? 'error' : 'check_circle';

    var text = document.createElement('span');
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        toast.classList.add('show');
      });
    });

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }

  // ── CSV upload feedback ──
  var csvInput = document.getElementById('csv-input');
  if (csvInput) {
    csvInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (file) {
        showToast('CSV "' + file.name + '" ready to import.', false);
      }
    });
  }

})();