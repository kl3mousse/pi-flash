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
    },
    es: {
      start: "Iniciar desafío",
      startShort: "Empezar",
      lives: "Vidas",
      gameOver: "Fin del juego",
      retry: "Reintentar",
      milestone10: "🎉 10 dígitos!",
      milestone20: "🥈 20 dígitos!",
      milestone30: "🥇 30 dígitos!",
      score: "Puntuación",
      best: "Mejor",
    },
    pl: {
      start: "Rozpocznij wyzwanie",
      startShort: "Start",
      lives: "Życia",
      gameOver: "Koniec gry",
      retry: "Jeszcze raz",
      milestone10: "🎉 10 cyfr!",
      milestone20: "🥈 20 cyfr!",
      milestone30: "🥇 30 cyfr!",
      score: "Wynik",
      best: "Rekord",
    },
    no: {
      start: "Start utfordring",
      startShort: "Start",
      lives: "Liv",
      gameOver: "Spill over",
      retry: "Prøv igjen",
      milestone10: "🎉 10 sifre!",
      milestone20: "🥈 20 sifre!",
      milestone30: "🥇 30 sifre!",
      score: "Poeng",
      best: "Rekord",
    },
    pt: {
      start: "Iniciar desafio",
      startShort: "Iniciar",
      lives: "Vidas",
      gameOver: "Fim de jogo",
      retry: "Tentar novamente",
      milestone10: "🎉 10 dígitos!",
      milestone20: "🥈 20 dígitos!",
      milestone30: "🥇 30 dígitos!",
      score: "Pontuação",
      best: "Recorde",
    }
  };

  let userLang = (navigator.language || 'en').slice(0,2);
  if(!i18n[userLang]) userLang = 'en';

  function t(key){
    return i18n[userLang][key] || i18n.en[key] || key;
  }

  // Expose both __i18n and a global T() alias expected by main.js
  window.__i18n = { dict: i18n, lang: userLang, t };
  if(!window.T) {
    window.T = t; // backward compatibility / convenience
  }
})();
