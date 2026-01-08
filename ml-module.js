/**
 * وحدة التعلم الآلي المبسطة - Digital Profile Manager
 */

class SimpleMLModule {
    constructor() {
        this.profilesData = [];
        this.patterns = {};
        this.initialize();
    }

    /**
     * تهيئة النظام
     */
    initialize() {
        this.loadProfiles();
        this.extractPatterns();
    }

    /**
     * تحميل البيانات من ProfileManager
     */
    loadProfiles() {
        try {
            if (window.ProfileManager && typeof window.ProfileManager.getAllProfiles === 'function') {
                const allProfiles = window.ProfileManager.getAllProfiles();
                this.profilesData = Object.values(allProfiles);
                console.log(`✅ تم تحميل ${this.profilesData.length} ملف للتحليل`);
            } else {
                console.warn('⚠️ ProfileManager غير متوفر. سيتم العمل ببيانات افتراضية.');
                this.profilesData = this.generateSampleData();
            }
        } catch (error) {
            console.error('❌ خطأ في تحميل البيانات:', error);
            this.profilesData = this.generateSampleData();
        }
    }

    /**
     * توليد بيانات نموذجية للاختبار
     */
    generateSampleData() {
        return [
            {
                id: 'sample_1',
                name: "أحمد محمد",
                age: "25",
                country: "السعودية",
                city: "الرياض",
                email: "ahmed@example.com",
                phone: "+966501234567",
                interests: "برمجة, أمن معلومات, قراءة, رياضة",
                activeTime: "مساءً (4 م - 8 م)",
                device: "iPhone 13",
                browser: "Safari",
                os: "iOS 16",
                ip: "192.168.1.100",
                riskLevel: "low",
                createdAt: new Date().toISOString()
            },
            {
                id: 'sample_2',
                name: "سارة خالد",
                age: "30",
                country: "مصر",
                city: "القاهرة",
                email: "sara@example.com",
                phone: "+201012345678",
                interests: "تصميم, سفر, طبخ, موسيقى",
                activeTime: "صباحاً (6 ص - 12 م)",
                device: "Samsung Galaxy S22",
                browser: "Chrome",
                os: "Android 13",
                ip: "192.168.1.101",
                riskLevel: "medium",
                createdAt: new Date(Date.now() - 86400000).toISOString() // يوم مضى
            }
        ];
    }

    /**
     * استخراج الأنماط الأساسية من البيانات
     */
    extractPatterns() {
        if (this.profilesData.length === 0) {
            console.warn('⚠️ لا توجد بيانات لتحليل الأنماط');
            return;
        }

        // أنماط البلدان
        this.patterns.countries = this.analyzePattern(this.profilesData, 'country');
        
        // أنماط الأعمار
        this.patterns.ageGroups = this.analyzeAgeGroups();
        
        // أنماط الاهتمامات
        this.patterns.interests = this.analyzeInterests();
        
        // أنماط الأجهزة
        this.patterns.devices = this.analyzePattern(this.profilesData, 'device');
        
        // أنماط الأوقات النشطة
        this.patterns.activeTimes = this.analyzePattern(this.profilesData, 'activeTime');
        
        // أنماط المتصفحات
        this.patterns.browsers = this.analyzePattern(this.profilesData, 'browser');
        
        console.log('✅ تم استخراج الأنماط');
    }

    /**
     * تحليل الأنماط لعنصر معين
     */
    analyzePattern(data, field) {
        const values = data
            .map(item => item[field])
            .filter(value => value && value.toString().trim() !== '');
        
        if (values.length === 0) return [];
        
        // حساب التكرارات
        const frequency = {};
        values.forEach(value => {
            frequency[value] = (frequency[value] || 0) + 1;
        });
        
        // تحويل إلى مصفوفة مرتبة
        return Object.entries(frequency)
            .map(([value, count]) => ({
                value,
                count,
                percentage: ((count / values.length) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * تحليل الفئات العمرية
     */
    analyzeAgeGroups() {
        const ages = this.profilesData
            .map(p => parseInt(p.age))
            .filter(age => !isNaN(age) && age > 0);
        
        if (ages.length === 0) return [];
        
        const groups = {
            '18-25': { min: 18, max: 25, count: 0 },
            '26-35': { min: 26, max: 35, count: 0 },
            '36-50': { min: 36, max: 50, count: 0 },
            '51+': { min: 51, max: 200, count: 0 }
        };
        
        ages.forEach(age => {
            for (const [group, range] of Object.entries(groups)) {
                if (age >= range.min && age <= range.max) {
                    groups[group].count++;
                    break;
                }
            }
        });
        
        return Object.entries(groups)
            .filter(([_, data]) => data.count > 0)
            .map(([group, data]) => ({
                group,
                count: data.count,
                percentage: ((data.count / ages.length) * 100).toFixed(1)
            }));
    }

    /**
     * تحليل الاهتمامات
     */
    analyzeInterests() {
        const allInterests = [];
        
        this.profilesData.forEach(profile => {
            if (profile.interests) {
                const interests = profile.interests
                    .split(',')
                    .map(i => i.trim())
                    .filter(i => i.length > 0);
                
                allInterests.push(...interests);
            }
        });
        
        if (allInterests.length === 0) return [];
        
        // حساب التكرارات
        const frequency = {};
        allInterests.forEach(interest => {
            frequency[interest] = (frequency[interest] || 0) + 1;
        });
        
        // الحصول على أهم 10 اهتمامات
        return Object.entries(frequency)
            .map(([interest, count]) => ({
                interest,
                count,
                percentage: ((count / allInterests.length) * 100).toFixed(1)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }

    /**
     * التنبؤ بالقيم الناقصة
     */
    predictMissingField(profile, field) {
        if (!this.patterns[field] || this.patterns[field].length === 0) {
            return { prediction: null, confidence: 0 };
        }
        
        // أبسط خوارزمية: نأخذ القيمة الأكثر تكراراً
        const topPattern = this.patterns[field][0];
        
        return {
            prediction: topPattern.value,
            confidence: parseFloat(topPattern.percentage) / 100,
            explanation: `هذه القيمة هي الأكثر تكراراً في قاعدة البيانات (${topPattern.percentage}%)`
        };
    }

    /**
     * اكتشاف الشذوذ أو القيم غير المعتادة
     */
    detectAnomalies(profile) {
        const anomalies = [];
        
        // التحقق من العمر
        if (profile.age) {
            const age = parseInt(profile.age);
            if (!isNaN(age)) {
                if (age < 13) anomalies.push('العمر أقل من 13 سنة (غير معتاد)');
                if (age > 100) anomalies.push('العمر أكبر من 100 سنة (غير معتاد)');
            }
        }
        
        // التحقق من البريد الإلكتروني
        if (profile.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(profile.email)) {
                anomalies.push('تنسيق البريد الإلكتروني غير صالح');
            }
        }
        
        // التحقق من رقم الهاتف
        if (profile.phone) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(profile.phone.replace(/\s/g, ''))) {
                anomalies.push('تنسيق رقم الهاتف غير معتاد');
            }
        }
        
        // التحقق من عنوان IP
        if (profile.ip) {
            const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
            if (!ipRegex.test(profile.ip)) {
                anomalies.push('تنسيق عنوان IP غير صالح');
            }
        }
        
        return anomalies;
    }

    /**
     * التوصية بناءً على الأنماط
     */
    generateRecommendations(profile) {
        const recommendations = [];
        
        // التوصية بناءً على العمر
        if (profile.age) {
            const age = parseInt(profile.age);
            if (!isNaN(age)) {
                if (age >= 18 && age <= 25) {
                    recommendations.push('الفئة العمرية 18-25 هي الأكثر نشاطاً في المنصات التقنية');
                }
                if (age >= 26 && age <= 35) {
                    recommendations.push('الفئة العمرية 26-35 تميل لاستخدام أجهزة متطورة');
                }
            }
        }
        
        // التوصية بناءً على الاهتمامات
        if (profile.interests) {
            const interests = profile.interests.split(',').map(i => i.trim());
            
            if (interests.some(i => i.includes('برمجة') || i.includes('تكنولوجيا'))) {
                recommendations.push('اهتماماتك التقنية تشير إلى نشاط متوقع في ساعات المساء');
            }
            
            if (interests.some(i => i.includes('سفر') || i.includes('سياحة'))) {
                recommendations.push('مستخدمي اهتمامات السفر غالباً ما يستخدمون أجهزة محمولة');
            }
            
            if (interests.some(i => i.includes('رياضة') || i.includes('لياقة'))) {
                recommendations.push('الاهتمامات الرياضية مرتبطة بنشاط في فترات الصباح');
            }
        }
        
        // التوصية بناءً على البلد
        if (profile.country) {
            const countryPattern = this.patterns.countries?.find(p => p.value === profile.country);
            if (countryPattern) {
                recommendations.push(`بلدك (${profile.country}) يمثل ${countryPattern.percentage}% من المستخدمين`);
            }
        }
        
        // التوصية بناءً على الجهاز
        if (profile.device) {
            if (profile.device.toLowerCase().includes('iphone')) {
                recommendations.push('مستخدمي iPhone يميلون لاستخدام Safari كمتصفح رئيسي');
            }
            if (profile.device.toLowerCase().includes('samsung')) {
                recommendations.push('مستخدمي Samsung غالباً ما يستخدمون Chrome كمتصفح');
            }
        }
        
        return recommendations.length > 0 ? recommendations : [
            'لا توجد توصيات كافية بناءً على البيانات المتاحة',
            'أضف المزيد من المعلومات للحصول على تحليل أفضل'
        ];
    }

    /**
     * تحليل شامل للملف
     */
    analyzeProfile(profileId) {
        let profile;
        
        if (typeof profileId === 'object') {
            profile = profileId;
        } else {
            profile = window.ProfileManager?.getProfile(profileId);
        }
        
        if (!profile) {
            return { 
                error: 'الملف غير موجود',
                basicInfo: { name: 'غير معروف', completeness: { percentage: 0 } }
            };
        }
        
        const analysis = {
            basicInfo: {
                name: profile.name,
                completeness: this.calculateCompleteness(profile)
            },
            patterns: {
                countryMatch: this.checkPatternMatch(profile.country, this.patterns.countries),
                deviceMatch: this.checkPatternMatch(profile.device, this.patterns.devices),
                timeMatch: this.checkPatternMatch(profile.activeTime, this.patterns.activeTimes),
                browserMatch: this.checkPatternMatch(profile.browser, this.patterns.browsers)
            },
            predictions: {
                missingFields: this.predictMissingFields(profile),
                likelyInterests: this.predictInterests(profile)
            },
            anomalies: this.detectAnomalies(profile),
            recommendations: this.generateRecommendations(profile),
            riskScore: this.calculateRiskScore(profile),
            profileAge: this.calculateProfileAge(profile)
        };
        
        return analysis;
    }

    /**
     * حساب درجة اكتمال الملف
     */
    calculateCompleteness(profile) {
        const fields = [
            'name', 'age', 'country', 'email', 'phone', 
            'interests', 'activeTime', 'device', 'browser', 'os', 'ip'
        ];
        const filledFields = fields.filter(field => 
            profile[field] && profile[field].toString().trim() !== ''
        ).length;
        
        const percentage = Math.round((filledFields / fields.length) * 100);
        
        let level = 'منخفض';
        if (percentage >= 80) level = 'ممتاز';
        else if (percentage >= 60) level = 'جيد';
        else if (percentage >= 40) level = 'متوسط';
        else if (percentage >= 20) level = 'ضعيف';
        
        return {
            percentage: percentage,
            level: level,
            filled: filledFields,
            total: fields.length
        };
    }

    /**
     * التحقق من تطابق القيمة مع الأنماط
     */
    checkPatternMatch(value, patterns) {
        if (!value || !patterns || patterns.length === 0) {
            return { match: false, confidence: 0 };
        }
        
        const pattern = patterns.find(p => p.value === value);
        if (!pattern) {
            return { match: false, confidence: 0 };
        }
        
        const confidence = parseFloat(pattern.percentage) / 100;
        
        return {
            match: true,
            confidence: confidence,
            rank: patterns.findIndex(p => p.value === value) + 1,
            percentage: pattern.percentage,
            explanation: `هذه القيمة تحتل المرتبة ${patterns.findIndex(p => p.value === value) + 1} من حيث الانتشار`
        };
    }

    /**
     * التنبؤ بالحقول الناقصة
     */
    predictMissingFields(profile) {
        const predictions = [];
        const fields = ['activeTime', 'device', 'browser', 'interests', 'country'];
        
        fields.forEach(field => {
            if (!profile[field] || profile[field].toString().trim() === '') {
                const prediction = this.predictMissingField(profile, field);
                if (prediction.prediction) {
                    predictions.push({
                        field: field,
                        fieldName: this.getFieldArabicName(field),
                        prediction: prediction.prediction,
                        confidence: prediction.confidence,
                        explanation: prediction.explanation
                    });
                }
            }
        });
        
        return predictions;
    }

    /**
     * التنبؤ بالاهتمامات
     */
    predictInterests(profile) {
        if (profile.interests && profile.interests.trim() !== '') {
            return []; // لا حاجة للتنبؤ إذا كانت موجودة
        }
        
        // خوارزمية بسيطة للتنبؤ بناءً على البلد والعمر
        const predictions = [];
        
        if (profile.country === 'السعودية') {
            predictions.push({ interest: 'التقنية', confidence: 0.7 });
            predictions.push({ interest: 'الرياضة', confidence: 0.6 });
            predictions.push({ interest: 'السفر', confidence: 0.5 });
        } else if (profile.country === 'مصر') {
            predictions.push({ interest: 'القراءة', confidence: 0.6 });
            predictions.push({ interest: 'السينما', confidence: 0.5 });
            predictions.push({ interest: 'الموسيقى', confidence: 0.5 });
        }
        
        if (profile.age) {
            const age = parseInt(profile.age);
            if (!isNaN(age)) {
                if (age >= 18 && age <= 25) {
                    predictions.push({ interest: 'التواصل الاجتماعي', confidence: 0.8 });
                    predictions.push({ interest: 'الألعاب', confidence: 0.6 });
                } else if (age >= 26 && age <= 35) {
                    predictions.push({ interest: 'التطوير المهني', confidence: 0.7 });
                    predictions.push({ interest: 'الاستثمار', confidence: 0.5 });
                } else if (age >= 36) {
                    predictions.push({ interest: 'الصحة', confidence: 0.6 });
                    predictions.push({ interest: 'القراءة', confidence: 0.7 });
                }
            }
        }
        
        // إزالة التكرارات وترتيب حسب الثقة
        const uniquePredictions = [];
        predictions.forEach(pred => {
            if (!uniquePredictions.some(p => p.interest === pred.interest)) {
                uniquePredictions.push(pred);
            }
        });
        
        return uniquePredictions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 3); // أعلى 3 تنبؤات
    }

    /**
     * حساب درجة المخاطرة (تعليمي)
     */
    calculateRiskScore(profile) {
        let score = 50; // درجة أساسية
        
        // عوامل تزيد المخاطرة
        if (!profile.email && !profile.phone) score += 20;
        if (profile.interests?.includes('اختراق') || profile.interests?.toLowerCase().includes('hack')) score += 15;
        if (this.detectAnomalies(profile).length > 0) score += 10;
        if (!profile.country) score += 5;
        if (!profile.age) score += 5;
        
        // عوامل تقلل المخاطرة
        if (profile.name && profile.name.split(' ').length >= 2) score -= 5;
        if (profile.country) score -= 5;
        if (profile.age && parseInt(profile.age) > 18) score -= 5;
        if (profile.email && profile.email.includes('@')) score -= 10;
        if (profile.phone && profile.phone.length >= 10) score -= 10;
        
        // تحديد الفئة
        let category = 'medium';
        let description = 'مخاطر متوسطة';
        
        if (score >= 70) {
            category = 'high';
            description = 'مخاطر مرتفعة - يحتاج مراجعة';
        } else if (score <= 30) {
            category = 'low';
            description = 'مخاطر منخفضة';
        }
        
        return {
            score: Math.min(Math.max(score, 0), 100),
            category: category,
            description: description,
            factors: this.getRiskFactors(profile, score)
        };
    }

    getRiskFactors(profile, score) {
        const factors = [];
        
        if (!profile.email) factors.push('لا يوجد بريد إلكتروني');
        if (!profile.phone) factors.push('لا يوجد رقم هاتف');
        if (!profile.country) factors.push('لا يوجد بلد محدد');
        if (!profile.age) factors.push('لا يوجد عمر محدد');
        
        const anomalies = this.detectAnomalies(profile);
        factors.push(...anomalies);
        
        if (score > 70) {
            factors.push('عدد كبير من العوامل المفقودة أو غير الصالحة');
        }
        
        return factors.length > 0 ? factors : ['لا توجد عوامل مخاطرة واضحة'];
    }

    /**
     * حساب عمر الملف (كم مضى على إنشائه)
     */
    calculateProfileAge(profile) {
        if (!profile.createdAt) return 'غير معروف';
        
        const createdDate = new Date(profile.createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'تم إنشاؤه اليوم';
        if (diffDays === 1) return 'تم إنشاؤه أمس';
        if (diffDays < 7) return `منذ ${diffDays} أيام`;
        if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
        if (diffDays < 365) return `منذ ${Math.floor(diffDays / 30)} أشهر`;
        return `منذ ${Math.floor(diffDays / 365)} سنوات`;
    }

    /**
     * الحصول على الاسم العربي للحقل
     */
    getFieldArabicName(field) {
        const names = {
            'activeTime': 'الوقت النشط',
            'device': 'نوع الجهاز',
            'browser': 'المتصفح',
            'interests': 'الاهتمامات',
            'country': 'الدولة',
            'age': 'العمر',
            'email': 'البريد الإلكتروني',
            'phone': 'رقم الهاتف',
            'ip': 'عنوان IP',
            'os': 'نظام التشغيل'
        };
        return names[field] || field;
    }

    /**
     * واجهة بسيطة للاستخدام
     */
    renderAnalysisUI(profileId, containerId = 'mlAnalysisContainer') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`❌ العنصر #${containerId} غير موجود`);
            return;
        }
        
        const analysis = this.analyzeProfile(profileId);
        
        if (analysis.error) {
            container.innerHTML = `
                <div class="ml-analysis-card">
                    <h3><i class="fas fa-exclamation-triangle"></i> خطأ في التحليل</h3>
                    <p>${analysis.error}</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="ml-analysis-card">
                <h3><i class="fas fa-brain"></i> التحليل الذكي</h3>
                
                <!-- درجة اكتمال الملف -->
                <div class="analysis-section">
                    <h4><i class="fas fa-chart-line"></i> درجة اكتمال الملف</h4>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${analysis.basicInfo.completeness.percentage}%"></div>
                    </div>
                    <p>${analysis.basicInfo.completeness.percentage}% - مستوى ${analysis.basicInfo.completeness.level}</p>
                    <p><small>(${analysis.basicInfo.completeness.filled} من ${analysis.basicInfo.completeness.total} حقل مملوء)</small></p>
                </div>
                
                <!-- تقييم المخاطرة -->
                <div class="analysis-section">
                    <h4><i class="fas fa-shield-alt"></i> تقييم المخاطرة</h4>
                    <div class="risk-indicator risk-${analysis.riskScore.category}">
                        ${analysis.riskScore.category === 'high' ? '🟥' : 
                          analysis.riskScore.category === 'medium' ? '🟨' : '🟩'}
                        ${analysis.riskScore.score}/100 - ${analysis.riskScore.description}
                    </div>
                    ${analysis.riskScore.factors.length > 0 ? `
                        <div class="risk-factors">
                            <h5>عوامل المخاطرة:</h5>
                            <ul>
                                ${analysis.riskScore.factors.map(factor => `<li>${factor}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
                
                <!-- الأنماط المطابقة -->
                <div class="analysis-section">
                    <h4><i class="fas fa-chart-bar"></i> الأنماط المطابقة</h4>
                    <div class="patterns-grid">
                        ${analysis.patterns.countryMatch.match ? `
                            <div class="pattern-item">
                                <strong>الدولة:</strong> 
                                <span class="pattern-match">✓ مطابقة</span>
                                <small>(${analysis.patterns.countryMatch.percentage}% انتشار)</small>
                            </div>
                        ` : ''}
                        ${analysis.patterns.deviceMatch.match ? `
                            <div class="pattern-item">
                                <strong>الجهاز:</strong> 
                                <span class="pattern-match">✓ مطابقة</span>
                                <small>(${analysis.patterns.deviceMatch.percentage}% انتشار)</small>
                            </div>
                        ` : ''}
                        ${analysis.patterns.timeMatch.match ? `
                            <div class="pattern-item">
                                <strong>الوقت النشط:</strong> 
                                <span class="pattern-match">✓ مطابقة</span>
                                <small>(${analysis.patterns.timeMatch.percentage}% انتشار)</small>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- التوصيات -->
                ${analysis.recommendations.length > 0 ? `
                    <div class="analysis-section">
                        <h4><i class="fas fa-lightbulb"></i> التوصيات</h4>
                        <ul class="recommendations">
                            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <!-- التنبؤات للحقول الناقصة -->
                ${analysis.predictions.missingFields.length > 0 ? `
                    <div class="analysis-section">
                        <h4><i class="fas fa-crystal-ball"></i> تنبؤات للحقول الناقصة</h4>
                        <div class="predictions">
                            ${analysis.predictions.missingFields.map(pred => `
                                <div class="prediction">
                                    <strong>${pred.fieldName}:</strong> 
                                    ${pred.prediction}
                                    <div class="confidence-bar">
                                        <div class="confidence-fill" style="width: ${pred.confidence * 100}%"></div>
                                    </div>
                                    <small>ثقة: ${(pred.confidence * 100).toFixed(0)}%</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <!-- المعلومات الإضافية -->
                <div class="analysis-section">
                    <h4><i class="fas fa-info-circle"></i> معلومات إضافية</h4>
                    <div class="additional-info">
                        <p><strong>عمر الملف:</strong> ${analysis.profileAge}</p>
                        ${analysis.anomalies.length > 0 ? `
                            <p><strong>ملاحظات:</strong> تم اكتشاف ${analysis.anomalies.length} شذوذ</p>
                        ` : ''}
                    </div>
                </div>
                
                <!-- تذييل التحليل -->
                <div class="analysis-footer">
                    <small>
                        <i class="fas fa-info-circle"></i> 
                        هذا تحليل تعليمي مبني على أنماط البيانات الموجودة في النظام.
                        ${this.profilesData.length} ملف تم تحليله.
                    </small>
                </div>
            </div>
        `;
        
        // إضافة الأنماط إذا لم تكن موجودة
        this.addStyles();
    }

    /**
     * تحديث الأنماط عند إضافة بيانات جديدة
     */
    updatePatterns(newProfile) {
        this.profilesData.push(newProfile);
        this.extractPatterns();
        console.log('✅ تم تحديث الأنماط ببيانات جديدة');
    }

    /**
     * إضافة الأنماط المطلوبة
     */
    addStyles() {
        if (document.getElementById('ml-styles')) return;
        
        const styles = `
            .ml-analysis-card {
                background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
                border-radius: 12px;
                padding: 25px;
                border: 1px solid #334155;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
            }
            
            .ml-analysis-card h3 {
                color: #818cf8;
                margin-bottom: 25px;
                font-size: 1.4em;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .analysis-section {
                margin-bottom: 25px;
                padding-bottom: 20px;
                border-bottom: 1px solid #334155;
            }
            
            .analysis-section:last-child {
                border-bottom: none;
            }
            
            .analysis-section h4 {
                color: #c7d2fe;
                font-size: 1.1em;
                margin-bottom: 12px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .progress-bar {
                height: 10px;
                background: #1e293b;
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 8px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #10b981, #3b82f6);
                transition: width 0.5s ease;
                border-radius: 5px;
            }
            
            .risk-indicator {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                padding: 8px 20px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 1.1em;
                margin-bottom: 10px;
            }
            
            .risk-high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
            .risk-medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
            .risk-low { background: rgba(16, 185, 129, 0.2); color: #10b981; }
            
            .risk-factors, .recommendations {
                list-style: none;
                padding: 0;
                margin-top: 10px;
            }
            
            .risk-factors li, .recommendations li {
                padding: 8px 0;
                padding-right: 25px;
                position: relative;
                color: #cbd5e1;
            }
            
            .risk-factors li:before {
                content: '⚠️';
                position: absolute;
                right: 0;
            }
            
            .recommendations li:before {
                content: '💡';
                position: absolute;
                right: 0;
            }
            
            .patterns-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
                margin-top: 10px;
            }
            
            .pattern-item {
                background: rgba(255, 255, 255, 0.05);
                padding: 10px;
                border-radius: 6px;
                border-right: 3px solid #3b82f6;
            }
            
            .pattern-match {
                color: #10b981;
                font-weight: bold;
            }
            
            .predictions {
                margin-top: 10px;
            }
            
            .prediction {
                background: rgba(59, 130, 246, 0.1);
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 10px;
                border-right: 3px solid #3b82f6;
                color: #c7d2fe;
            }
            
            .confidence-bar {
                height: 5px;
                background: #1e293b;
                border-radius: 3px;
                margin: 5px 0;
                overflow: hidden;
            }
            
            .confidence-fill {
                height: 100%;
                background: linear-gradient(90deg, #f59e0b, #fbbf24);
                border-radius: 3px;
            }
            
            .additional-info {
                background: rgba(255, 255, 255, 0.05);
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #334155;
            }
            
            .analysis-footer {
                margin-top: 20px;
                padding-top: 15px;
                border-top: 1px solid #334155;
                color: #94a3b8;
                font-size: 0.9em;
                text-align: center;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.id = 'ml-styles';
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }
}

// جعل الكلاس متاحاً عالمياً
if (typeof window !== 'undefined') {
    window.SimpleMLModule = SimpleMLModule;
}

console.log('✅ تم تحميل SimpleMLModule');