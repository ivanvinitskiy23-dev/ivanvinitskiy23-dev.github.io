// Qwiqly Multilingual i18n Engine (EN · DE · FR · ES)
(function() {
  'use strict';

  var translations = {
    de: {
      "nav.brand_sub": "Präsentationen & Landings",
      "nav.work": "Projekte (13)",
      "nav.themes": "Themes (6)",
      "nav.method": "Methode",
      "nav.about": "Über uns",
      "nav.cta": "E-Mail schreiben",
      
      // Hero Emerald
      "hero.em.eyebrow": "Präsentations- & Landing-Design · Europa / Kyjiw",
      "hero.em.h1": "Präsentationen & Landings<br>mit klarer Struktur.",
      "hero.em.lead": "Wir gestalten Pitch Decks, Produktseiten und leichtgewichtige Produktoberflächen für ambitionierte Teams. Klare Argumente, maßgeschneiderte visuelle Systeme und null Vorlagen-Einerlei.",
      "hero.em.cta_primary": "Projekte ansehen (13) ↗",
      "hero.em.cta_secondary": "E-Mail schreiben",
      "hero.em.service_1": "Pitch Decks",
      "hero.em.service_2": "B2B-Präsentationen",
      "hero.em.service_3": "Produkt-Landings",
      "hero.em.service_4": "Product surfaces",
      "hero.em.mascot_badge": "Unit Q / Studio-Mechaniker",
      "hero.em.strip": "Interaktives HTML im Browser · Druckfertiges PDF & bearbeitbares PPTX · Scrollen ↓",

      // Hero Ora
      "hero.ora.h1": "Decks & Seiten<br><em>mit Charakter.</em>",
      "hero.ora.kicker": "Visuelle Systeme & Interfaces",
      "hero.ora.lead": "Dichte visuelle Taktung, markante Typografie und responsive Browser-Decks für Fintech, Tech-Startups und anspruchsvolle Launches.",
      "hero.ora.cta": "E-Mail schreiben ↗",
      "hero.ora.hint": "Karten verschieben ← → oder Vollbild öffnen",
      "hero.ora.ticker": "Pitch Decks · Produkt-Landings · B2B-Angebote · Product surfaces · Interaktives HTML · PDF & PPTX · 13 Projekte im Katalog · Qwiqly Studio ·",

      // Hero Pixel
      "hero.px.kicker": "Qwiqly Arcade · 13 Arbeiten geladen",
      "hero.px.h1": "Reines Handwerk.<br><span>Null KI-Müll.</span>",
      "hero.px.lead": "Keine zufälligen Vorlagengenerierungen. Jede Folie und Landingpage entsteht in akribischer Handarbeit mit durchdachter Typografie und klarer Hierarchie.",
      "hero.px.cta_primary": "Projekte öffnen ▶",
      "hero.px.cta_secondary": "E-Mail schreiben",
      "hero.px.hud_mode": "Interaktive Vorschau",

      // Hero Atomic
      "hero.at.sub": "High-Tech & Engineering Systems",
      "hero.at.h1": "Komplexe Materie,<br>präzise strukturiert.",
      "hero.at.lead": "Präsentationen und digitale Oberflächen für IT-Sicherheit, Schwerindustrie, Analytik und Infrastruktur. Wir machen dichte Telemetrie übersichtlich lesbar.",
      "hero.at.cta_primary": "Projekte ansehen (13) ↗",
      "hero.at.cta_secondary": "E-Mail schreiben",

      // Hero Onion
      "hero.on.kicker": "Editorische & architektonische Praxis",
      "hero.on.h1": "Systeme der Ordnung,<br>geschaffen für Fakten.",
      "hero.on.lead": "Disziplinierte Typografie, strenge Proportionalraster und ruhiger Lesefluss. Konzipiert für Führungsgremien, institutionelle Berichte und fundierte Anträge.",
      "hero.on.cta_primary": "Katalog öffnen ↗",
      "hero.on.cta_secondary": "E-Mail schreiben",

      // Hero Coppola
      "hero.cp.kicker": "Regie für entscheidende Momente",
      "hero.cp.h1": "Wenn Entscheidungen<br>fallen.",
      "hero.cp.lead": "Kontrastreiche filmische Präsentationen und Launch-Inszenierungen für Schlüsselpartner, strategische Verhandlungen und wichtige Premieren.",
      "hero.cp.cta_primary": "Projekte erkunden ↗",
      "hero.cp.cta_secondary": "E-Mail schreiben",
      "hero.cp.hint": "Wischen Sie über das Glas, um das Kondenswasser zu entfernen",

      // Work
      "work.eyebrow": "Ausgewählte Arbeiten",
      "work.title": "Dreizehn Decks. Ausgewählte Arbeiten.",
      "work.lead": "Dreizehn interaktive Präsentationen in sechs Design-Systemen. Jedes Projekt ist ein vollständiger Browser-Viewer, der sich mit den Pfeiltasten steuern lässt — kein statisches Mockup.",
      "work.filter_all": "Alle <span>13</span>",
      "work.filter_pitch": "Pitches & Startups <span>3</span>",
      "work.filter_brand": "Services & B2B <span>5</span>",
      "work.filter_system": "Brand & Systeme <span>5</span>",
      "work.count_label": "Projekte",
      "work.open_deck": "Deck öffnen ↗",

      // Case blurbs
      "case.aethel": "Flottenlogistik-Dossier, das Astrodynamik und orbitale Nutzlastökonomie in ein präzises Vorstandsbriefing übersetzt.",
      "case.ecopack": "B2B-Präsentation für Gastronomieketten und HoReCa-Händler mit Fokus auf Deckungsbeiträge und Umweltstandards.",
      "case.vance": "90-Tage-Restrukturierungsplan auf C-Level zur Abstimmung operativer Prioritäten im Führungskreis.",
      "case.vertex": "Industrielle Ingenieurs- und Baukompetenzen für die Qualifikation bei internationalen Großausschreibungen.",
      "case.aura": "Strategisches Pitch-Deck einer Sound-Design-Agentur für internationale Marken und immersive Kampagnen.",
      "case.kinesthetic": "Minimalistische Studie über haptische Interfaces und visuelle Rückmeldesysteme der nächsten Generation.",
      "case.bioma": "Architekturpräsentation für einen biophilen Pavillon vor städtischen Planungs- und Umweltkommissionen.",
      "case.karelia": "Konzeptdossier für ein naturverbundenes Luxus-Resort und Gästeerlebnis zur Vorstellung bei Partnern.",
      "case.black": "Monochromes Credential-Deck für Cybersicherheit, Dark-Ops-Ermittlungen und Reputationsmanagement.",
      "case.perfect_shot": "Sponsoring-Präsentation für eine Dokumentarfilm- und Fotoexpedition durch das Königreich Eswatini.",
      "case.cortex": "Enterprise-Sicherheitsbriefing zur Rechtfertigung von SOC-Budget und systemweiter Telemetrieabdeckung.",
      "case.novashift": "Führungskräfte-Briefing über Servicerobotik, humanoide Systeme und automatisierte Arbeitsabläufe.",
      "case.project_m": "Generalunternehmer-Qualifikation für Hüttenwerke, Bergbau und industrielle Großanlagen.",

      // Themes
      "themes.eyebrow": "Design-Systeme",
      "themes.title": "Sechs visuelle Gewänder.<br>Eine klare Aussage.",
      "themes.lead": "Wir glauben nicht an Standard-Templates. Klicken Sie auf ein Theme, um die gesamte Seite in das entsprechende Design-System zu verwandeln — von sachlicher Eleganz bis hin zu experimentellen Interfaces.",
      "themes.note": "Die Themenauswahl wird lokal im Browser gespeichert. Direktlink: <code>?theme=ora</code>",

      // Method
      "method.eyebrow": "Prozess",
      "method.idx": "04 Phasen",
      "method.title": "Wie Projekte entstehen",
      "method.step1_num": "Phase 01 · Briefing & Struktur",
      "method.step1_h3": "Briefing & Kernargument",
      "method.step1_p": "Wir analysieren Ihren Entwurf, Rohdaten oder bestehende Folien. Wir klären die Zielgruppe, streichen Füllmaterial und formulieren die Kernbotschaft.",
      "method.step2_num": "Phase 02 · Visuelle Richtung",
      "method.step2_h3": "Visuelle Leitplanken",
      "method.step2_p": "Typografie, Farbwelt und Layoutraster werden anhand von 2–3 Schlüsselfolien abgestimmt, bevor die Gesamtproduktion startet.",
      "method.step3_num": "Phase 03 · Vollständige Produktion",
      "method.step3_h3": "Folien- & Seitenbau",
      "method.step3_p": "Ausarbeitung sämtlicher Folien, Diagramme, Tabellen und responsiver Ansichten mit Fokus auf visuelle Hierarchie.",
      "method.step4_num": "Phase 04 · Umfassende Übergabe",
      "method.step4_h3": "Universelle Bereitstellung",
      "method.step4_p": "Sie erhalten einen interaktiven Web-Viewer für flüssige Präsentationen im Browser, ein hochauflösendes PDF und ein bearbeitbares PPTX.",
      "method.surface_note": "Optional: Wir binden Product surfaces an — Formulare, Telegram-Benachrichtigungen oder Google Sheets für Ihre Präsentation.",

      // About
      "about.eyebrow": "Über das Studio",
      "about.idx": "Philosophie & Handwerk",
      "about.title": "Präsentationen und digitale Oberflächen für entscheidende Momente.",
      "about.p1": "Qwiqly ist ein unabhängiges Studio für Präsentations- und Landing-Design. Wir unterstützen Gründer, Führungskräfte und Produktteams dabei, komplexe Ideen in klare, wirkungsvolle Narrative zu verwandeln.",
      "about.p2": "Wir verzichten auf vorgefertigte Standard-Vorlagen. Jedes Projekt wird von der Kernaussage ausgehend aufgebaut — mit typografischer Disziplin, schnell erfassbaren Kennzahlen und makelloser technischer Performance.",
      "about.surface": "Über Folien hinaus entwickeln wir Product surfaces: leichtgewichtige digitale Schnittstellen, die Ihre Präsentation oder Landingpage mit Telegram, Google Sheets oder Formularen verknüpfen.",
      "about.stat1": "<b>13</b> öffentliche Arbeitsproben",
      "about.stat2": "<b>03</b> Übergabeformate (HTML, PDF, PPTX)",
      "about.stat3": "<b>06</b> interaktive Design-Systeme",
      "about.stat4": "<b>00</b> Standard-Vorlagendownloads",

      // Contact
      "contact.eyebrow": "Gespräch beginnen",
      "contact.title": "Lassen Sie uns über Ihre Präsentation oder Landingpage sprechen.",
      "contact.lead": "Beschreiben Sie uns Ihr Publikum, das Ziel oder den anstehenden Launch. Schicken Sie uns einen Entwurf oder eine bestehende Datei, und wir prüfen die ideale Umsetzung.",
      "contact.box_title": "Hilfreiche Angaben für den Einstieg:",
      "contact.item1": "Wer ist das Publikum (Investoren, Unternehmenskunden, Fachkonferenz)?",
      "contact.item2": "Geschätzte Folienanzahl oder Seitenlänge",
      "contact.item3": "Status der Inhalte (fertiger Text vs. erste Stichpunkte)",
      "contact.item4": "Geplante Deadline oder Präsentationstermin",
      "contact.cta": "E-Mail schreiben ↗",
      "contact.cta_tg": "Telegram ↗",
      "contact.cta_wa": "WhatsApp ↗",
      "contact.ch_mail": "E-Mail",
      "contact.ch_tg": "Telegram",
      "contact.ch_wa": "WhatsApp",
      "contact.wa_hint": "WhatsApp: App öffnen und nach <b>@qwiqly</b> suchen, falls der Link noch nicht auflöst.",
      "contact.meta": "<span>Europa / Kyjiw</span><span>Grenzüberschreitende Zusammenarbeit</span><span>Echte interaktive Arbeit</span>",

      // Footer
      "footer.desc": "Studio für Präsentations- & Landing-Design",
      "footer.copy": "© 2026 Qwiqly Studio. Alle Rechte vorbehalten.",
      "footer.geo": "Europa / Kyjiw · Globale Kundenbasis",
      "footer.to_top": "Nach oben ↑"
    },

    fr: {
      "nav.brand_sub": "Présentations & pages d'atterrissage",
      "nav.work": "Projets (13)",
      "nav.themes": "Thèmes (6)",
      "nav.method": "Méthode",
      "nav.about": "À propos",
      "nav.cta": "Nous écrire",

      // Hero Emerald
      "hero.em.eyebrow": "Design de présentations & landings · Europe / Kyiv",
      "hero.em.h1": "Présentations & landings<br>d'une clarté absolue.",
      "hero.em.lead": "Nous concevons des pitch decks, des pages de lancement et des surfaces produit légères pour des équipes exigeantes. Des arguments limpides, un système visuel sur mesure et zéro modèle préfabriqué.",
      "hero.em.cta_primary": "Découvrir les projets (13) ↗",
      "hero.em.cta_secondary": "Nous écrire",
      "hero.em.service_1": "Pitch Decks",
      "hero.em.service_2": "Présentations B2B",
      "hero.em.service_3": "Pages de lancement",
      "hero.em.service_4": "Product surfaces",
      "hero.em.mascot_badge": "Unit Q / Mécanicien du studio",
      "hero.em.strip": "HTML interactif en navigateur · PDF haute résolution & PPTX modifiable · Défiler ↓",

      // Hero Ora
      "hero.ora.h1": "Decks & pages<br><em>pleins d'énergie.</em>",
      "hero.ora.kicker": "Systèmes visuels & interfaces",
      "hero.ora.lead": "Rythme visuel dense, typographie affirmée et decks interactifs pour la fintech, les startups technologiques et les lancements majeurs.",
      "hero.ora.cta": "Nous écrire ↗",
      "hero.ora.hint": "Faites défiler les cartes ← → ou ouvrez en plein écran",
      "hero.ora.ticker": "Pitch decks · Pages produit · Propositions B2B · Product surfaces · HTML interactif · PDF & PPTX · 13 projets au catalogue · Studio Qwiqly ·",

      // Hero Pixel
      "hero.px.kicker": "Arcade Qwiqly · 13 projets chargés",
      "hero.px.h1": "Artisanat pur.<br><span>Zéro bavure.</span>",
      "hero.px.lead": "Aucun modèle généré sans âme. Chaque diapositive et landing est pensée sur mesure avec une typographie rigoureuse et une hiérarchie millimétrée.",
      "hero.px.cta_primary": "Voir les projets ▶",
      "hero.px.cta_secondary": "Nous écrire",
      "hero.px.hud_mode": "Aperçu interactif",

      // Hero Atomic
      "hero.at.sub": "Systèmes High-Tech & Ingénierie",
      "hero.at.h1": "Idées complexes,<br>parfaitement ordonnées.",
      "hero.at.lead": "Présentations et surfaces digitales pour la cybersécurité, l'industrie lourde et l'analytique. Nous transformons les données denses en récits structurés.",
      "hero.at.cta_primary": "Découvrir les projets (13) ↗",
      "hero.at.cta_secondary": "Nous écrire",

      // Hero Onion
      "hero.on.kicker": "Pratique éditoriale & architecturale",
      "hero.on.h1": "Systèmes rigoureux,<br>conçus pour informer.",
      "hero.on.lead": "Typographie rigoureuse, grilles modulaires et fluidité éditoriale. Conçu pour les comités de direction, les rapports institutionnels et les dossiers stratégiques.",
      "hero.on.cta_primary": "Ouvrir le catalogue ↗",
      "hero.on.cta_secondary": "Nous écrire",

      // Hero Coppola
      "hero.cp.kicker": "Mise en scène pour les moments décisifs",
      "hero.cp.h1": "Quand l'instant<br>est décisif.",
      "hero.cp.lead": "Présentations cinématographiques à fort contraste et récits de lancement pour partenaires stratégiques et prises de décision majeures.",
      "hero.cp.cta_primary": "Explorer les projets ↗",
      "hero.cp.cta_secondary": "Nous écrire",
      "hero.cp.hint": "Glissez sur l'écran pour essuyer la condensation",

      // Work
      "work.eyebrow": "Projets sélectionnés",
      "work.title": "Treize decks. Travaux sélectionnés.",
      "work.lead": "Treize présentations interactives déployées sur six systèmes de design. Chaque projet est un visualiseur web complet navigable au clavier — aucune maquette figée.",
      "work.filter_all": "Tous <span>13</span>",
      "work.filter_pitch": "Pitches & startups <span>3</span>",
      "work.filter_brand": "Services & B2B <span>5</span>",
      "work.filter_system": "Marque & systèmes <span>5</span>",
      "work.count_label": "projets",
      "work.open_deck": "Ouvrir le deck ↗",

      // Case blurbs
      "case.aethel": "Dossier logistique orbital traduisant mécanique spatiale et rentabilité en un briefing limpide pour la direction.",
      "case.ecopack": "Offre commerciale B2B pour chaînes de restauration et secteur HoReCa, axée sur les marges et la conformité écologique.",
      "case.vance": "Feuille de route de redressement à 90 jours pour comité de direction, axée sur l'alignement opérationnel.",
      "case.vertex": "Capacités d'ingénierie et références industrielles conçues pour la qualification aux appels d'offres majeurs.",
      "case.aura": "Proposition stratégique d'agence audio créative pour les grandes marques et expériences immersives.",
      "case.kinesthetic": "Thèse d'interface minimaliste explorant le retour haptique et les systèmes visuels thermiques.",
      "case.bioma": "Dossier d'architecture biophilique et de durabilité destiné aux commissions municipales d'urbanisme.",
      "case.karelia": "Présentation de concept d'éco-hôtellerie nordique et parcours client pour partenaires de développement.",
      "case.black": "Présentation confidentielle de compétences en cybersécurité, gestion de crise et réputation d'entreprise.",
      "case.perfect_shot": "Dossier de sponsoring et récit photojournalistique pour expédition documentaire en Eswatini.",
      "case.cortex": "Briefing de sécurité d'entreprise défendant l'allocation budgétaire et la couverture télémétrique du SOC.",
      "case.novashift": "Briefing exécutif sur l'intégration de la robotique humanoïde et l'automatisation des opérations.",
      "case.project_m": "Qualifications d'ingénierie EPC pour la métallurgie, les mines et les chantiers industriels lourds.",

      // Themes
      "themes.eyebrow": "Systèmes de design",
      "themes.title": "Six identités visuelles.<br>Un même argument.",
      "themes.lead": "Nous refusons les modèles interchangeables. Cliquez sur un thème pour métamorphoser instantanément le site dans ce système visuel — du calme institutionnel au noir cinématographique.",
      "themes.note": "Votre choix de thème est mémorisé sur cet appareil. Lien direct : <code>?theme=ora</code>",

      // Method
      "method.eyebrow": "Méthode",
      "method.idx": "04 phases",
      "method.title": "Notre processus de création",
      "method.step1_num": "Phase 01 · Prise en main & structure",
      "method.step1_h3": "Brief & trame narrative",
      "method.step1_p": "Nous étudions vos brouillons, données brutes ou anciennes présentations. Nous éliminons le superflu pour affûter la thèse centrale.",
      "method.step2_num": "Phase 02 · Direction visuelle",
      "method.step2_h3": "Direction visuelle sur mesure",
      "method.step2_p": "Typographie, palette et grilles de composition sont validées sur 2 à 3 diapositives clés avant d'engager la production globale.",
      "method.step3_num": "Phase 03 · Production intégrale",
      "method.step3_h3": "Conception de l'ensemble",
      "method.step3_p": "Conception méticuleuse de chaque diapositive, graphique et tableau avec une attention rigoureuse à la hiérarchie visuelle.",
      "method.step4_num": "Phase 04 · Livraison complète",
      "method.step4_h3": "Livraison universelle",
      "method.step4_p": "Vous recevez un visualiseur web interactif pour présenter dans le navigateur, un PDF haute résolution et un fichier PPTX modifiable.",
      "method.surface_note": "En option : nous intégrons des Product surfaces — formulaires, alertes Telegram ou Google Sheets reliés à votre flux.",

      // About
      "about.eyebrow": "À propos du studio",
      "about.idx": "Philosophie & exigence",
      "about.title": "Présentations et surfaces digitales conçues pour convaincre.",
      "about.p1": "Qwiqly est un studio indépendant dédié au design de présentations et de landing pages. Nous aidons dirigeants et fondateurs à transformer des idées complexes en récits percutants.",
      "about.p2": "Nous refusons les modèles préconçus sans substance. Chaque deck et landing est forgé à partir du propos — alliant rigueur typographique, lisibilité immédiate des données et performance technique irréprochable.",
      "about.surface": "Au-delà des diapositives, nous concevons des Product surfaces : des interfaces légères connectant vos présentations et landing pages à Telegram, Google Sheets ou des formulaires sur mesure.",
      "about.stat1": "<b>13</b> projets publics en vitrine",
      "about.stat2": "<b>03</b> formats livrés (HTML, PDF, PPTX)",
      "about.stat3": "<b>06</b> systèmes visuels interactifs",
      "about.stat4": "<b>00</b> modèle préfabriqué téléchargé",

      // Contact
      "contact.eyebrow": "Engager la conversation",
      "contact.title": "Parlons de votre prochaine présentation ou landing page.",
      "contact.lead": "Décrivez-nous votre public, l'enjeu ou la date du lancement. Transmettez-nous un brouillon ou un fichier existant pour étudier la meilleure approche.",
      "contact.box_title": "Éléments utiles à préciser :",
      "contact.item1": "Qui est l'audience (investisseurs, clients B2B, conférence) ?",
      "contact.item2": "Nombre approximatif de diapositives ou longueur souhaitée",
      "contact.item3": "État des contenus (brouillon finalisé ou grandes lignes)",
      "contact.item4": "Date limite souhaitée ou jour de la présentation",
      "contact.cta": "Nous écrire ↗",
      "contact.cta_tg": "Telegram ↗",
      "contact.cta_wa": "WhatsApp ↗",
      "contact.ch_mail": "E-mail",
      "contact.ch_tg": "Telegram",
      "contact.ch_wa": "WhatsApp",
      "contact.wa_hint": "WhatsApp : ouvrez l’app et recherchez <b>@qwiqly</b> si le lien ne s’ouvre pas encore.",
      "contact.meta": "<span>Europe / Kyiv</span><span>Collaboration internationale</span><span>Travaux interactifs réels</span>",

      // Footer
      "footer.desc": "Studio de design de présentations & pages de lancement",
      "footer.copy": "© 2026 Studio Qwiqly. Tous droits réservés.",
      "footer.geo": "Europe / Kyiv · Clientèle internationale",
      "footer.to_top": "Haut de page ↑"
    },

    es: {
      "nav.brand_sub": "Presentaciones y páginas de aterrizaje",
      "nav.work": "Proyectos (13)",
      "nav.themes": "Temas (6)",
      "nav.method": "Método",
      "nav.about": "Nosotros",
      "nav.cta": "Escríbenos",

      // Hero Emerald
      "hero.em.eyebrow": "Diseño de presentaciones y landings · Europa / Kiev",
      "hero.em.h1": "Presentaciones y landings<br>con máxima claridad.",
      "hero.em.lead": "Diseñamos pitch decks, páginas de lanzamiento y superficies de producto ligeras para equipos con visión. Argumentos sólidos, sistemas visuales a medida y cero plantillas genéricas.",
      "hero.em.cta_primary": "Ver proyectos (13) ↗",
      "hero.em.cta_secondary": "Escríbenos",
      "hero.em.service_1": "Pitch Decks",
      "hero.em.service_2": "Presentaciones B2B",
      "hero.em.service_3": "Landings de producto",
      "hero.em.service_4": "Product surfaces",
      "hero.em.mascot_badge": "Unit Q / Mecánico del estudio",
      "hero.em.strip": "HTML interactivo en navegador · PDF de alta resolución y PPTX editable · Desplazar ↓",

      // Hero Ora
      "hero.ora.h1": "Decks y páginas<br><em>con carácter.</em>",
      "hero.ora.kicker": "Sistemas visuales e interfaces",
      "hero.ora.lead": "Ritmo visual potente, tipografía contundente y presentaciones interactivas en navegador para fintech, startups y lanzamientos de alto nivel.",
      "hero.ora.cta": "Escríbenos ↗",
      "hero.ora.hint": "Desplaza las cartas ← → o abre a pantalla completa",
      "hero.ora.ticker": "Pitch decks · Landings de producto · Ofertas B2B · Product surfaces · HTML interactivo · PDF y PPTX · 13 proyectos en catálogo · Estudio Qwiqly ·",

      // Hero Pixel
      "hero.px.kicker": "Arcade Qwiqly · 13 proyectos cargados",
      "hero.px.h1": "Artesanía pura.<br><span>Cero clichés.</span>",
      "hero.px.lead": "Sin plantillas automáticas ni relleno. Cada diapositiva y landing se construye a mano con tipografía rigurosa y jerarquía intencional.",
      "hero.px.cta_primary": "Ver proyectos ▶",
      "hero.px.cta_secondary": "Escríbenos",
      "hero.px.hud_mode": "Vista interactiva",

      // Hero Atomic
      "hero.at.sub": "Sistemas de Alta Tecnología e Ingeniería",
      "hero.at.h1": "Ideas complejas,<br>estructura impecable.",
      "hero.at.lead": "Presentaciones y superficies digitales para ciberseguridad, industria pesada y analítica. Transformamos telemetría compleja en lectura directa.",
      "hero.at.cta_primary": "Ver proyectos (13) ↗",
      "hero.at.cta_secondary": "Escríbenos",

      // Hero Onion
      "hero.on.kicker": "Práctica editorial y arquitectónica",
      "hero.on.h1": "Sistemas de orden,<br>hechos para informar.",
      "hero.on.lead": "Tipografía disciplinada, retícula proporcional y lectura serena. Diseñado para consejos de administración, informes corporativos y propuestas decisivas.",
      "hero.on.cta_primary": "Abrir catálogo ↗",
      "hero.on.cta_secondary": "Escríbenos",

      // Hero Coppola
      "hero.cp.kicker": "Puesta en escena para momentos clave",
      "hero.cp.h1": "Cuando la reunión<br>es decisiva.",
      "hero.cp.lead": "Presentaciones cinematográficas de alto contraste y narrativas de lanzamiento para socios estratégicos y negociaciones de alto nivel.",
      "hero.cp.cta_primary": "Explorar proyectos ↗",
      "hero.cp.cta_secondary": "Escríbenos",
      "hero.cp.hint": "Desliza el dedo o cursor para limpiar el cristal",

      // Work
      "work.eyebrow": "Proyectos seleccionados",
      "work.title": "Trece decks. Trabajo seleccionado.",
      "work.lead": "Trece presentaciones interactivas en seis sistemas de diseño. Cada proyecto es un visor web completo navegable con el teclado, no una maqueta estática.",
      "work.filter_all": "Todos <span>13</span>",
      "work.filter_pitch": "Pitches y startups <span>3</span>",
      "work.filter_brand": "Servicios y B2B <span>5</span>",
      "work.filter_system": "Marca y sistemas <span>5</span>",
      "work.count_label": "proyectos",
      "work.open_deck": "Abrir presentación ↗",

      // Case blurbs
      "case.aethel": "Dossier logístico de flota que transforma astrodinámica y economía de carga orbital en un briefing ejecutivo directo.",
      "case.ecopack": "Propuesta comercial B2B para cadenas de restauración y sector HoReCa, con foco en márgenes y cumplimiento ambiental.",
      "case.vance": "Plan de reestructuración a 90 días para alta dirección, diseñado para alinear prioridades operativas.",
      "case.vertex": "Credenciales de ingeniería y construcción pesada orientadas a licitaciones internacionales de infraestructura.",
      "case.aura": "Propuesta de agencia creativa de sonido para marcas globales y producciones de audio inmersivo.",
      "case.kinesthetic": "Tesis minimalista de interfaz que explora retroalimentación táctil y diseño térmico de UI.",
      "case.bioma": "Propuesta arquitectónica biofílica y sostenible presentada ante comités de desarrollo urbano.",
      "case.karelia": "Dossier conceptual de ecoturismo nórdico y experiencia de huésped para socios e inversores.",
      "case.black": "Credenciales de ciberseguridad y gestión de crisis corporativas en rigurosa estética monocromática.",
      "case.perfect_shot": "Propuesta de patrocinio y narrativa fotográfica para rodaje documental en el Reino de Eswatini.",
      "case.cortex": "Presentación técnica y ejecutiva de seguridad para justificar presupuesto y cobertura de telemetría SOC.",
      "case.novashift": "Informe para líderes empresariales sobre integración robótica y automatización operativa.",
      "case.project_m": "Credenciales de contratista EPC para plantas metalúrgicas, minería y obras de industria pesada.",

      // Themes
      "themes.eyebrow": "Sistemas de diseño",
      "themes.title": "Seis pieles de diseño.<br>Un mensaje sólido.",
      "themes.lead": "No creemos en plantillas genéricas. Haz clic en cualquier tema para transformar al instante todo el sitio en ese sistema visual: desde la sobriedad corporativa hasta el noir cinematográfico.",
      "themes.note": "El tema seleccionado se guarda en tu navegador. Puedes compartir un enlace directo con <code>?theme=ora</code>",

      // Method
      "method.eyebrow": "Proceso",
      "method.idx": "04 fases",
      "method.title": "Cómo trabajamos",
      "method.step1_num": "Fase 01 · Asimilación y estructura",
      "method.step1_h3": "Briefing y mensaje clave",
      "method.step1_p": "Analizamos tu borrador, notas o presentación actual. Identificamos a la audiencia, quitamos el relleno y fijamos el mensaje central.",
      "method.step2_num": "Fase 02 · Dirección visual",
      "method.step2_h3": "Dirección visual personalizada",
      "method.step2_p": "Tipografía, paleta de color y retícula se definen y aprueban sobre 2 o 3 diapositivas clave antes de producir el proyecto entero.",
      "method.step3_num": "Fase 03 · Producción integral",
      "method.step3_h3": "Maquetación de pantallas",
      "method.step3_p": "Maquetación detallada de todas las diapositivas, gráficos y tablas con máxima atención a la jerarquía y legibilidad.",
      "method.step4_num": "Fase 04 · Entrega completa",
      "method.step4_h3": "Entrega universal",
      "method.step4_p": "Recibes un visor web interactivo para presentar en el navegador, un PDF vectorial de alta resolución y un PPTX editable.",
      "method.surface_note": "Opcional: Desarrollamos Product surfaces — formularios, avisos de Telegram o Google Sheets conectados a tu presentación.",

      // About
      "about.eyebrow": "Sobre el estudio",
      "about.idx": "Filosofía y oficio",
      "about.title": "Presentaciones y superficies digitales diseñadas para convencer.",
      "about.p1": "Qwiqly es un estudio independiente especializado en diseño de presentaciones y páginas de aterrizaje. Ayudamos a líderes y fundadores a convertir ideas complejas en narrativas de alto impacto.",
      "about.p2": "Rechazamos las plantillas prediseñadas impersonales. Cada presentación y landing se construye desde el argumento: con disciplina tipográfica, métricas legibles al segundo y rendimiento técnico impecable.",
      "about.surface": "Más allá de las diapositivas, desarrollamos Product surfaces: interfaces ligeras que conectan tu presentación o landing con Telegram, Google Sheets o formularios a medida.",
      "about.stat1": "<b>13</b> proyectos públicos en vitrina",
      "about.stat2": "<b>03</b> formatos de entrega (HTML, PDF, PPTX)",
      "about.stat3": "<b>06</b> sistemas de diseño interactivos",
      "about.stat4": "<b>00</b> plantillas prediseñadas descargadas",

      // Contact
      "contact.eyebrow": "Iniciar conversación",
      "contact.title": "Conversemos sobre tu próxima presentación o landing page.",
      "contact.lead": "Cuéntanos sobre tu audiencia, el objetivo o la fecha de lanzamiento. Envíanos un borrador o archivo previo para proponerte el mejor enfoque.",
      "contact.box_title": "Detalles útiles para comenzar:",
      "contact.item1": "¿Quién es la audiencia (inversores, clientes B2B, conferencia)?",
      "contact.item2": "Número aproximado de diapositivas o extensión",
      "contact.item3": "Estado del contenido (borrador listo o puntos clave)",
      "contact.item4": "Fecha límite deseada o día de la presentación",
      "contact.cta": "Escríbenos ↗",
      "contact.cta_tg": "Telegram ↗",
      "contact.cta_wa": "WhatsApp ↗",
      "contact.ch_mail": "Email",
      "contact.ch_tg": "Telegram",
      "contact.ch_wa": "WhatsApp",
      "contact.wa_hint": "WhatsApp: abre la app y busca <b>@qwiqly</b> si el enlace aún no resuelve.",
      "contact.meta": "<span>Europa / Kiev</span><span>Colaboración internacional</span><span>Proyectos interactivos reales</span>",

      // Footer
      "footer.desc": "Estudio de diseño de presentaciones y páginas de aterrizaje",
      "footer.copy": "© 2026 Estudio Qwiqly. Todos los derechos reservados.",
      "footer.geo": "Europa / Kiev · Clientes en todo el mundo",
      "footer.to_top": "Volver arriba ↑"
    }
  };

  // Cache initial English text as the master baseline
  var enMaster = {};

  function initMasterStrings() {
    var nodes = document.querySelectorAll('[data-i18n]');
    nodes.forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (!enMaster[key]) {
        enMaster[key] = el.innerHTML;
      }
    });
  }

  function applyLanguage(lang) {
    if (!lang || ['en', 'de', 'fr', 'es'].indexOf(lang) === -1) {
      lang = 'en';
    }

    var dict = (lang === 'en') ? enMaster : (translations[lang] || {});
    var nodes = document.querySelectorAll('[data-i18n]');
    
    nodes.forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (dict && dict[key] !== undefined) {
        el.innerHTML = dict[key];
      } else if (enMaster[key] !== undefined) {
        el.innerHTML = enMaster[key];
      }
    });

    document.documentElement.lang = lang;
    
    // Update active states on switcher buttons
    var buttons = document.querySelectorAll('[data-lang-set]');
    buttons.forEach(function(btn) {
      var match = btn.getAttribute('data-lang-set') === lang;
      btn.setAttribute('aria-pressed', match ? 'true' : 'false');
    });

    try {
      localStorage.setItem('qwiqly_lang', lang);
    } catch(e) {}
  }

  // Detect initial language
  var urlParam = (new URLSearchParams(window.location.search)).get('lang');
  var storedLang;
  try {
    storedLang = localStorage.getItem('qwiqly_lang');
  } catch(e) {}
  
  var activeLang = urlParam || storedLang || 'en';

  window.addEventListener('DOMContentLoaded', function() {
    initMasterStrings();

    // Bind click events on switcher buttons
    document.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-lang-set]');
      if (btn) {
        var newLang = btn.getAttribute('data-lang-set');
        applyLanguage(newLang);
      }
    });

    if (activeLang !== 'en') {
      applyLanguage(activeLang);
    }
  });

  window.__setLanguage = applyLanguage;
})();
