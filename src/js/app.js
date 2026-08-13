/**
 * app.js — ClearConsent application shell, router and screen renderers.
 * Offline-first: no fetch() calls except loading the local
 * locales/translations.json bundled inside the app package itself.
 *
 * Navigation model (matches the approved design reference):
 *  - Global header: left icon → Settings, right icon → Patients directory,
 *    center → clinic name / app name. No persistent nav bar.
 *  - "Home" is a single screen with two in-page tabs: Consent Forms and
 *    Signed Forms (Module 3 + Module 7 share one screen).
 *  - Selecting a consent form flows: pick/add patient → one continuous
 *    scrolling consent screen (numbered sections, in-form language +
 *    font controls, patient-details table, then the signature panel
 *    in-line at the bottom) → success → back to the Signed Forms tab.
 */

// Sourced directly from the clinic's own icon library
// (ClearConsent/icons/<name>/<name>_24.svg), recolored from the
// original hardcoded stroke="#222222"/"black" to stroke="currentColor"
// so each icon inherits var(--primary) inside the .icon-sq / .icon-sq-sm
// wrappers, exactly like the rest of the UI icon set. White fills (inner
// highlight details on cavity/braces/tooth-shine/golden-crown/etc.) are
// left as-is — that's the designer's original two-tone treatment.
const FORM_ICON_SET = {
  // Dental Examination — icons/check_up/check_up_24.svg
  // Dental Examination — clipboard + checkmark (charting/exam record), swapped
  // in for the previous abstract mirror-tool icon per clinic request.
  examination: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" stroke-width="1.2"/><path d="M9 2.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V2.5Z" stroke="currentColor" stroke-width="1.2"/><path d="M8.5 12.5l2 2 4.5-5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 17h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  // Dental Imaging / Radiology — icons/tooth_xray/tooth_xray_24.svg (kept as the
  // designer's original self-contained navy badge — not recolored)
  imaging: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_17_1219)"><rect width="24" height="24" rx="4" fill="#1B2C3B"/><path fill-rule="evenodd" clip-rule="evenodd" d="M14.1085 3.93524C12.8838 4.45674 11.1161 4.45674 9.89135 3.93524C8.89625 3.51153 7.78317 3.47224 6.75613 3.91623C4.58874 4.85319 3.61663 7.59129 4.55996 10.0613C4.56017 10.0618 4.56016 10.0624 4.55993 10.063L4.85431 10.6992C5.84942 12.8496 6.5995 15.1039 7.09056 17.4201L7.5577 19.6233C7.71936 20.2567 8.29063 20.7 8.94525 20.7C9.64832 20.7 10.2474 20.1903 10.359 19.4972L11.0175 15.4078C11.0951 14.9262 11.5114 14.572 12 14.572C12.4885 14.572 12.9048 14.9262 12.9824 15.4078L13.6409 19.4972C13.7525 20.1903 14.3516 20.7 15.0547 20.7C15.7093 20.7 16.2805 20.2567 16.4422 19.6233L16.9093 17.4201C17.4004 15.1039 18.1505 12.8496 19.1456 10.6992L19.44 10.063C19.4397 10.0624 19.4397 10.0618 19.4399 10.0613C20.3833 7.59129 19.4112 4.85319 17.2438 3.91623C16.2167 3.47223 15.1036 3.51153 14.1085 3.93524Z" fill="url(#paint0_linear_17_1219)"/><path d="M11.0146 13.3288C11.3262 13.1755 11.664 13.1038 12.0001 13.1138C12.3362 13.1038 12.674 13.1755 12.9856 13.3288C13.7507 13.7052 14.2712 14.4731 14.3575 15.3525L14.65 18.3341C14.6621 18.4569 14.7498 18.5599 14.8695 18.5907C15.0553 18.6384 15.2335 18.4969 15.2335 18.3055V16.9341C15.2335 15.3039 15.5329 13.6888 16.1155 12.1765L17.2303 9.28274C17.929 7.46925 16.3608 5.59456 14.5486 6.07683L13.1866 6.43929C12.7972 6.54294 12.3989 6.59744 12.0001 6.60281C11.6013 6.59744 11.203 6.54294 10.8136 6.43929L9.45159 6.07683C7.6394 5.59455 6.07124 7.46925 6.76988 9.28274L7.88471 12.1765C8.46729 13.6888 8.76671 15.3039 8.76671 16.9341V18.3055C8.76671 18.4969 8.94494 18.6384 9.13065 18.5907C9.25039 18.5599 9.33814 18.4569 9.35019 18.3341L9.64268 15.3525C9.72895 14.4731 10.2495 13.7052 11.0146 13.3288Z" fill="url(#paint1_radial_17_1219)"/><path d="M24 9.29999C24 9.29999 18.6274 11.3783 12 11.3783C5.37258 11.3783 0 9.29999 0 9.29999V20.4H24V9.29999Z" fill="url(#paint2_linear_17_1219)"/></g><defs><linearGradient id="paint0_linear_17_1219" x1="12" y1="3.59998" x2="12" y2="20.7" gradientUnits="userSpaceOnUse"><stop stop-color="white"/><stop offset="1" stop-color="#3A556A"/></linearGradient><radialGradient id="paint1_radial_17_1219" cx="0" cy="0" r="1" gradientTransform="matrix(-2.43654 -7.30143 -5.99174 2.82431 12.0001 13.262)" gradientUnits="userSpaceOnUse"><stop stop-color="#375168"/><stop offset="1" stop-color="#2C4255"/></radialGradient><linearGradient id="paint2_linear_17_1219" x1="12" y1="9.29999" x2="12" y2="18.6304" gradientUnits="userSpaceOnUse"><stop stop-color="#466780"/><stop offset="1" stop-color="#486881" stop-opacity="0"/></linearGradient><clipPath id="clip0_17_1219"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>`,
  // Restorations / Fillings — icons/cavity/cavity_24.svg
  restoration: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.6904 1.97363C15.6896 1.49928 16.7828 1.46177 17.79 1.94727C19.9378 2.98254 21.0369 6.13498 20.0166 9.11621L19.6904 9.90332C18.5263 12.7084 17.6494 15.6483 17.0752 18.668L16.54 21.4844C16.4055 22.0657 15.9589 22.4004 15.5244 22.4004C15.0583 22.4003 14.5806 22.0121 14.4873 21.3672L13.7275 16.1055C13.6024 15.2394 12.9086 14.5156 12 14.5156C11.0914 14.5156 10.3976 15.2394 10.2725 16.1055L9.5127 21.3672C9.4194 22.0121 8.9417 22.4003 8.47559 22.4004C8.04112 22.4004 7.59446 22.0657 7.45996 21.4844L6.9248 18.668C6.3506 15.6483 5.47371 12.7084 4.30957 9.90332L3.98242 9.11621C2.96235 6.13507 4.06224 2.98251 6.20996 1.94727C7.21719 1.46177 8.31045 1.49928 9.30957 1.97363C10.8856 2.72187 13.1144 2.72188 14.6904 1.97363Z" stroke="currentColor" stroke-width="1.2"/><path d="M12.0752 0.342468C12.2842 0.342468 12.5272 0.432795 12.8066 0.625671C13.0836 0.816877 13.3477 1.0748 13.5957 1.33661L14.0605 1.82782L14.4932 1.30829C14.6747 1.09003 14.9173 0.971375 15.1699 0.971375C15.6363 0.971651 16.1162 1.41104 16.1162 2.08563V2.42841C16.1162 3.1421 15.6857 3.68131 15.1787 3.83759L15.0771 3.86395C14.703 3.93973 14.3117 4.26743 14.3115 4.77118C14.3115 6.23501 13.2537 7.31415 12.0752 7.31415C10.8968 7.31395 9.83984 6.23487 9.83984 4.77118V4.19794C9.83982 3.74731 9.64476 3.3769 9.41797 3.09735C9.19331 2.82044 8.91163 2.59984 8.66406 2.43329C8.30141 2.18933 8.03422 1.72724 8.03418 1.17157V0.828796C8.03418 0.744648 8.04231 0.693503 8.04883 0.66571C8.10665 0.651587 8.20376 0.642714 8.37402 0.644226C8.45884 0.64498 8.5483 0.648019 8.65234 0.651062C8.75347 0.65402 8.86524 0.65692 8.98145 0.656921C9.23408 0.656921 9.4767 0.77558 9.6582 0.993835L10.0898 1.51337L10.5547 1.02216C10.9616 0.592532 11.4977 0.342562 12.0752 0.342468Z" fill="currentColor" stroke="currentColor" stroke-width="1.2"/></svg>`,
  // Root Canal Treatment — clinic-provided tooth-with-roots mark, per
  // clinic request. Uses the app's explicit brand blue/white (matching the
  // Extractions/forceps and Crown & Bridge icons) rather than currentColor,
  // since it was supplied as a finished two-tone mark.
  root_canal: `<svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.0762 30.2002H8.06836L6.91992 15.6768C9.34783 17.0105 11.9843 17.7119 14.666 17.7119H18.2393C20.9293 17.7119 23.5696 16.9818 25.9844 15.5986L24.0762 30.2002Z" fill="white" stroke="#1B4DFF" stroke-width="1.6"/><path d="M27.8721 14.9834C28.5212 14.9836 29.0345 15.534 28.9893 16.1816L28.2764 26.3652C28.1252 28.5245 26.3296 30.2 24.165 30.2002H8.62695C6.4624 30.2 4.66675 28.5246 4.51562 26.3652L3.80273 16.1816C3.7575 15.534 4.27071 14.9835 4.91992 14.9834C5.42641 14.9834 5.87035 15.3234 6.00195 15.8125L8.60645 25.4941C9.02033 27.032 10.3389 28.1567 11.9229 28.3223C13.3502 28.4713 14.7419 27.8134 15.5332 26.6162L15.5557 26.582C15.8332 26.1621 16.0035 25.6799 16.0508 25.1787L16.1865 23.7305L16.7178 25.5342C16.8103 25.8486 16.9492 26.1474 17.1299 26.4209L17.2588 26.6162C18.0502 27.8134 19.4418 28.4714 20.8691 28.3223C22.4531 28.1567 23.7717 27.032 24.1855 25.4941L26.79 15.8125C26.9217 15.3234 27.3656 14.9834 27.8721 14.9834Z" fill="white" stroke="#1B4DFF" stroke-width="1.6"/><path d="M16.6722 3.32426C17.7147 2.66466 18.939 2.42834 20.1458 2.73356C22.6841 3.37579 24.3744 6.27505 23.739 9.37442L23.5013 10.2262C22.6412 13.3129 22.1304 16.4856 21.9779 19.6844L21.8374 22.6397C21.7924 23.1388 21.4153 23.544 20.9209 23.6245C20.3891 23.7108 19.8726 23.3981 19.7029 22.8863L17.9712 17.6687C17.6437 16.6813 16.6476 16.077 15.6207 16.2438C14.594 16.4107 13.8411 17.2989 13.8427 18.339L13.8508 23.8365C13.8516 24.3756 13.4607 24.8357 12.9289 24.9221C12.4343 25.0023 11.9485 24.7371 11.7478 24.2778L10.6796 21.5188C9.52288 18.5325 8.03456 15.6844 6.242 13.0285L5.74609 12.2958C4.16289 9.55664 4.84985 6.27129 7.05458 4.85907C8.10287 4.18771 9.33907 4.02454 10.5367 4.32042C12.4613 4.79585 14.9969 4.38421 16.6722 3.32426Z" fill="white" stroke="#1B4DFF" stroke-width="1.6"/></svg>`,
  // Orthodontics / Braces — icons/braces/braces_24.svg
  orthodontics: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6956 3.59961C18.9282 3.59976 20.7644 5.36012 20.8586 7.59082L21.2747 17.4766C21.3286 18.7592 20.3035 19.8281 19.0198 19.8281H14.6204C13.3589 19.8281 12.3423 18.7945 12.3635 17.5332L12.5295 7.69629C12.568 5.42287 14.4218 3.59961 16.6956 3.59961Z" stroke="currentColor" stroke-width="1.2"/><path d="M7.26953 3.59961C9.55045 3.59961 11.4004 5.44954 11.4004 7.73047V17.5713C11.4004 18.8179 10.3891 19.8281 9.14258 19.8281H4.98047C3.6967 19.8281 2.67168 18.7592 2.72559 17.4766L3.14355 7.55566C3.23696 5.34466 5.05658 3.59982 7.26953 3.59961Z" stroke="currentColor" stroke-width="1.2"/><path d="M22.2178 10.9077C22.2684 10.8704 22.3395 10.8816 22.377 10.9321C22.4145 10.9828 22.4042 11.0547 22.3535 11.0922C21.1737 11.9656 17.4981 13.6859 12.1338 13.686C6.76894 13.686 2.91636 11.9652 1.64941 11.0942C1.59748 11.0584 1.58438 10.987 1.62012 10.935C1.6559 10.8831 1.72732 10.87 1.7793 10.9057C3.00594 11.749 6.81244 13.4575 12.1338 13.4575C17.4553 13.4574 21.082 11.7486 22.2178 10.9077Z" fill="white" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path opacity="0.4" d="M22.2207 10.9057C22.2727 10.87 22.3441 10.883 22.3799 10.935C22.4156 10.987 22.4025 11.0584 22.3506 11.0942C21.0836 11.9652 17.2311 13.686 11.8662 13.686C6.50199 13.6859 2.82637 11.9656 1.64648 11.0922C1.59585 11.0547 1.58476 10.9828 1.62207 10.9321C1.65956 10.8814 1.73152 10.8703 1.78223 10.9077C2.918 11.7486 6.54467 13.4574 11.8662 13.4575C17.1877 13.4575 20.9941 11.7489 22.2207 10.9057Z" fill="white" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path opacity="0.4" d="M1.7793 10.9057C1.72731 10.87 1.65589 10.883 1.62012 10.935C1.5844 10.987 1.59755 11.0584 1.64941 11.0942C2.91636 11.9652 6.76894 13.686 12.1338 13.686C17.498 13.6859 21.1736 11.9656 22.3535 11.0922C22.4041 11.0547 22.4152 10.9828 22.3779 10.9321C22.3404 10.8814 22.2685 10.8703 22.2178 10.9077C21.082 11.7486 17.4553 13.4574 12.1338 13.4575C6.81232 13.4575 3.00586 11.7489 1.7793 10.9057Z" fill="white" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M6.56763 11.0429H7.9104C8.68359 11.0429 9.31079 11.6701 9.31079 12.4433V13.7861C9.31079 14.5593 8.68359 15.1865 7.9104 15.1865H6.56763C5.79444 15.1865 5.16724 14.5593 5.16724 13.7861V12.4433C5.16724 11.6701 5.79444 11.0429 6.56763 11.0429Z" fill="white" stroke="currentColor" stroke-width="1.2"/><path d="M16.282 11.0429H17.6248C18.3979 11.0429 19.0251 11.6701 19.0251 12.4433V13.7861C19.0251 14.5593 18.3979 15.1865 17.6248 15.1865H16.282C15.5088 15.1865 14.8816 14.5593 14.8816 13.7861V12.4433C14.8816 11.6701 15.5088 11.0429 16.282 11.0429Z" fill="white" stroke="currentColor" stroke-width="1.2"/></svg>`,
  // Teeth Whitening — icons/tooth-shine/tooth-shine_24.svg
  whitening: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.0103 1.97754C15.0689 1.49777 16.2325 1.45996 17.3022 1.95215C19.5686 2.99503 20.705 6.14461 19.6431 9.10742L19.3013 9.89453C18.0813 12.7006 17.1619 15.6418 16.5601 18.6631L16.0005 21.4746C15.8643 22.0424 15.3979 22.4004 14.9067 22.4004C14.3802 22.4004 13.8863 21.9884 13.7915 21.3633L12.9946 16.1016C12.8605 15.2157 12.1281 14.5157 11.2144 14.5156C10.3006 14.5156 9.56717 15.2156 9.43311 16.1016L8.63721 21.3633C8.54243 21.9883 8.04839 22.4003 7.52197 22.4004C7.06161 22.4004 6.62282 22.086 6.45752 21.5791L6.42822 21.4746L5.86865 18.6631C5.26677 15.6417 4.34648 12.7007 3.12646 9.89453L2.78467 9.10742C1.72289 6.1446 2.86009 2.99493 5.12646 1.95215C6.19606 1.46003 7.35893 1.49791 8.41748 1.97754C10.0553 2.71977 12.3724 2.71968 14.0103 1.97754Z" stroke="currentColor" stroke-width="1.2"/><path d="M7.67358 5.93079C7.50743 7.65906 6.15784 9.03743 4.43335 9.23938L3.74487 9.31946L4.25562 9.36145C6.06722 9.50859 7.51128 10.9363 7.67847 12.7462L7.71655 13.1544L7.76929 12.7238C7.99281 10.9128 9.45581 9.50673 11.2742 9.35461L11.6902 9.31946L11.0945 9.24817C9.36519 9.03958 7.99788 7.68284 7.77612 5.9552L7.71655 5.4884L7.67358 5.93079Z" stroke="currentColor" stroke-width="1.2"/><path d="M17.9336 10.6597C17.6386 11.7474 16.769 12.5958 15.6631 12.8599C16.7573 13.1325 17.6223 13.9731 17.9268 15.0543C18.2275 13.9624 19.1005 13.1176 20.2031 12.8541C19.1101 12.5742 18.2476 11.7372 17.9336 10.6597Z" fill="white" stroke="currentColor" stroke-width="1.2"/></svg>`,
  // Child Dentistry — icons/nurse/nurse_24.svg
  // Child Dentistry — a friendly "smiling tooth", swapped in for the
  // previous generic nurse/person icon per clinic request.
  child: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.5c-3 0-5.4 2.2-5.4 5.3 0 2.3 1.2 3.5 1.6 5.6.4 2.1.9 6.6 2 6.6 1.1 0 1.2-3.4 1.8-4.6.6 1.2.7 4.6 1.8 4.6 1.1 0 1.6-4.5 2-6.6.4-2.1 1.6-3.3 1.6-5.6C17.4 4.7 15 2.5 12 2.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/><circle cx="10.3" cy="7.3" r="0.9" fill="currentColor"/><circle cx="13.7" cy="7.3" r="0.9" fill="currentColor"/><path d="M10 9.6c.6.8 3.4.8 4 0" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
  // Local Anaesthesia — icons/injection/injection_24.svg
  anaesthesia: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_17_1275)"><path d="M1.5 1.5L5.42856 5.42857" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.24719 6.67333L6.67325 5.24725" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.44461 6.15767L19.7721 17.4852L17.5037 19.7537L6.17622 8.42609L8.44461 6.15767Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.7856 18.7857L21.9285 21.9286" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.6359 23.5L23.4998 20.636" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_17_1275"><rect width="24" height="24" fill="white"/></clipPath></defs></svg>`,
  // Extractions / Minor Surgeries — icons/forceps/forcep_24.svg
  // Extractions / Minor Surgeries — forceps icon, per clinic-provided asset
  // (icons/forceps). Uses the app's explicit brand blue/white per the
  // provided artwork rather than currentColor, since it was supplied as a
  // finished two-tone mark.
  extraction: `<svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.45508 10.4971C3.6446 12.0132 5.11729 13.0227 6.59961 12.6523L16.6572 10.1377C17.6565 9.88799 18.715 10.1457 19.4873 10.8271L29.9746 20.082C30.2437 20.3195 30.2761 20.7271 30.0479 21.0039C29.8532 21.2396 29.5227 21.3128 29.2471 21.1807L16.9014 15.2568C16.6139 15.1189 16.2983 15.0476 15.9795 15.0488L5.34766 15.0908C3.39074 15.0986 1.7998 13.5145 1.7998 11.5576V7.59375C1.79997 6.91196 2.27859 6.34235 2.91797 6.20117L3.45508 10.4971Z" fill="white" stroke="#1B4DFF" stroke-width="1.6"/><path d="M7.15674 1.7998H11.1206C13.0775 1.7998 14.6616 3.39074 14.6538 5.34766L14.6118 15.9795C14.6105 16.2983 14.6819 16.6139 14.8198 16.9014L20.7437 29.2471C20.8758 29.5227 20.8026 29.8532 20.5669 30.0479C20.2901 30.2761 19.8824 30.2437 19.645 29.9746L10.3901 19.4873C9.70865 18.715 9.45098 17.6565 9.70068 16.6572L12.2153 6.59961C12.5857 5.11729 11.5762 3.6446 10.0601 3.45508L5.76416 2.91797C5.90533 2.27859 6.47495 1.79997 7.15674 1.7998Z" fill="white" stroke="#1B4DFF" stroke-width="1.6"/></svg>`,
  // Crown n Bridge Replacement — icons/golden-crown/golden_crown_24.svg
  crown_bridge: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.0349 7.96729L17.6609 11.3394C17.5663 12.1907 17.7801 13.0274 18.2322 13.7163H7.26831C7.72034 13.0274 7.93419 12.1906 7.8396 11.3394L7.4646 7.96729H18.0349Z" fill="white" stroke="currentColor" stroke-width="1.2"/><path d="M10.5808 12.7896C11.962 12.1778 13.5375 12.1779 14.9187 12.7896L19.5027 14.8208C19.686 14.902 19.786 15.1154 19.7195 15.3218C19.2329 16.8274 19.0017 17.8678 18.6296 19.6157L18.196 21.6519C18.0419 22.2376 17.5103 22.6492 16.8982 22.6499H16.8953C16.2344 22.6492 15.6743 22.1709 15.5701 21.5249V21.5239L14.6755 16.0396C14.5253 15.1117 13.7219 14.3784 12.7498 14.3784C11.7777 14.3785 10.9741 15.1118 10.824 16.0396L9.93042 21.5239V21.5249C9.82618 22.1708 9.26594 22.649 8.60522 22.6499H8.60132L8.48706 22.645C7.95871 22.5997 7.50672 22.2482 7.33374 21.7515L7.30151 21.6431L6.86987 19.6157C6.49783 17.8678 6.26765 16.8275 5.78101 15.3218C5.71437 15.1154 5.81365 14.9021 5.99683 14.8208L10.5808 12.7896Z" fill="white" stroke="currentColor" stroke-width="1.2"/><path d="M17.7966 2.01135C18.4136 2.01139 19.0337 2.13376 19.6306 2.39124C22.221 3.50861 23.4758 6.84088 22.2908 9.94397C22.1592 10.2275 21.9975 10.5701 21.864 10.859C21.7655 11.0721 21.5248 11.1625 21.3289 11.0856L15.3894 8.75256C13.6931 8.08617 11.8074 8.0862 10.1111 8.75256L4.17065 11.0856C3.97477 11.1623 3.73487 11.072 3.63647 10.859C3.50183 10.5676 3.34126 10.2295 3.20874 9.94397C2.02383 6.84094 3.27953 3.50859 5.86987 2.39124C7.10039 1.86055 8.43997 1.90226 9.65308 2.4176C11.4656 3.18767 14.0349 3.18767 15.8474 2.4176C16.3965 2.18438 16.9712 2.04859 17.5486 2.01819L17.7966 2.01135Z" fill="white" stroke="currentColor" stroke-width="1.2"/><path d="M6.1084 3.32715C5.8393 4.07245 5.25043 4.66185 4.50391 4.93164C5.2483 5.20807 5.83737 5.80048 6.1084 6.54883C6.39486 5.79988 6.99115 5.20995 7.74023 4.93164C6.98958 4.65898 6.39295 4.07305 6.1084 3.32715Z" fill="white" stroke="currentColor" stroke-width="1.2"/></svg>`,
  // Removable Replacements — icons/tooth/tooth_24.svg
  removable: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.6904 1.97363C15.6896 1.49928 16.7828 1.46177 17.79 1.94727C19.9378 2.98254 21.0369 6.13498 20.0166 9.11621L19.6904 9.90332C18.5263 12.7084 17.6494 15.6483 17.0752 18.668L16.54 21.4844C16.4055 22.0657 15.9589 22.4004 15.5244 22.4004C15.0583 22.4003 14.5806 22.0121 14.4873 21.3672L13.7275 16.1055C13.6024 15.2394 12.9086 14.5156 12 14.5156C11.0914 14.5156 10.3976 15.2394 10.2725 16.1055L9.5127 21.3672C9.4194 22.0121 8.9417 22.4003 8.47559 22.4004C8.04112 22.4004 7.59446 22.0657 7.45996 21.4844L6.9248 18.668C6.3506 15.6483 5.47371 12.7084 4.30957 9.90332L3.98242 9.11621C2.96235 6.13507 4.06224 2.98251 6.20996 1.94727C7.21719 1.46177 8.31045 1.49928 9.30957 1.97363C10.8856 2.72187 13.1144 2.72188 14.6904 1.97363Z" stroke="currentColor" stroke-width="1.2"/></svg>`,
  // Dental Implants — icons/implant/implant_24.svg
  implant: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.4678 1.97559C15.555 1.49929 16.7517 1.46101 17.8516 1.9502C20.1745 2.98342 21.3226 6.08772 20.2422 8.99609L20.2217 9.04883L19.4668 10.998C19.3677 11.2534 19.1409 11.4003 18.9111 11.4004H4.33887C4.1091 11.4003 3.88229 11.2534 3.7832 10.998L3.00781 8.99609C1.92737 6.08773 3.07548 2.98342 5.39844 1.9502C6.49833 1.46101 7.69506 1.4993 8.78223 1.97559C10.447 2.70488 12.803 2.70489 14.4678 1.97559Z" stroke="currentColor" stroke-width="1.2"/><path d="M16.6555 13.8937L14.4866 20.3693C14.0804 21.5823 12.9444 22.3996 11.6653 22.3996C10.3862 22.3995 9.25016 21.5822 8.84399 20.3693L6.67603 13.8937H16.6555Z" stroke="currentColor" stroke-width="1.2"/><path d="M3.41528 12.9231H19.9153C20.0305 12.9231 20.1241 13.0169 20.1243 13.1321C20.1243 13.2474 20.0306 13.3411 19.9153 13.3411H3.41528C3.30006 13.3409 3.2063 13.2473 3.2063 13.1321C3.20642 13.0169 3.30013 12.9232 3.41528 12.9231Z" stroke="currentColor" stroke-width="1.2"/><path d="M8.10693 20.3643H15.2241C15.2501 20.3643 15.271 20.3862 15.271 20.4122C15.2708 20.438 15.25 20.459 15.2241 20.459H8.10693C8.08108 20.459 8.0593 20.438 8.05908 20.4122C8.05908 20.3862 8.08094 20.3643 8.10693 20.3643Z" fill="white" stroke="currentColor" stroke-width="1.2"/><path d="M7.2981 18.0996H16.0334C16.0592 18.0999 16.0803 18.1216 16.0803 18.1475C16.0801 18.1731 16.0591 18.1941 16.0334 18.1943H7.2981C7.27224 18.1943 7.25046 18.1733 7.25024 18.1475C7.25024 18.1215 7.27211 18.0996 7.2981 18.0996Z" fill="white" stroke="currentColor" stroke-width="1.2"/><path d="M6.4895 15.8349H16.842C16.868 15.8349 16.8889 15.8568 16.8889 15.8828C16.8887 15.9086 16.8679 15.9296 16.842 15.9296H6.4895C6.46364 15.9296 6.44186 15.9086 6.44165 15.8828C6.44165 15.8568 6.46351 15.8349 6.4895 15.8349Z" fill="white" stroke="currentColor" stroke-width="1.2"/></svg>`,
  // Patient Case History — icons/patient/patient_24.svg
  patient: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.8173 10.485L13.7554 11.2965C13.2074 11.7109 12.5392 11.9351 11.8521 11.9351C11.1651 11.9351 10.4968 11.7109 9.94881 11.2965L8.88697 10.485C8.43663 10.1439 8.07122 9.70332 7.81926 9.19766C7.56729 8.69199 7.4356 8.13494 7.43445 7.56999V6.00727C7.43441 5.47683 7.53969 4.95166 7.74418 4.46222C7.94867 3.97278 8.24831 3.52881 8.62571 3.15607C9.00311 2.78333 9.45077 2.48923 9.94271 2.29083C10.4347 2.09243 10.9611 1.99369 11.4915 2.00032H12.2027C12.7374 1.99359 13.268 2.09394 13.7632 2.29544C14.2585 2.49694 14.7084 2.79553 15.0865 3.17361C15.4646 3.55169 15.7631 4.00161 15.9646 4.49688C16.1662 4.99214 16.2665 5.52272 16.2598 6.05736V7.56999C16.2606 8.13424 16.1307 8.69102 15.8805 9.19674C15.6302 9.70246 15.2663 10.1434 14.8173 10.485Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19.0398C5 17.1535 5.74933 15.3445 7.08316 14.0106C8.41698 12.6768 10.226 11.9275 12.1123 11.9275C13.9987 11.9275 15.8077 12.6768 17.1415 14.0106C18.4754 15.3445 19.2247 17.1535 19.2247 19.0398C19.2247 22.9867 5 22.9867 5 19.0398Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  // Doctor / Clinic Settings header icon — icons/doctor/doctor_24.svg
  doctor: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.8173 10.485L13.7554 11.2965C13.2074 11.7109 12.5392 11.9351 11.8521 11.9351C11.1651 11.9351 10.4968 11.7109 9.94881 11.2965L8.88697 10.485C8.43663 10.1439 8.07122 9.70332 7.81926 9.19766C7.56729 8.69199 7.4356 8.13494 7.43445 7.56999V6.00727C7.43441 5.47683 7.53969 4.95166 7.74418 4.46222C7.94867 3.97278 8.24831 3.52881 8.62571 3.15607C9.00311 2.78333 9.45077 2.48923 9.94271 2.29083C10.4347 2.09243 10.9611 1.99369 11.4915 2.00032H12.2027C12.7374 1.99359 13.268 2.09394 13.7632 2.29544C14.2585 2.49694 14.7084 2.79553 15.0865 3.17361C15.4646 3.55169 15.7631 4.00161 15.9646 4.49688C16.1662 4.99214 16.2665 5.52272 16.2598 6.05736V7.56999C16.2606 8.13424 16.1307 8.69102 15.8805 9.19674C15.6302 9.70246 15.2663 10.1434 14.8173 10.485Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19.0398C5 17.1535 5.74933 15.3445 7.08316 14.0106C8.41698 12.6768 10.226 11.9275 12.1123 11.9275C13.9987 11.9275 15.8077 12.6768 17.1415 14.0106C18.4754 15.3445 19.2247 17.1535 19.2247 19.0398C19.2247 22.9867 5 22.9867 5 19.0398Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M14.7469 15.3535V12.9894" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.2345 18.8796V17.1066C13.2371 16.7062 13.3973 16.323 13.6804 16.0399C13.9635 15.7568 14.3468 15.5966 14.7471 15.5939C14.9458 15.5939 15.1425 15.6331 15.326 15.7091C15.5095 15.7851 15.6763 15.8965 15.8167 16.037C15.9572 16.1774 16.0686 16.3442 16.1446 16.5277C16.2206 16.7112 16.2597 16.9079 16.2597 17.1066V18.8796" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.33765 15.3535V12.9894" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.33765 18.6692V17.958" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  // All Patients directory header icon — icons/fi_users.svg
  patients_group: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  // Generic file icon (used for signed-form list rows, unrelated to the 13-form icon set)
  file: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>`
};

const ICONS = {
  back: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>`,
  search: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
  chevron: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>`,
  share: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>`,
  clearReset: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>`,
  pencil: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>`
};

const APP_LOGO_SVG = `<svg width="44" height="44" viewBox="0 0 144 144" fill="none"><rect width="144" height="144" rx="28" fill="#1B4DFF"/><path fill-rule="evenodd" clip-rule="evenodd" d="M82.6 33.6C76.7 36 68.3 36 62.4 33.6 57.6 31.6 52.2 31.4 47.3 33.5 36.9 37.9 32.2 50.7 36.7 62.2L38.1 65.2C42.9 75.3 46.5 85.8 48.9 96.7L51.1 107C51.9 109.9 54.7 112 57.8 112 61.2 112 64.1 109.6 64.6 106.4L67.8 87.2C68.1 85 70.2 83.3 72.5 83.3 74.8 83.3 76.9 85 77.2 87.2L80.4 106.4C80.9 109.6 83.8 112 87.2 112 90.3 112 93.1 109.9 93.9 107L96.1 96.7C98.5 85.8 102.1 75.3 106.9 65.2L108.3 62.2C112.8 50.7 108.1 37.9 97.7 33.5 92.8 31.4 87.4 31.6 82.6 33.6Z" fill="#fff"/></svg>`;

// App icon used on the PIN entry screen — sourced from the design team's
// "App_icon" export (XXXHDPI.svg, 192x192 viewBox), scaled to 96x96 display size.
const PIN_APP_ICON_SVG = `<svg width="96" height="96" viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect width="192" height="192" rx="10" fill="#1B4DFF"/>
<g filter="url(#filter0_dii_49_388)">
<path fill-rule="evenodd" clip-rule="evenodd" d="M110.183 44.758C102.332 48.011 91.0011 48.011 83.1501 44.758C76.7712 42.1149 69.6361 41.8698 63.0525 44.6394C49.159 50.484 42.9275 67.5637 48.9745 82.9712C48.9758 82.9746 48.9758 82.9784 48.9743 82.9817L50.8614 86.9501C57.2403 100.364 62.0484 114.426 65.1963 128.874L68.1908 142.617C69.2271 146.568 72.889 149.333 77.0853 149.333C81.5922 149.333 85.4323 146.154 86.1478 141.831L90.3693 116.322C90.8665 113.318 93.535 111.108 96.6668 111.108C99.7986 111.108 102.467 113.318 102.964 116.322L107.186 141.831C107.901 146.154 111.741 149.333 116.248 149.333C120.444 149.333 124.106 146.568 125.143 142.617L128.137 128.874C131.285 114.426 136.093 100.364 142.472 86.95L144.359 82.9817C144.358 82.9784 144.358 82.9746 144.359 82.9711C150.406 67.5637 144.174 50.484 130.281 44.6394C123.697 41.8698 116.562 42.1149 110.183 44.758Z" fill="white"/>
</g>
<path opacity="0.9" fill-rule="evenodd" clip-rule="evenodd" d="M95.7226 67.6221C92.5211 63.584 88.0357 62.0433 84.2135 62.8922C80.3272 63.7554 77.4042 67.0376 77.4042 71.9585C77.4042 79.5368 81.9856 84.7713 87.3701 88.5606C84.7663 90.8932 82.7889 93.6081 81.6088 96.2424C81.4843 96.5205 81.3679 96.7992 81.2602 97.078H66.6382C65.9175 97.078 65.3333 97.6547 65.3333 98.3661C65.3333 99.0775 65.9175 99.6543 66.6382 99.6543H80.5232C80.3428 100.657 80.2998 101.634 80.4189 102.553C80.6775 104.551 81.7125 106.28 83.6716 107.247C85.7583 108.277 87.7667 108.185 89.5509 107.366C91.2706 106.578 92.7213 105.147 93.9047 103.586C94.8324 102.362 95.6428 100.995 96.326 99.6543H125.362C126.082 99.6543 126.667 99.0775 126.667 98.3661C126.667 97.6547 126.082 97.078 125.362 97.078H97.5119C97.9676 95.9794 98.3166 94.9919 98.5521 94.2364C99.1406 92.3485 99.8261 88.7365 99.9733 84.6218C100.255 84.5342 100.529 84.4548 100.793 84.3834C102.581 83.9007 103.874 83.808 104.721 83.9419C105.536 84.0708 105.768 84.3661 105.854 84.5754C105.978 84.8741 106.018 85.5053 105.56 86.6036C104.971 88.0146 104.673 89.3075 104.956 90.3397C105.114 90.9156 105.459 91.4209 106.004 91.743C106.52 92.0476 107.087 92.1136 107.582 92.083C108.542 92.0237 109.592 91.5798 110.559 91.0049C111.558 90.4112 112.599 89.5989 113.561 88.6485C114.427 87.7939 115.316 87.0142 116.152 86.4032C117.006 85.7796 117.729 85.388 118.271 85.2291C118.534 85.1518 118.695 85.1477 118.775 85.1576C118.829 85.1643 118.839 85.1746 118.846 85.181C118.901 85.2327 119.162 85.5803 119.162 86.7715C119.162 88.9793 119.76 90.7143 121.369 91.3499C122.099 91.638 122.851 91.6062 123.487 91.4756C124.127 91.3439 124.749 91.0918 125.293 90.8232C125.937 90.505 126.199 89.7313 125.876 89.095C125.554 88.4586 124.77 88.2007 124.126 88.5189C123.691 88.7333 123.293 88.8838 122.954 88.9534C122.611 89.0239 122.425 88.9921 122.339 88.958C122.309 88.9465 121.772 88.7369 121.772 86.7715C121.772 85.387 121.502 84.1231 120.65 83.3195C119.71 82.4335 118.492 82.4763 117.527 82.7596C116.56 83.0434 115.55 83.6378 114.6 84.3324C113.631 85.0396 112.644 85.9102 111.716 86.8268C110.884 87.6476 110.008 88.3249 109.213 88.798C108.674 89.1184 108.222 89.3151 107.878 89.4193C107.655 89.4865 107.457 89.3099 107.498 89.0809C107.557 88.7452 107.692 88.2589 107.973 87.5847C108.543 86.2187 108.771 84.8128 108.271 83.6029C107.735 82.3037 106.533 81.619 105.133 81.398C103.766 81.1819 102.063 81.3694 100.104 81.8984C100.066 81.9088 100.027 81.9195 99.9878 81.9302C99.8599 77.0228 98.8388 71.5526 95.7226 67.6221ZM94.6743 97.078C95.3004 95.6888 95.7692 94.4039 96.0576 93.4787C96.526 91.976 97.1072 89.042 97.3143 85.5893C96.3787 85.974 95.3736 86.4287 94.2998 86.9587C93.4436 87.3813 92.626 87.8536 91.8504 88.3652C92.1426 88.5373 92.4368 88.7067 92.7326 88.8736C93.3583 89.2266 93.5756 90.0135 93.218 90.6312C92.8603 91.2488 92.0631 91.4633 91.4374 91.1103C90.8308 90.768 90.2226 90.4111 89.6178 90.0383C87.1067 92.1648 85.2067 94.679 84.09 97.078H94.6743ZM83.1851 99.6543C82.967 100.609 82.9109 101.478 83.0078 102.227C83.1735 103.507 83.7732 104.417 84.8388 104.943C86.1777 105.604 87.3501 105.535 88.4511 105.03C89.6167 104.495 90.7555 103.44 91.815 102.043C92.3798 101.298 92.9003 100.484 93.3719 99.6543H83.1851ZM93.1326 84.6544C94.6631 83.899 96.084 83.2779 97.3914 82.7849C97.3905 82.6455 97.3889 82.5057 97.3866 82.3656C97.3066 77.5495 96.34 72.5811 93.6673 69.2099C90.9964 65.8411 87.489 64.8055 84.7864 65.4057C82.1478 65.9918 80.0141 68.1842 80.0141 71.9585C80.0141 78.5944 84.1532 83.2744 89.4698 86.8669C90.6053 86.0441 91.8297 85.2975 93.1326 84.6544Z" fill="#1B4DFF"/>
<defs>
<filter id="filter0_dii_49_388" x="20.7156" y="30.8707" width="151.902" height="158.569" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="14.1551"/>
<feGaussianBlur stdDeviation="12.9756"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_49_388"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_49_388" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="-9.43676"/>
<feGaussianBlur stdDeviation="5.89798"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.117647 0 0 0 0 0.301961 0 0 0 0 0.988235 0 0 0 0.45 0"/>
<feBlend mode="normal" in2="shape" result="effect2_innerShadow_49_388"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="-3.53879"/>
<feGaussianBlur stdDeviation="2.35919"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="effect2_innerShadow_49_388" result="effect3_innerShadow_49_388"/>
</filter>
</defs>
</svg>`;

const state = {
  route: "home",
  routeParams: {},
  homeTab: "forms", // "forms" | "signed"
  pinEntry: "",
  activePatientId: null,
  activeFormId: null,
  strokes: [],
  drawing: false
};

// ---------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------
// Last-resort safety net: if ANY promise rejects without being caught
// anywhere in the app (a storage error we didn't anticipate, a bug),
// surface it as a toast instead of letting the tap/click that triggered
// it silently do nothing — which is exactly what "nothing happens when
// I press the button" bug reports look like from the outside.
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled error:", e.reason);
  const msg = e.reason && e.reason.message ? e.reason.message : String(e.reason || "Unknown error");
  toast("Something went wrong — " + msg);
});

async function boot() {
  await I18N.load();
  document.getElementById("pin-logo").innerHTML = PIN_APP_ICON_SVG;
  renderNumpad();
  applyTranslations();
  await applyClinicHeaderFromSettings();

  document.getElementById("forgot-pin-link").onclick = () =>
    toast("Please contact your clinic administrator to reset the PIN.");
  document.getElementById("settings-icon-btn").onclick = () => navigate("settings");
  document.getElementById("patients-icon-btn").onclick = () => navigate("patients");
  document.getElementById("success-done-btn").onclick = closeSuccessModal;
  document.getElementById("delete-confirm-cancel-btn").onclick = closeDeletePatientModal;
  document.getElementById("delete-confirm-delete-btn").onclick = confirmDeletePatient;

  // Home's Consent Forms / Signed Forms tabs: bound ONCE here via event
  // delegation on document, rather than re-binding .onclick on the tab
  // <button> elements every time renderHome() redraws them. Per-element
  // rebinding can race with a fast tap that lands right as the DOM is
  // being replaced (the old node's handler is already gone, the new
  // node's handler isn't attached yet), which reads as "the tab just
  // doesn't respond." A single delegated listener on a stable ancestor
  // has no such window — it works regardless of how many times the tab
  // buttons underneath have been torn down and recreated.
  // Walks up manually from the click target instead of using
  // Element.closest() — some older Android system WebViews (a Capacitor
  // build can end up running on whatever WebView version is installed on
  // the device, which may lag far behind desktop Chrome) don't support
  // it, which would silently break this entire listener with nothing
  // in the visible UI to explain why.
  document.addEventListener("click", (e) => {
    let el = e.target;
    while (el && el !== document.body && el !== document) {
      if (el.classList && el.classList.contains("tab") && el.parentElement && el.parentElement.classList.contains("home-tabs")) {
        // Route through navigate(), not a bare state.homeTab + renderRoute()
        // — this was the actual bug. Landing on Home via
        // navigate("home", { tab: "signed" }) (e.g. after signing a form,
        // or backing out of a signed/case-history record) leaves
        // state.routeParams = { tab: "signed" } in place permanently.
        // renderRoute() re-passes that SAME stale routeParams object to
        // renderHome() on every subsequent call, and renderHome() re-applies
        // params.tab unconditionally — so any tab switch that only set
        // state.homeTab directly got silently overwritten back to
        // "signed" a moment later. navigate() updates routeParams to
        // match the tab actually being switched to, so there's no stale
        // value left to reassert itself.
        navigate("home", { tab: el.dataset.tab });
        return;
      }
      el = el.parentElement;
    }
  });

  // No PIN has ever been set (first-time launch, or the doctor hasn't
  // opted into a PIN yet) — skip the lock screen entirely and go straight
  // into the app. The PIN screen only reappears once a PIN is set in
  // Clinic & Doctor Settings, or "Lock app now" is used.
  const settings = await DB.getSettings();
  if (!settings.pin) showApp();
}

function applyTranslations() {
  document.getElementById("pin-app-name").textContent = I18N.t("ui.appName", "ClearConsent");
  document.getElementById("forgot-pin-link").textContent = I18N.t("ui.forgotPin");
}

// Single source of truth for the clinic's display name: whatever the doctor
// has typed into Settings -> Clinic Name. Falls back to "Dr. <name>'s Dental
// Clinic" for records saved before that field existed, or if left blank.
// Used identically by the app header, the clinic-brand-row on every consent/
// intake screen, and the clinicSnapshot baked into signed records, so they
// always match.
function clinicDisplayName(s) {
  if (!s) return "";
  if (s.clinicName && s.clinicName.trim()) return s.clinicName.trim();
  if (s.doctorName && s.doctorName.trim()) return `Dr. ${s.doctorName.trim().replace(/^Dr\.?\s*/, "")}'s Dental Clinic`;
  return "ClearConsent";
}

async function applyClinicHeaderFromSettings() {
  const s = await DB.getSettings();
  document.getElementById("header-clinic-name").textContent = clinicDisplayName(s);

  // PIN screen subtitle: "Secure Consent Management" with the doctor's
  // name appended once they've added one in Settings. Recomputed fresh
  // from the base translated string each time (not appended in place) so
  // repeated calls (e.g. after saving Settings) never double-append.
  const baseTagline = I18N.t("ui.secureConsentMgmt");
  const doctorName = (s && s.doctorName || "").trim();
  document.getElementById("pin-tagline").textContent = doctorName
    ? `${baseTagline} — ${doctorName}`
    : baseTagline;
}

// ---------------------------------------------------------------------
// PIN entry (Module 1)
// ---------------------------------------------------------------------
function renderNumpad() {
  const numpad = document.getElementById("numpad");
  const keys = ["1","2","3","4","5","6","7","8","9","clear","0","back"];
  numpad.innerHTML = keys.map(k => {
    if (k === "clear") return `<div class="key" data-k="clear" style="font-size:13px;">CLEAR</div>`;
    if (k === "back") return `<div class="key" data-k="back">${ICONS.back}</div>`;
    return `<div class="key" data-k="${k}">${k}</div>`;
  }).join("");
  numpad.querySelectorAll(".key").forEach(el => {
    el.onclick = () => handlePinKey(el.dataset.k);
  });
}

async function handlePinKey(k) {
  if (k === "clear") { state.pinEntry = ""; updatePinDots(); return; }
  if (k === "back") { state.pinEntry = state.pinEntry.slice(0, -1); updatePinDots(); return; }
  if (state.pinEntry.length >= 4) return;
  state.pinEntry += k;
  updatePinDots();
  if (state.pinEntry.length === 4) {
    const settings = await DB.getSettings();
    if (state.pinEntry === settings.pin) {
      state.pinEntry = "";
      updatePinDots();
      showApp();
    } else {
      const dots = document.getElementById("pin-dots");
      dots.classList.add("shake");
      toast(I18N.t("ui.incorrectPin"));
      setTimeout(() => {
        dots.classList.remove("shake");
        state.pinEntry = "";
        updatePinDots();
      }, 400);
    }
  }
}

function updatePinDots() {
  document.querySelectorAll("#pin-dots .dot").forEach((d, i) => {
    d.classList.toggle("filled", i < state.pinEntry.length);
  });
}

function showApp() {
  document.getElementById("screen-pin").classList.remove("active");
  document.getElementById("screen-app").classList.add("active");
  navigate("home");
}

async function lockApp() {
  const settings = await DB.getSettings();
  if (!settings.pin) {
    toast("Set a PIN below first, then you can lock the app.");
    return;
  }
  document.getElementById("screen-app").classList.remove("active");
  document.getElementById("screen-pin").classList.add("active");
  state.pinEntry = "";
  updatePinDots();
}

// ---------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------
function navigate(route, params = {}) {
  state.route = route;
  state.routeParams = params;
  renderRoute();
}

function renderRoute() {
  const root = document.getElementById("screen-root");
  const renderer = ROUTES[state.route] || ROUTES.home;
  Promise.resolve(renderer(state.routeParams)).then(html => {
    root.innerHTML = html.markup;
    if (html.after) html.after();
    root.scrollTop = 0;
  });
}

// ---------------------------------------------------------------------
// Route: Home — two in-page tabs (Consent Forms / Signed Forms)
// (Modules 3 + 7)
// ---------------------------------------------------------------------
async function renderHome(params) {
  if (params && params.tab) state.homeTab = params.tab;
  const markup = `
    <div class="tabs home-tabs">
      <button class="tab ${state.homeTab==='forms'?'active':''}" data-tab="forms">${I18N.t('ui.consentForms')}</button>
      <button class="tab ${state.homeTab==='signed'?'active':''}" data-tab="signed">${I18N.t('ui.signedForms')}</button>
    </div>
    <div id="home-tab-content"></div>`;
  return {
    markup,
    after: async () => {
      // Tab click handling is bound once via delegation in boot() — see
      // the comment there. Do NOT also bind .onclick directly on these
      // buttons: a real bug was caught here where both handlers fired
      // on the same tap, kicking off two overlapping renderRoute() calls
      // that raced each other (one render's async continuation ran
      // after a second render had already replaced #screen-root out
      // from under it), leaving the tab visibly stuck / throwing errors
      // on elements that no longer existed. One binding site only.
      const slot = document.getElementById("home-tab-content");
      const rendered = state.homeTab === "forms" ? await renderFormsTab() : await renderSignedTab();
      slot.innerHTML = rendered.markup;
      if (rendered.after) rendered.after();
    }
  };
}

async function renderFormsTab() {
  const cards = [
    { id: "case_history", name: I18N.t("ui.patientCaseHistory", "Patient Case History"), icon: FORM_ICON_SET.patient, special: "intake" },
    ...CONSENT_FORMS.map(f => ({ id: f.id, name: f.name, icon: iconSquare(f.icon) }))
  ];
  const markup = `
    <div class="search-row">${ICONS.search}<input id="home-search" placeholder="${I18N.t('ui.searchForms')}"></div>
    <div class="main-scroll" style="padding-top:0;">
      <div class="form-list" id="home-list">${cards.map(formListRow).join("")}</div>
    </div>`;
  return {
    markup,
    after: () => {
      document.getElementById("home-search").oninput = (e) => {
        const q = e.target.value.toLowerCase();
        document.getElementById("home-list").innerHTML = cards.filter(c => c.name.toLowerCase().includes(q)).map(formListRow).join("");
        wireFormRows();
      };
      wireFormRows();
    }
  };
}

function formListRow(c) {
  return `<div class="list-row" data-id="${c.id}" data-special="${c.special||''}">
    <div class="avatar icon-sq-sm">${c.icon}</div>
    <div class="meta"><p class="name">${c.name}</p></div>
    ${ICONS.chevron}
  </div>`;
}

function wireFormRows() {
  document.querySelectorAll("#home-list .list-row").forEach(el => {
    el.onclick = () => navigate("select-patient", { formId: el.dataset.id, special: el.dataset.special });
  });
}

function iconSquare(iconKey) {
  return FORM_ICON_SET[iconKey] || FORM_ICON_SET.file;
}

// Financial acknowledgement clause (PRD update) — appended to every
// consent form, both translated and fallback, at render time AND baked
// into the textSnapshot saved with each signed record so historical
// records keep the exact clause text that was shown at signing time.
function withFinancialClause(content, lang) {
  return {
    ...content,
    financial: { heading: I18N.t("ui.financialAckHeading", "Financial Acknowledgement", lang), body: I18N.t("ui.financialClause", undefined, lang) }
  };
}

// ---------------------------------------------------------------------
// Route: Select / Add Patient before starting a form (Module 4 + flow)
// ---------------------------------------------------------------------
async function renderSelectPatient(params) {
  const isIntake = params.special === "intake";
  const form = CONSENT_FORMS.find(f => f.id === params.formId);
  const title = isIntake ? I18N.t("ui.patientCaseHistory", "Patient Case History") : (form ? form.name : "Consent Form");
  const patients = await DB.getAllPatients();

  const markup = `
    <div class="top-bar">
      <button class="back-btn" id="back-btn">${ICONS.back}</button>
      <h2>${title}</h2><div style="width:44px"></div>
    </div>
    <div class="main-scroll">
      <div class="content-inset">
        <div class="search-row" style="padding-left:0;padding-right:0;">${ICONS.search}<input id="sp-search" placeholder="${I18N.t('ui.searchPatients')}"></div>
        <div id="sp-list">${patients.map(p => patientRow(p)).join("") || `<div class="empty-state">No patients yet. Add one below.</div>`}</div>
        <div style="text-align:center;margin:20px 0;color:var(--neutral-400);font-weight:600;">— or —</div>
        <button class="btn-outline" id="add-new-patient-btn">${I18N.t("ui.addPatient")}</button>
        <div id="new-patient-slot"></div>
      </div>
    </div>`;

  return {
    markup,
    after: () => {
      document.getElementById("back-btn").onclick = () => navigate("home");
      document.getElementById("sp-search").oninput = async (e) => {
        const results = await DB.searchPatients(e.target.value);
        document.getElementById("sp-list").innerHTML = results.map(p => patientRow(p)).join("") || `<div class="empty-state">No matches.</div>`;
        wirePatientRows(params, isIntake, title);
      };
      document.getElementById("add-new-patient-btn").onclick = () => {
        document.getElementById("new-patient-slot").innerHTML = patientFormMarkup();
        wirePatientFormSubmit(async (patient) => {
          const saved = await DB.addPatient(patient);
          state.activePatientId = saved.id;
          goToFormDestination(params, isIntake, title, saved);
        });
      };
      wirePatientRows(params, isIntake, title);
    }
  };
}

function patientRow(p) {
  return `<div class="list-row" data-id="${p.id}">
    <div class="avatar">${initials(p.firstName, p.surname)}</div>
    <div class="meta">
      <p class="name">${p.firstName} ${p.surname}</p>
      <p class="sub">${age(p.dob)} ${p.gender ? '· ' + p.gender : ''} ${p.contact ? '· ' + p.contact : ''}</p>
    </div>
    ${ICONS.chevron}
  </div>`;
}

function wirePatientRows(params, isIntake, title) {
  document.querySelectorAll("#sp-list .list-row").forEach(el => {
    el.onclick = async () => {
      const patient = await DB.getPatient(el.dataset.id);
      state.activePatientId = patient.id;
      goToFormDestination(params, isIntake, title, patient);
    };
  });
}

function goToFormDestination(params, isIntake, title, patient) {
  if (isIntake) navigate("intake", { patientId: patient.id });
  else navigate("consent", { formId: params.formId, patientId: patient.id, title });
}

function initials(a, b) { return `${(a||'?')[0]}${(b||'')[0]||''}`.toUpperCase(); }

// India uses DD/MM/YYYY, not the browser-locale-dependent format
// toLocaleString()/toLocaleDateString() would otherwise produce (e.g.
// M/D/YYYY on an en-US system) — format explicitly everywhere a date is
// rendered as text so it's the same regardless of device locale.
function formatDate(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d)) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}
function formatDateTime(input) {
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d)) return "—";
  let h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d)}, ${h}:${min} ${ampm}`;
}
function age(dob) {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d)) return "";
  const diff = Date.now() - d.getTime();
  return "Age " + Math.floor(diff / 3.15576e10);
}

// ---------------------------------------------------------------------
// Patient add/edit form (Module 4 fields)
// ---------------------------------------------------------------------
function patientFormMarkup(patient) {
  const p = patient || {};
  return `
    <div style="margin-top:20px;background:var(--neutral-50);padding:18px;border-radius:16px;">
      <div class="field-row">
        <div class="field"><label>First Name</label><input id="f-first" value="${p.firstName||''}"></div>
        <div class="field"><label>Surname</label><input id="f-surname" value="${p.surname||''}"></div>
      </div>
      <div class="field-row">
        <div class="field"><label>Contact Number</label><input id="f-contact" type="tel" value="${p.contact||''}"></div>
        <div class="field"><label>Date of Birth</label><input id="f-dob" type="date" value="${p.dob||''}"></div>
      </div>
      <div class="field"><label>Gender</label>
        <select id="f-gender">
          <option ${p.gender==='Male'?'selected':''}>Male</option>
          <option ${p.gender==='Female'?'selected':''}>Female</option>
          <option ${p.gender==='Other'?'selected':''}>Other</option>
        </select>
      </div>
      <div class="field"><label>Address Line 1</label><input id="f-addr1" value="${p.addressLine1||''}"></div>
      <div class="field"><label>Address Line 2</label><input id="f-addr2" value="${p.addressLine2||''}"></div>
      <div class="field-row">
        <div class="field"><label>City</label><input id="f-city" value="${p.city||''}"></div>
        <div class="field"><label>State</label><input id="f-state" value="${p.state||'Goa'}"></div>
      </div>
      <div class="field"><label>Zipcode</label><input id="f-zip" value="${p.zipcode||''}"></div>
      <button class="btn-primary" id="save-patient-btn">${I18N.t('ui.proceedToConsent')}</button>
    </div>`;
}

function wirePatientFormSubmit(onSave) {
  document.getElementById("save-patient-btn").onclick = () => {
    const firstName = document.getElementById("f-first").value.trim();
    if (!firstName) { toast("Please enter a first name."); return; }
    onSave({
      firstName,
      surname: document.getElementById("f-surname").value.trim(),
      contact: document.getElementById("f-contact").value.trim(),
      dob: document.getElementById("f-dob").value,
      gender: document.getElementById("f-gender").value,
      addressLine1: document.getElementById("f-addr1").value.trim(),
      addressLine2: document.getElementById("f-addr2").value.trim(),
      city: document.getElementById("f-city").value.trim(),
      state: document.getElementById("f-state").value.trim(),
      zipcode: document.getElementById("f-zip").value.trim()
    });
  };
}

// ---------------------------------------------------------------------
// Route: All Patients Directory (Module 4, A-Z)
// ---------------------------------------------------------------------
async function renderPatients() {
  const patients = (await DB.getAllPatients()).sort((a,b) => a.searchName.localeCompare(b.searchName));

  const markup = `
    <div class="top-bar"><button class="back-btn" id="back-btn">${ICONS.back}</button><h2>${I18N.t('ui.allPatients')}</h2><div style="width:44px"></div></div>
    <div class="split-view">
      <div class="split-master">
        <div class="search-row">${ICONS.search}<input id="dir-search" placeholder="${I18N.t('ui.searchPatients')}"></div>
        <div style="padding:0 16px;">
          <button class="btn-outline" id="dir-add-patient-btn">${I18N.t("ui.addPatient")}</button>
          <div id="dir-new-patient-slot"></div>
        </div>
        <div id="dir-list" style="padding:0 16px;">
          ${patientListWithLetterHeaders(patients)}
        </div>
      </div>
      <div class="split-detail" id="patient-split-detail">
        <div class="empty-state">Select a patient to view their profile.</div>
      </div>
    </div>`;

  return {
    markup,
    after: () => {
      document.getElementById("back-btn").onclick = () => navigate("home");
      wireDirRows(patients);
      document.getElementById("dir-search").oninput = async (e) => {
        const results = (await DB.searchPatients(e.target.value)).sort((a,b) => a.searchName.localeCompare(b.searchName));
        document.getElementById("dir-list").innerHTML = patientListWithLetterHeaders(results);
        wireDirRows(results);
      };
      document.getElementById("dir-add-patient-btn").onclick = () => {
        const slot = document.getElementById("dir-new-patient-slot");
        if (slot.innerHTML) { slot.innerHTML = ""; return; } // toggle closed if already open
        slot.innerHTML = patientFormMarkup();
        wirePatientFormSubmit(async (patient) => {
          await DB.addPatient(patient);
          slot.innerHTML = "";
          await refreshPatientsDirectory();
        });
      };
    }
  };
}

// Re-renders just the search field's result list and re-wires row clicks —
// used after adding a patient from the All Patients directory so the new
// entry appears in its correct alphabetical group without a full navigate().
async function refreshPatientsDirectory() {
  const q = document.getElementById("dir-search") ? document.getElementById("dir-search").value : "";
  const results = (await DB.searchPatients(q)).sort((a,b) => a.searchName.localeCompare(b.searchName));
  document.getElementById("dir-list").innerHTML = patientListWithLetterHeaders(results);
  wireDirRows(results);
}

// Groups an already-sorted patient list into A-Z sections with a left-aligned
// letter header above each group, instead of a floating right-side index
// strip — headers scroll inline with the list, which reads more clearly than
// a separate tap-to-jump column once there are only a handful of patients.
function patientListWithLetterHeaders(patients) {
  if (!patients.length) return `<div class="empty-state">No matches.</div>`;
  let out = "";
  let lastLetter = null;
  for (const p of patients) {
    if (p.firstLetter !== lastLetter) {
      out += `<div class="az-group-label">${p.firstLetter}</div>`;
      lastLetter = p.firstLetter;
    }
    out += `<div id="row-${p.id}">${patientRow(p)}</div>`;
  }
  return out;
}

function wireDirRows(patients) {
  patients.forEach(p => {
    const el = document.getElementById("row-" + p.id);
    if (el) el.onclick = () => showPatientDetail(p.id);
  });
}

async function showPatientDetail(patientId) {
  const isDesktop = window.innerWidth >= 820;
  if (isDesktop && document.getElementById("patient-split-detail")) {
    document.getElementById("patient-split-detail").innerHTML = await patientDetailMarkup(patientId);
    wirePatientDetailActions(patientId, document.getElementById("patient-split-detail"));
  } else {
    navigate("patient-detail", { patientId });
  }
}

async function renderPatientDetail(params) {
  const markup = `
    <div class="top-bar"><button class="back-btn" id="back-btn">${ICONS.back}</button><h2>Patient Profile</h2><div style="width:44px"></div></div>
    <div class="main-scroll"><div class="content-inset" id="patient-detail-root">${await patientDetailMarkup(params.patientId)}</div></div>`;
  return {
    markup,
    after: () => {
      document.getElementById("back-btn").onclick = () => navigate("patients");
      wirePatientDetailActions(params.patientId, document.getElementById("patient-detail-root"));
    }
  };
}

async function patientDetailMarkup(patientId) {
  const p = await DB.getPatient(patientId);
  if (!p) return `<div class="empty-state">Patient not found.</div>`;
  const signed = await DB.getSignedFormsByPatient(patientId);
  return `
    <div style="text-align:center;padding:20px 0 16px;">
      <div class="avatar" style="width:64px;height:64px;font-size:22px;margin:0 auto 10px;">${initials(p.firstName,p.surname)}</div>
      <h2 style="margin:0;">${p.firstName} ${p.surname}</h2>
    </div>
    <div style="text-align:center;margin-bottom:20px;">
      <p class="text-muted" style="margin:0 0 4px;">${[age(p.dob), p.gender, p.contact].filter(Boolean).join(' · ')}</p>
      <p class="text-muted text-sm" style="margin:0;">${[p.addressLine1,p.addressLine2,p.city,p.state,p.zipcode].filter(Boolean).join(', ')}</p>
    </div>
    <div style="display:flex;gap:10px;margin-bottom:20px;">
      <button class="btn-outline" data-act="intake">${I18N.t('ui.patientCaseHistory')}</button>
      <button class="btn-primary" data-act="new-consent">New Consent Form</button>
    </div>
    <h3>${I18N.t('ui.signedForms')}</h3>
    ${signed.length ? signed.map(sf => {
      const formDef = CONSENT_FORMS.find(f => f.id === sf.formId);
      return `
      <div class="list-row" data-view="${sf.id}">
        <div class="avatar icon-sq-sm">${iconSquare(formDef ? formDef.icon : "file")}</div>
        <div class="meta"><p class="name">${sf.formName}</p><p class="sub">${formatDateTime(sf.signedAt)}</p></div>
        ${ICONS.chevron}
      </div>`;
    }).join("") : `<div class="empty-state">No signed forms yet.</div>`}
    <button class="btn-danger-text" data-act="delete-patient" style="margin-top:20px;">Delete Patient</button>
  `;
}

function wirePatientDetailActions(patientId, root) {
  const intakeBtn = root.querySelector('[data-act="intake"]');
  const consentBtn = root.querySelector('[data-act="new-consent"]');
  const deleteBtn = root.querySelector('[data-act="delete-patient"]');
  if (intakeBtn) intakeBtn.onclick = () => navigate("intake", { patientId });
  if (consentBtn) consentBtn.onclick = () => navigate("home", { tab: "forms" });
  if (deleteBtn) deleteBtn.onclick = () => openDeletePatientModal(patientId);
  root.querySelectorAll("[data-view]").forEach(el => {
    el.onclick = () => navigate("view-signed", { signedId: el.dataset.view });
  });
}

// Delete-patient confirmation (Module: Patient Management). Reuses the same
// .modal-overlay/.modal pattern and display-toggle approach as the existing
// success modal, so it matches the app's established modal styling.
let _pendingDeletePatientId = null;

function openDeletePatientModal(patientId) {
  _pendingDeletePatientId = patientId;
  document.getElementById("delete-confirm-modal").style.display = "flex";
}

function closeDeletePatientModal() {
  _pendingDeletePatientId = null;
  document.getElementById("delete-confirm-modal").style.display = "none";
}

async function confirmDeletePatient() {
  if (!_pendingDeletePatientId) return;
  await DB.deletePatient(_pendingDeletePatientId);
  closeDeletePatientModal();
  toast("Patient deleted.");
  if (document.getElementById("patient-split-detail")) {
    // Desktop split view: reset the detail pane and refresh the directory
    // list in place rather than a full navigate().
    document.getElementById("patient-split-detail").innerHTML = `<div class="empty-state">Select a patient to view their profile.</div>`;
    await refreshPatientsDirectory();
  } else {
    navigate("patients");
  }
}

// ---------------------------------------------------------------------
// Route: Clinical Intake / Patient Case History (Module 5)
// Rebuilt to match the clinic's Patient Case History Form reference:
// numbered sections 1–7 (Patient Information → Patient Details), the same
// read-first + Signature-drawer chrome as the consent screen, and the
// full clinical field set (symptoms/progression/onset, per-condition
// remarks, dental/lifestyle checkboxes, extraoral/intraoral exam findings)
// instead of the earlier free-text-only placeholders.
// ---------------------------------------------------------------------
const INTAKE_LABELS = {
  pain: "Pain", swelling: "Swelling", sensitivity: "Sensitivity", bleeding: "Bleeding", pus: "Pus",
  increasing: "Increasing", decreasing: "Decreasing", intermittent: "Intermittent",
  sudden: "Sudden", gradual: "Gradual",
  extraction: "Extraction", filling: "Filling", rct: "RCT", crown: "Crown", implant: "Implant", none: "None",
  smoking: "Smoking", tobacco: "Tobacco", alcohol: "Alcohol", nailBiting: "Nail Biting",
  vegetarian: "Vegetarian", nonVegetarian: "Non-vegetarian",
  adequate: "Adequate", inadequate: "Inadequate",
  "1x": "1x", "2x": "2x",
  soft: "Soft", med: "Med", hard: "Hard",
  normal: "Normal", abnormal: "Abnormal",
  clicking: "Clicking", pain_tmj: "Pain", restrictedMovement: "Restricted Movement",
  palpable: "Palpable", notPalpable: "Not palpable",
  good: "Good", fair: "Fair", poor: "Poor",
  healthy: "Healthy", inflamed: "Inflamed", receded: "Receded",
  present: "Present", missing: "Missing", carious: "Carious"
};
function il(key) { return INTAKE_LABELS[key] || key; }

// A group of independently-toggleable checkboxes (data-group/data-key pairs).
function checkboxGroup(group, options, selectedObj) {
  const sel = selectedObj || {};
  return options.map(key => `
    <label class="check-row"><input type="checkbox" data-group="${group}" data-key="${key}" ${sel[key] ? 'checked' : ''}><span>${il(key)}</span></label>
  `).join("");
}
// A single-select group of radio buttons sharing one `name`. Styled to
// match checkboxGroup() exactly (same .check-row class, same stacked
// top-to-bottom layout, same border/typography) so a patient can't tell
// from appearance alone whether a given field is single- or multi-select
// — only the input's own shape (circle vs square) signals that.
// role="radiogroup" + aria-label give the group an accessible name since
// there's no <fieldset>/<legend> wrapping these labels.
function radioGroup(name, options, selectedValue, groupLabel) {
  return `<div role="radiogroup" ${groupLabel ? `aria-label="${groupLabel}"` : ''}>${options.map(key => `
    <label class="check-row"><input type="radio" name="${name}" value="${key}" ${selectedValue === key ? 'checked' : ''}><span>${il(key)}</span></label>
  `).join("")}</div>`;
}
function radioValue(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : "";
}
function groupValues(group) {
  const out = {};
  document.querySelectorAll(`[data-group="${group}"]`).forEach(cb => out[cb.dataset.key] = cb.checked);
  return out;
}

async function renderIntake(params) {
  const patient = await DB.getPatient(params.patientId);
  const existing = await DB.getIntakeByPatient(params.patientId);
  const d = existing || {};

  const markup = `
    <div class="top-bar">
      <button class="back-btn" id="back-btn">${ICONS.back}</button>
      <div style="flex:1;text-align:center;">
        <h2 style="margin:0;">${I18N.t('ui.patientCaseHistory')}</h2>
        <div class="text-sm text-muted">Consent form</div>
      </div>
      <button class="icon-btn" id="share-btn" title="Share">${ICONS.share}</button>
    </div>

    <div class="main-scroll" style="background:#fff;">
      <div class="clinic-brand-row" id="clinic-brand-row"></div>

      <div class="consent-body intake-body" style="font-family:var(--font-ui);">
        <h3>1. Patient Details</h3>
        ${patientTableMarkup(patient)}

        <h3>2. Patient Information</h3>
        <div class="field-row">
          <div class="field"><label>Occupation</label><input id="i-occupation" value="${d.occupation||''}"></div>
          <div class="field"><label>Marital Status</label>
            ${radioGroup('i-marital', ['Married','Single'], d.maritalStatus, 'Marital Status')}
          </div>
        </div>
        <div class="field-row">
          <div class="field"><label>Referred By</label><input id="i-referral" value="${d.referralSource||''}"></div>
          <div class="field"><label>Date of Visit</label><input id="i-visitdate" type="date" value="${d.visitDate||new Date().toISOString().slice(0,10)}"></div>
        </div>

        <h3>3. Chief Complaint & History</h3>
        <div class="field"><label>Primary Complaint</label><textarea id="i-cc" rows="2">${d.chiefComplaint||''}</textarea></div>
        <div class="field-row field-row-3">
          <div class="field"><label>Symptoms</label>${checkboxGroup('symptoms', INTAKE_SCHEMA.symptoms, d.symptoms)}</div>
          <div class="field"><label>Progression</label>${checkboxGroup('progression', INTAKE_SCHEMA.progression, d.progression)}</div>
          <div class="field"><label>Onset</label>${checkboxGroup('onset', INTAKE_SCHEMA.onset, d.onset)}</div>
        </div>
        <div class="field"><label>Other Symptoms</label><textarea id="i-othersymptoms" rows="2" placeholder="Enter symptoms">${d.otherSymptoms||''}</textarea></div>
        <div class="field"><label>Aggravating / Relieving Factors</label><textarea id="i-aggravating" rows="2">${d.aggravatingRelievingFactors||''}</textarea></div>

        <h3>4. Medical History</h3>
        <div class="mh-grid">
          <div class="mh-col-header">Condition</div>
          <div class="mh-col-header">Remarks</div>
          ${INTAKE_SCHEMA.medicalHistory.map(key => `
            <label class="check-row" style="border-bottom:none;">
              <input type="checkbox" data-group="medicalHistory" data-key="${key}" ${(d.medicalHistory||{})[key] ? 'checked' : ''}><span>${I18N.t('medicalHistoryOptions.' + key, key)}</span>
            </label>
            <input placeholder="Remarks" id="i-mh-remark-${key}" value="${(d.medicalHistoryRemarks||{})[key]||''}">
          `).join("")}
        </div>
        <div class="field-row">
          <div class="field"><label>Current Medications</label><textarea id="i-currentmeds" rows="2" placeholder="Enter">${d.currentMedications||''}</textarea></div>
          <div class="field"><label>Past Medical</label><textarea id="i-pastmedical" rows="2" placeholder="Enter">${d.pastMedical||''}</textarea></div>
        </div>
        <div class="field"><label>Surgical History</label><textarea id="i-surgical" rows="2" placeholder="Enter symptoms">${d.surgicalHistory||''}</textarea></div>

        <h3>5. Dental & Personal History</h3>
        <div class="field"><label>Last Dental Visit</label><input id="i-lastdental" type="date" value="${d.lastDentalVisit||''}"></div>
        <div class="field-row field-row-3">
          <div class="field"><label>Previous Treatments</label>${checkboxGroup('previousTreatments', INTAKE_SCHEMA.previousTreatments, d.previousTreatments)}</div>
          <div class="field"><label>Habits</label>${checkboxGroup('habits', INTAKE_SCHEMA.habits, d.habits)}</div>
          <div class="field"><label>Diet</label>${checkboxGroup('diet', INTAKE_SCHEMA.diet, d.diet)}</div>
        </div>
        <div class="field-row field-row-3">
          <div class="field"><label>Sleep</label>${radioGroup('i-sleep', INTAKE_SCHEMA.sleep, d.sleep, 'Sleep')}</div>
          <div class="field"><label>Brushing</label>${radioGroup('i-brushing', INTAKE_SCHEMA.brushingFrequency, d.brushingFrequency, 'Brushing')}</div>
          <div class="field"><label>Brush Type</label>${radioGroup('i-brushtype', INTAKE_SCHEMA.brushType, d.brushType, 'Brush Type')}</div>
        </div>

      </div>
    </div>

    <div class="sign-cta-bar">
      <button class="btn-primary" id="open-sig-btn">${ICONS.pencil} <span id="open-sig-label">${I18N.t('ui.signatureLabel')}</span></button>
    </div>

    <div class="sig-drawer-overlay" id="sig-drawer-overlay"></div>
    <div class="sig-drawer" id="sig-drawer" role="dialog" aria-label="${I18N.t('ui.signatureLabel')}">
      <div class="sig-drawer-handle"></div>
      <div class="signature-card-head">
        <span>${I18N.t('ui.signatureLabel')}</span>
        <button class="icon-btn-sm" id="clear-sig-btn" title="${I18N.t('ui.clear')}">${ICONS.clearReset}</button>
      </div>
      <div class="sig-wrap">
        <canvas id="sig-pad"></canvas>
        <div class="sig-placeholder" id="sig-placeholder">${ICONS.pencil} ${I18N.t('ui.signHere')}</div>
      </div>
      <p class="legal-disclaimer">${I18N.t('ui.legalDisclaimer')}</p>
      <div style="display:flex;gap:12px;">
        <button class="btn-outline" id="disagree-btn" style="flex:1;">${I18N.t('ui.disagree')}</button>
        <button class="btn-primary" id="provide-consent-btn" style="flex:1;" disabled>${I18N.t('ui.iProvideConsent')}</button>
      </div>
    </div>
  `;

  return {
    markup,
    after: async () => {
      document.getElementById("back-btn").onclick = () => navigate("patient-detail", { patientId: params.patientId });
      document.getElementById("share-btn").onclick = () => toast("Share is available once the form is signed.");
      await renderClinicBrandRow();

      initSignaturePad();
      document.getElementById("clear-sig-btn").onclick = clearSignature;
      document.getElementById("disagree-btn").onclick = () => navigate("patient-detail", { patientId: params.patientId });
      document.getElementById("open-sig-btn").onclick = () => openSigDrawer();
      document.getElementById("sig-drawer-overlay").onclick = () => closeSigDrawer();
      document.getElementById("provide-consent-btn").onclick = async () => {
        if (!state.strokes.length) { toast("Please sign before saving."); return; }
        const btn = document.getElementById("provide-consent-btn");
        const record = {
          id: existing ? existing.id : undefined,
          patientId: params.patientId,
          occupation: val("i-occupation"), maritalStatus: radioValue("i-marital"),
          referralSource: val("i-referral"), visitDate: val("i-visitdate"),
          chiefComplaint: val("i-cc"),
          symptoms: groupValues("symptoms"), progression: groupValues("progression"), onset: groupValues("onset"),
          otherSymptoms: val("i-othersymptoms"), aggravatingRelievingFactors: val("i-aggravating"),
          medicalHistory: groupValues("medicalHistory"),
          medicalHistoryRemarks: Object.fromEntries(INTAKE_SCHEMA.medicalHistory.map(key => [key, val("i-mh-remark-" + key)])),
          currentMedications: val("i-currentmeds"), pastMedical: val("i-pastmedical"), surgicalHistory: val("i-surgical"),
          lastDentalVisit: val("i-lastdental"),
          previousTreatments: groupValues("previousTreatments"), habits: groupValues("habits"), diet: groupValues("diet"),
          sleep: radioValue("i-sleep"), brushingFrequency: radioValue("i-brushing"), brushType: radioValue("i-brushtype"),
          signatureImage: sigCanvas.toDataURL("image/png")
        };
        // Saving can genuinely fail (private-browsing storage restrictions,
        // full disk, a browser blocking IndexedDB) — previously an error
        // here was silently swallowed: the click did nothing and nothing
        // told the patient/dentist why. Now it's caught and surfaced.
        try {
          btn.disabled = true;
          await DB.saveIntake(record);
          // Per clinic request: land on the Signed Forms tab after saving,
          // same as every other form — not the Patient Profile page. Note
          // the Case History record itself won't appear in that list (it's
          // stored separately from signed consent forms), but the "success"
          // landing spot is now consistent across all forms.
          document.getElementById("success-title").textContent = "Case History Saved";
          document.getElementById("success-modal").style.display = "flex";
        } catch (err) {
          console.error("Failed to save Patient Case History:", err);
          toast("Could not save — " + (err && err.message ? err.message : "storage error. Try again or check browser storage settings."));
        } finally {
          btn.disabled = false;
        }
      };
    }
  };
}

function val(id) { const el = document.getElementById(id); return el ? el.value : ""; }

// ---------------------------------------------------------------------
// Route: Consent — one continuous screen (Module 6): numbered sections,
// in-form language + font controls, patient-details table, and the
// signature panel in-line at the bottom.
// ---------------------------------------------------------------------
async function renderConsent(params) {
  const form = CONSENT_FORMS.find(f => f.id === params.formId);
  const patient = await DB.getPatient(params.patientId);
  const langs = I18N.languages();
  const langOptions = Object.entries(langs).map(([code,label]) => `<option value="${code}" ${code===I18N.getLang()?'selected':''}>${label}</option>`).join("");

  const markup = `
    <div class="top-bar">
      <button class="back-btn" id="back-btn">${ICONS.back}</button>
      <div style="flex:1;text-align:center;">
        <h2 style="margin:0;">${form ? form.name : 'Consent'}</h2>
        <div class="text-sm text-muted">Consent form</div>
      </div>
      <button class="icon-btn" id="share-btn" title="Share">${ICONS.share}</button>
    </div>
    <div class="controls-row">
      <select class="lang-select-inline" id="lang-select">${langOptions}</select>
      <div class="font-ctrl"><button id="font-minus">A-</button><button id="font-plus">A+</button></div>
    </div>
    <div class="main-scroll" style="background:#fff;">
      <div class="clinic-brand-row" id="clinic-brand-row"></div>
      <div class="consent-body" id="consent-sections" style="font-size:16px;"></div>
    </div>

    <!-- Patient reads the form first; signing happens in a bottom drawer,
         opened only once they tap "Signature" (see reference flow). -->
    <div class="sign-cta-bar">
      <button class="btn-primary" id="open-sig-btn">${ICONS.pencil} <span id="open-sig-label">${I18N.t('ui.signatureLabel')}</span></button>
    </div>

    <div class="sig-drawer-overlay" id="sig-drawer-overlay"></div>
    <div class="sig-drawer" id="sig-drawer" role="dialog" aria-label="${I18N.t('ui.signatureLabel')}">
      <div class="sig-drawer-handle"></div>
      <div class="signature-card-head">
        <span>${I18N.t('ui.signatureLabel')}</span>
        <button class="icon-btn-sm" id="clear-sig-btn" title="${I18N.t('ui.clear')}">${ICONS.clearReset}</button>
      </div>
      <div class="sig-wrap">
        <canvas id="sig-pad"></canvas>
        <div class="sig-placeholder" id="sig-placeholder">${ICONS.pencil} ${I18N.t('ui.signHere')}</div>
      </div>
      <p class="legal-disclaimer">${I18N.t('ui.legalDisclaimer')}</p>
      <div style="display:flex;gap:12px;">
        <button class="btn-outline" id="disagree-btn" style="flex:1;">${I18N.t('ui.disagree')}</button>
        <button class="btn-primary" id="provide-consent-btn" style="flex:1;" disabled>${I18N.t('ui.iProvideConsent')}</button>
      </div>
    </div>
  `;

  return {
    markup,
    after: async () => {
      document.getElementById("back-btn").onclick = () => navigate("home", { tab: "forms" });
      document.getElementById("share-btn").onclick = () => toast("Share is available once the form is signed.");
      await renderClinicBrandRow();
      // Local to this screen only — deliberately NOT I18N.setLang(), which
      // would mutate the app-wide language and leak into every other
      // screen's chrome the moment the patient picks a language here.
      let screenLang = I18N.getLang();
      // Which checklist items (e.g. "Required Radiographs") are currently
      // ticked — starts with everything checked, matching the previous
      // static display, but is now a real interactive checkbox list. Kept
      // outside populateConsentSections so it survives language switches
      // (which redraw the section list from scratch) and gets baked into
      // the signed record when the form is submitted.
      const checklistSelected = new Set(form && form.checklist ? form.checklist : []);
      populateConsentSections(form, patient, screenLang, checklistSelected);

      document.getElementById("lang-select").onchange = (e) => {
        screenLang = e.target.value;
        populateConsentSections(form, patient, screenLang, checklistSelected); // does not touch the signature canvas
      };
      let fs = 16;
      document.getElementById("font-minus").onclick = () => { fs = Math.max(13, fs-2); document.getElementById("consent-sections").style.fontSize = fs+"px"; };
      document.getElementById("font-plus").onclick = () => { fs = Math.min(26, fs+2); document.getElementById("consent-sections").style.fontSize = fs+"px"; };

      initSignaturePad();
      document.getElementById("clear-sig-btn").onclick = clearSignature;
      document.getElementById("disagree-btn").onclick = () => navigate("home", { tab: "forms" });
      document.getElementById("provide-consent-btn").onclick = () => submitConsent(params, patient, form, screenLang, checklistSelected);

      // Bottom sheet: read first, tap "Signature" to slide up the sign panel.
      const overlay = document.getElementById("sig-drawer-overlay");
      const drawer = document.getElementById("sig-drawer");
      document.getElementById("open-sig-btn").onclick = () => openSigDrawer();
      overlay.onclick = () => closeSigDrawer();
    }
  };
}

function openSigDrawer() {
  document.getElementById("sig-drawer-overlay").classList.add("open");
  document.getElementById("sig-drawer").classList.add("open");
}
function closeSigDrawer() {
  document.getElementById("sig-drawer-overlay").classList.remove("open");
  document.getElementById("sig-drawer").classList.remove("open");
}

// Shows the clinic's own uploaded logo (Settings -> Upload clinic logo)
// wherever the clinic identity appears on a consent/intake form; the
// ClearConsent app icon is only ever a placeholder for clinics that haven't
// uploaded one yet — it should never appear on an actual patient-facing form
// once a real logo exists.
function clinicLogoMarkup(s) {
  if (s && s.logoDataUrl) {
    return `<img src="${s.logoDataUrl}" alt="Clinic logo" style="width:32px;height:32px;border-radius:8px;object-fit:cover;display:block;">`;
  }
  return APP_LOGO_SVG.replace('width="44" height="44"', 'width="32" height="32"');
}

async function renderClinicBrandRow() {
  const s = await DB.getSettings();
  document.getElementById("clinic-brand-row").innerHTML = `
    <div class="clinic-brand-logo">${clinicLogoMarkup(s)}</div>
    <div>
      <p class="clinic-brand-name">${clinicDisplayName(s)}</p>
      <p class="clinic-brand-addr">${s.addressLine1}, ${s.city}, ${s.state} ${s.zipcode}</p>
    </div>`;
}

// Builds the numbered section list: Purpose → (checklist, if any) →
// form-specific clauses → Acknowledgment and Consent → Financial
// Acknowledgement → Patient Details (always last).
function buildNumberedSections(form, content, patient, lang) {
  const sections = [];
  // Just the translated word "Purpose" alone, not "Purpose of <name>" — the
  // form name is an English proper-ish label (also used untranslated in
  // navigation elsewhere) and content.title (the h2 above) already states
  // the specific form's name in the selected language, so appending the
  // English name here only produced a mixed-language heading.
  sections.push({ heading: I18N.t("ui.purposeOfPrefix", "Purpose", lang), type: "text", body: content.purpose });

  if (form.checklist) {
    sections.push({ heading: form.checklistLabel || I18N.t("ui.requiredItemsHeading", "Required Items", lang), type: "checklist", items: form.checklist });
  }

  (content.sections || []).forEach(s => {
    if (form.checklist && /required/i.test(s.heading)) return; // avoid duplicating the checklist as text
    sections.push({ heading: s.heading, type: "text", body: s.body });
  });

  sections.push({ heading: I18N.t("ui.acknowledgmentAndConsent", "Acknowledgment and Consent", lang), type: "text", body: content.acknowledgment });
  if (content.financial) {
    sections.push({ heading: content.financial.heading, type: "text", body: content.financial.body, pre: true });
  }
  sections.push({ heading: I18N.t("ui.patientDetailsHeading", "Patient Details", lang), type: "table", patient, lang });
  return sections;
}

// Scripts among the app's 23 languages that read right-to-left — only
// Urdu today, written with Perso-Arabic script. The rest (including
// Kashmiri and Sindhi here) use Devanagari, so they stay left-to-right.
const RTL_LANGS = ["ur"];

// `checklistSelected` (a Set of item strings) tracks which checkboxes are
// currently ticked on the LIVE consent screen — passed in from renderConsent's
// closure so it survives a language switch (which redraws the whole section
// list) and is read back out at signing time (see submitConsent).
function populateConsentSections(form, patient, lang, checklistSelected) {
  const body = document.getElementById("consent-sections");
  if (!form) { body.innerHTML = "<p>Form not found.</p>"; return; }
  body.dir = RTL_LANGS.includes(lang) ? "rtl" : "ltr";
  const { content: rawContent } = I18N.formContent(form.id, form.fallback, lang);
  const content = withFinancialClause(rawContent, lang);
  const sections = buildNumberedSections(form, content, patient, lang);

  body.innerHTML = `
    <h2 style="margin-top:0;">${content.title}</h2>
    ${sections.map((s, i) => renderSection(s, i + 1, { interactive: true, selected: checklistSelected })).join("")}
  `;

  if (checklistSelected) {
    body.querySelectorAll(".checklist-checkbox").forEach(cb => {
      cb.onchange = () => {
        if (cb.checked) checklistSelected.add(cb.dataset.item);
        else checklistSelected.delete(cb.dataset.item);
      };
    });
  }
}

// `opts.interactive` renders real, tappable checkboxes (the live consent
// screen, defaulting to checked); otherwise renders the static checked-icon
// list used for the signed/printed record, filtered down to whichever items
// were actually left checked at signing time (`opts.selected`). Records
// signed before this feature existed have no stored selection, so they fall
// back to showing every item — matching their original (all-checked) look.
function renderSection(s, num, opts) {
  opts = opts || {};
  if (s.type === "checklist") {
    if (opts.interactive) {
      // Same .check-row look as the Symptoms/Habits/etc. checkbox groups
      // on the Patient Case History form: one item per row, stacked
      // top-to-bottom, checkbox on the left with a bottom-border divider —
      // rather than the compact checkmark-chip style used elsewhere.
      const items = s.items.map(i => `
        <label class="check-row">
          <input type="checkbox" class="checklist-checkbox" data-item="${escapeHtmlAttr(i)}" ${!opts.selected || opts.selected.has(i) ? "checked" : ""}>
          <span>${i}</span>
        </label>`).join("");
      return `<h3>${num}. ${s.heading}</h3><div class="check-list interactive">${items}</div>`;
    }
    const items = opts.selected ? s.items.filter(i => opts.selected.has(i)) : s.items;
    return `<h3>${num}. ${s.heading}</h3><ul class="check-list">${items.map(i => `<li>${i}</li>`).join("")}</ul>`;
  }
  if (s.type === "table") {
    const p = s.patient;
    return `<h3>${num}. ${s.heading}</h3>${patientTableMarkup(p, null, s.lang)}`;
  }
  return `<h3>${num}. ${s.heading}</h3><p ${s.pre ? 'style="white-space:pre-line;"' : ''}>${s.body}</p>`;
}

function escapeHtmlAttr(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

// Gender is a fixed-vocabulary field (Male/Female/Other), unlike the
// patient's actual name/address which are freeform data and stay as
// entered regardless of language — so its displayed value can and should
// translate along with the rest of the form.
function translatedGender(gender, lang) {
  if (gender === "Male") return I18N.t("ui.genderMale", "Male", lang);
  if (gender === "Female") return I18N.t("ui.genderFemale", "Female", lang);
  if (gender === "Other") return I18N.t("ui.genderOther", "Other", lang);
  return gender || "—";
}

function patientTableMarkup(p, meta, lang) {
  return `<div class="patient-table">
    <div class="pt-row">
      <div><span class="pt-label">${I18N.t("ui.ptName", "Name", lang)}</span><span class="pt-value">${p ? (p.gender==='Female' ? I18N.t("ui.honorificMrs", "Mrs.", lang) + ' ' : '') + p.firstName + ' ' + p.surname : '—'}</span></div>
      <div><span class="pt-label">${I18N.t("ui.ptGender", "Gender", lang)}</span><span class="pt-value">${p ? translatedGender(p.gender, lang) : '—'}</span></div>
      <div><span class="pt-label">${I18N.t("ui.ptDob", "Date of birth", lang)}</span><span class="pt-value">${p && p.dob ? formatDate(p.dob) : '—'}</span></div>
    </div>
    <div class="pt-row pt-row-2">
      <div><span class="pt-label">${I18N.t("ui.ptContact", "Contact number", lang)}</span><span class="pt-value">${p ? p.contact||'—' : '—'}</span></div>
      <div><span class="pt-label">${I18N.t("ui.ptAddress", "Address", lang)}</span><span class="pt-value">${p ? [p.addressLine1,p.city,p.state].filter(Boolean).join(', ')||'—' : '—'}</span></div>
    </div>
    ${meta ? `<div class="pt-row pt-row-2">
      <div><span class="pt-label">${I18N.t("ui.ptSigned", "Signed", lang)}</span><span class="pt-value">${meta.signedAt ? formatDateTime(meta.signedAt) : '—'}</span></div>
      <div><span class="pt-label">${I18N.t("ui.ptLanguage", "Language", lang)}</span><span class="pt-value">${meta.languageLabel || '—'}</span></div>
    </div>` : ''}
  </div>`;
}

// ---------------------------------------------------------------------
// Signature capture (in-line within the consent screen)
// ---------------------------------------------------------------------
let sigCanvas, sigCtx;
function initSignaturePad() {
  sigCanvas = document.getElementById("sig-pad");
  const ratio = window.devicePixelRatio || 1;
  sigCanvas.width = sigCanvas.offsetWidth * ratio;
  sigCanvas.height = sigCanvas.offsetHeight * ratio;
  sigCtx = sigCanvas.getContext("2d");
  sigCtx.scale(ratio, ratio);
  sigCtx.lineWidth = 3; sigCtx.lineCap = "round"; sigCtx.strokeStyle = "#111";
  state.strokes = [];
  updateSignatureUiState();

  const pos = (e) => {
    const r = sigCanvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };
  const start = (e) => { e.preventDefault(); state.drawing = true; state.strokes.push([pos(e)]); redrawSig(); updateSignatureUiState(); };
  const move = (e) => { if (!state.drawing) return; e.preventDefault(); state.strokes[state.strokes.length-1].push(pos(e)); redrawSig(); };
  const end = () => { state.drawing = false; };

  sigCanvas.onmousedown = start; sigCanvas.onmousemove = move; window.onmouseup = end;
  sigCanvas.ontouchstart = start; sigCanvas.ontouchmove = move; sigCanvas.ontouchend = end;
}
function redrawSig() {
  sigCtx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
  state.strokes.forEach(s => {
    if (!s.length) return;
    sigCtx.beginPath(); sigCtx.moveTo(s[0].x, s[0].y);
    s.forEach(p => sigCtx.lineTo(p.x, p.y));
    sigCtx.stroke();
  });
}
function clearSignature() { state.strokes = []; redrawSig(); updateSignatureUiState(); }
function updateSignatureUiState() {
  const hasSignature = state.strokes.length > 0;
  const placeholder = document.getElementById("sig-placeholder");
  const submitBtn = document.getElementById("provide-consent-btn");
  if (placeholder) placeholder.style.display = hasSignature ? "none" : "flex";
  if (submitBtn) submitBtn.disabled = !hasSignature;
  const ctaBar = document.getElementById("open-sig-btn");
  const ctaLabel = document.getElementById("open-sig-label");
  if (ctaBar) ctaBar.classList.toggle("is-signed", hasSignature);
  if (ctaLabel) ctaLabel.textContent = I18N.t('ui.signatureLabel') + (hasSignature ? " ✓" : "");
}

async function submitConsent(params, patient, form, lang, checklistSelected) {
  if (!state.strokes.length) { toast("Please sign before providing consent."); return; }
  const submitBtn = document.getElementById("provide-consent-btn");
  try {
    if (submitBtn) submitBtn.disabled = true;
    const signatureImage = sigCanvas.toDataURL("image/png"); // Base64/PNG raster, per PRD 3.2
    const { content: rawContent } = I18N.formContent(form.id, form.fallback, lang);
    const content = withFinancialClause(rawContent);
    const record = {
      patientId: params.patientId,
      formId: form.id,
      formName: form.name,
      language: lang,
      languageLabel: I18N.languages()[lang],
      signatureImage,
      textSnapshot: content,
      // checklistSelected: which items were actually left checked at signing
      // time (e.g. "Required Radiographs") — baked in so the signed/printed
      // record reflects what was really agreed to, not the full item list.
      formConfig: {
        checklist: form.checklist,
        checklistLabel: form.checklistLabel,
        checklistSelected: checklistSelected ? Array.from(checklistSelected) : undefined
      },
      clinicSnapshot: await DB.getSettings(),
      patientSnapshot: patient
    };
    await DB.saveSignedForm(record);
    document.getElementById("success-title").textContent = I18N.t("ui.consentSignedSuccess");
    document.getElementById("success-modal").style.display = "flex";
  } catch (err) {
    // Same reasoning as the Patient Case History save above: a storage
    // failure here previously looked like the button just did nothing.
    console.error("Failed to save signed consent form:", err);
    toast("Could not save — " + (err && err.message ? err.message : "storage error. Try again or check browser storage settings."));
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

function closeSuccessModal() {
  document.getElementById("success-modal").style.display = "none";
  // success-done-btn is a single persistent element outside #screen-root, so
  // its handler must stay generic rather than being reassigned per-screen —
  // screens that need a different landing spot (e.g. intake -> patient-detail
  // instead of home -> signed) set state.successReturnRoute beforehand.
  if (state.successReturnRoute) {
    const { route, params } = state.successReturnRoute;
    state.successReturnRoute = null;
    navigate(route, params);
  } else {
    navigate("home", { tab: "signed" });
  }
  toast(I18N.t("ui.consentSignedSuccess"));
}

// ---------------------------------------------------------------------
// Signed Forms tab (Module 7) — with Date / Type filters
// ---------------------------------------------------------------------
// Patient Case History records live in a separate object store from
// signed consent forms (see db.js), so they don't come back from
// DB.getAllSignedForms(). Fetch them separately, look up each one's
// patient (intakes only store a patientId, not a full snapshot the way
// signed consent forms do), and normalize them into the same shape the
// registry list / renderRegistryGroups already expects — `kind` tags
// which detail screen wireRegistryRows should navigate to.
async function getSignedRegistryEntries() {
  const [signedForms, intakes] = await Promise.all([DB.getAllSignedForms(), DB.getAllIntakes()]);
  const patientCache = {};
  const getPatientCached = async (id) => {
    if (!(id in patientCache)) patientCache[id] = await DB.getPatient(id);
    return patientCache[id];
  };
  const intakeEntries = await Promise.all(intakes.map(async (i) => ({
    id: i.id,
    kind: "intake",
    formName: I18N.t("ui.patientCaseHistory", "Patient Case History"),
    patientId: i.patientId,
    signedAt: i.updatedAt || i.createdAt || Date.now(),
    patientSnapshot: await getPatientCached(i.patientId)
  })));
  const signedEntries = signedForms.map(r => ({ ...r, kind: "consent" }));
  return [...signedEntries, ...intakeEntries].sort((a, b) => b.signedAt - a.signedAt);
}

async function renderSignedTab() {
  const all = await getSignedRegistryEntries();
  const typeOptions = ["All", ...new Set(all.map(r => r.formName))];
  const markup = `
    <div class="filter-row">
      <select id="filter-date" class="lang-select-inline">
        <option value="all">All dates</option>
        <option value="today">${I18N.t('ui.today')}</option>
        <option value="yesterday">${I18N.t('ui.yesterday')}</option>
        <option value="earlier">${I18N.t('ui.earlier')}</option>
      </select>
      <select id="filter-type" class="lang-select-inline">${typeOptions.map(t => `<option value="${t}">${t}</option>`).join("")}</select>
      <div class="search-row filter-search">${ICONS.search}<input id="reg-search" placeholder="${I18N.t('ui.searchPatients')}"></div>
    </div>
    <div class="main-scroll" style="padding-top:0;" id="registry-list">${renderRegistryGroups(groupByDate(all))}</div>`;
  return {
    markup,
    after: () => {
      wireRegistryRows();
      const applyFilters = async () => {
        const dateF = document.getElementById("filter-date").value;
        const typeF = document.getElementById("filter-type").value;
        const q = document.getElementById("reg-search").value.toLowerCase();
        let filtered = all.filter(f => {
          const matchesType = typeF === "All" || f.formName === typeF;
          const matchesQ = !q || (f.patientSnapshot ? (f.patientSnapshot.firstName+' '+f.patientSnapshot.surname) : '').toLowerCase().includes(q) || f.formName.toLowerCase().includes(q);
          return matchesType && matchesQ;
        });
        const groups = groupByDate(filtered);
        if (dateF !== "all") {
          Object.keys(groups).forEach(k => { if (k.toLowerCase() !== dateF) groups[k] = []; });
        }
        document.getElementById("registry-list").innerHTML = renderRegistryGroups(groups);
        wireRegistryRows();
      };
      document.getElementById("filter-date").onchange = applyFilters;
      document.getElementById("filter-type").onchange = applyFilters;
      document.getElementById("reg-search").oninput = applyFilters;
    }
  };
}

function groupByDate(records) {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  records.forEach(r => {
    const d = new Date(r.signedAt).toDateString();
    if (d === today) groups.Today.push(r);
    else if (d === yesterday) groups.Yesterday.push(r);
    else groups.Earlier.push(r);
  });
  return groups;
}

function renderRegistryGroups(groups) {
  const labels = { Today: I18N.t("ui.today"), Yesterday: I18N.t("ui.yesterday"), Earlier: I18N.t("ui.earlier") };
  const out = Object.entries(groups).map(([key, items]) => {
    if (!items.length) return "";
    return `<div class="registry-group-label">${labels[key]}</div>` + items.map(r => `
      <div class="list-row" data-view="${r.id}" data-kind="${r.kind || "consent"}">
        <div class="avatar">${r.patientSnapshot ? initials(r.patientSnapshot.firstName, r.patientSnapshot.surname) : '?'}</div>
        <div class="meta">
          <p class="name">${r.patientSnapshot ? r.patientSnapshot.firstName+' '+r.patientSnapshot.surname : 'Unknown'}</p>
          <p class="sub">${r.formName} · ${new Date(r.signedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</p>
        </div>
        ${ICONS.chevron}
      </div>`).join("");
  }).join("");
  return out || `<div class="empty-state">No signed forms yet.</div>`;
}

function wireRegistryRows() {
  document.querySelectorAll("#registry-list [data-view]").forEach(el => {
    el.onclick = () => {
      if (el.dataset.kind === "intake") navigate("view-intake", { intakeId: el.dataset.view });
      else navigate("view-signed", { signedId: el.dataset.view });
    };
  });
}

async function renderViewSigned(params) {
  const r = await DB.getSignedForm(params.signedId);
  if (!r) return { markup: `<div class="empty-state">Record not found.</div>` };
  // Records signed before checklist selection existed have no
  // checklistSelected saved — leave selected undefined so renderSection
  // falls back to showing every item, matching how they originally looked.
  const checklistSelected = r.formConfig && r.formConfig.checklistSelected
    ? new Set(r.formConfig.checklistSelected) : undefined;
  const sections = [];
  sections.push({ heading: `Purpose of ${r.formName}`, type: "text", body: r.textSnapshot.purpose });
  if (r.formConfig && r.formConfig.checklist) {
    sections.push({ heading: r.formConfig.checklistLabel || "Required Items", type: "checklist", items: r.formConfig.checklist });
  }
  (r.textSnapshot.sections || []).forEach(s => {
    if (r.formConfig && r.formConfig.checklist && /required/i.test(s.heading)) return;
    sections.push({ heading: s.heading, type: "text", body: s.body });
  });
  sections.push({ heading: "Acknowledgment and Consent", type: "text", body: r.textSnapshot.acknowledgment });
  if (r.textSnapshot.financial) sections.push({ heading: r.textSnapshot.financial.heading, type: "text", body: r.textSnapshot.financial.body, pre: true });

  const markup = `
    <div class="top-bar">
      <button class="back-btn" id="back-btn">${ICONS.back}</button>
      <div style="flex:1;text-align:center;"><h2 style="margin:0;">${r.formName}</h2><div class="text-sm text-muted">Consent form</div></div>
      <button class="icon-btn" id="share-btn" title="Share">${ICONS.share}</button>
    </div>
    <div class="main-scroll" style="background:#fff;">
      <div class="clinic-brand-row">
        <div class="clinic-brand-logo">${clinicLogoMarkup(r.clinicSnapshot)}</div>
        <div>
          <p class="clinic-brand-name">${r.clinicSnapshot ? clinicDisplayName(r.clinicSnapshot) : ''}</p>
          <p class="clinic-brand-addr">${r.clinicSnapshot ? `${r.clinicSnapshot.addressLine1}, ${r.clinicSnapshot.city}, ${r.clinicSnapshot.state} ${r.clinicSnapshot.zipcode}` : ''}</p>
        </div>
      </div>
      <div class="consent-body">
        <h2 style="margin-top:0;">${r.textSnapshot.title}</h2>
        ${sections.map((s,i) => renderSection(s, i+1, { selected: checklistSelected })).join("")}
        <h3>${sections.length+1}. Patient Details</h3>
        ${patientTableMarkup(r.patientSnapshot, { signedAt: r.signedAt, languageLabel: r.languageLabel })}
        <div style="margin-top:20px;padding:16px;border:1px solid var(--neutral-200);border-radius:14px;text-align:center;">
          <p class="text-sm text-muted" style="margin-top:0;">PATIENT SIGNATURE</p>
          <img src="${r.signatureImage}" style="max-width:100%;max-height:140px;">
        </div>
      </div>
    </div>`;
  return {
    markup,
    after: () => {
      document.getElementById("back-btn").onclick = () => navigate("home", { tab: "signed" });
      document.getElementById("share-btn").onclick = () => window.print();
    }
  };
}

// Read-only view of a saved Patient Case History, reached from the
// Signed Forms tab (see getSignedRegistryEntries/wireRegistryRows above).
// Mirrors renderIntake()'s 5 numbered sections and field order exactly,
// but as plain text instead of editable inputs.
function roField(label, value) {
  return `<div class="field"><label>${label}</label><p style="margin:6px 0 0;">${value || '—'}</p></div>`;
}
function roChecklist(obj) {
  const keys = Object.keys(obj || {}).filter(k => obj[k]);
  return keys.length ? keys.map(il).join(", ") : '—';
}

async function renderViewIntake(params) {
  const d = await DB.getIntakeById(params.intakeId);
  if (!d) return { markup: `<div class="empty-state">Record not found.</div>` };
  const patient = await DB.getPatient(d.patientId);

  const markup = `
    <div class="top-bar">
      <button class="back-btn" id="back-btn">${ICONS.back}</button>
      <div style="flex:1;text-align:center;">
        <h2 style="margin:0;">${I18N.t('ui.patientCaseHistory')}</h2>
        <div class="text-sm text-muted">Consent form</div>
      </div>
      <button class="icon-btn" id="share-btn" title="Share">${ICONS.share}</button>
    </div>
    <div class="main-scroll" style="background:#fff;">
      <div class="clinic-brand-row" id="clinic-brand-row"></div>
      <div class="consent-body intake-body" style="font-family:var(--font-ui);">
        <h3>1. Patient Details</h3>
        ${patientTableMarkup(patient)}

        <h3>2. Patient Information</h3>
        <div class="field-row">
          ${roField("Occupation", d.occupation)}
          ${roField("Marital Status", d.maritalStatus)}
        </div>
        <div class="field-row">
          ${roField("Referred By", d.referralSource)}
          ${roField("Date of Visit", d.visitDate)}
        </div>

        <h3>3. Chief Complaint & History</h3>
        ${roField("Primary Complaint", d.chiefComplaint)}
        <div class="field-row field-row-3">
          ${roField("Symptoms", roChecklist(d.symptoms))}
          ${roField("Progression", roChecklist(d.progression))}
          ${roField("Onset", roChecklist(d.onset))}
        </div>
        ${roField("Other Symptoms", d.otherSymptoms)}
        ${roField("Aggravating / Relieving Factors", d.aggravatingRelievingFactors)}

        <h3>4. Medical History</h3>
        ${roField("Conditions", roChecklist(d.medicalHistory))}
        ${roField("Current Medications", d.currentMedications)}
        ${roField("Past Medical", d.pastMedical)}
        ${roField("Surgical History", d.surgicalHistory)}

        <h3>5. Dental & Personal History</h3>
        ${roField("Last Dental Visit", d.lastDentalVisit)}
        <div class="field-row field-row-3">
          ${roField("Previous Treatments", roChecklist(d.previousTreatments))}
          ${roField("Habits", roChecklist(d.habits))}
          ${roField("Diet", roChecklist(d.diet))}
        </div>
        <div class="field-row field-row-3">
          ${roField("Sleep", d.sleep)}
          ${roField("Brushing", d.brushingFrequency)}
          ${roField("Brush Type", d.brushType)}
        </div>

        <div style="margin-top:20px;padding:16px;border:1px solid var(--neutral-200);border-radius:14px;text-align:center;">
          <p class="text-sm text-muted" style="margin-top:0;">PATIENT SIGNATURE</p>
          ${d.signatureImage ? `<img src="${d.signatureImage}" style="max-width:100%;max-height:140px;">` : '<p class="text-muted">Not signed</p>'}
        </div>
      </div>
    </div>`;
  return {
    markup,
    after: async () => {
      document.getElementById("back-btn").onclick = () => navigate("home", { tab: "signed" });
      document.getElementById("share-btn").onclick = () => window.print();
      await renderClinicBrandRow();
    }
  };
}

// ---------------------------------------------------------------------
// Route: Doctor / Clinic Settings (Module 8)
// ---------------------------------------------------------------------
async function renderSettings() {
  const s = await DB.getSettings();
  const markup = `
    <div class="top-bar"><button class="back-btn" id="back-btn">${ICONS.back}</button><h2>${I18N.t('ui.clinicSettings')}</h2><div style="width:44px"></div></div>
    <div class="main-scroll">
      <div class="content-inset">
        <div style="text-align:center;margin-bottom:24px;">
          <div id="logo-preview" style="width:96px;height:96px;border-radius:50%;background:var(--neutral-100);margin:0 auto 10px;display:flex;align-items:center;justify-content:center;border:2px dashed var(--neutral-300);overflow:hidden;">
            ${s.logoDataUrl ? `<img src="${s.logoDataUrl}" style="width:100%;height:100%;object-fit:cover;">` : `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`}
          </div>
          <label class="text-sm" style="color:var(--primary);font-weight:700;cursor:pointer;">Upload clinic logo<input type="file" id="logo-file" accept="image/*" style="display:none;"></label>
        </div>
        <div class="field"><label>Clinic Name</label><input id="s-clinicname" value="${s.clinicName || ''}" placeholder="${s.doctorName ? `Dr. ${s.doctorName.replace(/^Dr\.?\s*/,'')}'s Dental Clinic` : 'Your Clinic Name'}"></div>
        <p class="text-muted text-sm" style="margin:-12px 0 16px;">Shown in the app header and at the top of every consent form.</p>
        <div class="field"><label>Doctor Full Name</label><input id="s-name" value="${s.doctorName || ''}"></div>
        <div class="field"><label>Contact Number</label><input id="s-contact" type="tel" value="${s.contactNumber || ''}"></div>
        <div class="field"><label>Street Address</label><input id="s-addr1" value="${s.addressLine1 || ''}"></div>
        <div class="field-row">
          <div class="field"><label>City</label><input id="s-city" value="${s.city || ''}"></div>
          <div class="field"><label>State</label><input id="s-state" value="${s.state || ''}"></div>
        </div>
        <div class="field"><label>Zipcode</label><input id="s-zip" value="${s.zipcode || ''}"></div>
        <hr style="border:none;border-top:1px solid var(--neutral-100);margin:20px 0;">
        <div class="field">
          <label>${s.pin ? "Change PIN (4 digits)" : "Set PIN (4 digits)"}</label>
          <input id="s-pin" maxlength="4" inputmode="numeric" placeholder="${s.pin ? 'Leave blank to keep current PIN' : 'Leave blank to stay unlocked'}">
        </div>
        <p class="text-muted text-sm" style="margin:-12px 0 16px;">${s.pin ? "A PIN is set — the app will lock as usual." : "No PIN is set yet, so the app opens straight in. Set one here, then use “Lock app now” below."}</p>
        <button class="btn-outline" id="export-btn">Export local backup (JSON)</button>
        <button class="btn-danger-text" id="lock-app-btn" style="margin-top:8px;">Lock app now</button>
      </div>
    </div>
    <div class="sticky-bottom"><button class="btn-primary" id="save-settings-btn">${I18N.t('ui.saveChanges')}</button></div>`;

  return {
    markup,
    after: () => {
      document.getElementById("back-btn").onclick = () => navigate("home");
      document.getElementById("lock-app-btn").onclick = lockApp;
      let newLogo = s.logoDataUrl;
      document.getElementById("logo-file").onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          newLogo = reader.result;
          document.getElementById("logo-preview").innerHTML = `<img src="${newLogo}" style="width:100%;height:100%;object-fit:cover;">`;
        };
        reader.readAsDataURL(file);
      };
      document.getElementById("export-btn").onclick = async () => {
        const data = await DB.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `clearconsent-backup-${Date.now()}.json`;
        a.click();
      };
      document.getElementById("save-settings-btn").onclick = async () => {
        // PIN is optional: leaving the field blank keeps whatever PIN state
        // (set or unset) already exists rather than forcing a value every
        // time the doctor edits some other clinic detail.
        const pinInput = val("s-pin").trim();
        let pin = s.pin || null;
        if (pinInput) {
          if (!/^\d{4}$/.test(pinInput)) { toast("PIN must be exactly 4 digits."); return; }
          pin = pinInput;
        }
        await DB.saveSettings({
          clinicName: val("s-clinicname"),
          doctorName: val("s-name"), contactNumber: val("s-contact"),
          addressLine1: val("s-addr1"), city: val("s-city"), state: val("s-state"),
          zipcode: val("s-zip"), pin, logoDataUrl: newLogo
        });
        await applyClinicHeaderFromSettings();
        toast(I18N.t("ui.saveChanges") + " ✓");
        renderRoute();
      };
    }
  };
}

const ROUTES = {
  home: renderHome,
  "select-patient": renderSelectPatient,
  patients: renderPatients,
  "patient-detail": renderPatientDetail,
  intake: renderIntake,
  consent: renderConsent,
  "view-signed": renderViewSigned,
  "view-intake": renderViewIntake,
  settings: renderSettings
};

// ---------------------------------------------------------------------
// Toast helper
// ---------------------------------------------------------------------
let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.style.display = "none", 3000);
}

document.addEventListener("DOMContentLoaded", boot);
