import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TemplateFactory } from '../src/services/TemplateFactory.js';

describe('TemplateFactory', () => {
  it('macroTemplate should include stateDiagram-v2 and version header', () => {
    const result = TemplateFactory.macroTemplate('home', 'v1.0.0');
    assert.ok(result.includes('# Macro Module: home | v1.0.0'));
    assert.ok(result.includes('stateDiagram-v2'));
    assert.ok(result.includes('Initial_home'));
    assert.ok(result.includes('@spec-version v1.0.0'));
    assert.ok(result.includes('Audit History'));
  });

  it('microTemplate should include graph LR and Decision Matrix table', () => {
    const result = TemplateFactory.microTemplate('guest', 'v1.2.3');
    assert.ok(result.includes('# Specification: guest | v1.2.3'));
    assert.ok(result.includes('graph LR'));
    assert.ok(result.includes('Decision Matrix'));
    assert.ok(result.includes('Factor A?'));
    assert.ok(result.includes('Proposed Action'));
  });

  it('auditTemplate should include graph LR and AuditHistory', () => {
    const result = TemplateFactory.auditTemplate('user.go', 'v0.0.1');
    assert.ok(result.includes('# Audit: user.go | v0.0.1'));
    assert.ok(result.includes('graph LR'));
    assert.ok(result.includes('Decision Matrix'));
    assert.ok(result.includes('Condition'));
    assert.ok(result.includes('Audit History'));
  });

  it('macroTemplate should start with a newline', () => {
    const result = TemplateFactory.macroTemplate('test', 'v1.0.0');
    assert.equal(result[0], '\n');
  });

  it('microTemplate should start with a newline', () => {
    const result = TemplateFactory.microTemplate('test', 'v1.0.0');
    assert.equal(result[0], '\n');
  });

  it('auditTemplate should NOT start with a newline', () => {
    const result = TemplateFactory.auditTemplate('test', 'v1.0.0');
    assert.equal(result[0], '#');
  });
});