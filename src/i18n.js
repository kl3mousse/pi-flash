// Simple i18n dictionary and helpers
(function(){
  const i18n = {
    en: {
      start: "Start Challenge",
      startShort: "Start",
      lives: "Lives",
      gameOver: "Game Over",
      retry: "Retry",
      milestone10: "🎉 10 digits!",
      milestone20: "🥈 20 digits!",
      milestone30: "🥇 30 digits!",
      score: "Score",
      best: "Best",
    },
    fr: {
      start: "Commencer le défi",
      startShort: "Commencer",
      lives: "Vies",
      gameOver: "Partie terminée",
      retry: "Rejouer",
      milestone10: "🎉 10 chiffres !",
      milestone20: "🥈 20 chiffres !",
      milestone30: "🥇 30 chiffres !",
      score: "Score",
      best: "Record",
    },
    de: {
      start: "Herausforderung starten",
      startShort: "Start",
      lives: "Leben",
      gameOver: "Spiel vorbei",
      retry: "Nochmal",
      milestone10: "🎉 10 Stellen!",
      milestone20: "🥈 20 Stellen!",
      milestone30: "🥇 30 Stellen!",
      score: "Punkte",
      best: "Rekord",
    }
  };

  let userLang = (navigator.language || 'en').slice(0,2);
  if(!i18n[userLang]) userLang = 'en';

  function t(key){
    return i18n[userLang][key] || i18n.en[key] || key;
  }

  window.__i18n = { dict: i18n, lang: userLang, t };
})();
