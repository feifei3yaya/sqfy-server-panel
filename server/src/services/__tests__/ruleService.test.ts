import { describe, expect, test, jest, beforeEach } from '@jest/globals';
import { ParsedLog } from '../../utils/logParser';
import rconService from '../rconService';

// Mock rconService
jest.mock('../rconService', () => ({
  execute: jest.fn(),
}));

// We need to import ruleService after mocking
// But since ruleService is a singleton instance exported as default,
// we might need to reset its state or mock its dependencies differently.
// For simplicity, we'll test the logic by instantiating the class if it was exported,
// but it's not. We'll rely on the singleton and clear its internal state if possible.
// Actually, let's just test the public `handleEvent` method.

import ruleService from '../ruleService';

describe('RuleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // We can't easily reset private state of the singleton without extra methods.
    // Ideally RuleService should be refactored to be testable (export class).
    // For now, we assume clean state or simple tests.
  });

  test('should trigger ChatFilter rule', async () => {
    const mockEvent: ParsedLog = {
      type: 'CHAT',
      timestamp: new Date(),
      raw: 'raw log',
      payload: {
        senderName: 'BadPlayer',
        steamId: '123456789',
        message: 'This is a badword message'
      }
    };

    await ruleService.handleEvent(mockEvent, 'server1');

    expect(rconService.execute).toHaveBeenCalledTimes(2);
    expect(rconService.execute).toHaveBeenCalledWith('server1', expect.stringContaining('AdminKick "123456789"'));
  });

  test('should ignore clean chat', async () => {
    const mockEvent: ParsedLog = {
      type: 'CHAT',
      timestamp: new Date(),
      raw: 'raw log',
      payload: {
        senderName: 'GoodPlayer',
        steamId: '987654321',
        message: 'Hello world'
      }
    };

    await ruleService.handleEvent(mockEvent, 'server1');

    expect(rconService.execute).not.toHaveBeenCalled();
  });

  // TeamKill test is harder because it relies on player cache.
  // We need to populate the cache first.
  test('should detect TeamKill', async () => {
    // Populate cache
    ruleService.updatePlayerCache('server1', [
      { steamId: 'attacker1', teamId: '1' },
      { steamId: 'victim1', teamId: '1' }
    ]);

    const tkEvent: ParsedLog = {
      type: 'KILL',
      timestamp: new Date(),
      raw: 'kill log',
      payload: {
        attackerName: 'Attacker',
        attackerSteamId: 'attacker1',
        victimName: 'Victim',
        victimSteamId: 'victim1',
        weapon: 'M4'
      }
    };

    // 1st TK -> Warn
    await ruleService.handleEvent(tkEvent, 'server1');
    expect(rconService.execute).toHaveBeenCalledWith('server1', expect.stringContaining('AdminWarn'));

    // 2nd TK -> Kick
    await ruleService.handleEvent(tkEvent, 'server1');
    expect(rconService.execute).toHaveBeenCalledWith('server1', expect.stringContaining('AdminKick'));
  });
});
