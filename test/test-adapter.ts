import { EspnUfcAdapter } from '../src/adapters/espn/espn-ufc.adapter';

async function testAdapter() {
  console.log('--- Probando EspnUfcAdapter ---');
  const adapter = new EspnUfcAdapter();
  
  console.log('1. Obteniendo eventos próximos...');
  const events = await adapter.getUpcomingEvents();
  console.log(`Eventos encontrados: ${events.length}`);

  if (events.length > 0) {
    const nextEvent = events[0];
    console.log(`\nPróximo evento: "${nextEvent.name}" (${nextEvent.shortName})`);
    console.log(`Fecha: ${nextEvent.startDate}`);
    console.log(`Lugar: ${nextEvent.venueName}, ${nextEvent.city}, ${nextEvent.country}`);
    console.log(`Estado: ${nextEvent.status}`);
    console.log(`Cantidad de peleas (matches): ${nextEvent.matches.length}`);

    if (nextEvent.matches.length > 0) {
      console.log('\n--- Cartelera ---');
      nextEvent.matches.forEach((m, i) => {
        const red = m.participants.find(p => p.side === 'RED_CORNER');
        const blue = m.participants.find(p => p.side === 'BLUE_CORNER');
        const redGym = red?.participant.affiliations[0]?.affiliation.name || 'Independiente';
        const blueGym = blue?.participant.affiliations[0]?.affiliation.name || 'Independiente';

        const redStats = red?.participant.stats as import('../src/core/domain/types').FighterStats | undefined;
        const blueStats = blue?.participant.stats as import('../src/core/domain/types').FighterStats | undefined;

        console.log(`\n[${m.segment}] #${i + 1}: ${m.weightClass} ${m.isTitleFight ? '🏆 (TITLE FIGHT)' : ''}`);
        console.log(`  🔴 ${red?.participant.displayName} (${redStats?.wins ?? 0}-${redStats?.losses ?? 0}) [${redGym}] -> Cuota: ${red?.currentOdd?.american} (${red?.currentOdd?.decimal})`);
        console.log(`  🔵 ${blue?.participant.displayName} (${blueStats?.wins ?? 0}-${blueStats?.losses ?? 0}) [${blueGym}] -> Cuota: ${blue?.currentOdd?.american} (${blue?.currentOdd?.decimal})`);
      });
    }
  }
}

testAdapter().catch(console.error);
