# PhiusGuard Security Suite - Installation Guide

This suite consists of three components working together:
1.  **Desktop**: Chrome Extension (with Side Panel & Inline Warnings)
2.  **Mobile/Web**: Gmail Workspace Add-on
3.  **System**: Android Notification Agent

---

## 1. Desktop Chrome Extension

**Prerequisites:** Google Chrome or Edge.

1.  Navigate to the `extension/` folder.
2.  Double-click **`Easy-Installer.bat`**.
    *   This will automatically open the Extensions page (`chrome://extensions`) in a way that avoids error popups.
3.  Enable **Developer mode** (toggle in the top right).
4.  Click **"Load unpacked"**.
5.  Select the `extension/` folder from this project.
6.  **Success!** The PhiusGuard icon 🛡️ should appear in your toolbar.
    *   *Click it* to open the Side Panel.
    *   *Open Gmail* to see inline red banners on suspicious emails.

---

## 2. Gmail Workspace Add-on (Mobile & Web)

**Prerequisites:** Google Workspace account.

1.  Go to [Google Apps Script](https://script.google.com/) and create a **New Project**.
2.  **Code Setup**:
    *   Copy the content of `gmail-addon/Common.gs` into the script editor (`Code.gs`).
    *   Rename the file to `Common.gs` if you like.
3.  **Manifest Setup**:
    *   Click **Project Settings** (gear icon) -> Check **"Show 'appsscript.json' manifest file in editor"**.
    *   Go back to Editor, open `appsscript.json`.
    *   Replace its content with `gmail-addon/appsscript.json`.
4.  **Deploy**:
    *   Click **Deploy** -> **Test deployments**.
    *   Select **Google Workspace Add-on**.
    *   Click **Install add-on**.
5.  **Verify**:
    *   Open Gmail on your phone or desktop.
    *   Open any email.
    *   Look for the **PhiusGuard icon** in the bottom/side tool panel. Click it to see the scan result.

---

## 3. Android Notification Agent

**Prerequisites:** Android Studio.

1.  Open **Android Studio**.
2.  **Import Project**: Select the `android-app/` folder (or create a new project and copy the files).
3.  **Permissions**:
    *   Ensure `AndroidManifest.xml` includes `BIND_NOTIFICATION_LISTENER_SERVICE`.
4.  **Build & Install**:
    *   Connect your Android device (USB Debugging enabled).
    *   Run the app (Shift+F10).
5.  **Enable Access**:
    *   On your phone, go to **Settings** -> **Apps & Notifications** -> **Special App Access** -> **Notification Access**.
    *   Toggle **PhiusGuard** to ON.
6.  **Test**:
    *   Send yourself a "phishing" email (e.g., with subject "Urgent: Verify Account").
    *   Watch for the **Truecaller-style alert** in your logs or overlay (if enabled).

---

## Troubleshooting

-   **"Network Error" / Timeout**: Ensure the backend server (`http://localhost:3000`) is running (`npm run dev`).
-   **Extension Icon Missing**: Run `Easy-Installer.bat` again or check if `icon.png` is in the folder.
