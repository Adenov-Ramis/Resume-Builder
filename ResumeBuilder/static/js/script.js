window.jsPDF = window.jspdf.jsPDF;

function addEducation() {
    const container = document.getElementById('educationContainer');
    const div = document.createElement('div');
    div.className = 'education-entry';
    div.innerHTML = `
        <input type="text" placeholder="School" class="edu-school" oninput="updatePreview()">
        <input type="text" placeholder="Degree" class="edu-degree" oninput="updatePreview()">
        <input type="text" placeholder="Year (e.g. 2018-2022)" class="edu-year" oninput="updatePreview()">
        <button type="button" onclick="this.parentElement.remove(); updatePreview();">Remove</button>
        <hr>
    `;
    container.appendChild(div);
}

function addExperience() {
    const container = document.getElementById('experienceContainer');
    const div = document.createElement('div');
    div.className = 'experience-entry';
    div.innerHTML = `
        <input type="text" placeholder="Company" class="exp-company" oninput="updatePreview()">
        <input type="text" placeholder="Position" class="exp-position" oninput="updatePreview()">
        <input type="text" placeholder="Duration (e.g. 2020-2023)" class="exp-duration" oninput="updatePreview()">
        <textarea placeholder="Description" class="exp-desc" rows="2" oninput="updatePreview()"></textarea>
        <button type="button" onclick="this.parentElement.remove(); updatePreview();">Remove</button>
        <hr>
    `;
    container.appendChild(div);
}

function updatePreview() {
    const preview = document.getElementById('resumePreview');
    const fullName = document.getElementById('fullName').value.trim() || 'Your Name';
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const summary = document.getElementById('summary').value.trim().replace(/\n/g, '<br>');
    const skillsRaw = document.getElementById('skills').value;
    const skillsList = skillsRaw ? skillsRaw.split(',').map(s => s.trim()).filter(s => s) : [];

    const eduEntries = document.querySelectorAll('.education-entry');
    let eduHTML = '';
    eduEntries.forEach(entry => {
        const school = entry.querySelector('.edu-school').value.trim();
        const degree = entry.querySelector('.edu-degree').value.trim();
        const year = entry.querySelector('.edu-year').value.trim();
        if (school || degree || year) {
            eduHTML += `<div class="item"><span class="item-title">${degree || ''}</span>${degree && school ? ', ' : ''}${school || ''}<br><span class="item-date">${year || ''}</span></div>`;
        }
    });

    const expEntries = document.querySelectorAll('.experience-entry');
    let expHTML = '';
    expEntries.forEach(entry => {
        const company = entry.querySelector('.exp-company').value.trim();
        const position = entry.querySelector('.exp-position').value.trim();
        const duration = entry.querySelector('.exp-duration').value.trim();
        const desc = entry.querySelector('.exp-desc').value.trim();
        if (company || position || duration || desc) {
            expHTML += `<div class="item"><span class="item-title">${position || ''}</span>${position && company ? ' at ' : ''}${company || ''}<br><span class="item-date">${duration || ''}</span>`;
            if (desc) expHTML += `<p>${desc.replace(/\n/g, '<br>')}</p>`;
            expHTML += `</div>`;
        }
    });

    let html = `<h1>${fullName}</h1>`;
    if (email || phone) {
        html += `<div class="contact">`;
        if (email) html += `📧 ${email} `;
        if (phone) html += `📞 ${phone}`;
        html += `</div>`;
    }
    if (summary) html += `<p>${summary}</p>`;

    if (eduHTML) html += `<h2>Education</h2>${eduHTML}`;
    if (expHTML) html += `<h2>Experience</h2>${expHTML}`;

    if (skillsList.length) {
        html += `<h2>Skills</h2><ul>`;
        skillsList.forEach(skill => html += `<li>${skill}</li>`);
        html += `</ul>`;
    }

    preview.innerHTML = html;
}

async function generatePDF() {
    const element = document.getElementById('resumePreview');

    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.textContent = 'Generating PDF...';
    downloadBtn.disabled = true;

    try {
        const canvas = await html2canvas(element, {
            scale: 2,                // sharp but not memory-heavy
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('Resume.pdf');
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Could not generate PDF. Please try again.');
    } finally {
        downloadBtn.textContent = 'Download PDF';
        downloadBtn.disabled = false;
    }
}

// Initial call
updatePreview();