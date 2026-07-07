import os
import re

file_path = r'E:\BOXWAY\boxway-app\src\pages\SettingsPage.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
imports = """import React, { useState, useEffect } from 'react';
import Icon from "../components/ui/Icon.jsx";
import { useSettingsStore, useTranslation } from '../store/settingsStore.js';

// Mock API
const api = {
  saveSettings: async (settings) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.95) reject(new Error('Network error'));
        resolve({ success: true });
      }, 1000);
    });
  }
};
"""

content = re.sub(r'import React.*?from \'react\';\nimport Icon.*?\n', imports, content, flags=re.DOTALL)

# Update component body to use translation and store
body_start = r'const SettingsPage = \(\) => \{'
body_inject = """const SettingsPage = () => {
  const { t, language } = useTranslation();
  const settings = useSettingsStore();
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // We need local state for form before saving
  const [appearance, setAppearance] = useState({
    theme: settings.theme,
    language: settings.language,
    dateFormat: settings.dateFormat,
    currency: settings.currency
  });
  
  useEffect(() => {
    // When store changes (e.g. initial load from API), update local state
    setAppearance({
      theme: settings.theme,
      language: settings.language,
      dateFormat: settings.dateFormat,
      currency: settings.currency
    });
  }, [settings.theme, settings.language, settings.dateFormat, settings.currency]);
"""

content = re.sub(body_start, body_inject, content)

# Update handleAppearanceChange to instant preview
appearance_change = r'const handleAppearanceChange = \(field, value\) => \{\n    setAppearance\(\{ \.\.\.appearance, \[field\]: value \}\);\n  \};'
new_app_change = """const handleAppearanceChange = (field, value) => {
    const newApp = { ...appearance, [field]: value };
    setAppearance(newApp);
    // Instant preview
    settings.setPreviewSettings(newApp);
  };"""

content = re.sub(appearance_change, new_app_change, content)

# Update handleAppearanceSave
appearance_save = r'const handleAppearanceSave = \(\) => \{.*?\n    showToastMsg\(\'Appearance settings saved\'\);\n  \};'
new_app_save = """const handleAppearanceSave = async () => {
    setIsSaving(true);
    setApiError(null);
    try {
      await api.saveSettings(appearance);
      settings.saveSettings(appearance);
      showToastMsg(t('Settings updated successfully.'));
    } catch (e) {
      setApiError('Failed to save settings. Please try again.');
      showToastMsg('Error: Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };"""

content = re.sub(appearance_save, new_app_save, content, flags=re.DOTALL)

# Remove the old appearance state definition to avoid duplicates
content = re.sub(r'const \[toast, setToast\] = useState\(\'\'\);\n  const \[appearance, setAppearance\] = useState\(\(\) => \{.*?\n  \}\);\n', "const [toast, setToast] = useState('');\n", content, flags=re.DOTALL)


# Find and replace Save Changes buttons
content = content.replace(
    "{saved ? <><Icon name=\"check\" className=\"text-lg\" /> Saved!</> : 'Save Changes'}",
    "{isSaving ? <><Icon name=\"refresh\" className=\"text-lg animate-spin\" /> Saving...</> : t('Save Changes')}"
)

content = content.replace(
    '<ButtonPrimary onClick={handleAppearanceSave}>',
    '<ButtonPrimary onClick={handleAppearanceSave} disabled={isSaving} className={isSaving ? "opacity-50 cursor-not-allowed" : ""}>'
)
content = content.replace(
    '<ButtonPrimary onClick={handleCompanySave}>',
    '<ButtonPrimary onClick={handleCompanySave} disabled={isSaving} className={isSaving ? "opacity-50 cursor-not-allowed" : ""}>'
)

# Replace titles with translation
content = content.replace(">Settings<", ">{t('Settings')}<")
content = content.replace(">Company Profile<", ">{t('Company Profile')}<")
content = content.replace(">Notifications<", ">{t('Notifications')}<")
content = content.replace(">Appearance & Localization<", ">{t('Appearance')}<")
content = content.replace(">Security Settings<", ">{t('Security')}<")
content = content.replace(">Users & Access<", ">{t('Users & Access')}<")
content = content.replace(">App Integrations<", ">{t('Integrations')}<")
content = content.replace(">Billing & Plan<", ">{t('Billing')}<")
content = content.replace(">Appearance<", ">{t('Appearance')}<")

# Replace sections array to translate items
content = content.replace(
    "const sections = ['Company', 'Users & Access', 'Notifications', 'Appearance', 'Integrations', 'Security', 'Billing'];",
    "const sections = ['Company', 'Users & Access', 'Notifications', 'Appearance', 'Integrations', 'Security', 'Billing'];\n  const displaySections = { 'Company': t('Company Profile'), 'Users & Access': t('Users & Access'), 'Notifications': t('Notifications'), 'Appearance': t('Appearance'), 'Integrations': t('Integrations'), 'Security': t('Security'), 'Billing': t('Billing') };"
)
content = content.replace(
    ">{s}<",
    ">{displaySections[s]}<"
)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated SettingsPage.jsx")
