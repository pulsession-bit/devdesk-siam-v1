import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  noIndex?: boolean;
  schema?: object;
}

const BASE_URL = 'https://desk.siamvisapro.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

// SEO configurations for each page
export const SEO_CONFIGS: Record<string, SEOConfig> = {
  home: {
    title: 'Siam Visa Pro | Visa DTV Thaïlande - Expert Digital Nomad',
    description: 'Siam Visa Pro - Expert en visa DTV Thaïlande. Audit gratuit d\'éligibilité, assistance ambassade, 5 ans de liberté. Spécialistes Digital Nomad.',
    keywords: 'visa DTV, visa Thaïlande, digital nomad Thaïlande, visa 5 ans, expatriation Thaïlande',
    canonical: BASE_URL,
    ogType: 'website',
  },
  dtv: {
    title: 'Visa DTV Thaïlande | 5 Ans de Liberté pour Digital Nomads',
    description: 'Le visa DTV (Destination Thailand Visa) vous permet de vivre et travailler en Thaïlande pendant 5 ans. Entrées multiples, travail légal pour clients étrangers.',
    keywords: 'visa DTV, Destination Thailand Visa, digital nomad visa, visa 5 ans Thaïlande, remote work Thailand',
    canonical: `${BASE_URL}/dtv`,
    ogType: 'article',
    schema: {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Visa DTV Thaïlande - Guide Complet 2025",
      "description": "Tout savoir sur le visa DTV pour Digital Nomads",
      "author": { "@type": "Organization", "name": "Siam Visa Pro" },
      "publisher": { "@type": "Organization", "name": "Siam Visa Pro" },
      "datePublished": "2024-06-01",
      "dateModified": new Date().toISOString().split('T')[0]
    }
  },
  dashboard: {
    title: 'Mon Espace | Siam Visa Pro - Suivi de Dossier',
    description: 'Accédez à votre espace personnel Siam Visa Pro. Suivez l\'avancement de votre dossier visa, consultez vos documents et échangez avec nos experts.',
    keywords: 'espace client visa, suivi dossier visa, dashboard visa Thaïlande',
    canonical: `${BASE_URL}/dashboard`,
    noIndex: true, // Page privée
  },
  audit: {
    title: 'Audit Visa IA | Test d\'Éligibilité Gratuit - Siam Visa Pro',
    description: 'Testez votre éligibilité au visa DTV gratuitement avec notre IA. Score VisaScore™ instantané, recommandations personnalisées, assistance expert.',
    keywords: 'audit visa gratuit, test éligibilité visa DTV, VisaScore, éligibilité visa Thaïlande',
    canonical: `${BASE_URL}/audit`,
    ogType: 'website',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "VisaScore™ - Audit d'Éligibilité",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR"
      }
    }
  },
  booking: {
    title: 'Prendre RDV Expert Visa | Consultation Gratuite - Siam Visa Pro',
    description: 'Réservez une consultation gratuite avec nos experts visa Thaïlande. Audit personnalisé de votre dossier, conseils stratégiques, accompagnement complet.',
    keywords: 'rdv visa Thaïlande, consultation visa expert, rendez-vous visa DTV',
    canonical: `${BASE_URL}/booking`,
    ogType: 'website',
  },
  shop: {
    title: 'Services Premium | Fast Track, Assurance, Traduction - Siam Visa Pro',
    description: 'Découvrez nos services premium pour votre expatriation: Fast Track aéroport, assurance santé expat, traduction certifiée, conciergerie VIP.',
    keywords: 'services expatriation Thaïlande, fast track Bangkok, assurance expat, traduction certifiée thaï',
    canonical: `${BASE_URL}/shop`,
    ogType: 'website',
    schema: {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Services Premium Siam Visa Pro",
      "itemListElement": [
        { "@type": "Service", "position": 1, "name": "Airport Fast Track", "description": "Accueil VIP et immigration prioritaire" },
        { "@type": "Service", "position": 2, "name": "Assurance Santé Expat", "description": "Couverture complète conforme DTV/LTR" },
        { "@type": "Service", "position": 3, "name": "Traduction Certifiée", "description": "Traduction assermentée FR/EN vers TH" }
      ]
    }
  },
  documents: {
    title: 'Mes Documents | Centre de Documents Sécurisé - Siam Visa Pro',
    description: 'Gérez vos documents visa en toute sécurité. Upload, validation en temps réel, stockage crypté conforme PDPA/GDPR.',
    keywords: 'documents visa, upload documents, stockage sécurisé, documents Thaïlande',
    canonical: `${BASE_URL}/documents`,
    noIndex: true,
  },
  security: {
    title: 'Sécurité & Confidentialité | Protection des Données - Siam Visa Pro',
    description: 'Découvrez notre politique de sécurité Zero Trust. Cryptage end-to-end, conformité GDPR/PDPA, stockage souverain en Europe.',
    keywords: 'sécurité données visa, GDPR, PDPA, protection données personnelles, confidentialité',
    canonical: `${BASE_URL}/security`,
    ogType: 'article',
  },
  applications: {
    title: 'Suivi de Demande | État de mon Dossier Visa - Siam Visa Pro',
    description: 'Suivez l\'avancement de votre demande de visa en temps réel. Timeline détaillée, notifications, contact direct avec votre agent.',
    keywords: 'suivi visa, état dossier visa, tracking demande visa',
    canonical: `${BASE_URL}/applications`,
    noIndex: true,
  }
};

export function useSEO(pageKey: keyof typeof SEO_CONFIGS | string) {
  const { i18n } = useTranslation();
  const config = SEO_CONFIGS[pageKey] || SEO_CONFIGS.home;

  useEffect(() => {
    // Update title
    document.title = config.title;

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Helper to update or create link tag
    const updateLink = (rel: string, href: string, hreflang?: string) => {
      const selector = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]:not([hreflang])`;
      let link = document.querySelector(selector) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        if (hreflang) link.hreflang = hreflang;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    // Update meta description
    updateMeta('description', config.description);

    // Update keywords if provided
    if (config.keywords) {
      updateMeta('keywords', config.keywords);
    }

    // Update robots
    updateMeta('robots', config.noIndex ? 'noindex, nofollow' : 'index, follow');

    // Update canonical
    if (config.canonical) {
      updateLink('canonical', config.canonical);
    }

    // Update Open Graph
    updateMeta('og:title', config.title, true);
    updateMeta('og:description', config.description, true);
    updateMeta('og:url', config.canonical || BASE_URL, true);
    updateMeta('og:type', config.ogType || 'website', true);
    updateMeta('og:image', config.ogImage || DEFAULT_IMAGE, true);
    updateMeta('og:locale', i18n.language === 'fr' ? 'fr_FR' : i18n.language === 'es' ? 'es_ES' : 'en_US', true);

    // Update Twitter Card
    updateMeta('twitter:title', config.title);
    updateMeta('twitter:description', config.description);
    updateMeta('twitter:image', config.ogImage || DEFAULT_IMAGE);

    // Update page-specific schema if provided
    if (config.schema) {
      let schemaScript = document.querySelector('script[data-seo-schema]') as HTMLScriptElement;
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.type = 'application/ld+json';
        schemaScript.setAttribute('data-seo-schema', 'true');
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(config.schema);
    }

    // Update HTML lang attribute
    document.documentElement.lang = i18n.language;

  }, [pageKey, config, i18n.language]);
}

export default useSEO;
