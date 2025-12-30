#!/usr/bin/env node
/**
 * AUTO-TEST GENERATOR v3.0
 * Analyzes function/component code and generates comprehensive tests
 */

const fs = require('fs');
const path = require('path');

class AutoTestGenerator {
    constructor(sourceCode, sourceFile) {
        this.sourceCode = sourceCode;
        this.sourceFile = sourceFile;
        this.functionName = this.extractFunctionName();
        this.parameters = this.extractParameters();
        this.zodSchema = this.extractZodSchema();
        this.returnType = this.extractReturnType();
    }

    extractFunctionName() {
        const match = this.sourceCode.match(/(?:export\s+)?(?:async\s+)?function\s+(\w+)/);
        return match ? match[1] : 'unknownFunction';
    }

    extractParameters() {
        const match = this.sourceCode.match(/function\s+\w+\s*\(([^)]*)\)/);
        if (!match) return [];

        return match[1].split(',').map(param => {
            const [name, type] = param.trim().split(':');
            return { name: name?.trim(), type: type?.trim() || 'any' };
        }).filter(p => p.name);
    }

    extractZodSchema() {
        const schemaMatch = this.sourceCode.match(/const\s+(\w+Schema)\s*=\s*z\.object\({([^}]+)}\)/);
        if (!schemaMatch) return null;

        return {
            name: schemaMatch[1],
            fields: this.parseZodFields(schemaMatch[2])
        };
    }

    parseZodFields(fieldsStr) {
        const fields = {};
        const lines = fieldsStr.split(',');
        lines.forEach(line => {
            const match = line.match(/(\w+):\s*z\.(\w+)\(\)/);
            if (match) {
                fields[match[1]] = match[2];
            }
        });
        return fields;
    }

    extractReturnType() {
        const match = this.sourceCode.match(/:\s*([^{]+)\s*{/);
        return match ? match[1].trim() : 'void';
    }

    generateTests() {
        const tests = [];

        // 1. Happy Path Test
        tests.push(this.generateHappyPathTest());

        // 2. Error Tests (based on Zod schema)
        if (this.zodSchema) {
            tests.push(...this.generateZodErrorTests());
        }

        // 3. Edge Cases
        tests.push(...this.generateEdgeCaseTests());

        // 4. Type Safety Tests
        tests.push(this.generateTypeSafetyTest());

        return this.wrapInDescribeBlock(tests);
    }

    generateHappyPathTest() {
        const params = this.parameters.map(p => this.getMockValue(p.type)).join(', ');

        return `
  it('${this.functionName}: returns expected result with valid inputs', () => {
    const result = ${this.functionName}(${params})
    expect(result).toBeDefined()
    ${this.returnType !== 'void' ? `expect(typeof result).toBe('${this.getJSType(this.returnType)}')` : ''}
  })`;
    }

    generateZodErrorTests() {
        if (!this.zodSchema) return [];

        const tests = [];
        Object.keys(this.zodSchema.fields).forEach(field => {
            tests.push(`
  it('throws error when ${field} is invalid', () => {
    expect(() => ${this.functionName}({ ${field}: 'invalid' })).toThrow()
  })`);
        });

        return tests;
    }

    generateEdgeCaseTests() {
        const tests = [];

        // Null/undefined tests
        if (this.parameters.length > 0) {
            tests.push(`
  it('handles null input gracefully', () => {
    expect(() => ${this.functionName}(null)).not.toThrow()
  })`);

            tests.push(`
  it('handles undefined input gracefully', () => {
    expect(() => ${this.functionName}(undefined)).not.toThrow()
  })`);
        }

        // Empty string/array tests
        const hasStringParam = this.parameters.some(p => p.type.includes('string'));
        if (hasStringParam) {
            tests.push(`
  it('handles empty string', () => {
    expect(() => ${this.functionName}('')).not.toThrow()
  })`);
        }

        return tests;
    }

    generateTypeSafetyTest() {
        return `
  it('maintains type safety', () => {
    const result = ${this.functionName}(${this.parameters.map(p => this.getMockValue(p.type)).join(', ')})
    // TypeScript compile-time check (no runtime assertion needed)
    expectTypeOf(result).toMatchTypeOf<${this.returnType}>()
  })`;
    }

    getMockValue(type) {
        const mocks = {
            'string': '"test string"',
            'number': '42',
            'boolean': 'true',
            'Date': 'new Date()',
            'object': '{}',
            'array': '[]',
            'unknown': '"mock data"'
        };

        for (const [key, value] of Object.entries(mocks)) {
            if (type.toLowerCase().includes(key)) return value;
        }

        return '{}';
    }

    getJSType(tsType) {
        if (tsType.includes('string')) return 'string';
        if (tsType.includes('number')) return 'number';
        if (tsType.includes('boolean')) return 'boolean';
        return 'object';
    }

    wrapInDescribeBlock(tests) {
        return `
import { describe, it, expect } from 'vitest'
import { expectTypeOf } from 'vitest'
import { ${this.functionName} } from '${this.getImportPath()}'

describe('${this.functionName}', () => {
${tests.join('\n')}
})

// AUTO-GENERATED by OMEGA v3.0 Auto-Test Generator
// Coverage target: 85%+
// Review and enhance as needed
`;
    }

    getImportPath() {
        // Convert /lib/utils/formatCurrency.ts to @/lib/utils/formatCurrency
        return '@' + this.sourceFile.replace(/^\./, '').replace(/\.tsx?$/, '');
    }

    saveTest() {
        const testPath = this.sourceFile.replace(/^(.+)\/([^/]+)\.tsx?$/, '$1/../tests/$1/$2.test.ts');
        const testDir = path.dirname(testPath);

        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }

        fs.writeFileSync(testPath, this.generateTests());
        console.log(`✅ Test generated: ${testPath}`);

        return testPath;
    }
}

// CLI usage
if (require.main === module) {
    const [, , sourceFile] = process.argv;

    if (!sourceFile) {
        console.error('Usage: node auto-test-generator.js <source-file>');
        process.exit(1);
    }

    const sourceCode = fs.readFileSync(sourceFile, 'utf-8');
    const generator = new AutoTestGenerator(sourceCode, sourceFile);
    generator.saveTest();
}

module.exports = AutoTestGenerator;
