"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Twitter,
  Github,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  CheckCircle,
} from "lucide-react";

const footerLinks = {
  platform: {
    title: "Plateforme",
    links: [
      { href: "/courses", label: "Tous les cours" },
      { href: "/courses?prix=0", label: "Cours gratuits" },
      { href: "/courses?matiere=MATHEMATIQUES", label: "Mathématiques" },
      { href: "/courses?matiere=FRANCAIS", label: "Français" },
      { href: "/community", label: "Communauté" },
    ],
  },
  teachers: {
    title: "Enseignants",
    links: [
      { href: "/register/teacher", label: "Devenir créateur" },
      { href: "/teacher", label: "Espace enseignant" },
      { href: "/teacher/courses", label: "Mes cours" },
      { href: "/teacher/analytics", label: "Statistiques" },
    ],
  },
  parents: {
    title: "Parents",
    links: [
      { href: "/register", label: "Créer un compte" },
      { href: "/parent", label: "Espace parent" },
      { href: "/parent/children", label: "Mes enfants" },
      { href: "/parent/purchases", label: "Mes achats" },
    ],
  },
  legal: {
    title: "Légal",
    links: [
      { href: "/conditions", label: "Conditions d'utilisation" },
      { href: "/confidentialite", label: "Politique de confidentialite" },
    ],
  },
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsSubscribed(true);
    setIsLoading(false);
  };

  return (
    <footer className="w-full bg-gray-900">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-bold text-white">
                Restez informe des nouveautes
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Recevez nos meilleurs cours et conseils chaque semaine.
              </p>
            </div>
            <AnimatePresence mode="wait">
              {isSubscribed ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 rounded-xl bg-emerald-500/10 px-6 py-3"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">
                    Merci ! Vous etes inscrit a notre newsletter.
                  </span>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleNewsletterSubmit}
                  className="flex w-full max-w-md gap-3"
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Votre adresse email"
                    required
                    className="flex-1 rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:opacity-70"
                  >
                    {isLoading ? "..." : "S'inscrire"}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Schoolaris</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
              La plateforme qui connecte les meilleurs enseignants avec les
              élèves qui veulent réussir. De la primaire au lycée.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-emerald-500" />
                contact@schoolaris.fr
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="h-4 w-4 text-emerald-500" />
                01 23 45 67 89
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 text-emerald-500" />
                Paris, France
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-800 text-gray-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-500"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition-colors hover:text-emerald-500"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download & Payment */}
        <div className="mt-12 flex flex-col items-center justify-between gap-8 border-t border-gray-800 pt-8 lg:flex-row">
          {/* App Badges */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <span className="text-sm text-gray-400">
              Bientot disponible sur
            </span>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm text-white">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                App Store
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-gray-800 px-4 py-2 text-sm text-white">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                Play Store
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <span className="text-sm text-gray-400">Paiements sécurisés</span>
            <div className="flex gap-2">
              {/* Visa */}
              <div className="flex h-8 w-12 items-center justify-center rounded bg-white px-2">
                <svg viewBox="0 0 48 32" className="h-5 w-auto">
                  <path
                    fill="#1A1F71"
                    d="M20.8 22.4l1.9-11.5h3l-1.9 11.5h-3zm12.1-11.2c-.6-.2-1.5-.5-2.7-.5-3 0-5.1 1.5-5.1 3.7 0 1.6 1.5 2.5 2.6 3 1.2.6 1.6.9 1.6 1.4 0 .8-.9 1.1-1.8 1.1-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.5c.7.3 2.1.6 3.5.6 3.2 0 5.3-1.5 5.3-3.8 0-1.3-.8-2.3-2.5-3.1-1-.5-1.7-.9-1.7-1.4 0-.5.5-1 1.7-1 1 0 1.7.2 2.3.4l.3.1.4-2.2zm7.8-.3h-2.3c-.7 0-1.3.2-1.6 1l-4.5 10.5h3.2s.5-1.4.6-1.7h3.9c.1.4.4 1.7.4 1.7h2.8l-2.5-11.5zm-3.7 7.4c.3-.7 1.2-3.3 1.2-3.3s.3-.7.4-1.1l.2 1s.6 2.8.7 3.4h-2.5zM18.6 10.9l-2.8 7.8-.3-1.5c-.5-1.7-2.1-3.6-3.9-4.5l2.7 10.6h3.2l4.8-12.4h-3.7z"
                  />
                  <path
                    fill="#F9A533"
                    d="M12.6 10.9H7.5l-.1.3c3.8.9 6.3 3.2 7.4 5.9l-1.1-5.2c-.2-.8-.8-1-1.1-1z"
                  />
                </svg>
              </div>
              {/* Mastercard */}
              <div className="flex h-8 w-12 items-center justify-center rounded bg-white px-2">
                <svg viewBox="0 0 48 32" className="h-5 w-auto">
                  <circle cx="18" cy="16" r="10" fill="#EB001B" />
                  <circle cx="30" cy="16" r="10" fill="#F79E1B" />
                  <path
                    d="M24 8.5c2.5 2 4 5 4 8.5s-1.5 6.5-4 8.5c-2.5-2-4-5-4-8.5s1.5-6.5 4-8.5z"
                    fill="#FF5F00"
                  />
                </svg>
              </div>
              {/* Stripe */}
              <div className="flex h-8 w-12 items-center justify-center rounded bg-[#635BFF] px-2">
                <svg viewBox="0 0 60 25" className="h-4 w-auto">
                  <path
                    fill="#fff"
                    d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32c-1.14.58-2.77 1.05-4.55 1.05-4.66 0-7.2-2.93-7.2-7.32 0-4.08 2.48-7.35 6.64-7.35 4.08 0 5.97 3.14 5.97 7.35 0 .49-.03.99-.05 1.35zm-5.92-5.62c-1.33 0-2.31.98-2.51 2.72h4.87c-.03-1.6-.79-2.72-2.36-2.72zm-12.93 11.44h-4.51V6.15h4.51v14zm-9.37 0h-4.51V6.15h4.51v14zm-9.38 0H17.5V.7h4.54v19.4zM12.08 13.6c0 4.08-2.6 6.65-6.38 6.65-1.74 0-3.28-.53-4.4-1.4l.11-3.47c1.08.79 2.28 1.26 3.68 1.26 1.47 0 2.44-.72 2.44-2.15 0-1.47-.97-2.15-2.44-2.15-.95 0-1.87.26-2.68.63l-.11-8.26h8.67v3.45h-4.65l.05 1.86c.32-.05.69-.1 1.08-.1 3.45 0 4.63 2.23 4.63 3.68z"
                  />
                </svg>
              </div>
              {/* PayPal */}
              <div className="flex h-8 w-12 items-center justify-center rounded bg-white px-2">
                <svg viewBox="0 0 48 32" className="h-5 w-auto">
                  <path
                    fill="#253B80"
                    d="M19.5 8h6.2c3.2 0 4.5 1.6 4.3 4-.4 4.4-3.2 6.8-6.8 6.8h-1.7c-.5 0-1 .4-1.1.9l-.9 5.5c-.1.4-.4.7-.8.7H15l3.5-17c.1-.6.5-.9 1-.9z"
                  />
                  <path
                    fill="#179BD7"
                    d="M35 8.2c-.4 4.4-3.2 6.6-6.8 6.6h-1.7c-.5 0-1 .4-1.1.9l-1.3 8.1c-.1.3.2.6.5.6h3.5c.5 0 .9-.3 1-.8l.7-4.5c.1-.5.5-.8 1-.8h.7c3.3 0 5.9-2.2 6.3-5.5.2-1.6-.3-2.9-1.3-3.8-.4-.4-.9-.6-1.5-.8z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Schoolaris. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <button className="text-sm text-gray-500 hover:text-white">
              Français (FR)
            </button>
            <button className="text-sm text-gray-500 hover:text-white">
              EUR
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
