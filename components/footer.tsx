"use client"

import { Mail, Phone, Linkedin, Instagram, Github, Twitter, Shield } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const contactInfo = {
    email: "ahmadraja984821@gmail.com",
    phone: "+91 9014480783",
    linkedin: "https://www.linkedin.com/in/ahmad-raja-sk-18ba6731a/",
    instagram: "https://instagram.com/raja_ahmad_raja"
  }

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-sm text-foreground">CyberPhish</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Advanced cybersecurity platform for phishing detection and threat intelligence. Protect your digital assets with AI-powered security.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/scanner" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Scanner
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Analytics
                </Link>
              </li>
              <li>
                <Link href="/training" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Training
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Security Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Contact</h3>
            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-muted-foreground" />
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {contactInfo.email}
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <a 
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href={contactInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-3 h-3 text-foreground" />
                </a>
                <a
                  href={contactInfo.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-6 h-6 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-3 h-3 text-foreground" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © {currentYear} CyberPhish. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
