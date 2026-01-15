import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions d'utilisation | Schoolaris",
  description:
    "Conditions générales d'utilisation de la plateforme Schoolaris.",
};

export default function ConditionsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Conditions Generales d&apos;Utilisation</h1>
      <p className="lead">
        Derniere mise a jour : {new Date().toLocaleDateString("fr-FR")}
      </p>

      <h2>1. Objet</h2>
      <p>
        Les presentes Conditions Generales d&apos;Utilisation (CGU) ont pour
        objet de definir les modalites d&apos;acces et d&apos;utilisation de la
        plateforme Schoolaris, accessible a l&apos;adresse
        schoolaris-production.up.railway.app (ci-apres &quot;la
        Plateforme&quot;).
      </p>
      <p>
        Schoolaris est une marketplace de cours scolaires mettant en relation
        des enseignants (createurs de contenu) et des familles (parents et
        élèves).
      </p>

      <h2>2. Acceptation des CGU</h2>
      <p>
        L&apos;utilisation de la Plateforme implique l&apos;acceptation pleine
        et entiere des presentes CGU. Si vous n&apos;acceptez pas ces
        conditions, vous ne devez pas utiliser la Plateforme.
      </p>

      <h2>3. Description des services</h2>
      <h3>3.1 Pour les enseignants</h3>
      <p>Les enseignants peuvent :</p>
      <ul>
        <li>Creer et publier des cours educatifs</li>
        <li>Fixer librement le prix de leurs cours</li>
        <li>Percevoir 85% du prix de vente de chaque cours</li>
        <li>Suivre leurs statistiques et revenus</li>
      </ul>

      <h3>3.2 Pour les parents</h3>
      <p>Les parents peuvent :</p>
      <ul>
        <li>Parcourir le catalogue de cours</li>
        <li>Acheter des cours pour leurs enfants</li>
        <li>Suivre la progression de leurs enfants</li>
        <li>Acceder a un tuteur IA 24/7</li>
      </ul>

      <h2>4. Inscription et compte</h2>
      <p>
        L&apos;acces a certaines fonctionnalites necessite la creation d&apos;un
        compte. Vous vous engagez a fournir des informations exactes et a les
        maintenir a jour.
      </p>
      <p>
        Vous etes responsable de la confidentialite de vos identifiants de
        connexion et de toute activité effectuee sous votre compte.
      </p>

      <h2>5. Tarification</h2>
      <ul>
        <li>
          <strong>Inscription</strong> : Gratuite
        </li>
        <li>
          <strong>Modele</strong> : Achat a l&apos;unite (pas d&apos;abonnement)
        </li>
        <li>
          <strong>Acces</strong> : A vie apres achat
        </li>
        <li>
          <strong>Commission plateforme</strong> : 15%
        </li>
        <li>
          <strong>Reversement enseignant</strong> : 85%
        </li>
      </ul>

      <h2>6. Propriete intellectuelle</h2>
      <p>
        Les contenus des cours restent la propriete de leurs auteurs. En
        publiant sur Schoolaris, les enseignants accordent a la plateforme une
        licence non exclusive pour diffuser leurs contenus.
      </p>
      <p>
        L&apos;achat d&apos;un cours confere un droit d&apos;usage personnel et
        non cessible. Toute reproduction ou redistribution est interdite.
      </p>

      <h2>7. Protection des mineurs</h2>
      <p>
        Schoolaris s&apos;engage a proteger les donnees des mineurs conformement
        au RGPD et aux lois francaises. Les enfants de moins de 15 ans ne
        peuvent utiliser la plateforme qu&apos;avec le consentement parental.
      </p>

      <h2>8. Responsabilites</h2>
      <p>
        Schoolaris agit en tant qu&apos;intermediaire et ne peut etre tenu
        responsable du contenu publie par les enseignants. Tout contenu
        inapproprie peut etre signale et sera examine.
      </p>

      <h2>9. Modification des CGU</h2>
      <p>
        Schoolaris se reserve le droit de modifier les presentes CGU. Les
        utilisateurs seront informes de toute modification substantielle.
      </p>

      <h2>10. Droit applicable</h2>
      <p>
        Les presentes CGU sont soumises au droit francais. En cas de litige, les
        tribunaux francais seront seuls competents.
      </p>

      <h2>Contact</h2>
      <p>
        Pour toute question concernant ces CGU, contactez-nous a{" "}
        <a href="mailto:contact@schoolaris.fr">contact@schoolaris.fr</a>.
      </p>
    </article>
  );
}
