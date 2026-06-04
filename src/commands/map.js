/**
 * @file Handler for the `md map` command.
 *
 * The command walks the project tree, collects every co-located `.spec.md`
 * file and prints an architecture map to the terminal. The actual scanning
 * logic lives in `MapService`; this module is a thin adapter that injects
 * the service dependency (matching the pattern used by `init.js`).
 */

import { MapService } from '../services/MapService.js';

/**
 * Executes the `md map` command.
 *
 * @param {import('../services/MapService.js').MapService} [mapService] -
 *   Optional service instance. When omitted a fresh `MapService` is
 *   constructed — this keeps the function trivially callable from
 *   `bin/cli.js` and unit-testable in isolation.
 * @returns {Promise<void>}
 */
export async function execute(mapService) {
  const service = mapService || new MapService();
  await service.generateArchitectureMap();
}
