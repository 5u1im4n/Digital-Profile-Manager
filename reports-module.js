/**
 * وحدة التقارير والتصدير - Digital Profile Manager
 */

class ReportManager {
    constructor() {
        this.exportFormats = {
            CSV: 'csv',
            JSON: 'json',
            TEXT: 'text',
            HTML: 'html'
        };
    }

    /**
     * تصدير ملف مفرد بصيغ متعددة
     */
    exportProfile(profileId, format = 'csv') {
        const profile = window.ProfileManager?.getProfile(profileId);
        if (!profile) {
            alert('❌ الملف غير موجود');
            return null;
        }

        switch (format.toLowerCase()) {
            case 'csv':
                return this.exportToCSV([profile], `profile_${profile.name || profileId}`);
            case 'json':
                return this.exportToJSON([profile], `profile_${profile.name || profileId}`);
            case 'text':
                return this.exportToText(profile);
            case 'html':
                return this.exportToHTML([profile], `profile_${profile.name || profileId}`);
            default:
                return this.exportToCSV([profile], `profile_${profile.name || profileId}`);
        }
    }

    /**
     * تصدير جميع الملفات
     */
    exportAllProfiles(format = 'csv', filename = 'all_profiles') {
        const profiles = window.ProfileManager?.getAllProfiles();
        if (!profiles || Object.keys(profiles).length === 0) {
            alert('⚠️ لا توجد ملفات للتصدير');
            return null;
        }

        const profilesArray = Object.values(profiles);
        
        switch (format.toLowerCase()) {
            case 'csv':
                return this.exportToCSV(profilesArray, filename);
            case 'json':
                return this.exportToJSON(profilesArray, filename);
            case 'html':
                return this.exportToHTML(profilesArray, filename);
            case 'text':
                return this.exportToText(profilesArray[0]); // أول ملف فقط للنص
            default:
                return this.exportToCSV(profilesArray, filename);
        }
    }

    /**
     * تصدير إلى CSV - للاستخدام مع Excel
     */
    exportToCSV(profiles, filename = 'profiles') {
        if (!profiles || profiles.length === 0) return '';

        // عناوين الأعمدة
        const headers = [
            'ID', 'الاسم', 'العمر', 'الدولة', 'المدينة',
            'البريد الإلكتروني', 'رقم الهاتف', 'عنوان IP',
            'نوع الجهاز', 'المتصفح', 'نظام التشغيل',
            'الاهتمامات', 'الوقت النشط', 'عدد الروابط',
            'مستوى الخطورة', 'تاريخ الإنشاء'
        ];

        // تحويل البيانات إلى صفوف
        const rows = profiles.map(profile => {
            return [
                `"${profile.id || ''}"`,
                `"${profile.name || 'غير محدد'}"`,
                `"${profile.age || ''}"`,
                `"${profile.country || ''}"`,
                `"${profile.city || ''}"`,
                `"${profile.email || ''}"`,
                `"${profile.phone || ''}"`,
                `"${profile.ip || ''}"`,
                `"${profile.device || ''}"`,
                `"${profile.browser || ''}"`,
                `"${profile.os || ''}"`,
                `"${profile.interests || ''}"`,
                `"${profile.activeTime || ''}"`,
                `"${(profile.links || []).length}"`,
                `"${profile.riskLevel || 'low'}"`,
                `"${this.formatDate(profile.createdAt)}"`
            ].join(',');
        });

        // دمج العناوين والصفوف
        const csvContent = [headers.join(','), ...rows].join('\n');
        
        // تنزيل الملف
        this.downloadFile(csvContent, `${filename}_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
        
        return csvContent;
    }

    /**
     * تصدير إلى JSON - للنسخ الاحتياطي
     */
    exportToJSON(profiles, filename = 'profiles') {
        const exportData = {
            exportDate: new Date().toISOString(),
            version: '2.0',
            count: profiles.length,
            profiles: profiles,
            system: 'Digital Profile Manager',
            note: 'هذا ملف تصدير تعليمي - لا يستخدم لأغراض حقيقية'
        };

        const jsonContent = JSON.stringify(exportData, null, 2);
        
        this.downloadFile(jsonContent, `${filename}_${Date.now()}.json`, 'application/json');
        
        return jsonContent;
    }

    /**
     * تصدير إلى نص مقروء
     */
    exportToText(profile) {
        if (!profile) return '';
        
        let textContent = `📋 التقرير الرقمي\n`;
        textContent += `═`.repeat(50) + `\n`;
        textContent += `الاسم: ${profile.name || 'غير محدد'}\n`;
        textContent += `────────────────────\n\n`;
        
        // معلومات أساسية
        textContent += `📌 المعلومات الأساسية:\n`;
        textContent += `   العمر: ${profile.age || 'غير محدد'}\n`;
        textContent += `   الموقع: ${profile.country || ''}${profile.city ? ` - ${profile.city}` : ''}\n`;
        textContent += `   تاريخ الإنشاء: ${this.formatDate(profile.createdAt)}\n\n`;
        
        // معلومات الاتصال
        textContent += `📞 معلومات الاتصال:\n`;
        textContent += `   البريد: ${profile.email || 'غير متوفر'}\n`;
        textContent += `   الهاتف: ${profile.phone || 'غير متوفر'}\n\n`;
        
        // معلومات تقنية
        textContent += `💻 المعلومات التقنية:\n`;
        textContent += `   IP: ${profile.ip || 'غير معروف'}\n`;
        textContent += `   الجهاز: ${profile.device || 'غير معروف'}\n`;
        textContent += `   المتصفح: ${profile.browser || 'غير معروف'}\n`;
        textContent += `   نظام التشغيل: ${profile.os || 'غير معروف'}\n\n`;
        
        // معلومات سلوكية
        textContent += `📊 المعلومات السلوكية:\n`;
        textContent += `   الاهتمامات: ${profile.interests || 'غير محددة'}\n`;
        textContent += `   الوقت النشط: ${profile.activeTime || 'غير معروف'}\n\n`;
        
        // الروابط
        if (profile.links && profile.links.length > 0) {
            textContent += `🔗 الروابط والحسابات (${profile.links.length}):\n`;
            profile.links.forEach((link, index) => {
                textContent += `   ${index + 1}. ${link}\n`;
            });
            textContent += `\n`;
        }
        
        // الملاحظات
        if (profile.notes) {
            textContent += `📝 الملاحظات:\n`;
            textContent += `${profile.notes}\n\n`;
        }
        
        textContent += `═`.repeat(50) + `\n`;
        textContent += `تاريخ التصدير: ${new Date().toLocaleString('ar-SA')}\n`;
        textContent += `Digital Profile Manager - مشروع تعليمي\n`;
        
        this.downloadFile(textContent, `profile_${profile.name || 'unknown'}_${Date.now()}.txt`, 'text/plain');
        
        return textContent;
    }

    /**
     * تصدير إلى HTML - عرض بصري
     */
    exportToHTML(profiles, filename = 'profiles_report') {
        const exportDate = new Date().toLocaleString('ar-SA');
        
        let htmlContent = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تقرير الملفات الرقمية</title>
            <style>
                body { 
                    font-family: 'Segoe UI', 'Cairo', Tahoma, Geneva, Verdana, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    background: #f5f5f5; 
                    color: #333;
                }
                .container { 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    background: white; 
                    padding: 30px; 
                    border-radius: 10px; 
                    box-shadow: 0 0 20px rgba(0,0,0,0.1); 
                }
                h1 { 
                    color: #2c3e50; 
                    border-bottom: 3px solid #3498db; 
                    padding-bottom: 10px; 
                    margin-bottom: 30px;
                }
                .summary { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-radius: 8px; 
                    margin-bottom: 30px; 
                    border-right: 5px solid #3498db;
                }
                .profile-card { 
                    border: 1px solid #ddd; 
                    padding: 25px; 
                    margin-bottom: 25px; 
                    border-radius: 8px; 
                    border-right: 5px solid #3498db;
                    background: #fff;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
                }
                .profile-header { 
                    display: flex; 
                    justify-content: space-between; 
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #eee;
                }
                .profile-name { 
                    font-size: 1.6em; 
                    color: #2c3e50; 
                    margin: 0; 
                }
                .meta { 
                    color: #7f8c8d; 
                    font-size: 0.9em; 
                }
                .section { 
                    margin-top: 20px; 
                }
                .section-title { 
                    color: #3498db; 
                    border-bottom: 1px solid #eee; 
                    padding-bottom: 8px;
                    margin-bottom: 15px;
                    font-size: 1.2em;
                }
                .detail-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 15px;
                    margin-top: 10px;
                }
                .detail-item {
                    background: #f8f9fa;
                    padding: 12px;
                    border-radius: 6px;
                    border-right: 3px solid #3498db;
                }
                .detail-item strong {
                    display: block;
                    color: #2c3e50;
                    margin-bottom: 5px;
                }
                .risk-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 0.85em;
                    font-weight: bold;
                    margin-right: 10px;
                }
                .risk-low { background: #d1f7c4; color: #2e7d32; }
                .risk-medium { background: #fff0c2; color: #f57c00; }
                .risk-high { background: #ffcdd2; color: #c62828; }
                .footer { 
                    margin-top: 40px; 
                    text-align: center; 
                    color: #95a5a6; 
                    font-size: 0.9em; 
                    border-top: 1px solid #eee; 
                    padding-top: 20px; 
                }
                @media print { 
                    body { background: white; } 
                    .container { box-shadow: none; }
                    .profile-card { break-inside: avoid; }
                }
                .links-list {
                    margin-top: 10px;
                    padding-right: 20px;
                }
                .links-list li {
                    margin-bottom: 5px;
                    word-break: break-all;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📊 تقرير الملفات الرقمية</h1>
                
                <div class="summary">
                    <p><strong>تاريخ التصدير:</strong> ${exportDate}</p>
                    <p><strong>عدد الملفات:</strong> ${profiles.length}</p>
                    <p><strong>النطاق الزمني:</strong> ${this.getDateRange(profiles)}</p>
                    <p><em>تم إنشاء هذا التقرير بواسطة Digital Profile Manager</em></p>
                </div>
        `;

        // إضافة كل ملف
        profiles.forEach((profile, index) => {
            const riskText = profile.riskLevel === 'high' ? 'مرتفع' : 
                           profile.riskLevel === 'medium' ? 'متوسط' : 'منخفض';
            const riskClass = profile.riskLevel || 'low';
            
            htmlContent += `
                <div class="profile-card">
                    <div class="profile-header">
                        <h2 class="profile-name">${index + 1}. ${profile.name || 'غير محدد'}</h2>
                        <span class="meta">ID: ${profile.id} | <span class="risk-badge risk-${riskClass}">${riskText}</span></span>
                    </div>
                    
                    <div class="detail-grid">
                        <div class="detail-item">
                            <strong>المعلومات الأساسية</strong>
                            <div>العمر: ${profile.age || 'غير محدد'}</div>
                            <div>البلد: ${profile.country || 'غير محدد'}</div>
                            <div>المدينة: ${profile.city || 'غير محدد'}</div>
                        </div>
                        
                        <div class="detail-item">
                            <strong>بيانات الاتصال</strong>
                            <div>البريد: ${profile.email || 'غير متوفر'}</div>
                            <div>الهاتف: ${profile.phone || 'غير متوفر'}</div>
                        </div>
                        
                        <div class="detail-item">
                            <strong>المعلومات التقنية</strong>
                            <div>IP: ${profile.ip || 'غير معروف'}</div>
                            <div>الجهاز: ${profile.device || 'غير معروف'}</div>
                            <div>المتصفح: ${profile.browser || 'غير معروف'}</div>
                            <div>نظام التشغيل: ${profile.os || 'غير معروف'}</div>
                        </div>
            `;

            if (profile.interests || profile.activeTime) {
                htmlContent += `
                        <div class="detail-item">
                            <strong>السلوكيات</strong>
                            ${profile.interests ? `<div>الاهتمامات: ${profile.interests}</div>` : ''}
                            ${profile.activeTime ? `<div>الوقت النشط: ${profile.activeTime}</div>` : ''}
                        </div>
                `;
            }

            htmlContent += `
                    </div>
            `;

            if (profile.links && profile.links.length > 0) {
                htmlContent += `
                    <div class="section">
                        <div class="section-title">🔗 الروابط والحسابات (${profile.links.length})</div>
                        <ul class="links-list">
                `;
                profile.links.forEach(link => {
                    htmlContent += `<li><a href="${link}" target="_blank">${link}</a></li>`;
                });
                htmlContent += `</ul></div>`;
            }

            if (profile.notes) {
                htmlContent += `
                    <div class="section">
                        <div class="section-title">📝 الملاحظات</div>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; white-space: pre-line;">
                            ${profile.notes}
                        </div>
                    </div>
                `;
            }

            htmlContent += `
                    <div style="margin-top: 20px; color: #7f8c8d; font-size: 0.9em; border-top: 1px solid #eee; padding-top: 10px;">
                        <span>تاريخ الإنشاء: ${this.formatDate(profile.createdAt)}</span> | 
                        <span>آخر تحديث: ${this.formatDate(profile.updatedAt)}</span>
                    </div>
                </div>
            `;
        });

        htmlContent += `
                <div class="footer">
                    <p>Digital Profile Manager - مشروع تعليمي</p>
                    <p><em>${new Date().getFullYear()} - تم التصدير تلقائياً</em></p>
                </div>
            </div>
        </body>
        </html>
        `;

        this.downloadFile(htmlContent, `${filename}_${Date.now()}.html`, 'text/html');
        
        return htmlContent;
    }

    /**
     * إنشاء إحصاءات مختصرة
     */
    generateStats(profiles) {
        if (!profiles || profiles.length === 0) {
            return { total: 0, message: 'لا توجد بيانات' };
        }

        const stats = {
            total: profiles.length,
            withEmail: profiles.filter(p => p.email).length,
            withPhone: profiles.filter(p => p.phone).length,
            withLocation: profiles.filter(p => p.country).length,
            withNotes: profiles.filter(p => p.notes && p.notes.trim()).length,
            averageAge: this.calculateAverage(profiles.map(p => parseInt(p.age) || 0)),
            topCountries: this.getTopItems(profiles.map(p => p.country)),
            topInterests: this.getTopItems(profiles.flatMap(p => 
                (p.interests || '').split(',').map(i => i.trim()).filter(i => i)
            )),
            riskDistribution: {
                low: profiles.filter(p => p.riskLevel === 'low').length,
                medium: profiles.filter(p => p.riskLevel === 'medium').length,
                high: profiles.filter(p => p.riskLevel === 'high').length
            }
        };

        return stats;
    }

    /**
     * أدوات مساعدة
     */
    formatDate(dateString) {
        if (!dateString) return 'غير معروف';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ar-SA');
        } catch {
            return dateString;
        }
    }

    getDateRange(profiles) {
        if (!profiles.length) return 'لا توجد بيانات';
        
        const dates = profiles
            .map(p => new Date(p.createdAt))
            .filter(d => !isNaN(d.getTime()));
        
        if (dates.length === 0) return 'لا توجد تواريخ';
        
        const oldest = new Date(Math.min(...dates));
        const newest = new Date(Math.max(...dates));
        
        return `${this.formatDate(oldest)} إلى ${this.formatDate(newest)}`;
    }

    calculateAverage(numbers) {
        const validNumbers = numbers.filter(n => n > 0);
        if (validNumbers.length === 0) return 0;
        return (validNumbers.reduce((a, b) => a + b, 0) / validNumbers.length).toFixed(1);
    }

    getTopItems(items, limit = 5) {
        const countMap = {};
        items.forEach(item => {
            if (item) countMap[item] = (countMap[item] || 0) + 1;
        });
        
        return Object.entries(countMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([item, count]) => ({ item, count }));
    }

    downloadFile(content, filename, mimeType) {
        try {
            const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            
            // تنظيف
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
            console.log(`✅ تم التصدير: ${filename}`);
            return true;
        } catch (error) {
            console.error('❌ خطأ في التصدير:', error);
            alert('حدث خطأ أثناء التصدير. يرجى المحاولة مرة أخرى.');
            return false;
        }
    }

    /**
     * واجهة بسيطة للاستخدام في الصفحات
     */
    setupExportUI(containerId = 'exportButtons') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`العنصر #${containerId} غير موجود`);
            return;
        }

        const profileId = this.getCurrentProfileId();
        const isProfilePage = !!profileId;

        container.innerHTML = `
            <div class="export-options">
                <h3 style="color: var(--text-primary); margin-bottom: 15px; font-size: 1.1em;">
                    <i class="fas fa-download"></i> خيارات التصدير
                </h3>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${isProfilePage ? `
                    <button class="export-btn csv" onclick="window.reportManagerInstance.exportProfile('${profileId}', 'csv')">
                        <i class="fas fa-file-csv"></i> تصدير CSV
                    </button>
                    <button class="export-btn json" onclick="window.reportManagerInstance.exportProfile('${profileId}', 'json')">
                        <i class="fas fa-file-code"></i> تصدير JSON
                    </button>
                    <button class="export-btn text" onclick="window.reportManagerInstance.exportProfile('${profileId}', 'text')">
                        <i class="fas fa-file-alt"></i> تصدير نص
                    </button>
                    ` : `
                    <button class="export-btn csv" onclick="window.reportManagerInstance.exportAllProfiles('csv')">
                        <i class="fas fa-file-csv"></i> تصدير جميع البيانات (CSV)
                    </button>
                    <button class="export-btn json" onclick="window.reportManagerInstance.exportAllProfiles('json')">
                        <i class="fas fa-file-code"></i> تصدير نسخة احتياطية (JSON)
                    </button>
                    <button class="export-btn html" onclick="window.reportManagerInstance.exportAllProfiles('html')">
                        <i class="fas fa-file-alt"></i> تصدير تقرير (HTML)
                    </button>
                    `}
                </div>
                ${!isProfilePage ? `
                <div style="margin-top: 15px; color: var(--text-secondary); font-size: 0.9em;">
                    <i class="fas fa-info-circle"></i> سيتم تصدير جميع الملفات المخزنة في النظام
                </div>
                ` : ''}
            </div>
        `;
        
        // حفظ النسخة للاستخدام من الأزرار
        window.reportManagerInstance = this;
    }

    getCurrentProfileId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
}

// جعل الكلاس متاحًا عالميًا
if (typeof window !== 'undefined') {
    window.ReportManager = ReportManager;
}
console.log('✅ تم تحميل ReportManager');