'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Eye, 
  Upload,
  Contrast,
  Type,
  Image as ImageIcon,
  Save,
  RefreshCw
} from 'lucide-react';
import SettingsCard from './SettingsCard';
import ToggleSwitch from './ToggleSwitch';

export default function AppearanceTheme() {
  const [themeSettings, setThemeSettings] = useState({
    theme: 'light',
    systemTheme: false,
    highContrast: false,
    fontSize: 'medium',
    customColors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B'
    },
    selectedPreset: 'default',
    logoUrl: '',
    companyName: 'ServiceFlow'
  });

  const presetThemes = [
    {
      id: 'default',
      name: 'Default',
      description: 'Clean and modern',
      colors: { primary: '#3B82F6', secondary: '#10B981', accent: '#F59E0B' },
      preview: 'bg-gradient-to-r from-blue-500 to-green-500'
    },
    {
      id: 'dark',
      name: 'Dark Professional',
      description: 'Easy on the eyes',
      colors: { primary: '#6366F1', secondary: '#8B5CF6', accent: '#EC4899' },
      preview: 'bg-gradient-to-r from-indigo-600 to-purple-600'
    },
    {
      id: 'corporate',
      name: 'Corporate Blue',
      description: 'Professional and trustworthy',
      colors: { primary: '#1E40AF', secondary: '#0F766E', accent: '#DC2626' },
      preview: 'bg-gradient-to-r from-blue-700 to-teal-700'
    },
    {
      id: 'finance',
      name: 'Finance Green',
      description: 'Money and growth focused',
      colors: { primary: '#059669', secondary: '#0D9488', accent: '#F59E0B' },
      preview: 'bg-gradient-to-r from-emerald-600 to-teal-600'
    },
    {
      id: 'tech',
      name: 'Tech Purple',
      description: 'Modern and innovative',
      colors: { primary: '#7C3AED', secondary: '#C026D3', accent: '#06B6D4' },
      preview: 'bg-gradient-to-r from-violet-600 to-fuchsia-600'
    }
  ];

  const fontSizes = [
    { value: 'small', label: 'Small', description: '14px base' },
    { value: 'medium', label: 'Medium', description: '16px base' },
    { value: 'large', label: 'Large', description: '18px base' },
    { value: 'extra-large', label: 'Extra Large', description: '20px base' }
  ];

  const handleThemeChange = (field: string, value: any) => {
    setThemeSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (colorType: string, value: string) => {
    setThemeSettings(prev => ({
      ...prev,
      customColors: { ...prev.customColors, [colorType]: value }
    }));
  };

  const handlePresetSelect = (presetId: string) => {
    const preset = presetThemes.find(p => p.id === presetId);
    if (preset) {
      setThemeSettings(prev => ({
        ...prev,
        selectedPreset: presetId,
        customColors: preset.colors
      }));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Theme Mode */}
      <SettingsCard
        title="Theme Mode"
        description="Choose between light, dark, or system preference"
        icon={Sun}
      >
        <div className="space-y-6">
          {/* Theme Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { id: 'light', name: 'Light', icon: Sun, description: 'Clean and bright' },
              { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
              { id: 'system', name: 'System', icon: Monitor, description: 'Follows your device' }
            ].map((theme) => (
              <motion.button
                key={theme.id}
                onClick={() => handleThemeChange('theme', theme.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  themeSettings.theme === theme.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 rounded-lg ${
                    themeSettings.theme === theme.id ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <theme.icon className={`h-6 w-6 ${
                      themeSettings.theme === theme.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`font-medium ${
                      themeSettings.theme === theme.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {theme.name}
                    </h3>
                    <p className={`text-sm ${
                      themeSettings.theme === theme.id ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {theme.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Additional Options */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <ToggleSwitch
              enabled={themeSettings.highContrast}
              onChange={(enabled) => handleThemeChange('highContrast', enabled)}
              label="High Contrast Mode"
              description="Increases contrast for better accessibility"
            />
          </div>
        </div>
      </SettingsCard>

      {/* Preset Themes */}
      <SettingsCard
        title="Theme Presets"
        description="Choose from professionally designed color schemes"
        icon={Palette}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presetThemes.map((preset) => (
              <motion.button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  themeSettings.selectedPreset === preset.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="space-y-3">
                  <div className={`h-12 w-full rounded-lg ${preset.preview}`} />
                  <div>
                    <h3 className={`font-medium ${
                      themeSettings.selectedPreset === preset.id ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {preset.name}
                    </h3>
                    <p className={`text-sm ${
                      themeSettings.selectedPreset === preset.id ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {preset.description}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: preset.colors.secondary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: preset.colors.accent }}
                    />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </SettingsCard>

      {/* Custom Colors */}
      <SettingsCard
        title="Custom Colors"
        description="Create your own color scheme"
        icon={Eye}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(themeSettings.customColors).map(([colorType, colorValue]) => (
            <div key={colorType}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {colorType} Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={colorValue}
                  onChange={(e) => handleColorChange(colorType, e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={colorValue}
                  onChange={(e) => handleColorChange(colorType, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Typography */}
      <SettingsCard
        title="Typography"
        description="Adjust text size and readability"
        icon={Type}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Font Size
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fontSizes.map((size) => (
                <button
                  key={size.value}
                  onClick={() => handleThemeChange('fontSize', size.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    themeSettings.fontSize === size.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`font-medium ${
                    themeSettings.fontSize === size.value ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {size.label}
                  </div>
                  <div className={`text-sm ${
                    themeSettings.fontSize === size.value ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {size.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Branding */}
      <SettingsCard
        title="Company Branding"
        description="Customize your company logo and branding"
        icon={ImageIcon}
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={themeSettings.companyName}
              onChange={(e) => handleThemeChange('companyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your Company Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-12 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                {themeSettings.logoUrl ? (
                  <img src={themeSettings.logoUrl} alt="Logo" className="max-w-full max-h-full" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex space-x-3">
                  <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>Upload Logo</span>
                  </button>
                  <button className="px-4 py-2 text-sm text-red-600 hover:text-red-700 transition-colors">
                    Remove
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 400x50px, PNG or SVG format, max 2MB
                </p>
              </div>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Live Preview */}
      <SettingsCard
        title="Live Preview"
        description="See how your theme looks in action"
        icon={Eye}
      >
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-white p-4 border-b" style={{ backgroundColor: themeSettings.customColors.primary + '10' }}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold" style={{ color: themeSettings.customColors.primary }}>
                {themeSettings.companyName}
              </h3>
              <div className="flex space-x-2">
                <div 
                  className="px-3 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: themeSettings.customColors.secondary }}
                >
                  Button
                </div>
                <div 
                  className="px-3 py-1 rounded text-white text-sm"
                  style={{ backgroundColor: themeSettings.customColors.accent }}
                >
                  Action
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-gray-50">
            <p className="text-gray-600 text-sm">
              This is how your custom theme will appear throughout the application.
            </p>
          </div>
        </div>
      </SettingsCard>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-between items-center pt-6 border-t border-gray-200"
      >
        <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Reset to Default</span>
        </button>
        <div className="flex space-x-3">
          <button className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Cancel
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Save className="h-4 w-4" />
            <span>Apply Theme</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
