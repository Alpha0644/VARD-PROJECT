#!/usr/bin/env node
/**
 * COST MONITORING SYSTEM (100% Free)
 * Monitors Vercel usage and alerts before hitting limits
 */

const https = require('https');
const fs = require('fs');

const CONFIG = {
    // Your monthly budget in USD
    monthlyBudget: parseFloat(process.env.MONTHLY_BUDGET || '100'),

    // Alert thresholds
    warningThreshold: 0.7,  // 70%
    criticalThreshold: 0.9, // 90%

    // Webhook URL for alerts (Discord/Slack - free)
    webhookUrl: process.env.ALERT_WEBHOOK_URL,
};

class CostMonitor {
    constructor() {
        this.currentSpend = 0;
        this.projectedSpend = 0;
    }

    // Vercel API (free) - check current usage
    async checkVercelUsage() {
        const token = process.env.VERCEL_TOKEN;
        if (!token) {
            console.warn('⚠️ VERCEL_TOKEN not set, skipping Vercel check');
            return null;
        }

        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.vercel.com',
                path: '/v1/integrations/billing',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };

            https.get(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });
    }

    // Estimate monthly projection
    calculateProjection(currentSpend, daysElapsed) {
        const daysInMonth = 30;
        return (currentSpend / daysElapsed) * daysInMonth;
    }

    // Send alert to webhook (Discord/Slack - free)
    async sendAlert(level, message) {
        if (!CONFIG.webhookUrl) {
            console.log(`📢 ALERT (${level}): ${message}`);
            return;
        }

        const payload = JSON.stringify({
            content: `${level === 'CRITICAL' ? '🚨' : '⚠️'} **${level}**: ${message}`,
            username: 'OMEGA Cost Monitor'
        });

        return new Promise((resolve) => {
            const url = new URL(CONFIG.webhookUrl);
            const options = {
                hostname: url.hostname,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': payload.length
                }
            };

            const req = https.request(options, (res) => {
                resolve();
            });

            req.on('error', () => resolve());
            req.write(payload);
            req.end();
        });
    }

    // Main monitoring logic
    async monitor() {
        console.log('💰 Checking cloud costs...\n');

        // Check Vercel
        try {
            const usage = await this.checkVercelUsage();
            if (usage && usage.billing) {
                this.currentSpend = usage.billing.period.spend / 100; // cents to dollars
            }
        } catch (error) {
            console.error('❌ Failed to check Vercel:', error.message);
        }

        // Calculate projection
        const today = new Date().getDate();
        this.projectedSpend = this.calculateProjection(this.currentSpend, today);

        // Generate report
        const percentUsed = (this.currentSpend / CONFIG.monthlyBudget) * 100;
        const percentProjected = (this.projectedSpend / CONFIG.monthlyBudget) * 100;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('      💰 COST REPORT');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`Budget:          $${CONFIG.monthlyBudget}`);
        console.log(`Current Spend:   $${this.currentSpend.toFixed(2)} (${percentUsed.toFixed(1)}%)`);
        console.log(`Projected:       $${this.projectedSpend.toFixed(2)} (${percentProjected.toFixed(1)}%)`);
        console.log(`Remaining:       $${(CONFIG.monthlyBudget - this.currentSpend).toFixed(2)}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Check thresholds
        if (percentUsed >= CONFIG.criticalThreshold * 100) {
            await this.sendAlert('CRITICAL',
                `Cost at ${percentUsed.toFixed(1)}% of budget! Current: $${this.currentSpend}, Budget: $${CONFIG.monthlyBudget}`
            );
        } else if (percentUsed >= CONFIG.warningThreshold * 100) {
            await this.sendAlert('WARNING',
                `Cost at ${percentUsed.toFixed(1)}% of budget. Projected: $${this.projectedSpend.toFixed(2)}`
            );
        } else {
            console.log('✅ Costs are within budget');
        }

        // Save history
        this.saveHistory();
    }

    saveHistory() {
        const historyFile = '.omega/cost-history.json';
        let history = [];

        if (fs.existsSync(historyFile)) {
            history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
        }

        history.push({
            date: new Date().toISOString(),
            currentSpend: this.currentSpend,
            projectedSpend: this.projectedSpend,
            budget: CONFIG.monthlyBudget
        });

        // Keep last 90 days
        history = history.slice(-90);

        fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    }
}

// Run if called directly
if (require.main === module) {
    const monitor = new CostMonitor();
    monitor.monitor().catch(console.error);
}

module.exports = CostMonitor;
