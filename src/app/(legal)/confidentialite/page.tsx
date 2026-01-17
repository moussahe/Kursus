import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialite | Kursus",
  description:
    "Politique de confidentialite et protection des donnees de Kursus.",
};

export default function ConfidentialitePage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Politique de Confidentialite</h1>
      <p className="lead">
        Derniere mise a jour : {new Date().toLocaleDateString("fr-FR")}
      </p>

      <h2>1. Introduction</h2>
      <p>
        Kursus s&apos;engage a proteger la vie privee de ses utilisateurs, en
        particulier celle des mineurs. Cette politique explique comment nous
        collectons, utilisons et protegeons vos donnees personnelles.
      </p>

      <h2>2. Responsable du traitement</h2>
      <p>
        Le responsable du traitement des donnees est Kursus SAS, dont le siege
        social est situe en France.
      </p>

      <h2>3. Donnees collectees</h2>
      <h3>3.1 Donnees d&apos;inscription</h3>
      <ul>
        <li>Nom et prenom</li>
        <li>Adresse email</li>
        <li>Mot de passe (chiffre)</li>
        <li>Role (parent, enseignant)</li>
      </ul>

      <h3>3.2 Donnees des enfants</h3>
      <ul>
        <li>Prenom</li>
        <li>Niveau scolaire</li>
        <li>Progression dans les cours</li>
      </ul>
      <p>
        <strong>Note importante</strong> : Nous minimisons la collecte de
        donnees sur les mineurs. Nous ne collectons jamais de photos, adresses
        postales ou numéros de telephone des enfants.
      </p>

      <h3>3.3 Donnees de paiement</h3>
      <p>
        Les paiements sont traites par Stripe. Nous ne stockons pas les donnees
        de carte bancaire sur nos serveurs.
      </p>

      <h2>4. Finalites du traitement</h2>
      <p>Vos donnees sont utilisees pour :</p>
      <ul>
        <li>Gerer votre compte et vous authentifier</li>
        <li>Fournir les services educatifs</li>
        <li>Traiter les paiements</li>
        <li>Suivre la progression des élèves</li>
        <li>Ameliorer nos services</li>
        <li>Vous contacter (support, notifications)</li>
      </ul>

      <h2>5. Base legale</h2>
      <p>Le traitement de vos donnees repose sur :</p>
      <ul>
        <li>L&apos;execution du contrat (fourniture des services)</li>
        <li>Le consentement (pour les communications marketing)</li>
        <li>L&apos;interet legitime (amelioration des services)</li>
        <li>
          Le consentement parental pour les donnees des mineurs de moins de 15
          ans
        </li>
      </ul>

      <h2>6. Partage des donnees</h2>
      <p>Vos donnees peuvent etre partagees avec :</p>
      <ul>
        <li>
          <strong>Stripe</strong> : pour le traitement des paiements
        </li>
        <li>
          <strong>Supabase</strong> : hebergement de la base de donnees
        </li>
        <li>
          <strong>Railway</strong> : hebergement de l&apos;application
        </li>
        <li>
          <strong>Anthropic</strong> : pour le tuteur IA (donnees anonymisees)
        </li>
      </ul>
      <p>
        Nous ne vendons jamais vos donnees a des tiers a des fins commerciales.
      </p>

      <h2>7. Duree de conservation</h2>
      <ul>
        <li>Donnees de compte : duree de vie du compte + 3 ans</li>
        <li>Donnees de paiement : 10 ans (obligations legales)</li>
        <li>Donnees de progression : duree de vie du compte</li>
        <li>Logs techniques : 12 mois</li>
      </ul>

      <h2>8. Vos droits</h2>
      <p>Conformement au RGPD, vous disposez des droits suivants :</p>
      <ul>
        <li>
          <strong>Acces</strong> : obtenir une copie de vos donnees
        </li>
        <li>
          <strong>Rectification</strong> : corriger vos donnees
        </li>
        <li>
          <strong>Effacement</strong> : supprimer vos donnees
        </li>
        <li>
          <strong>Portabilite</strong> : recevoir vos donnees dans un format
          standard
        </li>
        <li>
          <strong>Opposition</strong> : vous opposer a certains traitements
        </li>
        <li>
          <strong>Limitation</strong> : limiter le traitement
        </li>
      </ul>
      <p>
        Pour exercer ces droits, contactez-nous a{" "}
        <a href="mailto:privacy@kursus.fr">privacy@kursus.fr</a>.
      </p>

      <h2>9. Securite</h2>
      <p>Nous mettons en oeuvre des mesures de securite appropriees :</p>
      <ul>
        <li>Chiffrement des donnees en transit (HTTPS/TLS)</li>
        <li>Chiffrement des mots de passe (bcrypt)</li>
        <li>Acces restreint aux donnees</li>
        <li>Surveillance et logs de securite</li>
        <li>Sauvegardes regulieres</li>
      </ul>

      <h2>10. Cookies</h2>
      <p>Nous utilisons des cookies essentiels pour :</p>
      <ul>
        <li>Maintenir votre session de connexion</li>
        <li>Memoriser vos preferences</li>
      </ul>
      <p>Nous n&apos;utilisons pas de cookies de tracking publicitaire.</p>

      <h2>11. Transferts internationaux</h2>
      <p>
        Certains de nos prestataires sont situes hors de l&apos;UE. Les
        transferts sont encadres par des clauses contractuelles types ou des
        decisions d&apos;adequation.
      </p>

      <h2>12. Modifications</h2>
      <p>
        Cette politique peut etre modifiee. En cas de modification
        substantielle, nous vous en informerons par email.
      </p>

      <h2>13. Contact</h2>
      <p>
        Pour toute question sur cette politique, contactez notre DPO a{" "}
        <a href="mailto:privacy@kursus.fr">privacy@kursus.fr</a>.
      </p>
      <p>
        Vous pouvez egalement introduire une reclamation aupres de la CNIL si
        vous estimez que vos droits ne sont pas respectes.
      </p>
    </article>
  );
}
