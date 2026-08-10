/**
 * forms-data.js
 * -----------------------------------------------------------------------
 * Canonical 13-item consent form taxonomy (Patient Case History intake +
 * 12 procedure consent forms), in the exact order specified by the
 * clinic. Each form has an `id` used to key into locales/translations.json
 * ("forms.<id>"). If a language isn't present for a given form's clauses
 * in translations.json, the UI falls back to the English `fallback` block
 * below and shows a small "translation pending" badge (see
 * i18n.js -> formContent / app.js -> renderConsentBody).
 *
 * The FINANCIAL_CLAUSE block is appended to every form (fallback and
 * translated) at render time by app.js — do not duplicate it per form.
 *
 * To add a form: push an object here in the desired position, then
 * (optionally) add a matching "forms.<id>" block to translations.json
 * for full multi-language coverage. No other code changes are required.
 * -----------------------------------------------------------------------
 */

// icon keys map to inline SVGs defined in ICON_SET (js/app.js)
const CONSENT_FORMS = [
  {
    id: "dental_examination",
    name: "Dental Examination",
    icon: "examination",
    fallback: {
      title: "Dental Examination Consent Form",
      purpose: "This dental examination evaluates the health of your teeth, gums, and oral tissues. The procedure includes a visual inspection of the mouth, the recording of clinical findings (dental charting), radiographs (X-rays) if necessary, and any other diagnostic tests the dentist deems essential.",
      sections: [
        { heading: "Important Information", body: "The examination identifies dental problems and helps the dentist plan your treatment. The dentist will not perform surgical or operative treatments without your additional consent. Radiographs involve minimal radiation and are only used when necessary. You may ask questions at any time during the process, and you have the right to withdraw your consent at any stage." },
        { heading: "Confidentiality", body: "The clinic keeps all examination results confidential. We use this information solely for diagnosis and treatment planning." }
      ],
      acknowledgment: "I authorize the dentist and the staff at the clinic to perform the dental examination described above. I have read and understood this information, and the dentist has answered my questions to my satisfaction."
    }
  },
  {
    id: "dental_imaging_radiology",
    name: "Dental Imaging / Radiology",
    icon: "imaging",
    checklist: ["Periapical", "Bitewing", "Occlusal", "Panoramic / OPG", "Cephalometric", "CBCT"],
    checklistLabel: "Required Radiographs",
    fallback: {
      title: "Dental Imaging / Radiology Consent Form",
      purpose: "The dentist uses dental radiographs (X-rays) to diagnose tooth decay, bone loss, and infections; to plan treatments such as fillings, root canals, extractions, or implants; and to monitor your dental health and bone conditions over time.",
      sections: [
        // Note: deliberately does NOT mention lead aprons/thyroid collars, per the
        // clinic's explicit content instruction — replaced with "safe and minimal
        // radiation" wording instead.
        { heading: "Patient Guidelines", body: "Our in-house radiographs are digital images that use a safe and minimal amount of radiation. These images are necessary for accurate diagnosis and treatment, and the clinic keeps them in your confidential dental record for future reference. Important: please tell the dentist if you are, or suspect you may be, pregnant, before the procedure begins." }
      ],
      acknowledgment: "I have read this document and understand the benefits and risks of dental radiographs. I have had the opportunity to ask questions, and I consent to the recommended dental X-rays."
    }
  },
  {
    id: "restorations_fillings",
    name: "Restorations / Fillings",
    icon: "restoration",
    materialOptions: ["Tooth-coloured (composite)", "Silver amalgam", "Inlays / Onlays / Veneers", "Crowns / Bridges", "Other"],
    fallback: {
      title: "Dental Restorations Consent Form",
      purpose: "The dentist will perform restorative treatment to repair teeth that are decayed, fractured, or defective. This treatment restores the form, function, and appearance of the teeth.",
      sections: [
        { heading: "What You Should Know", body: "Dental restorations may not last indefinitely and may require repair or replacement over time. Local anaesthesia causes temporary numbness or tingling, and allergic reactions are rare but possible. You may experience temporary sensitivity to temperature or pressure after the procedure. Despite precautions, complications such as pain, pulp inflammation, tooth fracture, or the need for a root canal may occur. The dentist has explained alternative options, including the risks of refusing treatment, along with the expected cost and estimated duration of treatment." },
        { heading: "Your Responsibilities", body: "To ensure the success of the restoration, I agree to maintain excellent oral hygiene and attend regular check-ups, inform the dentist of any changes to my medical history or medications, and follow all post-operative instructions carefully." }
      ],
      acknowledgment: "I have asked all my questions regarding this restoration treatment and received satisfactory answers, and I authorize the dentist and the dental team to perform the planned procedures."
    }
  },
  {
    id: "root_canal_treatment",
    name: "Root Canal Treatment",
    icon: "root_canal",
    fallback: {
      title: "Root Canal Treatment (RCT) Consent Form",
      purpose: "Root canal treatment removes infected or inflamed pulp tissue from inside a tooth to relieve pain and prevent extraction.",
      sections: [
        { heading: "Procedure", body: "The tooth will be numbed, the infected pulp removed, the canal(s) cleaned, shaped and sealed. Multiple visits may be required." },
        { heading: "Risks & Complications", body: "Possible instrument separation, incomplete removal of infection, post-treatment discomfort, and the small possibility that the tooth may still require extraction if treatment is unsuccessful. The dentist is the best judge if a crown or full coverage restoration is required or not." }
      ],
      acknowledgment: "I acknowledge that the root canal procedure, alternatives (including extraction), and risks have been explained to me and I consent to treatment."
    }
  },
  {
    id: "orthodontics_braces",
    name: "Orthodontics / Braces",
    icon: "orthodontics",
    fallback: {
      title: "Orthodontic Treatment Consent Form",
      purpose: "Orthodontic treatment improves the alignment of the teeth and jaws using appliances such as braces or aligners, enhancing dental function, facial aesthetics, and long-term oral health. Treatment duration depends on your biological response and level of cooperation.",
      sections: [
        { heading: "Patient Responsibilities", body: "Your cooperation is essential for a successful outcome. I agree to maintain excellent oral hygiene and attend regular check-ups, wear elastics, retainers, or other appliances as instructed, report any broken appliances or discomfort immediately, and attend all scheduled appointments. Failure to comply may prolong treatment or affect the final results." },
        { heading: "Risks and Limitations", body: "Like all clinical procedures, orthodontic treatment carries certain risks, including tooth sensitivity or discomfort during movement, minor root shortening or loss of tooth support, cavities or decalcification (white spots) if oral hygiene is poor, relapse (teeth moving out of alignment) after treatment ends, irritation or ulcers in the soft tissues from appliances, and potential discomfort in the jaw joint (TMJ)." },
        { heading: "Retention Phase", body: "Once active treatment ends, retainers must be worn exactly as prescribed. If retainers are not worn as instructed, the teeth will likely move out of their new positions." },
        { heading: "Confidentiality and Records", body: "I authorize the taking of photographs, radiographs, and study models for diagnosis and progress tracking. The clinic may use these records for clinical documentation, teaching, or research, provided my confidentiality is maintained." },
        { heading: "Financial Responsibility", body: "I understand the total estimated cost and agree to the payment schedule, and I acknowledge that lost appliances, damaged hardware, or extended treatment due to lack of cooperation may incur additional costs." },
        { heading: "Alternatives", body: "The dentist has discussed other options with me, including alternative appliance types (such as fixed braces versus clear aligners), limited or partial treatment addressing only specific teeth, or declining orthodontic treatment and accepting the current alignment of my teeth and jaws." }
      ],
      acknowledgment: "I have asked all my questions regarding orthodontic treatment and received satisfactory answers. I understand the procedures, risks, and my responsibilities, and I consent to begin treatment."
    }
  },
  {
    id: "teeth_whitening",
    name: "Teeth Whitening",
    icon: "whitening",
    fallback: {
      title: "Teeth Whitening Consent Form",
      purpose: "Teeth whitening uses bleaching agents to lighten the shade of natural teeth.",
      sections: [
        { heading: "Procedure", body: "A bleaching gel is applied to the teeth, in-office or via take-home trays, for a specified duration." },
        { heading: "Risks", body: "Temporary tooth sensitivity, mild gum irritation, and uneven whitening on restorations (crowns/fillings do not whiten). Results vary by individual and are not permanent." },
        { heading: "Alternatives", body: "The dentist has discussed other options with me, including professional cleaning/polishing alone, no treatment and accepting the current shade of my teeth, or declining whitening and considering restorative options (such as veneers or crowns) for a change in tooth colour." }
      ],
      acknowledgment: "I acknowledge that the whitening procedure, expected results, and risks have been explained to me and I consent to treatment."
    }
  },
  {
    id: "child_dentistry",
    name: "Child Dentistry",
    icon: "child",
    guardianRequired: true,
    fallback: {
      title: "Pediatric Dental Treatment Consent Form",
      purpose: "This form covers dental treatment for a minor patient and is reviewed and signed by a parent or legal guardian. It covers examination, cleaning and polishing, fluoride treatment, dental fillings, scaling, X-rays, pulp treatment / child root canal, extraction, stainless steel crowns, space maintainers, and other procedures the dentist marks as clinically necessary.",
      sections: [
        { heading: "Guardian Authorization", body: "As the parent/legal guardian, I authorize the dental team to examine and treat the child named in this record, including the specific procedures the dentist determines to be clinically necessary." },
        { heading: "Radiographs, Anaesthesia and Behaviour Guidance", body: "I understand that X-rays are necessary to diagnose and treat dental conditions, and I consent to their use where indicated. The dentist may use local anaesthesia or, where appropriate, sedation to ensure the child's comfort; possible effects include swelling, bruising, allergic reactions, or temporary numbness. The dentist may also use standard behaviour-guidance techniques (voice control, distraction, or gentle restraint if necessary) to safely complete treatment." },
        { heading: "Risks and Emergency Authorization", body: "I understand that risks include pain, swelling, bleeding, infection, or treatment failure, and I acknowledge that the dentist cannot guarantee success. I confirm that I have informed the dentist of the child's full medical history, including all allergies, medications, and health conditions, and I authorize the dentist to provide necessary medical treatment in an emergency." },
        { heading: "Financial Agreement", body: "I agree to pay all treatment charges and understand that fees are non-refundable once the dentist completes the treatment." },
        { heading: "Alternatives", body: "The dentist has discussed other options with me, including delaying non-urgent treatment (with the associated risk of the condition worsening), referral to a pediatric dental specialist, or declining the recommended treatment and accepting the associated dental health risks for the child." }
      ],
      acknowledgment: "I confirm I am the parent/legal guardian of the minor patient named above. I have read and understood this form, and the dentist has answered all my questions to my satisfaction. I consent to the treatment described above being performed on their behalf."
    }
  },
  {
    id: "local_anaesthesia",
    name: "Local Anaesthesia",
    icon: "anaesthesia",
    fallback: {
      title: "Local Anaesthesia Consent Form",
      purpose: "The dentist will administer a local anaesthetic to numb the treatment area, to minimize discomfort and pain during your dental procedure.",
      sections: [
        { heading: "Information Provided", body: "The dentist has explained the purpose and method of administering the anaesthetic, the expected duration of the numbness (typically 2–4 hours), and the potential side effects and clinical complications." },
        { heading: "Risks and Complications", body: "Local anaesthesia may cause certain side effects, although they are uncommon, including temporary pain, swelling, or bruising at the injection site; mild dizziness or fainting; and temporary numbness or tingling lasting several hours. Rare risks include prolonged numbness, allergic reactions, or nerve irritation." },
        { heading: "Medical Disclosure", body: "I have fully disclosed my medical history to the dentist, including known allergies to medications or anaesthetic agents, all current prescription and over-the-counter medicines, and past or present medical conditions such as heart disease, diabetes, asthma, bleeding disorders, or epilepsy." },
        { heading: "Alternatives", body: "The dentist has discussed other options with me, including topical anaesthetic alone for very minor procedures where appropriate, referral for sedation or general anaesthesia for extensive treatment, or declining anaesthesia and accepting the associated discomfort during the procedure." }
      ],
      acknowledgment: "I voluntarily consent to the administration of local anaesthesia for my dental treatment. I understand that while the dental team prioritizes my safety and comfort, they cannot guarantee a complete absence of side effects. I have read and understood this document, and the dentist has answered all my questions to my satisfaction."
    }
  },
  {
    id: "extractions_minor_surgeries",
    name: "Extractions / Minor Surgeries",
    icon: "extraction",
    fallback: {
      title: "Tooth Removal / Minor Oral Surgery Consent Form",
      purpose: "The dentist has explained the necessity of a tooth extraction or minor oral surgery, which may involve removing a tooth or root, opening the gum or bone tissue, administering a local anaesthetic (numbing injection), and placing stitches (sutures) as needed.",
      sections: [
        { heading: "Risks and Complications", body: "Surgery involves specific risks, including pain, swelling, or bleeding; infection or delayed healing; “dry socket” (localized pain after extraction); temporary numbness or tingling in the lip, tongue, or cheek; jaw stiffness or difficulty opening the mouth; damage to adjacent teeth, fillings, or the sinus (for upper teeth); and the potential need for follow-up procedures." },
        { heading: "Treatment Alternatives", body: "The dentist has discussed other options with me, including retaining the tooth through alternative treatments such as a root canal, or taking no action and accepting the associated health risks." },
        { heading: "Anaesthesia and Medical History", body: "The dentist will use a local anaesthetic to numb the area. I have disclosed my full medical history, including all current medications, known allergies, and past and present health conditions." },
        { heading: "Post-Operative Care", body: "I agree to follow the dentist's instructions for recovery, including avoiding smoking, spitting, or using straws for 24 hours; consuming only soft foods; rinsing gently as directed; and contacting the clinic immediately if I experience heavy bleeding, severe pain, or extreme swelling." }
      ],
      acknowledgment: "I confirm that the dentist explained the procedure and risks in a language I understand, I had the opportunity to ask questions which were answered fully, I authorize the dentist to perform any additional steps necessary for my safety during the procedure, and I agree to proceed with treatment."
    }
  },
  {
    id: "crown_and_bridge_replacement",
    name: "Crown n Bridge Replacement",
    icon: "crown_bridge",
    fallback: {
      title: "Crown and Bridge Procedures Consent Form",
      purpose: "The dentist has advised a crown or bridge procedure to restore function, improve aesthetics, or protect your teeth. This process involves shaping (preparing) the teeth, taking impressions or digital scans, placing temporary restorations, and cementing permanent crowns or bridges made of metal, ceramic, or composite materials.",
      sections: [
        { heading: "Risks and Complications", body: "Dental procedures involve certain risks, including sensitivity or discomfort after the tooth is prepared, nerve damage or the future need for root canal treatment, fracture or dislodgement of the restoration, gum irritation or inflammation, the need for bite adjustments after cementation, slight variations in colour compared to natural teeth, and the eventual need for replacement due to natural wear or new decay." },
        { heading: "Alternatives", body: "The dentist has discussed other options with me, including retaining the tooth through alternative treatments such as a root canal, dental fillings, tooth extraction followed by an implant or removable prosthesis, or declining treatment and accepting the associated clinical consequences." }
      ],
      acknowledgment: "I confirm that the dentist explained the procedure, benefits, risks, and alternatives in a language I understand, I have asked all my questions and received satisfactory answers, I authorize the dentist and the dental team to perform the procedure, and I consent to the use of necessary dental materials, anaesthetics, and techniques."
    }
  },
  {
    id: "removable_replacements",
    name: "Removable Replacements",
    icon: "removable",
    fallback: {
      title: "Removable Prosthodontic Treatment Consent Form",
      purpose: "The purpose of removable dentures is to replace missing teeth and restore your dental function, appearance, and oral comfort. This process involves taking impressions of the mouth, recording the bite and jaw relations, testing the artificial teeth (try-in) for evaluation, fabricating and delivering the final denture, and performing adjustments to ensure proper comfort and function.",
      sections: [
        { heading: "Expected Benefits", body: "Removable dentures can improve your ability to chew and speak, enhance facial support and appearance, and restore general oral function." },
        { heading: "Risks and Limitations", body: "Initial discomfort, soreness, or speech difficulties are common, and it may take several weeks to adapt to the new appliance. Dentures require periodic relining, repair, or eventual replacement. Natural bone shrinkage (resorption) will occur over time, which may change the fit of the denture. Complete dentures do not feel or function like natural teeth, and partial dentures may require the dentist to modify existing natural teeth." },
        { heading: "Alternatives", body: "The dentist has explained alternative options, including fixed bridges, dental implants, or declining treatment and accepting the loss of function." },
        { heading: "Post-Treatment Responsibilities", body: "To ensure the success of the treatment, I agree to clean the dentures daily and maintain good oral hygiene, remove the dentures at night to allow the gums to rest, and attend periodic check-ups for maintenance and professional adjustments." }
      ],
      acknowledgment: "I have been informed of the nature, benefits, risks, and alternatives of this treatment, and the dentist has answered all my questions. I understand that the clinic cannot guarantee specific results or a perfect fit, as biological responses vary."
    }
  },
  {
    id: "dental_implants",
    name: "Dental Implants",
    icon: "implant",
    fallback: {
      title: "Dental Implant Procedure Consent Form",
      purpose: "The dentist has advised replacing your missing tooth or teeth with dental implants. This procedure involves the surgical placement of a titanium or biocompatible fixture into the jawbone, which will later support a crown, bridge, or denture.",
      sections: [
        { heading: "Expected Benefits", body: "Dental implants replace missing teeth without affecting adjacent teeth, improve appearance, comfort, speech, and chewing efficiency, and help preserve the jawbone and facial structure." },
        { heading: "Risks and Complications", body: "While dental implants have a high success rate, certain risks exist, including pain, swelling, bruising, or bleeding following surgery; infection at the implant site; nerve injury causing temporary or permanent numbness or tingling in the lip, chin, or tongue; sinus involvement (for upper jaw implants); implant failure or loosening; damage to nearby teeth or structures; the need for additional surgeries such as bone grafts, sinus lifts, or soft tissue grafts; and possible dissatisfaction with the final appearance or function, requiring adjustments." },
        { heading: "Alternatives", body: "The dentist has discussed other options with me, including a fixed bridge, a removable partial denture, or no replacement of the missing teeth." },
        { heading: "Prognosis and Aftercare", body: "The success of the implant depends on the quantity and quality of the jawbone, my commitment to oral hygiene and maintenance, the management of health conditions such as diabetes, smoking, or gum disease, and regular professional cleanings and follow-up appointments. The implant typically requires several months of healing before the final crown or prosthesis is attached." }
      ],
      acknowledgment: "I have discussed the nature, purpose, risks, and benefits of the dental implant procedure with my dentist. I have had the opportunity to ask questions, and the dentist has answered them to my satisfaction. I voluntarily consent to the surgery and associated procedures."
    }
  }
];

// Patient Case History (Clinical Intake) field schema — used to render
// Screen D and to persist a structured "intake" record per patient.
const INTAKE_SCHEMA = {
  patientInfo: ["occupation", "maritalStatus", "referralSource", "visitDate"],
  // Chief Complaint & History of Present Illness — symptoms/progression/onset
  // are checkbox groups in the clinic's Patient Case History form, not free text.
  chiefComplaint: ["chiefComplaint", "historyOfPresentIllness", "otherSymptoms", "aggravatingRelievingFactors"],
  symptoms: ["pain", "swelling", "sensitivity", "bleeding", "pus"],
  progression: ["increasing", "decreasing", "intermittent"],
  onset: ["sudden", "gradual"],
  medicalHistory: [
    "diabetes", "hypertension", "heartDisease", "asthma", "thyroid",
    "bleeding", "allergies", "systemic"
  ],
  medicalHistoryNotes: ["currentMedications", "pastMedical", "surgicalHistory"],
  dentalLifestyle: ["lastDentalVisit"],
  previousTreatments: ["extraction", "filling", "rct", "crown", "implant", "none"],
  habits: ["smoking", "tobacco", "alcohol", "nailBiting", "none"],
  diet: ["vegetarian", "nonVegetarian"],
  sleep: ["adequate", "inadequate"],
  brushingFrequency: ["1x", "2x"],
  brushType: ["soft", "med", "hard"],
  clinicalExam: {
    extraoral: ["facialSymmetry", "lymphNodes"],
    tmj: ["normal", "clicking", "pain", "restrictedMovement"],
    intraoral: ["oralHygiene", "gingiva"],
    teethStatus: ["present", "missing", "carious"]
  },
  // Investigations / diagnostic imaging checklist — CBCT included per clinic request.
  investigations: ["IOPA", "OPG", "CBCT", "Blood Tests"],
  diagnosis: ["provisionalDiagnosis", "finalDiagnosis", "treatmentPlan"]
};

if (typeof module !== "undefined") {
  module.exports = { CONSENT_FORMS, INTAKE_SCHEMA };
}
