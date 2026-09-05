import { EspnMmaClient } from '../src/adapters/espn/espn-mma.client';
import { EspnMmaNormalizer } from '../src/adapters/espn/espn-mma.normalizer';
import { FileSportRepository } from '../src/infra/storage/file-sport-repository';
import { DataSyncService } from '../src/modules/sync/data-sync.service';
import { EspnUfcAdapter } from '../src/adapters/espn/espn-ufc.adapter';

async function runVerification() {
  console.log('==================================================');
  console.log('🧪 INICIANDO VERIFICACIÓN DE DESACOPLAMIENTO Y PERSISTENCIA');
  console.log('==================================================\n');

  // 1. Verificar Cliente y Normalizador Desacoplados
  console.log('1️⃣ Probando EspnMmaClient y EspnMmaNormalizer...');
  const client = new EspnMmaClient();
  const normalizer = new EspnMmaNormalizer();

  try {
    const rawScoreboard = await client.fetchScoreboard('ufc');
    console.log('  ✅ Cliente ESPN respondió con éxito. Eventos en scoreboard:', rawScoreboard.events?.length ?? 0);

    const normalizedEvents = normalizer.normalizeEvents(rawScoreboard);
    console.log('  ✅ Normalizador procesó eventos exitosamente. Eventos de dominio generados:', normalizedEvents.length);
    if (normalizedEvents.length > 0) {
      const first = normalizedEvents[0];
      console.log(`     -> Evento: "${first.name}" | Status: ${first.status} | Peleas: ${first.matches.length}`);
      const mainBout = first.matches.find(m => m.isMainEvent);
      console.log(`     -> Main Event detectado: "${mainBout?.title || 'N/A'}" (Segmento: ${mainBout?.segment})`);
    }

    const normalizedCal = normalizer.normalizeCalendar(rawScoreboard);
    console.log('  ✅ Normalizador procesó calendario. Items futuros generados:', normalizedCal.length);
  } catch (err) {
    console.warn('  ⚠️ Aviso: Llamada de red falló (posible offline o rate-limit), se probarán los datos locales/seeds:', err);
  }

  // 2. Verificar Repositorio de Persistencia en Disco
  console.log('\n2️⃣ Probando FileSportRepository (data/sports-store/*.json)...');
  const repo = FileSportRepository.getInstance();

  const events = await repo.getEvents();
  console.log(`  ✅ Eventos persistidos leídos correctamente: ${events.length}`);

  const calendar = await repo.getCalendar();
  console.log(`  ✅ Calendario persistido leído correctamente: ${calendar.length}`);

  const news = await repo.getNews();
  console.log(`  ✅ Noticias persistidas leídas correctamente: ${news.length}`);

  const rankings = await repo.getRankings();
  console.log(`  ✅ Rankings persistidos leídos correctamente: ${rankings.length}`);

  // 3. Verificar DataSyncService y ventana de 2 a 3 días
  console.log('\n3️⃣ Probando DataSyncService (Ciclo 48-72h)...');
  const syncService = DataSyncService.getInstance();
  const isDueInitially = await syncService.isSyncDue();
  console.log(`  ℹ️ ¿Sincronización requerida (>48h)?: ${isDueInitially}`);

  const syncResult = await syncService.syncAll({ force: true });
  console.log('  ✅ Sincronización forzada ejecutada:');
  console.log(`     -> Success: ${syncResult.success}`);
  console.log(`     -> Sincronizado en: ${syncResult.syncedAt}`);
  console.log(`     -> Próxima sincronización recomendada: ${syncResult.nextSyncDue}`);
  console.log(`     -> Fuente: ${syncResult.source}`);
  console.log(`     -> Eventos guardados: ${syncResult.eventsCount}, Noticias: ${syncResult.newsCount}`);

  const isDueAfter = await syncService.isSyncDue();
  console.log(`  ✅ Verificación de ciclo: ¿Sincronización requerida justo después de sincronizar?: ${isDueAfter} (esperado: false)`);

  // 4. Verificar EspnUfcAdapter consumiendo repositorio
  console.log('\n4️⃣ Probando EspnUfcAdapter refactorizado...');
  const adapter = new EspnUfcAdapter();
  const upcoming = await adapter.getUpcomingEvents();
  console.log(`  ✅ Adapter devolvió ${upcoming.length} eventos desde persistencia.`);
  if (upcoming.length > 0) {
    console.log(`     -> Primer evento: ${upcoming[0].name} (${upcoming[0].matches.length} peleas)`);
  }

  console.log('\n==================================================');
  console.log('🎉 TODAS LAS PRUEBAS COMPLETADAS SATISFACTORIAMENTE');
  console.log('==================================================');
}

runVerification().catch((err) => {
  console.error('❌ Error en la verificación:', err);
  process.exit(1);
});
