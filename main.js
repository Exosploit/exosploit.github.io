document.addEventListener('DOMContentLoaded', () => {
    const input = document.querySelector('.search')
    const suggestionsBox = document.querySelector('.suggestion-container')

    let autocompleteText = ''
    let suggestionLock = false // Lock flag for suggestions

    window.addEventListener('beforeunload', () => {
        const input = document.querySelector('.search')
        input.value = ''  // Clear the input field value
    })

    // Fetch visited URLs from localStorage
    function getVisitedUrls() {
        return JSON.parse(localStorage.getItem('visitedUrls')) || []
    }

    // Save visited URL to localStorage
    function saveVisitedUrl(url) {
        const visitedUrls = getVisitedUrls()
        if (!visitedUrls.includes(url)) {
            visitedUrls.push(url)
            localStorage.setItem('visitedUrls', JSON.stringify(visitedUrls))
        }
    }

    // Handle input events
    input.addEventListener('input', async (event) => {
        if (suggestionLock) return // Don't update suggestions when locked

        const query = input.value
        const trimmedQuery = query.trim()
        autocompleteText = ''

        if (!trimmedQuery) {
            suggestionsBox.innerHTML = ''
            return
        }

        // Fetch valid link suggestions from visited URLs
        const visitedUrls = getVisitedUrls()
        const historyMatches = visitedUrls.filter(item => item.toLowerCase().startsWith(trimmedQuery.toLowerCase()))

        // Fetch search suggestions from API
        const searchSuggestions = await fetchSearchSuggestions(trimmedQuery)

        // Render suggestions
        renderSuggestions(searchSuggestions, historyMatches)

        // Set autocomplete text ONLY for valid links
        if (historyMatches.length > 0) {
            const validLink = historyMatches[0]
            autocompleteText = validLink
            updateAutocomplete(query, validLink)
        }
    })

    // Handle keydown for Backspace, Enter, and ArrowRight
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            const query = autocompleteText || input.value.trim()
            performSearch(query)
        }

        if (event.key === 'ArrowRight' && autocompleteText) {
            event.preventDefault()
            input.value = autocompleteText
            suggestionsBox.innerHTML = ''
            autocompleteText = ''
        }

        if (event.key === 'Backspace') {
            suggestionLock = true // Lock suggestions temporarily
            autocompleteText = ''
            suggestionsBox.innerHTML = ''
        }
        
    })

    // Unlock suggestions after new input
    input.addEventListener('keyup', (event) => {
        if (event.key.length === 1 || event.key === 'Backspace') {
            suggestionLock = false // Unlock suggestions when typing or after Backspace
        }
    })

    // Fetch search suggestions using JSONP
    function fetchSearchSuggestions(query) {
        return new Promise((resolve) => {
            const callbackName = `jsonpCallback_${Date.now()}`
            window[callbackName] = (data) => {
                resolve(data[1]) // Suggestions array
                delete window[callbackName]
                document.body.removeChild(script)
            }

            const script = document.createElement('script')
            script.src = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&callback=${callbackName}`
            document.body.appendChild(script)
        })
    }

    // Render search and link suggestions
    function renderSuggestions(searchSuggestions, linkSuggestions) {
        const suggestionItems = [
            ...linkSuggestions.map(link => `<div class="suggestion-item" data-query="${link}">${link}</div>`),
            ...searchSuggestions.map(term => `<div class="suggestion-item" data-query="${term}">${term}</div>`)
        ]
        suggestionsBox.innerHTML = suggestionItems.join('')
    }

    // Handle clicking a suggestion
    suggestionsBox.addEventListener('click', (event) => {
        const clickedItem = event.target.closest('.suggestion-item')
        if (clickedItem) {
            const query = clickedItem.getAttribute('data-query')
            performSearch(query)
        }
    })

    // Perform search or open link, and save visited URL
    function performSearch(query) {
        const url = query.includes('.') ? `https://${query}` : `https://www.google.com/search?q=${encodeURIComponent(query)}`
        saveVisitedUrl(query) // Save visited URL before redirect
        console.log(`Navigating to: ${url}`)
        window.location.href = url
    }

    // Update autocomplete for valid links
    function updateAutocomplete(query, suggestion) {
        // Only update autocomplete if it doesn't overwrite spaces or user edits
        if (suggestion.toLowerCase().startsWith(query.toLowerCase()) && suggestion.includes('.') && !query.endsWith(' ')) {
            input.value = suggestion
            input.setSelectionRange(query.length, suggestion.length)
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault()  // Prevent default browser search behavior
            input.focus()  // Focus the search input
            const searchContainer = document.querySelector('.search-container')
            searchContainer.style.outline = '2px solid white'  // Add white border

            // Remove the border after 0.5 seconds
            setTimeout(() => {
                searchContainer.style.outline = ''
            }, 150)
        }
    })
})