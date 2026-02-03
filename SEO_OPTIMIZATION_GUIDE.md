# Guide d'Optimisation SEO - SiamVisaPro.com

> Document de référence pour l'optimisation SEO de toutes les pages du site.
> Généré le 30 janvier 2026

---

## Table des matières
1. [Structure du site](#structure-du-site)
2. [Optimisations globales](#optimisations-globales)
3. [Pages principales](#pages-principales)
4. [Pages Visa](#pages-visa)
5. [Hreflang complet](#hreflang-complet)
6. [Schemas JSON-LD](#schemas-json-ld)

---

## Structure du site

| Catégorie | Pages | Langues | Total URLs |
|-----------|-------|---------|------------|
| Homepage | 1 | 11 | 11 |
| Visas principaux | 5 | 11 | 55 |
| Visas secondaires | 10 | 11 | ~20 |
| Utilitaires | 4 | 11 | ~8 |
| **Total** | | | **94** |

### Langues supportées
- 🇫🇷 Français (fr)
- 🇬🇧 English (en)
- 🇩🇪 Deutsch (de)
- 🇪🇸 Español (es)
- 🇮🇹 Italiano (it)
- 🇹🇭 ไทย (th)
- 🇷🇺 Русский (ru)
- 🇨🇳 中文 (zh)
- 🇯🇵 日本語 (ja)
- 🇰🇷 한국어 (ko)
- 🇸🇦 العربية (ar)

---

## Optimisations globales

### Balises à ajouter sur TOUTES les pages

```html
<!-- Canonical (adapter l'URL) -->
<link rel="canonical" href="https://www.siamvisapro.com/{lang}/{page}" />

<!-- Robots -->
<meta name="robots" content="index, follow" />

<!-- Author -->
<meta name="author" content="SiamVisa Pro" />

<!-- Theme Color -->
<meta name="theme-color" content="#1e3a5f" />
```

### Open Graph template

```html
<meta property="og:site_name" content="SiamVisa Pro" />
<meta property="og:type" content="article" />
<meta property="og:url" content="{URL_COMPLETE}" />
<meta property="og:title" content="{TITLE}" />
<meta property="og:description" content="{DESCRIPTION}" />
<meta property="og:image" content="https://www.siamvisapro.com/images/og/{page}-{lang}.jpg" />
<meta property="og:locale" content="{LOCALE}" />
```

### Twitter Card template

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@siamvisapro" />
<meta name="twitter:title" content="{TITLE}" />
<meta name="twitter:description" content="{DESCRIPTION}" />
<meta name="twitter:image" content="https://www.siamvisapro.com/images/og/{page}-{lang}.jpg" />
```

---

## Pages principales

### 1. Homepage

#### Français (fr)
```html
<title>SiamVisa Pro | Expert Visa Thaïlande - DTV, Elite, Retraite</title>
<meta name="description" content="Experts en visa Thaïlande depuis 2015. Visa DTV Digital Nomad, Elite, Retraite, LTR. Audit gratuit, assistance ambassade, garantie 100%. Bureau Bangkok & Paris." />
<meta name="keywords" content="visa Thaïlande, visa DTV, Thailand Elite, visa retraite, expatriation Thaïlande, digital nomad Thailand" />
```

#### English (en)
```html
<title>SiamVisa Pro | Thailand Visa Experts - DTV, Elite, Retirement</title>
<meta name="description" content="Thailand visa experts since 2015. DTV Digital Nomad, Elite, Retirement, LTR visas. Free eligibility audit, embassy assistance, 100% guarantee. Bangkok & Paris offices." />
<meta name="keywords" content="Thailand visa, DTV visa, Thailand Elite, retirement visa, Thailand expat, digital nomad Thailand" />
```

#### Italiano (it)
```html
<title>SiamVisa Pro | Esperti Visto Thailandia - DTV, Elite, Pensionati</title>
<meta name="description" content="Esperti in visti per la Thailandia dal 2015. Visto DTV Digital Nomad, Elite, Pensionati, LTR. Audit gratuito, assistenza ambasciata, garanzia 100%." />
<meta name="keywords" content="visto Thailandia, visto DTV, Thailand Elite, visto pensionati, espatrio Thailandia" />
```

#### Español (es)
```html
<title>SiamVisa Pro | Expertos Visa Tailandia - DTV, Elite, Jubilados</title>
<meta name="description" content="Expertos en visas para Tailandia desde 2015. Visa DTV Nómada Digital, Elite, Jubilados, LTR. Auditoría gratis, asistencia embajada, garantía 100%." />
<meta name="keywords" content="visa Tailandia, visa DTV, Thailand Elite, visa jubilados, expatriación Tailandia" />
```

#### Deutsch (de)
```html
<title>SiamVisa Pro | Thailand Visum Experten - DTV, Elite, Ruhestand</title>
<meta name="description" content="Thailand Visum Experten seit 2015. DTV Digital Nomad, Elite, Ruhestand, LTR Visa. Kostenlose Prüfung, Botschaftsunterstützung, 100% Garantie." />
<meta name="keywords" content="Thailand Visum, DTV Visum, Thailand Elite, Ruhestandsvisum, Thailand Auswandern" />
```

---

## Pages Visa

### 2. Visa DTV (Destination Thailand Visa)

#### Français (fr)
```html
<title>Visa DTV Thaïlande 2026 | Digital Nomad - 5 Ans de Liberté</title>
<meta name="description" content="Guide complet visa DTV Thaïlande 2026. Validité 5 ans, travail légal pour clients étrangers. Conditions: 500k THB, portfolio. Coût: 10,000 THB. Audit gratuit." />
<meta name="keywords" content="visa DTV, Destination Thailand Visa, digital nomad Thaïlande, visa 5 ans, remote work Thailand, freelance Thaïlande" />
```

#### English (en)
```html
<title>Thailand DTV Visa 2026 | Digital Nomad - 5 Years Freedom</title>
<meta name="description" content="Complete Thailand DTV Visa guide 2026. 5-year validity, legal remote work. Requirements: 500k THB savings, portfolio. Cost: 10,000 THB. Free eligibility audit." />
<meta name="keywords" content="DTV visa, Destination Thailand Visa, digital nomad Thailand, 5 year visa, remote work Thailand, freelance Thailand" />
```

#### Italiano (it)
```html
<title>Visto DTV Thailandia 2026 | Nomadi Digitali - 5 Anni di Libertà</title>
<meta name="description" content="Guida completa visto DTV Thailandia 2026. Validità 5 anni, lavoro legale per clienti esteri. Requisiti: 500k THB, portfolio. Costo: 10,000 THB. Audit gratuito." />
<meta name="keywords" content="visto DTV, Destination Thailand Visa, nomadi digitali Thailandia, visto 5 anni, remote work Thailandia" />
```

#### Español (es)
```html
<title>Visa DTV Tailandia 2026 | Nómada Digital - 5 Años de Libertad</title>
<meta name="description" content="Guía completa visa DTV Tailandia 2026. Validez 5 años, trabajo legal remoto. Requisitos: 500k THB, portfolio. Costo: 10,000 THB. Auditoría gratis." />
<meta name="keywords" content="visa DTV, Destination Thailand Visa, nómada digital Tailandia, visa 5 años, trabajo remoto Tailandia" />
```

---

### 3. Thailand Elite Visa

#### Français (fr)
```html
<title>Thailand Elite Visa 2026 | Résidence VIP 5-20 Ans | Prix & Avantages</title>
<meta name="description" content="Thailand Elite Visa: résidence privilégiée 5-20 ans. Fast track aéroport, golf, spa. Prix dès 600,000 THB. Aucune condition financière. Processus 2-4 semaines." />
<meta name="keywords" content="Thailand Elite, visa elite Thaïlande, résidence privilégiée, visa VIP Thaïlande, Elite Visa prix" />
```

#### English (en)
```html
<title>Thailand Elite Visa 2026 | VIP Residency 5-20 Years | Prices & Benefits</title>
<meta name="description" content="Thailand Elite Visa: privileged residency 5-20 years. Airport fast track, golf, spa. From 600,000 THB. No financial requirements. 2-4 weeks processing." />
<meta name="keywords" content="Thailand Elite, Elite visa Thailand, privileged residency, VIP visa Thailand, Elite Visa price" />
```

#### Italiano (it)
```html
<title>Thailand Elite Visa 2026 | Residenza VIP 5-20 Anni | Prezzi e Vantaggi</title>
<meta name="description" content="Thailand Elite Visa: residenza privilegiata 5-20 anni. Fast track aeroporto, golf, spa. Da 600,000 THB. Nessun requisito finanziario. Processo 2-4 settimane." />
<meta name="keywords" content="Thailand Elite, visto Elite Thailandia, residenza privilegiata, visto VIP Thailandia, Elite Visa prezzo" />
```

---

### 4. Visa Retraite (Retirement)

#### Français (fr)
```html
<title>Visa Retraite Thaïlande 2026 | Non-O +50 Ans | Conditions & Démarches</title>
<meta name="description" content="Visa retraite Thaïlande (Non-O): pour +50 ans. Conditions: 800,000 THB en banque OU 65,000 THB/mois. Validité 1 an renouvelable. Guide complet et assistance." />
<meta name="keywords" content="visa retraite Thaïlande, Non-O visa, retraite Thaïlande, expatrié retraité, visa +50 ans Thaïlande" />
```

#### English (en)
```html
<title>Thailand Retirement Visa 2026 | Non-O Age 50+ | Requirements & Process</title>
<meta name="description" content="Thailand Retirement Visa (Non-O): for 50+ years. Requirements: 800,000 THB in bank OR 65,000 THB/month income. 1 year renewable. Complete guide and assistance." />
<meta name="keywords" content="Thailand retirement visa, Non-O visa, retire in Thailand, expat retiree, visa 50+ Thailand" />
```

#### Italiano (it)
```html
<title>Visto Pensionati Thailandia 2026 | Non-O +50 Anni | Requisiti e Procedura</title>
<meta name="description" content="Visto pensionati Thailandia (Non-O): per +50 anni. Requisiti: 800,000 THB in banca O 65,000 THB/mese. Validità 1 anno rinnovabile. Guida completa e assistenza." />
<meta name="keywords" content="visto pensionati Thailandia, Non-O visa, pensione Thailandia, espatriato pensionato" />
```

---

### 5. Visa LTR (Long-Term Resident)

#### Français (fr)
```html
<title>Visa LTR Thaïlande 2026 | Résident Long Terme 10 Ans | 4 Catégories</title>
<meta name="description" content="Visa LTR Thaïlande: résidence 10 ans. 4 catégories: Wealthy Global Citizen, Wealthy Pensioner, Work-From-Thailand, Highly-Skilled. Avantages fiscaux inclus." />
<meta name="keywords" content="visa LTR Thaïlande, Long Term Resident, visa 10 ans, wealthy global citizen, work from Thailand professional" />
```

#### English (en)
```html
<title>Thailand LTR Visa 2026 | Long-Term Resident 10 Years | 4 Categories</title>
<meta name="description" content="Thailand LTR Visa: 10-year residency. 4 categories: Wealthy Global Citizen, Wealthy Pensioner, Work-From-Thailand, Highly-Skilled. Tax benefits included." />
<meta name="keywords" content="LTR visa Thailand, Long Term Resident, 10 year visa, wealthy global citizen, work from Thailand professional" />
```

---

### 6. Visa Touriste

#### Français (fr)
```html
<title>Visa Touriste Thaïlande 2026 | TR & Exemption | 60-90 Jours</title>
<meta name="description" content="Visa touriste Thaïlande 2026: exemption 60 jours pour Français, visa TR 90 jours. Extension possible +30 jours. Documents requis, prix, délais." />
<meta name="keywords" content="visa touriste Thaïlande, exemption visa, visa TR, tourisme Thaïlande, séjour court Thaïlande" />
```

#### English (en)
```html
<title>Thailand Tourist Visa 2026 | TR & Exemption | 60-90 Days</title>
<meta name="description" content="Thailand tourist visa 2026: 60-day exemption for most nationalities, TR visa 90 days. Extension +30 days possible. Required documents, price, timeline." />
<meta name="keywords" content="Thailand tourist visa, visa exemption, TR visa, Thailand tourism, short stay Thailand" />
```

---

### 7. Visa Media / Journalist (Non-M)

#### Français (fr)
```html
<title>Visa Media Thaïlande 2026 | Journaliste Non-M | Accréditation Presse</title>
<meta name="description" content="Visa Media Thaïlande (Non-M): pour journalistes, correspondants, équipes TV/film. Accréditation Foreign Correspondents Club. Permis de tournage inclus." />
<meta name="keywords" content="visa media Thaïlande, visa journaliste, Non-M visa, correspondant presse, tournage Thaïlande" />
```

#### English (en)
```html
<title>Thailand Media Visa 2026 | Journalist Non-M | Press Accreditation</title>
<meta name="description" content="Thailand Media Visa (Non-M): for journalists, correspondents, TV/film crews. Foreign Correspondents Club accreditation. Filming permit included." />
<meta name="keywords" content="Thailand media visa, journalist visa, Non-M visa, press correspondent, filming Thailand" />
```

#### Italiano (it)
```html
<title>Visto Media Thailandia 2026 | Giornalista Non-M | Accredito Stampa</title>
<meta name="description" content="Visto Media Thailandia (Non-M): per giornalisti, corrispondenti, troupe TV/cinema. Accredito Foreign Correspondents Club. Permesso riprese incluso." />
<meta name="keywords" content="visto media Thailandia, visto giornalista, Non-M visa, corrispondente stampa, riprese Thailandia" />
```

---

### 8. Autres Visas (template)

| Visa | Title FR | Description FR |
|------|----------|----------------|
| **Business (Non-B)** | Visa Business Thaïlande 2026 \| Non-B & Work Permit | Visa affaires Thaïlande (Non-B): création société, emploi local. Work permit obligatoire. Capital minimum 2M THB. |
| **Étudiant (Non-ED)** | Visa Étudiant Thaïlande 2026 \| Non-ED Études & Formation | Visa étudiant Thaïlande (Non-ED): universités, écoles de langue, Muay Thai. Validité 1 an renouvelable. |
| **Famille (Non-O)** | Visa Famille Thaïlande 2026 \| Conjoint & Enfants | Visa famille Thaïlande (Non-O): mariage avec Thaï(e), enfants, parents. Justificatifs relation requis. |
| **Smart Visa** | Smart Visa Thaïlande 2026 \| Talents & Startups Tech | Smart Visa Thaïlande: startups, talents tech, investisseurs. Secteurs ciblés S-Curve. 4 ans max. |
| **Volontaire** | Visa Volontaire Thaïlande 2026 \| ONG & Humanitaire | Visa volontaire Thaïlande: ONG accréditées, missions humanitaires. Lettre d'invitation requise. |
| **Médical** | Visa Médical Thaïlande 2026 \| Soins & Accompagnant | Visa médical Thaïlande: traitement hospitalier, accompagnant patient. Lettre hôpital certifié. |
| **Religieux** | Visa Religieux Thaïlande 2026 \| Moine & Ordination | Visa religieux Thaïlande: ordination bouddhiste, moine, novice. Lettre temple officiel requise. |

---

## Hreflang complet

### Template pour chaque page

```html
<!-- Remplacer {page} par le slug de la page -->
<link rel="alternate" hreflang="fr" href="https://www.siamvisapro.com/fr/{page}" />
<link rel="alternate" hreflang="en" href="https://www.siamvisapro.com/en/{page}" />
<link rel="alternate" hreflang="de" href="https://www.siamvisapro.com/de/{page}" />
<link rel="alternate" hreflang="es" href="https://www.siamvisapro.com/es/{page}" />
<link rel="alternate" hreflang="it" href="https://www.siamvisapro.com/it/{page}" />
<link rel="alternate" hreflang="th" href="https://www.siamvisapro.com/th/{page}" />
<link rel="alternate" hreflang="ru" href="https://www.siamvisapro.com/ru/{page}" />
<link rel="alternate" hreflang="zh" href="https://www.siamvisapro.com/zh/{page}" />
<link rel="alternate" hreflang="ja" href="https://www.siamvisapro.com/ja/{page}" />
<link rel="alternate" hreflang="ko" href="https://www.siamvisapro.com/ko/{page}" />
<link rel="alternate" hreflang="ar" href="https://www.siamvisapro.com/ar/{page}" />
<link rel="alternate" hreflang="x-default" href="https://www.siamvisapro.com/en/{page}" />
```

### Mapping des slugs par langue

| Page | FR | EN | IT | ES | DE |
|------|----|----|----|----|-----|
| DTV | visa-dtv-thailande | thailand-dtv-visa | visto-destinazione-thailandia | visa-dtv-tailandia | dtv-visum-thailand |
| Elite | thailand-elite | thailand-elite | thailand-elite | thailand-elite | thailand-elite |
| Retraite | visa-retraite | retirement-visa | visto-pensionati | visa-jubilados | ruhestandsvisum |
| LTR | visa-ltr | ltr-visa | visto-ltr | visa-ltr | ltr-visum |
| Touriste | visa-touriste | tourist-visa | visto-turista | visa-turista | touristenvisum |
| Media | visa-media | media-visa | visto-media | visa-media | medienvisum |
| Business | visa-business | business-visa | visto-business | visa-negocios | geschaeftsvisum |

---

## Schemas JSON-LD

### 1. Organization (toutes pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SiamVisa Pro",
  "alternateName": "Siam Visa Pro",
  "url": "https://www.siamvisapro.com",
  "logo": "https://www.siamvisapro.com/images/logo.png",
  "description": "Thailand visa experts since 2015",
  "foundingDate": "2015",
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+66-82-414-9840",
      "contactType": "customer service",
      "email": "contact@siamvisapro.com",
      "availableLanguage": ["French", "English", "Thai", "Spanish", "Italian", "German"]
    }
  ],
  "address": [
    {
      "@type": "PostalAddress",
      "addressLocality": "Bangkok",
      "addressCountry": "TH"
    },
    {
      "@type": "PostalAddress",
      "addressLocality": "Paris",
      "addressCountry": "FR"
    }
  ],
  "sameAs": [
    "https://wa.me/66824149840",
    "https://www.facebook.com/siamvisapro",
    "https://www.linkedin.com/company/siamvisapro"
  ]
}
```

### 2. BreadcrumbList (pages visa)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.siamvisapro.com/{lang}"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Visas",
      "item": "https://www.siamvisapro.com/{lang}/visas"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "{Visa Name}",
      "item": "https://www.siamvisapro.com/{lang}/{visa-slug}"
    }
  ]
}
```

### 3. FAQPage (pages visa avec FAQ)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{Question 1}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{Réponse 1}"
      }
    },
    {
      "@type": "Question",
      "name": "{Question 2}",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "{Réponse 2}"
      }
    }
  ]
}
```

### 4. Article (pages guides/blog)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{Title}",
  "description": "{Description}",
  "author": {
    "@type": "Organization",
    "name": "SiamVisa Pro"
  },
  "publisher": {
    "@type": "Organization",
    "name": "SiamVisa Pro",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.siamvisapro.com/images/logo.png"
    }
  },
  "datePublished": "2024-06-01",
  "dateModified": "2026-01-30",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{URL}"
  }
}
```

### 5. Service (pages services)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Visa Application Assistance",
  "provider": {
    "@type": "Organization",
    "name": "SiamVisa Pro"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Thailand"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Visa Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "DTV Visa Assistance"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Elite Visa Application"
        }
      }
    ]
  }
}
```

---

## Checklist par page

### Avant publication

- [ ] Title < 60 caractères
- [ ] Description 120-160 caractères
- [ ] H1 unique et descriptif
- [ ] Canonical URL définie
- [ ] Hreflang pour toutes les langues
- [ ] Open Graph complet (title, desc, image, url)
- [ ] Twitter Card configurée
- [ ] Schema Organization présent
- [ ] Schema BreadcrumbList (si applicable)
- [ ] Schema FAQPage (si FAQ présente)
- [ ] Images avec alt descriptifs
- [ ] Liens internes vers pages liées

### Outils de validation

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Schema.org Validator](https://validator.schema.org/)
- [Hreflang Tags Testing Tool](https://technicalseo.com/tools/hreflang/)

---

## Priorités d'implémentation

### Phase 1 - Critique (immédiat)
1. ✅ Homepage toutes langues - hreflang + OG + Twitter
2. ✅ Page DTV toutes langues - c'est le produit phare
3. ✅ Page Elite - haut panier

### Phase 2 - Important (1 semaine)
4. Pages Retraite et LTR
5. Page Touriste
6. Page Services/Tarifs

### Phase 3 - Secondaire (2 semaines)
7. Visas spécialisés (Media, Business, Student...)
8. Pages utilitaires (FAQ, Contact, CGV)

---

*Document généré par Claude Code - Janvier 2026*
