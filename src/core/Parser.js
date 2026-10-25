export class SourceParser {
    constructor(text) {
        this.text = text;
        this.results = [];
        this.currentIndex = 0;
    }

    parse() {
        while (this.currentIndex < this.text.length) {
            const startRegex = /\b([a-zA-Z0-9_]+)\s*=\s*{/g;
            startRegex.lastIndex = this.currentIndex;
            const match = startRegex.exec(this.text);
            if (!match) break;

            const blockName = match[1];
            let braceLevel = 1;
            let blockBodyStartIndex = match.index + match[0].length;
            let currentBodyIndex = blockBodyStartIndex;

            while (braceLevel > 0 && currentBodyIndex < this.text.length) {
                if (this.text[currentBodyIndex] === '{') braceLevel++;
                else if (this.text[currentBodyIndex] === '}') braceLevel--;
                currentBodyIndex++;
            }

            if (braceLevel !== 0) throw new Error(`Closing parenthesis not found for block '${blockName}'.`);

            let body = this.text.substring(blockBodyStartIndex, currentBodyIndex - 1);
            body = this.cleanBody(body);

            try {
                this.results.push({ name: blockName, obj: JSON.parse(`{${body}}`) });
            } catch (e) {
                console.error(`Block parsing error '${blockName}':`, `{${body}}`);
                throw new Error(`Syntax error in block '${blockName}': ${e.message}`);
            }
            this.currentIndex = currentBodyIndex;
        }
        if (this.results.length === 0) {
            throw new Error("No valid 'NAME' block found = { ... }'.");
        }
        return this.results;
    }

    cleanBody(body) {
        return body
            .replace(/--.*/g, '')
            .replace(/sslModule\s*=\s*".*?"/g, '')
            .replace(/\b([a-zA-Z_]\w*)\b\s*=\s*/g, '"$1": ')
            .replace(/\bTrue\b/g, 'true')
            .replace(/\bFalse\b/g, 'false')
            .replace(/\s*\{\s*"__value"\s*:\s*(-?\d+(?:\.\d+)?)\s*\}/g, '$1')
            .replace(/:\s*\{\s*\}/g, ': {}')
            .replace(/(}|\s*\]|"|true|false|\d)\s*\r?\n\s*"/g, '$1,\n"')
            .replace(/,\s*([}\]])/g, '$1')
            .replace(/(})\s*\r?\n\s*"/g, '$1,\n"');
    }
}