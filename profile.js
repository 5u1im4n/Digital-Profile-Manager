/**
 * منطق صفحة الملف الشخصي التفصيلية
 */

// تحميل وعرض بيانات الملف الشخصي
document.addEventListener('DOMContentLoaded', function() {
    // الحصول على معرّف الملف من الرابط
    const urlParams = new URLSearchParams(window.location.search);
    const profileId = urlParams.get('id');

    if (!profileId) {
        document.body.innerHTML = '<div class="container"><h1>❌ خطأ: لم يتم تحديد ملف شخصي.</h1><a href="index.html" class="btn-primary">العودة للرئيسية</a></div>';
        return;
    }

    // تحميل بيانات الملف
    const profile = ProfileManager.getProfile(profileId);
    if (!profile) {
        document.body.innerHTML = '<div class="container"><h1>❌ خطأ: الملف الشخصي غير موجود.</h1><a href="index.html" class="btn-primary">العودة للرئيسية</a></div>';
        return;
    }

    // عرض الاسم في العنوان
    document.getElementById('profileName').textContent = profile.name || 'بدون اسم';

    // عرض تفاصيل الملف
    displayProfileDetails(profile);

    // عرض الملاحظات الحالية
    displayNotes(profile.notes);

    // إعداد زر إضافة ملاحظة
    document.getElementById('addNoteBtn').addEventListener('click', function() {
        const newNoteInput = document.getElementById('newNote');
        const noteText = newNoteInput.value.trim();

        if (!noteText) {
            alert('الرجاء كتابة ملاحظة قبل الإضافة.');
            return;
        }

        // إنشاء الملاحظة مع الطابع الزمني
        const timestamp = new Date().toLocaleString('ar-SA');
        const noteEntry = `[${timestamp}] ${noteText}`;

        // تحديث الملاحظات في الملف
        const updatedNotes = profile.notes ? profile.notes + '\n---\n' + noteEntry : noteEntry;
        profile.notes = updatedNotes;
        profile.updatedAt = new Date().toISOString();

        // الحفظ وإعادة العرض
        ProfileManager.saveProfile(profile);
        displayNotes(updatedNotes);
        newNoteInput.value = ''; // تفريغ حقل الإدخال
        alert('✅ تمت إضافة الملاحظة بنجاح.');
    });

    // زر التحليل التجريبي (للتوافق مع الإصدار القديم)
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', function() {
            generateSummary(profile);
        });
    }
});

// عرض تفاصيل الملف في أقسام
function displayProfileDetails(profile) {
    const container = document.getElementById('profileDetailsContainer');
    if (!container) return;

    // دالة مساعدة لإنشاء قسم
    const createSection = (title, icon, content) => {
        if (!content || content.trim() === '') {
            content = '<p style="color: var(--text-secondary); font-style: italic;">لا توجد بيانات</p>';
        }
        
        return `
            <section class="form-section">
                <h2><i class="fas ${icon}"></i> ${title}</h2>
                <div class="profile-detail-content">
                    ${content}
                </div>
            </section>
        `;
    };

    // إنشاء محتوى كل قسم
    const basicInfoHTML = `
        <div class="detail-row">
            <div class="detail-item">
                <strong>الاسم:</strong>
                <span>${profile.name || 'غير محدد'}</span>
            </div>
            ${profile.age ? `
            <div class="detail-item">
                <strong>العمر:</strong>
                <span>${profile.age} سنة</span>
            </div>
            ` : ''}
            ${profile.country ? `
            <div class="detail-item">
                <strong>الدولة:</strong>
                <span>${profile.country}</span>
            </div>
            ` : ''}
            ${profile.city ? `
            <div class="detail-item">
                <strong>المدينة:</strong>
                <span>${profile.city}</span>
            </div>
            ` : ''}
        </div>
    `;

    const contactInfoHTML = `
        <div class="detail-row">
            ${profile.email ? `
            <div class="detail-item">
                <strong>البريد الإلكتروني:</strong>
                <a href="mailto:${profile.email}">${profile.email}</a>
            </div>
            ` : ''}
            ${profile.phone ? `
            <div class="detail-item">
                <strong>رقم الهاتف:</strong>
                <span>${profile.phone}</span>
            </div>
            ` : ''}
        </div>
    `;

    const technicalInfoHTML = `
        <div class="detail-row">
            ${profile.ip ? `
            <div class="detail-item">
                <strong>عنوان IP:</strong>
                <span>${profile.ip}</span>
            </div>
            ` : ''}
            ${profile.device ? `
            <div class="detail-item">
                <strong>نوع الجهاز:</strong>
                <span>${profile.device}</span>
            </div>
            ` : ''}
            ${profile.browser ? `
            <div class="detail-item">
                <strong>المتصفح:</strong>
                <span>${profile.browser}</span>
            </div>
            ` : ''}
            ${profile.os ? `
            <div class="detail-item">
                <strong>نظام التشغيل:</strong>
                <span>${profile.os}</span>
            </div>
            ` : ''}
        </div>
    `;

    // روابط
    let linksHTML = '';
    if (profile.links && profile.links.length > 0) {
        linksHTML = '<div class="links-list">';
        profile.links.forEach((link, index) => {
            linksHTML += `
                <div class="link-item">
                    <span class="link-number">${index + 1}.</span>
                    <a href="${link}" target="_blank" class="profile-link">${link}</a>
                </div>
            `;
        });
        linksHTML += '</div>';
    }

    const behavioralInfoHTML = `
        <div class="detail-row">
            ${profile.interests ? `
            <div class="detail-item">
                <strong>الاهتمامات:</strong>
                <span>${profile.interests}</span>
            </div>
            ` : ''}
            ${profile.activeTime ? `
            <div class="detail-item">
                <strong>الوقت النشط:</strong>
                <span>${profile.activeTime}</span>
            </div>
            ` : ''}
        </div>
    `;

    const metadataHTML = `
        <div class="detail-row">
            <div class="detail-item">
                <strong>مستوى الخطورة:</strong>
                <span class="risk-badge risk-${profile.riskLevel || 'low'}">
                    ${profile.riskLevel === 'high' ? 'مرتفع' : 
                      profile.riskLevel === 'medium' ? 'متوسط' : 'منخفض'}
                </span>
            </div>
            <div class="detail-item">
                <strong>تاريخ الإنشاء:</strong>
                <span>${new Date(profile.createdAt).toLocaleString('ar-SA')}</span>
            </div>
            <div class="detail-item">
                <strong>آخر تحديث:</strong>
                <span>${new Date(profile.updatedAt).toLocaleString('ar-SA')}</span>
            </div>
        </div>
    `;

    // تجميع جميع الأقسام
    const sectionsHTML = `
        ${createSection('البيانات التعريفية', 'fa-id-card', basicInfoHTML)}
        ${createSection('بيانات الاتصال', 'fa-address-book', contactInfoHTML)}
        ${createSection('البيانات التقنية', 'fa-laptop-code', technicalInfoHTML)}
        ${createSection('الروابط والحسابات', 'fa-link', linksHTML)}
        ${createSection('البيانات السلوكية', 'fa-chart-line', behavioralInfoHTML)}
        ${createSection('معلومات النظام', 'fa-info-circle', metadataHTML)}
    `;

    container.innerHTML = sectionsHTML;
    
    // إضافة أنماط CSS
    addProfileStyles();
}

// عرض الملاحظات
function displayNotes(notesText) {
    const container = document.getElementById('notesContainer');
    if (!container) return;

    if (!notesText || notesText.trim() === '') {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">لا توجد ملاحظات مسجلة بعد.</p>';
        return;
    }

    // تقسيم الملاحظات بناءً على الفاصل
    const notesArray = notesText.split('\n---\n').reverse(); // عرض الأحدث أولاً
    const notesHTML = notesArray.map(note => {
        // استخراج التاريخ إذا كان موجوداً
        const dateMatch = note.match(/\[(.*?)\]/);
        let content = note;
        let date = '';
        
        if (dateMatch) {
            date = dateMatch[1];
            content = note.replace(dateMatch[0], '').trim();
        }
        
        return `
            <div class="note-entry">
                ${date ? `<div class="note-date"><i class="fas fa-clock"></i> ${date}</div>` : ''}
                <div class="note-content">${content.replace(/\n/g, '<br>')}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = notesHTML;
}

// توليد ملخص تجريبي (للتوافق مع الإصدار القديم)
function generateSummary(profile) {
    const summaryDiv = document.getElementById('profileSummary');
    if (!summaryDiv) return;
    
    let summary = '<div style="background: var(--card-bg); padding: 20px; border-radius: 8px;">';
    summary += '<h3 style="color: var(--primary-color); margin-bottom: 15px;">📊 ملخص الملف الشخصي</h3>';
    
    summary += `<p><strong>الاسم:</strong> ${profile.name || 'غير محدد'}</p>`;
    summary += `<p><strong>الدولة/المدينة:</strong> ${profile.country || 'غير محدد'}${profile.city ? ` / ${profile.city}` : ''}</p>`;
    summary += `<p><strong>طرق الاتصال:</strong> ${profile.email ? 'بريد إلكتروني' : ''}${profile.email && profile.phone ? '، ' : ''}${profile.phone ? 'هاتف' : ''}${!profile.email && !profile.phone ? 'غير متاحة' : ''}</p>`;
    summary += `<p><strong>البيانات التقنية:</strong> ${profile.ip || 'غير معروف'}</p>`;
    summary += `<p><strong>عدد الروابط:</strong> ${profile.links ? profile.links.length : 0}</p>`;
    
    // حساب اكتمال البيانات
    const fields = ['name', 'email', 'phone', 'country', 'ip', 'interests'];
    const filledFields = fields.filter(field => 
        profile[field] && profile[field].toString().trim() !== ''
    ).length;
    const completeness = Math.round((filledFields / fields.length) * 100);
    
    summary += `<p><strong>اكتمال الملف:</strong> ${completeness}%</p>`;
    summary += `<div class="progress-bar" style="margin: 10px 0;">
                    <div class="progress-fill" style="width: ${completeness}%"></div>
                </div>`;
    
    summary += '<hr style="margin: 20px 0; border-color: var(--border-color);">';
    summary += '<p style="color: var(--text-secondary); font-size: 0.9em;"><i class="fas fa-info-circle"></i> هذا تحليل تجريبي. لتحليل متقدم استخدم ميزة الذكاء الاصطناعي.</p>';
    summary += '</div>';
    
    summaryDiv.innerHTML = summary;
}

// إضافة أنماط CSS الخاصة بصفحة الملف الشخصي
function addProfileStyles() {
    const styles = `
        .detail-row {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .detail-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 8px;
            border-right: 3px solid var(--primary-color);
        }
        
        .detail-item strong {
            display: block;
            color: var(--text-primary);
            margin-bottom: 5px;
            font-size: 0.95rem;
        }
        
        .detail-item span, .detail-item a {
            color: var(--text-secondary);
            font-size: 1rem;
        }
        
        .detail-item a:hover {
            color: var(--primary-color);
            text-decoration: underline;
        }
        
        .links-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .link-item {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            border: 1px solid var(--border-color);
        }
        
        .link-number {
            background: var(--primary-color);
            color: white;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }
        
        .profile-link {
            color: var(--text-primary);
            text-decoration: none;
            word-break: break-all;
            flex: 1;
        }
        
        .profile-link:hover {
            color: var(--primary-color);
            text-decoration: underline;
        }
        
        .note-entry {
            background: rgba(255, 255, 255, 0.05);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid var(--secondary-color);
        }
        
        .note-date {
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .note-content {
            color: var(--text-primary);
            line-height: 1.6;
        }
    `;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
}

// جعل الوظائف متاحة عالمياً
window.displayProfileDetails = displayProfileDetails;
window.displayNotes = displayNotes;
window.generateSummary = generateSummary;