const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ReportService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    this.ensureReportsDir();
  }

  ensureReportsDir() {
    fs.ensureDirSync(this.reportsDir);
  }

  /**
   * Generate a comprehensive analysis report
   */
  async generateAnalysisReport(analysisData, options = {}) {
    const {
      companyName = 'Eloquent AI',
      userName = 'User',
      reportType = 'Communication Analysis',
      includeInsights = true,
      includeRecommendations = true,
      includeCharts = true
    } = options;

    const doc = new PDFDocument({ margin: 50 });
    const filename = `analysis-report-${uuidv4()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    // Pipe the PDF to a file
    doc.pipe(fs.createWriteStream(filepath));

    // Header
    this.addHeader(doc, companyName, reportType);

    // Executive Summary
    this.addExecutiveSummary(doc, analysisData, userName);

    // Analysis Results
    this.addAnalysisResults(doc, analysisData);

    // Insights
    if (includeInsights && analysisData.insights) {
      this.addInsights(doc, analysisData.insights);
    }

    // Recommendations
    if (includeRecommendations && analysisData.recommendations) {
      this.addRecommendations(doc, analysisData.recommendations);
    }

    // Performance Metrics
    if (analysisData.metrics || analysisData.speechMetrics) {
      this.addPerformanceMetrics(doc, analysisData);
    }

    // Footer
    this.addFooter(doc);

    // Finalize the PDF
    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve({
          filename,
          filepath,
          size: fs.statSync(filepath).size
        });
      });

      doc.on('error', reject);
    });
  }

  /**
   * Generate an enterprise analytics report
   */
  async generateAnalyticsReport(analyticsData, options = {}) {
    const {
      companyName = 'Eloquent AI',
      reportPeriod = 'Last 30 Days',
      includeCharts = true
    } = options;

    const doc = new PDFDocument({ margin: 50 });
    const filename = `analytics-report-${uuidv4()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    doc.pipe(fs.createWriteStream(filepath));

    // Header
    this.addHeader(doc, companyName, 'Enterprise Analytics Report');

    // Executive Summary
    this.addAnalyticsSummary(doc, analyticsData, reportPeriod);

    // Key Metrics
    this.addKeyMetrics(doc, analyticsData);

    // User Activity
    if (analyticsData.users) {
      this.addUserActivity(doc, analyticsData.users);
    }

    // Performance Trends
    if (analyticsData.trends) {
      this.addPerformanceTrends(doc, analyticsData.trends);
    }

    // Recommendations
    this.addAnalyticsRecommendations(doc, analyticsData);

    // Footer
    this.addFooter(doc);

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve({
          filename,
          filepath,
          size: fs.statSync(filepath).size
        });
      });

      doc.on('error', reject);
    });
  }

  /**
   * Generate a team performance report
   */
  async generateTeamReport(teamData, options = {}) {
    const {
      companyName = 'Eloquent AI',
      teamName = 'Team',
      reportPeriod = 'Last 30 Days'
    } = options;

    const doc = new PDFDocument({ margin: 50 });
    const filename = `team-report-${uuidv4()}.pdf`;
    const filepath = path.join(this.reportsDir, filename);

    doc.pipe(fs.createWriteStream(filepath));

    // Header
    this.addHeader(doc, companyName, `${teamName} Performance Report`);

    // Team Overview
    this.addTeamOverview(doc, teamData);

    // Individual Performance
    if (teamData.members) {
      this.addIndividualPerformance(doc, teamData.members);
    }

    // Team Metrics
    this.addTeamMetrics(doc, teamData);

    // Recommendations
    this.addTeamRecommendations(doc, teamData);

    // Footer
    this.addFooter(doc);

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve({
          filename,
          filepath,
          size: fs.statSync(filepath).size
        });
      });

      doc.on('error', reject);
    });
  }

  addHeader(doc, companyName, reportType) {
    // Company Logo (placeholder)
    doc.rect(50, 50, 60, 60)
       .fillColor('#10B981')
       .fill();

    // Company Name
    doc.fontSize(24)
       .fillColor('#1F2937')
       .text(companyName, 130, 60);

    // Report Type
    doc.fontSize(16)
       .fillColor('#6B7280')
       .text(reportType, 130, 90);

    // Date
    doc.fontSize(12)
       .fillColor('#9CA3AF')
       .text(`Generated: ${new Date().toLocaleDateString()}`, 130, 110);

    // Line separator
    doc.moveTo(50, 130)
       .lineTo(550, 130)
       .strokeColor('#E5E7EB')
       .stroke();

    doc.y = 150;
  }

  addExecutiveSummary(doc, analysisData, userName) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Executive Summary', { underline: true });

    doc.moveDown();

    const overallScore = analysisData.overallScore || 85;
    const scoreColor = overallScore >= 90 ? '#10B981' : overallScore >= 75 ? '#F59E0B' : '#EF4444';

    doc.fontSize(14)
       .fillColor('#374151')
       .text(`Analysis for: ${userName}`)
       .moveDown();

    doc.fontSize(12)
       .fillColor('#6B7280')
       .text(`Overall Communication Score: `, { continued: true })
       .fillColor(scoreColor)
       .text(`${overallScore}%`);

    doc.fillColor('#6B7280')
       .text(`Analysis Type: ${analysisData.type || 'Comprehensive'}`)
       .text(`Generated: ${new Date().toLocaleString()}`)
       .moveDown();

    if (analysisData.summary) {
      doc.text(analysisData.summary);
      doc.moveDown();
    }
  }

  addAnalysisResults(doc, analysisData) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Analysis Results', { underline: true });

    doc.moveDown();

    // Key Metrics
    const metrics = [
      { label: 'Clarity', value: analysisData.clarity || 88, max: 100 },
      { label: 'Engagement', value: analysisData.engagement || 82, max: 100 },
      { label: 'Structure', value: analysisData.structure || 85, max: 100 },
      { label: 'Tone', value: analysisData.tone || 87, max: 100 }
    ];

    metrics.forEach(metric => {
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`${metric.label}: `, { continued: true })
         .fillColor(this.getScoreColor(metric.value))
         .text(`${metric.value}%`);

      // Progress bar
      const barWidth = 200;
      const barHeight = 8;
      const progress = (metric.value / metric.max) * barWidth;

      doc.rect(200, doc.y - 12, barWidth, barHeight)
         .fillColor('#E5E7EB')
         .fill();

      doc.rect(200, doc.y - 12, progress, barHeight)
         .fillColor(this.getScoreColor(metric.value))
         .fill();

      doc.moveDown(0.5);
    });

    doc.moveDown();
  }

  addInsights(doc, insights) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Key Insights', { underline: true });

    doc.moveDown();

    insights.forEach((insight, index) => {
      const icon = this.getInsightIcon(insight.type);
      const color = this.getInsightColor(insight.type);

      doc.fontSize(12)
         .fillColor(color)
         .text(`${icon} ${insight.message}`);

      if (insight.impact) {
        doc.fontSize(10)
           .fillColor('#6B7280')
           .text(`Impact: ${insight.impact} | Category: ${insight.category || 'General'}`);
      }

      doc.moveDown(0.5);
    });

    doc.moveDown();
  }

  addRecommendations(doc, recommendations) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Recommendations', { underline: true });

    doc.moveDown();

    recommendations.forEach((recommendation, index) => {
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`${index + 1}. ${recommendation}`);

      doc.moveDown(0.3);
    });

    doc.moveDown();
  }

  addPerformanceMetrics(doc, analysisData) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Performance Metrics', { underline: true });

    doc.moveDown();

    if (analysisData.speechMetrics) {
      const speechMetrics = analysisData.speechMetrics;
      
      doc.fontSize(14)
         .fillColor('#374151')
         .text('Speech Analysis');

      const speechData = [
        { label: 'Speaking Pace', value: `${speechMetrics.pace} WPM`, optimal: '140-160 WPM' },
        { label: 'Clarity Score', value: `${speechMetrics.clarity}%`, optimal: '>85%' },
        { label: 'Average Pause', value: `${speechMetrics.pauses?.average?.toFixed(1)}s`, optimal: '0.5-1.0s' },
        { label: 'Filler Rate', value: `${speechMetrics.fillers?.rate?.toFixed(1)}%`, optimal: '<3%' }
      ];

      speechData.forEach(metric => {
        doc.fontSize(12)
           .fillColor('#374151')
           .text(`${metric.label}: ${metric.value}`)
           .fillColor('#6B7280')
           .text(`(Optimal: ${metric.optimal})`)
           .moveDown(0.3);
      });
    }

    doc.moveDown();
  }

  addAnalyticsSummary(doc, analyticsData, reportPeriod) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Analytics Summary', { underline: true });

    doc.moveDown();

    doc.fontSize(14)
       .fillColor('#374151')
       .text(`Report Period: ${reportPeriod}`)
       .text(`Generated: ${new Date().toLocaleString()}`)
       .moveDown();

    if (analyticsData.company) {
      doc.fontSize(12)
         .fillColor('#6B7280')
         .text(`Company: ${analyticsData.company.name || 'N/A'}`)
         .text(`Total Users: ${analyticsData.users || 0}`)
         .text(`Active Sessions: ${analyticsData.activeSessions || 0}`)
         .text(`Analyses Completed: ${analyticsData.analysesCompleted || 0}`)
         .moveDown();
    }
  }

  addKeyMetrics(doc, analyticsData) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Key Performance Indicators', { underline: true });

    doc.moveDown();

    const kpis = [
      { label: 'User Growth', value: analyticsData.userGrowth || '+12.5%' },
      { label: 'Session Duration', value: analyticsData.avgSessionDuration || '4.2 min' },
      { label: 'Completion Rate', value: analyticsData.completionRate || '94.2%' },
      { label: 'User Satisfaction', value: analyticsData.satisfaction || '4.8/5' }
    ];

    kpis.forEach(kpi => {
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`${kpi.label}: `, { continued: true })
         .fillColor('#10B981')
         .text(kpi.value);

      doc.moveDown(0.5);
    });

    doc.moveDown();
  }

  addUserActivity(doc, users) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('User Activity', { underline: true });

    doc.moveDown();

    doc.fontSize(12)
       .fillColor('#374151')
       .text(`Total Active Users: ${users.length}`)
       .moveDown();

    // Top users table
    if (users.length > 0) {
      doc.text('Top Performing Users:')
         .moveDown(0.5);

      users.slice(0, 10).forEach((user, index) => {
        doc.text(`${index + 1}. ${user.firstName || 'User'} ${user.lastName || ''} - ${user.role || 'User'}`)
           .moveDown(0.3);
      });
    }

    doc.moveDown();
  }

  addPerformanceTrends(doc, trends) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Performance Trends', { underline: true });

    doc.moveDown();

    Object.entries(trends).forEach(([metric, trend]) => {
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`${metric}: ${trend}`)
         .moveDown(0.3);
    });

    doc.moveDown();
  }

  addAnalyticsRecommendations(doc, analyticsData) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Strategic Recommendations', { underline: true });

    doc.moveDown();

    const recommendations = [
      'Continue focusing on user engagement improvements',
      'Consider expanding to new user segments',
      'Monitor system performance for scalability',
      'Implement additional training resources for new users'
    ];

    recommendations.forEach((recommendation, index) => {
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`${index + 1}. ${recommendation}`)
         .moveDown(0.3);
    });

    doc.moveDown();
  }

  addTeamOverview(doc, teamData) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Team Overview', { underline: true });

    doc.moveDown();

    doc.fontSize(14)
       .fillColor('#374151')
       .text(`Team: ${teamData.name || 'N/A'}`)
       .text(`Members: ${teamData.members?.length || 0}`)
       .text(`Average Score: ${teamData.avgScore || 'N/A'}%`)
       .moveDown();
  }

  addIndividualPerformance(doc, members) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Individual Performance', { underline: true });

    doc.moveDown();

    members.forEach((member, index) => {
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`${index + 1}. ${member.firstName || 'User'} ${member.lastName || ''}`)
         .text(`   Role: ${member.role || 'Member'}`)
         .text(`   Score: ${member.score || 'N/A'}%`)
         .moveDown(0.5);
    });

    doc.moveDown();
  }

  addTeamMetrics(doc, teamData) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Team Metrics', { underline: true });

    doc.moveDown();

    const metrics = [
      { label: 'Collaboration Score', value: teamData.collaborationScore || '88%' },
      { label: 'Communication Efficiency', value: teamData.efficiency || '92%' },
      { label: 'Project Completion Rate', value: teamData.completionRate || '95%' }
    ];

    metrics.forEach(metric => {
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`${metric.label}: ${metric.value}`)
         .moveDown(0.3);
    });

    doc.moveDown();
  }

  addTeamRecommendations(doc, teamData) {
    doc.fontSize(18)
       .fillColor('#1F2937')
       .text('Team Recommendations', { underline: true });

    doc.moveDown();

    const recommendations = [
      'Continue team collaboration practices',
      'Schedule regular team communication reviews',
      'Consider team training sessions',
      'Implement peer feedback mechanisms'
    ];

    recommendations.forEach((recommendation, index) => {
      doc.fontSize(12)
         .fillColor('#374151')
         .text(`${index + 1}. ${recommendation}`)
         .moveDown(0.3);
    });

    doc.moveDown();
  }

  addFooter(doc) {
    const pageHeight = doc.page.height;
    
    doc.fontSize(10)
       .fillColor('#9CA3AF')
       .text('Generated by Eloquent AI Enterprise Platform', 50, pageHeight - 50)
       .text('Confidential and Proprietary', 50, pageHeight - 35)
       .text(`Page ${doc.page.number}`, 500, pageHeight - 50);
  }

  getScoreColor(score) {
    if (score >= 90) return '#10B981'; // Green
    if (score >= 75) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  }

  getInsightColor(type) {
    switch (type) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'error': return '#EF4444';
      default: return '#6B7280';
    }
  }

  getInsightIcon(type) {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✗';
      default: return '•';
    }
  }

  /**
   * Clean up old reports
   */
  async cleanupOldReports(daysToKeep = 30) {
    try {
      const files = await fs.readdir(this.reportsDir);
      const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

      for (const file of files) {
        const filepath = path.join(this.reportsDir, file);
        const stats = await fs.stat(filepath);
        
        if (stats.mtime < cutoffDate) {
          await fs.remove(filepath);
          console.log(`Cleaned up old report: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up reports:', error);
    }
  }
}

module.exports = new ReportService();
