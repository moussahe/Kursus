"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/courses", label: "Cours" },
  { href: "/subjects", label: "Matières" },
  { href: "/levels", label: "Niveaux" },
  { href: "/teachers", label: "Enseignants" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  return (
    <>
      <header
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/95 shadow-sm backdrop-blur-sm"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="Schoolaris Home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Schoolaris
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-8 lg:flex">
              {!isSearchOpen &&
                navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                  >
                    {link.label}
                    <span className="absolute bottom-[-4px] left-0 h-0.5 w-full origin-center scale-x-0 bg-emerald-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  </Link>
                ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex items-center">
                <AnimatePresence>
                  {isSearchOpen && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="hidden sm:block"
                    >
                      <input
                        type="text"
                        placeholder="Rechercher un cours..."
                        className="w-48 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={toggleSearch}
                  aria-label="Toggle Search"
                  className="rounded-xl p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-emerald-600"
                >
                  {isSearchOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Auth Buttons - Desktop */}
              <div className="hidden items-center gap-3 lg:flex">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href="/demo"
                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-300"
                  >
                    Essai Gratuit
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href="/login"
                    className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:border-gray-300"
                  >
                    Connexion
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href="/register"
                    className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
                  >
                    S&apos;inscrire
                  </Link>
                </motion.div>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  onClick={toggleMenu}
                  aria-label="Open menu"
                  className="rounded-xl p-2 hover:bg-gray-100"
                >
                  <Menu className="h-6 w-6 text-gray-900" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-white lg:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Mobile Header */}
              <div className="flex items-center justify-between border-b border-gray-100 p-4">
                <Link
                  href="/"
                  className="flex items-center gap-3"
                  onClick={toggleMenu}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    Schoolaris
                  </span>
                </Link>
                <button
                  onClick={toggleMenu}
                  aria-label="Close menu"
                  className="rounded-xl p-2 hover:bg-gray-100"
                >
                  <X className="h-6 w-6 text-gray-900" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="flex flex-grow flex-col items-center justify-center gap-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={toggleMenu}
                      className="text-2xl font-medium text-gray-900 transition-colors hover:text-emerald-600"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-3 border-t border-gray-100 p-6">
                <Link
                  href="/demo"
                  onClick={toggleMenu}
                  className="w-full rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-center text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Essai Gratuit
                </Link>
                <Link
                  href="/login"
                  onClick={toggleMenu}
                  className="w-full rounded-xl border border-gray-200 bg-white px-6 py-3.5 text-center text-base font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={toggleMenu}
                  className="w-full rounded-xl bg-emerald-500 px-6 py-3.5 text-center text-base font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600"
                >
                  S&apos;inscrire
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
