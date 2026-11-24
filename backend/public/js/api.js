/**
 * SlotWise Backend Test Pages - API Helper
 * Base URL: http://localhost:3000/api/v1
 */

const API_BASE = 'http://localhost:3000/api/v1';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/auth/register')
 * @param {Object} options - fetch options
 * @returns {Promise<{ok: boolean, status: number, data: any}>}
 */
async function apiRequest(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

    const config = {
        credentials: 'include', // Important: send cookies for auth
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Don't set Content-Type for FormData
    if (config.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    try {
        const response = await fetch(url, config);
        let data = null;

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        return {
            ok: response.ok,
            status: response.status,
            data,
        };
    } catch (err) {
        return {
            ok: false,
            status: 0,
            data: { message: err.message || 'Network error' },
        };
    }
}

/**
 * Display response in a response box
 * @param {string} containerId - ID of the container element
 * @param {Object} result - Result from apiRequest
 */
function displayResponse(containerId, result) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const statusClass = result.ok ? 'success' : result.status >= 400 ? 'error' : 'info';
    const statusText = result.ok ? 'SUCCESS' : `ERROR (${result.status})`;

    const content = typeof result.data === 'string'
        ? result.data
        : JSON.stringify(result.data, null, 2);

    container.innerHTML = `
        <div class="endpoint method-${getMethodClass(result)}">Status: ${result.status} - ${statusText}</div>
        <div class="response-box ${statusClass}">
            <pre>${escapeHtml(content)}</pre>
        </div>
    `;
    container.classList.remove('hidden');
}

function getMethodClass(result) {
    // Default to get styling, caller can override
    return 'get';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Show an alert message
 * @param {string} containerId - ID of container
 * @param {string} message - Message text
 * @param {string} type - 'success' or 'error'
 */
function showAlert(containerId, message, type = 'error') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="alert alert-${type}">${escapeHtml(message)}</div>
    `;
    container.classList.remove('hidden');
}

/**
 * Clear alert
 * @param {string} containerId
 */
function clearAlert(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
        container.classList.add('hidden');
    }
}

/**
 * Check authentication status
 */
async function checkAuth() {
    const result = await apiRequest('/auth/me-check');
    // This endpoint doesn't exist, but we can check by trying to access a protected route
    // For now, we'll rely on UI state
    return false;
}

/**
 * Format date for input
 */
function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

// Export for use in other scripts
window.apiRequest = apiRequest;
window.displayResponse = displayResponse;
window.showAlert = showAlert;
window.clearAlert = clearAlert;
window.formatDateForInput = formatDateForInput;