/**
 * Digital Profile Manager - الملف الأساسي
 * إدارة الملفات الشخصية الرقمية مع التخزين المحلي
 */

// الفئة الرئيسية لتمثيل الملف الشخصي
class DigitalProfile {
    constructor(id, data) {
        this.id = id;
        this.name = data.name || '';
        this.age = data.age || '';
        this.country = data.country || '';
        this.city = data.city || '';
        this.email = data.email || '';
        this.phone = data.phone || '';
        this.links = data.links || [];
        this.ip = data.ip || '';
        this.device = data.device || '';
        this.browser = data.browser || '';
        this.os = data.os || '';
        this.interests = data.interests || '';
        this.activeTime = data.activeTime || '';
        this.notes = data.notes || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
        this.riskLevel = data.riskLevel || this.calculateRiskLevel();
        this.tags = data.tags || this.generateTags();
        this.lastActivity = data.lastActivity || new Date().toISOString();
    }
    
    calculateRiskLevel() {
        let score = 0;
        if (this.ip && this.ip !== '127.0.0.1') score += 1;
        if (this.links && this.links.length > 5) score += 2;
        if (this.email && (this.email.includes('temp') || this.email.includes('fake'))) score += 3;
        if (!this.name || this.name.length < 2) score += 2;
        
        if (score >= 5) return 'high';
        if (score >= 3) return 'medium';
        return 'low';
    }
    
    generateTags() {
        const tags = [];
        if (this.ip) tags.push('ip_available');
        if (this.links && this.links.length > 0) tags.push('has_links');
        if (this.interests) tags.push('interests_defined');
        if (this.notes) tags.push('has_notes');
        return tags;
    }
    
    updateActivity() {
        this.lastActivity = new Date().toISOString();
        this.updatedAt = this.lastActivity;
    }
}

// إدارة التخزين المحسنة
class ProfileManager {
    static STORAGE_KEY = 'digitalProfiles_v2';
    static ACTIVITY_LOG_KEY = 'profile_activity_log';
    
    // جلب جميع الملفات مع فلترة وترتيب
    static getAllProfiles(filter = {}, sortBy = 'newest') {
        const profilesJSON = localStorage.getItem(this.STORAGE_KEY);
        if (!profilesJSON) return {};
        
        try {
            let profiles = JSON.parse(profilesJSON);
            
            // التطبيق الفلترة
            if (Object.keys(filter).length > 0) {
                profiles = Object.entries(profiles).filter(([id, profile]) => {
                    for (const [key, value] of Object.entries(filter)) {
                        if (key === 'riskLevel' && profile[key] !== value) return false;
                        if (key === 'country' && profile[key] !== value) return false;
                        if (key === 'hasNotes' && !profile.notes) return false;
                        if (key === 'hasLinks' && (!profile.links || profile.links.length === 0)) return false;
                    }
                    return true;
                }).reduce((acc, [id, profile]) => {
                    acc[id] = profile;
                    return acc;
                }, {});
            }
            
            // التحويل إلى مصفوفة للترتيب
            let profilesArray = Object.entries(profiles);
            
            // التطبيق الترتيب
            switch(sortBy) {
                case 'newest':
                    profilesArray.sort((a, b) => 
                        new Date(b[1].createdAt) - new Date(a[1].createdAt));
                    break;
                case 'oldest':
                    profilesArray.sort((a, b) => 
                        new Date(a[1].createdAt) - new Date(b[1].createdAt));
                    break;
                case 'name':
                    profilesArray.sort((a, b) => 
                        (a[1].name || '').localeCompare(b[1].name || ''));
                    break;
                case 'risk':
                    const riskOrder = { high: 3, medium: 2, low: 1 };
                    profilesArray.sort((a, b) => 
                        (riskOrder[b[1].riskLevel] || 0) - (riskOrder[a[1].riskLevel] || 0));
                    break;
            }
            
            // التحويل مجدداً إلى كائن
            return profilesArray.reduce((acc, [id, profile]) => {
                acc[id] = profile;
                return acc;
            }, {});
            
        } catch (e) {
            console.error('خطأ في قراءة البيانات من التخزين:', e);
            return {};
        }
    }
    
    // حفظ جميع الملفات
    static saveAllProfiles(profiles) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles));
            this.logActivity('profiles_saved', { count: Object.keys(profiles).length });
            return true;
        } catch (e) {
            console.error('خطأ في حفظ البيانات:', e);
            return false;
        }
    }
    
    // إضافة أو تحديث ملف
    static saveProfile(profile) {
        const profiles = this.getAllProfiles();
        profile.updatedAt = new Date().toISOString();
        
        if (!profile.id) {
            profile.id = this.generateId();
            profile.createdAt = new Date().toISOString();
        }
        
        profiles[profile.id] = profile;
        const success = this.saveAllProfiles(profiles);
        
        if (success) {
            this.logActivity('profile_saved', { 
                profileId: profile.id, 
                name: profile.name,
                action: profiles[profile.id] ? 'updated' : 'created'
            });
        }
        
        return success ? profile.id : null;
    }
    
    // جلب ملف معين
    static getProfile(id) {
        const profiles = this.getAllProfiles();
        const profile = profiles[id];
        
        if (profile) {
            this.logActivity('profile_viewed', { profileId: id, name: profile.name });
        }
        
        return profile || null;
    }
    
    // حذف ملف
    static deleteProfile(id) {
        const profiles = this.getAllProfiles();
        const profile = profiles[id];
        
        if (profile) {
            delete profiles[id];
            const success = this.saveAllProfiles(profiles);
            
            if (success) {
                this.logActivity('profile_deleted', { 
                    profileId: id, 
                    name: profile.name 
                });
            }
            
            return success;
        }
        
        return false;
    }
    
    // البحث في الملفات بشكل متقدم
    static searchProfiles(query) {
        const profiles = this.getAllProfiles();
        const results = [];
        query = query.toLowerCase().trim();
        
        if (!query) return Object.values(profiles);
        
        for (const id in profiles) {
            const profile = profiles[id];
            let matchScore = 0;
            
            // البحث في الاسم (أعلى وزن)
            if (profile.name && profile.name.toLowerCase().includes(query)) {
                matchScore += 10;
            }
            
            // البحث في البريد الإلكتروني
            if (profile.email && profile.email.toLowerCase().includes(query)) {
                matchScore += 8;
            }
            
            // البحث في الهاتف
            if (profile.phone && profile.phone.includes(query)) {
                matchScore += 7;
            }
            
            // البحث في الدولة والمدينة
            if (profile.country && profile.country.toLowerCase().includes(query)) {
                matchScore += 5;
            }
            if (profile.city && profile.city.toLowerCase().includes(query)) {
                matchScore += 5;
            }
            
            // البحث في الاهتمامات
            if (profile.interests && profile.interests.toLowerCase().includes(query)) {
                matchScore += 3;
            }
            
            // البحث في الملاحظات
            if (profile.notes && profile.notes.toLowerCase().includes(query)) {
                matchScore += 2;
            }
            
            if (matchScore > 0) {
                results.push({ 
                    id, 
                    ...profile, 
                    matchScore,
                    matchPercentage: Math.min(100, matchScore * 8)
                });
            }
        }
        
        // ترتيب النتائج حسب درجة المطابقة
        results.sort((a, b) => b.matchScore - a.matchScore);
        return results;
    }
    
    // إنشاء معرف فريد
    static generateId() {
        return 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // إحصائيات النظام
    static getStats() {
        const profiles = this.getAllProfiles();
        const stats = {
            total: Object.keys(profiles).length,
            byRiskLevel: { low: 0, medium: 0, high: 0 },
            byCountry: {},
            withEmail: 0,
            withPhone: 0,
            withNotes: 0,
            withLinks: 0,
            averageAge: 0
        };
        
        let totalAge = 0;
        let countWithAge = 0;
        
        Object.values(profiles).forEach(profile => {
            // مستويات الخطورة
            stats.byRiskLevel[profile.riskLevel || 'low']++;
            
            // البلدان
            if (profile.country) {
                stats.byCountry[profile.country] = (stats.byCountry[profile.country] || 0) + 1;
            }
            
            // البيانات المتوفرة
            if (profile.email) stats.withEmail++;
            if (profile.phone) stats.withPhone++;
            if (profile.notes && profile.notes.trim()) stats.withNotes++;
            if (profile.links && profile.links.length > 0) stats.withLinks++;
            
            // حساب العمر المتوسط
            if (profile.age && !isNaN(parseInt(profile.age))) {
                totalAge += parseInt(profile.age);
                countWithAge++;
            }
        });
        
        if (countWithAge > 0) {
            stats.averageAge = Math.round(totalAge / countWithAge);
        }
        
        return stats;
    }
    
    // سجل الأنشطة
    static logActivity(action, details = {}) {
        try {
            const logs = JSON.parse(localStorage.getItem(this.ACTIVITY_LOG_KEY) || '[]');
            const logEntry = {
                timestamp: new Date().toISOString(),
                action,
                details,
                userAgent: navigator.userAgent
            };
            
            logs.unshift(logEntry);
            logs.splice(100); // الاحتفاظ بآخر 100 سجل فقط
            
            localStorage.setItem(this.ACTIVITY_LOG_KEY, JSON.stringify(logs));
        } catch (e) {
            console.error('خطأ في تسجيل النشاط:', e);
        }
    }
    
    // جلب سجل الأنشطة
    static getActivityLog(limit = 20) {
        try {
            const logs = JSON.parse(localStorage.getItem(this.ACTIVITY_LOG_KEY) || '[]');
            return logs.slice(0, limit);
        } catch (e) {
            console.error('خطأ في قراءة سجل الأنشطة:', e);
            return [];
        }
    }
    
    // تنظيف البيانات القديمة (أكثر من 30 يوم)
    static cleanupOldData(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        const profiles = this.getAllProfiles();
        let deletedCount = 0;
        
        for (const id in profiles) {
            const profile = profiles[id];
            const profileDate = new Date(profile.createdAt);
            
            if (profileDate < cutoffDate) {
                delete profiles[id];
                deletedCount++;
            }
        }
        
        if (deletedCount > 0) {
            this.saveAllProfiles(profiles);
            this.logActivity('data_cleanup', { deletedCount, days });
        }
        
        return deletedCount;
    }
    
    // تصدير جميع البيانات
    static exportAllData(format = 'json') {
        const data = {
            profiles: this.getAllProfiles(),
            activityLog: this.getActivityLog(1000),
            stats: this.getStats(),
            exportedAt: new Date().toISOString(),
            version: '2.0'
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(data.profiles);
        }
    }
    
    // تحويل البيانات لـ CSV
    static convertToCSV(profiles) {
        const headers = ['الاسم', 'العمر', 'الدولة', 'المدينة', 'البريد الإلكتروني', 
                        'رقم الهاتف', 'مستوى الخطورة', 'تاريخ الإنشاء'];
        
        const rows = Object.values(profiles).map(profile => [
            `"${profile.name || ''}"`,
            profile.age || '',
            `"${profile.country || ''}"`,
            `"${profile.city || ''}"`,
            `"${profile.email || ''}"`,
            `"${profile.phone || ''}"`,
            profile.riskLevel || 'low',
            new Date(profile.createdAt).toLocaleDateString('ar-SA')
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    // استيراد البيانات
    static importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (!data.profiles || !data.version) {
                throw new Error('تنسيق البيانات غير صالح');
            }
            
            const existingProfiles = this.getAllProfiles();
            const mergedProfiles = { ...existingProfiles, ...data.profiles };
            
            this.saveAllProfiles(mergedProfiles);
            this.logActivity('data_imported', { 
                importedCount: Object.keys(data.profiles).length,
                totalCount: Object.keys(mergedProfiles).length
            });
            
            return true;
        } catch (e) {
            console.error('خطأ في استيراد البيانات:', e);
            return false;
        }
    }
}

// ==================== واجهة المستخدم ====================

// عرض الملفات على الصفحة الرئيسية
function displayProfiles(profiles = null, viewMode = 'grid') {
    const container = document.getElementById('profilesContainer');
    const noProfilesMsg = document.getElementById('noProfilesMessage');
    
    if (!container) return;
    
    // إذا لم يتم تمرير معامل، اجلب كل الملفات
    let profilesToDisplay = profiles;
    if (!profilesToDisplay) {
        const allProfiles = ProfileManager.getAllProfiles({}, 'newest');
        profilesToDisplay = Object.values(allProfiles);
    }
    
    if (!Array.isArray(profilesToDisplay)) {
        profilesToDisplay = [];
    }
    
    if (profilesToDisplay.length === 0) {
        container.innerHTML = '';
        if (noProfilesMsg) noProfilesMsg.style.display = 'block';
        return;
    }
    
    if (noProfilesMsg) noProfilesMsg.style.display = 'none';
    
    // تطبيق نمط العرض المحدد
    container.className = viewMode === 'grid' ? 'profiles-grid' : 'profiles-list';
    container.innerHTML = '';
    
    profilesToDisplay.forEach(profile => {
        const profileCard = createProfileCard(profile, viewMode);
        container.appendChild(profileCard);
    });
    
    // إضافة مستمعي أحداث لحذف الملفات
    attachDeleteEventListeners();
}

// إنشاء بطاقة الملف الشخصي
function createProfileCard(profile, viewMode = 'grid') {
    const profileCard = document.createElement('div');
    profileCard.className = 'profile-card';
    profileCard.setAttribute('data-id', profile.id);
    
    const riskLevel = profile.riskLevel || 'low';
    const riskText = {
        low: 'منخفض',
        medium: 'متوسط',
        high: 'مرتفع'
    }[riskLevel];
    
    const interests = profile.interests ? 
        (profile.interests.length > 50 ? 
         profile.interests.substring(0, 50) + '...' : 
         profile.interests) : 
        'غير محدد';
    
    const linksCount = profile.links ? profile.links.length : 0;
    const hasNotes = profile.notes && profile.notes.trim().length > 0;
    
    if (viewMode === 'grid') {
        profileCard.innerHTML = `
            <div class="profile-header">
                <h3>${profile.name || 'بدون اسم'}</h3>
                <div class="risk-badge risk-${riskLevel}">${riskText}</div>
            </div>
            <div class="profile-details">
                ${profile.country ? `<div class="profile-detail"><i class="fas fa-globe"></i> ${profile.country}${profile.city ? ` - ${profile.city}` : ''}</div>` : ''}
                ${profile.email ? `<div class="profile-detail"><i class="fas fa-envelope"></i> ${profile.email}</div>` : ''}
                ${profile.phone ? `<div class="profile-detail"><i class="fas fa-phone"></i> ${profile.phone}</div>` : ''}
                ${interests !== 'غير محدد' ? `<div class="profile-detail"><i class="fas fa-heart"></i> ${interests}</div>` : ''}
                <div class="profile-detail">
                    <i class="fas ${hasNotes ? 'fa-sticky-note text-success' : 'fa-sticky-note'}"></i>
                    ${hasNotes ? 'يوجد ملاحظات' : 'لا توجد ملاحظات'}
                </div>
                <div class="profile-detail">
                    <i class="fas ${linksCount > 0 ? 'fa-link text-success' : 'fa-link'}"></i>
                    ${linksCount} رابط${linksCount !== 1 ? 'ات' : ''}
                </div>
            </div>
            <div class="card-actions">
                <a href="profile.html?id=${profile.id}" class="btn-secondary">
                    <i class="fas fa-eye"></i> عرض التفاصيل
                </a>
                <button class="btn-icon delete-profile" data-id="${profile.id}" title="حذف الملف">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    } else {
        // نمط القائمة
        profileCard.innerHTML = `
            <div class="list-view-profile">
                <div class="list-main-info">
                    <div class="list-name">
                        <h4>${profile.name || 'بدون اسم'}</h4>
                        <div class="risk-badge risk-${riskLevel}">${riskText}</div>
                    </div>
                    <div class="list-contacts">
                        ${profile.email ? `<span><i class="fas fa-envelope"></i> ${profile.email}</span>` : ''}
                        ${profile.phone ? `<span><i class="fas fa-phone"></i> ${profile.phone}</span>` : ''}
                    </div>
                </div>
                <div class="list-secondary-info">
                    ${profile.country ? `<span><i class="fas fa-globe"></i> ${profile.country}</span>` : ''}
                    ${profile.interests ? `<span><i class="fas fa-heart"></i> ${profile.interests.substring(0, 30)}${profile.interests.length > 30 ? '...' : ''}</span>` : ''}
                    <span><i class="fas fa-calendar"></i> ${new Date(profile.createdAt).toLocaleDateString('ar-SA')}</span>
                </div>
                <div class="list-actions">
                    <a href="profile.html?id=${profile.id}" class="btn-icon" title="عرض">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="btn-icon delete-profile" data-id="${profile.id}" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    return profileCard;
}

// التعامل مع البحث
function handleSearch(query) {
    const results = ProfileManager.searchProfiles(query);
    const viewMode = document.querySelector('.view-btn.active')?.getAttribute('data-view') || 'grid';
    displayProfiles(results, viewMode);
}

// ترتيب الملفات
function sortProfiles(sortBy) {
    const profiles = ProfileManager.getAllProfiles({}, sortBy);
    const viewMode = document.querySelector('.view-btn.active')?.getAttribute('data-view') || 'grid';
    displayProfiles(Object.values(profiles), viewMode);
}

// تبديل طريقة العرض
function toggleViewMode(viewType) {
    const container = document.getElementById('profilesContainer');
    if (!container) return;
    
    container.className = viewType === 'grid' ? 'profiles-grid' : 'profiles-list';
    
    // إعادة عرض الملفات بنمط العرض الجديد
    const currentProfiles = Array.from(container.children).map(card => {
        const id = card.getAttribute('data-id');
        return ProfileManager.getProfile(id);
    }).filter(p => p !== null);
    
    displayProfiles(currentProfiles, viewType);
}

// إضافة مستمعي أحداث لحذف الملفات
function attachDeleteEventListeners() {
    document.querySelectorAll('.delete-profile').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const profileId = this.getAttribute('data-id');
            const profile = ProfileManager.getProfile(profileId);
            
            if (profile) {
                showDeleteModal(profileId, profile.name);
            }
        });
    });
}

// عرض نافذة تأكيد الحذف
function showDeleteModal(profileId, profileName) {
    const modal = document.getElementById('deleteModal');
    const modalText = document.getElementById('deleteModalText');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    
    if (!modal || !modalText) return;
    
    modalText.textContent = `هل أنت متأكد من حذف الملف الشخصي "${profileName}"؟ لا يمكن التراجع عن هذا الإجراء.`;
    
    // إزالة المستمعين السابقين لمنع التكرار
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        ProfileManager.deleteProfile(profileId);
        modal.style.display = 'none';
        
        // إعادة عرض الملفات
        const searchInput = document.getElementById('searchInput');
        if (searchInput && searchInput.value.trim() !== '') {
            handleSearch(searchInput.value.trim());
        } else {
            displayProfiles();
        }
        
        // تحديث الإحصائيات
        if (typeof updateStats === 'function') {
            updateStats();
        }
    });
    
    newCancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    modal.style.display = 'flex';
}

// معالجة النموذج لإضافة شخص جديد
function setupAddForm() {
    const form = document.getElementById('addProfileForm');
    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // جمع البيانات من الحقول
        const formData = {
            name: document.getElementById('name').value.trim(),
            age: document.getElementById('age').value.trim(),
            country: document.getElementById('country').value.trim(),
            city: document.getElementById('city').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            // جمع جميع الروابط
            links: Array.from(document.querySelectorAll('.link-input'))
                      .map(input => input.value.trim())
                      .filter(link => link !== ''),
            ip: document.getElementById('ip').value.trim(),
            device: document.getElementById('device').value.trim(),
            browser: document.getElementById('browser').value.trim(),
            os: document.getElementById('os').value.trim(),
            interests: document.getElementById('interests').value.trim(),
            activeTime: document.getElementById('activeTime').value.trim(),
            notes: document.getElementById('notes').value.trim(),
            createdAt: new Date().toISOString()
        };

        // التأكد من وجود اسم
        if (!formData.name) {
            alert('الرجاء إدخال اسم الشخص.');
            return;
        }

        // إنشاء معرف وحفظ الملف
        const profileId = ProfileManager.generateId();
        const newProfile = new DigitalProfile(profileId, formData);
        const savedId = ProfileManager.saveProfile(newProfile);

        // إعادة توجيه المستخدم
        if (savedId) {
            alert(`✅ تم حفظ الملف الشخصي "${formData.name}" بنجاح!`);
            window.location.href = `profile.html?id=${savedId}`;
        } else {
            alert('❌ حدث خطأ أثناء حفظ الملف الشخصي');
        }
    });
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    // إذا كانت الصفحة الرئيسية، عرض الملفات
    if (document.getElementById('profilesContainer')) {
        displayProfiles();
        
        // إعداد البحث
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                handleSearch(this.value);
            });
        }
        
        // تنظيف البيانات القديمة تلقائيًا (مرة واحدة في اليوم)
        const lastCleanup = localStorage.getItem('last_cleanup');
        const today = new Date().toDateString();
        
        if (!lastCleanup || lastCleanup !== today) {
            const deletedCount = ProfileManager.cleanupOldData(30);
            if (deletedCount > 0) {
                console.log(`تم تنظيف ${deletedCount} ملف قديم.`);
            }
            localStorage.setItem('last_cleanup', today);
        }
    }

    // إذا كانت صفحة الإضافة، أعد النموذج
    if (document.getElementById('addProfileForm')) {
        setupAddForm();
    }
});

// جعل الوظائف متاحة عالميًا
window.ProfileManager = ProfileManager;
window.DigitalProfile = DigitalProfile;
window.displayProfiles = displayProfiles;
window.handleSearch = handleSearch;
window.toggleViewMode = toggleViewMode;
window.sortProfiles = sortProfiles;

console.log('✅ تم تحميل Digital Profile Manager بنجاح');