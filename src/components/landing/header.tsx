"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  Menu,
  X,
  GraduationCap,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/courses", label: "Cours" },
  { href: "/courses#subjects", label: "Matières" },
  { href: "/courses#levels", label: "Niveaux" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

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
            ? "backdrop-blur-xl border-b bg-background/80 border-border"
            : "bg-transparent",
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3"
              aria-label="Kursus Home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff9494] to-[#ffb8b8]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Kursus</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-8 lg:flex">
              {!isSearchOpen &&
                navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                    <span className="absolute bottom-[-4px] left-0 h-0.5 w-full origin-center scale-x-0 bg-gradient-to-r from-[#ff9494] to-[#ff9494] transition-transform duration-300 ease-out group-hover:scale-x-100" />
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
                        className="w-48 rounded-xl border border-border bg-muted px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-[#ff9494]/50 focus:bg-background focus:outline-none focus:ring-1 focus:ring-[#ff9494]/50"
                        autoFocus
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={toggleSearch}
                  aria-label="Toggle Search"
                  className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-[#ff9494]"
                >
                  {isSearchOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                }
                aria-label="Basculer le theme"
                className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-[#ff9494]"
                suppressHydrationWarning
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute left-2 top-2 h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
              </button>

              {/* Auth Buttons - Desktop */}
              <div className="hidden items-center gap-3 lg:flex">
                {/* Devenir Prof - Highlighted */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href="/devenir-prof"
                    className="flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-all border-[var(--kursus-purple-border)] bg-[var(--kursus-purple-bg)] text-[var(--kursus-purple-text)] hover:opacity-80"
                  >
                    <GraduationCap className="h-4 w-4" />
                    Devenir Prof
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Link
                    href="/login"
                    className="rounded-full border border-border bg-muted px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent"
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
                    className="rounded-full bg-[#ff9494] px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition-all hover:bg-[#ffb8b8] hover:shadow-[0_0_30px_-5px_rgba(255,109,56,0.4)]"
                  >
                    Commencer
                  </Link>
                </motion.div>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  onClick={toggleMenu}
                  aria-label="Open menu"
                  className="rounded-xl p-2 text-foreground hover:bg-muted"
                >
                  <Menu className="h-6 w-6" />
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
            className="fixed inset-0 z-50 bg-background lg:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Mobile Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <Link
                  href="/"
                  className="flex items-center gap-3"
                  onClick={toggleMenu}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff9494] to-[#ffb8b8]">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-foreground">
                    Kursus
                  </span>
                </Link>
                <button
                  onClick={toggleMenu}
                  aria-label="Close menu"
                  className="rounded-xl p-2 text-foreground hover:bg-muted"
                >
                  <X className="h-6 w-6" />
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
                      className="text-2xl font-medium text-foreground transition-colors hover:text-[#ff9494]"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Mobile Auth Buttons */}
              <div className="flex flex-col gap-3 border-t border-border p-6">
                <Link
                  href="/devenir-prof"
                  onClick={toggleMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-base font-medium transition-all border-[var(--kursus-purple-border)] bg-[var(--kursus-purple-bg)] text-[var(--kursus-purple-text)] hover:opacity-80"
                >
                  <GraduationCap className="h-5 w-5" />
                  Devenir Prof
                </Link>
                <Link
                  href="/login"
                  onClick={toggleMenu}
                  className="w-full rounded-full border border-border bg-muted px-6 py-3.5 text-center text-base font-medium text-foreground transition-all hover:bg-accent"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={toggleMenu}
                  className="w-full rounded-full bg-[#ff9494] px-6 py-3.5 text-center text-base font-semibold text-white transition-all hover:bg-[#ffb8b8]"
                >
                  Commencer gratuitement
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
