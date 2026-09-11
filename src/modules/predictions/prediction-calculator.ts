import { TicketType, BoutPick } from '@/core/domain/types';

export class PredictionCalculator {
  /**
   * Calcula los puntos potenciales a otorgar según tipo y cantidad de picks
   */
  static calculatePoints(type: TicketType, picksCount: number): number {
    if (picksCount <= 0) return 0;
    if (type === 'COMBO') {
      return Math.round(10 * Math.pow(1.8, picksCount));
    }
    return 10 * picksCount;
  }

  /**
   * Determina el estado del boleto en base a sus picks
   */
  static evaluateTicketStatus(type: TicketType, picks: BoutPick[]): 'PENDING' | 'WON' | 'LOST' {
    if (!picks.length) return 'PENDING';

    if (type === 'SINGLE') {
      const pick = picks[0];
      if (pick.status === 'CORRECT') return 'WON';
      if (pick.status === 'INCORRECT') return 'LOST';
      return 'PENDING';
    }

    // COMBO / Parlay
    let hasIncorrect = false;
    let allCorrect = true;

    for (const p of picks) {
      if (p.status === 'INCORRECT') {
        hasIncorrect = true;
      }
      if (p.status !== 'CORRECT') {
        allCorrect = false;
      }
    }

    if (hasIncorrect) return 'LOST';
    if (allCorrect) return 'WON';
    return 'PENDING';
  }
}
