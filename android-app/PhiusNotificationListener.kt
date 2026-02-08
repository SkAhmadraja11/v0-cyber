package com.phiusguard.agent

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import android.content.Intent
import android.os.Bundle

/**
 * PhiusGuard Android Security Agent
 * Principal Security Architect & Mobile Platform Engineer
 * 
 * This service monitors incoming notifications (Truecaller-style)
 * to detect phishing attempts in real-time.
 */
class PhiusNotificationListener : NotificationListenerService() {

    private val TAG = "PhiusGuard"
    private val GMAIL_PACKAGE = "com.google.android.gm"

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        if (sbn.packageName != GMAIL_PACKAGE) return

        val extras: Bundle = sbn.notification.extras
        val title = extras.getString("android.title") // Usually the sender
        val text = extras.getCharSequence("android.text") // Usually the snippet
        
        Log.d(TAG, "Intercepted Gmail Notification: From=$title, Text=$text")

        // 1. Analyze internally or send to PhiusGuard API
        analyzeNotificationContent(title, text.toString())
    }

    private fun analyzeNotificationContent(sender: String?, snippet: String) {
        // Mock logic for detection - in production calls backend API
        // This is where we would implement the real-time scoring logic
        if (snippet != null && (snippet.contains("urgent", ignoreCase = true) || snippet.contains("verify", ignoreCase = true))) {
            triggerPhiusAlert("HIGH RISK: Potential Phishing detected from $sender")
        }
    }

    private fun triggerPhiusAlert(message: String) {
        // Implementation of Truecaller-style Overlay or High-Priority Notification
        Log.e(TAG, "ALERT: $message")
        
        // This would start a 'System Overlay' or 'Full Screen Intent' on real devices
        // val intent = Intent(this, PhiusAlertActivity::class.java).apply {
        //    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        //    putExtra("alert_message", message)
        // }
        // startActivity(intent)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        Log.d(TAG, "Notification Removed")
    }
}
