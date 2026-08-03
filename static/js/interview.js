// MockMentor AI - Start New Interview Page JS

document.addEventListener('DOMContentLoaded', function() {
    // Load profile skills from local storage (configured in Dashboard / Edit Profile)
    function loadProfileSkills() {
        const userId = window.CURRENT_USER_ID || 0;
        try {
            let stored = localStorage.getItem('mockmentorai_profile_' + userId);
            if (!stored && userId !== 0) {
                stored = localStorage.getItem('mockmentorai_profile_0');
            }
            if (!stored) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('mockmentorai_profile_')) {
                        stored = localStorage.getItem(key);
                        if (stored) break;
                    }
                }
            }
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed && Array.isArray(parsed.skills) && parsed.skills.length > 0) {
                    return [...parsed.skills];
                }
            }
        } catch (e) {
            console.error('Error reading stored profile skills:', e);
        }
        return ['JavaScript', 'Angular', 'HTML', 'CSS', 'Python'];
    }

    // State management
    let skills = loadProfileSkills();
    let selectedDifficulty = 'easy';
    let uploadedFile = {
        name: '',
        file: null
    };

    // DOM Elements
    const skillInput = document.getElementById('skillInput');
    const skillsContainer = document.getElementById('skillsContainer');
    const resumeFileInput = document.getElementById('resumeFileInput');
    const dropzoneBox = document.getElementById('dropzoneBox');
    const btnChooseFile = document.getElementById('btnChooseFile');
    const resumePreviewCard = document.getElementById('resumePreviewCard');
    const resumeFileName = document.getElementById('resumeFileName');
    const resumeStatus = document.getElementById('resumeStatus');
    const removeResumeBtn = document.getElementById('removeResumeBtn');
    const educationContainer = document.getElementById('educationContainer');
    const btnAddEducation = document.getElementById('btnAddEducation');
    const btnStartInterview = document.getElementById('btnStartInterview');
    const difficultyCards = document.querySelectorAll('.difficulty-card');

    // Ensure resume preview card visibility matches initial uploadedFile state
    if (resumePreviewCard) {
        resumePreviewCard.style.display = uploadedFile.name ? 'block' : 'none';
    }

    // Dark Mode Toggle Listener
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const icon = this.querySelector('i');
            if (document.body.classList.contains('dark-mode')) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });
    }

    // Render initial skills
    renderSkills();

    // Skills Tagging Logic
    function renderSkills() {
        skillsContainer.innerHTML = '';
        skills.forEach((skill, index) => {
            const tag = document.createElement('span');
            tag.className = 'skill-tag';
            tag.innerHTML = `
                ${escapeHtml(skill)}
                <span class="remove-tag" data-index="${index}">&times;</span>
            `;
            skillsContainer.appendChild(tag);
        });

        // Add remove handlers
        document.querySelectorAll('.remove-tag').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                skills.splice(index, 1);
                renderSkills();
            });
        });
    }

    window.addStreamTag = function(streamName) {
        if (streamName && !skills.includes(streamName)) {
            skills.push(streamName);
            renderSkills();
        }
    };

    if (skillInput) {
        skillInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const val = this.value.trim().replace(',', '');
                if (val && !skills.includes(val)) {
                    skills.push(val);
                    renderSkills();
                    this.value = '';
                }
            }
        });
    }

    // Resume Upload & Drag and Drop
    if (btnChooseFile && resumeFileInput) {
        btnChooseFile.addEventListener('click', (e) => {
            e.stopPropagation();
            resumeFileInput.click();
        });
    }

    if (dropzoneBox) {
        dropzoneBox.addEventListener('click', () => {
            resumeFileInput.click();
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropzoneBox.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzoneBox.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropzoneBox.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzoneBox.classList.remove('dragover');
            });
        });

        dropzoneBox.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files && files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
    }

    if (resumeFileInput) {
        resumeFileInput.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                handleFileSelect(this.files[0]);
            }
        });
    }

    function handleFileSelect(file) {
        uploadedFile.name = file.name;
        uploadedFile.file = file;
        
        if (resumeFileName && resumePreviewCard) {
            resumeFileName.textContent = file.name;
            resumeStatus.textContent = 'Uploaded successfully';
            resumeStatus.style.color = '#10b981';
            resumePreviewCard.style.display = 'block';
        }
    }

    if (removeResumeBtn) {
        removeResumeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            uploadedFile = { name: '', file: null };
            if (resumeFileInput) resumeFileInput.value = '';
            if (resumeFileName) resumeFileName.textContent = '';
            if (resumeStatus) {
                resumeStatus.textContent = 'Upload a resume';
                resumeStatus.style.color = '#64748b';
            }
            if (resumePreviewCard) resumePreviewCard.style.display = 'none';
        });
    }

    // Difficulty Level Selection
    difficultyCards.forEach(card => {
        card.addEventListener('click', function() {
            difficultyCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            selectedDifficulty = this.getAttribute('data-difficulty') || 'easy';
        });
    });

    // Add Education Row Logic
    if (btnAddEducation && educationContainer) {
        btnAddEducation.addEventListener('click', function() {
            const newRow = document.createElement('div');
            newRow.className = 'row g-3 education-row mt-2';
            newRow.innerHTML = `
                <div class="col-md-3">
                    <div class="education-input-label">Degree</div>
                    <input type="text" class="form-control degree-input" placeholder="e.g. B.Tech">
                </div>
                <div class="col-md-3">
                    <div class="education-input-label">Specialization</div>
                    <input type="text" class="form-control spec-input" placeholder="e.g. Computer Science">
                </div>
                <div class="col-md-3">
                    <div class="education-input-label">University/College</div>
                    <input type="text" class="form-control uni-input" placeholder="e.g. Mumbai University">
                </div>
                <div class="col-md-3">
                    <div class="education-input-label">Year of Passing</div>
                    <div class="input-with-icon">
                        <input type="text" class="form-control year-input" placeholder="e.g. 2024">
                        <i class="far fa-calendar-alt input-icon"></i>
                    </div>
                </div>
            `;
            educationContainer.appendChild(newRow);
        });
    }

    // Start Interview Button Click Handler
    if (btnStartInterview) {
        btnStartInterview.addEventListener('click', async function() {
            const validationAlert = document.getElementById('validationAlert');
            const validationAlertText = document.getElementById('validationAlertText');

            // Validation: Check if either resume or skills are provided
            const hasSkills = skills && skills.length > 0;
            const hasResume = uploadedFile && ((uploadedFile.file !== null) || (uploadedFile.name && uploadedFile.name.trim().length > 0 && uploadedFile.name !== 'No file attached'));

            if (!hasSkills && !hasResume) {
                if (validationAlert && validationAlertText) {
                    validationAlertText.textContent = "Cannot continue interview without resume or skills information! Please upload a resume OR enter at least one skill to proceed.";
                    validationAlert.classList.remove('d-none');
                    validationAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    alert('Cannot continue interview without resume or skills information! Please upload a resume OR enter at least one skill to proceed.');
                }
                return;
            } else {
                if (validationAlert) validationAlert.classList.add('d-none');
            }

            // Disable button and show spinner
            const originalText = btnStartInterview.innerHTML;
            btnStartInterview.disabled = true;
            btnStartInterview.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i> Initializing Interview...`;

            try {
                // Collect education data
                const educationRows = document.querySelectorAll('.education-row');
                const educationList = [];
                educationRows.forEach(row => {
                    const degree = row.querySelector('.degree-input')?.value || '';
                    const spec = row.querySelector('.spec-input')?.value || '';
                    const uni = row.querySelector('.uni-input')?.value || '';
                    const year = row.querySelector('.year-input')?.value || '';
                    if (degree || spec || uni || year) {
                        educationList.push({ degree, spec, uni, year });
                    }
                });

                const formData = new FormData();
                if (uploadedFile.file) {
                    formData.append('resume', uploadedFile.file);
                }

                const payload = {
                    skills: skills,
                    difficulty: selectedDifficulty,
                    education: educationList
                };

                formData.append('data', JSON.stringify(payload));

                // Send request to API
                const response = await fetch('/api/interview/start', {
                    method: 'POST',
                    body: uploadedFile.file ? formData : JSON.stringify(payload),
                    headers: uploadedFile.file ? {} : { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Redirect to interview session page in current window
                    window.location.href = `/interview/session/${data.interview_id}`;
                } else {
                    if (data.redirect) {
                        window.location.href = data.redirect;
                    } else if (response.status === 401) {
                        alert(data.message || 'Please log in to start your interview.');
                        window.location.href = '/login';
                    } else {
                        alert(data.message || 'Failed to start interview. Please try again.');
                        btnStartInterview.disabled = false;
                        btnStartInterview.innerHTML = originalText;
                    }
                }
            } catch (err) {
                console.error('Error starting interview:', err);
                alert('Session authentication error. Please log in to proceed.');
                window.location.href = '/login';
            }
        });
    }

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
});
