// Contextualized pet messages based on real stats
export function getPetMessage(pet, userHealth, dailyStats) {
  const { felicidad, salud, energia, hambre = 0, sed = 0 } = pet;
  const promedio = (felicidad + salud + energia) / 3;

  // Mensajes por hambre/sed
  if (hambre > 80) {
    return { emoji: '🍗', text: '¡Tengo mucha hambre! Necesito comer algo rico.' };
  }
  if (sed > 80) {
    return { emoji: '😤', text: 'Estoy muy sediento... ¿Dónde está mi agua?' };
  }

  // Mensajes por IMC/peso
  if (userHealth?.peso > userHealth?.pesoObjetivo * 1.1) {
    return { emoji: '😅', text: 'Nos estamos pasando de peso juntos, hagamos ejercicio!' };
  }
  if (userHealth?.peso < userHealth?.pesoObjetivo * 0.9) {
    return { emoji: '🤔', text: 'Estoy muy flaquito... ¿Me haces comer algo?' };
  }

  // Mensajes por estado emocional
  if (felicidad > 90 && salud > 85) {
    return { emoji: '🚀', text: '¡Estamos imparables! Sigamos adelante!' };
  }
  if (felicidad > 75 && salud > 70) {
    return { emoji: '😊', text: 'Me encanta este ritmo, vamos por más!' };
  }
  if (felicidad > 60 && salud > 60) {
    return { emoji: '😐', text: 'Vamos bien, pero podríamos mejorar.' };
  }

  // Mensajes por energía
  if (energia < 20) {
    return { emoji: '😴', text: 'Estoy muy cansado, necesito descansar un poco...' };
  }
  if (energia < 40) {
    return { emoji: '😔', text: 'Mi energía está baja, ¿podrías cuidarme?' };
  }

  // Mensajes motivacionales por falta de actividad
  if (dailyStats?.diasSinActividad > 2) {
    return { emoji: '📍', text: 'No hemos hecho mucho últimamente. ¿Jugamos juntos?' };
  }

  // Mensajes positivos por consistencia
  if (dailyStats?.diasConsecutivos > 7) {
    return { emoji: '🔥', text: `${dailyStats.diasConsecutivos} días de consistencia! ¡Eres increíble!` };
  }

  // Default messages por estado general
  if (promedio < 30) {
    return { emoji: '😞', text: 'Necesito tu ayuda, no me siento bien...' };
  }
  if (promedio < 50) {
    return { emoji: '🥺', text: 'Te extraño, ¿podemos pasar más tiempo juntos?' };
  }
  if (promedio < 70) {
    return { emoji: '😊', text: 'Vamos bien, un poco de ejercicio nos vendría bien.' };
  }

  // Random positive messages
  const positiveMsgs = [
    { emoji: '💪', text: 'Creo en ti, podemos lograr tu objetivo!' },
    { emoji: '⭐', text: 'Cada día somos más fuertes juntos.' },
    { emoji: '🎯', text: 'Tu dedicación me inspira.' },
    { emoji: '✨', text: 'Esta es nuestra versión mejorada.' }
  ];

  return positiveMsgs[Math.floor(Math.random() * positiveMsgs.length)];
}

export function getInteractionMessage(type) {
  const messages = {
    pet: [
      '¡Jiji, eso cosquillas! 😄',
      'Me encanta tu cariño ❤️',
      'Esto me hace feliz 😊'
    ],
    play: [
      '¡Yeeeeh! ¡Esto es divertido! 🎉',
      'Más, más! ¡Sigue jugando! 🎮',
      '¡Somos invencibles! 💪'
    ],
    eat: [
      '¡Mmmm, delicioso! 😋',
      'Mi barriguita está contenta 🍽️',
      '¡Energía renovada! ⚡'
    ],
    drink: [
      '¡Ahhhh, qué refresco! 💧',
      'Mucho mejor, gracias! 😌',
      '¡Me encantan los líquidos! 🥤'
    ]
  };

  const msgs = messages[type] || messages.pet;
  return msgs[Math.floor(Math.random() * msgs.length)];
}
