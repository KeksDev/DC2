'use client';

import React, { useState, createContext, useContext } from 'react';
import { motion } from 'framer-motion';

// Language definitions
const languages = {
  en: {
    name: 'English',
    flag: '🇺🇸',
    messages: {
      login: 'Login',
      register: 'Register',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      loginButton: 'Login',
      registerButton: 'Register',
      createServer: 'Create Server',
      serverName: 'Server Name',
      description: 'Description',
      joinVoice: 'Join',
      leaveVoice: 'Leave',
      uploadFile: 'Upload File',
      privacySettings: 'Privacy Settings',
      encryptionEnabled: 'Encryption Enabled',
      messageRetention: 'Message Retention',
      autoDelete: 'Auto-delete messages',
      language: 'Language',
      voiceChannels: 'Voice Channels',
      textChannels: 'Text Channels',
      serverSettings: 'Server Settings',
      kickMember: 'Kick Member',
      moderationTools: 'Moderation Tools',
      fileSharing: 'File Sharing',
      advancedEncryption: 'Advanced Encryption'
    }
  },
  de: {
    name: 'Deutsch',
    flag: '🇩🇪',
    messages: {
      login: 'Anmelden',
      register: 'Registrieren',
      username: 'Benutzername',
      email: 'E-Mail',
      password: 'Passwort',
      loginButton: 'Anmelden',
      registerButton: 'Registrieren',
      createServer: 'Server Erstellen',
      serverName: 'Servername',
      description: 'Beschreibung',
      joinVoice: 'Beitreten',
      leaveVoice: 'Verlassen',
      uploadFile: 'Datei Hochladen',
      privacySettings: 'Datenschutz-Einstellungen',
      encryptionEnabled: 'Verschlüsselung Aktiviert',
      messageRetention: 'Nachrichtenspeicherung',
      autoDelete: 'Nachrichten automatisch löschen',
      language: 'Sprache',
      voiceChannels: 'Sprachkanäle',
      textChannels: 'Textkanäle',
      serverSettings: 'Server-Einstellungen',
      kickMember: 'Mitglied Entfernen',
      moderationTools: 'Moderations-Tools',
      fileSharing: 'Dateien Teilen',
      advancedEncryption: 'Erweiterte Verschlüsselung'
    }
  },
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    messages: {
      login: 'Connexion',
      register: "S'inscrire",
      username: "Nom d'utilisateur",
      email: 'E-mail',
      password: 'Mot de passe',
      loginButton: 'Se connecter',
      registerButton: "S'inscrire",
      createServer: 'Créer un Serveur',
      serverName: 'Nom du Serveur',
      description: 'Description',
      joinVoice: 'Rejoindre',
      leaveVoice: 'Quitter',
      uploadFile: 'Télécharger un Fichier',
      privacySettings: 'Paramètres de Confidentialité',
      encryptionEnabled: 'Chiffrement Activé',
      messageRetention: 'Rétention des Messages',
      autoDelete: 'Suppression automatique des messages',
      language: 'Langue',
      voiceChannels: 'Canaux Vocaux',
      textChannels: 'Canaux Texte',
      serverSettings: 'Paramètres du Serveur',
      kickMember: 'Exclure un Membre',
      moderationTools: 'Outils de Modération',
      fileSharing: 'Partage de Fichiers',
      advancedEncryption: 'Chiffrement Avancé'
    }
  },
  es: {
    name: 'Español',
    flag: '🇪🇸',
    messages: {
      login: 'Iniciar Sesión',
      register: 'Registrarse',
      username: 'Usuario',
      email: 'Correo',
      password: 'Contraseña',
      loginButton: 'Iniciar Sesión',
      registerButton: 'Registrarse',
      createServer: 'Crear Servidor',
      serverName: 'Nombre del Servidor',
      description: 'Descripción',
      joinVoice: 'Unirse',
      leaveVoice: 'Salir',
      uploadFile: 'Subir Archivo',
      privacySettings: 'Configuración de Privacidad',
      encryptionEnabled: 'Cifrado Habilitado',
      messageRetention: 'Retención de Mensajes',
      autoDelete: 'Eliminar mensajes automáticamente',
      language: 'Idioma',
      voiceChannels: 'Canales de Voz',
      textChannels: 'Canales de Texto',
      serverSettings: 'Configuración del Servidor',
      kickMember: 'Expulsar Miembro',
      moderationTools: 'Herramientas de Moderación',
      fileSharing: 'Compartir Archivos',
      advancedEncryption: 'Cifrado Avanzado'
    }
  }
};

type LanguageCode = keyof typeof languages;
type MessageKey = keyof typeof languages.en.messages;

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: MessageKey) => string;
  availableLanguages: Array<{
    code: LanguageCode;
    name: string;
    flag: string;
  }>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dc2-language') as LanguageCode;
      if (saved && languages[saved]) {
        return saved;
      }
      // Auto-detect browser language
      const browserLang = navigator.language.split('-')[0] as LanguageCode;
      return languages[browserLang] ? browserLang : 'en';
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dc2-language', lang);
    }
  };

  const t = (key: MessageKey): string => {
    return languages[currentLanguage].messages[key] || languages.en.messages[key] || key;
  };

  const availableLanguages = Object.entries(languages).map(([code, lang]) => ({
    code: code as LanguageCode,
    name: lang.name,
    flag: lang.flag
  }));

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      t,
      availableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[var(--dark-bg)] rounded-lg p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
          Select Language
        </h2>
        
        <div className="space-y-2">
          {availableLanguages.map((lang) => (
            <motion.button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                onClose();
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center p-3 rounded-lg border transition-colors ${
                currentLanguage === lang.code
                  ? 'bg-[var(--primary)] bg-opacity-20 border-[var(--primary)] text-[var(--primary)]'
                  : 'bg-[var(--light-bg)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--darker-bg)]'
              }`}
            >
              <span className="text-2xl mr-3">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
              {currentLanguage === lang.code && (
                <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </motion.button>
          ))}
        </div>

        <div className="mt-6 text-center">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-[var(--border-color)] text-[var(--text-primary)] rounded-md hover:bg-[var(--text-muted)] transition-colors"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LanguageSelector;