import React from 'react';
import { Mail, Github, Linkedin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white border-t mt-8 sm:mt-16">     
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          <div className="space-y-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <img
                alt="StageQuest Logo"
                className="h-8 w-auto"
                src="https://images.unsplash.com/photo-1532759238051-32b615b1efb8"
              />
              <span className="font-bold text-xl">StageQuest</span>
            </div>
            <p className="text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>{t("We don't offer listings—we place you inside. \n Real internships, real companies, real experience. \n You're not browsing. You're building.")}</p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-8 w-full sm:w-auto">
            <div>
              <h3 className="font-semibold mb-3 sm:mb-4">{t('Quick Links')}</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#services" className="text-muted-foreground hover:text-foreground">
                    {t('header.services')}
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-muted-foreground hover:text-foreground">
                    {t('about.title')}
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-muted-foreground hover:text-foreground">
                    {t('faq.title')}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3 sm:mb-4">{t('Contact')}</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <a href="mailto:hello@stagequest.com" className="text-muted-foreground hover:text-foreground">
                    hello@stagequest.com
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="font-semibold mb-3 sm:mb-4">{t('Follow Us')}</h3>
              <div className="flex gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-6 sm:mt-8 pt-6 sm:pt-8">
          <p className="text-muted-foreground italic text-center w-full" 
             style={{ 
               fontFamily: "'Times New Roman', serif", 
               fontSize: "clamp(1.25rem, 4vw, 1.875rem)", 
               fontStyle: "italic", 
               opacity: 0.6 
             }}>
            {t("You're not browsing. You're building.")}
          </p>       
        </div>
      </div>
    </footer>
  );
}