// fonctions pour gérer l'interface de chat

/**
 * add the user message to the chat interface
 * @param {*} text - the text of the user message
 */
export function addUserMessage(text) {
    document.querySelector('.output').innerHTML += `
        <div class="message user">
            <strong>Vous:</strong> ${text}
        </div>`;
}

/**
 * add the agent message to the chat interface
 * @param {*} text - the text of the agent message
 */
export function addAgentMessage(text) {
    document.querySelector('.output').innerHTML += `
        <div class="message agent">
            <strong>AgentCarto:</strong> ${text}
        </div>`;
}

/**
 * show a loading message in the chat and return the element to be able to remove it later
 * @returns {HTMLElement} - the loading element
 */
export function showLoading() {
    const el = document.createElement('div');
    el.className = 'loading';
    el.innerText = 'AgentCarto réfléchit...';
    document.querySelector('.output').appendChild(el);
    return el;
}