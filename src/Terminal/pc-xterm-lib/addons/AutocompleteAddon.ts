import Completer from 'readline';

import NrfTerminalAddon from '../NrfTerminalAddon';
import NrfTerminalCommander from '../NrfTerminalCommander';

const HIGHLIGHTED_CLASS = 'autocomplete__suggestion--highlighted';

export default class AutocompleteAddon extends NrfTerminalAddon {
    name = 'AutocompleteAddon';
    completer: Completer;

    #isVisible = false;
    #suggestions: number[] = [];
    #root?: HTMLDivElement;
    #container?: HTMLUListElement;
    #highlightedIndex = 0;
    #prevOutput = '';
    #hasCancelled = false;

    constructor(commander: NrfTerminalCommander, completions: Completion[]) {
        super(commander);
        this.completer = completer;
    }

    public get isVisible() {
        return this.#isVisible;
    }

    public disable() {
        this.#hasCancelled = true;
    }

    public enable() {
        this.#hasCancelled = false;
    }

    protected onActivate() {
        this.commander.registerOutputListener(output => {
            if (!this.#container) {
                this.initialiseContainer();
            }

            if (!this.#hasCancelled) {
                this.patchSuggestionBox(output);
                this.repositionX(output);
                this.repositionY();
            }
        });

        this.terminal.onKey(({ domEvent }) => {
            switch (domEvent.code) {
                case 'ArrowUp':
                    return this.navigateUp();
                case 'ArrowDown':
                    return this.navigateDown();
                case 'Escape':
                    this.#hasCancelled = true;
                    return this.clearSuggestions();
                case 'Enter':
                    if (this.isVisible) {
                        return this.selectSuggestion(this.#highlightedIndex);
                    }
                    return;
                // Swallow backspace keys so they don't revert the cancel.
                // This way the dialog will only appear again on a real keypress.
                case 'Backspace':
                    return;
            }

            this.#hasCancelled = false;
        });
    }

    private initialiseContainer(): void {
        if (!this.terminal.element) {
            this.debug('Terminal must be fully loaded');
            return;
        }

        const autocompleteRoot = document.createElement('div');
        autocompleteRoot.className = 'autocomplete';
        this.#root = autocompleteRoot;

        const suggestionsContainer = document.createElement('ul');
        suggestionsContainer.className = 'autocomplete__suggestions';
        autocompleteRoot.appendChild(suggestionsContainer);

        this.terminal.element.appendChild(autocompleteRoot);
        this.#container = suggestionsContainer;
    }

    private navigateUp(): void {
        // If we're already on the first item, loop back to the last.
        if (this.#highlightedIndex === 0) {
            this.highlightSuggestion(this.#suggestions.length - 1);
        } else {
            this.highlightSuggestion(this.#highlightedIndex - 1);
        }
    }

    private navigateDown(): void {
        // If we're already on the last item, loop back to the start.
        if (this.#highlightedIndex === this.#suggestions.length - 1) {
            this.highlightSuggestion(0);
        } else {
            this.highlightSuggestion(this.#highlightedIndex + 1);
        }
    }

    private selectSuggestion(id: number): void {
        const value = this.completions[id];
        // Write out the portion of the value that hasn't already been typed.
        const completed = value.slice(this.commander.output.length);
        this.terminal.write(completed);
        this.clearSuggestions();
    }

    private patchSuggestionBox(output: string): void {
        if (!output.length) {
            this.clearSuggestions();
            return;
        }
        for (let i = 0; i < this.completions.length; i += 1) {
            const completion = this.completions[i];
            const isMatch = completion.startsWith(output);
            const alreadyShowing = this.#suggestions.includes(i);

            if (isMatch && alreadyShowing) {
                if (output.length < this.#prevOutput.length) {
                    this.shrinkMatch(i);
                } else {
                    this.growMatch(i);
                }
            } else if (isMatch && !alreadyShowing) {
                this.addSuggestion(i, output);
            } else if (!isMatch && alreadyShowing) {
                this.removeSuggestion(i);
            }
        }

        this.#prevOutput = output;
    }

    private addSuggestion(id: number, output: string): void {
        const suggestionValue = this.completions[id];

        const matchedSpan = document.createElement('span');
        matchedSpan.textContent = output;
        matchedSpan.className = 'font-weight-bolder';
        matchedSpan.dataset.type = 'matched';

        const unmatchedSpan = document.createElement('span');
        const regex = new RegExp(`^${output}`, 'gm');
        const unmatchedFragment = suggestionValue.split(regex)[1];
        unmatchedSpan.textContent = unmatchedFragment;
        unmatchedSpan.dataset.type = 'unmatched';

        const suggestionLi = document.createElement('li');
        suggestionLi.classList.add('autocomplete__suggestion');
        suggestionLi.appendChild(matchedSpan);
        suggestionLi.appendChild(unmatchedSpan);
        suggestionLi.dataset.suggestionId = id.toString();

        if (this.#highlightedIndex === id) {
            suggestionLi.classList.add(HIGHLIGHTED_CLASS);
        }

        this.#container?.appendChild(suggestionLi);
        this.#suggestions.push(id);
        this.#isVisible = true;
    }

    private removeSuggestion(id: number): void {
        const suggestion = this.getSuggestionElement(id);
        this.#container?.removeChild(suggestion);
        this.#suggestions = this.#suggestions.filter(i => i !== id);
    }

    private growMatch(id: number): void {
        const suggestion = this.getSuggestionElement(id);
        const [matched, unmatched] = suggestion.querySelectorAll('span');
        matched.textContent += (unmatched.textContent as string)[0];
        unmatched.textContent = (unmatched.textContent as string).slice(1);
    }

    private shrinkMatch(id: number): void {
        const suggestion = this.getSuggestionElement(id);
        const [matched, unmatched] = suggestion.querySelectorAll('span');
        const lastCharacter = (matched.textContent as string).slice(-1);
        matched.textContent = (matched.textContent as string).slice(0, -1);
        unmatched.textContent = lastCharacter + unmatched.textContent;
    }

    private highlightSuggestion(id: number) {
        const prev = this.getSuggestionElement(this.#highlightedIndex);
        prev.classList.remove(HIGHLIGHTED_CLASS);
        const current = this.getSuggestionElement(id);
        current.classList.add(HIGHLIGHTED_CLASS);
        this.#highlightedIndex = id;
    }

    private clearSuggestions(): void {
        if (!this.#container) return;
        this.#container.innerHTML = '';
        this.#suggestions = [];
        this.#isVisible = false;
        this.#highlightedIndex = 0;
    }

    private getSuggestionElement(id: number): HTMLLIElement {
        const suggestionLi = this.#container?.querySelector(
            `[data-suggestion-id="${id}"]`
        );

        if (!suggestionLi) {
            throw new Error(`No suggestion element with index ${id} found`);
        }

        return suggestionLi as HTMLLIElement;
    }

    private repositionX(output: string): void {
        const left = output.length * 3.5 + 80 + (5 * output.length - 1) - 3.5;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#root!.style.left = `${left}px`;
    }

    private repositionY(): void {
        const top =
            this.terminal.buffer.active.cursorY *
                // eslint-disable-next-line no-underscore-dangle
                this.terminal._core._charSizeService.height +
            4;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.#root!.style.top = `${top}px`;
    }
}
